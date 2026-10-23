import { z } from 'zod';
import { email, senha, texto, algumCampo, MSG_NENHUM_CAMPO } from './comum.js';

const base = z.object({
  nome: texto('nome', 120),
  email,
  senha,
});

export const criarUsuario = base;
export const atualizarUsuario = base.partial().refine(algumCampo, MSG_NENHUM_CAMPO);