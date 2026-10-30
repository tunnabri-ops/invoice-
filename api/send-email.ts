import { sendEmail } from '../server/emailService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
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
