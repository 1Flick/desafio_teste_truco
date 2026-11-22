import { relative } from 'node:path';

export const MODO = 'somente-testes';
const FALHAS_ESPERADAS = [
  /^AssertionError/, /^TestingLibraryElementError/, /^Error: expect\(/, /^JestExtendError/,
];
const primeiraLinha = (valor) => String(valor ?? '')
  .replace(/\x1b\[[0-9;]*m/g, '').trim().split('\n')[0].slice(0, 160);

export function lerIds(conteudo) {
  return new Set([...conteudo.matchAll(/^\| (TC-[A-Z]{2}-\d{2}) \|/gm)].map((item) => item[1]));
}

function avaliarCaso(teste, arquivo, ids, modo, estado) {
  const id = teste.title.match(/^(TC-[A-Z]{2}-\d{2})\b/)?.[1];
  const rotulo = `${arquivo} › "${teste.title}"`;
  if (!id) {
    estado.erros.push(`${rotulo}: título sem ID TC-XX-NN`);
    return;
  }
  if (ids.size && !ids.has(id)) {
    estado.erros.push(`${rotulo}: ${id} não existe na seção 5 do PLANEJAMENTO.md`);
  }
  estado.feitos.add(id);
  if (['skipped', 'pending', 'todo'].includes(teste.status)) {
    estado.erros.push(`${rotulo}: teste desativado (skip/todo) não é permitido`);
    return;
  }
  if (teste.status === 'passed') {
    if (modo === 'somente-testes') {
      estado.erros.push(`${rotulo}: PASSOU sem o jogo existir — ele não testa o comportamento (confira o resultado esperado da seção 5)`);
    } else {
      estado.certos.push(`${id} passando`);
    }
    return;
  }
  const motivo = primeiraLinha(teste.failureMessages?.[0]);
  if (FALHAS_ESPERADAS.some((padrao) => padrao.test(motivo))) {
    estado.certos.push(`${id} falha pelo motivo certo — ${motivo}`);
  } else {
    estado.erros.push(`${rotulo}: falha pelo motivo ERRADO (erro no próprio teste) — ${motivo}`);
  }
}

/** Classificação pura: não executa processos nem acessa o sistema de arquivos. */
export function analisarResultado(resultado, raiz, ids, { completo = false, modo = MODO } = {}) {
  const estado = { erros: [], certos: [], feitos: new Set() };
  for (const arquivo of resultado.testResults ?? []) {
    const nome = relative(raiz, arquivo.name);
    if (!arquivo.assertionResults?.length) {
      if (arquivo.status === 'failed') {
        estado.erros.push(`${nome}: o arquivo não carrega — ${primeiraLinha(arquivo.message)}`);
      }
      continue;
    }
    for (const teste of arquivo.assertionResults) avaliarCaso(teste, nome, ids, modo, estado);
  }
  const faltando = [...ids].filter((id) => !estado.feitos.has(id));
  if (completo && faltando.length) {
    estado.erros.push(`TCs do PLANEJAMENTO.md ainda sem teste: ${faltando.join(', ')}`);
  }
  const { erros, certos } = estado;
  const texto = [
    `Modo: ${modo}. Testes OK: ${certos.length}. Problemas: ${erros.length}. TCs sem teste ainda: ${faltando.length}/${ids.size}.`,
    ...(erros.length ? ['', 'PROBLEMAS:', ...erros.map((erro) => `  ✗ ${erro}`)] : []),
    ...(certos.length ? ['', 'OK:', ...certos.map((certo) => `  ✓ ${certo}`)] : []),
    ...(!completo && faltando.length ? ['', `Ainda sem teste: ${faltando.join(', ')}`] : []),
  ].join('\n');
  return { ok: erros.length === 0, texto };
}
