import React, { useState, useEffect } from 'react';
import { SenderConfig, ApprovedDomain } from '../../types';
import {
  X,
  Mail,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  Sparkles,
  Info,
  Server,
  RefreshCw,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface EmailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSenderUpdated?: (sender: SenderConfig) => void;
}

export const EmailSettingsModal: React.FC<EmailSettingsModalProps> = ({
  isOpen,
  onClose,
  onSenderUpdated,
}) => {
  const [username, setUsername] = useState('billing');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [displayName, setDisplayName] = useState('InvoiceCraft Billing');
  const [domains, setDomains] = useState<ApprovedDomain[]>([]);
  const [isResendConfigured, setIsResendConfigured] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Test email state
  const [testRecipient, setTestRecipient] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    messageId?: string;
  } | null>(null);

  // Fetch verified domains and current sender configuration on mount
  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Fetch domains
      const domRes = await fetch('/api/domains');
      const domData = await domRes.json();

      if (domData.ok && Array.isArray(domData.domains)) {
        setDomains(domData.domains);
        setIsResendConfigured(!!domData.isResendConfigured);
        if (domData.resendError) {
          setResendError(domData.resendError);
        }

        // 2. Fetch sender settings
        const senderRes = await fetch('/api/sender-settings');
        const senderData = await senderRes.json();

        if (senderData.ok && senderData.sender) {
          setUsername(senderData.sender.username || 'billing');
          setDisplayName(senderData.sender.displayName || 'InvoiceCraft Billing');
          const domainToUse =
            senderData.sender.domain || domData.domains[0]?.domain || 'yourdomain.com';
          setSelectedDomain(domainToUse);
        } else if (domData.domains.length > 0) {
          setSelectedDomain(domData.domains[0].domain);
        }
      } else {
        setErrorMessage(domData.error || 'Failed to load approved domains list');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not connect to server endpoints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setSaveSuccess(false);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Real-time username validation
  const cleanUsername = username.trim().toLowerCase();
  const usernameError = (() => {
    if (!cleanUsername) return 'Username is required';
    if (cleanUsername.length < 2) return 'Username must be at least 2 characters';
    if (cleanUsername.length > 64) return 'Username cannot exceed 64 characters';
    if (!/^[a-z0-9._-]+$/.test(cleanUsername))
      return 'Only letters, numbers, periods (.), underscores (_), and hyphens (-) allowed';
    if (cleanUsername.startsWith('.') || cleanUsername.endsWith('.'))
      return 'Cannot start or end with a period';
    if (cleanUsername.includes('..')) return 'Cannot contain consecutive periods';
    return null;
  })();

  const fullSenderAddress = `${cleanUsername || 'username'}@${selectedDomain || 'domain.com'}`;
  const fullFormattedSender = displayName.trim()
    ? `"${displayName.trim()}" <${fullSenderAddress}>`
    : fullSenderAddress;

  const currentDomainObj = domains.find((d) => d.domain === selectedDomain);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameError || !selectedDomain) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/sender-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          domain: selectedDomain,
          displayName: displayName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to save sender settings');
      }

      setSaveSuccess(true);
      if (onSenderUpdated && data.sender) {
        onSenderUpdated(data.sender);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Server error saving sender settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testRecipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testRecipient.trim())) {
      setTestResult({
        success: false,
        message: 'Please enter a valid recipient email address for testing.',
      });
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testRecipient.trim(),
          subject: `Test Verification from ${displayName.trim() || cleanUsername}`,
          html: `
            <div style="font-family: sans-serif; padding: 24px; max-width: 500px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <h2 style="color: #0f172a; margin-top: 0;">Sender Verification Test</h2>
              <p style="color: #334155; line-height: 1.5;">This email confirms that your custom sender address <strong>${fullSenderAddress}</strong> is properly configured on InvoiceCraft using Resend.</p>
              <div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 13px; color: #64748b; margin: 16px 0;">
                <div><strong>Sender:</strong> ${fullFormattedSender}</div>
                <div><strong>Timestamp:</strong> ${new Date().toUTCString()}</div>
                <div><strong>Status:</strong> Provider Accepted</div>
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">Dispatched securely via InvoiceCraft & Resend API.</p>
            </div>
          `,
          senderUsername: cleanUsername,
          senderDomain: selectedDomain,
          displayName: displayName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || data.statusDetails || 'Test email failed');
      }

      setTestResult({
        success: true,
        message: `Test email accepted by Resend queue! Message ID: ${data.messageId || 'OK'}`,
        messageId: data.messageId,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Failed to dispatch test email',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs my-8 animate-in fade-in duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-lg shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Custom Sender Email Settings</h3>
              <p className="text-slate-500 text-[11px]">
                Configure authenticated outbound sender address for Resend-verified domains.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Important Mailbox Disclaimer */}
          <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-xl flex items-start gap-2.5 text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11px] leading-relaxed">
              <span className="font-bold block text-amber-950">Outbound Sending Notice:</span>
              <p>
                This setting configures an authorized <strong>outgoing sender address</strong> on your verified domain for dispatching invoices and receipts. It does not create an incoming mailbox or receive emails.
              </p>
            </div>
          </div>

          {/* Resend API Key Status Pill */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck
                className={`w-4 h-4 ${isResendConfigured ? 'text-emerald-600' : 'text-amber-500'}`}
              />
              <div>
                <span className="font-bold text-slate-800">Resend Engine Status</span>
                <p className="text-[11px] text-slate-500">
                  {isResendConfigured
                    ? 'RESEND_API_KEY detected in server environment.'
                    : 'RESEND_API_KEY not yet set (configure in Vercel Environment Variables).'}
                </p>
              </div>
            </div>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-200 transition-colors"
              title="Refresh domain verification status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Sender Address Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username Field */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Sender Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    placeholder="e.g. billing, invoices, john"
                    className={`w-full py-2 px-3 border rounded-lg text-xs font-mono font-medium focus:ring-2 focus:outline-none ${
                      usernameError ? 'border-red-300 focus:ring-red-400' : 'border-slate-300 focus:ring-slate-900'
                    }`}
                    required
                  />
                </div>
                {usernameError ? (
                  <p className="text-[10px] text-red-600 mt-1">{usernameError}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">Letters, numbers, dots, dashes</p>
                )}
              </div>

              {/* Administrator-Approved Domain Selector */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Administrator-Approved Domain <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-2 focus:ring-slate-900"
                  required
                >
                  {domains.map((dom) => (
                    <option key={dom.domain} value={dom.domain}>
                      @{dom.domain} {dom.status === 'verified' ? '✓ (Verified in Resend)' : `(${dom.status})`}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      currentDomainObj?.status === 'verified' ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-slate-500 capitalize">
                    Domain status: <strong>{currentDomainObj?.status || 'pending'}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Display Name Field */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Sender Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Acme Invoicing Team"
                className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-900"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                The friendly name shown to recipients in their email inbox.
              </p>
            </div>

            {/* Live Address Preview Card */}
            <div className="p-4 bg-slate-900 text-white rounded-xl shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
                Live Sender Address Preview
              </span>
              <p className="text-base font-bold font-mono text-emerald-400 tracking-tight">
                {fullFormattedSender}
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                All client invoice dispatches and payment receipts will identify this address.
              </p>
            </div>

            {/* Status alerts */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="text-xs">{errorMessage}</span>
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="text-xs font-semibold">Sender configuration authorized and saved successfully!</span>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving || !!usernameError}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                {isSaving ? 'Validating on Server...' : 'Authorize & Save Sender'}
              </button>
            </div>
          </form>

          {/* Test Email Section */}
          <div className="pt-6 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Verify Delivery with a Test Email</h4>
                <p className="text-[11px] text-slate-500">
                  Send a live test verification email from <span className="font-mono text-slate-700">{fullSenderAddress}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="Enter your personal email (e.g. you@example.com)"
                className="flex-1 py-2 px-3 border border-slate-300 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTest || !testRecipient}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 border border-slate-300 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
              >
                {isSendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {isSendingTest ? 'Sending...' : 'Send Test'}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg border flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <p className="font-semibold">{testResult.message}</p>
                  {testResult.messageId && (
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                      Resend ID: {testResult.messageId}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Vercel & Production Instructions Accordion */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-slate-600 text-[11px] leading-relaxed">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <Server className="w-3.5 h-3.5 text-slate-700" />
              How to configure in Vercel Production
            </span>
            <p>
              In your <strong>Vercel Project Settings &rarr; Environment Variables</strong>, add:
            </p>
            <ul className="list-disc list-inside space-y-0.5 font-mono text-[10px] text-slate-700">
              <li><span className="text-indigo-600 font-bold">RESEND_API_KEY</span>=re_xxxxxxxxxxxx</li>
              <li><span className="text-indigo-600 font-bold">ALLOWED_DOMAINS</span>=yourdomain.com,billing.yourdomain.com</li>
              <li><span className="text-indigo-600 font-bold">FROM_EMAIL</span>=invoices@yourdomain.com</li>
            </ul>
            <p className="text-[10px] text-slate-500 pt-1">
              The server will automatically cross-verify with Resend and enforce that only authorized usernames on these specific domains can send outbound emails.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            InvoiceCraft Resend Outbound System
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
