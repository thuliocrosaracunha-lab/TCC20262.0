import { z } from 'zod';
import { id, data, valor, tipo, algumCampo, MSG_NENHUM_CAMPO } from './comum.js';

// texto vazio vira null; null limpa a descrição no PATCH
const descricao = z
  .string({ error: "'descricao' deve ser texto" })
  .trim()
  .max(255, { error: "'descricao' deve ter no máximo 255 caracteres" })
  .transform((v) => v || null)
  .nullable()
  .optional();

const base = z.object({
  categoriaId: id,
  valor,
  data,
  descricao,
});

export const criarMovimentacao = base;
export const atualizarMovimentacao = base.partial().refine(algumCampo, MSG_NENHUM_CAMPO);

// RF013 - filtros da listagem e do resumo
export const filtrosMovimentacao = z
  .object({
    inicio: data.optional(),
    fim: data.optional(),
    categoriaId: id.optional(),
    tipo: tipo.optional(),
  })
  .refine((q) => !q.inicio || !q.fim || q.inicio <= q.fim, {
    error: "'inicio' deve ser anterior ou igual a 'fim'",
    path: ['inicio'],
  });