// Testes de mão de onze e mão de ferro (B5). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, screen, montarBaralho, jogar, jogarVaza, cartasNaMao } from './helpers.js';
import { BARALHO_MAO_ESPECIAL, abrirMaoEspecial, BARALHO_DUAS_MAOS } from "./cenarios/mao-de-onze.js";
import { conferir } from "./support/verificacoes.js";
import { iniciarPartida } from "./partidas.js";
describe("Truco paulista \u2014 mao-de-onze", () => {
  test('TC-TR-25 Nós escolhe jogar a mão de onze por 3 pontos', async () => {
    const user = await abrirMaoEspecial('11-4');
    conferir.visivel(screen.getByTestId('decisao-onze'));
    conferir.atributo(screen.getByTestId('decisao-onze'), 'data-dupla', 'nos');
    conferir.texto(screen.getByTestId('btn-jogar-onze'), /^Jogar$/i);
    conferir.texto(screen.getByTestId('btn-correr-onze'), /^Correr$/i);
    const cartasDoParceiro = cartasNaMao('J3');
    conferir.quantidade(cartasDoParceiro, 3);
    for (const carta of cartasDoParceiro) conferir.atributo(carta, 'data-face', 'cima');
    for (const adversario of ['J2', 'J4']) {
      for (const carta of cartasNaMao(adversario)) conferir.atributo(carta, 'data-face', 'baixo');
    }
    await user.click(screen.getByTestId('btn-jogar-onze'));
    conferir.texto(screen.getByTestId('valor-mao'), /^3$/);
    conferir.nao.visivel(screen.getByTestId('decisao-onze'));
  });

  // Duas mãos fixas: as cartas da 2ª mão (J1 = 7E, KE, AO) só aparecem se a mão for redistribuída.

  test('TC-TR-26 Nós corre da mão de onze e Eles ganha 1 ponto', async () => {
    const user = await abrirMaoEspecial('11-4', BARALHO_DUAS_MAOS);
    await user.click(screen.getByTestId('btn-correr-onze'));
    conferir.texto(screen.getByTestId('placar-eles'), /^5$/);
    for (const jogador of ['J1', 'J2', 'J3', 'J4']) {
      conferir.quantidade(cartasNaMao(jogador), 3);
    }
    expect(cartasNaMao('J1').map(c => c.getAttribute('data-carta')).sort()).toEqual(['7E', 'AO', 'KE']); // é a 2ª mão
  });
  test('TC-TR-27 não permite Truco durante toda a mão de onze', async () => {
    const user = await abrirMaoEspecial('11-4');
    await user.click(screen.getByTestId('btn-jogar-onze'));
    const esperarTrucoIndisponivel = () => {
      const botao = screen.queryByTestId('btn-truco');
      expect(botao === null || botao.hidden || botao.disabled).toBe(true);
    };
    esperarTrucoIndisponivel();
    for (const [jogador, carta] of [['J1', '6E'], ['J2', '7C'], ['J3', '3C'], ['J4', 'QE'], ['J3', '3P'], ['J4', 'JE'], ['J1', '2E'], ['J2', '6C']]) {
      await jogar(user, jogador, carta);
      esperarTrucoIndisponivel();
    }
  });
  test('TC-TR-28 mão de ferro tem cartas fechadas e decide a partida', async () => {
    const user = await abrirMaoEspecial('11-11');
    const cartas = screen.getAllByTestId(/^carta-j[1-4]-\d$/);
    conferir.quantidade(cartas, 12);
    for (const carta of cartas) conferir.atributo(carta, 'data-face', 'baixo');
    const botaoTruco = screen.queryByTestId('btn-truco');
    expect(botaoTruco === null || botaoTruco.hidden || botaoTruco.disabled).toBe(true);
    conferir.texto(screen.getByTestId('valor-mao'), /^1$/);
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
    conferir.texto(screen.getByTestId('placar-nos'), /^12$/);
    conferir.texto(screen.getByTestId('mensagem'), /^Nós venceram a partida!$/);
  });
  test('TC-TR-36 Eles decide sua mão de onze e pode correr', async () => {
    const user = await abrirMaoEspecial('4-11');
    conferir.visivel(screen.getByTestId('decisao-onze'));
    conferir.atributo(screen.getByTestId('decisao-onze'), 'data-dupla', 'eles');
    const cartasDoParceiro = cartasNaMao('J4');
    conferir.quantidade(cartasDoParceiro, 3);
    for (const carta of cartasDoParceiro) conferir.atributo(carta, 'data-face', 'cima');
    for (const adversario of ['J1', 'J3']) {
      for (const carta of cartasNaMao(adversario)) conferir.atributo(carta, 'data-face', 'baixo');
    }
    await user.click(screen.getByTestId('btn-correr-onze'));
    conferir.texto(screen.getByTestId('placar-nos'), /^5$/);
  });
});
