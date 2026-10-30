import React, { useState } from 'react';
import { InvoiceData } from '../../types';
import { INVOICE_TEMPLATES } from '../../data/templatesList';
import { InvoiceRenderer } from '../invoices/InvoiceRenderer';
import { X, Check, Columns3 } from 'lucide-react';

interface TemplateComparisonModalProps {
  invoice: InvoiceData;
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export const TemplateComparisonModal: React.FC<TemplateComparisonModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [slotA, setSlotA] = useState<string>(invoice.templateId || 'classic-business');
  const [slotB, setSlotB] = useState<string>('modern-minimal');
  const [slotC, setSlotC] = useState<string>('luxury-black-gold');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-100 rounded-2xl w-full max-w-7xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        {/* Header */}
        <div className="bg-white p-4 px-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
              <Columns3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Side-by-Side Design Comparison</h3>
              <p className="text-xs text-slate-500">
                Compare 3 distinct layouts rendered simultaneously with your actual invoice data.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Selectors Strip */}
        <div className="bg-white/80 p-3 px-6 border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Column 1 Design
            </label>
            <select
              value={slotA}
              onChange={(e) => setSlotA(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white"
            >
              {INVOICE_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Column 2 Design
            </label>
            <select
              value={slotB}
              onChange={(e) => setSlotB(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white"
            >
              {INVOICE_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Column 3 Design
            </label>
            <select
              value={slotC}
              onChange={(e) => setSlotC(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white"
            >
              {INVOICE_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3-Column Scrollable Preview Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-200/60">
          {/* Column A */}
          <div className="flex flex-col">
            <div className="mb-3 flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <span className="font-bold text-xs text-slate-900 truncate">
                {INVOICE_TEMPLATES.find((t) => t.id === slotA)?.name}
              </span>
              <button
                onClick={() => {
                  onSelectTemplate(slotA);
                  onClose();
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 ${
                  invoice.templateId === slotA
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {invoice.templateId === slotA ? <Check className="w-3.5 h-3.5" /> : null}
                {invoice.templateId === slotA ? 'Active' : 'Choose'}
              </button>
            </div>
            <div className="overflow-hidden rounded-lg shadow-md border border-slate-300 bg-white">
              <div className="scale-[0.58] origin-top -mb-[42%]">
                <InvoiceRenderer invoice={{ ...invoice, templateId: slotA }} />
              </div>
            </div>
          </div>

          {/* Column B */}
          <div className="flex flex-col">
            <div className="mb-3 flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <span className="font-bold text-xs text-slate-900 truncate">
                {INVOICE_TEMPLATES.find((t) => t.id === slotB)?.name}
              </span>
              <button
                onClick={() => {
                  onSelectTemplate(slotB);
                  onClose();
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 ${
                  invoice.templateId === slotB
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {invoice.templateId === slotB ? <Check className="w-3.5 h-3.5" /> : null}
                {invoice.templateId === slotB ? 'Active' : 'Choose'}
              </button>
            </div>
            <div className="overflow-hidden rounded-lg shadow-md border border-slate-300 bg-white">
              <div className="scale-[0.58] origin-top -mb-[42%]">
                <InvoiceRenderer invoice={{ ...invoice, templateId: slotB }} />
              </div>
            </div>
          </div>

          {/* Column C */}
          <div className="flex flex-col">
            <div className="mb-3 flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <span className="font-bold text-xs text-slate-900 truncate">
                {INVOICE_TEMPLATES.find((t) => t.id === slotC)?.name}
              </span>
              <button
                onClick={() => {
                  onSelectTemplate(slotC);
                  onClose();
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 ${
                  invoice.templateId === slotC
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {invoice.templateId === slotC ? <Check className="w-3.5 h-3.5" /> : null}
                {invoice.templateId === slotC ? 'Active' : 'Choose'}
              </button>
            </div>
            <div className="overflow-hidden rounded-lg shadow-md border border-slate-300 bg-white">
              <div className="scale-[0.58] origin-top -mb-[42%]">
                <InvoiceRenderer invoice={{ ...invoice, templateId: slotC }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
