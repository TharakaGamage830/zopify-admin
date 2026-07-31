import React from 'react';
import type { Order } from '../../types';

interface OrdersTableProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: Order['status']) => void;
  onUpdatePayment: (id: string, paymentStatus: string) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onUpdateStatus, onUpdatePayment }) => {
  return (
    <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-cardbg-dark shadow-sm text-left">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">User details</th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Placed Date</th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Payment Status</th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Order Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-cardbg-dark">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
                  {o.id.substring(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{o.user?.fullName}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">{o.user?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-slate-100">
                  Rs. {parseFloat(o.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    className="block w-full rounded-md border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1.5 focus:border-accent focus:ring-accent"
                    value={o.paymentStatus}
                    onChange={(e) => onUpdatePayment(o.id, e.target.value)}
                  >
                    <option value="unpaid">unpaid</option>
                    <option value="paid">paid</option>
                    <option value="failed">failed</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    className="block w-full rounded-md border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1.5 focus:border-accent focus:ring-accent"
                    value={o.status}
                    onChange={(e) => onUpdateStatus(o.id, e.target.value as any)}
                  >
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                    <option value="refunded">refunded</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                  No orders placed in the system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
