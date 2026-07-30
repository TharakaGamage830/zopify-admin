import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Layout,
  ShieldCheck,
} from 'lucide-react';
import type { AdBanner, PredefinedPlacement } from '../types';
import { PlacementSketch } from '../components/PlacementSketch';
import { AdFormModal } from '../components/AdFormModal';

export const PREDEFINED_PLACEMENTS: PredefinedPlacement[] = [
  {
    key: 'home_top',
    title: 'Home Top Banner',
    pageName: 'Home Page',
    location: 'Top Hero Header Section',
    aspectRatio: '2:3',
    description: 'Promotional hero banner placed at the very top of the Homepage.',
    recommendedSize: '1200 x 800 px (2:3 Ratio)',
    sketchType: 'home_top',
  },
  {
    key: 'home_bottom',
    title: 'Home Bottom Banner',
    pageName: 'Home Page',
    location: 'Above Footer Section',
    aspectRatio: '1:2',
    description: 'Wide horizontal promo strip placed right above the home page footer.',
    recommendedSize: '1200 x 600 px (1:2 Ratio)',
    sketchType: 'home_bottom',
  },
  {
    key: 'storefront_top',
    title: 'Storefront Top Banner',
    pageName: 'Storefront Catalog (/shop)',
    location: 'Above Product Catalog Grid',
    aspectRatio: '2:3',
    description: 'Full-width top hero banner for main storefront catalog page.',
    recommendedSize: '1200 x 800 px (2:3 Ratio)',
    sketchType: 'storefront_top',
  },
  {
    key: 'storefront_middle',
    title: 'Storefront Middle Banner (Filter Sidebar)',
    pageName: 'Storefront Catalog (/shop)',
    location: 'Left Side below Filter Section',
    aspectRatio: 'Sidebar (320px)',
    description: 'Vertical ad poster displayed on the left column directly underneath the filter section.',
    recommendedSize: '600 x 800 px (Vertical)',
    sketchType: 'storefront_middle',
  },
  {
    key: 'storefront_bottom',
    title: 'Storefront Bottom Banner',
    pageName: 'Storefront Catalog (/shop)',
    location: 'Bottom of Storefront Page',
    aspectRatio: '1:2',
    description: 'Wide horizontal promotional banner at the bottom of the catalog page.',
    recommendedSize: '1200 x 600 px (1:2 Ratio)',
    sketchType: 'storefront_bottom',
  },
  {
    key: 'category_banner',
    title: 'Category Page Header Banner',
    pageName: 'Category Detail (/category/[id])',
    location: 'Header of Specific Category View',
    aspectRatio: '2:3',
    description: 'Top promotion banner displayed when browsing specific categories.',
    recommendedSize: '1200 x 800 px (2:3 Ratio)',
    sketchType: 'category_banner',
  },
  {
    key: 'product_detail',
    title: 'Product Detail Ad Poster',
    pageName: 'Product Page (/product/[id])',
    location: 'Right Column below Add-To-Cart',
    aspectRatio: '1:1 / Vertical',
    description: 'Targeted advertisement or cross-sell poster on product detail pages.',
    recommendedSize: '600 x 600 px (Square/Vertical)',
    sketchType: 'product_detail',
  },
  {
    key: 'cart_promo',
    title: 'Cart & Checkout Incentive Banner',
    pageName: 'Shopping Cart (/cart)',
    location: 'Above Order Summary Column',
    aspectRatio: '1:2',
    description: 'Incentive banner offering free shipping or bundle discount codes.',
    recommendedSize: '1200 x 600 px (1:2 Ratio)',
    sketchType: 'cart_promo',
  },
];

export const BannersPage: React.FC = () => {
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [selectedPlacement, setSelectedPlacement] = useState<PredefinedPlacement | null>(null);
  const [adToEdit, setAdToEdit] = useState<AdBanner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load existing configured ads from localStorage (or fallback defaults)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('zopify_ad_banners');
        if (saved) {
          setAds(JSON.parse(saved));
        } else {
          // Initialize sample posters
          const sampleAds: AdBanner[] = [
            {
              id: 'ad_1',
              placementKey: 'home_top',
              title: 'Super Tech Flash Deal',
              subtitle: 'Up to 60% OFF on all smart gadgets',
              badgeText: 'LIMITED TIME',
              buttonText: 'EXPLORE NOW',
              imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
              linkUrl: '/shop',
              isActive: true,
              priority: 1,
            },
            {
              id: 'ad_2',
              placementKey: 'storefront_middle',
              title: 'VIP Premium Membership',
              subtitle: 'Unlock free shipping & exclusive gifts',
              badgeText: 'JOIN TODAY',
              buttonText: 'GET VIP',
              imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
              linkUrl: '/packages',
              isActive: true,
              priority: 1,
            },
          ];
          setAds(sampleAds);
          localStorage.setItem('zopify_ad_banners', JSON.stringify(sampleAds));
        }
      } catch (e) {}
    }
  }, []);

  const saveAdsToStorage = (updatedAds: AdBanner[]) => {
    setAds(updatedAds);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zopify_ad_banners', JSON.stringify(updatedAds));
    }
  };

  const handleOpenAdd = (placement: PredefinedPlacement) => {
    setSelectedPlacement(placement);
    setAdToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (placement: PredefinedPlacement, ad: AdBanner) => {
    setSelectedPlacement(placement);
    setAdToEdit(ad);
    setIsModalOpen(true);
  };

  const handleDeleteAd = (id: string) => {
    if (confirm('Are you sure you want to remove this ad poster?')) {
      const filtered = ads.filter((a) => a.id !== id);
      saveAdsToStorage(filtered);
    }
  };

  const handleToggleAdStatus = (id: string) => {
    const updated = ads.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a));
    saveAdsToStorage(updated);
  };

  const handleSaveAd = (adData: Partial<AdBanner>) => {
    const existingIndex = ads.findIndex((a) => a.id === adData.id);
    let updated: AdBanner[];
    if (existingIndex >= 0) {
      updated = [...ads];
      updated[existingIndex] = { ...updated[existingIndex], ...adData } as AdBanner;
    } else {
      updated = [adData as AdBanner, ...ads];
    }
    saveAdsToStorage(updated);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Layout size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Admin Ad & Poster Manager</h1>
              <p className="text-xs text-slate-400">
                Configure promotional banners & poster slots across 8 predefined page locations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl flex items-center gap-2 text-xs text-slate-300">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>8 Fixed Placements</span>
          </div>
        </div>
      </div>

      {/* Grid of 8 Predefined Placements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {PREDEFINED_PLACEMENTS.map((placement) => {
          const placementAds = ads.filter((a) => a.placementKey === placement.key);
          const activeAdCount = placementAds.filter((a) => a.isActive).length;

          return (
            <div
              key={placement.key}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="p-5 space-y-4">
                {/* Header & Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {placement.pageName}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        Aspect Ratio: {placement.aspectRatio}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1.5">{placement.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{placement.description}</p>
                  </div>
                </div>

                {/* Wireframe Placement Sketch */}
                <div>
                  <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
                    <span>Layout Position Wireframe</span>
                    <span className="text-[10px] text-slate-500">{placement.recommendedSize}</span>
                  </div>
                  <PlacementSketch type={placement.sketchType} />
                </div>

                {/* Configured Ads List for this Placement */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">
                      Configured Posters ({placementAds.length})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {activeAdCount > 0 ? (
                        <span className="text-emerald-400 font-medium">● {activeAdCount} Active</span>
                      ) : (
                        <span className="text-amber-400 font-medium">○ None Active</span>
                      )}
                    </span>
                  </div>

                  {placementAds.length === 0 ? (
                    <div className="bg-slate-950/60 rounded-xl p-3 text-center border border-dashed border-slate-800">
                      <p className="text-xs text-slate-500">No ad poster configured for this placement.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {placementAds.map((ad) => (
                        <div
                          key={ad.id}
                          className="flex items-center justify-between p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-slate-700 transition"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <img
                              src={ad.imageUrl}
                              alt={ad.title}
                              className="w-12 h-10 object-cover rounded-lg border border-slate-800 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-white truncate">{ad.title || 'Untitled Poster'}</h4>
                              <p className="text-[11px] text-slate-400 truncate">{ad.linkUrl || 'No link specified'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleToggleAdStatus(ad.id)}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                                ad.isActive
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700'
                              }`}
                            >
                              {ad.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </button>

                            <button
                              onClick={() => handleOpenEdit(placement, ad)}
                              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                              title="Edit Poster"
                            >
                              <Edit size={14} />
                            </button>

                            <button
                              onClick={() => handleDeleteAd(ad.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                              title="Delete Poster"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 bg-slate-950/40 border-t border-slate-800/80">
                <button
                  onClick={() => handleOpenAdd(placement)}
                  className="w-full py-2 px-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 hover:text-indigo-200 border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus size={15} />
                  Add Poster for {placement.title}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ad Config Modal */}
      {selectedPlacement && (
        <AdFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          placement={selectedPlacement}
          adToEdit={adToEdit}
          onSave={handleSaveAd}
        />
      )}
    </div>
  );
};
