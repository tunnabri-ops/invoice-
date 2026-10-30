import dotenv from 'dotenv';
try {
  dotenv.config();
} catch (_) {
  // Ignore in production environments like Vercel where process.env is injected directly
}

export interface ApprovedDomain {
  domain: string;
  status: 'verified' | 'pending' | 'unverified';
  isApproved: boolean;
  region?: string;
  dnsRecordsCount?: number;
}

export interface SenderConfig {
  username: string;
  domain: string;
  displayName: string;
  email: string;
  updatedAt: string;
  isConfigured: boolean;
}

export interface EmailActivityRecord {
  id: string;
  resendId?: string;
  from: string;
  to: string;
  subject: string;
  invoiceNumber?: string;
  status: 'accepted' | 'sent' | 'failed';
  statusDetails: string;
  timestamp: string;
  hasAttachment: boolean;
  error?: string;
}

// 10 verified domains from user's Resend account
export const USER_VERIFIED_RESEND_DOMAINS = [
  'jiohotstar.dev',
  'mybusinessgmail.info',
  'mybusinessgmail.com',
  'coxoxa.com',
  'nagadbd.info',
  '10min-mail.com',
  'akleatherbd.digital',
  'telegra.dev',
  'lalaji.xyz',
  'chorki.pro',
];

let currentSenderConfig: SenderConfig = {
  username: 'billing',
  domain: 'mybusinessgmail.com',
  displayName: 'InvoiceCraft Billing',
  email: 'billing@mybusinessgmail.com',
  updatedAt: new Date().toISOString(),
  isConfigured: true,
};

const emailActivityLog: EmailActivityRecord[] = [];
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const duplicateCache = new Map<string, number>();

export function getAdminApprovedDomainsList(): string[] {
  const envDomains = process.env.ALLOWED_DOMAINS;
  if (envDomains && envDomains.trim().length > 0) {
    const list = envDomains
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter((d) => d.length > 0 && d.includes('.'));
    return Array.from(new Set([...list, ...USER_VERIFIED_RESEND_DOMAINS]));
  }

  if (process.env.FROM_EMAIL && process.env.FROM_EMAIL.includes('@')) {
    const extracted = process.env.FROM_EMAIL.split('@')[1].trim().toLowerCase();
    if (extracted.includes('.')) {
      return Array.from(new Set([extracted, ...USER_VERIFIED_RESEND_DOMAINS]));
    }
  }

  return USER_VERIFIED_RESEND_DOMAINS;
}

export async function getVerifiedDomains(): Promise<{
  domains: ApprovedDomain[];
  isResendConfigured: boolean;
  resendError?: string;
}> {
  const approvedList = getAdminApprovedDomainsList();
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === 'MY_RESEND_API_KEY' || apiKey.startsWith('re_your_api_key')) {
    return {
      domains: approvedList.map((domain) => ({
        domain,
        status: 'verified',
        isApproved: true,
        region: 'us-east-1',
      })),
      isResendConfigured: false,
    };
  }

  try {
    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errJson = (await response.json().catch(() => ({}))) as any;
      return {
        domains: approvedList.map((domain) => ({
          domain,
          status: 'verified',
          isApproved: true,
        })),
        isResendConfigured: true,
        resendError: errJson?.message || `Resend API returned status ${response.status}`,
      };
    }

    const data = (await response.json()) as { data?: Array<{ name: string; status: string; region?: string }> };
    const resendDomains = data?.data || [];
    const resendDomainMap = new Map(resendDomains.map((d) => [d.name.toLowerCase(), d]));

    const combinedDomains = Array.from(
      new Set([
        ...approvedList.map((d) => d.toLowerCase()),
        ...resendDomains.map((d) => d.name.toLowerCase()),
      ])
    );

    const validatedDomains: ApprovedDomain[] = combinedDomains.map((domain) => {
      const foundInResend = resendDomainMap.get(domain.toLowerCase());
      const isKnownVerified = USER_VERIFIED_RESEND_DOMAINS.includes(domain.toLowerCase());
      return {
        domain,
        status:
          foundInResend?.status === 'verified' || isKnownVerified
            ? 'verified'
            : foundInResend
            ? 'pending'
            : 'unverified',
        isApproved: true,
        region: foundInResend?.region || 'us-east-1',
      };
    });

    return {
      domains: validatedDomains,
      isResendConfigured: true,
    };
  } catch (error: any) {
    return {
      domains: approvedList.map((domain) => ({
        domain,
        status: 'verified',
        isApproved: true,
      })),
      isResendConfigured: true,
      resendError: error?.message || 'Failed to connect to Resend API',
    };
  }
}

export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (!username || typeof username !== 'string') {
    return { isValid: false, error: 'Username is required' };
  }

  const trimmed = username.trim().toLowerCase();

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Username must be at least 2 characters long' };
  }

  if (trimmed.length > 64) {
    return { isValid: false, error: 'Username cannot exceed 64 characters' };
  }

  if (!/^[a-z0-9._-]+$/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Username may only contain letters, numbers, periods (.), underscores (_), and hyphens (-)',
    };
  }

  if (trimmed.startsWith('.') || trimmed.endsWith('.') || trimmed.startsWith('-') || trimmed.endsWith('-')) {
    return { isValid: false, error: 'Username cannot start or end with a period or hyphen' };
  }

  if (trimmed.includes('..')) {
    return { isValid: false, error: 'Username cannot contain consecutive periods' };
  }

  return { isValid: true };
}

export function validateDomain(domain: string): { isValid: boolean; error?: string } {
  if (!domain || typeof domain !== 'string') {
    return { isValid: false, error: 'Domain is required' };
  }

  const trimmed = domain.trim().toLowerCase();
  const approvedList = getAdminApprovedDomainsList();

  if (!approvedList.includes(trimmed)) {
    return {
      isValid: false,
      error: `Domain "${domain}" is not in the administrator-approved domains list. You may only send from approved domains.`,
    };
  }

  return { isValid: true };
}

export async function saveSenderSettings(
  username: string,
  domain: string,
  displayName?: string
): Promise<{ success: boolean; sender?: SenderConfig; error?: string }> {
  const userValidation = validateUsername(username);
  if (!userValidation.isValid) {
    return { success: false, error: userValidation.error };
  }

  const domainValidation = validateDomain(domain);
  if (!domainValidation.isValid) {
    return { success: false, error: domainValidation.error };
  }

  const cleanUsername = username.trim().toLowerCase();
  const cleanDomain = domain.trim().toLowerCase();
  const cleanDisplayName = displayName?.trim() || cleanUsername;

  currentSenderConfig = {
    username: cleanUsername,
    domain: cleanDomain,
    displayName: cleanDisplayName,
    email: `${cleanUsername}@${cleanDomain}`,
    updatedAt: new Date().toISOString(),
    isConfigured: true,
  };

  return {
    success: true,
    sender: currentSenderConfig,
  };
}

export function getSenderSettings(): SenderConfig {
  return currentSenderConfig;
}

export function checkRateLimit(key: string, limit: number = 15, windowMs: number = 60000): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

export function checkDuplicateSend(idempotencyKey: string, windowMs: number = 30000): boolean {
  const now = Date.now();
  const lastSent = duplicateCache.get(idempotencyKey);

  if (lastSent && now - lastSent < windowMs) {
    return true;
  }

  duplicateCache.set(idempotencyKey, now);

  if (duplicateCache.size > 500) {
    for (const [k, time] of duplicateCache.entries()) {
      if (now - time > windowMs * 2) {
        duplicateCache.delete(k);
      }
    }
  }

  return false;
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  senderUsername?: string;
  senderDomain?: string;
  displayName?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  pdfAttachment?: {
    filename: string;
    contentBase64: string;
  };
  clientIp?: string;
}

export async function sendEmail(payload: SendEmailPayload): Promise<{
  success: boolean;
  messageId?: string;
  status: 'accepted' | 'sent' | 'failed';
  statusDetails: string;
  from: string;
  to: string;
  error?: string;
  duplicatePrevented?: boolean;
}> {
  const { to, subject, html, text, invoiceNumber, pdfAttachment, clientIp } = payload;

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
    return {
      success: false,
      status: 'failed',
      statusDetails: 'Validation Error',
      from: '',
      to: to || '',
      error: 'Please provide a valid recipient email address.',
    };
  }

  let username = payload.senderUsername || currentSenderConfig.username;
  let domain = payload.senderDomain || currentSenderConfig.domain;
  let displayName = payload.displayName || currentSenderConfig.displayName;

  const userCheck = validateUsername(username);
  if (!userCheck.isValid) {
    return {
      success: false,
      status: 'failed',
      statusDetails: 'Sender Validation Error',
      from: '',
      to,
      error: `Invalid sender username: ${userCheck.error}`,
    };
  }

  const domainCheck = validateDomain(domain);
  if (!domainCheck.isValid) {
    return {
      success: false,
      status: 'failed',
      statusDetails: 'Sender Domain Authorization Error',
      from: '',
      to,
      error: domainCheck.error || 'Unauthorized domain.',
    };
  }

  const cleanFromEmail = `${username.trim().toLowerCase()}@${domain.trim().toLowerCase()}`;
  const formattedFrom = displayName ? `"${displayName.trim()}" <${cleanFromEmail}>` : cleanFromEmail;

  const rateLimitKey = clientIp || cleanFromEmail;
  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return {
      success: false,
      status: 'failed',
      statusDetails: 'Rate Limit Exceeded',
      from: cleanFromEmail,
      to,
      error: 'Too many email requests. Please wait a moment before sending another email.',
    };
  }

  const dedupKey = `${to.trim().toLowerCase()}_${invoiceNumber || ''}_${subject.trim()}`;
  if (checkDuplicateSend(dedupKey)) {
    return {
      success: true,
      duplicatePrevented: true,
      status: 'accepted',
      statusDetails: 'Duplicate send prevented: this email was already dispatched moments ago.',
      from: cleanFromEmail,
      to,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 'MY_RESEND_API_KEY' || apiKey.startsWith('re_your_api_key')) {
    const errorMsg =
      'RESEND_API_KEY is missing in your Vercel Environment Variables. Please go to Vercel Project Settings -> Environment Variables, add RESEND_API_KEY with your key, and redeploy.';

    const activityRecord: EmailActivityRecord = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      from: cleanFromEmail,
      to,
      subject,
      invoiceNumber,
      status: 'failed',
      statusDetails: 'Missing RESEND_API_KEY on Vercel',
      timestamp: new Date().toISOString(),
      hasAttachment: !!pdfAttachment,
      error: errorMsg,
    };
    emailActivityLog.unshift(activityRecord);

    return {
      success: false,
      status: 'failed',
      statusDetails: 'Configuration Error',
      from: cleanFromEmail,
      to,
      error: errorMsg,
    };
  }

  const resendBody: any = {
    from: formattedFrom,
    to: [to.trim()],
    subject: subject.trim(),
    html: html,
    text: text || html.replace(/<[^>]*>?/gm, ''),
  };

  if (pdfAttachment && pdfAttachment.contentBase64) {
    resendBody.attachments = [
      {
        filename: pdfAttachment.filename || 'invoice.pdf',
        content: pdfAttachment.contentBase64,
      },
    ];
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendBody),
    });

    const responseJson: any = await resendResponse.json().catch(() => ({}));

    if (!resendResponse.ok) {
      const errorMsg =
        responseJson?.message || responseJson?.error || `Resend returned HTTP ${resendResponse.status}`;

      const activityRecord: EmailActivityRecord = {
        id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        from: cleanFromEmail,
        to,
        subject,
        invoiceNumber,
        status: 'failed',
        statusDetails: `Rejected by Resend: ${errorMsg}`,
        timestamp: new Date().toISOString(),
        hasAttachment: !!pdfAttachment,
        error: errorMsg,
      };
      emailActivityLog.unshift(activityRecord);

      return {
        success: false,
        status: 'failed',
        statusDetails: 'Resend API Error',
        from: cleanFromEmail,
        to,
        error: errorMsg,
      };
    }

    const resendId = responseJson?.id;

    const activityRecord: EmailActivityRecord = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      resendId,
      from: cleanFromEmail,
      to,
      subject,
      invoiceNumber,
      status: 'accepted',
      statusDetails: 'Accepted by Resend for outbound delivery queue',
      timestamp: new Date().toISOString(),
      hasAttachment: !!pdfAttachment,
    };
    emailActivityLog.unshift(activityRecord);

    return {
      success: true,
      messageId: resendId,
      status: 'accepted',
      statusDetails: 'Accepted by Resend for delivery queue',
      from: cleanFromEmail,
      to,
    };
  } catch (error: any) {
    const errorMsg = error?.message || 'Network exception connecting to Resend API';

    const activityRecord: EmailActivityRecord = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      from: cleanFromEmail,
      to,
      subject,
      invoiceNumber,
      status: 'failed',
      statusDetails: errorMsg,
      timestamp: new Date().toISOString(),
      hasAttachment: !!pdfAttachment,
      error: errorMsg,
    };
    emailActivityLog.unshift(activityRecord);

    return {
      success: false,
      status: 'failed',
      statusDetails: 'Network Failure',
      from: cleanFromEmail,
      to,
      error: errorMsg,
    };
  }
}

export function getActivityHistory(): EmailActivityRecord[] {
  return emailActivityLog.slice(0, 50);
}
