// Dados determinísticos e ações reutilizadas nos casos deste domínio.
// Testes de turnos, vazas e empates (G4, G5). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
// Todos os baralhos usam a vira 4O (manilha = 5), e nenhum 5 aparece nas mãos: só cartas comuns.
import { abrirJogo, screen, montarBaralho, jogar, jogarVaza, cartasNaMao } from "../helpers.js";
import { conferir } from "../support/verificacoes.js";
import { iniciarPartida } from "../partidas.js";
export const JOGADORES = ['J1', 'J2', 'J3', 'J4'];
export async function comBaralho(baralho) {
  const user = await iniciarPartida({
    baralho
  });
  return user;
}
/** Nova mão distribuída: os 4 jogadores com 3 cartas de novo. */
export function maosCompletas() {
  for (const j of JOGADORES) conferir.quantidade(cartasNaMao(j), 3);
}
export const BARALHO_TURNO = montarBaralho(['3O', '6E', '7E'], ['2O', '6C', '7C'], ['AO', '6P', '7P'], ['KO', 'QE', 'QC'], '4O');
// Duas mãos fixas (26 cartas). Mão 1 (começa J1): Nós vence as 2 vazas.
// Mão 2 (pelo rodízio, começa J2): Eles vence as 2 vazas. A mão 3 deve começar com J3.
export const BARALHO_RODIZIO = [montarBaralho(['6E', '2E', '7E'], ['7C', '6C', 'QC'], ['3C', '3P', 'AP'], ['QE', 'JE', 'KE'], '4O'), montarBaralho(['7E', 'KE', 'AO'], ['3E', '2C', 'QC'], ['6P', '7P', '3O'], ['QE', 'JE', '6C'], '4O')].join(',');
// 1ª vaza: o 3C de J3 é a maior. 2ª vaza: o 3P de J3 de novo → Nós vence 2 vazas.
export const BARALHO_J3_VENCE = montarBaralho(['6E', '2E', '7E'], ['7C', '6C', 'QC'], ['3C', '3P', 'AP'], ['QE', 'JE', 'KE'], '4O');
// 1ª vaza: 3O (Nós) × 3E (Eles) são as maiores → empate. 2ª vaza: o AP de J2 vence.
export const BARALHO_EMPATE_1A = montarBaralho(['3O', '6E', '7E'], ['3E', 'AP', 'QC'], ['6P', '7P', 'JE'], ['QE', 'KE', '6C'], '4O');
// 1ª vaza: 3O de J1 vence. 2ª vaza: 2E (Eles, sai antes) × 2O (Nós, sai depois) → empate.
// A ordem importa: um jogo que desempatasse pela 1ª ou pela última carta jogada erraria aqui.
export const BARALHO_EMPATE_2A = montarBaralho(['3O', '6E', '7E'], ['7C', '2E', '6C'], ['QP', '2O', 'JE'], ['QE', 'KE', '6P'], '4O');
// 1ª: 3O (Nós) vence · 2ª: AP (Eles) vence · 3ª: 2O (Nós) × 2E (Eles) → empate.
export const BARALHO_EMPATE_3A = montarBaralho(['3O', '6E', '2O'], ['7C', 'AP', '2E'], ['QP', '7P', 'JE'], ['QE', 'KE', '6P'], '4O');
// As três vazas empatam: 3O × 3E, 2O × 2E, AO × AE (J3 e J4 jogam cartas menores).
export const BARALHO_TRES_EMPATES = montarBaralho(['3O', '2O', 'AO'], ['3E', '2E', 'AE'], ['4P', '6P', '7P'], ['4C', '6C', '7C'], '4O');
// Os dois 3 são da dupla Nós (J1 e J3): não é empate, porque a maior de Eles é um 2.
export const BARALHO_IGUAIS_NA_DUPLA = montarBaralho(['3O', '6E', '7E'], ['2O', '6C', '7C'], ['3E', '6P', '7P'], ['2E', 'QE', 'QC'], '4O');
// 1ª: 3O × 3E (empate) · 2ª: 2O × 2E (empate) · 3ª: o AE de J2 vence.
export const BARALHO_DOIS_EMPATES = montarBaralho(['3O', '2O', 'QE'], ['3E', '2E', 'AE'], ['4P', '6P', '7P'], ['4C', '6C', 'KC'], '4O');
// 1ª: 3O (Nós) · 2ª: AP (Eles) · 3ª: 2E (Eles).
export const BARALHO_UM_A_UM = montarBaralho(['3O', '6E', '7E'], ['7C', 'AP', '2E'], ['QP', '7P', 'JE'], ['QE', 'KE', '6P'], '4O');
// Mão 1 igual à do TC-TR-37 (Nós vence). A mão 2 começa com J2 (rodízio) e a 1ª vaza empata
// com as maiores cartas jogadas por J3 e J4: começa a próxima quem começou a vaza empatada, J2.
export const BARALHO_EMPATE_NA_MAO_2 = [montarBaralho(['6E', '2E', '7E'], ['7C', '6C', 'QC'], ['3C', '3P', 'AP'], ['QE', 'JE', 'KE'], '4O'), montarBaralho(['7E', 'KE', 'AO'], ['6C', '2C', 'QC'], ['3O', '6P', '7P'], ['3E', 'QE', 'JE'], '4O')].join(',');
