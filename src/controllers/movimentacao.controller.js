import { and, eq, gte, lte, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { movimentacao } from '../db/schemas/movimentacao.js';
import { categoria } from '../db/schemas/categoria.js';
import { arredondar } from '../utils/formatacao.js';

// formato retornado pela API: a movimentação com a categoria (e o tipo) embutida
const campos = {
  id: movimentacao.id,
  valor: movimentacao.valor,
  data: movimentacao.data,
  descricao: movimentacao.descricao,
  categoria: {
    id: categoria.id,
    nome: categoria.nome,
    tipo: categoria.tipo,
  },
};

const formatar = (m) => ({ ...m, valor: Number(m.valor) });

function consultaBase() {
  return db
    .select(campos)
    .from(movimentacao)
    .innerJoin(categoria, eq(movimentacao.categoriaId, categoria.id));
}

async function buscarDoUsuario(id, usuarioId) {
  const [encontrada] = await consultaBase().where(
    and(eq(movimentacao.id, id), eq(movimentacao.usuarioId, usuarioId))
  );
  return encontrada ? formatar(encontrada) : null;
}

async function categoriaExiste(id) {
  const [encontrada] = await db
    .select({ id: categoria.id })
    .from(categoria)
    .where(eq(categoria.id, id));
  return Boolean(encontrada);
}

// RF013 - filtros já validados pelo Zod
function montarFiltros({ inicio, fim, categoriaId, tipo }, usuarioId) {
  const condicoes = [eq(movimentacao.usuarioId, usuarioId)];

  if (inicio) condicoes.push(gte(movimentacao.data, inicio));
  if (fim) condicoes.push(lte(movimentacao.data, fim));
  if (categoriaId) condicoes.push(eq(movimentacao.categoriaId, categoriaId));
  if (tipo) condicoes.push(eq(categoria.tipo, tipo));

  return condicoes;
}

// GET /movimentacoes — RF012, RF013
export async function listar(req, res, next) {
  try {
    const condicoes = montarFiltros(req.validado.query, req.usuarioId);

    const linhas = await consultaBase()
      .where(and(...condicoes))
      .orderBy(desc(movimentacao.data), desc(movimentacao.id));

    res.json(linhas.map(formatar));
  } catch (err) {
    next(err);
  }
}

// GET /movimentacoes/:id
export async function buscar(req, res, next) {
  try {
    const encontrada = await buscarDoUsuario(req.validado.params.id, req.usuarioId);
    if (!encontrada) return res.status(404).json({ erro: 'Movimentação não encontrada' });

    res.json(encontrada);
  } catch (err) {
    next(err);
  }
}

// POST /movimentacoes — RF006, RF007
export async function criar(req, res, next) {
  try {
    const dados = req.validado.body;

    if (!(await categoriaExiste(dados.categoriaId))) {
      return res.status(400).json({ erro: 'Categoria não encontrada' });
    }

    const [nova] = await db
      .insert(movimentacao)
      .values({ ...dados, usuarioId: req.usuarioId })
      .returning({ id: movimentacao.id });

    const completa = await buscarDoUsuario(nova.id, req.usuarioId);

    res.status(201).location(`/movimentacoes/${nova.id}`).json(completa);
  } catch (err) {
    next(err);
  }
}

// PATCH /movimentacoes/:id — RF008
export async function atualizar(req, res, next) {
  try {
    const { id } = req.validado.params;
    const dados = req.validado.body;

    if (dados.categoriaId && !(await categoriaExiste(dados.categoriaId))) {
      return res.status(400).json({ erro: 'Categoria não encontrada' });
    }

    const [atualizada] = await db
      .update(movimentacao)
      .set(dados)
      .where(and(eq(movimentacao.id, id), eq(movimentacao.usuarioId, req.usuarioId)))
      .returning({ id: movimentacao.id });

    if (!atualizada) return res.status(404).json({ erro: 'Movimentação não encontrada' });

    res.json(await buscarDoUsuario(id, req.usuarioId));
  } catch (err) {
    next(err);
  }
}

// DELETE /movimentacoes/:id — RF009
export async function remover(req, res, next) {
  try {
    const { id } = req.validado.params;

    const [removida] = await db
      .delete(movimentacao)
      .where(and(eq(movimentacao.id, id), eq(movimentacao.usuarioId, req.usuarioId)))
      .returning({ id: movimentacao.id });

    if (!removida) return res.status(404).json({ erro: 'Movimentação não encontrada' });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// GET /movimentacoes/resumo — RF011, RF014, RF015
export async function resumo(req, res, next) {
  try {
    const filtros = req.validado.query;
    const condicoes = montarFiltros(filtros, req.usuarioId);

    // totais do período, agrupados por categoria (base dos gráficos)
    const porCategoria = await db
      .select({
        id: categoria.id,
        nome: categoria.nome,
        tipo: categoria.tipo,
        total: sql`coalesce(sum(${movimentacao.valor}), 0)`.mapWith(Number),
        quantidade: sql`count(*)`.mapWith(Number),
      })
      .from(movimentacao)
      .innerJoin(categoria, eq(movimentacao.categoriaId, categoria.id))
      .where(and(...condicoes))
      .groupBy(categoria.id, categoria.nome, categoria.tipo)
      .orderBy(desc(sql`sum(${movimentacao.valor})`));

    const entradas = porCategoria.filter((c) => c.tipo === 'entrada');
    const saidas = porCategoria.filter((c) => c.tipo === 'saida');

    const totalEntradas = arredondar(entradas.reduce((s, c) => s + c.total, 0));
    const totalSaidas = arredondar(saidas.reduce((s, c) => s + c.total, 0));

    // saldo atual: todas as movimentações do usuário, sem filtro
    const [geral] = await db
      .select({
        entradas: sql`coalesce(sum(case when ${categoria.tipo} = 'entrada' then ${movimentacao.valor} else 0 end), 0)`.mapWith(Number),
        saidas: sql`coalesce(sum(case when ${categoria.tipo} = 'saida' then ${movimentacao.valor} else 0 end), 0)`.mapWith(Number),
      })
      .from(movimentacao)
      .innerJoin(categoria, eq(movimentacao.categoriaId, categoria.id))
      .where(eq(movimentacao.usuarioId, req.usuarioId));

    res.json({
      saldoAtual: arredondar(geral.entradas - geral.saidas),
      periodo: {
        inicio: filtros.inicio ?? null,
        fim: filtros.fim ?? null,
        totalEntradas,
        totalSaidas,
        saldo: arredondar(totalEntradas - totalSaidas),
      },
      porCategoria: { entradas, saidas },
    });
  } catch (err) {
    next(err);
  }
}