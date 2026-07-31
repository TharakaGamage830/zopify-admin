import React, { useState } from 'react';
import type { Category } from '../types';
import { Trash2, Plus } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface CategoriesPageProps {
  categories: Category[];
  onCreate: (name: string, slug: string, parentId?: string) => void;
  onDelete: (id: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ categories, onCreate, onDelete }) => {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    parentId: '',
  });

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
    setForm({
      ...form,
      name: val,
      slug: slugify(val)
    });
  };

  const slugExists = categories.some((c) => c.slug === form.slug);

  const { showToast } = useAdmin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slugExists) {
      showToast('This slug already exists. Please choose a unique URL slug.', 'warning');
      return;
    }
    onCreate(form.name, form.slug, form.parentId || undefined);
    setForm({ name: '', slug: '', parentId: '' });
  };

  return (
    <div className="text-left animate-in fade-in duration-200">
      <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200 mb-6">
        Product Categories
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories List */}
        <div className="lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Active Categories
          </h3>
          <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-cardbg-dark shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Unique Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-cardbg-dark">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {c.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {c.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => onDelete(c.id)}
                        className="p-1.5 rounded-lg border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                        title="Delete Category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                      No categories configured. Setup a new one on the right.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Category Card */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Create Category
          </h3>
          <div className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                  value={form.name}
                  onChange={handleNameChange}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Unique Slug</label>
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
              {categories.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Parent Category</label>
                  <select
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  >
                    <option value="">No Parent</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <button
                type="submit"
                className="w-full btn btn-primary flex items-center justify-center gap-2 mt-2"
              >
                <Plus size={16} />
                <span>Save Category</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
