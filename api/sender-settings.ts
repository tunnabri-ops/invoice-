import { getSenderSettings, saveSenderSettings } from './_emailService';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: CORS_HEADERS });
}

export async function GET() {
  const sender = getSenderSettings();
  return new Response(JSON.stringify({ ok: true, sender }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { username, domain, displayName } = body || {};
    const result = await saveSenderSettings(username, domain, displayName);

    if (!result.success) {
      return new Response(JSON.stringify({ ok: false, error: result.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        sender: result.sender,
        message: 'Sender address configured successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err?.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}

export default async function handler(req: any, res?: any) {
  if (!res || typeof res.setHeader !== 'function') {
    if (req.method === 'OPTIONS') return OPTIONS();
    if (req.method === 'GET') return GET();
    if (req.method === 'POST') return POST(req);
    return new Response(null, { status: 405 });
  }

  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.setHeader(key, value);
  }

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
