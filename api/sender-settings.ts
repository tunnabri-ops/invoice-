import { getSenderSettings, saveSenderSettings } from '../server/emailService';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const sender = getSenderSettings();
    return res.status(200).json({ ok: true, sender });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
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

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
}
