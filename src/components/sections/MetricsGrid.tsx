import React from 'react';
import { DollarSign, Clipboard, Package } from 'lucide-react';

interface MetricsGridProps {
  revenue: number;
  orderCount: number;
  productCount: number;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ revenue, orderCount, productCount }) => {
  const stats = [
    { label: 'Total Revenue', value: `$${revenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'Orders Logged', value: orderCount, icon: Clipboard, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    { label: 'Products Tracked', value: productCount, icon: Package, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center justify-between transition duration-200 hover:shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">{s.value}</div>
            </div>
            <div className={`p-3 rounded-xl ${s.color}`}>
              <Icon size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
