
const { pgTable, serial, varchar } = require('drizzle-orm/pg-core');

const categoria = pgTable('categoria', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 80 }).notNull(),
  tipo: varchar('tipo', { length: 10 }).notNull(), // ex: 'entrada' | 'saida'
});

module.exports = { categoria };