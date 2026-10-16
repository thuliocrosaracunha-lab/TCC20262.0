import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const EXPIRACAO_TOKEN = '1d';

function segredo() {
  const chave = process.env.JWT_SECRET;
  if (!chave) throw new Error('JWT_SECRET não definido no .env');
  return chave;
}

export function gerarHash(senha) {
  return bcrypt.hash(senha, SALT_ROUNDS);
}

export function compararSenha(senha, hash) {
  return bcrypt.compare(senha, hash);
}

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