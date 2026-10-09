import { Router } from 'express';
import { listarCategorias, criarCategoria } from '../controllers/categoria.controller.js';

const router = Router();

router.get('/', listarCategorias);
router.post('/', criarCategoria);

export default router;