// API dos cenários; ciclo de abertura compartilhado em support/interface.js.
import { criarAbertura, screen, within } from './support/interface.js';
export { cliqueDireito, screen, within } from './support/interface.js';

export const abrirJogo = criarAbertura(() => import('../js/main.js'));


/** Monta o parâmetro `baralho`: 3 cartas de J1, J2, J3, J4 e a vira. */
export const montarBaralho = (j1, j2, j3, j4, vira) => [...j1, ...j2, ...j3, ...j4, vira].join(',');

/** Cartas na mão de 'J1'…'J4'. */
export const cartasNaMao = (jogador) => {
  const j = jogador.toLowerCase();
  return within(screen.getByTestId(`mao-${j}`)).queryAllByTestId(new RegExp(`^carta-${j}-\\d$`));
};

// Matcher próprio: falha como qualquer expect(), mas com uma mensagem que explica o cenário.
expect.extend({
  toExistir(recebido, mensagem) {
    return { pass: recebido !== undefined, message: () => `expect(valor).toExistir()\n\n${mensagem}` };
  },
});
const exigir = (valor, mensagem) => expect(valor).toExistir(mensagem);

/** O jogador clica na carta de código `codigo` (ex.: '3P') da própria mão. */
export async function jogar(user, jogador, codigo) {
  const carta = cartasNaMao(jogador).find((c) => c.getAttribute('data-carta') === codigo);
  exigir(carta, `a carta ${codigo} não está na mão de ${jogador}`);
  await user.click(carta);
}

/**
 * Joga uma vaza inteira: lê `vez` antes de cada jogada e joga a carta combinada para aquele jogador.
 * Assim o teste não depende de quem começa a vaza. Ex.: { J1: '3O', J2: '2O', J3: 'AO', J4: 'KO' }
 */
export async function jogarVaza(user, cartas) {
  for (let i = 0; i < 4; i++) {
    const vez = screen.getByTestId('vez').textContent.trim();
    exigir(cartas[vez], `é a vez de "${vez}", mas a vaza não tem carta para ele`);
    await jogar(user, vez, cartas[vez]);
  }
}
