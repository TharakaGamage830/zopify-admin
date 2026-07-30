import React from 'react';
import type { PlacementKey } from '../types';

interface PlacementSketchProps {
  type: PlacementKey;
}

export const PlacementSketch: React.FC<PlacementSketchProps> = ({ type }) => {
  switch (type) {
    case 'home_top':
      return (
        <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 flex flex-col gap-1 overflow-hidden h-24 select-none">
          <div className="w-full bg-indigo-600/90 text-[10px] font-bold text-white text-center py-2.5 rounded border-2 border-indigo-400 animate-pulse flex items-center justify-center gap-1 shadow-sm">
            <span>[HERO TOP BANNER SLOT - 2:3]</span>
          </div>
          <div className="grid grid-cols-4 gap-1 mt-0.5">
            <div className="h-6 bg-slate-800 rounded"></div>
            <div className="h-6 bg-slate-800 rounded"></div>
            <div className="h-6 bg-slate-800 rounded"></div>
            <div className="h-6 bg-slate-800 rounded"></div>
          </div>
        </div>
      );

    case 'home_bottom':
      return (
        <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 flex flex-col justify-between overflow-hidden h-24 select-none">
          <div className="grid grid-cols-3 gap-1">
            <div className="h-4 bg-slate-800 rounded"></div>
            <div className="h-4 bg-slate-800 rounded"></div>
            <div className="h-4 bg-slate-800 rounded"></div>
          </div>
          <div className="w-full bg-emerald-600/90 text-[10px] font-bold text-white text-center py-2 rounded border-2 border-emerald-400 animate-pulse flex items-center justify-center gap-1 shadow-sm">
            <span>[HOME FOOTER BANNER - 1:2]</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded"></div>
        </div>
      );

    case 'storefront_top':
      return (
        <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 flex flex-col gap-1 overflow-hidden h-24 select-none">
          <div className="w-full bg-indigo-600/90 text-[10px] font-bold text-white text-center py-2 rounded border-2 border-indigo-400 animate-pulse flex items-center justify-center shadow-sm">
            <span>[CATALOG HERO BANNER - 2:3]</span>
          </div>
          <div className="flex gap-1 mt-0.5">
            <div className="w-1/4 h-8 bg-slate-800 rounded"></div>
            <div className="w-3/4 grid grid-cols-3 gap-1">
              <div className="h-8 bg-slate-800 rounded"></div>
              <div className="h-8 bg-slate-800 rounded"></div>
              <div className="h-8 bg-slate-800 rounded"></div>
            </div>
          </div>
        </div>
      );

    case 'storefront_middle':
      return (
        <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 flex gap-1 overflow-hidden h-24 select-none">
          <div className="w-1/3 flex flex-col gap-1">
            <div className="h-4 bg-slate-800 rounded"></div>
            <div className="w-full flex-1 bg-amber-600/90 text-[9px] font-bold text-white text-center p-1 rounded border-2 border-amber-400 animate-pulse flex items-center justify-center leading-tight shadow-sm">
              [SIDEBAR AD POSTER]
            </div>
          </div>
          <div className="w-2/3 grid grid-cols-2 gap-1">
            <div className="bg-slate-800 rounded"></div>
            <div className="bg-slate-800 rounded"></div>
            <div className="bg-slate-800 rounded"></div>
            <div className="bg-slate-800 rounded"></div>
          </div>
        </div>
      );

    case 'storefront_bottom':
      return (
        <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 flex flex-col justify-between overflow-hidden h-24 select-none">
          <div className="grid grid-cols-3 gap-1">
            <div className="h-6 bg-slate-800 rounded"></div>
            <div className="h-6 bg-slate-800 rounded"></div>
            <div className="h-6 bg-slate-800 rounded"></div>
          </div>
          <div className="w-full bg-purple-600/90 text-[10px] font-bold text-white text-center py-2 rounded border-2 border-purple-400 animate-pulse flex items-center justify-center shadow-sm">
            <span>[STOREFRONT FOOTER BANNER]</span>
          </div>
        </div>
      );

    case 'category_banner':
      return (
        <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 flex flex-col gap-1 overflow-hidden h-24 select-none">
          <div className="w-full bg-rose-600/90 text-[10px] font-bold text-white text-center py-2 rounded border-2 border-rose-400 animate-pulse flex items-center justify-center shadow-sm">
            <span>[CATEGORY HEADER AD BANNER]</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            <div className="h-8 bg-slate-800 rounded"></div>
            <div className="h-8 bg-slate-800 rounded"></div>
            <div className="h-8 bg-slate-800 rounded"></div>
            <div className="h-8 bg-slate-800 rounded"></div>
          </div>
        </div>
      );

    case 'product_detail':
      return (
        <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 flex gap-1 overflow-hidden h-24 select-none">
          <div className="w-1/2 bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-400">
            [Product Info]
          </div>
          <div className="w-1/2 bg-cyan-600/90 text-[9px] font-bold text-white text-center p-1 rounded border-2 border-cyan-400 animate-pulse flex items-center justify-center leading-tight shadow-sm">
            [RELATED PROMO POSTER]
          </div>
        </div>
      );

    case 'cart_promo':
      return (
        <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 flex flex-col gap-1 overflow-hidden h-24 select-none">
          <div className="h-5 bg-slate-800 rounded"></div>
          <div className="w-full bg-emerald-600/90 text-[10px] font-bold text-white text-center py-2 rounded border-2 border-emerald-400 animate-pulse flex items-center justify-center shadow-sm">
            <span>[CART CHECKOUT INCENTIVE BANNER]</span>
          </div>
          <div className="h-5 bg-slate-800 rounded"></div>
        </div>
      );

    default:
      return (
        <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 h-24 flex items-center justify-center text-slate-400 text-xs">
          Predefined Placement Slot
        </div>
      );
  }
};
