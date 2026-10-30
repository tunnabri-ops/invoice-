import React, { useState } from 'react';
import { EmailTemplateData, InvoiceData } from '../../types';
import { formatCurrency } from '../../data/sampleData';
import {
  Monitor,
  Smartphone,
  Copy,
  Check,
  Send,
  Paperclip,
  FileText,
  Sparkles,
  Edit3,
  ExternalLink,
} from 'lucide-react';

interface EmailRendererProps {
  template: EmailTemplateData;
  invoice: InvoiceData;
  onUpdateTemplate?: (updated: EmailTemplateData) => void;
}

export const EmailRenderer: React.FC<EmailRendererProps> = ({
  template,
  invoice,
  onUpdateTemplate,
}) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable local fields
  const [subject, setSubject] = useState(template.subject);
  const [headline, setHeadline] = useState(template.headline);
  const [messageBody, setMessageBody] = useState(template.messageBody);
  const [ctaText, setCtaText] = useState(template.callToActionText);
  const [ctaUrl, setCtaUrl] = useState(template.callToActionUrl);
  const [hasAttachment, setHasAttachment] = useState(template.includePdfAttachment);

  const sym = invoice.customization.currencySymbol || '$';
  const curr = invoice.customization.currency || 'USD';
  const amountDueFormatted = formatCurrency(
    invoice.items.reduce((s, i) => s + i.rate * i.quantity, 0) * 1.085,
    sym,
    curr
  );

  // Interpolate placeholders
  const interpolate = (text: string) => {
    return text
      .replace(/{{client_name}}/g, invoice.client.name)
      .replace(/{{company_name}}/g, invoice.business.name)
      .replace(/{{invoice_number}}/g, invoice.invoiceNumber)
      .replace(/{{due_date}}/g, invoice.dueDate)
      .replace(/{{amount_due}}/g, amountDueFormatted)
      .replace(/{{amount_paid}}/g, amountDueFormatted)
      .replace(/{{total_amount}}/g, amountDueFormatted)
      .replace(/{{remaining_balance}}/g, '$0.00')
      .replace(/{{receipt_number}}/g, 'RCP-2026-0842-1')
      .replace(/{{quote_number}}/g, 'QT-2026-0319')
      .replace(/{{project_name}}/g, 'Brand Architecture & Design System')
      .replace(/{{valid_until}}/g, 'Nov 25, 2026')
      .replace(/{{subscription_plan}}/g, 'Enterprise Cloud Tier')
      .replace(/{{card_last4}}/g, '4242')
      .replace(/{{transaction_ref}}/g, 'ACH-REF-90281-SVBK')
      .replace(/{{paid_date}}/g, 'October 22, 2026')
      .replace(/{{payment_method}}/g, 'Bank Transfer / ACH');
  };

  const resolvedSubject = interpolate(subject);
  const resolvedHeadline = interpolate(headline);
  const resolvedBody = interpolate(messageBody);
  const resolvedCtaText = interpolate(ctaText);
  const resolvedCtaUrl = interpolate(ctaUrl);

  const primaryColor = template.bannerColor || '#4f46e5';

  const generateInlineEmailHtml = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${resolvedSubject}</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 32px 40px; background-color: ${primaryColor}; color: #ffffff;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">${invoice.business.name}</h1>
                  </td>
                  <td align="right">
                    <span style="font-size: 12px; color: #ffffff; opacity: 0.85; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">#${invoice.invoiceNumber}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">${resolvedHeadline}</h2>
              <div style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 32px; white-space: pre-line;">${resolvedBody}</div>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="${resolvedCtaUrl}" target="_blank" style="display: inline-block; background-color: ${primaryColor}; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">${resolvedCtaText}</a>
                  </td>
                </tr>
              </table>
              
              ${
                hasAttachment
                  ? `<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="28" valign="middle">📎</td>
                          <td style="font-size: 13px; font-weight: 600; color: #0f172a;">Invoice_${invoice.invoiceNumber}.pdf</td>
                          <td align="right" style="font-size: 12px; color: #64748b;">PDF Attachment (128 KB)</td>
                        </tr>
                      </table>
                    </div>`
                  : ''
              }
              
              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px;">${template.footerNote}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
              © ${new Date().getFullYear()} ${invoice.business.name}. All rights reserved.<br>
              ${invoice.business.address}, ${invoice.business.city} · <a href="${invoice.business.website}" style="color: #64748b; text-decoration: underline;">Visit Website</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(generateInlineEmailHtml());
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleSendTest = () => {
    setTestEmailSent(true);
    setTimeout(() => setTestEmailSent(false), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Viewport switch */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'desktop'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop View
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'mobile'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile View (380px)
            </button>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isEditing
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Close Editor' : 'Edit Subject & Copy'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyHtml}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium shadow-2xs transition-colors"
          >
            {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedHtml ? 'Copied HTML!' : 'Copy Inline HTML'}
          </button>

          <button
            onClick={handleSendTest}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Send Test Email
          </button>
        </div>
      </div>

      {testEmailSent && (
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Test email dispatched to <strong>{invoice.client.email}</strong> with full HTML rendering and attachment simulated!</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-600">SMTP: OK (200)</span>
        </div>
      )}

      {/* Optional Editor Drawer */}
      {isEditing && (
        <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm space-y-4 text-xs animate-in fade-in duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Live Email Template Editor
            </h4>
            <span className="text-[11px] text-slate-400">Available tags: {'{{client_name}}'}, {'{{invoice_number}}'}, {'{{amount_due}}'}, {'{{due_date}}'}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Message Body</label>
            <textarea
              rows={4}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-sans focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">CTA Button Label</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">CTA Destination URL</label>
              <input
                type="text"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-[11px]"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="pdf_attach"
                checked={hasAttachment}
                onChange={(e) => setHasAttachment(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="pdf_attach" className="text-slate-700 font-medium cursor-pointer">
                Attach Invoice PDF
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Email Client Preview Shell */}
      <div className="bg-slate-200/80 p-4 md:p-8 rounded-2xl flex justify-center">
        <div
          className={`bg-white rounded-xl shadow-lg border border-slate-300 overflow-hidden transition-all duration-200 ${
            viewMode === 'mobile' ? 'w-[380px]' : 'w-full max-w-[620px]'
          }`}
        >
          {/* Simulated Email Client Header */}
          <div className="bg-slate-100 border-b border-slate-200 p-4 text-xs space-y-1.5">
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>To: {invoice.client.name} &lt;{invoice.client.email}&gt;</span>
              <span>Today at 9:42 AM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">From:</span>
              <span className="font-semibold text-slate-800">{invoice.business.name} &lt;{invoice.business.email}&gt;</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1 border-t border-slate-200/60">
              <span className="text-slate-400 font-medium">Subject:</span>
              <span className="font-bold text-slate-900">{resolvedSubject}</span>
            </div>
          </div>

          {/* Email Body Content */}
          <div className="flex flex-col">
            {/* Header Banner with Primary Color */}
            <div
              className="p-6 md:p-8 text-white flex justify-between items-center"
              style={{ backgroundColor: primaryColor }}
            >
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">{invoice.business.name}</h3>
                <p className="text-xs text-white/80 mt-0.5">{invoice.business.legalName || invoice.business.website}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/80 bg-white/10 px-2 py-0.5 rounded">
                  #{invoice.invoiceNumber}
                </span>
              </div>
            </div>

            {/* Email Inner Body */}
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{resolvedHeadline}</h2>
                <div className="mt-3 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-sans">
                  {resolvedBody}
                </div>
              </div>

              {/* Summary Card inside Email */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Document Number:</span>
                  <span className="font-mono font-bold text-slate-900">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Due Date:</span>
                  <span className="font-bold text-slate-900">{invoice.dueDate}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Amount Due:</span>
                  <span className="font-bold text-slate-900 text-sm tabular-nums">{amountDueFormatted}</span>
                </div>
              </div>

              {/* Call To Action Button */}
              <div className="text-center pt-2">
                <a
                  href={resolvedCtaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-7 py-3 rounded-lg text-white font-semibold text-xs shadow-sm hover:opacity-95 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                >
                  {resolvedCtaText}
                </a>
              </div>

              {/* Attachment Pill if enabled */}
              {hasAttachment && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="font-semibold text-slate-800">Invoice_{invoice.invoiceNumber}.pdf</span>
                      <p className="text-[11px] text-slate-400">PDF Document · 128 KB</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-indigo-600">Download</span>
                </div>
              )}

              {/* Footer Note */}
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
                <p>{template.footerNote}</p>
              </div>
            </div>

            {/* Email Footer Disclaimers */}
            <div className="bg-slate-50 border-t border-slate-200 p-6 text-center text-xs text-slate-400 space-y-1">
              <p>© {new Date().getFullYear()} {invoice.business.name}. All rights reserved.</p>
              <p>{invoice.business.address}, {invoice.business.city} · {invoice.business.website}</p>
              <p className="text-[10px] text-slate-400 pt-1">
                You are receiving this communication regarding your active account with {invoice.business.name}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
