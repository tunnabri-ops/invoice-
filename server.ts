import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  getVerifiedDomains,
  getSenderSettings,
  saveSenderSettings,
  sendEmail,
  getActivityHistory,
} from './server/emailService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/domains', async (req, res) => {
    try {
      const result = await getVerifiedDomains();
      res.json({ ok: true, ...result });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message || 'Server error retrieving domains' });
    }
  });

  app.get('/api/sender-settings', (req, res) => {
    const sender = getSenderSettings();
    res.json({ ok: true, sender });
  });

  app.post('/api/sender-settings', async (req, res) => {
    try {
      const { username, domain, displayName } = req.body || {};
      const result = await saveSenderSettings(username, domain, displayName);
      if (!result.success) {
        return res.status(400).json({ ok: false, error: result.error });
      }
      res.json({ ok: true, sender: result.sender, message: 'Sender settings saved successfully' });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message });
    }
  });

  app.post('/api/send-email', async (req, res) => {
    try {
      const clientIp =
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
        'client';

      const result = await sendEmail({
        ...req.body,
        clientIp: Array.isArray(clientIp) ? clientIp[0] : clientIp,
      });

      if (!result.success && !result.duplicatePrevented) {
        return res.status(400).json({
          ok: false,
          error: result.error,
          status: result.status,
          statusDetails: result.statusDetails,
        });
      }

      res.json({ ok: true, ...result });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message || 'Server error dispatching email' });
    }
  });

  app.get('/api/activity', (req, res) => {
    const activities = getActivityHistory();
    res.json({ ok: true, activities });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`InvoiceCraft server ready on port ${PORT}`);
  });
}

startServer();
