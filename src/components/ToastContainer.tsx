/**
 * ToastContainer Component
 * Modern Toastify Alert Notification Container for Zopify Admin Console.
 * Renders rich floating alert messages for Success, Error / Network Failures, Information, and Warning / Cancelled actions.
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
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 fade-in ${
              isSuccess
                ? 'bg-emerald-950/90 dark:bg-emerald-950/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/30'
                : isError
                ? 'bg-rose-950/90 dark:bg-rose-950/95 border-rose-500/40 text-rose-100 shadow-rose-950/30'
                : isWarning
                ? 'bg-amber-950/90 dark:bg-amber-950/95 border-amber-500/40 text-amber-100 shadow-amber-950/30'
                : 'bg-slate-900/90 dark:bg-slate-900/95 border-indigo-500/40 text-slate-100 shadow-slate-950/30'
            }`}
          >
            {/* Icon */}
            <div className="shrink-0 pt-0.5">
              {isSuccess && <CheckCircle2 size={20} className="text-emerald-400" />}
              {isError && <AlertCircle size={20} className="text-rose-400" />}
              {isWarning && <AlertTriangle size={20} className="text-amber-400" />}
              {isInfo && <Info size={20} className="text-indigo-400" />}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-0.5 text-left">
              <h4 className="text-xs font-extrabold uppercase tracking-wider opacity-90">
                {toast.title ||
                  (isSuccess
                    ? 'Success'
                    : isError
                    ? 'Error / Network Alert'
                    : isWarning
                    ? 'Action Cancelled'
                    : 'System Notice')}
              </h4>
              <p className="text-xs font-medium leading-relaxed break-words">{toast.message}</p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => onRemove(toast.id)}
              className="shrink-0 p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              title="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
