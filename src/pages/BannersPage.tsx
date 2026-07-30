import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, Edit, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { bannerServiceAPI } from '../services/bannerServiceAPI';
import { ImageUploaderManager } from '../components/ImageUploaderManager';
import type { Banner } from '../types';

export const BannersPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [placement, setPlacement] = useState('home');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await bannerServiceAPI.getBanners(true);
      setBanners(data || []);
    } catch (err) {
      console.error('Failed to fetch banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setImages([]);
    setLinkUrl('');
    setPlacement('home');
    setSortOrder('0');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title || '');
    setImages(banner.imageUrl ? [banner.imageUrl] : []);
    setLinkUrl(banner.linkUrl || '');
    setPlacement(banner.placement || 'home');
    setSortOrder(String(banner.sortOrder || 0));
    setIsActive(banner.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length < 1) {
      alert('Please upload a banner image.');
      return;
    }

    try {
      const payload = {
        title: title || undefined,
        imageUrl: images[0],
        linkUrl: linkUrl || undefined,
        placement,
        sortOrder: parseInt(sortOrder, 10),
        isActive,
      };

      if (editingBanner) {
        await bannerServiceAPI.updateBanner(editingBanner.id, payload);
      } else {
        await bannerServiceAPI.createBanner(payload);
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      alert(err.message || 'Failed to save banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    try {
      await bannerServiceAPI.deleteBanner(id);
      fetchBanners();
    } catch (err: any) {
      alert(err.message || 'Failed to delete banner');
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await bannerServiceAPI.updateBanner(banner.id, { isActive: !banner.isActive });
      fetchBanners();
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
            <ImageIcon className="w-6 h-6 text-accent" />
            Promotional Banners
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage homepage sliders, sidebar banners, and hero ad graphics with 1:2 height:width ratio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBanners}
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
            Create Banner
          </button>
        </div>
      </div>

      {/* Grid of Banners */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 flex justify-center items-center gap-2">
          <RefreshCw className="animate-spin w-5 h-5 text-accent" />
          Loading banners...
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white dark:bg-cardbg-dark p-12 text-center text-slate-500 rounded-xl border border-slate-200 dark:border-slate-800">
          <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40 text-accent" />
          No promotional banners configured. Click "Create Banner" to upload header sliders or ad graphics.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between"
            >
              {/* Aspect Ratio 2:1 container (1:2 height:width) */}
              <div className="relative w-full aspect-[2/1] bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <img
                  src={banner.imageUrl}
                  alt={banner.title || 'Banner'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 shadow-md cursor-pointer ${
                      banner.isActive
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {banner.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {banner.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white font-mono text-[10px] uppercase">
                  {banner.placement} • 1:2 Ratio
                </span>
              </div>

              <div className="p-4 space-y-2 text-xs">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {banner.title || 'Untitled Banner'}
                </h3>
                {banner.linkUrl && (
                  <p className="text-slate-400 font-mono text-[11px] truncate">Link: {banner.linkUrl}</p>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Order: <strong>{banner.sortOrder}</strong></span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(banner)}
                      className="p-1.5 text-slate-400 hover:text-accent rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Banner"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-left my-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-violet-500" />
                <span>{editingBanner ? 'Edit Banner' : 'Create Banner'}</span>
              </h2>
              <span className="text-xs font-mono text-slate-400">1:2 (Height:Width) Ratio</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Banner Image Uploader & Cropper */}
              <ImageUploaderManager
                images={images}
                onChange={setImages}
                maxImages={1}
                minImages={1}
                aspectRatio={2}
                aspectRatioLabel="1:2 (Height : Width) Ratio"
                label="Banner Graphic Image (1:2 Height:Width Ratio)"
              />

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Banner Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Workstation Promotion Banner"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Target Link URL</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="/collections/summer or https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Placement Slot</label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="home">Homepage Hero</option>
                    <option value="category">Category Top</option>
                    <option value="sidebar">Sidebar Ad</option>
                    <option value="checkout">Checkout Banner</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Sort Priority</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="bannerActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-accent focus:ring-accent"
                />
                <label htmlFor="bannerActive" className="font-medium text-slate-700 dark:text-slate-300">
                  Active immediately
                </label>
              </div>

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
                  {editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
