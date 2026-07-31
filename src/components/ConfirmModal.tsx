/**
 * ConfirmModal Component
 * Customized Confirmation Dialog Popup Modal for Zopify Admin Console.
 * Replaces native browser confirm() popups with branded glassmorphism dialogs.
 */
import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, X } from 'lucide-react';

export interface ConfirmModalOptions {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalOptions> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  // ESC key listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';
  const isSuccess = variant === 'success';

  return (
    <div
      className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="bg-cardbg border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200 text-left space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-secondary-muted hover:text-heading hover:bg-accent-bg transition cursor-pointer"
          title="Cancel action"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isDanger
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                : isWarning
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                : isSuccess
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
            }`}
          >
            {isDanger && <AlertCircle size={24} />}
            {isWarning && <AlertTriangle size={24} />}
            {isSuccess && <CheckCircle2 size={24} />}
            {!isDanger && !isWarning && !isSuccess && <Info size={24} />}
          </div>

          <div className="space-y-1 pr-4">
            <h3 className="text-lg font-extrabold text-heading leading-snug">{title}</h3>
            <p className="text-xs text-secondary-muted leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary py-2.5 px-5 text-xs font-bold rounded-xl cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`py-2.5 px-6 text-xs font-bold rounded-xl shadow-md transition cursor-pointer ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : isWarning
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : isSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'btn btn-primary'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
