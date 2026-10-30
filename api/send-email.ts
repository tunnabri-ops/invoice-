import { sendEmail } from './_emailService';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers':
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
};

async function processSendRequest(body: any, clientIp: string) {
  return await sendEmail({
    ...body,
    clientIp,
  });
}

// 1. Web Standard Handler (Edge / Next.js / Modern Vercel Functions)
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const clientIp =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'client';

    const result = await processSendRequest(body, clientIp);

    if (!result.success && !result.duplicatePrevented) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: result.error,
          status: result.status,
          statusDetails: result.statusDetails,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        messageId: result.messageId,
        status: result.status,
        statusDetails: result.statusDetails,
        from: result.from,
        to: result.to,
        duplicatePrevented: result.duplicatePrevented,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: err?.message || 'Server error processing email request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  }
}

// 2. Node.js Standard Handler (Classic Vercel / Express / Serverless Node)
export default async function handler(req: any, res?: any) {
  // If invoked with Web standard Request without res
  if (!res || typeof res.setHeader !== 'function') {
    if (req.method === 'OPTIONS') return OPTIONS();
    return POST(req);
  }

  // Node.js IncomingMessage / ServerResponse
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.setHeader(key, value);
  }

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

    const result = await processSendRequest(
      body,
      Array.isArray(clientIp) ? clientIp[0] : clientIp
    );

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
