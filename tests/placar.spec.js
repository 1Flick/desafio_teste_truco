// Testes de placar e fim da partida (B4). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, screen, montarBaralho, jogarVaza, cartasNaMao } from './helpers.js';

// Vira 4O (manilha 5, ausente das mãos). J3 vence as duas primeiras vazas para Nós.
import { BARALHO_NOS_VENCE, BARALHO_ELES_VENCE, BARALHO_PLACAR_ACUMULADO, vencerTrucoComNos } from "./cenarios/placar.js";
import { conferir } from "./support/verificacoes.js";
import { iniciarPartida } from "./partidas.js";
describe("Truco paulista \u2014 placar", () => {
  test('TC-TR-23 Nós vence a partida ao chegar a 12 pontos', async () => {
    await vencerTrucoComNos('9-5');
    conferir.texto(screen.getByTestId('placar-nos'), /^12$/);
    conferir.texto(screen.getByTestId('mensagem'), /^Nós venceram a partida!$/);
    const cartas = screen.getAllByTestId(/^carta-j[1-4]-\d$/);
    expect(cartas.length).toBeGreaterThan(0);
    for (const carta of cartas) conferir.atributo(carta, 'disabled');
  });
  test('TC-TR-24 Nova partida após o fim zera o placar e redistribui', async () => {
    const user = await vencerTrucoComNos('9-5');
    await user.click(screen.getByTestId('btn-nova-partida'));
    conferir.texto(screen.getByTestId('placar-nos'), /^0$/);
    conferir.texto(screen.getByTestId('placar-eles'), /^0$/);
    for (const jogador of ['J1', 'J2', 'J3', 'J4']) {
      conferir.quantidade(cartasNaMao(jogador), 3);
    }
  });
  test.each([{
    caso: 'Nós passa de 12',
    placarInicial: '10-5',
    baralho: BARALHO_NOS_VENCE,
    vazas: [{
      J1: '6E',
      J2: '7C',
      J3: '3C',
      J4: 'QE'
    }, {
      J3: '3P',
      J4: 'JE',
      J1: '2E',
      J2: '6C'
    }],
    placarNos: 13,
    placarEles: 5,
    mensagem: 'Nós venceram a partida!'
  }, {
    caso: 'Eles chega a 12',
    placarInicial: '5-9',
    baralho: BARALHO_ELES_VENCE,
    vazas: [{
      J1: '6E',
      J2: '3C',
      J3: '7C',
      J4: 'QE'
    }, {
      J2: '3P',
      J3: '6C',
      J4: 'JE',
      J1: '2E'
    }],
    placarNos: 5,
    placarEles: 12,
    mensagem: 'Eles venceram a partida!'
  }])('TC-TR-35 fim da partida: $caso', async ({
    placarInicial,
    baralho,
    vazas,
    placarNos,
    placarEles,
    mensagem
  }) => {
    const user = await iniciarPartida({
      placar: placarInicial,
      baralho
    });
    await user.click(screen.getByTestId('btn-truco'));
    await user.click(screen.getByTestId('btn-aceitar'));
    for (const vaza of vazas) await jogarVaza(user, vaza);
    conferir.texto(screen.getByTestId('placar-nos'), new RegExp(`^${placarNos}$`));
    conferir.texto(screen.getByTestId('placar-eles'), new RegExp(`^${placarEles}$`));
    conferir.texto(screen.getByTestId('mensagem'), new RegExp(`^${mensagem}$`));
  });
  test('TC-TR-39 placar acumula as vitórias entre as mãos', async () => {
    const user = await iniciarPartida({
      baralho: BARALHO_PLACAR_ACUMULADO
    });
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
    conferir.texto(screen.getByTestId('placar-nos'), /^1$/);
    await jogarVaza(user, {
      J2: '3E',
      J3: '6P',
      J4: 'QE',
      J1: '7E'
    });
    await jogarVaza(user, {
      J2: '2C',
      J3: '7P',
      J4: 'JE',
      J1: 'KE'
    });
    conferir.texto(screen.getByTestId('placar-nos'), /^1$/);
    conferir.texto(screen.getByTestId('placar-eles'), /^1$/);
  });
});
