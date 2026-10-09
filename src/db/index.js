
import 'dotenv/config';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as usuario from './schemas/usuario.js';
import * as tokenRecuperacaoSenha from './schemas/token_recuperacao_senha.js';
import * as meta from './schemas/meta.js';
import * as categoria from './schemas/categoria.js';
import * as movimentacao from './schemas/movimentacao.js';
import * as relacionamentos from './schemas/relacionamentos.js';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, {
  schema: {
    ...usuario,
    ...tokenRecuperacaoSenha,
    ...meta,
    ...categoria,
    ...movimentacao,
    ...relacionamentos,
  },
});