import type { IncomingMessage, ServerResponse } from 'http';
import { getVerifiedDomains } from '../server/emailService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const result = await getVerifiedDomains();
    return res.status(200).json({
      ok: true,
      domains: result.domains,
      isResendConfigured: result.isResendConfigured,
      resendError: result.resendError,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Internal Server Error retrieving domains',
    });
  }
}
