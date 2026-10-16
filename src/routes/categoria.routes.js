import { Router } from 'express';
import { listar, buscar, criar, atualizar, remover } from '../controllers/categoria.controller.js';
import { autenticar } from '../auth/auth.middleware.js';

const router = Router();

router.use(autenticar);

router.get('/', listar);
router.get('/:id', buscar);
router.post('/', criar);
router.patch('/:id', atualizar);
router.delete('/:id', remover);

export default router;