const { relations } = require('drizzle-orm');
const { usuario } = require('./usuario');
const { tokenRecuperacaoSenha } = require('./token_recuperacao_senha');
const { meta } = require('./meta');
const { categoria } = require('./categoria');
const { movimentacao } = require('./movimentacao');

const usuarioRelations = relations(usuario, ({ many }) => ({
  tokensRecuperacao: many(tokenRecuperacaoSenha),
  metas: many(meta),
}));

const tokenRecuperacaoSenhaRelations = relations(tokenRecuperacaoSenha, ({ one }) => ({
  usuario: one(usuario, {
    fields: [tokenRecuperacaoSenha.usuarioId],
    references: [usuario.id],
  }),
}));

const metaRelations = relations(meta, ({ one }) => ({
  usuario: one(usuario, {
    fields: [meta.usuarioId],
    references: [usuario.id],
  }),
}));

const categoriaRelations = relations(categoria, ({ many }) => ({
  movimentacoes: many(movimentacao),
}));

const movimentacaoRelations = relations(movimentacao, ({ one }) => ({
  categoria: one(categoria, {
    fields: [movimentacao.categoriaId],
    references: [categoria.id],
  }),
}));

module.exports = {
  usuarioRelations,
  tokenRecuperacaoSenhaRelations,
  metaRelations,
  categoriaRelations,
  movimentacaoRelations,
};