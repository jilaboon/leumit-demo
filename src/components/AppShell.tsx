'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/Toast';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  // CRM and S400 routes render their own shell
  if (pathname.startsWith('/crm') || pathname.includes('/s400')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">QF</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">QF</h1>
                <p className="text-xs text-gray-500 -mt-0.5">מערכת זימון תורים</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  store.reset();
                  router.push('/');
                  showToast('הדמו אופס בהצלחה', 'success');
                }}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                איפוס דמו
              </button>
              <div className="w-px h-6 bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-700 text-sm font-medium">נ</span>
                </div>
                <span className="text-sm text-gray-700">נציג שירות</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
