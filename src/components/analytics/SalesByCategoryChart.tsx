import React from 'react';
import type { CategorySalesStat } from '../../types';
import { Layers, PieChart as PieIcon } from 'lucide-react';

interface SalesByCategoryChartProps {
  categories: CategorySalesStat[];
}

export const SalesByCategoryChart: React.FC<SalesByCategoryChartProps> = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-cardbg-dark">
        No category sales logged yet.
      </div>
    );
  }

  const totalRevenue = categories.reduce((sum, c) => sum + c.totalRevenue, 0);


  const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#6366f1', // indigo
    '#f97316', // orange
  ];

  return (
    <div className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="text-purple-500" size={20} />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Category-Wise Sales Analytics
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Revenue distribution and market share breakdown grouped by product category
          </p>
        </div>
      </div>

      {/* Grid with visual chart representation and Category cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Category Share Donut Visualizer */}
        <div className="lg:col-span-1 border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
            <PieIcon size={16} />
            <span>Category Revenue Share</span>
          </div>

          {/* Color-coded Donut/Progress Bar list */}
          <div className="w-full flex flex-col gap-3 my-2">
            {categories.map((cat, idx) => {
              const color = colors[idx % colors.length];
              return (
                <div key={cat.categoryId} className="flex flex-col gap-1 text-left">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span>{cat.name}</span>
                    </span>
                    <span className="font-extrabold">{cat.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(3, cat.percentage)}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-full pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs text-slate-500">
            <span>Active Categories: {categories.length}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">${totalRevenue.toFixed(2)}</span>
          </div>
        </div>

        {/* Detailed Category Table */}
        <div className="lg:col-span-2 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Catalog Products</th>
                <th className="py-3 px-4">Total Units Sold</th>
                <th className="py-3 px-4">Total Revenue</th>
                <th className="py-3 px-4">Share %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {categories.map((c, idx) => {
                const color = colors[idx % colors.length];
                return (
                  <tr key={c.categoryId} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {c.productCount} product(s)
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-200">
                      {c.totalSold} units
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                      ${c.totalRevenue.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-purple-600 dark:text-purple-400">
                      {c.percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
