import '@testing-library/jest-dom';

// Vocabulário das verificações: mantém os matchers, a negação e a avaliação preguiçosa de cada caso.
function verificacoes(negativo = false) {
  const avaliar = recebido => negativo ? expect(recebido).not : expect(recebido);
  return {
    texto: (recebido, ...esperado) => avaliar(recebido).toHaveTextContent(...esperado),
    atributo: (recebido, ...esperado) => avaliar(recebido).toHaveAttribute(...esperado),
    quantidade: (recebido, ...esperado) => avaliar(recebido).toHaveLength(...esperado),
    visivel: recebido => avaliar(recebido).toBeVisible(),
    habilitado: recebido => avaliar(recebido).toBeEnabled(),
    desabilitado: recebido => avaliar(recebido).toBeDisabled(),
    presente: recebido => avaliar(recebido).toBeInTheDocument(),
  };
}

export const conferir = Object.freeze({ ...verificacoes(), nao: Object.freeze(verificacoes(true)) });
