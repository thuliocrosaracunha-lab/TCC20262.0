import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const categoria = pgTable('categoria', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 80 }).notNull(),
  tipo: varchar('tipo', { length: 10 }).notNull(), // ex: 'entrada' | 'saida'
});
