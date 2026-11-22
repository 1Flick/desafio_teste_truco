// Testes de turnos, vazas e empates (G4, G5). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
// Todos os baralhos usam a vira 4O (manilha = 5), e nenhum 5 aparece nas mãos: só cartas comuns.
import { abrirJogo, screen, montarBaralho, jogar, jogarVaza, cartasNaMao } from './helpers.js';
import { JOGADORES, comBaralho, maosCompletas, BARALHO_TURNO, BARALHO_RODIZIO, BARALHO_J3_VENCE, BARALHO_EMPATE_1A, BARALHO_EMPATE_2A, BARALHO_EMPATE_3A, BARALHO_TRES_EMPATES, BARALHO_IGUAIS_NA_DUPLA, BARALHO_DOIS_EMPATES, BARALHO_UM_A_UM, BARALHO_EMPATE_NA_MAO_2 } from "./cenarios/vaza.js";
import { conferir } from "./support/verificacoes.js";
import { iniciarPartida } from "./partidas.js";
describe("Truco paulista \u2014 vaza", () => {
  test('TC-TR-09 só joga quem tem a vez', async () => {
    const user = await comBaralho(BARALHO_TURNO);
    conferir.texto(screen.getByTestId('vez'), /^J1$/);
    await jogar(user, 'J2', '2O'); // fora da vez
    conferir.quantidade(screen.getByTestId('mesa').children, 0);
    conferir.quantidade(cartasNaMao('J2'), 3);
    conferir.texto(screen.getByTestId('vez'), /^J1$/);
  });
  test('TC-TR-10 ordem de jogada: J1 → J2 → J3 → J4', async () => {
    const user = await comBaralho(BARALHO_TURNO);
    await jogar(user, 'J1', '3O');
    conferir.texto(screen.getByTestId('vez'), /^J2$/);
    await jogar(user, 'J2', '2O');
    conferir.texto(screen.getByTestId('vez'), /^J3$/);
    await jogar(user, 'J3', 'AO');
    conferir.texto(screen.getByTestId('vez'), /^J4$/);
  });
  test('TC-TR-29 só a mão do jogador da vez fica virada para cima', async () => {
    const user = await comBaralho(BARALHO_TURNO);
    const faces = () => Object.fromEntries(JOGADORES.map(j => [j, cartasNaMao(j).map(c => c.getAttribute('data-face'))]));
    const cima = n => Array(n).fill('cima');
    const baixo = n => Array(n).fill('baixo');
    expect(faces()).toEqual({
      J1: cima(3),
      J2: baixo(3),
      J3: baixo(3),
      J4: baixo(3)
    });
    await jogar(user, 'J1', '3O');
    expect(faces()).toEqual({
      J1: baixo(2),
      J2: cima(3),
      J3: baixo(3),
      J4: baixo(3)
    });
  });

  // Duas mãos fixas (26 cartas). Mão 1 (começa J1): Nós vence as 2 vazas.
  // Mão 2 (pelo rodízio, começa J2): Eles vence as 2 vazas. A mão 3 deve começar com J3.

  test('TC-TR-37 rodízio: cada mão começa com o próximo jogador', async () => {
    const user = await comBaralho(BARALHO_RODIZIO);
    conferir.texto(screen.getByTestId('vez'), /^J1$/);
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
    conferir.texto(screen.getByTestId('vez'), /^J2$/); // mão 2
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
    conferir.texto(screen.getByTestId('placar-eles'), /^1$/);
    conferir.texto(screen.getByTestId('vez'), /^J3$/); // mão 3
  });

  // 1ª vaza: o 3C de J3 é a maior. 2ª vaza: o 3P de J3 de novo → Nós vence 2 vazas.

  test('TC-TR-13 quem vence a vaza começa a próxima; duas vazas encerram a mão', async () => {
    const user = await comBaralho(BARALHO_J3_VENCE);
    await jogarVaza(user, {
      J1: '6E',
      J2: '7C',
      J3: '3C',
      J4: 'QE'
    });
    conferir.texto(screen.getByTestId('vaza-1'), 'Nós');
    conferir.texto(screen.getByTestId('vez'), /^J3$/);
    await jogarVaza(user, {
      J3: '3P',
      J4: 'JE',
      J1: '2E',
      J2: '6C'
    });
    conferir.texto(screen.getByTestId('placar-nos'), /^1$/);
    conferir.texto(screen.getByTestId('placar-eles'), /^0$/);
    maosCompletas(); // a 3ª vaza não foi jogada: já é a mão seguinte
  });

  // 1ª vaza: 3O (Nós) × 3E (Eles) são as maiores → empate. 2ª vaza: o AP de J2 vence.

  test('TC-TR-11 empate na 1ª vaza: quem vence a 2ª leva a mão', async () => {
    const user = await comBaralho(BARALHO_EMPATE_1A);
    await jogarVaza(user, {
      J1: '3O',
      J2: '3E',
      J3: '6P',
      J4: 'QE'
    });
    conferir.texto(screen.getByTestId('vaza-1'), 'Empate');
    await jogarVaza(user, {
      J1: '6E',
      J2: 'AP',
      J3: '7P',
      J4: 'KE'
    });
    conferir.texto(screen.getByTestId('placar-eles'), /^1$/);
    conferir.texto(screen.getByTestId('placar-nos'), /^0$/);
  });

  // 1ª vaza: 3O de J1 vence. 2ª vaza: 2E (Eles, sai antes) × 2O (Nós, sai depois) → empate.
  // A ordem importa: um jogo que desempatasse pela 1ª ou pela última carta jogada erraria aqui.

  test('TC-TR-12 vence a 1ª e empata a 2ª: leva quem venceu a 1ª', async () => {
    const user = await comBaralho(BARALHO_EMPATE_2A);
    await jogarVaza(user, {
      J1: '3O',
      J2: '7C',
      J3: 'QP',
      J4: 'QE'
    });
    conferir.texto(screen.getByTestId('vaza-1'), 'Nós');
    await jogarVaza(user, {
      J1: '6E',
      J2: '2E',
      J3: '2O',
      J4: 'KE'
    });
    conferir.texto(screen.getByTestId('placar-nos'), /^1$/);
    conferir.texto(screen.getByTestId('placar-eles'), /^0$/);
    maosCompletas(); // a 3ª vaza não é jogada
  });

  // 1ª: 3O (Nós) vence · 2ª: AP (Eles) vence · 3ª: 2O (Nós) × 2E (Eles) → empate.

  test('TC-TR-14 1ª Nós, 2ª Eles, 3ª empata: leva quem venceu a 1ª', async () => {
    const user = await comBaralho(BARALHO_EMPATE_3A);
    await jogarVaza(user, {
      J1: '3O',
      J2: '7C',
      J3: 'QP',
      J4: 'QE'
    });
    await jogarVaza(user, {
      J1: '6E',
      J2: 'AP',
      J3: '7P',
      J4: 'KE'
    });
    await jogarVaza(user, {
      J1: '2O',
      J2: '2E',
      J3: 'JE',
      J4: '6P'
    });
    conferir.texto(screen.getByTestId('placar-nos'), /^1$/);
    conferir.texto(screen.getByTestId('placar-eles'), /^0$/);
  });

  // As três vazas empatam: 3O × 3E, 2O × 2E, AO × AE (J3 e J4 jogam cartas menores).

  test('TC-TR-15 três empates: ninguém pontua', async () => {
    const user = await comBaralho(BARALHO_TRES_EMPATES);
    await jogarVaza(user, {
      J1: '3O',
      J2: '3E',
      J3: '4P',
      J4: '4C'
    });
    await jogarVaza(user, {
      J1: '2O',
      J2: '2E',
      J3: '6P',
      J4: '6C'
    });
    await jogarVaza(user, {
      J1: 'AO',
      J2: 'AE',
      J3: '7P',
      J4: '7C'
    });
    conferir.texto(screen.getByTestId('placar-nos'), /^0$/);
    conferir.texto(screen.getByTestId('placar-eles'), /^0$/);
    maosCompletas(); // nova mão distribuída
  });

  // Os dois 3 são da dupla Nós (J1 e J3): não é empate, porque a maior de Eles é um 2.

  test('TC-TR-32 cartas iguais na mesma dupla não empatam', async () => {
    const user = await comBaralho(BARALHO_IGUAIS_NA_DUPLA);
    await jogarVaza(user, {
      J1: '3O',
      J2: '2O',
      J3: '3E',
      J4: '2E'
    });
    conferir.texto(screen.getByTestId('vaza-1'), 'Nós');
  });

  // 1ª: 3O × 3E (empate) · 2ª: 2O × 2E (empate) · 3ª: o AE de J2 vence.

  test('TC-TR-33 1ª e 2ª empatam: a 3ª decide', async () => {
    const user = await comBaralho(BARALHO_DOIS_EMPATES);
    await jogarVaza(user, {
      J1: '3O',
      J2: '3E',
      J3: '4P',
      J4: '4C'
    });
    await jogarVaza(user, {
      J1: '2O',
      J2: '2E',
      J3: '6P',
      J4: '6C'
    });
    await jogarVaza(user, {
      J1: 'QE',
      J2: 'AE',
      J3: '7P',
      J4: 'KC'
    });
    conferir.texto(screen.getByTestId('placar-eles'), /^1$/);
    conferir.texto(screen.getByTestId('placar-nos'), /^0$/);
  });

  // 1ª: 3O (Nós) · 2ª: AP (Eles) · 3ª: 2E (Eles).

  test('TC-TR-34 1-1: a 3ª vaza decide', async () => {
    const user = await comBaralho(BARALHO_UM_A_UM);
    await jogarVaza(user, {
      J1: '3O',
      J2: '7C',
      J3: 'QP',
      J4: 'QE'
    });
    await jogarVaza(user, {
      J1: '6E',
      J2: 'AP',
      J3: '7P',
      J4: 'KE'
    });
    await jogarVaza(user, {
      J1: '7E',
      J2: '2E',
      J3: 'JE',
      J4: '6P'
    });
    conferir.texto(screen.getByTestId('placar-eles'), /^1$/);
    conferir.texto(screen.getByTestId('placar-nos'), /^0$/);
  });

  // Mão 1 igual à do TC-TR-37 (Nós vence). A mão 2 começa com J2 (rodízio) e a 1ª vaza empata
  // com as maiores cartas jogadas por J3 e J4: começa a próxima quem começou a vaza empatada, J2.

  test('TC-TR-38 depois de um empate, começa quem começou a vaza empatada', async () => {
    const user = await comBaralho(BARALHO_EMPATE_NA_MAO_2);
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
    }); // fim da mão 1
    conferir.texto(screen.getByTestId('vez'), /^J2$/);
    await jogarVaza(user, {
      J2: '6C',
      J3: '3O',
      J4: '3E',
      J1: '7E'
    }); // 3O × 3E
    conferir.texto(screen.getByTestId('vaza-1'), 'Empate');
    conferir.texto(screen.getByTestId('vez'), /^J2$/);
  });
});
