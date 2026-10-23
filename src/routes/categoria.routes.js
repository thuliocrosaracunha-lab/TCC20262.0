import { Router } from 'express';
import { listar, buscar, criar, atualizar, remover } from '../controllers/categoria.controller.js';
import { autenticar } from '../auth/auth.middleware.js';
import { validar } from '../middlewares/validar.js';
import { idParams } from '../validations/comum.js';
import { criarCategoria, atualizarCategoria } from '../validations/categoria.schema.js';

const router = Router();

router.use(autenticar);

router.get('/', listar);
router.get('/:id', validar({ params: idParams }), buscar);
router.post('/', validar({ body: criarCategoria }), criar);
router.patch('/:id', validar({ params: idParams, body: atualizarCategoria }), atualizar);
router.delete('/:id', validar({ params: idParams }), remover);

export default router;