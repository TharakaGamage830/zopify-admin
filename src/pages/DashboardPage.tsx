import React, { useState } from 'react';
import type { DashboardSummary } from '../types';
import { MetricsGrid } from '../components/sections/MetricsGrid';
import { RevenueTrendChart } from '../components/analytics/RevenueTrendChart';
import { SalesByProductChart } from '../components/analytics/SalesByProductChart';
import { SalesByCategoryChart } from '../components/analytics/SalesByCategoryChart';
import { SalesByCustomerChart } from '../components/analytics/SalesByCustomerChart';
import { Package, Layers, Users, BarChart3 } from 'lucide-react';


interface DashboardPageProps {
  summary: DashboardSummary | null;
  productCount: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ summary, productCount }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'product' | 'category' | 'customer'>('overview');

  if (!summary) {
    return (
      <div className="flex-grow flex items-center justify-center text-slate-400 p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Loading analytical metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-left animate-in fade-in duration-200 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-200">
            Analytical Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time business performance analytics, order volume trends, and sales segmentation.
          </p>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-cardbg-dark text-accent shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 size={15} />
            <span>Overview Trends</span>
          </button>

          <button
            onClick={() => setActiveTab('product')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'product'
                ? 'bg-white dark:bg-cardbg-dark text-accent shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Package size={15} />
            <span>Product Sales</span>
          </button>

          <button
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'category'
                ? 'bg-white dark:bg-cardbg-dark text-accent shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers size={15} />
            <span>Category Sales</span>
          </button>

          <button
            onClick={() => setActiveTab('customer')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'customer'
                ? 'bg-white dark:bg-cardbg-dark text-accent shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users size={15} />
            <span>Customer Sales</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <MetricsGrid
        revenue={summary.revenue}
        orderCount={summary.orderCount}
        productCount={productCount}
      />

      {/* Dynamic Tab Views */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Revenue Trend Line & Area Chart */}
          <RevenueTrendChart data={summary.revenueTrend || []} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Products */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-wider">
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
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-wider">
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
      )}

      {activeTab === 'product' && (
        <SalesByProductChart products={summary.salesByProduct || []} />
      )}

      {activeTab === 'category' && (
        <SalesByCategoryChart categories={summary.salesByCategory || []} />
      )}

      {activeTab === 'customer' && (
        <SalesByCustomerChart customers={summary.salesByCustomer || []} />
      )}
    </div>
  );
};

