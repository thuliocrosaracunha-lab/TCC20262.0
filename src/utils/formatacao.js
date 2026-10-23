export const arredondar = (n) => Math.round(n * 100) / 100;

// data de hoje no fuso de Brasília, no formato AAAA-MM-DD
export function hojeISO() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}