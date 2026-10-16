import { pgTable, serial, numeric, date, integer } from 'drizzle-orm/pg-core';
import { usuario } from './usuario.js';

export const meta = pgTable('meta', {
  id: serial('id').primaryKey(),
  usuarioId: integer('usuario_id')
    .notNull()
    .references(() => usuario.id, { onDelete: 'cascade' }),
  valorAlvo: numeric('valor_alvo', { precision: 12, scale: 2 }).notNull(),
  dataInicio: date('data_inicio').notNull(),
  dataFim: date('data_fim').notNull(),
});
