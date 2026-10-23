import { and, eq, asc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { meta } from '../db/schemas/meta.js';
import { arredondar, hojeISO } from '../utils/formatacao.js';

// RF017 - quanto o usuário juntou no período da meta (entradas - saídas)
const acumulado = sql`(
  select coalesce(sum(case when c.tipo = 'entrada' then m.valor else -m.valor end), 0)
  from movimentacao m
  inner join categoria c on c.id = m.categoria_id
  where m.usuario_id = ${meta.usuarioId}
    and m.data between ${meta.dataInicio} and ${meta.dataFim}
)`.mapWith(Number);

const campos = {
  id: meta.id,
  nome: meta.nome,
  valorAlvo: meta.valorAlvo,
  dataInicio: meta.dataInicio,
  dataFim: meta.dataFim,
  acumulado,
};

function calcularProgresso(linha) {
  const valorAlvo = Number(linha.valorAlvo);
  const valorAcumulado = arredondar(linha.acumulado);
  const hoje = hojeISO();

  const percentual = Math.min(
    100,
    Math.max(0, arredondar((valorAcumulado / valorAlvo) * 100))
  );

  let status;
  if (valorAcumulado >= valorAlvo) status = 'concluida';
  else if (hoje < linha.dataInicio) status = 'nao_iniciada';
  else if (hoje > linha.dataFim) status = 'expirada';
  else status = 'em_andamento';

  const diasRestantes = Math.max(
    0,
    Math.ceil((Date.parse(linha.dataFim) - Date.parse(hoje)) / 86_400_000)
  );

  return {
    id: linha.id,
    nome: linha.nome,
    valorAlvo,
    dataInicio: linha.dataInicio,
    dataFim: linha.dataFim,
    progresso: {
      acumulado: valorAcumulado,
      faltam: arredondar(Math.max(0, valorAlvo - valorAcumulado)),
      percentual,
      status,
      diasRestantes,
    },
  };
}

async function buscarDoUsuario(id, usuarioId) {
  const [encontrada] = await db
    .select(campos)
    .from(meta)
    .where(and(eq(meta.id, id), eq(meta.usuarioId, usuarioId)));
  return encontrada ? calcularProgresso(encontrada) : null;
}

// GET /metas — RF017 (aceita ?status=em_andamento)
export async function listar(req, res, next) {
  try {
    const { status } = req.validado.query;

    const linhas = await db
      .select(campos)
      .from(meta)
      .where(eq(meta.usuarioId, req.usuarioId))
      .orderBy(asc(meta.dataFim), asc(meta.id));

    let metas = linhas.map(calcularProgresso);
    if (status) metas = metas.filter((m) => m.progresso.status === status);

    res.json(metas);
  } catch (err) {
    next(err);
  }
}

// GET /metas/:id — RF017
export async function buscar(req, res, next) {
  try {
    const encontrada = await buscarDoUsuario(req.validado.params.id, req.usuarioId);
    if (!encontrada) return res.status(404).json({ erro: 'Meta não encontrada' });

    res.json(encontrada);
  } catch (err) {
    next(err);
  }
}

// POST /metas — RF016
export async function criar(req, res, next) {
  try {
    const [nova] = await db
      .insert(meta)
      .values({ ...req.validado.body, usuarioId: req.usuarioId })
      .returning({ id: meta.id });

    const completa = await buscarDoUsuario(nova.id, req.usuarioId);

    res.status(201).location(`/metas/${nova.id}`).json(completa);
  } catch (err) {
    next(err);
  }
}

// PATCH /metas/:id
export async function atualizar(req, res, next) {
  try {
    const { id } = req.validado.params;
    const dados = req.validado.body;

    const [atual] = await db
      .select({ dataInicio: meta.dataInicio, dataFim: meta.dataFim })
      .from(meta)
      .where(and(eq(meta.id, id), eq(meta.usuarioId, req.usuarioId)));

    if (!atual) return res.status(404).json({ erro: 'Meta não encontrada' });

    // valida o período combinando o que veio com o que já estava salvo
    const inicioFinal = dados.dataInicio ?? atual.dataInicio;
    const fimFinal = dados.dataFim ?? atual.dataFim;
    if (inicioFinal > fimFinal) {
      return res
        .status(400)
        .json({ erro: "'dataInicio' deve ser anterior ou igual a 'dataFim'" });
    }

    await db
      .update(meta)
      .set(dados)
      .where(and(eq(meta.id, id), eq(meta.usuarioId, req.usuarioId)));

    res.json(await buscarDoUsuario(id, req.usuarioId));
  } catch (err) {
    next(err);
  }
}

// DELETE /metas/:id
export async function remover(req, res, next) {
  try {
    const { id } = req.validado.params;

    const [removida] = await db
      .delete(meta)
      .where(and(eq(meta.id, id), eq(meta.usuarioId, req.usuarioId)))
      .returning({ id: meta.id });

    if (!removida) return res.status(404).json({ erro: 'Meta não encontrada' });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}