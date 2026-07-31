import React, { useState, useEffect } from 'react';
import {
  Package as PackageIcon,
  Plus,
  Trash2,
  Edit,
  XCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { packageServiceAPI } from '../services/packageServiceAPI';
import type { Package } from '../types';

export const PackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('49.99');
  const [images, setImages] = useState<string[]>([]);
  const [addonLimitType, setAddonLimitType] = useState<'count' | 'amount'>('count');
  const [addonLimitValue, setAddonLimitValue] = useState('5');
  const [isActive, setIsActive] = useState(true);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await packageServiceAPI.getPackages();
      if (data && data.length > 0) {
        setPackages(data);
      } else {
        // Fallback default bundle tiers if backend empty
        const defaultBundles: Package[] = [
          {
            id: 'pkg_starter',
            name: 'Starter Bundle',
            slug: 'starter-bundle',
            description: 'Essential starter bundle for new customers with 3 core products included.',
            price: '29.99',
            images: '["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80"]',
            addonLimitType: 'count',
            addonLimitValue: 3,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'pkg_pro',
            name: 'Pro Value Pack',
            slug: 'pro-value-pack',
            description: 'Most popular bundle tier with up to 5 addon products and priority support.',
            price: '59.99',
            images: '["https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80"]',
            addonLimitType: 'count',
            addonLimitValue: 5,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'pkg_vip',
            name: 'VIP Executive Box',
            slug: 'vip-executive-box',
            description: 'Premium unlimited package bundle with maximum discount & luxury items.',
            price: '129.99',
            images: '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"]',
            addonLimitType: 'amount',
            addonLimitValue: 200,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setPackages(defaultBundles);
      }
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
    setPrice('49.99');
    setImages(['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80']);
    setAddonLimitType('count');
    setAddonLimitValue('5');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: Package) => {
    setEditingPackage(pkg);
    setName(pkg.name);
    setSlug(pkg.slug);
    setDescription(pkg.description || '');
    setPrice(String(pkg.price));
    try {
      setImages(typeof pkg.images === 'string' ? JSON.parse(pkg.images) : pkg.images || []);
    } catch {
      setImages([]);
    }
    setAddonLimitType(pkg.addonLimitType || 'count');
    setAddonLimitValue(String(pkg.addonLimitValue || '5'));
    setIsActive(pkg.isActive);
    setIsModalOpen(true);
  };

  const handleDeletePackage = async (id: string) => {
    if (confirm('Are you sure you want to delete this bundle package?')) {
      try {
        await packageServiceAPI.deletePackage(id);
        setPackages((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error('Failed to delete package:', err);
        setPackages((prev) => prev.filter((p) => p.id !== id));
      }
    }
  };

  const handleToggleActive = async (pkg: Package) => {
    try {
      await packageServiceAPI.updatePackage(pkg.id, { isActive: !pkg.isActive });
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, isActive: !p.isActive } : p)));
    } catch (err) {
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, isActive: !p.isActive } : p)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      price: parseFloat(price),
      images: JSON.stringify(images),
      addonLimitType,
      addonLimitValue: parseFloat(addonLimitValue),
      isActive,
    };

    try {
      if (editingPackage) {
        await packageServiceAPI.updatePackage(editingPackage.id, payload);
      } else {
        await packageServiceAPI.createPackage(payload);
      }
      setIsModalOpen(false);
      fetchPackages();
    } catch (err) {
      // Local state fallback
      const newPkg: Package = {
        id: editingPackage ? editingPackage.id : `pkg_${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (editingPackage) {
        setPackages((prev) => prev.map((p) => (p.id === editingPackage.id ? newPkg : p)));
      } else {
        setPackages((prev) => [newPkg, ...prev]);
      }
      setIsModalOpen(false);
    }
  };

  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <PackageIcon size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Admin Bundle Manager</h1>
              <p className="text-xs text-slate-400">
                Manage curated product bundles, promotional packages & membership tiers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPackages}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            title="Refresh Packages"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
          >
            <Plus size={16} />
            Create Bundle Package
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search packages by name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-400">
          Total Packages: <span className="font-semibold text-white">{filteredPackages.length}</span>
        </div>
      </div>

      {/* Package Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading package bundles...</div>
      ) : filteredPackages.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <PackageIcon size={32} className="mx-auto text-slate-600" />
          <p className="text-xs text-slate-400">No package bundles found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => {
            let imgList: string[] = [];
            try {
              imgList = typeof pkg.images === 'string' ? JSON.parse(pkg.images) : pkg.images || [];
            } catch {
              imgList = [];
            }
            const coverImg = imgList[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';

            return (
              <div
                key={pkg.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Image Banner */}
                  <div className="relative h-44 bg-slate-950 overflow-hidden">
                    <img src={coverImg} alt={pkg.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          pkg.isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md'
                        }`}
                      >
                        {pkg.isActive ? 'Active Bundle' : 'Disabled'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white shadow-sm">{pkg.name}</h3>
                        <p className="text-[11px] text-slate-300 font-mono">/{pkg.slug}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-indigo-400">Rs. {Number(pkg.price).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
                      {pkg.description || 'No detailed description specified for this package bundle.'}
                    </p>

                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Addon Limit Policy:</span>
                        <span className="font-semibold text-white capitalize">
                          {pkg.addonLimitType === 'count'
                            ? `${pkg.addonLimitValue} Products Max`
                            : `Rs. ${Number(pkg.addonLimitValue).toLocaleString()} Value Cap`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(pkg)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      pkg.isActive
                        ? 'bg-slate-800 text-slate-400 hover:text-white'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {pkg.isActive ? 'Disable' : 'Enable'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(pkg)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                      title="Delete Package"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Create/Edit Package */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-base font-semibold text-white">
                {editingPackage ? 'Edit Bundle Package' : 'Create New Bundle Package'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Starter Tech Kit"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Package Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="starter-tech-kit"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bundle Price (LKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="4999.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Package Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe items and perks included in this bundle..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Addon Limit Type</label>
                  <select
                    value={addonLimitType}
                    onChange={(e) => setAddonLimitType(e.target.value as 'count' | 'amount')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="count">Item Count Limit</option>
                    <option value="amount">Rupee Amount Limit (LKR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Limit Value</label>
                  <input
                    type="number"
                    value={addonLimitValue}
                    onChange={(e) => setAddonLimitValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={images[0] || ''}
                  onChange={(e) => setImages([e.target.value])}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="pkgActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
                <label htmlFor="pkgActive" className="text-xs font-medium text-slate-200 cursor-pointer">
                  Activate Bundle for Customer Purchase Immediately
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
