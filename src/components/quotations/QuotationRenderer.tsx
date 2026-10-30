import React from 'react';
import { QuotationData } from '../../types';
import { calculateTotals, formatCurrency, PRESET_LOGOS } from '../../data/sampleData';
import { FileText, ArrowRight, CheckCircle2, Clock, Calendar, Sparkles } from 'lucide-react';

interface QuotationRendererProps {
  quotation: QuotationData;
  onConvertToInvoice?: (quotation: QuotationData) => void;
  printMode?: boolean;
}

export const QuotationRenderer: React.FC<QuotationRendererProps> = ({
  quotation,
  onConvertToInvoice,
  printMode = false,
}) => {
  const { business, client, items, customization } = quotation;
  const totals = calculateTotals(
    items,
    quotation.discountType,
    quotation.discountValue,
    quotation.taxPercent,
    0
  );

  const sym = customization.currencySymbol || '$';
  const curr = customization.currency || 'USD';
  const templateId = quotation.templateId || 'quote-classic';

  const renderStatusBadge = () => {
    switch (quotation.status) {
      case 'accepted':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">Accepted</span>;
      case 'converted':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">Converted to Invoice</span>;
      case 'expired':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">Expired</span>;
      default:
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">Official Quotation</span>;
    }
  };

  return (
    <div
      className={`quotation-document-sheet bg-white text-slate-800 shadow-xl mx-auto print-document-container transition-all duration-150 ${
        printMode ? 'w-full shadow-none p-0' : 'w-full max-w-[800px] rounded-sm'
      }`}
    >
      {/* Conversion Banner if not printed */}
      {!printMode && quotation.status !== 'converted' && onConvertToInvoice && (
        <div className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center text-xs rounded-t-sm no-print">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Quotation status: <strong className="capitalize">{quotation.status}</strong></span>
          </div>
          <button
            onClick={() => onConvertToInvoice(quotation)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition-colors"
          >
            Convert to Invoice
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. CLASSIC PROPOSAL QUOTATION */}
      {templateId === 'quote-classic' && (
        <div className="p-10 md:p-12 flex flex-col justify-between min-h-[980px]">
          <div>
            <div className="flex justify-between items-start pb-8 border-b-2 border-slate-900">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{business.name}</h1>
                <p className="text-xs text-slate-500">{business.email} · {business.phone}</p>
                <div className="mt-2">{renderStatusBadge()}</div>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase font-bold text-slate-400">Formal Quotation</span>
                <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{quotation.quotationNumber}</p>
                <p className="text-xs text-slate-600 mt-1">Issue: {quotation.issueDate}</p>
                <p className="text-xs font-semibold text-rose-700">Valid Until: {quotation.validUntil}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 my-8 text-xs bg-slate-50 p-5 rounded border border-slate-200">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block mb-1">Prepared For</span>
                <p className="font-bold text-slate-900 text-sm">{client.name}</p>
                <p className="text-slate-700">{client.company}</p>
                <p className="text-slate-600">{client.address}, {client.city}</p>
                <p className="text-slate-500">{client.email}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block mb-1">Project Scope Overview</span>
                <p className="text-slate-700 leading-relaxed text-[11px]">{quotation.projectScopeOverview}</p>
              </div>
            </div>

            {quotation.deliverables && quotation.deliverables.length > 0 && (
              <div className="mb-6 p-4 bg-purple-50/50 rounded border border-purple-100 text-xs">
                <span className="font-bold text-purple-900 block mb-2">Key Scope Deliverables:</span>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  {quotation.deliverables.map((del, i) => (
                    <li key={i}>{del}</li>
                  ))}
                </ul>
              </div>
            )}

            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                  <th className="py-2.5 px-3 text-left">Proposed Deliverable</th>
                  <th className="py-2.5 px-3 text-right">Units</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Estimated Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/60' : ''}>
                    <td className="py-3 px-3 font-semibold text-slate-900">{item.description}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700">{item.quantity}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-slate-900">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end">
              <div className="w-72 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Subtotal</span>
                  <span className="tabular-nums font-semibold">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Applicable Tax</span>
                    <span className="tabular-nums font-semibold">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-2 border-t-2 border-slate-900 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Estimated Cost</span>
                  <span className="tabular-nums text-base">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 grid grid-cols-2 gap-8 items-end">
            <div>
              <p className="font-bold text-slate-800">Proposal Terms:</p>
              <p className="text-[11px] leading-relaxed mt-0.5">{quotation.terms}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-400 mb-6">Client Acceptance Signature / Date</p>
              <div className="border-b border-slate-400 w-48 ml-auto" />
            </div>
          </div>
        </div>
      )}

      {/* 2. CREATIVE PROJECT ESTIMATE */}
      {templateId === 'quote-creative' && (
        <div className="p-10 md:p-12 flex flex-col justify-between min-h-[980px] bg-slate-50">
          <div>
            <div className="flex justify-between items-start pb-8 border-b-2 border-purple-600">
              <div>
                <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 uppercase tracking-widest rounded">
                  Creative Scope Estimate
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 mt-2">{business.name}</h1>
                <p className="text-xs text-slate-500">{business.website}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-purple-600 uppercase">Estimate Ref</p>
                <p className="text-xl font-bold font-mono text-slate-900">{quotation.quotationNumber}</p>
                <p className="text-xs text-slate-500 mt-1">Valid: {quotation.validUntil}</p>
              </div>
            </div>

            <div className="my-6 p-5 bg-white rounded-xl border border-purple-100 text-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Project Brief for {client.company}</h3>
              <p className="text-slate-600 leading-relaxed">{quotation.projectScopeOverview}</p>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="bg-purple-900 text-white font-bold text-[11px] uppercase">
                  <th className="py-2.5 px-3 text-left">Creative Milestone</th>
                  <th className="py-2.5 px-3 text-right">Units</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Quote</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100 bg-white">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-semibold text-slate-900">{item.description}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-600">{item.quantity}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-600">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-purple-900">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end">
              <div className="w-72 bg-purple-900 text-white p-4 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-purple-200">
                  <span>Subtotal:</span>
                  <span className="tabular-nums">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                <div className="pt-2 border-t border-purple-700 flex justify-between font-bold text-sm text-white">
                  <span>Estimated Total:</span>
                  <span className="tabular-nums text-base text-purple-200">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
            <p>{quotation.terms}</p>
            <p className="font-mono text-purple-700 font-semibold">1-Click Acceptance Ready</p>
          </div>
        </div>
      )}

      {/* 3. MODERN SAAS AGREEMENT */}
      {templateId === 'quote-modern-saas' && (
        <div className="p-10 md:p-12 flex flex-col justify-between min-h-[980px]">
          <div>
            <div className="flex justify-between items-start pb-6 border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold">
                  S
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{business.name}</h1>
                  <p className="text-xs text-indigo-600 font-medium">Enterprise Software Subscription Proposal</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase">Quote ID</p>
                <p className="text-lg font-mono font-bold text-slate-900">{quotation.quotationNumber}</p>
                <p className="text-xs text-slate-500">Lock-in rate expires: {quotation.validUntil}</p>
              </div>
            </div>

            <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Client Organization</span>
              <p className="font-bold text-slate-900 text-sm">{client.company} (Attn: {client.name})</p>
              <p className="text-slate-600 text-[11px]">{quotation.projectScopeOverview}</p>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3 text-left">Subscription & SLA Module</th>
                  <th className="py-2.5 px-3 text-right">Seats / Tier</th>
                  <th className="py-2.5 px-3 text-right">Annual Rate</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-medium text-slate-900">{item.description}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-600">{item.quantity}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-600">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-indigo-900">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end">
              <div className="w-72 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Annual Software Commitment</span>
                  <span className="tabular-nums font-semibold">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                <div className="pt-2 border-t border-indigo-600 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Proposed Annual Fee</span>
                  <span className="tabular-nums text-base text-indigo-600">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
            <p>99.9% Uptime SLA Guaranteed under Master Services Agreement.</p>
            <p className="font-mono text-indigo-700 font-bold">DIGITAL ACCEPTANCE READY</p>
          </div>
        </div>
      )}

      {/* 4. EXECUTIVE CONSULTING PROPOSAL */}
      {templateId === 'quote-consulting' && (
        <div className="p-10 md:p-14 flex flex-col justify-between min-h-[980px]">
          <div>
            <div className="flex justify-between items-start pb-8 border-b-2 border-slate-800">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{business.name}</h1>
                <p className="text-xs text-slate-500 font-serif italic">Strategic Management Consulting Proposal</p>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase font-bold text-slate-400">Proposal #{quotation.quotationNumber}</span>
                <p className="text-xs text-slate-600 mt-1">Valid Through: {quotation.validUntil}</p>
              </div>
            </div>

            <div className="my-8 text-xs space-y-4">
              <div className="p-4 bg-slate-50 rounded border border-slate-200">
                <span className="font-bold text-slate-800 uppercase text-[10px] block mb-1">Executive Preamble</span>
                <p className="text-slate-700 text-[11px] leading-relaxed">{quotation.projectScopeOverview}</p>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-slate-800 text-slate-900 font-bold uppercase text-[11px]">
                  <th className="py-2.5 text-left">Phase Workstream</th>
                  <th className="py-2.5 text-right">Units</th>
                  <th className="py-2.5 text-right">Fee Rate</th>
                  <th className="py-2.5 text-right">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-semibold text-slate-900">{item.description}</td>
                    <td className="py-3 text-right tabular-nums text-slate-700">{item.quantity}</td>
                    <td className="py-3 text-right tabular-nums text-slate-700">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3 text-right tabular-nums font-bold text-slate-900">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end">
              <div className="w-72 space-y-1 text-xs">
                <div className="pt-2 border-t-2 border-slate-900 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Proposed Advisory Fee</span>
                  <span className="tabular-nums text-base">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
            <p>Terms: {quotation.terms}</p>
            <p className="font-mono text-[11px]">Authorized Engagement Proposal</p>
          </div>
        </div>
      )}

      {/* 5. MINIMAL CLEAN ESTIMATE */}
      {templateId === 'quote-minimal' && (
        <div className="p-10 md:p-14 min-h-[980px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-baseline pb-8 border-b border-slate-100">
              <div>
                <span className="text-[10px] tracking-widest uppercase text-slate-400 block mb-1">Estimate</span>
                <h1 className="text-2xl font-light text-slate-900">{business.name}</h1>
              </div>
              <div className="text-right">
                <p className="text-xl font-light text-slate-900">{quotation.quotationNumber}</p>
                <p className="text-xs text-slate-400 mt-1">Valid: {quotation.validUntil}</p>
              </div>
            </div>

            <div className="py-6 border-b border-slate-100 text-xs">
              <span className="text-[10px] uppercase text-slate-400 block mb-1">Target Client</span>
              <p className="font-medium text-slate-900">{client.name} ({client.company})</p>
              <p className="text-slate-500 mt-1">{quotation.projectScopeOverview}</p>
            </div>

            <table className="w-full text-xs my-6">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[11px] uppercase">
                  <th className="py-2.5 text-left">Item</th>
                  <th className="py-2.5 text-right">Qty</th>
                  <th className="py-2.5 text-right">Price</th>
                  <th className="py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-normal text-slate-800">{item.description}</td>
                    <td className="py-3 text-right tabular-nums text-slate-500">{item.quantity}</td>
                    <td className="py-3 text-right tabular-nums text-slate-500">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3 text-right tabular-nums font-medium text-slate-900">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex justify-end">
              <div className="w-64 space-y-1 text-xs">
                <div className="pt-2 border-t border-slate-900 flex justify-between font-medium text-sm text-slate-900">
                  <span>Estimated Total</span>
                  <span className="text-base tabular-nums">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
            <p>{business.email}</p>
            <p>Ready to approve</p>
          </div>
        </div>
      )}

      {/* 6. TRADES & CONSTRUCTION QUOTE */}
      {templateId === 'quote-construction-trades' && (
        <div className="p-8 md:p-10 min-h-[980px] flex flex-col justify-between border-2 border-amber-900">
          <div>
            <div className="bg-amber-900 text-white p-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold uppercase">{business.name}</h1>
                <p className="text-xs text-amber-200">Contractor & Building Services Quotation</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-amber-300">QUOTE NO.</p>
                <p className="text-xl font-mono font-bold">{quotation.quotationNumber}</p>
              </div>
            </div>

            <div className="my-6 p-4 bg-amber-50/50 border border-amber-200 text-xs grid grid-cols-2 gap-4">
              <div>
                <span className="text-amber-900 font-bold uppercase text-[10px] block">Job Site Address</span>
                <p className="font-bold text-slate-900 mt-1">{client.address}, {client.city}</p>
                <p className="text-slate-600">Client: {client.name} ({client.phone})</p>
              </div>
              <div className="text-right">
                <span className="text-amber-900 font-bold uppercase text-[10px] block">Estimate Validity</span>
                <p className="font-bold text-slate-900 mt-1">{quotation.validUntil}</p>
                <p className="text-slate-600">Materials guaranteed 30 days</p>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-800 text-white uppercase text-[11px] font-bold">
                  <th className="py-2.5 px-3 text-left">Trade Material & Labor Scope</th>
                  <th className="py-2.5 px-3 text-right">Units</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-semibold text-slate-900">{item.description}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700">{item.quantity}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-slate-900">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end">
              <div className="w-72 bg-amber-50 p-4 border border-amber-300 space-y-1 text-xs">
                <div className="pt-2 border-t border-amber-900 flex justify-between font-bold text-sm text-amber-950">
                  <span>Grand Total Estimate:</span>
                  <span className="text-base tabular-nums">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-amber-900 text-xs text-slate-600 flex justify-between items-center">
            <p>50% Deposit required before material purchase & mobilization.</p>
            <div className="border-b border-slate-400 w-44 pb-2 text-center text-[10px] text-slate-400">
              Client Signature of Acceptance
            </div>
          </div>
        </div>
      )}

      {/* 7. AGENCY RETAINER QUOTATION */}
      {templateId === 'quote-agency-retainer' && (
        <div className="p-10 md:p-12 min-h-[980px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start pb-6 border-b-2 border-cyan-700">
              <div>
                <span className="text-[10px] font-bold text-cyan-700 uppercase">Monthly Agency Retainer Proposal</span>
                <h1 className="text-3xl font-extrabold text-slate-900 mt-1">{business.name}</h1>
                <p className="text-xs text-slate-500">{business.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-mono font-bold text-slate-900">{quotation.quotationNumber}</p>
                <p className="text-xs text-slate-500 mt-1">Valid: {quotation.validUntil}</p>
              </div>
            </div>

            <div className="my-6 p-4 bg-cyan-50/50 rounded-lg border border-cyan-200 text-xs">
              <p className="font-bold text-slate-900">Dedicated Retainer Scope for {client.company}</p>
              <p className="text-slate-600 mt-1 text-[11px]">{quotation.projectScopeOverview}</p>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="bg-cyan-900 text-white font-bold text-[11px] uppercase">
                  <th className="py-2.5 px-3 text-left">Monthly Dedicated Allocation</th>
                  <th className="py-2.5 px-3 text-right">Committed Hours</th>
                  <th className="py-2.5 px-3 text-right">Retainer Rate</th>
                  <th className="py-2.5 px-3 text-right">Monthly Investment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-semibold text-slate-900">{item.description}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700">{item.quantity}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-cyan-950">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end">
              <div className="w-72 space-y-1 text-xs">
                <div className="pt-2 border-t-2 border-cyan-700 flex justify-between font-bold text-sm text-slate-900">
                  <span>Proposed Monthly Retainer:</span>
                  <span className="text-base tabular-nums text-cyan-800">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
            <p>Retainer hours rollover up to 60 calendar days.</p>
            <p className="font-mono text-cyan-700">Digital Sign-off Enabled</p>
          </div>
        </div>
      )}

      {/* 8. CORPORATE RFP FORMAL QUOTATION */}
      {templateId === 'quote-corporate-rfp' && (
        <div className="p-10 md:p-12 min-h-[980px] flex flex-col justify-between border border-slate-400">
          <div>
            <div className="flex justify-between items-start pb-6 border-b-2 border-slate-800">
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">{business.name}</h1>
                <p className="text-xs text-slate-600">Enterprise Procurement & Commercial Tender Bid</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">DUNS / Vendor ID: {business.taxId}</p>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase font-bold text-slate-500">Commercial Tender</span>
                <p className="text-xl font-mono font-bold text-slate-900">{quotation.quotationNumber}</p>
                <p className="text-xs text-slate-600 mt-1">Bid Expiry: {quotation.validUntil}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-6 text-xs bg-slate-50 p-4 border border-slate-300">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Procuring Entity</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{client.company}</p>
                <p className="text-slate-600">Attn: Procurement Officer ({client.name})</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 uppercase font-bold text-[10px] block">RFP Solicitation Ref</span>
                <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{client.poNumber || 'RFP-GLOBAL-2026'}</p>
                <p className="text-slate-500 text-[11px]">SOC2 Type II & ISO 27001 Compliant</p>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase">
                  <th className="py-2.5 px-3 text-left">Contract Line Item (CLIN)</th>
                  <th className="py-2.5 px-3 text-right">Units</th>
                  <th className="py-2.5 px-3 text-right">Firm Fixed Price</th>
                  <th className="py-2.5 px-3 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-semibold text-slate-900">{item.description}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700">{item.quantity}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-slate-900">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end">
              <div className="w-72 space-y-1 text-xs">
                <div className="pt-2 border-t-2 border-slate-900 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Firm Fixed Price:</span>
                  <span className="text-base tabular-nums">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-300 text-xs text-slate-500 flex justify-between items-center">
            <p>Binding offer valid under commercial RFP terms through {quotation.validUntil}.</p>
            <div className="border-b border-slate-400 w-44 pb-2 text-center text-[10px] text-slate-400">
              Corporate Officer Signature
            </div>
          </div>
        </div>
      )}

      {/* 9. LUXURY BESPOKE COMMISSION */}
      {templateId === 'quote-luxury' && (
        <div className="p-10 md:p-14 min-h-[980px] flex flex-col justify-between font-playfair bg-[#0e0f11] text-[#f4ecd8] border-[6px] border-[#1d1e22]">
          <div>
            <div className="text-center pb-8 border-b border-[#d4af37]/40">
              <h1 className="text-2xl font-serif tracking-[0.25em] uppercase text-[#d4af37]">{business.name}</h1>
              <p className="text-[10px] text-[#c8b99d] tracking-widest uppercase mt-1">Bespoke Commission Proposal & Estimate</p>
              <p className="text-xs text-[#a89b83] font-serif mt-2">Commission #{quotation.quotationNumber} · Reserved until {quotation.validUntil}</p>
            </div>

            <div className="my-8 text-center text-xs font-serif">
              <p className="text-[#c8b99d] tracking-widest uppercase text-[10px]">Prepared Exclusively For</p>
              <p className="text-lg text-white font-medium mt-1">{client.name}</p>
              <p className="text-[#a89b83]">{client.company}</p>
              <p className="text-xs text-[#d0c2a8] italic mt-3 max-w-md mx-auto leading-relaxed">
                "{quotation.projectScopeOverview}"
              </p>
            </div>

            <table className="w-full text-xs font-serif my-6">
              <thead>
                <tr className="border-b border-[#d4af37]/40 text-[#d4af37] text-[11px] uppercase tracking-widest">
                  <th className="py-2.5 text-left">Craftsmanship Scope</th>
                  <th className="py-2.5 text-right">Units</th>
                  <th className="py-2.5 text-right">Valuation Rate</th>
                  <th className="py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2b2e]">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 text-[#f7f0e0]">{item.description}</td>
                    <td className="py-3 text-right tabular-nums text-[#d0c2a8]">{item.quantity}</td>
                    <td className="py-3 text-right tabular-nums text-[#d0c2a8]">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3 text-right tabular-nums text-[#d4af37] font-medium">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end font-serif">
              <div className="w-64 space-y-1 text-xs">
                <div className="pt-2 border-t border-[#d4af37]/60 flex justify-between font-serif text-sm text-[#d4af37]">
                  <span className="uppercase tracking-widest">Total Valuation:</span>
                  <span className="text-base tabular-nums font-light">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] font-serif tracking-widest text-[#a89b83] uppercase pt-6 border-t border-[#d4af37]/20">
            <p>Crafted by appointment · Geneva · Paris · London</p>
          </div>
        </div>
      )}

      {/* 10. QUICK FREELANCER PITCH QUOTE */}
      {templateId === 'quote-freelancer-quick' && (
        <div className="p-8 md:p-12 min-h-[980px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start pb-6 border-b border-teal-100">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase">Project Proposal & Pitch</span>
                <h1 className="text-2xl font-bold text-slate-900 mt-1">{business.name}</h1>
                <p className="text-xs text-slate-500">{business.email}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">{quotation.quotationNumber}</p>
                <p className="text-xs text-slate-500">Valid: {quotation.validUntil}</p>
              </div>
            </div>

            <div className="my-6 p-5 bg-teal-50/50 rounded-xl border border-teal-100 text-xs">
              <p className="font-bold text-teal-900 text-sm mb-1">Hi {client.name}!</p>
              <p className="text-slate-700 leading-relaxed">
                Thank you for reviewing this proposal! Here is the clear scope and transparent pricing for {client.company}.
                Once you are ready, you can accept this proposal with a single click and we can begin right away.
              </p>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-teal-200 text-teal-900 font-bold uppercase text-[11px]">
                  <th className="py-2.5 text-left">Deliverable</th>
                  <th className="py-2.5 text-right">Hours</th>
                  <th className="py-2.5 text-right">Rate</th>
                  <th className="py-2.5 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-medium text-slate-800">{item.description}</td>
                    <td className="py-3 text-right tabular-nums text-slate-600">{item.quantity}</td>
                    <td className="py-3 text-right tabular-nums text-slate-600">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3 text-right tabular-nums font-bold text-slate-900">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-1 text-xs">
                <div className="pt-2 border-t-2 border-teal-600 flex justify-between font-bold text-sm text-slate-900">
                  <span>Project Total:</span>
                  <span className="tabular-nums text-teal-700 text-lg">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
            <p>Turnaround: Within 10 business days of deposit</p>
            <p className="text-teal-700 font-bold">1-Click Convert to Invoice Available</p>
          </div>
        </div>
      )}
    </div>
  );
};
