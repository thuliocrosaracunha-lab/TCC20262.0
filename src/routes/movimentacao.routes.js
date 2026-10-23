import { Router } from 'express';
import {
  listar,
  buscar,
  criar,
  atualizar,
  remover,
  resumo,
} from '../controllers/movimentacao.controller.js';
import { autenticar } from '../auth/auth.middleware.js';
import { validar } from '../middlewares/validar.js';
import { idParams } from '../validations/comum.js';
import {
  criarMovimentacao,
  atualizarMovimentacao,
  filtrosMovimentacao,
} from '../validations/movimentacao.schema.js';

const router = Router();

router.use(autenticar);

router.get('/resumo', validar({ query: filtrosMovimentacao }), resumo); // antes de '/:id'
router.get('/', validar({ query: filtrosMovimentacao }), listar);
router.get('/:id', validar({ params: idParams }), buscar);
router.post('/', validar({ body: criarMovimentacao }), criar);
router.patch('/:id', validar({ params: idParams, body: atualizarMovimentacao }), atualizar);
router.delete('/:id', validar({ params: idParams }), remover);

export default router;