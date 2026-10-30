import { getVerifiedDomains } from './_emailService';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    const result = await getVerifiedDomains();
    return new Response(
      JSON.stringify({
        ok: true,
        domains: result.domains,
        isResendConfigured: result.isResendConfigured,
        resendError: result.resendError,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error?.message || 'Internal Server Error retrieving domains',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }
}

export default async function handler(req: any, res?: any) {
  if (!res || typeof res.setHeader !== 'function') {
    if (req.method === 'OPTIONS') return OPTIONS();
    return GET();
  }

  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.setHeader(key, value);
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
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
