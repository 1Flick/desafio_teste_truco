// Testes de vira, manilha e força das cartas (G3). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, screen, montarBaralho, jogarVaza } from './helpers.js';
import { comBaralho, MAOS_SEM_OUROS, BARALHO_COMUNS, BARALHO_MANILHAS, BARALHO_MANILHA_X_3, ESCALA, TODAS_AS_CARTAS, baralhoDoPar } from "./cenarios/manilha.js";
import { conferir } from "./support/verificacoes.js";
import { iniciarPartida } from "./partidas.js";
describe("Truco paulista \u2014 manilha", () => {
  test.each([['4', '5'], ['5', '6'], ['6', '7'], ['7', 'Q'], ['Q', 'J'], ['J', 'K'], ['K', 'A'], ['A', '2'], ['2', '3'], ['3', '4']])('TC-TR-05 vira %s → manilha %s', async (vira, manilha) => {
    await comBaralho(montarBaralho(...MAOS_SEM_OUROS, `${vira}O`));
    conferir.texto(screen.getByTestId('manilha'), new RegExp(`^${manilha}$`));
  });

  // Vira 4O → manilha 5. Duas vazas, com o 3 nunca na 1ª nem na última posição:
  // 1ª: K (J1) · A (J2) · 3 (J3) · 2 (J4) → Nós.  2ª (J3 começa): K (J3) · 3 (J4) · 2 (J1) · A (J2) → Eles.
  // Um jogo que desse a vaza à 1ª carta, à última carta ou ao A erraria em pelo menos uma.

  test('TC-TR-06 força das cartas comuns: 3 > 2 > A > K', async () => {
    const user = await comBaralho(BARALHO_COMUNS);
    await jogarVaza(user, {
      J1: 'KO',
      J2: 'AO',
      J3: '3O',
      J4: '2E'
    });
    conferir.texto(screen.getByTestId('vaza-1'), 'Nós');
    await jogarVaza(user, {
      J3: 'KE',
      J4: '3E',
      J1: '2O',
      J2: 'AE'
    });
    conferir.texto(screen.getByTestId('vaza-2'), 'Eles');
  });

  // Vira 4O → as quatro manilhas (5) na mesma vaza: ♦ J1 < ♠ J2 < ♥ J3 < ♣ J4 (zap).

  test('TC-TR-07 ordem das manilhas: ouros < espadas < copas < paus (zap)', async () => {
    const user = await comBaralho(BARALHO_MANILHAS);
    await jogarVaza(user, {
      J1: '5O',
      J2: '5E',
      J3: '5C',
      J4: '5P'
    });
    conferir.texto(screen.getByTestId('vaza-1'), 'Eles');
  });

  // Vira 4O → manilha 5. A manilha nunca é a 1ª nem a última carta da vaza:
  // 1ª: 3P (J1) · 4E (J2) · 5O (J3, manilha mais fraca) · 3C (J4) → Nós.
  // 2ª (J3 começa): 6P (J3) · 5E (J4, manilha) · 3O (J1) · 2C (J2) → Eles.

  test('TC-TR-08 a manilha mais fraca vence o 3', async () => {
    const user = await comBaralho(BARALHO_MANILHA_X_3);
    await jogarVaza(user, {
      J1: '3P',
      J2: '4E',
      J3: '5O',
      J4: '3C'
    });
    conferir.texto(screen.getByTestId('vaza-1'), 'Nós');
    await jogarVaza(user, {
      J3: '6P',
      J4: '5E',
      J1: '3O',
      J2: '2C'
    });
    conferir.texto(screen.getByTestId('vaza-2'), 'Eles');
  });

  // Escala das comuns, da menor para a maior. Cada par vizinho é testado com uma vira que
  // não transforma nenhuma das duas cartas em manilha.

  test.each(ESCALA.slice(0, -1).map((v, i) => [v, ESCALA[i + 1]]))('TC-TR-30 escala das comuns: %s perde para %s', async (menor, maior) => {
    const {
      baralho,
      jogadas
    } = baralhoDoPar(menor, maior);
    const user = await comBaralho(baralho);
    await jogarVaza(user, jogadas);
    conferir.texto(screen.getByTestId('vaza-1'), 'Eles');
  });

  // Vira 4O → manilha 5. Aqui a manilha mais FORTE é jogada primeiro (por J1), ao contrário do TC-TR-07.
  test.each([['5E', '5O'], ['5C', '5E'], ['5P', '5C']])('TC-TR-31 manilha %s vence %s', async (forte, fraca) => {
    const user = await comBaralho(montarBaralho([forte, '7E', 'QE'], [fraca, '7C', 'QC'], ['6P', '7P', 'QP'], ['6C', '6E', 'JE'], '4O'));
    await jogarVaza(user, {
      J1: forte,
      J2: fraca,
      J3: '6P',
      J4: '6C'
    });
    conferir.texto(screen.getByTestId('vaza-1'), 'Nós');
  });
});
