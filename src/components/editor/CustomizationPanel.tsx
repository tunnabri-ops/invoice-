import React, { useState } from 'react';
import { InvoiceData, LineItem } from '../../types';
import { PRESET_LOGOS } from '../../data/sampleData';
import {
  Palette,
  Type,
  Building,
  User,
  Plus,
  Trash2,
  Sliders,
  DollarSign,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from 'lucide-react';

interface CustomizationPanelProps {
  invoice: InvoiceData;
  onChange: (updated: InvoiceData) => void;
}

const COLOR_PRESETS = [
  { name: 'Slate Obsidian', primary: '#1e293b', accent: '#4f46e5' },
  { name: 'Corporate Navy', primary: '#1e3a8a', accent: '#0284c7' },
  { name: 'Emerald Finance', primary: '#065f46', accent: '#10b981' },
  { name: 'Royal Amethyst', primary: '#581c87', accent: '#a855f7' },
  { name: 'Luxury Gold', primary: '#b45309', accent: '#d97706' },
  { name: 'Crimson Executive', primary: '#881337', accent: '#e11d48' },
  { name: 'Deep Teal', primary: '#115e59', accent: '#14b8a6' },
  { name: 'Pure Charcoal', primary: '#171717', accent: '#525252' },
];

const FONT_OPTIONS = [
  { id: 'font-jakarta', label: 'Plus Jakarta Sans (Modern Clean)' },
  { id: 'font-manrope', label: 'Manrope (Geometric Modern)' },
  { id: 'font-outfit', label: 'Outfit (Friendly Contemporary)' },
  { id: 'font-dmsans', label: 'DM Sans (High Legibility)' },
  { id: 'font-playfair', label: 'Playfair Display (Luxury Serif)' },
  { id: 'font-fraunces', label: 'Fraunces (Editorial High-Fashion)' },
  { id: 'font-space', label: 'Space Grotesk (Tech Brutalist)' },
  { id: 'font-mono-code', label: 'IBM Plex Mono (Ledger & POS)' },
];

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  invoice,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'items' | 'parties' | 'payment'>('branding');

  const updateCustomization = (key: string, value: any) => {
    onChange({
      ...invoice,
      customization: {
        ...invoice.customization,
        [key]: value,
      },
    });
  };

  const updateBusiness = (key: string, value: any) => {
    onChange({
      ...invoice,
      business: {
        ...invoice.business,
        [key]: value,
      },
    });
  };

  const updateClient = (key: string, value: any) => {
    onChange({
      ...invoice,
      client: {
        ...invoice.client,
        [key]: value,
      },
    });
  };

  const updatePayment = (key: string, value: any) => {
    onChange({
      ...invoice,
      paymentDetails: {
        ...invoice.paymentDetails,
        [key]: value,
      },
    });
  };

  // Line item handlers
  const handleAddItem = () => {
    const newItem: LineItem = {
      id: `item_${Date.now()}`,
      description: 'New Professional Service / Product Item',
      quantity: 1,
      rate: 100,
      sku: `SRV-${Math.floor(100 + Math.random() * 900)}`,
    };
    onChange({
      ...invoice,
      items: [...invoice.items, newItem],
    });
  };

  const handleUpdateItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...invoice.items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'quantity' || field === 'rate' ? Number(value) || 0 : value,
    };
    onChange({
      ...invoice,
      items: updated,
    });
  };

  const handleDeleteItem = (index: number) => {
    if (invoice.items.length <= 1) return;
    const updated = invoice.items.filter((_, i) => i !== index);
    onChange({
      ...invoice,
      items: updated,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full text-xs">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/80 p-1">
        <button
          onClick={() => setActiveTab('branding')}
          className={`flex-1 py-2 px-2 text-center rounded-lg font-medium transition-colors ${
            activeTab === 'branding'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Branding & Style
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`flex-1 py-2 px-2 text-center rounded-lg font-medium transition-colors ${
            activeTab === 'items'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Line Items ({invoice.items.length})
        </button>
        <button
          onClick={() => setActiveTab('parties')}
          className={`flex-1 py-2 px-2 text-center rounded-lg font-medium transition-colors ${
            activeTab === 'parties'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Parties & Scope
        </button>
        <button
          onClick={() => setActiveTab('payment')}
          className={`flex-1 py-2 px-2 text-center rounded-lg font-medium transition-colors ${
            activeTab === 'payment'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Banking & Terms
        </button>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto max-h-[750px]">
        {/* TAB 1: BRANDING & STYLE */}
        {activeTab === 'branding' && (
          <div className="space-y-5">
            {/* Logo Presets */}
            <div>
              <label className="block text-slate-700 font-semibold mb-2">Company Emblem & Logo</label>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_LOGOS.map((logo) => (
                  <button
                    key={logo.id}
                    onClick={() => updateBusiness('name', logo.name === 'Nordic Studio' ? 'Nordic Studio LLC' : invoice.business.name)}
                    className="p-2 border border-slate-200 rounded-lg hover:border-slate-400 flex flex-col items-center justify-center gap-1 bg-slate-50 transition-colors"
                  >
                    <div
                      className="w-7 h-7 text-slate-700"
                      dangerouslySetInnerHTML={{ __html: logo.svg }}
                    />
                    <span className="text-[9px] text-slate-500 truncate w-full text-center">
                      {logo.name}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[11px] text-slate-500 block mb-1">Logo Size ({invoice.customization.logoSize}px)</label>
                  <input
                    type="range"
                    min="32"
                    max="80"
                    value={invoice.customization.logoSize}
                    onChange={(e) => updateCustomization('logoSize', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Brand Colors */}
            <div>
              <label className="block text-slate-700 font-semibold mb-2">Curated Brand Palettes</label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      updateCustomization('primaryColor', p.primary);
                      updateCustomization('accentColor', p.accent);
                    }}
                    className="p-2 rounded-lg border border-slate-200 hover:border-slate-400 flex items-center gap-1.5 text-left bg-slate-50"
                  >
                    <div
                      className="w-4 h-4 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: p.primary }}
                    />
                    <span className="text-[10px] text-slate-700 truncate">{p.name}</span>
                  </button>
                ))}
              </div>

              {/* Custom Hex Color Picker */}
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={invoice.customization.primaryColor}
                    onChange={(e) => updateCustomization('primaryColor', e.target.value)}
                    className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-600 font-mono">
                    {invoice.customization.primaryColor}
                  </span>
                </div>
                <span className="text-slate-400 text-xs">Custom Primary Accent</span>
              </div>
            </div>

            {/* Typography */}
            <div>
              <label className="block text-slate-700 font-semibold mb-2">Typography & Font Pairing</label>
              <select
                value={invoice.customization.fontFamily}
                onChange={(e) => updateCustomization('fontFamily', e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Table & Structure Style */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Currency Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={invoice.customization.currencySymbol}
                    onChange={(e) => updateCustomization('currencySymbol', e.target.value)}
                    className="w-12 py-1.5 px-2 border border-slate-300 rounded-lg text-center font-bold"
                  />
                  <select
                    value={invoice.customization.currency}
                    onChange={(e) => updateCustomization('currency', e.target.value)}
                    className="flex-1 py-1.5 px-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CHF">CHF (Fr)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Density / Scale</label>
                <select
                  value={invoice.customization.fontSize}
                  onChange={(e) => updateCustomization('fontSize', e.target.value)}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="compact">Compact (Dense Rows)</option>
                  <option value="normal">Standard A4 Balance</option>
                  <option value="spacious">Spacious (Editorial)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LINE ITEMS */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700">Invoice Items</span>
              <button
                onClick={handleAddItem}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white rounded text-xs hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {invoice.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                      placeholder="Item description"
                      className="flex-1 py-1 px-2 border border-slate-300 rounded bg-white text-xs font-medium"
                    />
                    <button
                      onClick={() => handleDeleteItem(idx)}
                      disabled={invoice.items.length <= 1}
                      className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Quantity</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                        className="w-full py-1 px-2 border border-slate-300 rounded bg-white text-xs text-right font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Unit Rate</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => handleUpdateItem(idx, 'rate', e.target.value)}
                        className="w-full py-1 px-2 border border-slate-300 rounded bg-white text-xs text-right font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">SKU / Code</span>
                      <input
                        type="text"
                        value={item.sku || ''}
                        onChange={(e) => handleUpdateItem(idx, 'sku', e.target.value)}
                        placeholder="SRV-01"
                        className="w-full py-1 px-2 border border-slate-300 rounded bg-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tax & Discount Controls */}
            <div className="pt-3 border-t border-slate-200 grid grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-600 block mb-1">Tax Rate (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={invoice.taxPercent}
                  onChange={(e) => onChange({ ...invoice, taxPercent: Number(e.target.value) || 0 })}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs text-right font-mono"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-600 block mb-1">Discount (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={invoice.discountValue}
                  onChange={(e) => onChange({ ...invoice, discountValue: Number(e.target.value) || 0 })}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs text-right font-mono"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-600 block mb-1">Shipping Fee</span>
                <input
                  type="number"
                  min="0"
                  value={invoice.shipping}
                  onChange={(e) => onChange({ ...invoice, shipping: Number(e.target.value) || 0 })}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs text-right font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PARTIES & IDENTIFIERS */}
        {activeTab === 'parties' && (
          <div className="space-y-4">
            {/* Invoice Meta */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Invoice #</span>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) => onChange({ ...invoice, invoiceNumber: e.target.value })}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded font-mono text-xs font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Issue Date</span>
                <input
                  type="date"
                  value={invoice.issueDate}
                  onChange={(e) => onChange({ ...invoice, issueDate: e.target.value })}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Due Date</span>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => onChange({ ...invoice, dueDate: e.target.value })}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>

            {/* Business Details */}
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2">
              <span className="font-bold text-slate-900 block">Your Business / Issuer</span>
              <input
                type="text"
                placeholder="Business Name"
                value={invoice.business.name}
                onChange={(e) => updateBusiness('name', e.target.value)}
                className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs font-semibold"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Email"
                  value={invoice.business.email}
                  onChange={(e) => updateBusiness('email', e.target.value)}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={invoice.business.phone}
                  onChange={(e) => updateBusiness('phone', e.target.value)}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
              <input
                type="text"
                placeholder="Street Address"
                value={invoice.business.address}
                onChange={(e) => updateBusiness('address', e.target.value)}
                className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City, State Zip"
                  value={`${invoice.business.city}, ${invoice.business.state} ${invoice.business.postalCode}`}
                  onChange={(e) => updateBusiness('city', e.target.value)}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs"
                />
                <input
                  type="text"
                  placeholder="Tax ID / VAT Reg"
                  value={invoice.business.taxId}
                  onChange={(e) => updateBusiness('taxId', e.target.value)}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Client Details */}
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2">
              <span className="font-bold text-slate-900 block">Client / Recipient</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={invoice.client.name}
                  onChange={(e) => updateClient('name', e.target.value)}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs font-semibold"
                />
                <input
                  type="text"
                  placeholder="Company Name"
                  value={invoice.client.company}
                  onChange={(e) => updateClient('company', e.target.value)}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
              <input
                type="text"
                placeholder="Client Email"
                value={invoice.client.email}
                onChange={(e) => updateClient('email', e.target.value)}
                className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs"
              />
              <input
                type="text"
                placeholder="Client Address"
                value={invoice.client.address}
                onChange={(e) => updateClient('address', e.target.value)}
                className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Client City, Country"
                  value={invoice.client.city}
                  onChange={(e) => updateClient('city', e.target.value)}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs"
                />
                <input
                  type="text"
                  placeholder="PO Reference"
                  value={invoice.client.poNumber || ''}
                  onChange={(e) => updateClient('poNumber', e.target.value)}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BANKING & PAYMENT TERMS */}
        {activeTab === 'payment' && (
          <div className="space-y-4">
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2">
              <span className="font-bold text-slate-900 block">Bank Wire Instructions</span>
              <input
                type="text"
                placeholder="Bank Name"
                value={invoice.paymentDetails.bankName}
                onChange={(e) => updatePayment('bankName', e.target.value)}
                className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Account Number"
                  value={invoice.paymentDetails.accountNumber}
                  onChange={(e) => updatePayment('accountNumber', e.target.value)}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs font-mono"
                />
                <input
                  type="text"
                  placeholder="Routing / Sort Code"
                  value={invoice.paymentDetails.routingOrSort}
                  onChange={(e) => updatePayment('routingOrSort', e.target.value)}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="IBAN"
                  value={invoice.paymentDetails.iban || ''}
                  onChange={(e) => updatePayment('iban', e.target.value)}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs font-mono"
                />
                <input
                  type="text"
                  placeholder="SWIFT / BIC"
                  value={invoice.paymentDetails.swift || ''}
                  onChange={(e) => updatePayment('swift', e.target.value)}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs font-mono"
                />
              </div>
              <input
                type="text"
                placeholder="PayPal Email or Stripe Payment Link"
                value={invoice.paymentDetails.paypalEmail || ''}
                onChange={(e) => updatePayment('paypalEmail', e.target.value)}
                className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Terms & Conditions</label>
              <textarea
                rows={2}
                value={invoice.terms}
                onChange={(e) => onChange({ ...invoice, terms: e.target.value })}
                className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Notes / Thank You Message</label>
              <textarea
                rows={2}
                value={invoice.notes}
                onChange={(e) => onChange({ ...invoice, notes: e.target.value })}
                className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
