import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { categoria } from '../db/schemas/categoria.js';

const TIPOS = ['entrada', 'saida'];

function lerId(param) {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

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
    const id = lerId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

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
    const { nome, tipo } = req.body ?? {};

    if (!nome?.trim() || !TIPOS.includes(tipo)) {
      return res
        .status(400)
        .json({ erro: "Informe 'nome' e 'tipo' ('entrada' ou 'saida')" });
    }

    const [nova] = await db
      .insert(categoria)
      .values({ nome: nome.trim(), tipo })
      .returning();

    res.status(201).location(`/categorias/${nova.id}`).json(nova);
  } catch (err) {
    next(err);
  }
}

// PATCH /categorias/:id
export async function atualizar(req, res, next) {
  try {
    const id = lerId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const { nome, tipo } = req.body ?? {};
    const dados = {};

    if (nome !== undefined) {
      if (!nome.trim()) return res.status(400).json({ erro: 'Nome inválido' });
      dados.nome = nome.trim();
    }
    if (tipo !== undefined) {
      if (!TIPOS.includes(tipo)) {
        return res.status(400).json({ erro: "Tipo deve ser 'entrada' ou 'saida'" });
      }
      dados.tipo = tipo;
    }
    if (Object.keys(dados).length === 0) {
      return res.status(400).json({ erro: 'Nenhum dado para atualizar' });
    }

    const [atualizada] = await db
      .update(categoria)
      .set(dados)
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
    const id = lerId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

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