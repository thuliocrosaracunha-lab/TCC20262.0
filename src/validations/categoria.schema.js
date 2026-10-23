import { tipo, texto, algumCampo, MSG_NENHUM_CAMPO } from './comum.js';
import { z } from 'zod';

const base = z.object({
  nome: texto('nome', 80),
  tipo,
});

export const criarCategoria = base;
export const atualizarCategoria = base.partial().refine(algumCampo, MSG_NENHUM_CAMPO);