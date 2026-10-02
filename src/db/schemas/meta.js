const { pgTable, serial, numeric, date, integer } = require('drizzle-orm/pg-core');
const { usuario } = require('./usuario');

const meta = pgTable('meta', {
  id: serial('id').primaryKey(),
  usuarioId: integer('usuario_id')
    .notNull()
    .references(() => usuario.id),
  valorAlvo: numeric('valor_alvo', { precision: 12, scale: 2 }).notNull(),
  dataInicio: date('data_inicio').notNull(),
  dataFim: date('data_fim').notNull(),
});

module.exports = { meta };