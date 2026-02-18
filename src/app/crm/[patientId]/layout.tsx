'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/Toast';

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <div className="min-h-screen bg-slate-100">
      {/* CRM Header */}
      <header className="bg-blue-900 border-b border-blue-950 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">L</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-tight">Leumit CRM</h1>
                <p className="text-[10px] text-blue-300 leading-tight">v4.2.1 | מערכת ניהול לקוחות</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  store.reset();
                  router.push('/');
                  showToast('הדמו אופס בהצלחה', 'success');
                }}
                className="text-[10px] px-2 py-1 rounded border border-blue-600 text-blue-200 hover:bg-blue-800 transition-colors"
              >
                איפוס דמו
              </button>
              <div className="w-px h-5 bg-blue-700" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-blue-200 text-xs font-medium">מ</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-white block leading-tight">מיכל לוי</span>
                  <span className="text-[10px] text-blue-400 block leading-tight">מוקד ארצי | עמדה 14</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {children}
      </main>

      {/* CRM Footer Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-blue-950 border-t border-blue-900 py-1.5 px-4 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] text-blue-400">
          <div className="flex items-center gap-4">
            <span>Leumit CRM v4.2.1</span>
            <span className="text-blue-600">|</span>
            <span>סניף: מוקד ארצי</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>מחובר</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
