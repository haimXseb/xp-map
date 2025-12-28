import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export function ToastItem({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);
    
    // Auto remove
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsRemoving(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const typeStyles = {
    info: 'bg-blue-500/20 border-blue-400/30 text-blue-100',
    success: 'bg-green-500/20 border-green-400/30 text-green-100',
    warning: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-100',
    error: 'bg-red-500/20 border-red-400/30 text-red-100',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border backdrop-blur-xl p-4 shadow-lg min-w-[300px] max-w-[400px]',
        'transition-all duration-300 ease-out',
        typeStyles[toast.type],
        isVisible && !isRemoving ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full',
        isRemoving && 'opacity-0 scale-95'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="font-semibold text-sm">{toast.title}</div>
          {toast.message && (
            <div className="mt-1 text-xs opacity-90">{toast.message}</div>
          )}
        </div>
        <button
          onClick={() => {
            setIsRemoving(true);
            setTimeout(() => onRemove(toast.id), 300);
          }}
          className="opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 left-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}

