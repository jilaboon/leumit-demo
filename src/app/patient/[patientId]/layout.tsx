'use client';

import { use, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import PatientHeaderCard from '@/components/PatientHeaderCard';
import { SkeletonCard } from '@/components/Skeleton';

export default function PatientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const pathname = usePathname();
  const store = useStore();
  const [loading, setLoading] = useState(true);

  const isS400 = pathname.includes('/s400');

  useEffect(() => {
    if (isS400) {
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, [isS400]);

  const patient = store.getPatient(patientId);

  // S400 pages render full-screen (no QF chrome)
  if (isS400) {
    if (!patient) return null;
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <SkeletonCard />
        <div className="mt-6 space-y-4">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-1/3" />
          <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <span className="text-5xl mb-4">🔍</span>
        <h2 className="text-xl font-bold text-gray-800 mb-2">מטופל לא נמצא</h2>
        <p className="text-gray-500 mb-6">לא נמצא מטופל עם מספר ת.ז. {patientId}</p>
        <a href="/" className="px-6 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors">
          חזרה לחיפוש
        </a>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PatientHeaderCard patient={patient} />
      {children}
    </div>
  );
}
