import { abrirJogo, screen } from './helpers.js';

/** Abre a página e inicia uma mão, na mesma ordem dos casos originais. */
export async function iniciarPartida(...parametros) {
  const user = await abrirJogo(...parametros);
  await user.click(screen.getByTestId('btn-nova-partida'));
  return user;
}
