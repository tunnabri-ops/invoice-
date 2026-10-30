import React, { useState } from 'react';
import { InvoiceData } from '../../types';
import { formatCurrency, calculateTotals } from '../../data/sampleData';
import { safeBase64Encode } from '../../utils/base64';
import {
  X,
  Send,
  Mail,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface SendInvoiceEmailModalProps {
  invoice: InvoiceData;
  isOpen: boolean;
  onClose: () => void;
  onOpenActivityLog?: () => void;
  userEmail?: string;
}

export const SendInvoiceEmailModal: React.FC<SendInvoiceEmailModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onOpenActivityLog,
}) => {
  const [recipient, setRecipient] = useState<string>(invoice.client.email || '');
  const [subject, setSubject] = useState<string>(
    `Invoice #${invoice.invoiceNumber} from ${invoice.business.name}`
  );
  const [message, setMessage] = useState<string>(
    `Hello ${invoice.client.name},\n\nPlease find your invoice #${invoice.invoiceNumber} attached. The balance is due on ${invoice.dueDate}.\n\nThank you for your business!\n${invoice.business.name}`
  );
  const [attachPdf, setAttachPdf] = useState(true);

  // Sender domain & account
  const [senderUsername, setSenderUsername] = useState('billing');
  const [senderDomain, setSenderDomain] = useState('mybusinessgmail.com');
  const [availableDomains, setAvailableDomains] = useState<string[]>([
    'mybusinessgmail.com',
    'jiohotstar.dev',
    'mybusinessgmail.info',
    'coxoxa.com',
    'nagadbd.info',
    '10min-mail.com',
    'akleatherbd.digital',
    'telegra.dev',
    'lalaji.xyz',
    'chorki.pro',
  ]);

  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
    messageId?: string;
  } | null>(null);

  // Fetch verified domains on open
  React.useEffect(() => {
    fetch('/api/domains')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.domains) && data.domains.length > 0) {
          const domNames = data.domains.map((d: any) => d.domain);
          setAvailableDomains(domNames);
          if (!senderDomain || !domNames.includes(senderDomain)) {
            setSenderDomain(domNames[0]);
          }
        }
      })
      .catch(() => {});

    fetch('/api/sender-settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.sender) {
          if (data.sender.username) setSenderUsername(data.sender.username);
          if (data.sender.domain) setSenderDomain(data.sender.domain);
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const totals = calculateTotals(
    invoice.items,
    invoice.discountType,
    invoice.discountValue,
    invoice.taxPercent,
    invoice.shipping
  );

  const sym = invoice.customization.currencySymbol || '$';
  const curr = invoice.customization.currency || 'USD';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !recipient.includes('@')) {
      setSendResult({ success: false, message: 'Please enter a valid email address.' });
      return;
    }

    setIsSending(true);
    setSendResult(null);

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 28px; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: bold;">${invoice.business.name}</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">Invoice #${invoice.invoiceNumber}</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #0f172a;">Invoice for ${invoice.client.name}</h2>
          <p style="color: #334155; line-height: 1.6; font-size: 14px; white-space: pre-line;">${message}</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <table width="100%" style="font-size: 14px;">
              <tr>
                <td style="color: #64748b;">Invoice Number:</td>
                <td align="right" style="font-weight: bold; color: #0f172a;">${invoice.invoiceNumber}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Due Date:</td>
                <td align="right" style="font-weight: bold; color: #0f172a;">${invoice.dueDate}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding-top: 8px; font-weight: bold;">Total Amount:</td>
                <td align="right" style="font-weight: bold; color: #059669; font-size: 16px; padding-top: 8px;">
                  ${formatCurrency(totals.total, sym, curr)}
                </td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-bottom: 0;">
            Payment terms: ${invoice.terms || 'Net 30 days.'}
          </p>
        </div>
      </div>
    `;

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient.trim(),
          subject: subject.trim(),
          html: emailHtml,
          invoiceNumber: invoice.invoiceNumber,
          senderUsername: senderUsername.trim(),
          senderDomain: senderDomain.trim(),
          displayName: invoice.business.name,
          pdfAttachment: attachPdf
            ? {
                filename: `Invoice_${invoice.invoiceNumber}.pdf`,
                contentBase64: safeBase64Encode(
                  `Invoice #${invoice.invoiceNumber}\nClient: ${invoice.client.name}\nTotal: ${formatCurrency(totals.total, sym, curr)}\nDue Date: ${invoice.dueDate}`
                ),
              }
            : undefined,
        }),
      });

      const responseText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch (_) {
        data = { ok: false, error: responseText || `Server returned HTTP ${response.status}` };
      }

      if (!response.ok || !data.ok) {
        throw new Error(data.error || data.statusDetails || `Email dispatch failed (HTTP ${response.status})`);
      }

      setSendResult({
        success: true,
        message: `Invoice email successfully dispatched to ${recipient}!`,
        messageId: data.messageId,
      });
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err?.message || 'Server error sending email',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden text-xs my-6">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Send Invoice by Email</h3>
              <p className="text-slate-500 text-[11px]">
                Dispatch Invoice #{invoice.invoiceNumber} directly to your client or recipient.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="p-6 space-y-4">
          {/* Sender Domain Selector */}
          <div className="p-3 bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-700">Send From (Verified Domain):</span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full border border-emerald-200">
                ✓ Resend Verified
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                <input
                  type="text"
                  value={senderUsername}
                  onChange={(e) => setSenderUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                  placeholder="billing"
                  className="w-24 py-1.5 px-2.5 text-xs font-mono font-semibold text-slate-900 border-r border-slate-200 focus:outline-none"
                  title="Sender username (e.g. billing, invoices, accounts)"
                />
                <span className="px-1 text-slate-400 font-mono text-xs">@</span>
                <select
                  value={senderDomain}
                  onChange={(e) => setSenderDomain(e.target.value)}
                  className="flex-1 py-1.5 pr-3 text-xs font-mono font-medium text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                >
                  {availableDomains.map((dom) => (
                    <option key={dom} value={dom}>
                      {dom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Emails will be sent as: <span className="font-mono text-slate-700 font-semibold">{senderUsername || 'billing'}@{senderDomain}</span>
            </p>
          </div>

          {/* Recipient Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-slate-700 font-semibold block">
                Recipient Email Address <span className="text-red-500">*</span>
              </label>
              {invoice.client.email && (
                <button
                  type="button"
                  onClick={() => setRecipient(invoice.client.email)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-[11px] transition-colors"
                >
                  Use Client ({invoice.client.email})
                </button>
              )}
            </div>

            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. yourname@gmail.com or client@company.com"
              className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Invoice Summary Pill */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Document</span>
              <span className="font-bold text-slate-900 font-mono">{invoice.invoiceNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Client</span>
              <span className="font-medium text-slate-800">{invoice.client.name}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Due</span>
              <span className="font-bold text-emerald-700 font-mono text-sm">
                {formatCurrency(totals.total, sym, curr)}
              </span>
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs font-medium"
              required
            />
          </div>

          {/* Email Body Message */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Message Text</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs font-sans"
              required
            />
          </div>

          {/* Attach PDF Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="send_attach_pdf"
              checked={attachPdf}
              onChange={(e) => setAttachPdf(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor="send_attach_pdf"
              className="text-slate-700 font-medium cursor-pointer flex items-center gap-1.5"
            >
              <Paperclip className="w-3.5 h-3.5 text-slate-400" />
              Include PDF attachment (Invoice_{invoice.invoiceNumber}.pdf)
            </label>
          </div>

          {/* Result Alert */}
          {sendResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                sendResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {sendResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <p className="font-semibold">{sendResult.message}</p>
                {sendResult.messageId && (
                  <p className="text-[11px] font-mono text-emerald-700 mt-0.5">
                    Resend Message ID: {sendResult.messageId}
                  </p>
                )}
                {onOpenActivityLog && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenActivityLog();
                    }}
                    className="text-[11px] underline font-semibold mt-1 block"
                  >
                    View in Activity Log &rarr;
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending || !recipient}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              {isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {isSending ? 'Sending Email...' : 'Send Invoice Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
