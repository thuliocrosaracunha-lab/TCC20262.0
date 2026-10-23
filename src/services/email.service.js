import nodemailer from 'nodemailer';

let transporter;

function obterTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  const porta = Number(SMTP_PORT ?? 465);

  transporter ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port: porta,
    secure: porta === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

export async function enviarEmailRecuperacao(destinatario, nome, link) {
  const transporte = obterTransporter();

  // sem SMTP configurado: mostra o link no terminal (modo desenvolvimento)
  if (!transporte) {
    console.log(`\n[DEV] Link de recuperação para ${destinatario}:\n${link}\n`);
    return;
  }

  await transporte.sendMail({
    from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
    to: destinatario,
    subject: 'Redefinição de senha',
    text: `Olá, ${nome}!\n\nPara redefinir sua senha, acesse: ${link}\n\nO link expira em 30 minutos. Se você não pediu a redefinição, ignore este e-mail.`,
    html: `
      <p>Olá, ${nome}!</p>
      <p>Para redefinir sua senha, clique no link abaixo:</p>
      <p><a href="${link}">Redefinir minha senha</a></p>
      <p>O link expira em 30 minutos. Se você não pediu a redefinição, ignore este e-mail.</p>
    `,
  });
}