const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { emailQueue } = require('./queue');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Segurança e Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Conexão Banco de Dados (Setup inicial)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// --- ROTAS ---

// 1. Rota de Healthcheck
app.get('/', (req, res) => {
  res.json({ status: 'Jinoca Mailer Online', version: '1.0.0' });
});

// 2. Rota de Integração (Para sites externos enviarem e-mail)
// Espera: { apiKey, to, subject, html, fromName }
app.post('/api/v1/send', async (req, res) => {
  const { apiKey, to, subject, html, fromName } = req.body;

  // TODO: Validar apiKey no banco de dados (Próxima etapa)
  if (!apiKey) return res.status(401).json({ error: 'API Key missing' });

  // O remetente será sempre autenticado pelo domínio, mas o display name muda
  const fromEmail = `noreply@${process.env.APP_DOMAIN}`;

  await emailQueue.add('send-email', {
    to,
    subject,
    html,
    fromName: fromName || 'Jinoca System',
    fromEmail
  });

  res.json({ success: true, message: 'E-mail enfileirado para envio.' });
});

// Inicialização
app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});