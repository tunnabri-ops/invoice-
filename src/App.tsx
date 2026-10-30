import React, { useState, useEffect } from 'react';
import {
  DocumentType,
  InvoiceData,
  QuotationData,
  PaymentRecord,
  UserPreferences,
  EmailTemplateData,
  SenderConfig,
} from './types';
import {
  INVOICE_TEMPLATES,
  RECEIPT_TEMPLATES,
  QUOTATION_TEMPLATES,
  EMAIL_TEMPLATES,
} from './data/templatesList';
import {
  INITIAL_INVOICE,
  INITIAL_QUOTATION,
  INITIAL_PAYMENT_RECORDS,
  INITIAL_USER_PREFERENCES,
  calculateTotals,
  formatCurrency,
} from './data/sampleData';
import { InvoiceRenderer } from './components/invoices/InvoiceRenderer';
import { ReceiptRenderer } from './components/receipts/ReceiptRenderer';
import { QuotationRenderer } from './components/quotations/QuotationRenderer';
import { EmailRenderer } from './components/emails/EmailRenderer';
import { TemplateSelector } from './components/gallery/TemplateSelector';
import { TemplateComparisonModal } from './components/comparison/TemplateComparisonModal';
import { CustomizationPanel } from './components/editor/CustomizationPanel';
import { UserPreferencesModal } from './components/preferences/UserPreferencesModal';
import { RecordPaymentModal } from './components/payments/RecordPaymentModal';
import { PreviewModal } from './components/gallery/PreviewModal';
import { EmailSettingsModal } from './components/settings/EmailSettingsModal';
import { EmailActivityModal } from './components/emails/EmailActivityModal';
import { QuickEditInvoiceModal } from './components/editor/QuickEditInvoiceModal';
import { SendInvoiceEmailModal } from './components/emails/SendInvoiceEmailModal';
import {
  FileText,
  Receipt,
  FileSpreadsheet,
  Mail,
  Printer,
  Settings,
  CreditCard,
  Columns3,
  Sliders,
  Sparkles,
  Download,
  CheckCircle,
  Plus,
  RefreshCw,
  Eye,
  LayoutGrid,
  History,
  Send,
  Pencil,
} from 'lucide-react';

export default function App() {
  // Navigation & Document Mode
  const [activeDocType, setActiveDocType] = useState<DocumentType>('invoice');
  const [workspaceView, setWorkspaceView] = useState<'editor' | 'gallery'>('editor');

  // Stored state with localStorage persistence
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('invoicecraft_preferences');
      return saved ? JSON.parse(saved) : INITIAL_USER_PREFERENCES;
    } catch {
      return INITIAL_USER_PREFERENCES;
    }
  });

  const [invoice, setInvoice] = useState<InvoiceData>(() => {
    try {
      const saved = localStorage.getItem('invoicecraft_invoice');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      ...INITIAL_INVOICE,
      templateId: preferences.defaultInvoiceTemplate || 'classic-business',
    };
  });

  const [quotation, setQuotation] = useState<QuotationData>(() => {
    try {
      const saved = localStorage.getItem('invoicecraft_quotation');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      ...INITIAL_QUOTATION,
      templateId: preferences.defaultQuotationTemplate || 'quote-classic',
    };
  });

  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('invoicecraft_payments');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PAYMENT_RECORDS;
  });

  const [selectedEmailTemplateId, setSelectedEmailTemplateId] = useState<string>(
    preferences.defaultInvoiceEmailTemplate || 'email-invoice-sent'
  );

  // Modals state
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [isEmailSettingsOpen, setIsEmailSettingsOpen] = useState(false);
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [isSendInvoiceEmailOpen, setIsSendInvoiceEmailOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('invoicecraft_preferences', JSON.stringify(preferences));
    } catch {}
  }, [preferences]);

  useEffect(() => {
    try {
      localStorage.setItem('invoicecraft_invoice', JSON.stringify(invoice));
    } catch {}
  }, [invoice]);

  useEffect(() => {
    try {
      localStorage.setItem('invoicecraft_quotation', JSON.stringify(quotation));
    } catch {}
  }, [quotation]);

  useEffect(() => {
    try {
      localStorage.setItem('invoicecraft_payments', JSON.stringify(paymentRecords));
    } catch {}
  }, [paymentRecords]);

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    const updatedRecents = [templateId, ...preferences.recentlyUsed.filter((id) => id !== templateId)].slice(0, 8);
    setPreferences({ ...preferences, recentlyUsed: updatedRecents });

    if (activeDocType === 'invoice') {
      setInvoice((prev) => ({ ...prev, templateId }));
    } else if (activeDocType === 'receipt') {
      if (latestPaymentRecord) {
        setPaymentRecords((prev) =>
          prev.map((rec) => (rec.id === latestPaymentRecord.id ? { ...rec, templateId } : rec))
        );
      }
    } else if (activeDocType === 'quotation') {
      setQuotation((prev) => ({ ...prev, templateId }));
    } else if (activeDocType === 'email') {
      setSelectedEmailTemplateId(templateId);
    }

    setWorkspaceView('editor');
  };

  const handleToggleFavorite = (templateId: string) => {
    const isFav = preferences.favorites.includes(templateId);
    const updated = isFav
      ? preferences.favorites.filter((id) => id !== templateId)
      : [...preferences.favorites, templateId];
    setPreferences({ ...preferences, favorites: updated });
  };

  const handleRecordPayment = (newRecord: PaymentRecord) => {
    setPaymentRecords([newRecord, ...paymentRecords]);
    const newPaidAmount = (invoice.paidAmount || 0) + newRecord.amountPaid;
    const totals = invoice.items.reduce((sum, item) => sum + item.rate * item.quantity, 0);
    const isFullyPaid = newPaidAmount >= totals;

    setInvoice((prev) => ({
      ...prev,
      paidAmount: newPaidAmount,
      status: isFullyPaid ? 'paid' : 'partially_paid',
      paidDate: newRecord.paymentDate,
      paymentReference: newRecord.transactionReference,
    }));
  };

  const handleConvertQuoteToInvoice = (quote: QuotationData) => {
    const newInvoice: InvoiceData = {
      id: `inv_from_${quote.id}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      business: quote.business,
      client: quote.client,
      items: quote.items,
      discountType: quote.discountType,
      discountValue: quote.discountValue,
      shipping: 0,
      taxPercent: quote.taxPercent,
      notes: `Converted from accepted quotation #${quote.quotationNumber}. ${quote.notes}`,
      terms: quote.terms,
      paymentDetails: invoice.paymentDetails,
      templateId: preferences.defaultInvoiceTemplate || 'classic-business',
      customization: quote.customization,
      paidAmount: 0,
    };

    setQuotation((prev) => ({
      ...prev,
      status: 'converted',
      convertedInvoiceId: newInvoice.invoiceNumber,
    }));

    setInvoice(newInvoice);
    setActiveDocType('invoice');
    setWorkspaceView('editor');
  };

  const handlePrint = () => {
    window.print();
  };

  const latestPaymentRecord = paymentRecords.find((r) => r.invoiceId === invoice.id) || paymentRecords[0];

  const getCurrentTemplateId = () => {
    if (activeDocType === 'invoice') return invoice.templateId || 'classic-business';
    if (activeDocType === 'receipt') return latestPaymentRecord?.templateId || preferences.defaultReceiptTemplate;
    if (activeDocType === 'quotation') return quotation.templateId || 'quote-classic';
    return selectedEmailTemplateId;
  };

  const currentTemplateList =
    activeDocType === 'invoice'
      ? INVOICE_TEMPLATES
      : activeDocType === 'receipt'
      ? RECEIPT_TEMPLATES
      : activeDocType === 'quotation'
      ? QUOTATION_TEMPLATES
      : EMAIL_TEMPLATES;

  const currentTemplateObj = currentTemplateList.find((t) => t.id === getCurrentTemplateId());
  const selectedEmail = EMAIL_TEMPLATES.find((e) => e.id === selectedEmailTemplateId) || EMAIL_TEMPLATES[0];

  const invoiceTotals = calculateTotals(
    invoice.items,
    invoice.discountType,
    invoice.discountValue,
    invoice.taxPercent,
    invoice.shipping
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* 1. TOP BAR CONTRACT */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black tracking-tight text-base shadow-xs">
            IC
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            InvoiceCraft
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => {
              setActiveDocType('invoice');
              setWorkspaceView('editor');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeDocType === 'invoice'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            Invoices (25)
          </button>

          <button
            onClick={() => {
              setActiveDocType('receipt');
              setWorkspaceView('editor');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeDocType === 'receipt'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            Receipts (12)
          </button>

          <button
            onClick={() => {
              setActiveDocType('quotation');
              setWorkspaceView('editor');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeDocType === 'quotation'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            Quotations (10)
          </button>

          <button
            onClick={() => {
              setActiveDocType('email');
              setWorkspaceView('editor');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeDocType === 'email'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            Emails (15)
          </button>
        </nav>

        {/* Zone 3: Primary Action & Settings */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsEmailSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            title="Configure Resend custom sender email address"
          >
            <Mail className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Sender Email</span>
          </button>

          <button
            onClick={() => setIsPreferencesOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Configure Default Templates"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Vector PDF
          </button>
        </div>
      </header>

      {/* 2. SECONDARY WORKSPACE ACTION STRIP */}
      <div className="no-print bg-white/95 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 backdrop-blur-xs">
        {/* Left: View Switcher (Editor vs Template Gallery) */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setWorkspaceView('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                workspaceView === 'editor'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Editor & Live Preview
            </button>
            <button
              onClick={() => setWorkspaceView('gallery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                workspaceView === 'gallery'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Browse Template Gallery
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs text-slate-500">
            <span>Current Style:</span>
            <span className="font-semibold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">
              {currentTemplateObj?.name || getCurrentTemplateId()}
            </span>
          </div>
        </div>

        {/* Right: Contextual Shortcuts */}
        <div className="flex items-center gap-2">
          {activeDocType === 'invoice' && (
            <>
              <button
                onClick={() => setIsQuickEditOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition-all shadow-2xs hover:shadow-xs"
                title="Edit line items, rates, client & business details"
              >
                <Pencil className="w-3.5 h-3.5 text-amber-700" />
                <span>Edit Invoice</span>
              </button>

              <button
                onClick={() => setIsSendInvoiceEmailOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs hover:shadow-xs"
                title="Send invoice to your Gmail or client"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to Gmail</span>
              </button>

              <button
                onClick={() => setIsRecordPaymentOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Record Payment ({invoice.status === 'paid' ? 'Paid' : 'Issue Receipt'})
              </button>
            </>
          )}

          {activeDocType === 'quotation' && (
            <button
              onClick={() => handleConvertQuoteToInvoice(quotation)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Convert to Invoice
            </button>
          )}

          <button
            onClick={() => setIsActivityLogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            title="View email dispatch log"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Activity</span>
          </button>

          {activeDocType === 'invoice' && (
            <button
              onClick={() => setIsComparisonOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              <Columns3 className="w-3.5 h-3.5" />
              Compare
            </button>
          )}
        </div>
      </div>

      {/* 3. MAIN WORKSPACE VIEWPORT */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
        {/* MODE A: GALLERY BROWSER */}
        {workspaceView === 'gallery' && (
          <div className="no-print animate-in fade-in duration-150">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight capitalize">
                  {activeDocType} Template Library
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose from {currentTemplateList.length} distinct designs with custom layouts, typography, and structure.
                </p>
              </div>

              <button
                onClick={() => setWorkspaceView('editor')}
                className="self-start md:self-auto px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Back to Document Editor
              </button>
            </div>

            <TemplateSelector
              documentType={activeDocType}
              templates={
                activeDocType === 'email'
                  ? EMAIL_TEMPLATES.map((em) => ({
                      id: em.id,
                      name: em.name,
                      category: 'modern',
                      description: em.headline,
                      previewColor: em.bannerColor || '#4f46e5',
                      font: 'font-jakarta',
                    }))
                  : (currentTemplateList as any)
              }
              selectedTemplateId={getCurrentTemplateId()}
              onSelectTemplate={handleSelectTemplate}
              onPreviewTemplate={(id) => setPreviewTemplateId(id)}
              onOpenComparison={() => setIsComparisonOpen(true)}
              favorites={preferences.favorites}
              recentlyUsed={preferences.recentlyUsed}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}

        {/* MODE B: EDITOR & LIVE RENDERER */}
        {workspaceView === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Customization Drawer / Line Item Editor */}
            {activeDocType !== 'email' && (
              <div className="no-print lg:col-span-4 sticky top-28">
                <CustomizationPanel
                  invoice={invoice}
                  onChange={setInvoice}
                  onOpenQuickEdit={() => setIsQuickEditOpen(true)}
                />
              </div>
            )}

            {/* Right: Live Interactive Vector Sheet */}
            <div
              className={`print-document-target ${
                activeDocType === 'email' ? 'lg:col-span-12' : 'lg:col-span-8'
              }`}
            >
              {/* Document Renderers */}
              {activeDocType === 'invoice' && (
                <div className="space-y-4">
                  {/* Unmissable Quick Edit & Dispatch Bar */}
                  <div className="no-print p-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-slate-700/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-xs tracking-wider">
                        INV
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm tracking-tight text-white">
                            Invoice #{invoice.invoiceNumber}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wider">
                            {invoice.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Client: <span className="text-white font-medium">{invoice.client.name}</span> • Total: <span className="text-emerald-300 font-bold">{formatCurrency(invoiceTotals.total, invoice.customization.currencySymbol, invoice.customization.currency)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setIsQuickEditOpen(true)}
                        className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                        title="Click to edit products, prices, client info, and invoice details"
                      >
                        <Pencil className="w-3.5 h-3.5 text-slate-900" />
                        Edit Invoice Data
                      </button>

                      <button
                        onClick={() => setIsSendInvoiceEmailOpen(true)}
                        className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                        title="Send invoice directly to your Gmail (sifurrahman37@gmail.com)"
                      >
                        <Send className="w-3.5 h-3.5 text-white" />
                        Send to My Gmail
                      </button>

                      <button
                        onClick={handlePrint}
                        className="px-3 py-1.5 bg-slate-700/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border border-slate-600"
                        title="Print or Save PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        PDF / Print
                      </button>
                    </div>
                  </div>

                  <InvoiceRenderer invoice={invoice} />
                </div>
              )}

              {activeDocType === 'receipt' && (
                <ReceiptRenderer
                  invoice={invoice}
                  paymentRecord={latestPaymentRecord}
                  templateId={getCurrentTemplateId()}
                  onRecordPayment={() => setIsRecordPaymentOpen(true)}
                />
              )}

              {activeDocType === 'quotation' && (
                <QuotationRenderer
                  quotation={quotation}
                  onConvertToInvoice={handleConvertQuoteToInvoice}
                />
              )}

              {activeDocType === 'email' && (
                <EmailRenderer
                  template={selectedEmail}
                  invoice={invoice}
                  onOpenEmailSettings={() => setIsEmailSettingsOpen(true)}
                  onOpenActivityLog={() => setIsActivityLogOpen(true)}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* 4. MODALS & DRAWERS */}
      {/* Side-by-side design comparison */}
      <TemplateComparisonModal
        invoice={invoice}
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* User Preferences Defaults Modal */}
      <UserPreferencesModal
        preferences={preferences}
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        onSave={setPreferences}
      />

      {/* Record Payment Dialog */}
      <RecordPaymentModal
        invoice={invoice}
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        onPaymentRecorded={handleRecordPayment}
        defaultReceiptTemplate={preferences.defaultReceiptTemplate}
      />

      {/* Full-Scale Preview Modal */}
      {previewTemplateId && (
        <PreviewModal
          documentType={activeDocType}
          templateId={previewTemplateId}
          templateName={
            currentTemplateList.find((t) => t.id === previewTemplateId)?.name || 'Design Preview'
          }
          isOpen={!!previewTemplateId}
          onClose={() => setPreviewTemplateId(null)}
          onSelectTemplate={handleSelectTemplate}
          invoice={invoice}
          quotation={quotation}
          paymentRecord={latestPaymentRecord}
          onPrint={handlePrint}
        />
      )}

      {/* Custom Sender Email Settings Modal */}
      <EmailSettingsModal
        isOpen={isEmailSettingsOpen}
        onClose={() => setIsEmailSettingsOpen(false)}
      />

      {/* Outbound Email Activity Log Modal */}
      <EmailActivityModal
        isOpen={isActivityLogOpen}
        onClose={() => setIsActivityLogOpen(false)}
      />

      {/* Direct Full Quick Edit Invoice Modal */}
      <QuickEditInvoiceModal
        invoice={invoice}
        isOpen={isQuickEditOpen}
        onClose={() => setIsQuickEditOpen(false)}
        onSave={(updated) => setInvoice(updated)}
      />

      {/* 1-Click Send to Gmail Modal */}
      <SendInvoiceEmailModal
        invoice={invoice}
        isOpen={isSendInvoiceEmailOpen}
        onClose={() => setIsSendInvoiceEmailOpen(false)}
        onOpenActivityLog={() => setIsActivityLogOpen(true)}
        userEmail="sifurrahman37@gmail.com"
      />
    </div>
  );
}
