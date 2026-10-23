import { and, eq, gt } from 'drizzle-orm';
import { db } from '../db/index.js';
import { usuario } from '../db/schemas/usuario.js';
import { tokenRecuperacaoSenha } from '../db/schemas/token_recuperacao_senha.js';
import {
  compararSenha,
  gerarToken,
  gerarHash,
  gerarTokenRecuperacao,
  hashTokenRecuperacao,
} from '../auth/auth.service.js';
import { enviarEmailRecuperacao } from '../services/email.service.js';

const MINUTOS_VALIDADE = 30;
const MENSAGEM_RECUPERACAO =
  'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.';

// POST /auth/login — RF002
export async function login(req, res, next) {
  try {
    const { email, senha } = req.validado.body;

    const [encontrado] = await db.select().from(usuario).where(eq(usuario.email, email));

    const credenciaisValidas =
      encontrado && (await compararSenha(senha, encontrado.senha));

    if (!credenciaisValidas) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos' });
    }

    res.json({
      token: gerarToken(encontrado.id),
      usuario: { id: encontrado.id, nome: encontrado.nome, email: encontrado.email },
    });
  } catch (err) {
    next(err);
  }
}

// POST /auth/recuperacao-senha — RF004 (passo 1)
export async function solicitarRecuperacao(req, res, next) {
  try {
    const { email } = req.validado.body;

    const [encontrado] = await db
      .select({ id: usuario.id, nome: usuario.nome, email: usuario.email })
      .from(usuario)
      .where(eq(usuario.email, email));

    if (encontrado) {
      // invalida pedidos anteriores ainda não usados
      await db
        .update(tokenRecuperacaoSenha)
        .set({ usado: true })
        .where(
          and(
            eq(tokenRecuperacaoSenha.usuarioId, encontrado.id),
            eq(tokenRecuperacaoSenha.usado, false)
          )
        );

      const { token, hash } = gerarTokenRecuperacao();

      await db.insert(tokenRecuperacaoSenha).values({
        usuarioId: encontrado.id,
        token: hash,
        expiraEm: new Date(Date.now() + MINUTOS_VALIDADE * 60_000),
      });

      const urlFrontend = process.env.FRONTEND_URL ?? 'http://localhost:5173';
      const link = `${urlFrontend}/redefinir-senha?token=${token}`;

      try {
        await enviarEmailRecuperacao(encontrado.email, encontrado.nome, link);
      } catch (err) {
        console.error('Falha ao enviar e-mail de recuperação:', err);
      }
    }

    // mesma resposta exista ou não o e-mail, para não revelar quem tem conta
    res.json({ mensagem: MENSAGEM_RECUPERACAO });
  } catch (err) {
    next(err);
  }
}

// POST /auth/redefinicao-senha — RF004 (passo 2)
export async function redefinirSenha(req, res, next) {
  try {
    const { token, novaSenha } = req.validado.body;

    // marca o token como usado só se ele for válido, numa única operação
    const [valido] = await db
      .update(tokenRecuperacaoSenha)
      .set({ usado: true })
      .where(
        and(
          eq(tokenRecuperacaoSenha.token, hashTokenRecuperacao(token)),
          eq(tokenRecuperacaoSenha.usado, false),
          gt(tokenRecuperacaoSenha.expiraEm, new Date())
        )
      )
      .returning({ usuarioId: tokenRecuperacaoSenha.usuarioId });

    if (!valido) {
      return res
        .status(400)
        .json({ erro: 'Link inválido ou expirado. Solicite uma nova recuperação.' });
    }

    await db
      .update(usuario)
      .set({ senha: await gerarHash(novaSenha) })
      .where(eq(usuario.id, valido.usuarioId));

    res.json({ mensagem: 'Senha redefinida com sucesso' });
  } catch (err) {
    next(err);
  }
}