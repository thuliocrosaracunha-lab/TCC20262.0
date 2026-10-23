// valida params, query e body com schemas Zod
// os dados validados (e já convertidos) ficam em req.validado
export function validar(schemas) {
  return (req, res, next) => {
    const validado = {};
    const detalhes = [];

    for (const parte of ['params', 'query', 'body']) {
      if (!schemas[parte]) continue;

      const resultado = schemas[parte].safeParse(req[parte] ?? {});

      if (resultado.success) {
        validado[parte] = resultado.data;
      } else {
        for (const issue of resultado.error.issues) {
          detalhes.push({
            local: parte,
            campo: issue.path.join('.') || null,
            mensagem: issue.message,
          });
        }
      }
    }

    if (detalhes.length > 0) {
      return res.status(400).json({ erro: 'Dados inválidos', detalhes });
    }

    req.validado = validado;
    next();
  };
}