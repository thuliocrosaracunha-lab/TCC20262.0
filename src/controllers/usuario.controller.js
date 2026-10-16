import { eq, and, ne } from 'drizzle-orm';
import { db } from '../db/index.js';
import { usuario } from '../db/schemas/usuario.js';
import { gerarHash } from '../auth/auth.service.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MINIMA = 6;

// colunas retornadas pela API (nunca a senha)
const camposPublicos = {
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email,
};

async function emailEmUso(email, ignorarId) {
  const condicao = ignorarId
    ? and(eq(usuario.email, email), ne(usuario.id, ignorarId))
    : eq(usuario.email, email);

  const [existente] = await db.select({ id: usuario.id }).from(usuario).where(condicao);
  return Boolean(existente);
}

// POST /usuarios — RF001
export async function criar(req, res, next) {
  try {
    const { nome, email, senha } = req.body ?? {};
    const nomeLimpo = nome?.trim();
    const emailNormalizado = email?.trim().toLowerCase();

    if (!nomeLimpo || !emailNormalizado || !senha) {
      return res.status(400).json({ erro: 'Informe nome, e-mail e senha' });
    }
    if (!EMAIL_REGEX.test(emailNormalizado)) {
      return res.status(400).json({ erro: 'E-mail inválido' });
    }
    if (senha.length < SENHA_MINIMA) {
      return res
        .status(400)
        .json({ erro: `A senha deve ter pelo menos ${SENHA_MINIMA} caracteres` });
    }
    if (await emailEmUso(emailNormalizado)) {
      return res.status(409).json({ erro: 'E-mail já cadastrado' });
    }

    const [novo] = await db
      .insert(usuario)
      .values({
        nome: nomeLimpo,
        email: emailNormalizado,
        senha: await gerarHash(senha),
      })
      .returning(camposPublicos);

    res.status(201).location(`/usuarios/${novo.id}`).json(novo);
  } catch (err) {
    next(err);
  }
}

// GET /usuarios/:id — RF005
export async function buscar(req, res, next) {
  try {
    const [encontrado] = await db
      .select(camposPublicos)
      .from(usuario)
      .where(eq(usuario.id, req.usuarioId));

    if (!encontrado) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json(encontrado);
  } catch (err) {
    next(err);
  }
}

// PATCH /usuarios/:id — RF005
export async function atualizar(req, res, next) {
  try {
    const { nome, email, senha } = req.body ?? {};
    const dados = {};

    if (nome !== undefined) {
      if (!nome.trim()) return res.status(400).json({ erro: 'Nome inválido' });
      dados.nome = nome.trim();
    }

    if (email !== undefined) {
      const emailNormalizado = email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(emailNormalizado)) {
        return res.status(400).json({ erro: 'E-mail inválido' });
      }
      if (await emailEmUso(emailNormalizado, req.usuarioId)) {
        return res.status(409).json({ erro: 'E-mail já cadastrado' });
      }
      dados.email = emailNormalizado;
    }

    if (senha !== undefined) {
      if (senha.length < SENHA_MINIMA) {
        return res
          .status(400)
          .json({ erro: `A senha deve ter pelo menos ${SENHA_MINIMA} caracteres` });
      }
      dados.senha = await gerarHash(senha);
    }

    if (Object.keys(dados).length === 0) {
      return res.status(400).json({ erro: 'Nenhum dado para atualizar' });
    }

    const [atualizado] = await db
      .update(usuario)
      .set(dados)
      .where(eq(usuario.id, req.usuarioId))
      .returning(camposPublicos);

    if (!atualizado) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json(atualizado);
  } catch (err) {
    next(err);
  }
}

// DELETE /usuarios/:id
export async function remover(req, res, next) {
  try {
    const [removido] = await db
      .delete(usuario)
      .where(eq(usuario.id, req.usuarioId))
      .returning({ id: usuario.id });

    if (!removido) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
