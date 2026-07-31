import React, { useState, useEffect } from 'react';
import type { Product, Category } from '../../types';
import { X, Plus, Trash2 } from 'lucide-react';
import { productServiceAPI } from '../../services/productServiceAPI';
import { useAdmin } from '../../context/AdminContext';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  product: Product | null;
  categories: Category[];
  products: Product[];
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  categories,
  products,
}) => {
  const [form, setForm] = useState<{
    name: string;
    slug: string;
    description: string;
    price: number;
    stockQuantity: number;
    categoryId: string;
    isActive: boolean;
    images: string[];
  }>({
    name: '',
    slug: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    categoryId: '',
    isActive: true,
    images: [],
  });

  const [uploading, setUploading] = useState(false);

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      name: val,
      slug: slugify(val),
    }));
  };

  const slugExists = products.some((p) => p.slug === form.slug && p.id !== product?.id);

  useEffect(() => {
    if (product) {
      let productImages: string[] = [];
      try {
        if (product.images) {
          productImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
        }
      } catch (e) {
        console.error('Failed to parse product images:', e);
      }

      setForm({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        price: parseFloat(product.price),
        stockQuantity: product.stockQuantity,
        categoryId: product.categoryId || '',
        isActive: product.isActive,
        images: Array.isArray(productImages) ? productImages : [],
      });
    } else {
      setForm({
        name: '',
        slug: '',
        description: '',
        price: 0,
        stockQuantity: 0,
        categoryId: '',
        isActive: true,
        images: [],
      });
    }
  }, [product, isOpen]);

  const { showToast } = useAdmin();

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (form.images.length >= 4) {
      showToast('You can upload up to 4 images only.', 'warning');
      return;
    }

    setUploading(true);
    try {
      const res = await productServiceAPI.uploadImage(file);
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, res.url],
      }));
      showToast('Image uploaded successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slugExists) {
      showToast('This slug already exists. Please choose a unique URL slug.', 'warning');
      return;
    }
    if (form.images.length < 2) {
      showToast('A product must have at least 2 images.', 'warning');
      return;
    }
    if (form.images.length > 4) {
      showToast('A product can have at most 4 images.', 'warning');
      return;
    }
    onSubmit({
      ...form,
      price: parseFloat(form.price.toString()),
      stockQuantity: parseInt(form.stockQuantity.toString(), 10),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col text-left animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {product ? 'Edit Product' : 'Create Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Product Name</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                value={form.name}
                onChange={handleNameChange}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Slug (Unique)</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              />
              {form.slug && (
                <span className={`text-xs mt-1 block font-semibold ${slugExists ? 'text-red-500' : 'text-emerald-500'}`}>
                  {slugExists ? '✕ Slug already exists' : '✓ Slug is available!'}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent min-h-[60px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Price (LKR)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Stock Quantity</label>
              <input
                type="number"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Category</label>
              <select
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Product Image Upload Section */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="block text-xs font-semibold text-slate-400 uppercase">Product Images ({form.images.length}/4)</span>
              <span className="text-[10px] text-slate-400 font-semibold italic">* Upload at least 2, up to 4 images</span>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {form.images.map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-900 overflow-hidden group">
                  <img src={imgUrl} className="w-full h-full object-cover" alt="Product" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-650 hover:bg-red-750 text-white rounded-full transition shadow opacity-0 group-hover:opacity-100"
                    title="Remove Image"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}

              {form.images.length < 4 && (
                <label className="aspect-square rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-accent dark:hover:border-accent flex flex-col items-center justify-center gap-1 cursor-pointer transition select-none">
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Plus size={16} className="text-slate-400" />
                      <span className="text-[10px] text-slate-400 font-semibold">Upload</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded text-accent focus:ring-accent border-slate-300 cursor-pointer"
            />
            <label htmlFor="isActiveCheck" className="text-xs font-semibold text-slate-500 uppercase cursor-pointer select-none">
              Is Product Active in Storefront
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 text-sm font-medium bg-accent text-white hover:bg-accent-hover rounded-lg transition shadow-sm"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
