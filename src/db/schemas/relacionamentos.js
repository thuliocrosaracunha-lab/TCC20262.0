import { relations } from 'drizzle-orm';
import { usuario } from './usuario.js';
import { tokenRecuperacaoSenha } from './token_recuperacao_senha.js';
import { meta } from './meta.js';
import { categoria } from './categoria.js';
import { movimentacao } from './movimentacao.js';

export const usuarioRelations = relations(usuario, ({ many }) => ({
  tokensRecuperacao: many(tokenRecuperacaoSenha),
  metas: many(meta),
}));

export const tokenRecuperacaoSenhaRelations = relations(tokenRecuperacaoSenha, ({ one }) => ({
  usuario: one(usuario, {
    fields: [tokenRecuperacaoSenha.usuarioId],
    references: [usuario.id],
  }),
}));

export const metaRelations = relations(meta, ({ one }) => ({
  usuario: one(usuario, {
    fields: [meta.usuarioId],
    references: [usuario.id],
  }),
}));

export const categoriaRelations = relations(categoria, ({ many }) => ({
  movimentacoes: many(movimentacao),
}));

export const movimentacaoRelations = relations(movimentacao, ({ one }) => ({
  categoria: one(categoria, {
    fields: [movimentacao.categoriaId],
    references: [categoria.id],
  }),
}));
