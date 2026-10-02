const { pgTable, serial, varchar } = require('drizzle-orm/pg-core');

const usuario = pgTable('usuario', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 120 }).notNull().unique(),
  email: varchar('email', { length: 160 }).notNull().unique(),
  senha: varchar('senha', { length: 255 }).notNull(),
});

module.exports = { usuario };
