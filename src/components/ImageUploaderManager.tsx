import React, { useState, useRef } from 'react';
import { Upload, Trash2, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { ImageCropModal } from './ImageCropModal';

interface ImageUploaderManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  minImages?: number;
  aspectRatio?: number; // 1 for 1:1, 2 for 2:1 (1:2 height:width banner)
  aspectRatioLabel?: string;
  label?: string;
}

export const ImageUploaderManager: React.FC<ImageUploaderManagerProps> = ({
  images,
  onChange,
  maxImages = 5,
  minImages = 1,
  aspectRatio = 1,
  aspectRatioLabel = '1:1 Square',
  label = 'Package Images',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPendingImageSrc(e.target.result as string);
        setIsCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleCropComplete = (croppedUrl: string) => {
    if (images.length >= maxImages) {
      alert(`Maximum of ${maxImages} images allowed.`);
      return;
    }
    onChange([...images, croppedUrl]);
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleRemoveAll = () => {
    if (confirm('Are you sure you want to remove all uploaded images?')) {
      onChange([]);
    }
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-3 text-left">
      {/* Label and Count Status */}
      <div className="flex items-center justify-between">
        <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs">
          {label} {minImages > 0 && <span className="text-rose-500">*</span>}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium text-slate-400">
            {images.length} / {maxImages} uploaded
          </span>
          {images.length > 1 && (
            <button
              type="button"
              onClick={handleRemoveAll}
              className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
            >
              Remove All
            </button>
          )}
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
            isDragOver
              ? 'border-violet-500 bg-violet-500/10 scale-[0.99]'
              : 'border-slate-300 dark:border-slate-800 hover:border-violet-400/60 bg-slate-50/50 dark:bg-slate-900/50'
          }`}
        >
          <div className="p-3 bg-violet-500/10 text-violet-500 rounded-full">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Drag & Drop image here, or <span className="text-violet-500 underline">browse</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supports PNG, JPG, WEBP • Auto-crops to {aspectRatioLabel}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}

      {/* Validation Alert */}
      {images.length < minImages && (
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>At least {minImages} image is required for this configuration.</span>
        </div>
      )}

      {/* Image Gallery Grid */}
      {images.length > 0 && (
        <div className={`grid gap-3 ${maxImages === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'}`}>
          {images.map((imgUrl, index) => (
            <div
              key={index}
              className="relative group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 overflow-hidden shadow-xs"
              style={{ aspectRatio: aspectRatio === 1 ? '1 / 1' : '2 / 1' }}
            >
              <img src={imgUrl} alt={`Uploaded ${index + 1}`} className="w-full h-full object-cover" />

              {/* Primary Badge for index 0 */}
              {index === 0 && maxImages > 1 && (
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-violet-600 text-white text-[9px] font-bold tracking-wider shadow-md">
                  PRIMARY
                </span>
              )}

              {/* Hover Overlay Controls */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm cursor-pointer"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Move Left / Right Buttons */}
                {maxImages > 1 && (
                  <div className="flex justify-between items-center text-white">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'left')}
                      className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                      title="Move Left"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono font-bold text-slate-300">
                      #{index + 1}
                    </span>
                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={() => handleMove(index, 'right')}
                      className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                      title="Move Right"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Crop Modal */}
      {pendingImageSrc && (
        <ImageCropModal
          isOpen={isCropperOpen}
          imageSrc={pendingImageSrc}
          aspectRatio={aspectRatio}
          aspectRatioLabel={aspectRatioLabel}
          onCrop={handleCropComplete}
          onClose={() => {
            setIsCropperOpen(false);
            setPendingImageSrc(null);
          }}
        />
      )}
    </div>
  );
};
