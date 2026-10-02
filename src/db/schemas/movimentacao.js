
const { pgTable, serial, varchar, numeric, date, integer } = require('drizzle-orm/pg-core');
const { categoria } = require('./categoria');

const movimentacao = pgTable('movimentacao', {
  id: serial('id').primaryKey(),
  categoriaId: integer('categoria_id')
    .notNull()
    .references(() => categoria.id),
  tipo: varchar('tipo', { length: 10 }).notNull(),
  valor: numeric('valor', { precision: 12, scale: 2 }).notNull(),
  data: date('data').notNull(),
  descricao: varchar('descricao', { length: 255 }),
});

module.exports = { movimentacao };