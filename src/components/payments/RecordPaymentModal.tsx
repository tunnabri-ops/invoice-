import React, { useState } from 'react';
import { InvoiceData, PaymentRecord } from '../../types';
import { calculateTotals, formatCurrency } from '../../data/sampleData';
import { X, CheckCircle2, DollarSign, CreditCard } from 'lucide-react';

interface RecordPaymentModalProps {
  invoice: InvoiceData;
  isOpen: boolean;
  onClose: () => void;
  onPaymentRecorded: (record: PaymentRecord) => void;
  defaultReceiptTemplate: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onPaymentRecorded,
  defaultReceiptTemplate,
}) => {
  const totals = calculateTotals(
    invoice.items,
    invoice.discountType,
    invoice.discountValue,
    invoice.taxPercent,
    invoice.shipping
  );

  const sym = invoice.customization.currencySymbol || '$';
  const curr = invoice.customization.currency || 'USD';
  const remainingDue = totals.total - (invoice.paidAmount || 0);

  const [amount, setAmount] = useState<number>(remainingDue > 0 ? remainingDue : totals.total);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [method, setMethod] = useState<PaymentRecord['paymentMethod']>('Bank Transfer / ACH');
  const [reference, setReference] = useState<string>(
    `TX-${Math.floor(100000 + Math.random() * 900000)}-${method.substring(0, 3).toUpperCase()}`
  );
  const [notes, setNotes] = useState<string>('Invoice payment received and verified.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: PaymentRecord = {
      id: `pay_${Date.now()}`,
      invoiceId: invoice.id,
      receiptNumber: `RCP-${invoice.invoiceNumber.replace('INV-', '')}-${Math.floor(1 + Math.random() * 9)}`,
      amountPaid: Number(amount) || 0,
      totalInvoiceAmount: totals.total,
      remainingBalance: Math.max(0, totals.total - ((invoice.paidAmount || 0) + Number(amount))),
      paymentDate,
      paymentMethod: method,
      transactionReference: reference,
      notes,
      templateId: defaultReceiptTemplate || 'receipt-stripe',
    };

    onPaymentRecorded(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden text-xs">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Record Verified Payment</h3>
              <p className="text-slate-500 text-[11px]">
                Issuing an official payment receipt for Invoice #{invoice.invoiceNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
            <div>
              <span className="text-[11px] text-slate-500 block">Total Invoiced Amount</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {formatCurrency(totals.total, sym, curr)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Current Balance Due</span>
              <span className="text-base font-bold text-emerald-700 tabular-nums">
                {formatCurrency(remainingDue, sym, curr)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Amount Paid ({sym})</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={totals.total * 2}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-full py-2.5 px-3 border border-slate-300 rounded-lg text-sm font-bold font-mono focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            {/* Quick buttons */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setAmount(remainingDue)}
                className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700"
              >
                Full Balance ({formatCurrency(remainingDue, sym, curr)})
              </button>
              <button
                type="button"
                onClick={() => setAmount(Math.round((totals.total * 0.5) * 100) / 100)}
                className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700"
              >
                50% Deposit
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
              <select
                value={method}
                onChange={(e) => {
                  const m = e.target.value as PaymentRecord['paymentMethod'];
                  setMethod(m);
                  setReference(`TX-${Math.floor(100000 + Math.random() * 900000)}-${m.substring(0, 3).toUpperCase()}`);
                }}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer / ACH">Bank Transfer / ACH</option>
                <option value="PayPal">PayPal</option>
                <option value="Stripe">Stripe</option>
                <option value="Wire Transfer">Wire Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Settlement Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Transaction Authorization Reference</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Receipt Notes / Voucher Allocation</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Confirm & Generate Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
