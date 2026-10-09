import { db } from '../db/index.js';
import { categoria } from '../db/schemas/categoria.js';

export async function listarCategorias(req, res, next) {
  try {
    const categorias = await db.select().from(categoria);
    res.json(categorias);
  } catch (err) {
    next(err);
  }
}

export async function criarCategoria(req, res, next) {
  try {
    const { nome, tipo } = req.body;

    if (!nome || !['entrada', 'saida'].includes(tipo)) {
      return res
        .status(400)
        .json({ erro: "Informe 'nome' e 'tipo' ('entrada' ou 'saida')" });
    }

    const [nova] = await db.insert(categoria).values({ nome, tipo }).returning();
    res.status(201).json(nova);
  } catch (err) {
    next(err);
  }
}