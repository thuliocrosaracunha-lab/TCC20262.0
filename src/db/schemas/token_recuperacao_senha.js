import { pgTable, serial, varchar, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { usuario } from './usuario.js';

export const tokenRecuperacaoSenha = pgTable('token_recuperacao_senha', {
  id: serial('id').primaryKey(),
  usuarioId: integer('usuario_id')
    .notNull()
    .references(() => usuario.id),
  token: varchar('token', { length: 255 }).notNull(),
  expiraEm: timestamp('expira_em').notNull(),
  usado: boolean('usado').notNull().default(false),
});
