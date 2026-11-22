// Dados determinísticos e ações reutilizadas nos casos deste domínio.
// Testes das dicas de jogo (G6). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, screen, montarBaralho, jogar, cartasNaMao } from "../helpers.js";
import { conferir } from "../support/verificacoes.js";
import { iniciarPartida } from "../partidas.js";
export async function comBaralho(baralho) {
  const user = await iniciarPartida({
    baralho
  });
  return user;
}
