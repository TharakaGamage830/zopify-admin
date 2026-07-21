import React from 'react';
import type { Product } from '../../types';
import { Edit2, Trash2 } from 'lucide-react';

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleActive: (product: Product) => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({ products, onEdit, onDelete, onToggleActive }) => {
  return (
    <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-cardbg-dark shadow-sm text-left">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-cardbg-dark">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{p.name}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">slug: {p.slug}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-slate-100">
                  ${parseFloat(p.price).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {p.stockQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onToggleActive(p)}
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 transition ${
                      p.isActive 
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                    }`}
                    title="Click to toggle Active/Inactive"
                  >
                    {p.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(p)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      title="Edit Product"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(p.id)}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                      title="Delete Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                  No products tracked in the system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
