import React from 'react';
import { InvoiceData } from '../../types';
import { calculateTotals, formatCurrency, PRESET_LOGOS } from '../../data/sampleData';
import { CheckCircle2, QrCode, Building, Mail, Phone, Globe, ShieldCheck } from 'lucide-react';

interface InvoiceRendererProps {
  invoice: InvoiceData;
  scale?: number;
  printMode?: boolean;
}

export const InvoiceRenderer: React.FC<InvoiceRendererProps> = ({
  invoice,
  scale = 1,
  printMode = false,
}) => {
  const { business, client, items, customization, paymentDetails } = invoice;
  const totals = calculateTotals(
    items,
    invoice.discountType,
    invoice.discountValue,
    invoice.taxPercent,
    invoice.shipping
  );

  const primary = customization.primaryColor || '#1e293b';
  const accent = customization.accentColor || '#4f46e5';
  const fontFamilyClass = customization.fontFamily || 'font-jakarta';
  const sym = customization.currencySymbol || '$';
  const curr = customization.currency || 'USD';

  // Find logo if preset or custom URL
  const selectedLogoPreset = PRESET_LOGOS.find((l) => l.name === business.name) || PRESET_LOGOS[0];

  const renderLogo = () => {
    if (business.logoUrl) {
      return (
        <img
          src={business.logoUrl}
          alt={business.name}
          className="object-contain"
          style={{ maxHeight: `${customization.logoSize}px` }}
        />
      );
    }
    return (
      <div
        className="flex items-center justify-center rounded-lg"
        style={{
          width: `${customization.logoSize}px`,
          height: `${customization.logoSize}px`,
          color: primary,
        }}
        dangerouslySetInnerHTML={{ __html: selectedLogoPreset.svg }}
      />
    );
  };

  const templateId = invoice.templateId || 'classic-business';

  // Base styling for the standard A4 container
  // A4 ratio is ~1 : 1.414 (e.g. 794px x 1123px or responsive)
  return (
    <div
      className={`invoice-document-sheet bg-white text-slate-800 shadow-xl transition-all duration-150 mx-auto print-document-container ${fontFamilyClass} ${
        printMode ? 'w-full shadow-none p-0' : 'w-full max-w-[820px] rounded-sm'
      }`}
      style={{
        minHeight: printMode ? 'auto' : '1080px',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
      }}
    >
      {/* 1. CLASSIC BUSINESS */}
      {templateId === 'classic-business' && (
        <div className="p-10 md:p-12 flex flex-col justify-between min-h-[1050px]">
          <div>
            {/* Header */}
            <div className="flex justify-between items-start pb-8 border-b-2 border-slate-900">
              <div className="flex items-center gap-4">
                {renderLogo()}
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">{business.name}</h1>
                  <p className="text-xs text-slate-500">{business.legalName || business.name}</p>
                  <p className="text-xs text-slate-500">{business.taxId}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">Official Invoice</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">{invoice.invoiceNumber}</h2>
                <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                  <p><span className="text-slate-400">Date:</span> {invoice.issueDate}</p>
                  <p><span className="text-slate-400">Due:</span> <strong className="text-slate-900">{invoice.dueDate}</strong></p>
                </div>
              </div>
            </div>

            {/* Billed To / From Split */}
            <div className="grid grid-cols-2 gap-8 py-6 border-b border-slate-200 text-xs">
              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">Billed To</span>
                <p className="font-bold text-sm text-slate-900">{client.name}</p>
                <p className="font-medium text-slate-700">{client.company}</p>
                <p className="text-slate-600 mt-1">{client.address}, {client.city}, {client.state} {client.postalCode}</p>
                <p className="text-slate-500">{client.email} · {client.phone}</p>
                {client.poNumber && <p className="text-slate-700 font-mono mt-1">PO: {client.poNumber}</p>}
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">Issued By</span>
                <p className="font-bold text-slate-900">{business.name}</p>
                <p className="text-slate-600">{business.address}</p>
                <p className="text-slate-600">{business.city}, {business.state} {business.postalCode}</p>
                <p className="text-slate-500">{business.email} · {business.phone}</p>
                <p className="text-slate-500">{business.website}</p>
              </div>
            </div>

            {/* Table */}
            <div className="mt-8">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-800 text-slate-900 font-bold uppercase tracking-wider">
                    <th className="py-3 pr-4">Description</th>
                    {customization.showSkuColumn && <th className="py-3 px-3">SKU / Code</th>}
                    <th className="py-3 px-3 text-right">Qty</th>
                    <th className="py-3 px-3 text-right">Rate</th>
                    <th className="py-3 pl-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, idx) => (
                    <tr key={item.id || idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : ''}>
                      <td className="py-3.5 pr-4">
                        <span className="font-semibold text-slate-900 block">{item.description}</span>
                        {item.category && <span className="text-[11px] text-slate-500">{item.category}</span>}
                      </td>
                      {customization.showSkuColumn && (
                        <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{item.sku || '—'}</td>
                      )}
                      <td className="py-3.5 px-3 text-right tabular-nums text-slate-700 font-medium">{item.quantity}</td>
                      <td className="py-3.5 px-3 text-right tabular-nums text-slate-700 font-medium">{formatCurrency(item.rate, sym, curr)}</td>
                      <td className="py-3.5 pl-4 text-right tabular-nums font-semibold text-slate-900">
                        {formatCurrency(item.quantity * item.rate, sym, curr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="mt-8 flex justify-end">
              <div className="w-72 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({invoice.discountValue}%)</span>
                    <span className="tabular-nums font-medium">-{formatCurrency(totals.discountAmount, sym, curr)}</span>
                  </div>
                )}
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Tax ({invoice.taxPercent}%)</span>
                    <span className="tabular-nums font-medium">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                {invoice.shipping > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span className="tabular-nums font-medium">+{formatCurrency(invoice.shipping, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-baseline font-bold text-sm text-slate-900">
                  <span className="uppercase tracking-wider">Total Due</span>
                  <span className="text-xl tabular-nums">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer & Banking */}
          <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-600 grid grid-cols-2 gap-8">
            <div>
              <p className="font-bold text-slate-900 mb-1">Payment Instructions</p>
              <p className="text-[11px] text-slate-600">Bank: {paymentDetails.bankName}</p>
              <p className="text-[11px] text-slate-600">Account: {paymentDetails.accountName} ({paymentDetails.accountNumber})</p>
              <p className="text-[11px] text-slate-600 font-mono">Routing: {paymentDetails.routingOrSort} {paymentDetails.swift ? `· SWIFT: ${paymentDetails.swift}` : ''}</p>
              {paymentDetails.iban && <p className="text-[11px] text-slate-600 font-mono">IBAN: {paymentDetails.iban}</p>}
            </div>
            <div className="text-right space-y-1">
              <p className="text-[11px] text-slate-500 italic">{invoice.terms}</p>
              <p className="text-[11px] text-slate-400">{invoice.notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODERN MINIMAL */}
      {templateId === 'modern-minimal' && (
        <div className="p-12 md:p-16 flex flex-col justify-between min-h-[1050px]">
          <div>
            <div className="flex justify-between items-baseline mb-16">
              <div>
                <h1 className="text-lg font-light tracking-widest uppercase text-slate-400">Invoice</h1>
                <p className="text-3xl font-medium tracking-tight text-slate-900 mt-1">{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{business.name}</p>
                <p className="text-xs text-slate-400 font-light mt-0.5">{business.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 py-8 border-t border-b border-slate-100 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Client</span>
                <p className="font-semibold text-slate-900">{client.name}</p>
                <p className="text-slate-600">{client.company}</p>
                <p className="text-slate-500 mt-0.5">{client.city}, {client.country}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Issue Date</span>
                <p className="text-slate-800 font-medium">{invoice.issueDate}</p>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block mt-2 mb-1">Due Date</span>
                <p className="text-slate-900 font-semibold">{invoice.dueDate}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Amount Due</span>
                <p className="text-2xl font-light tabular-nums text-slate-900">{formatCurrency(totals.total, sym, curr)}</p>
              </div>
            </div>

            <div className="mt-10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-normal uppercase tracking-wider text-[11px]">
                    <th className="py-3 text-left">Item</th>
                    <th className="py-3 text-right">Qty</th>
                    <th className="py-3 text-right">Price</th>
                    <th className="py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-4 pr-4">
                        <span className="text-slate-800 font-normal block">{item.description}</span>
                      </td>
                      <td className="py-4 text-right tabular-nums text-slate-500">{item.quantity}</td>
                      <td className="py-4 text-right tabular-nums text-slate-500">{formatCurrency(item.rate, sym, curr)}</td>
                      <td className="py-4 text-right tabular-nums font-medium text-slate-900">
                        {formatCurrency(item.quantity * item.rate, sym, curr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Tax ({invoice.taxPercent}%)</span>
                    <span className="tabular-nums">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-900 flex justify-between font-medium text-sm text-slate-900">
                  <span>Total</span>
                  <span className="text-lg tabular-nums">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-6 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
            <p>{business.name} · {business.website}</p>
            <p>IBAN: {paymentDetails.iban || paymentDetails.accountNumber}</p>
          </div>
        </div>
      )}

      {/* 3. CORPORATE BLUE */}
      {templateId === 'corporate-blue' && (
        <div className="flex flex-col justify-between min-h-[1050px]">
          <div>
            {/* Blue Banner */}
            <div className="bg-slate-900 text-white p-10 md:p-12 flex justify-between items-center" style={{ backgroundColor: primary }}>
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded text-slate-900">
                  {renderLogo()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{business.name}</h1>
                  <p className="text-xs text-blue-200">{business.website} · {business.email}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase tracking-widest text-blue-200">Invoice</span>
                <p className="text-2xl font-bold font-mono">{invoice.invoiceNumber}</p>
              </div>
            </div>

            <div className="p-10 md:p-12">
              <div className="grid grid-cols-2 gap-8 bg-blue-50/50 p-6 rounded-lg border border-blue-100 mb-8 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide block mb-1">Invoice Recipient</span>
                  <p className="font-bold text-sm text-slate-900">{client.name}</p>
                  <p className="text-slate-700">{client.company}</p>
                  <p className="text-slate-600">{client.address}, {client.city}</p>
                  <p className="text-slate-500 mt-1">{client.email}</p>
                </div>
                <div className="text-right space-y-1">
                  <p><span className="text-slate-500">Invoice Date:</span> <strong className="text-slate-800">{invoice.issueDate}</strong></p>
                  <p><span className="text-slate-500">Payment Due:</span> <strong className="text-blue-900">{invoice.dueDate}</strong></p>
                  <p><span className="text-slate-500">Tax Registration:</span> <span className="font-mono text-slate-700">{business.taxId}</span></p>
                  {client.poNumber && <p><span className="text-slate-500">Client PO:</span> <span className="font-mono">{client.poNumber}</span></p>}
                </div>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-blue-900 text-white text-[11px] uppercase tracking-wider" style={{ backgroundColor: primary }}>
                    <th className="py-3 px-4 text-left rounded-l">Item Description</th>
                    <th className="py-3 px-3 text-right">Quantity</th>
                    <th className="py-3 px-3 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right rounded-r">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 1 ? 'bg-blue-50/30' : ''}>
                      <td className="py-3.5 px-4 font-medium text-slate-900">{item.description}</td>
                      <td className="py-3.5 px-3 text-right tabular-nums text-slate-700">{item.quantity}</td>
                      <td className="py-3.5 px-3 text-right tabular-nums text-slate-700">{formatCurrency(item.rate, sym, curr)}</td>
                      <td className="py-3.5 px-4 text-right tabular-nums font-bold text-slate-900">
                        {formatCurrency(item.quantity * item.rate, sym, curr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-8 flex justify-end">
                <div className="w-72 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-semibold">{formatCurrency(totals.subtotal, sym, curr)}</span>
                  </div>
                  {totals.taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Tax ({invoice.taxPercent}%)</span>
                      <span className="tabular-nums font-semibold">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-sm text-blue-950">
                    <span>Balance Due</span>
                    <span className="text-xl tabular-nums text-blue-700" style={{ color: primary }}>
                      {formatCurrency(totals.total, sym, curr)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 md:p-12 pt-0 text-xs text-slate-500 border-t border-slate-200 mt-8 pt-6 flex justify-between">
            <div>
              <p className="font-semibold text-slate-800">Wire Settlement:</p>
              <p className="font-mono text-[11px]">{paymentDetails.bankName} · Acc #{paymentDetails.accountNumber} · Routing {paymentDetails.routingOrSort}</p>
            </div>
            <p className="italic text-[11px] self-end">{invoice.notes}</p>
          </div>
        </div>
      )}

      {/* 4. LUXURY BLACK & GOLD */}
      {templateId === 'luxury-black-gold' && (
        <div className="p-12 md:p-16 flex flex-col justify-between min-h-[1050px] bg-[#0c0d0e] text-[#f4ecd8] border-[8px] border-[#1b1c1e]">
          <div>
            <div className="text-center pb-10 border-b border-[#d4af37]/40">
              <div className="inline-block p-2 border border-[#d4af37]/60 rounded-full mb-3 text-[#d4af37]">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-serif tracking-[0.25em] uppercase text-[#d4af37]">{business.name}</h1>
              <p className="text-[11px] text-[#e2d5be]/70 tracking-widest uppercase mt-1">High Jewelry & Luxury Atelier</p>
              <div className="mt-4 flex justify-center gap-6 text-[10px] text-[#d4af37]/80 tracking-widest font-mono">
                <span>INVOICE: {invoice.invoiceNumber}</span>
                <span>·</span>
                <span>DATE: {invoice.issueDate}</span>
                <span>·</span>
                <span>DUE: {invoice.dueDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 py-8 border-b border-[#d4af37]/20 text-xs font-serif">
              <div>
                <span className="text-[10px] tracking-widest uppercase text-[#d4af37] block mb-1">Distinguished Client</span>
                <p className="text-base text-[#fef9ee] font-medium">{client.name}</p>
                <p className="text-[#c8b99d]">{client.company}</p>
                <p className="text-[#a89b83] text-[11px] mt-1">{client.address}, {client.city}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] tracking-widest uppercase text-[#d4af37] block mb-1">Total Valuation</span>
                <p className="text-3xl font-serif text-[#d4af37] tabular-nums font-light">{formatCurrency(totals.total, sym, curr)}</p>
                <p className="text-[10px] text-[#a89b83] uppercase tracking-wider mt-1">Payment Method: Private Wire</p>
              </div>
            </div>

            <table className="w-full mt-8 text-xs">
              <thead>
                <tr className="border-b border-[#d4af37]/40 text-[#d4af37] text-[11px] uppercase tracking-widest font-serif">
                  <th className="py-3 text-left">Bespoke Commission / Item</th>
                  <th className="py-3 text-right">Qty</th>
                  <th className="py-3 text-right">Rate</th>
                  <th className="py-3 text-right">Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2b2e]">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-4 pr-4">
                      <span className="text-[#f7f0e0] font-serif block">{item.description}</span>
                      <span className="text-[10px] text-[#a89b83] font-mono">{item.sku}</span>
                    </td>
                    <td className="py-4 text-right tabular-nums text-[#d0c2a8]">{item.quantity}</td>
                    <td className="py-4 text-right tabular-nums text-[#d0c2a8]">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-4 text-right tabular-nums font-serif text-[#d4af37]">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 flex justify-end">
              <div className="w-64 space-y-2 text-xs font-serif text-[#c8b99d]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-[#f4ecd8]">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({invoice.taxPercent}%)</span>
                    <span className="tabular-nums text-[#f4ecd8]">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[#d4af37]/60 flex justify-between font-serif text-sm text-[#d4af37]">
                  <span className="uppercase tracking-widest">Total Amount</span>
                  <span className="text-xl tabular-nums font-light">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-[#d4af37]/30 text-center text-[10px] tracking-widest text-[#a89b83] uppercase">
            <p>{business.name} · Paris · Geneva · New York · London</p>
            <p className="mt-1 font-mono text-[#d4af37]/70">IBAN: {paymentDetails.iban || paymentDetails.accountNumber} · SWIFT: {paymentDetails.swift || 'LUXPARIS'}</p>
          </div>
        </div>
      )}

      {/* 5. CREATIVE STUDIO */}
      {templateId === 'creative-studio' && (
        <div className="p-10 md:p-12 flex flex-col justify-between min-h-[1050px] bg-slate-50">
          <div>
            <div className="flex justify-between items-start mb-12">
              <div>
                <span className="bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest rounded-sm">
                  Creative Studio Invoice
                </span>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mt-3">{business.name}</h1>
                <p className="text-xs text-slate-500 mt-1 font-mono">{business.website} / {business.email}</p>
              </div>
              <div className="p-4 bg-white border border-purple-200 rounded-xl shadow-xs text-right">
                <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider block">Reference</span>
                <p className="text-xl font-mono font-bold text-slate-900">{invoice.invoiceNumber}</p>
                <p className="text-[11px] text-slate-500 mt-1">Due {invoice.dueDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-slate-200 mb-8 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Commissioned By</span>
                <h3 className="font-bold text-slate-900 text-sm">{client.name}</h3>
                <p className="text-purple-600 font-medium">{client.company}</p>
                <p className="text-slate-500 mt-1">{client.address}</p>
              </div>
              <div className="text-right flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Issue Details</span>
                <p className="text-slate-600">Created: <strong className="text-slate-900">{invoice.issueDate}</strong></p>
                <p className="text-slate-600">Tax ID: <strong className="font-mono text-slate-900">{client.taxId || 'N/A'}</strong></p>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-purple-500 text-purple-900 uppercase font-bold text-[11px]">
                  <th className="py-3 text-left">Scope & Deliverables</th>
                  <th className="py-3 text-right">Units</th>
                  <th className="py-3 text-right">Rate</th>
                  <th className="py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/40">
                    <td className="py-4 pr-4">
                      <span className="font-bold text-slate-900 block">{item.description}</span>
                      <span className="text-[10px] text-purple-700 font-mono">{item.sku}</span>
                    </td>
                    <td className="py-4 text-right tabular-nums font-medium text-slate-600">{item.quantity}</td>
                    <td className="py-4 text-right tabular-nums font-medium text-slate-600">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-4 text-right tabular-nums font-bold text-purple-950">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 flex justify-end">
              <div className="w-72 bg-purple-900 text-white p-5 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-purple-200">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-purple-200">
                    <span>VAT ({invoice.taxPercent}%)</span>
                    <span className="tabular-nums">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-purple-700 flex justify-between font-bold text-base text-white">
                  <span>Total Amount</span>
                  <span className="tabular-nums text-purple-200">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
            <p>Thank you for collaborating with our studio!</p>
            <p className="font-mono text-[11px]">Pay via PayPal: {paymentDetails.paypalEmail || business.email}</p>
          </div>
        </div>
      )}

      {/* 6. STARTUP MODERN */}
      {templateId === 'startup-modern' && (
        <div className="p-10 md:p-12 flex flex-col justify-between min-h-[1050px]">
          <div>
            <div className="flex justify-between items-center pb-8 border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {business.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{business.name}</h2>
                  <p className="text-xs text-indigo-600 font-medium">{business.website}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Invoice ID</span>
                <p className="text-xl font-extrabold text-indigo-900">{invoice.invoiceNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 my-8 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Billed To</span>
                <p className="font-bold text-slate-900 mt-1">{client.company || client.name}</p>
                <p className="text-slate-500">{client.email}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Issued</span>
                <p className="font-semibold text-slate-800 mt-1">{invoice.issueDate}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Due Date</span>
                <p className="font-bold text-indigo-600 mt-1">{invoice.dueDate}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Due</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5 tabular-nums">{formatCurrency(totals.total, sym, curr)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-3 px-4 text-left">Service / Item</th>
                    <th className="py-3 px-3 text-right">Hours/Qty</th>
                    <th className="py-3 px-3 text-right">Rate</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-medium text-slate-900">{item.description}</td>
                      <td className="py-3.5 px-3 text-right tabular-nums text-slate-600">{item.quantity}</td>
                      <td className="py-3.5 px-3 text-right tabular-nums text-slate-600">{formatCurrency(item.rate, sym, curr)}</td>
                      <td className="py-3.5 px-4 text-right tabular-nums font-semibold text-slate-900">
                        {formatCurrency(item.quantity * item.rate, sym, curr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-end">
              <div className="w-72 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-semibold">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Tax ({invoice.taxPercent}%)</span>
                    <span className="tabular-nums font-semibold">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-3 border-t-2 border-indigo-600 flex justify-between font-bold text-base text-slate-900">
                  <span>Amount Due</span>
                  <span className="tabular-nums text-indigo-600">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
            <p>{invoice.notes}</p>
            <p className="font-mono text-indigo-700">{paymentDetails.stripePaymentUrl || paymentDetails.iban}</p>
          </div>
        </div>
      )}

      {/* 7. ELEGANT WHITE */}
      {templateId === 'elegant-white' && (
        <div className="p-12 md:p-16 flex flex-col justify-between min-h-[1050px] bg-[#faf8f5] text-[#2c2a29]">
          <div>
            <div className="text-center pb-12 border-b border-[#e5dec9]">
              <h1 className="text-3xl font-serif tracking-widest uppercase text-[#1a1918]">{business.name}</h1>
              <p className="text-xs text-[#8c827a] font-serif italic mt-1">{business.address} · {business.city}</p>
              <div className="mt-4 text-[11px] text-[#706761] uppercase tracking-wider">
                <span>Invoice #{invoice.invoiceNumber}</span> · <span>Date: {invoice.issueDate}</span>
              </div>
            </div>

            <div className="flex justify-between py-8 border-b border-[#e5dec9] text-xs font-serif">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8c827a] block mb-1">To</span>
                <p className="font-semibold text-sm text-[#1a1918]">{client.name}</p>
                <p className="text-[#59524c]">{client.company}</p>
                <p className="text-[#8c827a] mt-0.5">{client.email}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-widest text-[#8c827a] block mb-1">Payment Schedule</span>
                <p className="text-[#1a1918]">Due Date: <strong>{invoice.dueDate}</strong></p>
                <p className="text-[#8c827a] text-[11px] mt-0.5">Reference: {invoice.invoiceNumber}</p>
              </div>
            </div>

            <table className="w-full mt-8 text-xs font-serif">
              <thead>
                <tr className="border-b border-[#d8cfb9] text-[#706761] text-[11px] uppercase tracking-wider">
                  <th className="py-3 text-left">Description of Services</th>
                  <th className="py-3 text-right">Quantity</th>
                  <th className="py-3 text-right">Price</th>
                  <th className="py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece5d8]">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-4 text-[#1a1918] font-normal">{item.description}</td>
                    <td className="py-4 text-right tabular-nums text-[#706761]">{item.quantity}</td>
                    <td className="py-4 text-right tabular-nums text-[#706761]">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-4 text-right tabular-nums font-semibold text-[#1a1918]">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 flex justify-end">
              <div className="w-64 space-y-2 text-xs font-serif text-[#59524c]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({invoice.taxPercent}%)</span>
                    <span className="tabular-nums">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[#1a1918] flex justify-between font-serif text-base text-[#1a1918]">
                  <span>Total Due</span>
                  <span className="tabular-nums text-lg">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-6 border-t border-[#e5dec9] text-center text-xs font-serif italic text-[#8c827a]">
            <p>{invoice.notes}</p>
            <p className="mt-1 text-[11px]">Bank: {paymentDetails.bankName} · Acc: {paymentDetails.accountNumber}</p>
          </div>
        </div>
      )}

      {/* 8. DARK PREMIUM */}
      {templateId === 'dark-premium' && (
        <div className="p-10 md:p-12 flex flex-col justify-between min-h-[1050px] bg-slate-950 text-slate-100 border border-slate-800">
          <div>
            <div className="flex justify-between items-start pb-8 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono font-bold block mb-1">
                  SECURE LEDGER INVOICE
                </span>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">{business.name}</h1>
                <p className="text-xs text-slate-400 font-mono mt-1">{business.email} · {business.taxId}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-400">HASH // ID</span>
                <p className="text-xl font-mono font-bold text-emerald-400 mt-1">{invoice.invoiceNumber}</p>
                <p className="text-xs text-slate-400 mt-1 font-mono">DUE: {invoice.dueDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 my-8 p-6 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">ENTITY BILLED</span>
                <p className="font-bold text-white text-sm">{client.name}</p>
                <p className="text-slate-300">{client.company}</p>
                <p className="text-slate-400 mt-1">{client.address}, {client.city}</p>
              </div>
              <div className="text-right font-mono text-xs">
                <p className="text-slate-400">ISSUANCE: <span className="text-white">{invoice.issueDate}</span></p>
                <p className="text-slate-400 mt-1">STATUS: <span className="text-emerald-400 font-bold uppercase">{invoice.status}</span></p>
                <p className="text-slate-400 mt-1">CURRENCY: <span className="text-white">{curr}</span></p>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                  <th className="py-3 text-left">ITEM ALLOCATION</th>
                  <th className="py-3 text-right">UNITS</th>
                  <th className="py-3 text-right">UNIT RATE</th>
                  <th className="py-3 text-right">NET TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="py-3.5 pr-4">
                      <span className="text-white font-medium block">{item.description}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{item.sku}</span>
                    </td>
                    <td className="py-3.5 text-right font-mono tabular-nums text-slate-300">{item.quantity}</td>
                    <td className="py-3.5 text-right font-mono tabular-nums text-slate-300">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3.5 text-right font-mono tabular-nums font-bold text-emerald-400">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 flex justify-end">
              <div className="w-72 bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>SUBTOTAL</span>
                  <span className="tabular-nums text-white">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>TAX ({invoice.taxPercent}%)</span>
                    <span className="tabular-nums text-white">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                  <span>TOTAL DUE</span>
                  <span className="text-xl tabular-nums text-emerald-400">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-800 text-xs font-mono text-slate-500 flex justify-between">
            <p>WIRE: {paymentDetails.bankName} // IBAN: {paymentDetails.iban || paymentDetails.accountNumber}</p>
            <p className="text-emerald-500/80">VERIFIED SIGNATURE // OK</p>
          </div>
        </div>
      )}

      {/* 9. FREELANCER SIMPLE */}
      {templateId === 'freelancer-simple' && (
        <div className="p-10 md:p-12 flex flex-col justify-between min-h-[1050px]">
          <div>
            <div className="flex justify-between items-start mb-10 pb-6 border-b border-teal-100">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Freelance Invoice</span>
                <h1 className="text-2xl font-bold text-slate-900 mt-1">{business.name}</h1>
                <p className="text-xs text-slate-600 mt-0.5">{business.email} · {business.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{invoice.invoiceNumber}</p>
                <p className="text-xs text-slate-500 mt-1">Date: {invoice.issueDate}</p>
                <p className="text-xs font-semibold text-teal-700">Due: {invoice.dueDate}</p>
              </div>
            </div>

            <div className="bg-teal-50/50 p-5 rounded-xl border border-teal-100 mb-8 text-xs flex justify-between">
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Client Information</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{client.name}</p>
                <p className="text-slate-700">{client.company}</p>
                <p className="text-slate-500">{client.email}</p>
              </div>
              <div className="text-right self-end">
                <span className="text-slate-500 block">Total Due:</span>
                <span className="text-2xl font-bold text-teal-800 tabular-nums">{formatCurrency(totals.total, sym, curr)}</span>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-teal-200 text-teal-900 font-bold uppercase text-[11px]">
                  <th className="py-2.5 text-left">Project Deliverable / Hours</th>
                  <th className="py-2.5 text-right">Hours</th>
                  <th className="py-2.5 text-right">Hourly Rate</th>
                  <th className="py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3.5 pr-4 font-medium text-slate-800">{item.description}</td>
                    <td className="py-3.5 text-right tabular-nums text-slate-600">{item.quantity}</td>
                    <td className="py-3.5 text-right tabular-nums text-slate-600">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3.5 text-right tabular-nums font-semibold text-slate-900">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Tax</span>
                    <span className="tabular-nums font-medium">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-2 border-t-2 border-teal-600 flex justify-between font-bold text-sm text-slate-900">
                  <span>Amount to Pay</span>
                  <span className="tabular-nums text-teal-700 text-lg">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-800">Quick Pay Options:</p>
              <p className="text-[11px] text-slate-500">PayPal: {paymentDetails.paypalEmail || business.email} · Venmo / Wire available</p>
            </div>
            <p className="text-right text-[11px] italic">Thank you for your business!</p>
          </div>
        </div>
      )}

      {/* 10. E-COMMERCE INVOICE */}
      {templateId === 'ecommerce-invoice' && (
        <div className="p-10 md:p-12 flex flex-col justify-between min-h-[1050px]">
          <div>
            <div className="flex justify-between items-start pb-8 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">Store Order Invoice</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">{business.name}</h1>
                <p className="text-xs text-slate-500">{business.website} · Support: {business.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Order & Invoice ID</p>
                <p className="text-xl font-bold font-mono text-slate-900">{invoice.invoiceNumber}</p>
                <p className="text-xs text-slate-500 mt-1">Placed: {invoice.issueDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 my-8 text-xs">
              <div className="p-4 border border-slate-200 rounded-lg">
                <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Shipping Details</span>
                <p className="font-bold text-slate-900">{client.name}</p>
                <p className="text-slate-700">{client.address}</p>
                <p className="text-slate-700">{client.city}, {client.state} {client.postalCode}</p>
                <p className="text-slate-500 mt-1">Carrier: Priority Express Tracked</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg">
                <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Billing Address</span>
                <p className="font-bold text-slate-900">{client.company || client.name}</p>
                <p className="text-slate-700">{client.address}</p>
                <p className="text-slate-700">{client.city}, {client.country}</p>
                <p className="text-slate-500 mt-1">Email: {client.email}</p>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                  <th className="py-3 px-3 text-left">SKU</th>
                  <th className="py-3 px-3 text-left">Item Description</th>
                  <th className="py-3 px-3 text-right">Qty</th>
                  <th className="py-3 px-3 text-right">Unit Price</th>
                  <th className="py-3 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-mono text-[11px] text-sky-700">{item.sku || `SKU-${idx + 101}`}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{item.description}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-600">{item.quantity}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-600">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-slate-900">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping & Handling</span>
                  <span className="tabular-nums font-medium">{invoice.shipping > 0 ? formatCurrency(invoice.shipping, sym, curr) : 'FREE'}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Sales Tax</span>
                    <span className="tabular-nums font-medium">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-900 flex justify-between font-bold text-sm text-slate-900">
                  <span>Grand Total</span>
                  <span className="tabular-nums text-base text-sky-800">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-700">Return Policy & Guarantee:</p>
              <p className="text-[11px]">Returns accepted within 30 days of delivery. Items must be unopened.</p>
            </div>
            <div className="text-right">
              {/* Simulated barcode */}
              <div className="h-8 w-32 bg-slate-800 flex items-center justify-center text-[9px] text-white font-mono tracking-widest">
                |||| | ||| |||| |
              </div>
              <p className="text-[9px] font-mono mt-0.5 text-slate-400">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>
      )}

      {/* 11. AGENCY PRO */}
      {templateId === 'agency-pro' && (
        <div className="p-10 md:p-12 flex flex-col justify-between min-h-[1050px]">
          <div>
            <div className="flex justify-between items-start pb-8 border-b-2 border-cyan-700">
              <div>
                <span className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">Agency Master Services Agreement</span>
                <h1 className="text-3xl font-extrabold text-slate-900 mt-1">{business.name}</h1>
                <p className="text-xs text-slate-600 mt-0.5">{business.address} · {business.city}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase">Billing Statement</span>
                <p className="text-xl font-mono font-bold text-slate-900">{invoice.invoiceNumber}</p>
                <p className="text-xs text-slate-600 mt-1">Due Date: <strong>{invoice.dueDate}</strong></p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 my-8 text-xs bg-slate-50 p-5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">Client Account</span>
                <p className="font-bold text-slate-900 mt-1">{client.company}</p>
                <p className="text-slate-700">Attn: {client.name}</p>
                <p className="text-slate-500">{client.email}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">Project PO</span>
                <p className="font-mono font-bold text-slate-900 mt-1">{client.poNumber || 'PO-GLOBAL-ENG'}</p>
                <p className="text-slate-500">Tax Reg: {client.taxId || 'N/A'}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">Statement Balance</span>
                <p className="text-xl font-bold text-cyan-800 tabular-nums mt-0.5">{formatCurrency(totals.total, sym, curr)}</p>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase">
                  <th className="py-3 px-4 text-left">Scope Deliverable & Milestones</th>
                  <th className="py-3 px-3 text-right">Hours</th>
                  <th className="py-3 px-3 text-right">Blended Rate</th>
                  <th className="py-3 px-4 text-right">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 1 ? 'bg-cyan-50/30' : ''}>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{item.description}</td>
                    <td className="py-3.5 px-3 text-right tabular-nums text-slate-700">{item.quantity}</td>
                    <td className="py-3.5 px-3 text-right tabular-nums text-slate-700">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3.5 px-4 text-right tabular-nums font-bold text-slate-900">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 flex justify-end">
              <div className="w-72 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-semibold">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Tax ({invoice.taxPercent}%)</span>
                    <span className="tabular-nums font-semibold">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-2 border-t-2 border-cyan-700 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Payable</span>
                  <span className="tabular-nums text-lg text-cyan-800">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
            <p>Account Lead: Managing Partner</p>
            <p className="font-mono">Settlement: {paymentDetails.bankName} · {paymentDetails.accountNumber}</p>
          </div>
        </div>
      )}

      {/* 12. STRIPE-INSPIRED RECEIPT / INVOICE */}
      {templateId === 'stripe-receipt' && (
        <div className="p-10 md:p-14 flex flex-col justify-between min-h-[1050px] bg-slate-50/60">
          <div>
            <div className="max-w-md mx-auto text-center pb-8">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Amount Invoiced</span>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-1 tabular-nums">
                {formatCurrency(totals.total, sym, curr)}
              </h1>
              <p className="text-xs text-slate-500 mt-1">Invoice #{invoice.invoiceNumber} · Due {invoice.dueDate}</p>
            </div>

            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 md:p-8 mb-6 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium block">Pay to</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{business.name}</p>
                  <p className="text-slate-500">{business.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-medium block">Billed to</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{client.name}</p>
                  <p className="text-slate-500">{client.email}</p>
                </div>
              </div>

              <div className="py-6 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-4">Summary of Items</span>
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-slate-900">{item.description}</span>
                        <p className="text-[11px] text-slate-500">{item.quantity} × {formatCurrency(item.rate, sym, curr)}</p>
                      </div>
                      <span className="tabular-nums font-semibold text-slate-900">
                        {formatCurrency(item.quantity * item.rate, sym, curr)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Tax ({invoice.taxPercent}%)</span>
                    <span className="tabular-nums font-medium">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Amount Due</span>
                  <span className="text-base tabular-nums">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 mt-6">
            <p>Direct electronic billing powered by Stripe-compatible settlement.</p>
            <p className="mt-1 font-mono text-[11px]">Transaction Link: {paymentDetails.stripePaymentUrl || 'https://pay.stripe.com'}</p>
          </div>
        </div>
      )}

      {/* 13. MINIMAL MONOCHROME */}
      {templateId === 'minimal-monochrome' && (
        <div className="p-12 md:p-16 flex flex-col justify-between min-h-[1050px] bg-white text-black font-space">
          <div>
            <div className="flex justify-between items-baseline border-b-4 border-black pb-6">
              <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter">{business.name}</h1>
                <p className="text-xs uppercase font-bold tracking-widest mt-1">Invoice Specification</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black">{invoice.invoiceNumber}</p>
                <p className="text-xs font-bold uppercase">{invoice.issueDate} / {invoice.dueDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 my-8 text-xs border-b-2 border-black pb-8">
              <div>
                <span className="font-black uppercase tracking-wider block mb-1">RECIPIENT //</span>
                <p className="font-bold text-sm">{client.name}</p>
                <p className="font-medium">{client.company}</p>
                <p className="text-black/80">{client.address}, {client.city}</p>
              </div>
              <div className="text-right">
                <span className="font-black uppercase tracking-wider block mb-1">ORIGIN //</span>
                <p className="font-bold">{business.name}</p>
                <p>{business.address}</p>
                <p className="font-mono">{business.email}</p>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-black text-black font-black uppercase">
                  <th className="py-2.5 text-left">ITEM</th>
                  <th className="py-2.5 text-right">QTY</th>
                  <th className="py-2.5 text-right">RATE</th>
                  <th className="py-2.5 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/20">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-bold">{item.description}</td>
                    <td className="py-3 text-right tabular-nums">{item.quantity}</td>
                    <td className="py-3 text-right tabular-nums">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3 text-right tabular-nums font-black">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span className="tabular-nums font-bold">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>TAX ({invoice.taxPercent}%)</span>
                    <span className="tabular-nums font-bold">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-2 border-t-4 border-black flex justify-between font-black text-sm">
                  <span>TOTAL BALANCE</span>
                  <span className="text-lg tabular-nums">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-4 border-t-2 border-black text-[11px] flex justify-between font-bold uppercase">
            <p>TERMS: {invoice.terms}</p>
            <p className="font-mono">IBAN: {paymentDetails.iban || paymentDetails.accountNumber}</p>
          </div>
        </div>
      )}

      {/* 14. GRADIENT MODERN */}
      {templateId === 'gradient-modern' && (
        <div className="flex flex-col justify-between min-h-[1050px] overflow-hidden">
          <div>
            {/* Gradient Top Banner */}
            <div className="h-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
            <div className="p-10 md:p-12">
              <div className="flex justify-between items-start pb-8 border-b border-slate-100">
                <div>
                  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {business.name}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{business.email} · {business.website}</p>
                </div>
                <div className="text-right">
                  <span className="bg-pink-100 text-pink-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Invoice
                  </span>
                  <p className="text-xl font-bold text-slate-900 mt-1">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-slate-500">Due: {invoice.dueDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 my-8 text-xs bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-1">Invoice For</span>
                  <p className="font-bold text-slate-900 text-sm">{client.name}</p>
                  <p className="text-slate-700">{client.company}</p>
                  <p className="text-slate-500 mt-0.5">{client.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-1">Issue Date</span>
                  <p className="font-bold text-slate-900">{invoice.issueDate}</p>
                  <p className="text-slate-500 mt-2 text-[11px]">Currency: {curr}</p>
                </div>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                    <th className="py-3 text-left">Deliverable</th>
                    <th className="py-3 text-right">Units</th>
                    <th className="py-3 text-right">Rate</th>
                    <th className="py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3.5 pr-4 font-semibold text-slate-900">{item.description}</td>
                      <td className="py-3.5 text-right tabular-nums text-slate-600">{item.quantity}</td>
                      <td className="py-3.5 text-right tabular-nums text-slate-600">{formatCurrency(item.rate, sym, curr)}</td>
                      <td className="py-3.5 text-right tabular-nums font-bold text-slate-900">
                        {formatCurrency(item.quantity * item.rate, sym, curr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-8 flex justify-end">
                <div className="w-72 bg-gradient-to-br from-pink-50 to-indigo-50 p-5 rounded-2xl border border-purple-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-semibold">{formatCurrency(totals.subtotal, sym, curr)}</span>
                  </div>
                  {totals.taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Tax</span>
                      <span className="tabular-nums font-semibold">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-purple-200 flex justify-between font-bold text-sm text-slate-900">
                    <span>Balance Due</span>
                    <span className="text-xl tabular-nums bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent">
                      {formatCurrency(totals.total, sym, curr)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 md:p-12 pt-0 text-xs text-slate-500 border-t border-slate-100 pt-6 flex justify-between">
            <p>{invoice.notes}</p>
            <p className="font-mono text-indigo-600">{paymentDetails.paypalEmail || business.email}</p>
          </div>
        </div>
      )}

      {/* 15. CONSULTING PROFESSIONAL */}
      {templateId === 'consulting-professional' && (
        <div className="p-10 md:p-14 flex flex-col justify-between min-h-[1050px]">
          <div>
            <div className="flex justify-between items-start pb-8 border-b-2 border-slate-800">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{business.name}</h1>
                <p className="text-xs text-slate-500 font-serif italic">Strategic Advisory & Management Consulting</p>
                <p className="text-xs text-slate-500 mt-1">{business.address} · {business.city}</p>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase font-bold text-slate-400">Engagement Invoice</span>
                <p className="text-2xl font-bold text-slate-900">{invoice.invoiceNumber}</p>
                <p className="text-xs text-slate-600 mt-1">Due Date: <strong>{invoice.dueDate}</strong></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 my-8 text-xs">
              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Client Organization</span>
                <p className="font-bold text-sm text-slate-900">{client.company}</p>
                <p className="text-slate-700">Attn: {client.name}</p>
                <p className="text-slate-500">{client.address}, {client.city}</p>
                <p className="text-slate-500 font-mono mt-1">Client PO: {client.poNumber || 'ENG-2026-MCK'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Executive Summary</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Billable deliverables under the Master Consulting Engagement for strategic advisory, operational workflow analysis, and executive steering.
                </p>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-slate-800 text-slate-900 font-bold uppercase text-[11px]">
                  <th className="py-3 text-left">Workstream Deliverable</th>
                  <th className="py-3 text-right">Units</th>
                  <th className="py-3 text-right">Rate</th>
                  <th className="py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3.5 pr-4 font-semibold text-slate-900">{item.description}</td>
                    <td className="py-3.5 text-right tabular-nums text-slate-600">{item.quantity}</td>
                    <td className="py-3.5 text-right tabular-nums text-slate-600">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3.5 text-right tabular-nums font-bold text-slate-900">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 flex justify-end">
              <div className="w-72 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-semibold">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Tax ({invoice.taxPercent}%)</span>
                    <span className="tabular-nums font-semibold">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-2 border-t-2 border-slate-900 flex justify-between font-bold text-sm text-slate-900">
                  <span>Net Due</span>
                  <span className="text-xl tabular-nums">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 grid grid-cols-2 gap-8 items-end">
            <div>
              <p className="font-bold text-slate-800">Wire Instructions:</p>
              <p className="font-mono text-[11px]">{paymentDetails.bankName} · {paymentDetails.accountNumber}</p>
            </div>
            <div className="text-right">
              <div className="border-b border-slate-400 w-48 ml-auto pb-6 text-center text-[10px] text-slate-400">
                Authorized Executive Signature
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 16. RETAIL INVOICE */}
      {templateId === 'retail-invoice' && (
        <div className="p-8 md:p-10 flex flex-col justify-between min-h-[1050px] font-mono text-xs">
          <div>
            <div className="text-center pb-6 border-b-2 border-dashed border-slate-300">
              <h1 className="text-xl font-bold uppercase tracking-wider">{business.name}</h1>
              <p className="text-[11px] text-slate-600">{business.address}, {business.city}</p>
              <p className="text-[11px] text-slate-600">Tel: {business.phone} · Reg #{business.taxId}</p>
              <div className="mt-3 text-[10px] text-slate-500">
                <span>RECEIPT/INV: {invoice.invoiceNumber}</span> · <span>REG: #04</span> · <span>CASHIER: #88</span>
              </div>
            </div>

            <div className="py-4 border-b border-dashed border-slate-300 flex justify-between text-[11px]">
              <div>
                <p>CUSTOMER: {client.name}</p>
                <p className="text-slate-500">{client.company}</p>
              </div>
              <div className="text-right">
                <p>DATE: {invoice.issueDate}</p>
                <p>DUE: {invoice.dueDate}</p>
              </div>
            </div>

            <table className="w-full text-xs my-6">
              <thead>
                <tr className="border-b border-dashed border-slate-400 text-slate-700 uppercase text-[11px]">
                  <th className="py-2 text-left">ITEM</th>
                  <th className="py-2 text-right">QTY</th>
                  <th className="py-2 text-right">PRICE</th>
                  <th className="py-2 text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 pr-2 font-medium">{item.description}</td>
                    <td className="py-2.5 text-right tabular-nums">{item.quantity}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-2.5 text-right tabular-nums font-bold">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t-2 border-dashed border-slate-400 pt-4 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span className="tabular-nums">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>TAX ({invoice.taxPercent}%):</span>
                    <span className="tabular-nums">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-900 flex justify-between font-bold text-sm">
                  <span>TOTAL DUE:</span>
                  <span className="tabular-nums text-base">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center border-t-2 border-dashed border-slate-300 pt-6 space-y-2">
            <p className="text-[11px]">THANK YOU FOR YOUR PURCHASE!</p>
            <p className="text-[10px] text-slate-500">KEEP THIS INVOICE FOR WARRANTY AND RETURNS</p>
            <div className="h-6 w-48 bg-slate-800 mx-auto text-white flex items-center justify-center text-[8px] tracking-widest">
              ||| | |||| ||| |||| |
            </div>
          </div>
        </div>
      )}

      {/* 17. INTERNATIONAL BUSINESS */}
      {templateId === 'international-business' && (
        <div className="p-10 md:p-12 flex flex-col justify-between min-h-[1050px]">
          <div>
            <div className="flex justify-between items-start pb-8 border-b-2 border-blue-900">
              <div>
                <span className="text-[10px] bg-blue-900 text-white font-bold px-2 py-0.5 uppercase tracking-wider rounded">
                  International Commercial Invoice
                </span>
                <h1 className="text-2xl font-bold text-slate-900 mt-2">{business.name}</h1>
                <p className="text-xs text-slate-500">{business.address}, {business.country}</p>
                <p className="text-xs text-slate-600 font-mono mt-0.5">EU/EORI/VAT: {business.taxId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase">Commercial Reference</p>
                <p className="text-2xl font-mono font-bold text-blue-900">{invoice.invoiceNumber}</p>
                <p className="text-xs text-slate-600 mt-1">Incoterms: <strong>DAP (Delivered at Place)</strong></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 my-8 text-xs bg-slate-50 p-5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Consignee / Importer</span>
                <p className="font-bold text-slate-900 text-sm">{client.company}</p>
                <p className="text-slate-700">{client.name}</p>
                <p className="text-slate-600">{client.address}, {client.country}</p>
                <p className="text-slate-600 font-mono mt-1">VAT/Tax ID: {client.taxId || 'INTL-REV-CHG'}</p>
              </div>
              <div className="text-right font-mono text-xs space-y-1">
                <p><span className="text-slate-500">Invoice Date:</span> {invoice.issueDate}</p>
                <p><span className="text-slate-500">Settlement Due:</span> <strong className="text-blue-900">{invoice.dueDate}</strong></p>
                <p><span className="text-slate-500">Origin Country:</span> {business.country}</p>
                <p className="text-[10px] text-slate-500 italic">Article 138 EU VAT Directive</p>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="bg-blue-900 text-white text-[11px] uppercase">
                  <th className="py-2.5 px-3 text-left">Commodity / Item</th>
                  <th className="py-2.5 px-3 text-left">HS Code</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Net Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-medium text-slate-900">{item.description}</td>
                    <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">8471.30.00</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700">{item.quantity}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-slate-900">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 flex justify-end">
              <div className="w-72 bg-blue-50/60 p-4 rounded border border-blue-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total Commercial Value</span>
                  <span className="tabular-nums font-semibold">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Reverse Charge VAT</span>
                  <span className="tabular-nums font-semibold">0.00 (0%)</span>
                </div>
                <div className="pt-2 border-t border-blue-900 flex justify-between font-bold text-sm text-blue-950">
                  <span>Total Invoice Amount</span>
                  <span className="tabular-nums text-base text-blue-900">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-600 grid grid-cols-2 gap-8">
            <div>
              <p className="font-bold text-slate-900">SWIFT / International Settlement:</p>
              <p className="font-mono text-[11px]">Bank: {paymentDetails.bankName}</p>
              <p className="font-mono text-[11px]">IBAN: {paymentDetails.iban || paymentDetails.accountNumber}</p>
              <p className="font-mono text-[11px]">SWIFT/BIC: {paymentDetails.swift || 'DEUTDEDD'}</p>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <p>Certified true and correct invoice for international shipment.</p>
              <p className="mt-2 font-serif italic text-slate-700">Authorized Officer: Vanguard Dynamics Global</p>
            </div>
          </div>
        </div>
      )}

      {/* 18. EDITORIAL CLEAN */}
      {templateId === 'editorial-clean' && (
        <div className="p-12 md:p-16 flex flex-col justify-between min-h-[1050px] font-fraunces">
          <div>
            <div className="flex justify-between items-baseline pb-10 border-b border-stone-300">
              <div>
                <h1 className="text-4xl font-serif tracking-tight text-stone-900">{business.name}</h1>
                <p className="text-xs text-stone-500 font-sans tracking-wide mt-1">Independent Editorial & Publishing House</p>
              </div>
              <div className="text-right font-sans">
                <p className="text-xs text-stone-400 uppercase tracking-widest">Statement</p>
                <p className="text-xl font-serif text-stone-900">{invoice.invoiceNumber}</p>
                <p className="text-xs text-stone-500 mt-1">{invoice.issueDate}</p>
              </div>
            </div>

            <div className="py-8 border-b border-stone-200 flex justify-between text-xs font-sans">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1">Commissioned For</span>
                <p className="font-serif text-base text-stone-900">{client.name}</p>
                <p className="text-stone-600">{client.company}</p>
                <p className="text-stone-500">{client.email}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1">Due Date</span>
                <p className="font-serif text-base text-stone-900">{invoice.dueDate}</p>
                <p className="text-stone-500 text-[11px]">Net 30 Terms</p>
              </div>
            </div>

            <table className="w-full text-xs mt-8 font-sans">
              <thead>
                <tr className="border-b border-stone-300 text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-3 text-left">Manuscript / Scope</th>
                  <th className="py-3 text-right">Units</th>
                  <th className="py-3 text-right">Rate</th>
                  <th className="py-3 text-right">Honorarium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-4 font-serif text-sm text-stone-900">{item.description}</td>
                    <td className="py-4 text-right tabular-nums text-stone-600">{item.quantity}</td>
                    <td className="py-4 text-right tabular-nums text-stone-600">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-4 text-right tabular-nums font-serif text-base text-stone-900">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 flex justify-end">
              <div className="w-64 space-y-2 text-xs font-sans">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Tax</span>
                    <span className="tabular-nums font-medium">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-stone-900 flex justify-between font-serif text-base text-stone-900">
                  <span>Total Due</span>
                  <span className="text-xl tabular-nums">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-6 border-t border-stone-200 text-xs font-sans text-stone-500 flex justify-between">
            <p className="italic font-serif">{invoice.notes}</p>
            <p className="font-mono text-[11px]">Wire: {paymentDetails.accountNumber}</p>
          </div>
        </div>
      )}

      {/* 19. BOLD TYPOGRAPHY */}
      {templateId === 'bold-typography' && (
        <div className="p-10 md:p-14 flex flex-col justify-between min-h-[1050px] font-space bg-neutral-900 text-white">
          <div>
            <div className="border-b-4 border-yellow-400 pb-8 flex justify-between items-end">
              <div>
                <span className="text-yellow-400 font-mono text-xs uppercase tracking-widest block mb-1">
                  BOLD DESIGN LAB
                </span>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">{business.name}</h1>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-yellow-400">{invoice.invoiceNumber}</p>
                <p className="text-xs text-neutral-400 font-mono mt-1">DUE: {invoice.dueDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 my-8 text-xs font-mono">
              <div className="bg-neutral-800 p-4 border-l-4 border-yellow-400">
                <span className="text-neutral-400 block mb-1">CLIENT //</span>
                <p className="font-bold text-white text-sm">{client.name}</p>
                <p className="text-neutral-300">{client.company}</p>
              </div>
              <div className="bg-neutral-800 p-4 border-l-4 border-white text-right">
                <span className="text-neutral-400 block mb-1">PAYABLE //</span>
                <p className="text-2xl font-black text-yellow-400 tabular-nums">{formatCurrency(totals.total, sym, curr)}</p>
              </div>
            </div>

            <table className="w-full text-xs font-mono my-6">
              <thead>
                <tr className="border-b-2 border-neutral-700 text-neutral-400 uppercase text-[11px]">
                  <th className="py-3 text-left">ITEM ALLOCATION</th>
                  <th className="py-3 text-right">QTY</th>
                  <th className="py-3 text-right">RATE</th>
                  <th className="py-3 text-right text-yellow-400">NET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-4 font-bold text-white text-sm">{item.description}</td>
                    <td className="py-4 text-right tabular-nums text-neutral-300">{item.quantity}</td>
                    <td className="py-4 text-right tabular-nums text-neutral-300">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-4 text-right tabular-nums font-black text-yellow-400 text-sm">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 flex justify-end font-mono">
              <div className="w-72 bg-neutral-800 p-4 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>SUBTOTAL</span>
                  <span className="tabular-nums text-white">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-neutral-400">
                    <span>TAX</span>
                    <span className="tabular-nums text-white">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-2 border-t-2 border-yellow-400 flex justify-between font-black text-base text-yellow-400">
                  <span>TOTAL DUE</span>
                  <span className="text-xl tabular-nums">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-neutral-800 text-xs font-mono text-neutral-400 flex justify-between">
            <p>SETTLEMENT: {paymentDetails.accountNumber}</p>
            <p className="text-yellow-400">PAYMENT ACKNOWLEDGEMENT</p>
          </div>
        </div>
      )}

      {/* 20. EXECUTIVE PREMIUM */}
      {templateId === 'executive-premium' && (
        <div className="p-10 md:p-14 flex flex-col justify-between min-h-[1050px] font-playfair bg-[#fcfaf7] text-stone-900 border-2 border-stone-300">
          <div>
            <div className="text-center pb-8 border-b-2 border-rose-900">
              <span className="text-[10px] tracking-widest uppercase text-rose-950 font-bold block mb-1">
                Executive Advisory & Governance
              </span>
              <h1 className="text-3xl font-serif uppercase tracking-widest text-rose-950">{business.name}</h1>
              <p className="text-xs text-stone-600 font-sans mt-1">{business.address} · {business.city}</p>
              <div className="mt-3 text-xs text-stone-700 font-sans">
                Statement #{invoice.invoiceNumber} · {invoice.issueDate}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 my-8 text-xs font-sans">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Client Principal</span>
                <p className="font-serif text-base font-bold text-stone-900">{client.name}</p>
                <p className="text-stone-700">{client.company}</p>
                <p className="text-stone-500">{client.email}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Settlement Deadline</span>
                <p className="font-serif text-base font-bold text-rose-900">{invoice.dueDate}</p>
                <p className="text-stone-500 text-[11px]">Strict Net 30 Terms</p>
              </div>
            </div>

            <table className="w-full text-xs font-sans">
              <thead>
                <tr className="bg-rose-950 text-white text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 text-left">Professional Engagement</th>
                  <th className="py-2.5 px-3 text-right">Units</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3.5 px-3 font-serif text-stone-900">{item.description}</td>
                    <td className="py-3.5 px-3 text-right tabular-nums text-stone-600">{item.quantity}</td>
                    <td className="py-3.5 px-3 text-right tabular-nums text-stone-600">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3.5 px-3 text-right tabular-nums font-bold text-rose-950">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 flex justify-end font-sans">
              <div className="w-72 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-semibold">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Tax</span>
                    <span className="tabular-nums font-semibold">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-2 border-t-2 border-rose-950 flex justify-between font-bold text-sm text-rose-950 font-serif">
                  <span>Balance Due</span>
                  <span className="text-xl tabular-nums">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-stone-200 text-xs font-sans text-stone-600 flex justify-between items-center">
            <p>Wire instructions: {paymentDetails.bankName} · {paymentDetails.accountNumber}</p>
            <div className="border-b border-stone-400 w-36 text-center text-[10px] text-stone-400 pb-2">
              Officer Sign-off
            </div>
          </div>
        </div>
      )}

      {/* 21. GREEN FINANCE */}
      {templateId === 'green-finance' && (
        <div className="p-10 md:p-12 flex flex-col justify-between min-h-[1050px]">
          <div>
            <div className="flex justify-between items-start pb-8 border-b-2 border-emerald-600">
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 uppercase tracking-wide rounded">
                  Sustainable Finance & Carbon Audit
                </span>
                <h1 className="text-2xl font-bold text-slate-900 mt-2">{business.name}</h1>
                <p className="text-xs text-slate-500">{business.email} · {business.website}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase font-semibold">Invoice ID</p>
                <p className="text-xl font-bold font-mono text-emerald-800">{invoice.invoiceNumber}</p>
                <p className="text-xs text-slate-600 mt-1">Due: {invoice.dueDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 my-8 text-xs bg-emerald-50/40 p-5 rounded-lg border border-emerald-100">
              <div>
                <span className="text-emerald-800 font-bold uppercase text-[10px] block mb-1">Client Partner</span>
                <p className="font-bold text-slate-900 text-sm">{client.name}</p>
                <p className="text-slate-700">{client.company}</p>
                <p className="text-slate-500">{client.address}</p>
              </div>
              <div className="text-right">
                <span className="text-emerald-800 font-bold uppercase text-[10px] block mb-1">Issue Date</span>
                <p className="font-bold text-slate-900">{invoice.issueDate}</p>
                <p className="text-[11px] text-emerald-700 font-medium mt-1">100% Carbon-Neutral Digital Invoice</p>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="bg-emerald-800 text-white font-bold text-[11px] uppercase">
                  <th className="py-2.5 px-3 text-left">Audit Scope & Deliverables</th>
                  <th className="py-2.5 px-3 text-right">Units</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 1 ? 'bg-emerald-50/30' : ''}>
                    <td className="py-3 px-3 font-semibold text-slate-900">{item.description}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700">{item.quantity}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-emerald-950">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 flex justify-end">
              <div className="w-72 bg-emerald-50 p-4 rounded-lg border border-emerald-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-semibold">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Tax</span>
                    <span className="tabular-nums font-semibold">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-emerald-600 flex justify-between font-bold text-sm text-emerald-950">
                  <span>Amount Payable</span>
                  <span className="tabular-nums text-lg text-emerald-700">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
            <p>ESG Verified Ledger · Bank: {paymentDetails.bankName}</p>
            <p className="font-mono text-emerald-700">Account #{paymentDetails.accountNumber}</p>
          </div>
        </div>
      )}

      {/* 22. PURPLE CREATIVE */}
      {templateId === 'purple-creative' && (
        <div className="p-10 md:p-12 flex flex-col justify-between min-h-[1050px]">
          <div>
            <div className="flex justify-between items-start pb-8 border-b-2 border-purple-500">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest block mb-1">
                  Design Studio & Visual Lab
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900">{business.name}</h1>
                <p className="text-xs text-slate-500 mt-0.5">{business.email} · {business.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-purple-400 font-bold uppercase">Statement</p>
                <p className="text-2xl font-bold font-mono text-purple-900">{invoice.invoiceNumber}</p>
                <p className="text-xs text-slate-500 mt-1">Due Date: {invoice.dueDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 my-8 text-xs bg-purple-50/50 p-5 rounded-xl border border-purple-100">
              <div>
                <span className="text-purple-600 font-bold uppercase text-[10px] block mb-1">Client Principal</span>
                <p className="font-bold text-slate-900 text-sm">{client.name}</p>
                <p className="text-purple-800 font-medium">{client.company}</p>
                <p className="text-slate-500 mt-0.5">{client.email}</p>
              </div>
              <div className="text-right">
                <span className="text-purple-600 font-bold uppercase text-[10px] block mb-1">Issue Date</span>
                <p className="font-bold text-slate-900">{invoice.issueDate}</p>
                <p className="text-slate-600 mt-1 font-mono">PO: {client.poNumber || 'CR-9920'}</p>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="bg-purple-900 text-white font-bold text-[11px] uppercase">
                  <th className="py-3 px-3 text-left">Creative Milestone</th>
                  <th className="py-3 px-3 text-right">Quantity</th>
                  <th className="py-3 px-3 text-right">Rate</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/30">
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

            <div className="mt-8 flex justify-end">
              <div className="w-72 bg-purple-50 p-4 rounded-xl border border-purple-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-semibold">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Tax</span>
                    <span className="tabular-nums font-semibold">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-purple-500 flex justify-between font-bold text-sm text-purple-950">
                  <span>Total Amount</span>
                  <span className="tabular-nums text-lg text-purple-700">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
            <p>PayPal: {paymentDetails.paypalEmail || business.email}</p>
            <p className="font-mono text-purple-800">Bank: {paymentDetails.bankName}</p>
          </div>
        </div>
      )}

      {/* 23. PROFESSIONAL ACCOUNTING */}
      {templateId === 'professional-accounting' && (
        <div className="p-10 md:p-12 flex flex-col justify-between min-h-[1050px] font-sans">
          <div>
            <div className="flex justify-between items-start pb-6 border-b-2 border-slate-700">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{business.name}</h1>
                <p className="text-xs text-slate-600">Certified Public Accountants & Financial Advisory</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Firm Reg: {business.taxId}</p>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase font-bold text-slate-400">Statement of Fees</span>
                <p className="text-xl font-bold font-mono text-slate-900">{invoice.invoiceNumber}</p>
                <p className="text-xs text-slate-600 mt-1">Due: {invoice.dueDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 my-6 text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px] block mb-1">Entity Billed</span>
                <p className="font-bold text-slate-900">{client.company || client.name}</p>
                <p className="text-slate-600">{client.address}, {client.city}</p>
                <p className="text-slate-500 font-mono mt-0.5">Tax File #: {client.taxId || 'N/A'}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px] block mb-1">Accounting Period</span>
                <p className="text-slate-800 font-medium">Issue Date: {invoice.issueDate}</p>
                <p className="text-slate-800 font-bold mt-1">Payment Term: Net 30</p>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="border-t-2 border-b-2 border-slate-700 text-slate-900 font-bold uppercase text-[11px]">
                  <th className="py-2.5 text-left">Accounting Engagement / Code</th>
                  <th className="py-2.5 text-right">Hours</th>
                  <th className="py-2.5 text-right">Standard Rate</th>
                  <th className="py-2.5 text-right">Debit Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-medium text-slate-900">{item.description}</td>
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
              <div className="w-72 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Billings</span>
                  <span className="tabular-nums font-semibold">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Applicable Tax</span>
                    <span className="tabular-nums font-semibold">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-2 border-t-2 border-b-2 border-slate-900 flex justify-between font-bold text-sm text-slate-900">
                  <span>Balance Payable</span>
                  <span className="text-base tabular-nums">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
            <p>Direct Bank Deposit: {paymentDetails.bankName} · Acc #{paymentDetails.accountNumber}</p>
            <p className="font-mono text-[11px]">CPA Audit Approved</p>
          </div>
        </div>
      )}

      {/* 24. MODERN SAAS BILLING */}
      {templateId === 'modern-saas-billing' && (
        <div className="p-10 md:p-12 flex flex-col justify-between min-h-[1050px]">
          <div>
            <div className="flex justify-between items-start pb-6 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  S
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{business.name}</h1>
                  <p className="text-xs text-blue-600">Monthly Cloud Subscription Statement</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-400">Statement ID</span>
                <p className="text-lg font-mono font-bold text-slate-900">{invoice.invoiceNumber}</p>
                <p className="text-xs text-slate-500 mt-0.5">Billing Period: Oct 1 - Oct 31, 2026</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 my-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Customer Account</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{client.company}</p>
                <p className="text-slate-600">{client.email}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Auto-Charge Date</span>
                <p className="font-bold text-blue-600 text-sm mt-0.5">{invoice.dueDate}</p>
                <p className="text-slate-500 text-[11px]">Default Payment Card (•••• 4242)</p>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] uppercase">
                  <th className="py-2.5 px-3 text-left">Subscription Tier / Add-on</th>
                  <th className="py-2.5 px-3 text-right">Seats/Usage</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-medium text-slate-900">{item.description}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-600">{item.quantity}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-600">{formatCurrency(item.rate, sym, curr)}</td>
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
                  <span>Subtotal</span>
                  <span className="tabular-nums font-semibold">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Tax</span>
                    <span className="tabular-nums font-semibold">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-blue-600 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Subscription Charge</span>
                  <span className="tabular-nums text-base text-blue-600">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
            <p>Manage plan or cancel renewal at any time via {business.website}/billing</p>
            <p className="font-mono text-blue-600">Automatic settlement active</p>
          </div>
        </div>
      )}

      {/* 25. ELEGANT LUXURY */}
      {templateId === 'elegant-luxury' && (
        <div className="p-12 md:p-16 flex flex-col justify-between min-h-[1050px] font-playfair bg-[#fcf9f2] text-[#332a1e] border border-[#e8decb]">
          <div>
            <div className="text-center pb-10 border-b border-[#c8b99d]">
              <h1 className="text-3xl font-serif tracking-[0.2em] uppercase text-[#4a3b2c]">{business.name}</h1>
              <p className="text-xs text-[#8c7b68] tracking-widest uppercase mt-1">Haute Horlogerie & Bespoke Design</p>
              <div className="mt-3 text-[11px] text-[#70604e] font-sans">
                Folio #{invoice.invoiceNumber} · {invoice.issueDate}
              </div>
            </div>

            <div className="flex justify-between py-8 border-b border-[#e0d6c3] text-xs font-sans">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8c7b68] block mb-1">Prepared For</span>
                <p className="font-serif text-base text-[#332a1e] font-bold">{client.name}</p>
                <p className="text-[#594938]">{client.company}</p>
                <p className="text-[#8c7b68]">{client.email}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-widest text-[#8c7b68] block mb-1">Due Upon Presentation</span>
                <p className="font-serif text-base text-[#4a3b2c] font-bold">{invoice.dueDate}</p>
                <p className="text-[#8c7b68] text-[11px]">Private Wire Settlement</p>
              </div>
            </div>

            <table className="w-full text-xs mt-8 font-sans">
              <thead>
                <tr className="border-b border-[#c8b99d] text-[#70604e] text-[11px] uppercase tracking-wider">
                  <th className="py-3 text-left">Commission Item</th>
                  <th className="py-3 text-right">Quantity</th>
                  <th className="py-3 text-right">Unit Price</th>
                  <th className="py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece3d2]">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-4 font-serif text-sm text-[#332a1e]">{item.description}</td>
                    <td className="py-4 text-right tabular-nums text-[#70604e]">{item.quantity}</td>
                    <td className="py-4 text-right tabular-nums text-[#70604e]">{formatCurrency(item.rate, sym, curr)}</td>
                    <td className="py-4 text-right tabular-nums font-serif text-base text-[#4a3b2c] font-bold">
                      {formatCurrency(item.quantity * item.rate, sym, curr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 flex justify-end font-sans">
              <div className="w-64 space-y-2 text-xs text-[#594938]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium">{formatCurrency(totals.subtotal, sym, curr)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="tabular-nums font-medium">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[#4a3b2c] flex justify-between font-serif text-base text-[#4a3b2c] font-bold">
                  <span>Balance Due</span>
                  <span className="text-xl tabular-nums">{formatCurrency(totals.total, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-6 border-t border-[#c8b99d] text-center text-xs font-serif italic text-[#8c7b68]">
            <p>We are honored to craft this commission for you.</p>
            <p className="mt-1 font-sans text-[11px] not-italic">SWIFT: {paymentDetails.swift || 'LUXPARIS'}</p>
          </div>
        </div>
      )}
    </div>
  );
};
