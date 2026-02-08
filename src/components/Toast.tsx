'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-2" dir="rtl">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              px-4 py-3 rounded-xl shadow-lg text-sm font-medium
              animate-[slideUp_0.3s_ease-out]
              ${toast.type === 'success' ? 'bg-green-600 text-white' : ''}
              ${toast.type === 'info' ? 'bg-teal-600 text-white' : ''}
              ${toast.type === 'warning' ? 'bg-amber-500 text-white' : ''}
            `}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <span>✓</span>}
              {toast.type === 'info' && <span>ℹ</span>}
              {toast.type === 'warning' && <span>⚠</span>}
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
