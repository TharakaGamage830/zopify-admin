import React from 'react';
import type { DashboardSummary } from '../types';
import { MetricsGrid } from '../components/sections/MetricsGrid';

interface DashboardPageProps {
  summary: DashboardSummary | null;
  productCount: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ summary, productCount }) => {
  if (!summary) {
    return (
      <div className="flex-grow flex items-center justify-center text-slate-400">
        Loading analytics metrics...
      </div>
    );
  }

  return (
    <div className="text-left animate-in fade-in duration-200">
      <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200 mb-6">
        Analytics Dashboard
      </h1>

      <MetricsGrid
        revenue={summary.revenue}
        orderCount={summary.orderCount}
        productCount={productCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider text-[11px]">
            Top Selling Products
          </h3>
          <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-cardbg-dark shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Units Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {summary.topProducts.map((p: any) => (
                  <tr key={p.productId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-slate-200">{p.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">${p.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-accent dark:text-accent-light">{p.totalSold}</td>
                  </tr>
                ))}
                {summary.topProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                      No sales data logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider text-[11px]">
            Inventory Stock Alerts
          </h3>
          <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-cardbg-dark shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Stock Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {summary.lowStockAlerts.map((p: any) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-slate-200">{p.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        p.stockQuantity === 0 
                          ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400' 
                          : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                      }`}>
                        {p.stockQuantity} remaining
                      </span>
                    </td>
                  </tr>
                ))}
                {summary.lowStockAlerts.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-sm text-emerald-500 dark:text-emerald-400 font-medium">
                      All products have sufficient stock.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
