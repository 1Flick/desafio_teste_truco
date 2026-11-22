import { criarAbertura, cliqueDireito, screen, within } from '../tests/support/interface.js';
import { abrirJogo } from '../tests/helpers.js';

test('abrirJogo mantém a API pública e monta o HTML com parâmetros', async () => {
  const user = await abrirJogo({ cenario: 'a b', simbolo: '&' });
  expect(user.click).toEqual(expect.any(Function));
  expect(new URLSearchParams(window.location.search).get('cenario')).toBe('a b');
  expect(new URLSearchParams(window.location.search).get('simbolo')).toBe('&');
  expect(document.body.querySelector('script[src="js/main.js"]')).not.toBeNull();
});
test('duas aberturas restauram a página e recarregam o jogo', async () => {
  const carregar = jest.fn(async () => {});
  const abrir = criarAbertura(carregar);
  await abrir({ primeiro: '1' });
  document.body.innerHTML = '<p data-testid="residuo">resíduo</p>';
  await abrir();
  expect(carregar).toHaveBeenCalledTimes(2);
  expect(screen.queryByTestId('residuo')).toBeNull();
  expect(window.location.search).toBe('');
});
test('repassa opções do user-event e simula clique direito', async () => {
  const advanceTimers = jest.fn(jest.advanceTimersByTime);
  jest.useFakeTimers();
  try {
    const user = await criarAbertura(async () => {})({}, { advanceTimers });
    document.body.innerHTML = '<button data-testid="alvo">Alvo</button>';
    const alvo = within(document.body).getByTestId('alvo');
    const menu = jest.fn();
    alvo.addEventListener('contextmenu', menu);
    await cliqueDireito(user, alvo);
    expect(menu).toHaveBeenCalledTimes(1);
    expect(advanceTimers).toHaveBeenCalled();
  } finally {
    jest.useRealTimers();
  }
});
