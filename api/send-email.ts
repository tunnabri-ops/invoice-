import { sendEmail } from './_emailService';

export default async function handler(req: any, res: any) {
  // CORS Headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (_) {
        body = {};
      }
    } else if (!body && req.readable) {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const raw = Buffer.concat(chunks).toString('utf8');
      if (raw) {
        try {
          body = JSON.parse(raw);
        } catch (_) {
          body = {};
        }
      }
    }

    body = body || {};

    const clientIp =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'client';

    const result = await sendEmail({
      ...body,
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

    return res.status(200).json({
      ok: true,
      messageId: result.messageId,
      status: result.status,
      statusDetails: result.statusDetails,
      from: result.from,
      to: result.to,
      duplicatePrevented: result.duplicatePrevented,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Server error processing email request',
    });
  }
}
