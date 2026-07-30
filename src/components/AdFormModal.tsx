import React, { useState, useEffect } from 'react';
import { X, Scissors, Sparkles } from 'lucide-react';
import type { AdBanner, PredefinedPlacement } from '../types';
import { AdImageCropperModal } from './AdImageCropperModal';

interface AdFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  placement: PredefinedPlacement;
  adToEdit?: AdBanner | null;
  onSave: (adData: Partial<AdBanner>) => void;
}

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
      setImageUrl('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80');
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
      linkUrl,
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

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-indigo-500/30">
                  {placement.key}
                </span>
                <h3 className="text-base font-semibold text-white">
                  {adToEdit ? 'Edit Ad Poster' : 'Configure New Ad Poster'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Slot: <span className="text-slate-200">{placement.title}</span> ({placement.recommendedSize})
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
            {/* Banner Image Preview & Upload & Crop */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Ad Poster Asset Image <span className="text-rose-400">*</span>
              </label>
              
              <div className="space-y-3">
                {imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-48 group">
                    <img src={imageUrl} alt="Ad poster preview" className="w-full h-44 object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCropperOpen(true)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
                      >
                        <Scissors size={14} />
                        Crop / Adjust
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Upload File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-300 hover:file:bg-slate-700 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Poster Headline & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Headline Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Flash Sale 50% OFF"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Subtitle Description
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Premium quality items at discount"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Badge & Button CTA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g. HOT DEAL"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Button CTA Text
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="e.g. SHOP NOW"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Destination URL
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="e.g. /shop or /packages"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Display Order Priority & Active Status */}
            <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-0.5">
                    Rotation Priority
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white"
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
                <span className="text-xs font-medium text-slate-200">Set Ad Active Immediately</span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
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
    </>
  );
};
