const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VALOR_MAXIMO = 9_999_999_999.99; // limite do numeric(12, 2)

export function lerId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function dataValida(valor) {
  return (
    typeof valor === 'string' &&
    DATA_REGEX.test(valor) &&
    !Number.isNaN(Date.parse(valor))
  );
}

// retorna o valor como string com 2 casas ('150.00') ou null se inválido
export function lerValor(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero <= 0 || numero > VALOR_MAXIMO) return null;
  return numero.toFixed(2);
}

export const arredondar = (n) => Math.round(n * 100) / 100;

// data de hoje no fuso de Brasília, no formato AAAA-MM-DD
export function hojeISO() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}