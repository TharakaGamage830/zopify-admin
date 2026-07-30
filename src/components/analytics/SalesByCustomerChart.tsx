import React, { useState } from 'react';
import type { CustomerSalesStat } from '../../types';
import { Users, Search, Award } from 'lucide-react';


interface SalesByCustomerChartProps {
  customers: CustomerSalesStat[];
}

export const SalesByCustomerChart: React.FC<SalesByCustomerChartProps> = ({ customers }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!customers || customers.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-cardbg-dark">
        No customer sales data registered yet.
      </div>
    );
  }

  const totalSpendAll = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgCustomerSpend = customers.length > 0 ? totalSpendAll / customers.length : 0;
  const maxSpend = Math.max(...customers.map((c) => c.totalSpent), 1);

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Users className="text-amber-500" size={20} />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Customer-Wise Sales Analytics
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Customer lifetime value, order frequency, and individual purchasing patterns
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search customer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent outline-none"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Purchasing Customers</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">{customers.length} Accounts</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Customer Spend</div>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">${avgCustomerSpend.toFixed(2)}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Top Customer Lifetime Value</div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">${maxSpend.toFixed(2)}</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Customer Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Total Orders</th>
              <th className="py-3 px-4">Avg Order Value (AOV)</th>
              <th className="py-3 px-4">Total Spent</th>
              <th className="py-3 px-4">Customer Status</th>
              <th className="py-3 px-4">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            {filteredCustomers.map((c, index) => {
              let tierBadge = 'Regular Customer';
              let badgeColor = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
              if (index === 0 && c.totalSpent > 0) {
                tierBadge = 'Top Platinum Buyer';
                badgeColor = 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40';
              } else if (index < 3 && c.totalSpent > 0) {
                tierBadge = 'Gold Customer';
                badgeColor = 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40';
              }

              return (
                <tr key={c.userId} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Award size={16} className="text-amber-500 shrink-0" />}
                      <span>{c.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {c.email}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-200">
                    {c.totalOrders} order(s)
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    ${c.avgOrderValue.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                    ${c.totalSpent.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${badgeColor}`}>
                      {tierBadge}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(c.lastOrderDate).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  No matching customer sales records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
