import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const EXPIRACAO_TOKEN = '1d';

function segredo() {
  const chave = process.env.JWT_SECRET;
  if (!chave) throw new Error('JWT_SECRET não definido no .env');
  return chave;
}

// ---------- senhas ----------

export function gerarHash(senha) {
  return bcrypt.hash(senha, SALT_ROUNDS);
}

export function compararSenha(senha, hash) {
  return bcrypt.compare(senha, hash);
}

// ---------- token de sessão (JWT) ----------

export function gerarToken(usuarioId) {
  return jwt.sign({}, segredo(), {
    subject: String(usuarioId),
    expiresIn: EXPIRACAO_TOKEN,
  });
}

// retorna o id do usuário ou lança erro se o token for inválido
export function verificarToken(token) {
  const payload = jwt.verify(token, segredo());
  return Number(payload.sub);
}

// ---------- token de recuperação de senha ----------

// o token vai para o e-mail do usuário; no banco fica só o hash
export function gerarTokenRecuperacao() {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, hash: hashTokenRecuperacao(token) };
}

export function hashTokenRecuperacao(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}