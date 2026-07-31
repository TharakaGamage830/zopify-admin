import React, { useState, useRef, useEffect } from 'react';
import { Crop, ZoomIn, ZoomOut, RotateCcw, Check, X } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  aspectRatio: number; // e.g. 1 for 1:1, 2 for 2:1 (1:2 height:width banner)
  aspectRatioLabel?: string;
  onCrop: (croppedDataUrl: string) => void;
  onClose: () => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  aspectRatio,
  aspectRatioLabel = '1:1 Square',
  onCrop,
  onClose,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (!imgLoaded || !imgRef.current || !canvasRef.current) return;
    drawPreview();
  }, [imgLoaded, zoom, pan, aspectRatio]);

  const drawPreview = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on aspect ratio
    const width = 480;
    const height = width / aspectRatio;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    // Save context
    ctx.save();

    // Move to center of canvas for rotation & scaling
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.scale(zoom, zoom);

    // Draw image centered
    const imgAspect = img.width / img.height;
    let drawWidth = width;
    let drawHeight = width / imgAspect;

    if (drawHeight < height) {
      drawHeight = height;
      drawWidth = height * imgAspect;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCropSave = () => {
    if (!canvasRef.current) return;
    const croppedDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.92);
    onCrop(croppedDataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 text-left text-slate-800 dark:text-slate-100 relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-indigo-600 dark:text-violet-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Crop & Scale Image</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              Target: {aspectRatioLabel}
            </span>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg transition cursor-pointer"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Canvas Preview Area */}
        <div className="space-y-2">
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative w-full rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing select-none group"
            style={{ minHeight: '260px' }}
          >
            <canvas ref={canvasRef} className="max-w-full h-auto object-contain rounded-lg" />
            <div className="absolute inset-0 border-2 border-dashed border-violet-500/40 pointer-events-none rounded-lg" />
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] text-slate-300 pointer-events-none">
              Drag to position • Scroll/Slider to zoom
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="space-y-3 bg-slate-800/50 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-violet-400" />
              Zoom Scale
            </span>
            <span className="font-mono text-violet-400">{zoom.toFixed(1)}x</span>
          </div>

          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="range"
              min="0.8"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-violet-500 cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-slate-500 shrink-0" />
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition shrink-0"
              title="Reset Zoom & Position"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCropSave}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Apply & Use Image
          </button>
        </div>

      </div>
    </div>
  );
};
