import React from 'react';
import type { Product, Category } from '../types';
import { ProductsTable } from '../components/sections/ProductsTable';
import { Plus } from 'lucide-react';

interface ProductsPageProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onOpenCreateModal: () => void;
  onToggleActive: (product: Product) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  onEdit,
  onDelete,
  onOpenCreateModal,
  onToggleActive,
}) => {
  return (
    <div className="text-left animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Products Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">Configure stock quantities, pricing and store visibility.</p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="btn btn-primary flex items-center gap-2 px-4 py-2"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      <ProductsTable
        products={products}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
      />
    </div>
  );
};
