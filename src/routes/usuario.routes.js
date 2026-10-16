import { Router } from 'express';
import { criar, buscar, atualizar, remover } from '../controllers/usuario.controller.js';
import { autenticar, somenteProprioUsuario } from '../auth/auth.middleware.js';

const router = Router();

router.post('/', criar);
router.get('/:id', autenticar, somenteProprioUsuario, buscar);
router.patch('/:id', autenticar, somenteProprioUsuario, atualizar);
router.delete('/:id', autenticar, somenteProprioUsuario, remover);

export default router;