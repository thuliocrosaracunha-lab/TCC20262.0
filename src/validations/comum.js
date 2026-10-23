import { z } from 'zod';

export const TIPOS = ['entrada', 'saida'];

export const id = z.coerce
  .number({ error: 'ID inválido' })
  .int({ error: 'ID inválido' })
  .positive({ error: 'ID inválido' });

export const idParams = z.object({ id });

export const data = z.iso.date({ error: 'Data inválida (use AAAA-MM-DD)' });

// converte para string com 2 casas ('150.00'), formato do numeric(12, 2)
export const valor = z.coerce
  .number({ error: 'Valor deve ser um número' })
  .positive({ error: 'Valor deve ser maior que zero' })
  .max(9_999_999_999.99, { error: 'Valor acima do permitido' })
  .transform((n) => n.toFixed(2));

export const email = z
  .string({ error: 'Informe o e-mail' })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'E-mail inválido' }));

// máximo de 72: limite do bcrypt
export const senha = z
  .string({ error: 'Informe a senha' })
  .min(6, { error: 'A senha deve ter pelo menos 6 caracteres' })
  .max(72, { error: 'A senha deve ter no máximo 72 caracteres' });

export const tipo = z.enum(TIPOS, { error: "Tipo deve ser 'entrada' ou 'saida'" });

export function texto(campo, max) {
  return z
    .string({ error: `Informe o campo '${campo}'` })
    .trim()
    .min(1, { error: `Informe o campo '${campo}'` })
    .max(max, { error: `'${campo}' deve ter no máximo ${max} caracteres` });
}

// usado nos PATCH: exige pelo menos um campo
export const algumCampo = (obj) => Object.values(obj).some((v) => v !== undefined);
export const MSG_NENHUM_CAMPO = { error: 'Nenhum dado para atualizar' };