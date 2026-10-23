import { z } from 'zod';
import { data, valor, texto, algumCampo, MSG_NENHUM_CAMPO } from './comum.js';

export const STATUS_META = ['nao_iniciada', 'em_andamento', 'concluida', 'expirada'];

const base = z.object({
  nome: texto('nome', 80),
  valorAlvo: valor,
  dataInicio: data,
  dataFim: data,
});

const periodoValido = (m) => !m.dataInicio || !m.dataFim || m.dataInicio <= m.dataFim;
const MSG_PERIODO = {
  error: "'dataInicio' deve ser anterior ou igual a 'dataFim'",
  path: ['dataFim'],
};

export const criarMeta = base.refine(periodoValido, MSG_PERIODO);

export const atualizarMeta = base
  .partial()
  .refine(algumCampo, MSG_NENHUM_CAMPO)
  .refine(periodoValido, MSG_PERIODO);

export const filtrosMeta = z.object({
  status: z
    .enum(STATUS_META, { error: `'status' deve ser: ${STATUS_META.join(', ')}` })
    .optional(),
});