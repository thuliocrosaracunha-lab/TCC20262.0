import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { categoria } from '../db/schemas/categoria.js';

// GET /categorias
export async function listar(req, res, next) {
  try {
    const categorias = await db.select().from(categoria).orderBy(categoria.nome);
    res.json(categorias);
  } catch (err) {
    next(err);
  }
}

// GET /categorias/:id
export async function buscar(req, res, next) {
  try {
    const { id } = req.validado.params;

    const [encontrada] = await db.select().from(categoria).where(eq(categoria.id, id));
    if (!encontrada) return res.status(404).json({ erro: 'Categoria não encontrada' });

    res.json(encontrada);
  } catch (err) {
    next(err);
  }
}

// POST /categorias
export async function criar(req, res, next) {
  try {
    const [nova] = await db.insert(categoria).values(req.validado.body).returning();

    res.status(201).location(`/categorias/${nova.id}`).json(nova);
  } catch (err) {
    next(err);
  }
}

// PATCH /categorias/:id
export async function atualizar(req, res, next) {
  try {
    const { id } = req.validado.params;

    const [atualizada] = await db
      .update(categoria)
      .set(req.validado.body)
      .where(eq(categoria.id, id))
      .returning();

    if (!atualizada) return res.status(404).json({ erro: 'Categoria não encontrada' });

    res.json(atualizada);
  } catch (err) {
    next(err);
  }
}

// DELETE /categorias/:id
export async function remover(req, res, next) {
  try {
    const { id } = req.validado.params;

    const [removida] = await db
      .delete(categoria)
      .where(eq(categoria.id, id))
      .returning({ id: categoria.id });

    if (!removida) return res.status(404).json({ erro: 'Categoria não encontrada' });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}