import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Scissors, Sparkles, Search, ExternalLink } from 'lucide-react';
import type { AdBanner, PredefinedPlacement } from '../types';
import { AdImageCropperModal } from './AdImageCropperModal';

interface AdFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  placement: PredefinedPlacement;
  adToEdit?: AdBanner | null;
  onSave: (adData: Partial<AdBanner>) => void;
}

const SYSTEM_ROUTES = [
  { label: 'Storefront Catalog', path: '/shop', category: 'Main Shop' },
  { label: 'Product Bundles & Packages', path: '/packages', category: 'Promotions' },
  { label: 'Special Offers & Deals', path: '/offers', category: 'Promotions' },
  { label: 'Customer Saved Wishlist', path: '/wishlist', category: 'User Account' },
  { label: 'Contact Us & Support', path: '/contact', category: 'Pages' },
  { label: 'Help Center & FAQ', path: '/faq', category: 'Pages' },
  { label: 'User Settings Page', path: '/settings', category: 'User Account' },
  { label: 'Loyalty Rewards Program', path: '/loyalty', category: 'Promotions' },
];

export const AdFormModal: React.FC<AdFormModalProps> = ({
  isOpen,
  onClose,
  placement,
  adToEdit,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [priority, setPriority] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [routeSearch, setRouteSearch] = useState('');
  const [isRouteDropdownOpen, setIsRouteDropdownOpen] = useState(false);

  useEffect(() => {
    if (adToEdit) {
      setTitle(adToEdit.title || '');
      setSubtitle(adToEdit.subtitle || '');
      setBadgeText(adToEdit.badgeText || '');
      setButtonText(adToEdit.buttonText || '');
      setImageUrl(adToEdit.imageUrl || '');
      setLinkUrl(adToEdit.linkUrl || '');
      setPriority(adToEdit.priority || 1);
      setIsActive(adToEdit.isActive ?? true);
    } else {
      setTitle('');
      setSubtitle('');
      setBadgeText('SPECIAL OFFER');
      setButtonText('SHOP NOW');
      setImageUrl(''); // Keep empty, no default autofilled image
      setLinkUrl('/shop');
      setPriority(1);
      setIsActive(true);
    }
  }, [adToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: adToEdit?.id || `ad_${Date.now()}`,
      placementKey: placement.key,
      title,
      subtitle,
      badgeText,
      buttonText,
      imageUrl,
      linkUrl: linkUrl || '/shop',
      priority: Number(priority),
      isActive,
    });
    onClose();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredRoutes = SYSTEM_ROUTES.filter(
    (r) =>
      r.label.toLowerCase().includes(routeSearch.toLowerCase()) ||
      r.path.toLowerCase().includes(routeSearch.toLowerCase()) ||
      r.category.toLowerCase().includes(routeSearch.toLowerCase())
  );

  return ReactDOM.createPortal(
    <>
      <div
        className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain animate-in fade-in duration-150"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-left relative animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-indigo-500/20">
                  {placement.key}
                </span>
                <h3 className="text-base font-semibold text-slate-800 dark:text-white">
                  {adToEdit ? 'Edit Ad Poster' : 'Configure New Ad Poster'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Target Slot: <span className="text-slate-800 dark:text-slate-200 font-medium">{placement.title}</span> ({placement.recommendedSize})
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Body - Smooth Touch Pan Scroll */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto scroll-smooth space-y-5">
            {/* Banner Image Asset */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Ad Poster Asset Image <span className="text-rose-500">*</span>
              </label>
              
              <div className="space-y-3">
                {imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 max-h-48 group">
                    <img src={imageUrl} alt="Ad poster preview" className="w-full h-44 object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCropperOpen(true)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Scissors size={14} />
                        Crop / Adjust
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-950/40">
                    <p className="text-xs text-slate-400">No image uploaded yet. Select a file or enter an Image URL below.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Upload File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-800 dark:file:text-slate-200 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste Image URL..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Poster Headline & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Headline Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Flash Sale 50% OFF"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subtitle Description
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Premium quality items at discount"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Badge & Button CTA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g. HOT DEAL"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Button CTA Text
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="e.g. SHOP NOW"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Target Destination URL - Searchable System Path Picker */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Destination URL Path
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    setRouteSearch(e.target.value);
                    setIsRouteDropdownOpen(true);
                  }}
                  onFocus={() => setIsRouteDropdownOpen(true)}
                  placeholder="Select or type path e.g. /shop or /packages"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2 pr-10 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <ExternalLink size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Searchable System Routes Dropdown Menu */}
              {isRouteDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto scroll-smooth p-2 space-y-1">
                  <div className="px-2 py-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-950 rounded-lg mb-1">
                    <Search size={13} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={routeSearch}
                      onChange={(e) => setRouteSearch(e.target.value)}
                      placeholder="Filter system pages & routes..."
                      className="w-full bg-transparent text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
                    />
                  </div>

                  {filteredRoutes.map((route) => (
                    <button
                      key={route.path}
                      type="button"
                      onClick={() => {
                        setLinkUrl(route.path);
                        setIsRouteDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-slate-800/80 transition cursor-pointer ${
                        linkUrl === route.path ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-xs">{route.label}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{route.path}</div>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {route.category}
                      </span>
                    </button>
                  ))}

                  {filteredRoutes.length === 0 && (
                    <div className="p-3 text-center text-xs text-slate-400">
                      Use custom path: <span className="font-mono text-indigo-500">{routeSearch}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsRouteDropdownOpen(false)}
                    className="w-full text-center py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border-t border-slate-100 dark:border-slate-800 mt-1 cursor-pointer"
                  >
                    Close Dropdown
                  </button>
                </div>
              )}
            </div>

            {/* Display Order Priority & Active Status */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    Rotation Priority
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Set Ad Active Immediately</span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="pt-2 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={14} />
                Save Poster Configuration
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Cropper Modal */}
      <AdImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        imageUrl={imageUrl}
        placementKey={placement.key}
        onCropComplete={(croppedDataUrl) => setImageUrl(croppedDataUrl)}
      />
    </>,
    document.body
  );
};
