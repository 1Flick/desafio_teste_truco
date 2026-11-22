const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

const MATCHERS = { texto: 'toHaveTextContent', atributo: 'toHaveAttribute', quantidade: 'toHaveLength', visivel: 'toBeVisible', habilitado: 'toBeEnabled', desabilitado: 'toBeDisabled', presente: 'toBeInTheDocument' };
const parse = text => parser.parse(text, { sourceType: 'module' });
const OMIT = new Set(['start', 'end', 'loc', 'extra', 'leadingComments', 'innerComments', 'trailingComments', 'comments', 'tokens', 'errors']);
function limpar(value) {
  if (Array.isArray(value)) return value.map(limpar);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).filter(([key, child]) => !OMIT.has(key) && !(key === 'optional' && child == null)).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, limpar(child)]));
}
const hash = value => crypto.createHash('sha256').update(JSON.stringify(limpar(value))).digest('hex');
const clicarNova = user => t.expressionStatement(t.awaitExpression(t.callExpression(
  t.memberExpression(t.identifier(user), t.identifier('click')),
  [t.callExpression(t.memberExpression(t.identifier('screen'), t.identifier('getByTestId')), [t.stringLiteral('btn-nova-partida')])],
)));

function expandir(ast) {
  traverse(ast, {
    CallExpression: {
      exit(p) {
        const callee = p.node.callee;
        if (!t.isMemberExpression(callee) || callee.computed) return;
        let negativo = false;
        let alvo = callee.object;
        if (t.isMemberExpression(alvo) && t.isIdentifier(alvo.object, { name: 'conferir' }) && t.isIdentifier(alvo.property, { name: 'nao' })) {
          negativo = true;
          alvo = alvo.object;
        }
        if (!t.isIdentifier(alvo, { name: 'conferir' })) return;
        const matcher = MATCHERS[callee.property.name];
        if (!matcher) throw new Error('Verificação desconhecida: ' + callee.property.name);
        let expect = t.callExpression(t.identifier('expect'), [p.node.arguments[0]]);
        if (negativo) expect = t.memberExpression(expect, t.identifier('not'));
        p.replaceWith(t.callExpression(t.memberExpression(expect, t.identifier(matcher)), p.node.arguments.slice(1)));
      },
    },
    BlockStatement: {
      exit(p) {
        p.node.body = p.node.body.flatMap(statement => {
          if (!t.isVariableDeclaration(statement) || statement.declarations.length !== 1) return [statement];
          const declaration = statement.declarations[0];
          if (!t.isAwaitExpression(declaration.init) || !t.isCallExpression(declaration.init.argument) || !t.isIdentifier(declaration.init.argument.callee, { name: 'iniciarPartida' })) return [statement];
          declaration.init.argument.callee = t.identifier('abrirJogo');
          return [statement, clicarNova(declaration.id.name)];
        });
      },
    },
  });
  return ast;
}

function assinatura(ast, fixtures = []) {
  ast = expandir(ast);
  const imports = [];
  const declaracoes = [];
  const execucoes = [];
  function collect(statement) {
    if (t.isImportDeclaration(statement)) {
      const source = statement.source.value;
      if (source.includes('/cenarios/') || source.endsWith('/support/verificacoes.js') || source.endsWith('/partidas.js')) return;
      imports.push(statement);
    } else if (t.isFunctionDeclaration(statement) || t.isVariableDeclaration(statement)) {
      declaracoes.push(statement);
    } else if (t.isExpressionStatement(statement) && t.isCallExpression(statement.expression) && t.isIdentifier(statement.expression.callee, { name: 'describe' })) {
      statement.expression.arguments[1].body.body.forEach(collect);
    } else {
      execucoes.push(statement);
    }
  }
  ast.program.body.forEach(collect);
  for (const fixture of fixtures) {
    for (const statement of expandir(fixture).program.body) {
      if (t.isExportNamedDeclaration(statement) && statement.declaration) declaracoes.push(statement.declaration);
    }
  }
  // A ordem relativa das declarações e dos casos é preservada em cada grupo.
  return { imports: hash(imports), declaracoes: hash(declaracoes), execucoes: hash(execucoes) };
}

function verificar(raiz) {
  const contratos = JSON.parse(fs.readFileSync(path.join(raiz, 'tests', 'contratos.json'), 'utf8'));
  for (const [file, contract] of Object.entries(contratos)) {
    const ast = parse(fs.readFileSync(path.join(raiz, file), 'utf8'));
    const fixtures = contract.fixture ? [parse(fs.readFileSync(path.join(raiz, contract.fixture), 'utf8'))] : [];
    const actual = assinatura(ast, fixtures);
    for (const part of ['imports', 'declaracoes', 'execucoes']) {
      if (actual[part] !== contract.assinatura[part]) throw new Error(`${file}: contrato ${part} alterado`);
    }
    console.log(`${file}: cenários, parâmetros, ações, asserções e hooks equivalentes`);
  }
}

module.exports = { MATCHERS, parse, hash, assinatura, clicarNova, verificar, expandir, limpar };
if (require.main === module) verificar(process.cwd());
