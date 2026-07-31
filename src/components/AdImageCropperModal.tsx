import React, { useState, useRef } from 'react';
import { Scissors, Check, X, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import type { PlacementKey } from '../types';

interface AdImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  placementKey: PlacementKey;
  onCropComplete: (croppedDataUrl: string) => void;
}

export const AdImageCropperModal: React.FC<AdImageCropperModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  placementKey,
  onCropComplete,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Aspect ratio helper text & ratios
  const getAspectSpecs = (key: PlacementKey) => {
    switch (key) {
      case 'home_top':
      case 'storefront_top':
      case 'category_banner':
        return { ratio: '2:3', width: 1200, height: 800, label: 'Hero Banner Aspect (2:3)' };
      case 'home_bottom':
      case 'storefront_bottom':
      case 'cart_promo':
        return { ratio: '1:2', width: 1200, height: 600, label: 'Wide Banner Aspect (1:2)' };
      case 'storefront_middle':
      case 'product_detail':
        return { ratio: 'Sidebar Vertical', width: 600, height: 800, label: 'Sidebar Vertical Poster' };
      default:
        return { ratio: 'Custom', width: 1200, height: 800, label: 'Standard Ad Poster' };
    }
  };

  const specs = getAspectSpecs(placementKey);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSaveCrop = () => {
    const canvas = document.createElement('canvas');
    canvas.width = specs.width;
    canvas.height = specs.height;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.translate(canvas.width / 2 + position.x, canvas.height / 2 + position.y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();

        const croppedUrl = canvas.toDataURL('image/jpeg', 0.92);
        onCropComplete(croppedUrl);
        onClose();
      }
    };
    img.src = imageUrl;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col text-left animate-in zoom-in-95 duration-150 relative">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Scissors size={20} className="text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Crop & Format Ad Poster Asset</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{specs.label} • Recommended Resolution: {specs.width} x {specs.height} px</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cropping Canvas Viewport */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950/80">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative w-full max-w-lg h-72 border-2 border-dashed border-indigo-500/80 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing bg-black flex items-center justify-center select-none"
          >
            <img
              src={imageUrl}
              alt="Ad crop source"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
              className="max-w-full max-h-full object-contain pointer-events-none"
            />
            <div className="absolute inset-0 border border-indigo-400/40 pointer-events-none flex items-center justify-center">
              <span className="bg-slate-900/80 px-3 py-1 rounded-full text-[10px] font-bold text-indigo-300 tracking-wider uppercase border border-indigo-500/40 backdrop-blur-md">
                Target Frame: {specs.ratio}
              </span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-6 mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-xl w-full max-w-lg justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <ZoomOut size={16} className="text-slate-400" />
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-28 accent-indigo-500 cursor-pointer"
              />
              <ZoomIn size={16} className="text-slate-400" />
            </div>

            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              <RotateCw size={14} />
              Rotate ({rotation}°)
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveCrop}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Check size={16} />
            Apply Cropped Image
          </button>
        </div>
      </div>
    </div>
  );
};
