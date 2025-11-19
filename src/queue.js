const { Queue, Worker } = require('bullmq');
const nodemailer = require('nodemailer');

const connection = {
  host: process.env.REDIS_HOST || 'redis',
  port: 6379
};

// Fila de E-mails
const emailQueue = new Queue('email-queue', { connection });

// Transportador SMTP (Apontando para o container Postfix)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'postfix',
  port: 25,
  secure: false,
  tls: { rejectUnauthorized: false }
});

// Worker que processa os envios
const worker = new Worker('email-queue', async (job) => {
  const { to, subject, html, fromName, fromEmail } = job.data;

  console.log(`[Processando] Enviando para ${to}...`);

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`, // Permite customizar o remetente
      to,
      subject,
      html,
    });
    console.log(`[Sucesso] MessageID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Erro] Falha ao enviar para ${to}:`, error);
    throw error;
  }
}, { connection });

module.exports = { emailQueue };