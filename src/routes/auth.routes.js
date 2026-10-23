import { Router } from 'express';
import { login, solicitarRecuperacao, redefinirSenha } from '../controllers/auth.controller.js';
import { validar } from '../middlewares/validar.js';
import { login as loginSchema, recuperacaoSenha, redefinicaoSenha } from '../validations/auth.schema.js';

const router = Router();

router.post('/login', validar({ body: loginSchema }), login);
router.post('/recuperacao-senha', validar({ body: recuperacaoSenha }), solicitarRecuperacao);
router.post('/redefinicao-senha', validar({ body: redefinicaoSenha }), redefinirSenha);

export default router;