import { conferir } from '../tests/support/verificacoes.js';

beforeEach(() => {
  document.body.innerHTML = '<button data-testid="botao">Jogar</button><span hidden>Oculto</span>';
});

test('texto mantém comparação, opções e negação', () => {
  const botao = document.querySelector('button');
  conferir.texto(botao, /^Jogar$/);
  conferir.nao.texto(botao, 'Encerrar');
  expect(() => conferir.texto(botao, 'Encerrar')).toThrow();
});

test('atributo mantém verificações com e sem valor e negação', () => {
  const botao = document.querySelector('button');
  conferir.atributo(botao, 'data-testid', 'botao');
  conferir.atributo(botao, 'data-testid');
  conferir.nao.atributo(botao, 'disabled');
  expect(() => conferir.atributo(botao, 'disabled')).toThrow();
});

test('quantidade mantém a contagem exata e a negação', () => {
  conferir.quantidade([1, 2], 2);
  conferir.nao.quantidade([1, 2], 3);
  expect(() => conferir.quantidade([1, 2], 3)).toThrow();
});

test('visibilidade mantém casos positivos, negativos e falhas', () => {
  conferir.visivel(document.querySelector('button'));
  conferir.nao.visivel(document.querySelector('span'));
  expect(() => conferir.visivel(document.querySelector('span'))).toThrow();
});

test('estado habilitado mantém ambos os sentidos', () => {
  const botao = document.querySelector('button');
  conferir.habilitado(botao);
  botao.disabled = true;
  conferir.nao.habilitado(botao);
  expect(() => conferir.habilitado(botao)).toThrow();
});

test('estado desabilitado mantém ambos os sentidos', () => {
  const botao = document.querySelector('button');
  conferir.nao.desabilitado(botao);
  botao.disabled = true;
  conferir.desabilitado(botao);
  expect(() => conferir.nao.desabilitado(botao)).toThrow();
});

test('presença mantém os mesmos elementos e diagnósticos de ausência', () => {
  conferir.presente(document.querySelector('button'));
  conferir.nao.presente(null);
  expect(() => conferir.presente(null)).toThrow();
});
