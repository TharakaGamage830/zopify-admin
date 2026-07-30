import React, { useState, useEffect } from 'react';
import {
  Package as PackageIcon,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  CheckCircle,
  XCircle,
  Box,
  Layers,
  ShoppingBag,
  Tag,
} from 'lucide-react';
import { packageServiceAPI } from '../services/packageServiceAPI';
import { productServiceAPI } from '../services/productServiceAPI';
import { ImageUploaderManager } from '../components/ImageUploaderManager';
import type { Package, Product } from '../types';

export const PackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  // Package Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [addonLimitType, setAddonLimitType] = useState<'count' | 'amount'>('count');
  const [addonLimitValue, setAddonLimitValue] = useState('0');
  const [isActive, setIsActive] = useState(true);

  // Multi-Image & Product Assignment States
  const [images, setImages] = useState<string[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [assignedProducts, setAssignedProducts] = useState<{ productId: string; quantity: number }[]>([]);

  const fetchPackagesAndProducts = async () => {
    setLoading(true);
    try {
      const [pkgsData, prodsData] = await Promise.all([
        packageServiceAPI.getPackages(true),
        productServiceAPI.getProducts(),
      ]);
      setPackages(pkgsData || []);
      setCatalogProducts(prodsData.items || []);
    } catch (err) {
      console.error('Failed to fetch packages or catalog products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackagesAndProducts();
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
    setImages([]);
    setAssignedProducts([]);
    setSelectedProductId('');
    setSelectedQuantity(1);
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

    // Parse images array
    try {
      if (pkg.images) {
        const parsed = JSON.parse(pkg.images);
        setImages(Array.isArray(parsed) ? parsed : [pkg.images]);
      } else {
        setImages([]);
      }
    } catch (e) {
      setImages(pkg.images ? [pkg.images] : []);
    }

    // Load assigned products
    if (pkg.products && Array.isArray(pkg.products)) {
      setAssignedProducts(
        pkg.products.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
        }))
      );
    } else {
      setAssignedProducts([]);
    }

    setSelectedProductId('');
    setSelectedQuantity(1);
    setIsModalOpen(true);
  };

  const handleAddProductToBundle = () => {
    if (!selectedProductId) return;
    const existingIndex = assignedProducts.findIndex((p) => p.productId === selectedProductId);
    if (existingIndex >= 0) {
      const updated = [...assignedProducts];
      updated[existingIndex].quantity += selectedQuantity;
      setAssignedProducts(updated);
    } else {
      setAssignedProducts([...assignedProducts, { productId: selectedProductId, quantity: selectedQuantity }]);
    }
    setSelectedProductId('');
    setSelectedQuantity(1);
  };

  const handleRemoveAssignedProduct = (productId: string) => {
    setAssignedProducts(assignedProducts.filter((p) => p.productId !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Require at least 1 image
    if (images.length < 1) {
      alert('At least 1 image is required for a Package.');
      return;
    }

    try {
      const payload = {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        price: parseFloat(price),
        images: JSON.stringify(images),
        addonLimitType,
        addonLimitValue: parseFloat(addonLimitValue),
        isActive,
        products: assignedProducts,
      };

      if (editingPackage) {
        await packageServiceAPI.updatePackage(editingPackage.id, payload);
      } else {
        await packageServiceAPI.createPackage(payload);
      }

      setIsModalOpen(false);
      fetchPackagesAndProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to save package');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package bundle?')) return;
    try {
      await packageServiceAPI.deletePackage(id);
      fetchPackagesAndProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete package');
    }
  };

  const handleToggleActive = async (pkg: Package) => {
    try {
      await packageServiceAPI.updatePackage(pkg.id, { isActive: !pkg.isActive });
      fetchPackagesAndProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const getPrimaryImage = (pkg: Package): string | null => {
    try {
      if (pkg.images) {
        const parsed = JSON.parse(pkg.images);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      }
    } catch (e) {}
    return pkg.images || null;
  };

  const getImageCount = (pkg: Package): number => {
    try {
      if (pkg.images) {
        const parsed = JSON.parse(pkg.images);
        if (Array.isArray(parsed)) return parsed.length;
      }
    } catch (e) {}
    return pkg.images ? 1 : 0;
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
            Manage multi-item gift sets, bundles, 1:1 image galleries, and custom add-on limits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPackagesAndProducts}
            disabled={loading}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-accent hover:bg-accent-hover text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
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
          Loading packages & catalog data...
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white dark:bg-cardbg-dark p-12 text-center text-slate-500 rounded-xl border border-slate-200 dark:border-slate-800">
          <Box className="w-10 h-10 mx-auto mb-2 opacity-40 text-accent" />
          No product packages created yet. Click "Create Package" to assemble your first package bundle.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => {
            const primaryImg = getPrimaryImage(pkg);
            const imgCount = getImageCount(pkg);

            return (
              <div
                key={pkg.id}
                className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between"
              >
                {/* Image Preview Header */}
                <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
                  {primaryImg ? (
                    <img src={primaryImg} alt={pkg.name} className="w-full h-full object-cover" />
                  ) : (
                    <Box className="w-12 h-12 text-slate-400 opacity-40" />
                  )}

                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(pkg)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 shadow-md cursor-pointer ${
                        pkg.isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {pkg.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {pkg.isActive ? 'Active' : 'Draft'}
                    </button>
                  </div>

                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white font-mono text-[10px] flex items-center gap-1">
                    <Layers className="w-3 h-3 text-violet-400" />
                    {imgCount} {imgCount === 1 ? 'Image' : 'Images'} (1:1)
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">{pkg.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">/{pkg.slug}</p>
                    {pkg.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{pkg.description}</p>
                    )}

                    {/* Included Products List Summary */}
                    {pkg.products && pkg.products.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Included Products ({pkg.products.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {pkg.products.map((item) => (
                            <span
                              key={item.id}
                              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                            >
                              {item.product?.name || 'Product'} × {item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
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
                        className="p-1.5 text-slate-400 hover:text-accent rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Package"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Package"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-5 text-left max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <PackageIcon className="w-5 h-5 text-violet-500" />
                <span>{editingPackage ? 'Edit Package Bundle' : 'Create Package Bundle'}</span>
              </h2>
              <span className="text-xs font-mono text-slate-400">1:1 Image Aspect Ratio</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Modern 1:1 Multi-Image Uploader */}
              <ImageUploaderManager
                images={images}
                onChange={setImages}
                maxImages={5}
                minImages={1}
                aspectRatio={1}
                aspectRatioLabel="1:1 Square"
                label="Package Images (1 to 5 images, 1:1 Ratio)"
              />

              {/* Package Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    placeholder="e.g. Luxury Developer Workstation Bundle"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="luxury-developer-workstation-bundle"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Price & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Package Bundle Price (LKR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 24500"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Add-on Limit Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={addonLimitValue}
                    onChange={(e) => setAddonLimitValue(e.target.value)}
                    placeholder="0 = no limit"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed bundle description & included items list"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 resize-none"
                />
              </div>

              {/* Section: Assign Existing Catalog Products to Bundle */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-violet-500" />
                    Assign Catalog Products to Bundle
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {assignedProducts.length} Products Assigned
                  </span>
                </div>

                {/* Add Product Selector Form */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-grow px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">-- Select Existing Product --</option>
                    {catalogProducts.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} (LKR {parseFloat(prod.price).toLocaleString()})
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={selectedQuantity}
                      onChange={(e) => setSelectedQuantity(parseInt(e.target.value, 10) || 1)}
                      className="w-20 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-center font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleAddProductToBundle}
                      disabled={!selectedProductId}
                      className="px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-medium transition cursor-pointer shrink-0"
                    >
                      Add Product
                    </button>
                  </div>
                </div>

                {/* Assigned Products Table */}
                {assignedProducts.length > 0 ? (
                  <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                    {assignedProducts.map((item) => {
                      const prodDetail = catalogProducts.find((p) => p.id === item.productId);
                      return (
                        <div key={item.productId} className="p-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <Tag className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {prodDetail ? prodDetail.name : item.productId}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              @ LKR {prodDetail ? parseFloat(prodDetail.price).toLocaleString() : '0'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 font-bold">
                              × {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAssignedProduct(item.productId)}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded transition cursor-pointer"
                              title="Remove Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 text-center py-2 italic">
                    No products added yet. Select products above to assign them to this bundle.
                  </p>
                )}
              </div>

              {/* Publication Status Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pkgActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-accent focus:ring-accent"
                />
                <label htmlFor="pkgActive" className="font-medium text-slate-700 dark:text-slate-300">
                  Published for purchase in storefront
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium shadow-sm cursor-pointer"
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
