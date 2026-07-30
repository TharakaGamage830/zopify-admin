import React, { useState } from 'react';
import type { ProductSalesStat } from '../../types';
import { Package, Search, ArrowUpDown, Tag } from 'lucide-react';


interface SalesByProductChartProps {
  products: ProductSalesStat[];
}

export const SalesByProductChart: React.FC<SalesByProductChartProps> = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'revenue' | 'sold' | 'price' | 'stock'>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  if (!products || products.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-cardbg-dark">
        No product sales recorded yet.
      </div>
    );
  }

  const maxRevenue = Math.max(...products.map((p) => p.totalRevenue), 1);
  const totalRevenueAll = products.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalUnitsAll = products.reduce((sum, p) => sum + p.totalSold, 0);

  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let valA = a.totalRevenue;
      let valB = b.totalRevenue;
      if (sortBy === 'sold') {
        valA = a.totalSold;
        valB = b.totalSold;
      } else if (sortBy === 'price') {
        valA = a.price;
        valB = b.price;
      } else if (sortBy === 'stock') {
        valA = a.stockQuantity;
        valB = b.stockQuantity;
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

  const toggleSort = (type: 'revenue' | 'sold' | 'price' | 'stock') => {
    if (sortBy === type) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Package className="text-blue-500" size={20} />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Product-Wise Sales Analytics
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Detailed breakdown of individual product revenue, unit volume, and stock metrics
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search product or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Catalog Products</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">{products.length} Items</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Units Sold</div>
          <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{totalUnitsAll} Units</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Product Sales Share</div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">${totalRevenueAll.toFixed(2)}</div>
        </div>
      </div>

      {/* Table & Bars */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Product Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300" onClick={() => toggleSort('price')}>
                <div className="flex items-center gap-1">
                  <span>Unit Price</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300" onClick={() => toggleSort('stock')}>
                <div className="flex items-center gap-1">
                  <span>Stock</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300" onClick={() => toggleSort('sold')}>
                <div className="flex items-center gap-1">
                  <span>Units Sold</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300" onClick={() => toggleSort('revenue')}>
                <div className="flex items-center gap-1">
                  <span>Total Revenue</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="py-3 px-4">Revenue Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            {filteredProducts.map((p) => {
              const sharePercent = maxRevenue > 0 ? (p.totalRevenue / maxRevenue) * 100 : 0;
              return (
                <tr key={p.productId} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-slate-400 shrink-0" />
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                      {p.categoryName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    ${p.price.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <span className={`font-bold px-2 py-0.5 rounded-full ${
                      p.stockQuantity <= 5
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {p.stockQuantity} in stock
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-200">
                    {p.totalSold} ({p.orderCount} orders)
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                    ${p.totalRevenue.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 w-40">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(4, sharePercent))}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  No matching product sales found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
