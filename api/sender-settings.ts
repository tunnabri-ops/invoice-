import { getSenderSettings, saveSenderSettings } from './_emailService';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const sender = getSenderSettings();
    return res.status(200).json({ ok: true, sender });
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (_) {
        body = {};
      }
    }
    const { username, domain, displayName } = body || {};

    const result = await saveSenderSettings(username, domain, displayName);

    if (!result.success) {
      return res.status(400).json({
        ok: false,
        error: result.error || 'Failed to update sender settings',
      });
    }

    return res.status(200).json({
      ok: true,
      sender: result.sender,
      message: 'Sender address configured successfully',
    });
  }

  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
}
