import { Router } from 'express';
import { criar, buscar, atualizar, remover } from '../controllers/usuario.controller.js';
import { autenticar, somenteProprioUsuario } from '../auth/auth.middleware.js';
import { validar } from '../middlewares/validar.js';
import { idParams } from '../validations/comum.js';
import { criarUsuario, atualizarUsuario } from '../validations/usuario.schema.js';

const router = Router();

router.post('/', validar({ body: criarUsuario }), criar);

router.get('/:id',
  autenticar, validar({ params: idParams }), somenteProprioUsuario, buscar);

router.patch('/:id',
  autenticar, validar({ params: idParams, body: atualizarUsuario }), somenteProprioUsuario, atualizar);

router.delete('/:id',
  autenticar, validar({ params: idParams }), somenteProprioUsuario, remover);

export default router;