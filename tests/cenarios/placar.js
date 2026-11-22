// Dados determinísticos e ações reutilizadas nos casos deste domínio.
// Testes de placar e fim da partida (B4). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, screen, montarBaralho, jogarVaza, cartasNaMao } from "../helpers.js";

// Vira 4O (manilha 5, ausente das mãos). J3 vence as duas primeiras vazas para Nós.
import { conferir } from "../support/verificacoes.js";
import { iniciarPartida } from "../partidas.js";
// Vira 4O (manilha 5, ausente das mãos). J3 vence as duas primeiras vazas para Nós.
export const BARALHO_NOS_VENCE = montarBaralho(['6E', '2E', '7E'], ['7C', '6C', 'QC'], ['3C', '3P', 'AP'], ['QE', 'JE', 'KE'], '4O');

// Vira 4O (manilha 5, ausente das mãos). J2 vence as duas primeiras vazas para Eles.
export const BARALHO_ELES_VENCE = montarBaralho(['6E', '2E', '7E'], ['3C', '3P', 'AP'], ['7C', '6C', 'QC'], ['QE', 'JE', 'KE'], '4O');

// Duas mãos fixas: Nós vence as duas primeiras vazas da mão 1; Eles, as da mão 2.
export const BARALHO_PLACAR_ACUMULADO = [BARALHO_NOS_VENCE, montarBaralho(['7E', 'KE', 'AO'], ['3E', '2C', 'QC'], ['6P', '7P', '3O'], ['QE', 'JE', '6C'], '4O')].join(',');
export async function vencerTrucoComNos(placar) {
  const user = await iniciarPartida({
    placar,
    baralho: BARALHO_NOS_VENCE
  });
  await user.click(screen.getByTestId('btn-truco'));
  await user.click(screen.getByTestId('btn-aceitar'));
  await jogarVaza(user, {
    J1: '6E',
    J2: '7C',
    J3: '3C',
    J4: 'QE'
  });
  await jogarVaza(user, {
    J3: '3P',
    J4: 'JE',
    J1: '2E',
    J2: '6C'
  });
  return user;
}
