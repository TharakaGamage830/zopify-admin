/**
 * ToastContainer Component
 * Minimalist Two-Tone Toast Notification Container for Zopify Admin Console.
 * Displays clean, high-contrast floating alerts with an animated progress loading bar (4s timer).
 */
import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';
          const isInfo = toast.type === 'info';

          const accentBorder = isSuccess
            ? 'border-l-emerald-500'
            : isError
            ? 'border-l-rose-500'
            : isWarning
            ? 'border-l-amber-500'
            : 'border-l-indigo-500';

          const iconColor = isSuccess
            ? 'text-emerald-500'
            : isError
            ? 'text-rose-500'
            : isWarning
            ? 'text-amber-500'
            : 'text-indigo-500';

          const barBg = isSuccess
            ? 'bg-emerald-500'
            : isError
            ? 'bg-rose-500'
            : isWarning
            ? 'bg-amber-500'
            : 'bg-indigo-500';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-3.5 pb-4 rounded-xl border border-slate-200 dark:border-slate-800 border-l-4 ${accentBorder} bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-lg shadow-slate-900/5 dark:shadow-slate-950/50 transition-all duration-300 animate-in slide-in-from-top-3 fade-in`}
            >
              {/* Minimal Status Icon */}
              <div className={`shrink-0 pt-0.5 ${iconColor}`}>
                {isSuccess && <CheckCircle2 size={18} />}
                {isError && <AlertCircle size={18} />}
                {isWarning && <AlertTriangle size={18} />}
                {isInfo && <Info size={18} />}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-0.5 text-left min-w-0">
                <h4 className="text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {toast.title ||
                    (isSuccess
                      ? 'Success'
                      : isError
                      ? 'Error Alert'
                      : isWarning
                      ? 'Notice'
                      : 'System Alert')}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed break-words">
                  {toast.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Dismiss notification"
              >
                <X size={14} />
              </button>

              {/* Animated Progress Loading Bar (4s timer) */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
                <div
                  className={`h-full ${barBg}`}
                  style={{
                    animation: 'toastProgress 4000ms linear forwards',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
