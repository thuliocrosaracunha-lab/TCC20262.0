import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/categorias', categoriaRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

app.use((err, req, res, next) => {
  const codigo = err.code ?? err.cause?.code;

  if (codigo === '23505') {
    return res.status(409).json({ erro: 'Registro duplicado' });
  }
  if (codigo === '23503') {
    return res.status(409).json({ erro: 'Referência inválida ou registro em uso' });
  }

  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

export default app;