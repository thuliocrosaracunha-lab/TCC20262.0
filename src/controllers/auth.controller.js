import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { usuario } from '../db/schemas/usuario.js';
import { compararSenha, gerarToken } from '../auth/auth.service.js';

// POST /auth/login
export async function login(req, res, next) {
  try {
    const { email, senha } = req.body ?? {};
    const emailNormalizado = email?.trim().toLowerCase();

    if (!emailNormalizado || !senha) {
      return res.status(400).json({ erro: 'Informe e-mail e senha' });
    }

    const [encontrado] = await db
      .select()
      .from(usuario)
      .where(eq(usuario.email, emailNormalizado));

    const credenciaisValidas =
      encontrado && (await compararSenha(senha, encontrado.senha));

    if (!credenciaisValidas) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos' });
    }

    res.json({
      token: gerarToken(encontrado.id),
      usuario: {
        id: encontrado.id,
        nome: encontrado.nome,
        email: encontrado.email,
      },
    });
  } catch (err) {
    next(err);
  }
}