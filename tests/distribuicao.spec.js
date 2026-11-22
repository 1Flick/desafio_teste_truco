// Testes do baralho e da distribuição (G2). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, screen, cartasNaMao } from './helpers.js';
import { JOGADORES, CODIGO, novaPartida, cartasExibidas } from "./cenarios/distribuicao.js";
import { conferir } from "./support/verificacoes.js";
import { iniciarPartida } from "./partidas.js";
describe("Truco paulista \u2014 distribuicao", () => {
  test('TC-TR-01 tela inicial: placar 0 × 0 e botão Nova partida', async () => {
    await abrirJogo();
    conferir.texto(screen.getByTestId('placar-nos'), /^0$/);
    conferir.texto(screen.getByTestId('placar-eles'), /^0$/);
    conferir.visivel(screen.getByTestId('btn-nova-partida'));
  });
  test('TC-TR-02 distribuição: 3 cartas para cada jogador e vira na mesa', async () => {
    await novaPartida();
    for (const j of JOGADORES) conferir.quantidade(cartasNaMao(j), 3);
    conferir.atributo(screen.getByTestId('vira'), 'data-carta', expect.stringMatching(CODIGO));
    conferir.texto(screen.getByTestId('vez'), /^J1$/);
  });
  test('TC-TR-03 baralho de 40 cartas: monte com 27 e sem 8, 9 ou 10 (20 partidas)', async () => {
    const user = await abrirJogo();
    for (let i = 0; i < 20; i++) {
      await user.click(screen.getByTestId('btn-nova-partida')); // o mesmo jogo distribui de novo
      conferir.texto(screen.getByTestId('monte-qtd'), /^27$/);
      const cartas = cartasExibidas();
      conferir.quantidade(cartas, 13);
      for (const c of cartas) expect(c).toMatch(CODIGO);
    }
  });
  test('TC-TR-04 as 13 cartas à vista não se repetem (20 partidas)', async () => {
    const user = await abrirJogo();
    for (let i = 0; i < 20; i++) {
      await user.click(screen.getByTestId('btn-nova-partida')); // o mesmo jogo distribui de novo
      const cartas = cartasExibidas();
      conferir.quantidade(cartas, 13);
      expect(new Set(cartas).size).toBe(13);
    }
  });
});
