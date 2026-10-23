import { verificarToken } from './auth.service.js';

// RNF003 - exige usuário autenticado
export function autenticar(req, res, next) {
  const [tipo, token] = req.headers.authorization?.split(' ') ?? [];

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Token não informado' });
  }

  try {
    req.usuarioId = verificarToken(token);
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

// RNF004 - usuário só acessa os próprios dados
// usar depois de validar({ params: idParams })
export function somenteProprioUsuario(req, res, next) {
  if (req.validado?.params?.id !== req.usuarioId) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }
  next();
}