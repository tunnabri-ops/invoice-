import React, { useState, useEffect } from 'react';
import { EmailActivityRecord } from '../../types';
import {
  X,
  History,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Paperclip,
  Mail,
  ExternalLink,
} from 'lucide-react';

interface EmailActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailActivityModal: React.FC<EmailActivityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activities, setActivities] = useState<EmailActivityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/activity');
      const data = await res.json();
      if (data.ok && Array.isArray(data.activities)) {
        setActivities(data.activities);
      }
    } catch (e) {
      console.error('Failed to load email activities', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden text-xs my-8 animate-in fade-in duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-lg shadow-xs">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Email Activity & Outbound Log</h3>
              <p className="text-slate-500 text-[11px]">
                Real-time API audit trail of dispatched invoices and receipts through Resend.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchActivities}
              disabled={isLoading}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-medium"
              title="Refresh log"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {activities.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Mail className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No outbound email activity yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Sent invoice emails and verification tests will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Subject / Document</th>
                    <th className="py-2.5 px-3">From Address</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3 text-right">Resend ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3">
                        {act.status === 'accepted' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Accepted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <AlertCircle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-900 block">{act.to}</span>
                        {act.hasAttachment && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 mt-0.5">
                            <Paperclip className="w-2.5 h-2.5" /> PDF Attached
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 line-clamp-1">{act.subject}</span>
                        {act.invoiceNumber && (
                          <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                            #{act.invoiceNumber}
                          </span>
                        )}
                        {act.error && (
                          <span className="text-[10px] text-red-600 block mt-0.5 line-clamp-1">
                            Error: {act.error}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {act.from}
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                        {new Date(act.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · {new Date(act.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-400">
                        {act.resendId ? (
                          <span className="text-indigo-600 font-semibold" title={act.resendId}>
                            {act.resendId.substring(0, 10)}...
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Total recorded outbound requests: {activities.length}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
