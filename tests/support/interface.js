import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

const pagina = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const corpo = pagina.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

/** Mantém o carregamento do jogo no módulo chamador e isola cada cenário. */
export function criarAbertura(carregarJogo) {
  return async function abrirJogo(params = {}, opcoesUser = {}) {
    const consulta = new URLSearchParams(params);
    window.history.replaceState({}, '', `/?${consulta}`);
    document.body.innerHTML = corpo;
    jest.resetModules();
    await carregarJogo();
    return userEvent.setup(opcoesUser);
  };
}

export async function cliqueDireito(user, elemento) {
  await user.pointer({ keys: '[MouseRight]', target: elemento });
}

export { screen, within };
