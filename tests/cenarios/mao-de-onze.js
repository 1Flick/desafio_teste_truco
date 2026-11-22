// Dados determinísticos e ações reutilizadas nos casos deste domínio.
// Testes de mão de onze e mão de ferro (B5). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, screen, montarBaralho, jogar, jogarVaza, cartasNaMao } from "../helpers.js";
import { conferir } from "../support/verificacoes.js";
import { iniciarPartida } from "../partidas.js";
export const BARALHO_MAO_ESPECIAL = montarBaralho(['6E', '2E', '7E'], ['7C', '6C', 'QC'], ['3C', '3P', 'AP'], ['QE', 'JE', 'KE'], '4O');
export async function abrirMaoEspecial(placar, baralho = BARALHO_MAO_ESPECIAL) {
  const user = await iniciarPartida({
    placar,
    baralho
  });
  return user;
}
// Duas mãos fixas: as cartas da 2ª mão (J1 = 7E, KE, AO) só aparecem se a mão for redistribuída.
export const BARALHO_DUAS_MAOS = [BARALHO_MAO_ESPECIAL, montarBaralho(['7E', 'KE', 'AO'], ['3E', '2C', 'QC'], ['6P', '7P', '3O'], ['QE', 'JE', '6C'], '4O')].join(',');
