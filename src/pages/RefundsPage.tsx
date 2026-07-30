import React, { useState, useEffect } from 'react';
import { RotateCcw, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { refundServiceAPI } from '../services/refundServiceAPI';
import type { RefundRequest } from '../types';

export const RefundsPage: React.FC = () => {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const data = await refundServiceAPI.getRefunds();
      setRefunds(data || []);
    } catch (err) {
      console.error('Failed to fetch refunds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleUpdateStatus = async (status: 'approved' | 'rejected' | 'completed') => {
    if (!selectedRefund) return;
    try {
      await refundServiceAPI.updateRefundStatus(selectedRefund.id, {
        status,
        adminNotes: adminNotes || undefined,
        refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
      });

      setSelectedRefund(null);
      fetchRefunds();
    } catch (err: any) {
      alert(err.message || 'Failed to update refund status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
            <Clock className="w-3 h-3" /> Requested
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle className="w-3 h-3" /> Completed & Restocked
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-200 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-accent" />
            Customer Refunds & Return Requests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review customer claim submissions, issue payment refunds, and auto-restock inventory.
          </p>
        </div>
        <button
          onClick={fetchRefunds}
          disabled={loading}
          className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Refunds Table */}
      <div className="bg-white dark:bg-cardbg-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex justify-center items-center gap-2">
            <RefreshCw className="animate-spin w-5 h-5 text-accent" />
            Loading refund requests...
          </div>
        ) : refunds.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <RotateCcw className="w-10 h-10 mx-auto mb-2 opacity-40 text-accent" />
            No refund or return requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Return Reason</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Requested At</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {refunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-accent">
                      {refund.order?.orderNumber || refund.orderId.substring(0, 8)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {refund.user?.fullName || refund.userId.substring(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {refund.reason}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {refund.refundAmount ? `LKR ${Number(refund.refundAmount).toLocaleString()}` : 'Full Order'}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(refund.status)}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(refund.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedRefund(refund);
                          setAdminNotes(refund.adminNotes || '');
                          setRefundAmount(refund.refundAmount ? String(refund.refundAmount) : '');
                        }}
                        className="px-3 py-1 rounded-md bg-accent/10 text-accent hover:bg-accent hover:text-white text-xs font-medium transition-all"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Management Modal */}
      {selectedRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 text-left">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  Process Refund Claim
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Order: {selectedRefund.order?.orderNumber || selectedRefund.orderId}
                </p>
              </div>
              {getStatusBadge(selectedRefund.status)}
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-xs space-y-1 text-slate-700 dark:text-slate-300">
              <p><strong>Customer Claim Reason:</strong> {selectedRefund.reason}</p>
              <p><strong>Claim Date:</strong> {new Date(selectedRefund.createdAt).toLocaleString()}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Approved Refund Amount (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Full order amount"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Admin Audit Notes</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter reason for approval or rejection..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 resize-none"
                />
              </div>

              {selectedRefund.status !== 'completed' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2 text-[11px] text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Marking status as <strong>Completed</strong> will automatically issue order status change and RESTOCK product stock quantities in inventory.</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedRefund(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus('rejected')}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium"
              >
                Reject Request
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus('approved')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus('completed')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm"
              >
                Complete & Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
