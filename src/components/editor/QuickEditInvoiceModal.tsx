import React, { useState } from 'react';
import { InvoiceData, LineItem } from '../../types';
import { calculateTotals, formatCurrency } from '../../data/sampleData';
import {
  X,
  Check,
  Plus,
  Trash2,
  Building,
  User,
  Calendar,
  FileText,
  DollarSign,
  Percent,
} from 'lucide-react';

interface QuickEditInvoiceModalProps {
  invoice: InvoiceData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: InvoiceData) => void;
}

export const QuickEditInvoiceModal: React.FC<QuickEditInvoiceModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<InvoiceData>(invoice);
  const [activeSection, setActiveSection] = useState<'items' | 'parties' | 'details'>('items');

  if (!isOpen) return null;

  const sym = formData.customization.currencySymbol || '$';
  const curr = formData.customization.currency || 'USD';

  const totals = calculateTotals(
    formData.items,
    formData.discountType,
    formData.discountValue,
    formData.taxPercent,
    formData.shipping
  );

  const handleUpdateItem = (index: number, field: keyof LineItem, val: any) => {
    const updated = [...formData.items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'quantity' || field === 'rate' ? Number(val) || 0 : val,
    };
    setFormData({ ...formData, items: updated });
  };

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: `item_${Date.now()}`,
      description: 'New Service or Product',
      quantity: 1,
      rate: 150,
      sku: `SRV-${Math.floor(100 + Math.random() * 900)}`,
    };
    setFormData({ ...formData, items: [...formData.items, newItem] });
  };

  const handleDeleteItem = (index: number) => {
    if (formData.items.length <= 1) return;
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden text-xs my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-lg shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Edit Invoice #{formData.invoiceNumber}
              </h3>
              <p className="text-slate-500 text-[11px]">
                Update line items, pricing, recipient, dates, and payment instructions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-200/80 p-1 rounded-lg flex text-xs">
              <button
                type="button"
                onClick={() => setActiveSection('items')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeSection === 'items'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Line Items ({formData.items.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('parties')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeSection === 'parties'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Issuer & Client
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('details')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeSection === 'details'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dates & Notes
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: LINE ITEMS */}
          {activeSection === 'items' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">Line Items & Rates</span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Line Item
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 text-left">Item Description</th>
                      <th className="py-2.5 px-3 text-left w-28">SKU / Code</th>
                      <th className="py-2.5 px-3 text-right w-24">Quantity</th>
                      <th className="py-2.5 px-3 text-right w-32">Rate ({sym})</th>
                      <th className="py-2.5 px-3 text-right w-32">Total ({sym})</th>
                      <th className="py-2.5 px-2 text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                            placeholder="Service description"
                            className="w-full py-1.5 px-2 border border-slate-300 rounded font-medium text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                            required
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.sku || ''}
                            onChange={(e) => handleUpdateItem(idx, 'sku', e.target.value)}
                            placeholder="SKU"
                            className="w-full py-1.5 px-2 border border-slate-300 rounded font-mono text-[11px]"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                            className="w-full py-1.5 px-2 border border-slate-300 rounded font-mono text-right text-xs"
                            required
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.rate}
                            onChange={(e) => handleUpdateItem(idx, 'rate', e.target.value)}
                            className="w-full py-1.5 px-2 border border-slate-300 rounded font-mono text-right text-xs"
                            required
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(item.quantity * item.rate, sym, curr)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(idx)}
                            disabled={formData.items.length <= 1}
                            className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-20"
                            title="Delete line item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Taxes Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Tax Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.taxPercent}
                      onChange={(e) =>
                        setFormData({ ...formData, taxPercent: Number(e.target.value) || 0 })
                      }
                      className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs text-right font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({ ...formData, discountValue: Number(e.target.value) || 0 })
                      }
                      className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs text-right font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Shipping ({sym})</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.shipping}
                      onChange={(e) =>
                        setFormData({ ...formData, shipping: Number(e.target.value) || 0 })
                      }
                      className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs text-right font-mono"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono font-semibold">{formatCurrency(totals.subtotal, sym, curr)}</span>
                  </div>
                  {totals.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount ({formData.discountValue}%)</span>
                      <span className="font-mono font-semibold">-{formatCurrency(totals.discountAmount, sym, curr)}</span>
                    </div>
                  )}
                  {totals.taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Tax ({formData.taxPercent}%)</span>
                      <span className="font-mono font-semibold">+{formatCurrency(totals.taxAmount, sym, curr)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-sm text-slate-900">
                    <span>Grand Total Due</span>
                    <span className="text-base font-mono text-emerald-700">
                      {formatCurrency(totals.total, sym, curr)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: ISSUER & CLIENT */}
          {activeSection === 'parties' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business (Issuer) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-slate-600" />
                  Your Business (Issuer)
                </span>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Company / Business Name</label>
                  <input
                    type="text"
                    value={formData.business.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        business: { ...formData.business, name: e.target.value },
                      })
                    }
                    className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white font-semibold"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.business.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          business: { ...formData.business, email: e.target.value },
                        })
                      }
                      className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Phone</label>
                    <input
                      type="text"
                      value={formData.business.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          business: { ...formData.business, phone: e.target.value },
                        })
                      }
                      className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.business.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        business: { ...formData.business, address: e.target.value },
                      })
                    }
                    className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">City, State Zip</label>
                    <input
                      type="text"
                      value={`${formData.business.city}, ${formData.business.state}`}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          business: { ...formData.business, city: e.target.value },
                        })
                      }
                      className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Tax / VAT ID</label>
                    <input
                      type="text"
                      value={formData.business.taxId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          business: { ...formData.business, taxId: e.target.value },
                        })
                      }
                      className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Client (Recipient) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-600" />
                  Client (Recipient)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Client Contact Name</label>
                    <input
                      type="text"
                      value={formData.client.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          client: { ...formData.client, name: e.target.value },
                        })
                      }
                      className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Client Company</label>
                    <input
                      type="text"
                      value={formData.client.company}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          client: { ...formData.client, company: e.target.value },
                        })
                      }
                      className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Client Email (for invoice sending)
                  </label>
                  <input
                    type="email"
                    value={formData.client.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        client: { ...formData.client, email: e.target.value },
                      })
                    }
                    className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Client Address</label>
                  <input
                    type="text"
                    value={formData.client.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        client: { ...formData.client, address: e.target.value },
                      })
                    }
                    className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">City, Country</label>
                    <input
                      type="text"
                      value={formData.client.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          client: { ...formData.client, city: e.target.value },
                        })
                      }
                      className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">PO / Project Ref</label>
                    <input
                      type="text"
                      value={formData.client.poNumber || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          client: { ...formData.client, poNumber: e.target.value },
                        })
                      }
                      className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: DATES & NOTES */}
          {activeSection === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg font-mono font-bold text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Instructions / Bank Wire</label>
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={formData.paymentDetails.bankName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentDetails: { ...formData.paymentDetails, bankName: e.target.value },
                      })
                    }
                    className="py-1.5 px-2 border border-slate-300 rounded bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={formData.paymentDetails.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentDetails: { ...formData.paymentDetails, accountNumber: e.target.value },
                      })
                    }
                    className="py-1.5 px-2 border border-slate-300 rounded bg-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Routing / IBAN"
                    value={formData.paymentDetails.iban || formData.paymentDetails.routingOrSort}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentDetails: { ...formData.paymentDetails, iban: e.target.value },
                      })
                    }
                    className="py-1.5 px-2 border border-slate-300 rounded bg-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="SWIFT / PayPal"
                    value={formData.paymentDetails.paypalEmail || formData.paymentDetails.swift || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentDetails: { ...formData.paymentDetails, paypalEmail: e.target.value },
                      })
                    }
                    className="py-1.5 px-2 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes / Closing Message</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Terms</label>
                <textarea
                  rows={2}
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>
          )}

          {/* Footer Save Button */}
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
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Save & Apply to Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
