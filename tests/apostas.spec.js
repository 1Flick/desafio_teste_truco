// Testes de pedidos e aumentos (B2, B3). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, screen, montarBaralho, jogar, jogarVaza, cartasNaMao } from './helpers.js';

// Vira 4O (manilha 5, ausente das mãos). J3 vence as duas primeiras vazas com 3C e 3P.
import { BARALHO_NOS_VENCE, BARALHO_DUAS_MAOS } from "./cenarios/apostas.js";
import { conferir } from "./support/verificacoes.js";
import { iniciarPartida } from "./partidas.js";
describe("Truco paulista \u2014 apostas", () => {
  test('TC-TR-16 botão Truco disponível no início da mão', async () => {
    const user = await iniciarPartida();
    conferir.texto(screen.getByTestId('valor-mao'), /^1$/);
    conferir.texto(screen.getByTestId('btn-truco'), /^Truco$/i);
    conferir.habilitado(screen.getByTestId('btn-truco'));
    conferir.nao.visivel(screen.getByTestId('resposta')); // nenhum pedido ainda
    conferir.nao.visivel(screen.getByTestId('decisao-onze')); // não é mão de onze
  });
  test('TC-TR-17 pedir Truco exibe respostas para Eles e bloqueia as cartas', async () => {
    const user = await iniciarPartida();
    conferir.nao.visivel(screen.getByTestId('resposta')); // só aparece depois do pedido
    await user.click(screen.getByTestId('btn-truco'));
    conferir.visivel(screen.getByTestId('resposta'));
    conferir.atributo(screen.getByTestId('resposta'), 'data-dupla', 'eles');
    conferir.texto(screen.getByTestId('btn-aceitar'), /^Aceitar$/i);
    conferir.texto(screen.getByTestId('btn-correr'), /^Correr$/i);
    conferir.texto(screen.getByTestId('btn-aumentar'), /^Seis$/i);
    const cartas = screen.getAllByTestId(/^carta-j[1-4]-\d$/);
    conferir.quantidade(cartas, 12);
    for (const carta of cartas) conferir.atributo(carta, 'disabled');
  });
  test('TC-TR-18 aceitar Truco faz a mão valer 3 pontos', async () => {
    const user = await iniciarPartida({
      baralho: BARALHO_NOS_VENCE
    });
    await user.click(screen.getByTestId('btn-truco'));
    await user.click(screen.getByTestId('btn-aceitar'));
    conferir.texto(screen.getByTestId('valor-mao'), /^3$/);
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
    conferir.texto(screen.getByTestId('placar-nos'), /^3$/);
  });

  // Duas mãos fixas: as cartas da 2ª mão (J1 = 7E, KE, AO) só aparecem se a mão for redistribuída.

  test('TC-TR-19 correr do Truco dá 1 ponto a Nós e distribui nova mão', async () => {
    const user = await iniciarPartida({
      baralho: BARALHO_DUAS_MAOS
    });
    await user.click(screen.getByTestId('btn-truco'));
    await user.click(screen.getByTestId('btn-correr'));
    conferir.texto(screen.getByTestId('placar-nos'), /^1$/);
    for (const jogador of ['J1', 'J2', 'J3', 'J4']) {
      conferir.quantidade(cartasNaMao(jogador), 3);
    }
    expect(cartasNaMao('J1').map(c => c.getAttribute('data-carta')).sort()).toEqual(['7E', 'AO', 'KE']); // é a 2ª mão
  });
  test('TC-TR-20 aumentos levam a mão de Truco até Doze', async () => {
    const user = await iniciarPartida();
    await user.click(screen.getByTestId('btn-truco'));
    conferir.texto(screen.getByTestId('valor-mao'), /^3$/);
    await user.click(screen.getByTestId('btn-aumentar'));
    conferir.texto(screen.getByTestId('valor-mao'), /^6$/);
    conferir.texto(screen.getByTestId('btn-aumentar'), /^Nove$/i);
    await user.click(screen.getByTestId('btn-aumentar'));
    conferir.texto(screen.getByTestId('valor-mao'), /^9$/);
    conferir.texto(screen.getByTestId('btn-aumentar'), /^Doze$/i);
    await user.click(screen.getByTestId('btn-aumentar'));
    conferir.texto(screen.getByTestId('valor-mao'), /^12$/);
    const aumentar = screen.queryByTestId('btn-aumentar'); // no Doze não há aumento: some, fica escondido ou bloqueado
    expect(aumentar === null || aumentar.hidden || aumentar.closest('[hidden]') !== null || aumentar.disabled).toBe(true);
    await user.click(screen.getByTestId('btn-aceitar'));
    conferir.texto(screen.getByTestId('valor-mao'), /^12$/);
  });
  test.each([{
    pedido: 'Seis',
    aumentos: 1,
    placar: 'placar-eles',
    pontos: 3
  }, {
    pedido: 'Nove',
    aumentos: 2,
    placar: 'placar-nos',
    pontos: 6
  }, {
    pedido: 'Doze',
    aumentos: 3,
    placar: 'placar-eles',
    pontos: 9
  }])('TC-TR-21 correr do $pedido dá $pontos pontos a quem aumentou', async ({
    aumentos,
    placar,
    pontos
  }) => {
    const user = await iniciarPartida();
    await user.click(screen.getByTestId('btn-truco'));
    for (let i = 0; i < aumentos; i++) {
      await user.click(screen.getByTestId('btn-aumentar'));
    }
    await user.click(screen.getByTestId('btn-correr'));
    conferir.texto(screen.getByTestId(placar), new RegExp(`^${pontos}$`));
  });
  test('TC-TR-22 somente a dupla que recebeu o Truco pode pedir Seis', async () => {
    const user = await iniciarPartida({
      baralho: BARALHO_NOS_VENCE
    });
    await user.click(screen.getByTestId('btn-truco'));
    await user.click(screen.getByTestId('btn-aceitar'));
    conferir.texto(screen.getByTestId('vez'), /^J1$/);
    conferir.desabilitado(screen.getByTestId('btn-truco'));
    await jogar(user, 'J1', '6E');
    conferir.texto(screen.getByTestId('vez'), /^J2$/);
    conferir.texto(screen.getByTestId('btn-truco'), /^Seis$/i);
    conferir.habilitado(screen.getByTestId('btn-truco'));
  });
});
