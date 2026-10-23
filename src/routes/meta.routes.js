import { Router } from 'express';
import { listar, buscar, criar, atualizar, remover } from '../controllers/meta.controller.js';
import { autenticar } from '../auth/auth.middleware.js';
import { validar } from '../middlewares/validar.js';
import { idParams } from '../validations/comum.js';
import { criarMeta, atualizarMeta, filtrosMeta } from '../validations/meta.schema.js';

const router = Router();

router.use(autenticar);

router.get('/', validar({ query: filtrosMeta }), listar);
router.get('/:id', validar({ params: idParams }), buscar);
router.post('/', validar({ body: criarMeta }), criar);
router.patch('/:id', validar({ params: idParams, body: atualizarMeta }), atualizar);
router.delete('/:id', validar({ params: idParams }), remover);

export default router;