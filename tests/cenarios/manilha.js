// Dados determinísticos e ações reutilizadas nos casos deste domínio.
// Testes de vira, manilha e força das cartas (G3). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, screen, montarBaralho, jogarVaza } from "../helpers.js";
import { conferir } from "../support/verificacoes.js";
import { iniciarPartida } from "../partidas.js";
export async function comBaralho(baralho) {
  const user = await iniciarPartida({
    baralho
  });
  return user;
}

// Mãos fixas sem nenhuma carta de ouros, para a vira (sempre de ouros) não repetir.
export const MAOS_SEM_OUROS = [['AE', '2E', '3E'], ['AC', '2C', '3C'], ['AP', '2P', '3P'], ['KE', 'KC', 'KP']];
// Vira 4O → manilha 5. Duas vazas, com o 3 nunca na 1ª nem na última posição:
// 1ª: K (J1) · A (J2) · 3 (J3) · 2 (J4) → Nós.  2ª (J3 começa): K (J3) · 3 (J4) · 2 (J1) · A (J2) → Eles.
// Um jogo que desse a vaza à 1ª carta, à última carta ou ao A erraria em pelo menos uma.
export const BARALHO_COMUNS = montarBaralho(['KO', '2O', '6E'], ['AO', 'AE', '6C'], ['3O', 'KE', '6P'], ['2E', '3E', '7C'], '4O');
// Vira 4O → as quatro manilhas (5) na mesma vaza: ♦ J1 < ♠ J2 < ♥ J3 < ♣ J4 (zap).
export const BARALHO_MANILHAS = montarBaralho(['5O', '6E', '7E'], ['5E', '6C', '7C'], ['5C', '6P', '7P'], ['5P', 'QE', 'QC'], '4O');
// Vira 4O → manilha 5. A manilha nunca é a 1ª nem a última carta da vaza:
// 1ª: 3P (J1) · 4E (J2) · 5O (J3, manilha mais fraca) · 3C (J4) → Nós.
// 2ª (J3 começa): 6P (J3) · 5E (J4, manilha) · 3O (J1) · 2C (J2) → Eles.
export const BARALHO_MANILHA_X_3 = montarBaralho(['3P', '3O', '7E'], ['4E', '2C', '7C'], ['5O', '6P', '7P'], ['3C', '5E', 'QC'], '4O');
// Escala das comuns, da menor para a maior. Cada par vizinho é testado com uma vira que
// não transforma nenhuma das duas cartas em manilha.
export const ESCALA = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
export const TODAS_AS_CARTAS = ESCALA.flatMap(v => ['O', 'E', 'C', 'P'].map(n => `${v}${n}`));
export function baralhoDoPar(menor, maior) {
  const vira = menor === '4' ? 'KP' : '3P'; // manilha A (no par 4 < 5) ou 4 (nos outros pares)
  const manilha = menor === '4' ? 'A' : '4';
  const fraca = menor === '4' ? '4' : '5'; // a comum mais fraca com essa vira
  const jogadas = {
    J1: `${menor}O`,
    J2: `${maior}O`,
    J3: `${fraca}E`,
    J4: `${fraca}C`
  };
  const usadas = new Set([...Object.values(jogadas), vira]);
  const resto = TODAS_AS_CARTAS.filter(c => !usadas.has(c) && c[0] !== manilha);
  const mao = (j, i) => [jogadas[j], resto[i * 2], resto[i * 2 + 1]];
  return {
    baralho: montarBaralho(mao('J1', 0), mao('J2', 1), mao('J3', 2), mao('J4', 3), vira),
    jogadas
  };
}
