import React from 'react';
import { InvoiceData, PaymentRecord } from '../../types';
import { formatCurrency } from '../../data/sampleData';
import { CheckCircle2, ShieldCheck, QrCode, AlertCircle, CreditCard, Building } from 'lucide-react';

interface ReceiptRendererProps {
  invoice: InvoiceData;
  paymentRecord?: PaymentRecord;
  templateId?: string;
  onRecordPayment?: () => void;
  printMode?: boolean;
}

export const ReceiptRenderer: React.FC<ReceiptRendererProps> = ({
  invoice,
  paymentRecord,
  templateId = 'receipt-stripe',
  onRecordPayment,
  printMode = false,
}) => {
  const { business, client } = invoice;
  const sym = invoice.customization.currencySymbol || '$';
  const curr = invoice.customization.currency || 'USD';

  // If no payment has been recorded yet
  if (!paymentRecord) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Payment Not Yet Recorded</h3>
        <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
          In accordance with accounting principles, payment receipts can only be generated once a real payment has been recorded or verified.
        </p>
        <div className="mt-6">
          <button
            onClick={onRecordPayment}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            Record Verified Payment
          </button>
        </div>
      </div>
    );
  }

  const tid = templateId || paymentRecord.templateId || 'receipt-stripe';

  return (
    <div
      className={`receipt-document-sheet bg-white text-slate-800 shadow-xl mx-auto print-document-container transition-all duration-150 ${
        printMode ? 'w-full shadow-none p-0' : 'w-full max-w-[680px] rounded-sm'
      }`}
    >
      {/* 1. CLASSIC PAYMENT RECEIPT */}
      {tid === 'receipt-classic' && (
        <div className="p-10 md:p-12 relative overflow-hidden min-h-[750px] flex flex-col justify-between border-4 border-slate-900">
          {/* PAID Watermark Stamp */}
          <div className="absolute right-12 top-24 pointer-events-none opacity-85 rotate-[-18deg]">
            <div className="border-4 border-red-600 text-red-600 font-black text-4xl uppercase px-6 py-2 tracking-widest rounded-lg">
              PAID IN FULL
            </div>
          </div>

          <div>
            <div className="border-b-2 border-slate-900 pb-6 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{business.name}</h1>
                <p className="text-xs text-slate-600">{business.address}, {business.city}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Tax Reg: {business.taxId}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase text-slate-500">Official Receipt</span>
                <p className="text-xl font-bold font-mono text-slate-900">{paymentRecord.receiptNumber}</p>
                <p className="text-xs text-slate-600 mt-1">Date: {paymentRecord.paymentDate}</p>
              </div>
            </div>

            <div className="my-8 grid grid-cols-2 gap-6 text-xs bg-slate-50 p-4 border border-slate-200">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Received From</span>
                <p className="font-bold text-slate-900 text-sm">{client.name}</p>
                <p className="text-slate-700">{client.company}</p>
                <p className="text-slate-500">{client.email}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Payment Method</span>
                <p className="font-bold text-slate-900">{paymentRecord.paymentMethod}</p>
                <p className="text-slate-600 font-mono text-[11px] mt-0.5">Ref: {paymentRecord.transactionReference}</p>
                <p className="text-slate-500 mt-1">Invoice: #{invoice.invoiceNumber}</p>
              </div>
            </div>

            <div className="border border-slate-900 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white font-bold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Invoiced</th>
                    <th className="py-2.5 px-3 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      Payment for Invoice #{invoice.invoiceNumber}
                      <span className="block text-[11px] text-slate-500 font-normal">{paymentRecord.notes}</span>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-600 font-medium">
                      {formatCurrency(paymentRecord.totalInvoiceAmount, sym, curr)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-slate-900">
                      {formatCurrency(paymentRecord.amountPaid, sym, curr)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total Amount Paid:</span>
                  <span className="tabular-nums font-bold text-slate-900">{formatCurrency(paymentRecord.amountPaid, sym, curr)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Remaining Balance:</span>
                  <span className="tabular-nums font-bold text-slate-900">{formatCurrency(paymentRecord.remainingBalance, sym, curr)}</span>
                </div>
                <div className="pt-2 border-t-2 border-slate-900 flex justify-between font-black text-sm text-slate-900">
                  <span>Net Received:</span>
                  <span className="text-lg tabular-nums text-emerald-700">{formatCurrency(paymentRecord.amountPaid, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t-2 border-slate-900 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p>Certified Official Cashier Signature</p>
              <div className="h-10 border-b border-slate-400 w-44 mt-2" />
            </div>
            <p className="font-mono text-[10px]">AUTHORIZED VERIFICATION // OK</p>
          </div>
        </div>
      )}

      {/* 2. MINIMAL RECEIPT */}
      {tid === 'receipt-minimal' && (
        <div className="p-10 md:p-14 min-h-[750px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-baseline pb-8 border-b border-slate-100">
              <div>
                <span className="text-[10px] tracking-widest uppercase text-slate-400 block mb-1">Payment Receipt</span>
                <h1 className="text-2xl font-light text-slate-900">{business.name}</h1>
              </div>
              <div className="text-right">
                <p className="text-xl font-light text-slate-900">{paymentRecord.receiptNumber}</p>
                <p className="text-xs text-slate-400 mt-1">{paymentRecord.paymentDate}</p>
              </div>
            </div>

            <div className="py-8 border-b border-slate-100 grid grid-cols-2 gap-6 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Paid By</span>
                <p className="font-medium text-slate-900">{client.name}</p>
                <p className="text-slate-500">{client.email}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Amount Paid</span>
                <p className="text-3xl font-light tabular-nums text-slate-900">{formatCurrency(paymentRecord.amountPaid, sym, curr)}</p>
                <p className="text-slate-400 mt-1">{paymentRecord.paymentMethod}</p>
              </div>
            </div>

            <div className="py-6 space-y-3 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Invoice Applied</span>
                <span className="font-medium text-slate-900">#{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Transaction Reference</span>
                <span className="font-mono text-slate-700">{paymentRecord.transactionReference}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Remaining Account Balance</span>
                <span className="tabular-nums font-medium text-slate-900">{formatCurrency(paymentRecord.remainingBalance, sym, curr)}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
            <p>{business.email}</p>
            <p>Payment recorded and verified</p>
          </div>
        </div>
      )}

      {/* 3. STRIPE-INSPIRED RECEIPT */}
      {tid === 'receipt-stripe' && (
        <div className="p-8 md:p-12 min-h-[750px] flex flex-col justify-between bg-slate-50/70">
          <div>
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-8 max-w-lg mx-auto">
              <div className="text-center pb-6 border-b border-slate-100">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Receipt</span>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
                  {formatCurrency(paymentRecord.amountPaid, sym, curr)}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Paid on {paymentRecord.paymentDate}</p>
              </div>

              <div className="py-6 space-y-3 text-xs border-b border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Merchant</span>
                  <span className="font-semibold text-slate-900">{business.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Receipt Number</span>
                  <span className="font-mono text-slate-900 font-medium">{paymentRecord.receiptNumber}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Invoice Number</span>
                  <span className="font-medium text-slate-900">#{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Payment Method</span>
                  <span className="font-medium text-slate-900 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    {paymentRecord.paymentMethod} (•••• 4242)
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Authorization Reference</span>
                  <span className="font-mono text-slate-600">{paymentRecord.transactionReference}</span>
                </div>
              </div>

              <div className="pt-6 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total Invoiced</span>
                  <span className="tabular-nums font-medium">{formatCurrency(paymentRecord.totalInvoiceAmount, sym, curr)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Amount Paid</span>
                  <span className="tabular-nums">-{formatCurrency(paymentRecord.amountPaid, sym, curr)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                  <span>Remaining Balance</span>
                  <span className="tabular-nums">{formatCurrency(paymentRecord.remainingBalance, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 mt-8">
            <p>Thank you for your payment to {business.name}.</p>
            <p className="text-[11px] mt-0.5">Need a refund or help? Contact {business.email}</p>
          </div>
        </div>
      )}

      {/* 4. PREMIUM BUSINESS RECEIPT */}
      {tid === 'receipt-premium' && (
        <div className="p-10 md:p-12 min-h-[750px] flex flex-col justify-between border-2 border-slate-800">
          <div>
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center rounded-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-blue-400" />
                <div>
                  <h1 className="text-xl font-bold">{business.name}</h1>
                  <p className="text-xs text-slate-300">Corporate Payment Voucher</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">VOUCHER #</p>
                <p className="text-lg font-mono font-bold text-blue-400">{paymentRecord.receiptNumber}</p>
              </div>
            </div>

            <div className="my-8 grid grid-cols-2 gap-8 text-xs bg-slate-50 p-5 rounded border border-slate-200">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block mb-1">Account Credited</span>
                <p className="font-bold text-slate-900 text-sm">{client.company}</p>
                <p className="text-slate-600">Client: {client.name}</p>
                <p className="text-slate-500 font-mono mt-1">Invoice: #{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right space-y-1">
                <p><span className="text-slate-500">Execution Date:</span> <strong className="text-slate-900">{paymentRecord.paymentDate}</strong></p>
                <p><span className="text-slate-500">Method:</span> <strong>{paymentRecord.paymentMethod}</strong></p>
                <p><span className="text-slate-500">Transaction ID:</span> <span className="font-mono text-slate-700">{paymentRecord.transactionReference}</span></p>
              </div>
            </div>

            <div className="p-5 border border-slate-200 rounded text-xs space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Total Invoice Commitment</span>
                <span className="tabular-nums font-semibold">{formatCurrency(paymentRecord.totalInvoiceAmount, sym, curr)}</span>
              </div>
              <div className="flex justify-between text-blue-900 font-bold">
                <span>Payment Remittance Cleared</span>
                <span className="tabular-nums text-base">{formatCurrency(paymentRecord.amountPaid, sym, curr)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-600 font-semibold">
                <span>Remaining Account Payable</span>
                <span className="tabular-nums">{formatCurrency(paymentRecord.remainingBalance, sym, curr)}</span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
            <p>Certified corporate receipt for expense deduction and accounting compliance.</p>
            <p className="font-mono text-[11px] font-bold text-slate-800">AUDIT VERIFIED</p>
          </div>
        </div>
      )}

      {/* 5. DARK PREMIUM RECEIPT */}
      {tid === 'receipt-dark' && (
        <div className="p-10 md:p-12 min-h-[750px] flex flex-col justify-between bg-slate-950 text-slate-100 font-mono border border-slate-800">
          <div>
            <div className="flex justify-between items-start pb-6 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block mb-1">
                  PAYMENT RECEIPT HASH
                </span>
                <h1 className="text-2xl font-bold text-white">{business.name}</h1>
                <p className="text-xs text-slate-400 mt-1">LEDGER TX // {paymentRecord.transactionReference}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-emerald-400">{paymentRecord.receiptNumber}</p>
                <p className="text-xs text-slate-500 mt-1">{paymentRecord.paymentDate}</p>
              </div>
            </div>

            <div className="my-8 p-6 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">SETTLED AMOUNT</span>
                <span className="text-2xl font-bold text-emerald-400 tabular-nums">
                  {formatCurrency(paymentRecord.amountPaid, sym, curr)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>METHOD</span>
                <span className="text-white">{paymentRecord.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>INVOICE LINK</span>
                <span className="text-white">#{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>REMAINING BALANCE</span>
                <span className="text-white tabular-nums">{formatCurrency(paymentRecord.remainingBalance, sym, curr)}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
            <p>CRYPTO-SIGN: OK // BLOCK 910283</p>
            <p className="text-emerald-400">PAYMENT CONFIRMED</p>
          </div>
        </div>
      )}

      {/* 6. E-COMMERCE RECEIPT */}
      {tid === 'receipt-ecommerce' && (
        <div className="p-8 md:p-10 min-h-[750px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start pb-6 border-b border-slate-200">
              <div>
                <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded uppercase">Order Paid</span>
                <h1 className="text-2xl font-bold text-slate-900 mt-2">{business.name}</h1>
                <p className="text-xs text-slate-500">Order #{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Receipt Number</p>
                <p className="text-lg font-bold font-mono text-slate-900">{paymentRecord.receiptNumber}</p>
                <p className="text-xs text-slate-500 mt-1">{paymentRecord.paymentDate}</p>
              </div>
            </div>

            <div className="my-6 p-4 bg-sky-50/50 rounded-lg border border-sky-100 text-xs flex justify-between">
              <div>
                <p className="text-slate-500">Shipped To:</p>
                <p className="font-bold text-slate-900">{client.name}</p>
                <p className="text-slate-600">{client.address}, {client.city}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Carrier Status:</p>
                <p className="font-bold text-sky-900">Preparing Shipment</p>
                <p className="text-slate-500 font-mono text-[11px]">Tracking: EXP-90281-US</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full">
                <thead className="bg-slate-50 text-slate-700 font-bold">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Purchased Items</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.slice(0, 3).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{item.description} ({item.quantity}x)</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">{formatCurrency(item.quantity * item.rate, sym, curr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="w-64 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Amount Charged:</span>
                  <span className="tabular-nums font-bold text-slate-900">{formatCurrency(paymentRecord.amountPaid, sym, curr)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
            <p>Thank you for shopping with {business.name}! A tracking email will follow once shipped.</p>
          </div>
        </div>
      )}

      {/* 7. SUBSCRIPTION RECEIPT */}
      {tid === 'receipt-subscription' && (
        <div className="p-8 md:p-12 min-h-[750px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start pb-6 border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">
                  S
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{business.name}</h1>
                  <p className="text-xs text-indigo-600 font-medium">Subscription Payment Cleared</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-mono font-bold text-slate-900">{paymentRecord.receiptNumber}</p>
                <p className="text-xs text-slate-500 mt-1">{paymentRecord.paymentDate}</p>
              </div>
            </div>

            <div className="my-8 p-6 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Subscriber:</span>
                <span className="font-bold text-slate-900">{client.name} ({client.company})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Cycle:</span>
                <span className="font-medium text-slate-800">Monthly Recurring (Next: Nov 22, 2026)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plan Tier:</span>
                <span className="font-bold text-indigo-900">Enterprise Cloud Tier (Unlimited)</span>
              </div>
              <div className="pt-2 border-t border-indigo-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Charge Applied:</span>
                <span className="text-lg tabular-nums text-indigo-700">{formatCurrency(paymentRecord.amountPaid, sym, curr)}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 text-center">
            <p>Your subscription is active. Manage plan or cancel renewal at {business.website}/account</p>
          </div>
        </div>
      )}

      {/* 8. FREELANCER RECEIPT */}
      {tid === 'receipt-freelancer' && (
        <div className="p-8 md:p-12 min-h-[750px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start pb-6 border-b border-teal-100">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase">Freelance Payment Receipt</span>
                <h1 className="text-2xl font-bold text-slate-900 mt-1">{business.name}</h1>
                <p className="text-xs text-slate-500">{business.email}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">{paymentRecord.receiptNumber}</p>
                <p className="text-xs text-slate-500">{paymentRecord.paymentDate}</p>
              </div>
            </div>

            <div className="my-8 p-6 bg-teal-50/60 rounded-xl border border-teal-100 text-xs">
              <p className="text-sm font-semibold text-teal-900 mb-2">Thank you so much, {client.name}!</p>
              <p className="text-slate-600 leading-relaxed">
                I have received your payment of <strong>{formatCurrency(paymentRecord.amountPaid, sym, curr)}</strong> for invoice #{invoice.invoiceNumber}.
                It has been an absolute pleasure collaborating on this project with {client.company}.
              </p>
              <div className="mt-4 pt-4 border-t border-teal-200 flex justify-between text-slate-700">
                <span>Method: {paymentRecord.paymentMethod}</span>
                <span className="font-mono">Ref: {paymentRecord.transactionReference}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 italic">
            <p>Looking forward to our next collaboration!</p>
          </div>
        </div>
      )}

      {/* 9. CORPORATE RECEIPT */}
      {tid === 'receipt-corporate' && (
        <div className="p-8 md:p-10 min-h-[750px] flex flex-col justify-between border border-slate-300">
          <div>
            <div className="flex justify-between items-start pb-6 border-b-2 border-slate-700">
              <div>
                <h1 className="text-xl font-bold uppercase text-slate-900">{business.name}</h1>
                <p className="text-xs text-slate-500">Corporate Finance & Accounts Department</p>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase font-bold text-slate-400">Payment Voucher</span>
                <p className="text-lg font-mono font-bold text-slate-900">{paymentRecord.receiptNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-6 text-xs bg-slate-50 p-4 border border-slate-200">
              <div>
                <p><span className="text-slate-500">Vendor / Payee:</span> <strong>{business.name}</strong></p>
                <p><span className="text-slate-500">Client / Payer:</span> <strong>{client.company}</strong></p>
                <p><span className="text-slate-500">Applied Invoice:</span> #{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right space-y-1">
                <p><span className="text-slate-500">GL Cost Center:</span> <strong>GL-8820-FIN</strong></p>
                <p><span className="text-slate-500">Approval Code:</span> <strong>APP-9021-EXEC</strong></p>
                <p><span className="text-slate-500">Cleared Date:</span> {paymentRecord.paymentDate}</p>
              </div>
            </div>

            <div className="p-4 border border-slate-300 text-xs flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">Total Remitted Amount</p>
                <p className="text-slate-500 text-[11px] font-mono">TX: {paymentRecord.transactionReference}</p>
              </div>
              <span className="text-xl font-bold font-mono text-slate-900">{formatCurrency(paymentRecord.amountPaid, sym, curr)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-300 flex justify-between text-xs text-slate-500">
            <p>Finance Comptroller Verified</p>
            <p className="font-mono">STATUS: CLEARED FUNDS</p>
          </div>
        </div>
      )}

      {/* 10. LUXURY RECEIPT */}
      {tid === 'receipt-luxury' && (
        <div className="p-10 md:p-14 min-h-[750px] flex flex-col justify-between bg-[#0e0f11] text-[#f4ecd8] border-[6px] border-[#1d1e22]">
          <div>
            <div className="text-center pb-8 border-b border-[#d4af37]/40">
              <h1 className="text-2xl font-serif tracking-[0.25em] uppercase text-[#d4af37]">{business.name}</h1>
              <p className="text-[10px] text-[#c8b99d] tracking-widest uppercase mt-1">Sales Receipt & Certificate of Settlement</p>
              <p className="text-xs text-[#a89b83] font-serif mt-2">Folio #{paymentRecord.receiptNumber} · {paymentRecord.paymentDate}</p>
            </div>

            <div className="my-8 text-center text-xs font-serif">
              <p className="text-xs text-[#c8b99d] tracking-widest uppercase">Honored Patron</p>
              <p className="text-lg text-white font-medium mt-1">{client.name}</p>
              <p className="text-[#a89b83]">{client.company}</p>

              <div className="mt-8 p-6 border border-[#d4af37]/30 bg-[#16171a] rounded-sm max-w-sm mx-auto">
                <span className="text-[10px] text-[#d4af37] tracking-widest uppercase block mb-1">Total Valuation Cleared</span>
                <p className="text-3xl font-serif text-[#d4af37] tabular-nums font-light">
                  {formatCurrency(paymentRecord.amountPaid, sym, curr)}
                </p>
                <p className="text-[10px] text-[#a89b83] uppercase tracking-wider mt-1">{paymentRecord.paymentMethod}</p>
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] font-serif tracking-widest text-[#a89b83] uppercase pt-6 border-t border-[#d4af37]/20">
            <p>With our deepest appreciation for your distinguished patronage.</p>
          </div>
        </div>
      )}

      {/* 11. MODERN DIGITAL RECEIPT */}
      {tid === 'receipt-digital' && (
        <div className="p-8 md:p-10 min-h-[750px] flex flex-col justify-between bg-slate-50/80">
          <div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center max-w-sm mx-auto">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Digital App Receipt</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{formatCurrency(paymentRecord.amountPaid, sym, curr)}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{paymentRecord.paymentDate}</p>

              <div className="mt-6 pt-4 border-t border-slate-100 text-xs space-y-2.5 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Merchant</span>
                  <span className="font-semibold text-slate-800">{business.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Invoice</span>
                  <span className="font-medium text-slate-800">#{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Method</span>
                  <span className="font-medium text-slate-800">{paymentRecord.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Auth Token</span>
                  <span className="font-mono text-purple-700 text-[11px]">{paymentRecord.transactionReference.substring(0, 16)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 mt-6">
            <p>Tap to verify authenticity online · Powered by InvoiceCraft</p>
          </div>
        </div>
      )}

      {/* 12. COMPACT RECEIPT */}
      {tid === 'receipt-compact' && (
        <div className="p-6 md:p-8 min-h-[750px] max-w-sm mx-auto font-mono text-xs flex flex-col justify-between border-t-4 border-b-4 border-dashed border-slate-400 bg-white">
          <div>
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <h1 className="text-lg font-bold uppercase">{business.name}</h1>
              <p className="text-[10px] text-slate-600">{business.address}</p>
              <p className="text-[10px] text-slate-500">TEL: {business.phone}</p>
              <p className="text-[10px] text-slate-500 mt-1">REC: {paymentRecord.receiptNumber}</p>
            </div>

            <div className="py-4 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{paymentRecord.paymentDate}</span>
              </div>
              <div className="flex justify-between">
                <span>CLIENT:</span>
                <span>{client.name}</span>
              </div>
              <div className="flex justify-between">
                <span>INV REF:</span>
                <span>#{invoice.invoiceNumber}</span>
              </div>
            </div>

            <div className="py-4 border-b-2 border-dashed border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between font-bold">
                <span>AMOUNT PAID:</span>
                <span>{formatCurrency(paymentRecord.amountPaid, sym, curr)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>METHOD:</span>
                <span>{paymentRecord.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>AUTH REF:</span>
                <span className="truncate max-w-[140px]">{paymentRecord.transactionReference}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>BAL DUE:</span>
                <span>{formatCurrency(paymentRecord.remainingBalance, sym, curr)}</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-6 space-y-1">
            <p className="font-bold text-[11px]">*** PAYMENT RECEIVED ***</p>
            <p className="text-[9px] text-slate-500">THANK YOU FOR YOUR PATRONAGE</p>
            <div className="h-6 w-36 bg-slate-900 mx-auto text-white flex items-center justify-center text-[7px] tracking-widest mt-2">
              ||| |||| || ||| ||||
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
