import React, { useState } from 'react';
import { InvoiceData, QuotationData, PaymentRecord, DocumentType } from '../../types';
import { InvoiceRenderer } from '../invoices/InvoiceRenderer';
import { ReceiptRenderer } from '../receipts/ReceiptRenderer';
import { QuotationRenderer } from '../quotations/QuotationRenderer';
import { X, Check, Printer, ZoomIn, ZoomOut, Download } from 'lucide-react';

interface PreviewModalProps {
  documentType: DocumentType;
  templateId: string;
  templateName: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
  invoice: InvoiceData;
  quotation: QuotationData;
  paymentRecord?: PaymentRecord;
  onPrint: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  documentType,
  templateId,
  templateName,
  isOpen,
  onClose,
  onSelectTemplate,
  invoice,
  quotation,
  paymentRecord,
  onPrint,
}) => {
  const [zoom, setZoom] = useState<number>(0.9);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-100 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden text-xs">
        {/* Modal Top Bar */}
        <div className="bg-white p-4 px-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>{templateName}</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono uppercase">
                  {documentType}
                </span>
              </h3>
              <p className="text-slate-500 text-[11px]">
                Full resolution vector rendering with live document data.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-2">
              <button
                onClick={() => setZoom(Math.max(0.6, zoom - 0.1))}
                className="p-1 hover:bg-white rounded text-slate-600"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[11px] font-mono text-slate-600">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(1.2, zoom + 0.1))}
                className="p-1 hover:bg-white rounded text-slate-600"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Vector PDF
            </button>

            <button
              onClick={() => {
                onSelectTemplate(templateId);
                onClose();
              }}
              className="flex items-center gap-1.5 py-1.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              Use This Template
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Viewport */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-200/70">
          <div
            className="transition-transform duration-150"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          >
            {documentType === 'invoice' && (
              <InvoiceRenderer invoice={{ ...invoice, templateId }} />
            )}
            {documentType === 'receipt' && (
              <ReceiptRenderer
                invoice={invoice}
                paymentRecord={paymentRecord}
                templateId={templateId}
              />
            )}
            {documentType === 'quotation' && (
              <QuotationRenderer quotation={{ ...quotation, templateId }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
