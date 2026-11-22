// Dados determinísticos e ações reutilizadas nos casos deste domínio.
// Testes do baralho e da distribuição (G2). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, screen, cartasNaMao } from "../helpers.js";
import { conferir } from "../support/verificacoes.js";
import { iniciarPartida } from "../partidas.js";
export const JOGADORES = ['J1', 'J2', 'J3', 'J4'];
// Valores do baralho de 40 cartas (sem 8, 9, 10) + naipe O/E/C/P
export const CODIGO = /^(A|[2-7]|Q|J|K)[OECP]$/;
export async function novaPartida() {
  const user = await iniciarPartida();
  return user;
}
/** As 13 cartas à vista: 12 nas mãos + a vira. */
export const cartasExibidas = () => [...JOGADORES.flatMap(j => cartasNaMao(j)), screen.getByTestId('vira')].map(c => c.getAttribute('data-carta'));
