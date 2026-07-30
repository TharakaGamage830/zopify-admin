import React, { useState } from 'react';
import type { RevenueTrendStat } from '../../types';
import { TrendingUp, Calendar, DollarSign, ShoppingCart } from 'lucide-react';

interface RevenueTrendChartProps {
  data: RevenueTrendStat[];
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-cardbg-dark">
        No sales trend data available for the selected period.
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 100);
  const totalPeriodRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalPeriodOrders = data.reduce((sum, d) => sum + d.orders, 0);
  const avgDailyRevenue = totalPeriodRevenue / data.length;

  const chartHeight = 220;
  const chartWidth = 700;
  const padding = 30;

  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - (d.revenue / maxRevenue) * (chartHeight - padding * 2);
    return { x, y, ...d };
  });

  const svgPath = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${svgPath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
    : '';

  return (
    <div className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      {/* Header & Key Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={20} />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              30-Day Sales & Revenue Trend
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time daily transaction metrics and income velocity
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 font-semibold">
            <DollarSign size={14} />
            <span>Avg Daily: ${avgDailyRevenue.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-400 font-semibold">
            <ShoppingCart size={14} />
            <span>Total Orders: {totalPeriodOrders}</span>
          </div>
        </div>
      </div>

      {/* SVG Line & Area Visualizer */}
      <div className="relative overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-56 overflow-visible"
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = chartHeight - padding - ratio * (chartHeight - padding * 2);
            return (
              <line
                key={i}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area under curve */}
          <path d={areaPath} fill="url(#revenueGradient)" />

          {/* Line path */}
          <path
            d={svgPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIndex === idx ? 6 : 4}
                className="fill-white dark:fill-slate-900 stroke-emerald-500 cursor-pointer transition-all duration-150"
                strokeWidth={hoverIndex === idx ? 3 : 2}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-700 pointer-events-none flex items-center gap-3 animate-in fade-in duration-150"
          >
            <div className="flex items-center gap-1 text-slate-300">
              <Calendar size={12} />
              <span>{points[hoverIndex].date}</span>
            </div>
            <div className="font-bold text-emerald-400">
              ${points[hoverIndex].revenue.toFixed(2)}
            </div>
            <div className="text-indigo-300">
              {points[hoverIndex].orders} order(s)
            </div>
          </div>
        )}
      </div>

      {/* Date Axis Footer Labels */}
      <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-2 px-2">
        <span>{data[0]?.date}</span>
        <span>{data[Math.floor(data.length / 2)]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
};
