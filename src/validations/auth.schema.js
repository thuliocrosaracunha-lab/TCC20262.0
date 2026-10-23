import { z } from 'zod';
import { email, senha } from './comum.js';

export const login = z.object({
  email,
  senha: z.string({ error: 'Informe a senha' }).min(1, { error: 'Informe a senha' }),
});

export const recuperacaoSenha = z.object({ email });

export const redefinicaoSenha = z.object({
  token: z
    .string({ error: 'Informe o token' })
    .regex(/^[a-f0-9]{64}$/, { error: 'Token inválido' }),
  novaSenha: senha,
});