import React, { useState } from 'react';
import { UserPreferences } from '../../types';
import {
  INVOICE_TEMPLATES,
  RECEIPT_TEMPLATES,
  QUOTATION_TEMPLATES,
  EMAIL_TEMPLATES,
} from '../../data/templatesList';
import { X, Check, Bookmark, Settings, Sparkles } from 'lucide-react';

interface UserPreferencesModalProps {
  preferences: UserPreferences;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: UserPreferences) => void;
}

export const UserPreferencesModal: React.FC<UserPreferencesModalProps> = ({
  preferences,
  isOpen,
  onClose,
  onSave,
}) => {
  const [prefs, setPrefs] = useState<UserPreferences>(preferences);
  const [savedStatus, setSavedStatus] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(prefs);
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-200/80 rounded-lg text-slate-800">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Default Template Preferences</h3>
              <p className="text-slate-500 text-[11px]">
                Auto-assigned whenever you create or generate new business documents.
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

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Default Invoice Template */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Default Invoice Template (25 Available)
            </label>
            <select
              value={prefs.defaultInvoiceTemplate}
              onChange={(e) => setPrefs({ ...prefs, defaultInvoiceTemplate: e.target.value })}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white font-medium"
            >
              {INVOICE_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              Will be pre-selected when crafting new client invoices.
            </p>
          </div>

          {/* Default Receipt Template */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Default Payment Receipt Template (12 Available)
            </label>
            <select
              value={prefs.defaultReceiptTemplate}
              onChange={(e) => setPrefs({ ...prefs, defaultReceiptTemplate: e.target.value })}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white font-medium"
            >
              {RECEIPT_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              Used when issuing verified payment confirmation receipts.
            </p>
          </div>

          {/* Default Quotation Template */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Default Quotation & Proposal Template (10 Available)
            </label>
            <select
              value={prefs.defaultQuotationTemplate}
              onChange={(e) => setPrefs({ ...prefs, defaultQuotationTemplate: e.target.value })}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white font-medium"
            >
              {QUOTATION_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              Pre-selected when pitching client projects or proposals.
            </p>
          </div>

          {/* Email Templates Defaults */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wide text-[10px] block">
              Default Automated Email Layouts
            </span>

            <div>
              <label className="block text-slate-600 font-medium mb-1">New Invoice Notification Email</label>
              <select
                value={prefs.defaultInvoiceEmailTemplate}
                onChange={(e) => setPrefs({ ...prefs, defaultInvoiceEmailTemplate: e.target.value })}
                className="w-full py-1.5 px-3 border border-slate-300 rounded-lg text-xs bg-white"
              >
                {EMAIL_TEMPLATES.filter((em) => em.category === 'invoice').map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Payment Confirmation Email</label>
              <select
                value={prefs.defaultPaymentEmailTemplate}
                onChange={(e) => setPrefs({ ...prefs, defaultPaymentEmailTemplate: e.target.value })}
                className="w-full py-1.5 px-3 border border-slate-300 rounded-lg text-xs bg-white"
              >
                {EMAIL_TEMPLATES.filter((em) => em.category === 'payment').map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Payment Reminder Notice</label>
              <select
                value={prefs.defaultReminderEmailTemplate}
                onChange={(e) => setPrefs({ ...prefs, defaultReminderEmailTemplate: e.target.value })}
                className="w-full py-1.5 px-3 border border-slate-300 rounded-lg text-xs bg-white"
              >
                {EMAIL_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Saved locally in browser localStorage
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium shadow-xs flex items-center gap-1.5"
            >
              {savedStatus ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
              {savedStatus ? 'Saved Defaults!' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
