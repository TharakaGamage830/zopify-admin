import React, { useState, useEffect } from 'react';
import { Package as PackageIcon, Plus, Trash2, Edit, RefreshCw, CheckCircle, XCircle, Box } from 'lucide-react';
import { packageServiceAPI } from '../services/packageServiceAPI';
import type { Package } from '../types';

export const PackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [addonLimitType, setAddonLimitType] = useState<'count' | 'amount'>('count');
  const [addonLimitValue, setAddonLimitValue] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await packageServiceAPI.getPackages(true);
      setPackages(data || []);
    } catch (err) {
      console.error('Failed to fetch packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openCreateModal = () => {
    setEditingPackage(null);
    setName('');
    setSlug('');
    setDescription('');
    setPrice('');
    setAddonLimitType('count');
    setAddonLimitValue('0');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: Package) => {
    setEditingPackage(pkg);
    setName(pkg.name);
    setSlug(pkg.slug);
    setDescription(pkg.description || '');
    setPrice(String(pkg.price));
    setAddonLimitType(pkg.addonLimitType || 'count');
    setAddonLimitValue(String(pkg.addonLimitValue || 0));
    setIsActive(pkg.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        price: parseFloat(price),
        addonLimitType,
        addonLimitValue: parseFloat(addonLimitValue),
        isActive,
      };

      if (editingPackage) {
        await packageServiceAPI.updatePackage(editingPackage.id, payload);
      } else {
        await packageServiceAPI.createPackage(payload);
      }

      setIsModalOpen(false);
      fetchPackages();
    } catch (err: any) {
      alert(err.message || 'Failed to save package');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package bundle?')) return;
    try {
      await packageServiceAPI.deletePackage(id);
      fetchPackages();
    } catch (err: any) {
      alert(err.message || 'Failed to delete package');
    }
  };

  const handleToggleActive = async (pkg: Package) => {
    try {
      await packageServiceAPI.updatePackage(pkg.id, { isActive: !pkg.isActive });
      fetchPackages();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-200 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <PackageIcon className="w-6 h-6 text-accent" />
            Product Packages & Bundles
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage multi-item gift sets, bundles, and custom add-on limits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPackages}
            disabled={loading}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-accent hover:bg-accent-hover text-white shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Package
          </button>
        </div>
      </div>

      {/* Grid view of Packages */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 flex justify-center items-center gap-2">
          <RefreshCw className="animate-spin w-5 h-5 text-accent" />
          Loading packages...
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white dark:bg-cardbg-dark p-12 text-center text-slate-500 rounded-xl border border-slate-200 dark:border-slate-800">
          <Box className="w-10 h-10 mx-auto mb-2 opacity-40 text-accent" />
          No product packages created yet. Click "Create Package" to assemble your first package bundle.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">{pkg.name}</h3>
                  <button
                    onClick={() => handleToggleActive(pkg)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${
                      pkg.isActive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}
                  >
                    {pkg.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {pkg.isActive ? 'Active' : 'Draft'}
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">/{pkg.slug}</p>
                {pkg.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{pkg.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Bundle Price</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    LKR {Number(pkg.price).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(pkg)}
                    className="p-1.5 text-slate-400 hover:text-accent rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 text-left">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {editingPackage ? 'Edit Package' : 'Create Package Bundle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingPackage) {
                      setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                    }
                  }}
                  placeholder="e.g. Luxury Pamper Set"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="luxury-pamper-set"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Price (LKR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 12500"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Bundle description & included items list"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Add-on Limit Type</label>
                  <select
                    value={addonLimitType}
                    onChange={(e) => setAddonLimitType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="count">Item Count</option>
                    <option value="amount">Max Amount (LKR)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Add-on Limit Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={addonLimitValue}
                    onChange={(e) => setAddonLimitValue(e.target.value)}
                    placeholder="0 = no add-ons"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pkgActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-accent focus:ring-accent"
                />
                <label htmlFor="pkgActive" className="font-medium text-slate-700 dark:text-slate-300">
                  Published for purchase
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium shadow-sm"
                >
                  {editingPackage ? 'Save Changes' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
