import test from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { analisarResultado, lerIds, MODO } from '../lib/relatorio-testes.mjs';

const raiz = process.cwd();
const ids = new Set(['TC-AA-01']);
const caso = (status, title = 'TC-AA-01 cenário', motivo = 'AssertionError: esperado') => ({
  title, status, failureMessages: [motivo],
});
const analisar = (casos, opcoes = {}, planejados = ids) => analisarResultado({
  testResults: [{ name: join(raiz, 'tests', 'exemplo.spec.js'), assertionResults: casos }],
}, raiz, planejados, opcoes);

test('mantém modo RED e extrai IDs únicos da tabela', () => {
  assert.equal(MODO, 'somente-testes');
  assert.deepEqual([...lerIds('| TC-AA-01 | a |\n| TC-AA-01 | b |\ntexto TC-AA-02')], ['TC-AA-01']);
});
for (const motivo of ['AssertionError: falhou', 'TestingLibraryElementError: ausente', 'Error: expect(x)', 'JestExtendError: falhou']) {
  test(`aceita a falha esperada: ${motivo}`, () => {
    const resultado = analisar([caso('failed', undefined, `\x1b[31m${motivo}\x1b[0m`)]);
    assert.equal(resultado.ok, true);
    assert.match(resultado.texto, /Testes OK: 1\. Problemas: 0/);
    assert.ok(resultado.texto.includes(motivo));
  });
}
test('rejeita teste passando no RED e aceita no modo completo', () => {
  assert.match(analisar([caso('passed')]).texto, /PASSOU sem o jogo existir/);
  assert.equal(analisar([caso('passed')], { modo: 'tdd-completo' }).ok, true);
});
for (const status of ['skipped', 'pending', 'todo']) {
  test(`rejeita teste desativado: ${status}`, () => {
    const resultado = analisar([caso(status)]);
    assert.equal(resultado.ok, false);
    assert.match(resultado.texto, /teste desativado/);
  });
}
test('rejeita título sem ID, ID desconhecido e erro de programação', () => {
  assert.match(analisar([caso('failed', 'sem ID')]).texto, /título sem ID/);
  assert.match(analisar([caso('failed', 'TC-AA-02 outro')]).texto, /não existe na seção 5/);
  assert.match(analisar([caso('failed', undefined, 'TypeError: erro')]).texto, /motivo ERRADO/);
});
test('modo completo exige todos os IDs planejados', () => {
  const planejados = new Set(['TC-AA-01', 'TC-AA-02']);
  assert.equal(analisar([caso('failed')], {}, planejados).ok, true);
  assert.equal(analisar([caso('failed')], { completo: true }, planejados).ok, false);
});
test('erro de carregamento preserva diagnóstico sem ANSI nem linhas extras', () => {
  const resultado = analisarResultado({ testResults: [{
    name: join(raiz, 'tests', 'quebrado.spec.js'), status: 'failed',
    message: '\x1b[31mSyntaxError: inválido\x1b[0m\nsegunda linha',
  }] }, raiz, new Set());
  assert.equal(resultado.ok, false);
  assert.match(resultado.texto, /o arquivo não carrega — SyntaxError: inválido/);
  assert.ok(!resultado.texto.includes('segunda linha'));
});
