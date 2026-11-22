// Dados determinísticos e ações reutilizadas nos casos deste domínio.
// Testes de pedidos e aumentos (B2, B3). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, screen, montarBaralho, jogar, jogarVaza, cartasNaMao } from "../helpers.js";

// Vira 4O (manilha 5, ausente das mãos). J3 vence as duas primeiras vazas com 3C e 3P.
import { conferir } from "../support/verificacoes.js";
import { iniciarPartida } from "../partidas.js";
// Vira 4O (manilha 5, ausente das mãos). J3 vence as duas primeiras vazas com 3C e 3P.
export const BARALHO_NOS_VENCE = montarBaralho(['6E', '2E', '7E'], ['7C', '6C', 'QC'], ['3C', '3P', 'AP'], ['QE', 'JE', 'KE'], '4O');
// Duas mãos fixas: as cartas da 2ª mão (J1 = 7E, KE, AO) só aparecem se a mão for redistribuída.
export const BARALHO_DUAS_MAOS = [BARALHO_NOS_VENCE, montarBaralho(['7E', 'KE', 'AO'], ['3E', '2C', 'QC'], ['6P', '7P', '3O'], ['QE', 'JE', '6C'], '4O')].join(',');
