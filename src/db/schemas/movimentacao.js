import { pgTable, serial, varchar, numeric, date, integer } from 'drizzle-orm/pg-core';
import { usuario } from './usuario.js';
import { categoria } from './categoria.js';

export const movimentacao = pgTable('movimentacao', {
  id: serial('id').primaryKey(),
  usuarioId: integer('usuario_id')
    .notNull()
    .references(() => usuario.id, { onDelete: 'cascade' }),
  categoriaId: integer('categoria_id')
    .notNull()
    .references(() => categoria.id),
  valor: numeric('valor', { precision: 12, scale: 2 }).notNull(),
  data: date('data').notNull(),
  descricao: varchar('descricao', { length: 255 }),
});