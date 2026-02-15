'use client';

import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import { formatDate } from '@/lib/utils';

export default function ReferralsPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const store = useStore();

  const patient = store.getPatient(patientId);

  // Date range: default 1 year back
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const [dateFrom, setDateFrom] = useState(oneYearAgo.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(today.toISOString().split('T')[0]);

  // Search fields
  const [searchCode, setSearchCode] = useState('');
  const [searchDoctor, setSearchDoctor] = useState('');
  const [searchNumber, setSearchNumber] = useState('');

  if (!patient) return null;

  const allReferrals = store.getAllPatientReferrals(patientId);

  const filteredReferrals = useMemo(() => {
    let results = allReferrals;

    // Date range filter
    const from = new Date(dateFrom);
    from.setHours(0, 0, 0, 0);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);

    results = results.filter((r) => {
      const created = new Date(r.createdISO);
      return created >= from && created <= to;
    });

    // Search by exam code
    if (searchCode.trim()) {
      const q = searchCode.trim().toLowerCase();
      results = results.filter((r) => r.examCode.toLowerCase().includes(q));
    }

    // Search by referring doctor
    if (searchDoctor.trim()) {
      const q = searchDoctor.trim();
      results = results.filter((r) => r.referringDoctor.includes(q));
    }

    // Search by referral number
    if (searchNumber.trim()) {
      const q = searchNumber.trim().toLowerCase();
      results = results.filter((r) => r.referralNumber.toLowerCase().includes(q));
    }

    return results;
  }, [allReferrals, dateFrom, dateTo, searchCode, searchDoctor, searchNumber]);

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      Open: 'פתוחה',
      Used: 'נוצלה',
      Expired: 'פג תוקף',
      Canceled: 'בוטלה',
    };
    return map[status] || status;
  };

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button
          onClick={() => router.push(`/patient/${patientId}/appointments/book`)}
          className="hover:text-teal-600 transition-colors"
        >
          זימון תור חדש
        </button>
        <span>←</span>
        <span className="text-gray-900 font-medium">הפניות</span>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-6">הפניות מטופל</h2>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 space-y-4">
        {/* Date range */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700">טווח תאריכים:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              dir="ltr"
            />
            <span className="text-gray-400">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              dir="ltr"
            />
          </div>
        </div>

        {/* Search fields */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-gray-500 mb-1">קוד בדיקה</label>
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder='לדוגמה: "BLD-100"'
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              dir="ltr"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-gray-500 mb-1">רופא מפנה</label>
            <input
              type="text"
              value={searchDoctor}
              onChange={(e) => setSearchDoctor(e.target.value)}
              placeholder="שם הרופא..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-gray-500 mb-1">מספר הפנייה</label>
            <input
              type="text"
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
              placeholder='לדוגמה: "HP-2025"'
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              dir="ltr"
            />
          </div>
        </div>

        {/* Clear filters */}
        {(searchCode || searchDoctor || searchNumber) && (
          <button
            onClick={() => { setSearchCode(''); setSearchDoctor(''); setSearchNumber(''); }}
            className="text-xs text-red-500 hover:text-red-700 underline"
          >
            נקה חיפוש
          </button>
        )}
      </div>

      {/* Results table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">תוצאות</h3>
          <span className="text-xs text-gray-400">{filteredReferrals.length} הפניות</span>
        </div>

        {filteredReferrals.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon="📄"
              title="לא נמצאו הפניות"
              description="נסה לשנות את טווח התאריכים או את שדות החיפוש"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">קוד בדיקה</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">שם הבדיקה</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">רופא מפנה</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">מספר הפנייה</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">תאריך</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {filteredReferrals.map((ref) => (
                  <tr key={ref.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-gray-600" dir="ltr">{ref.examCode}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{ref.examName}</td>
                    <td className="py-3 px-4 text-gray-700">{ref.referringDoctor}</td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-600" dir="ltr">{ref.referralNumber}</td>
                    <td className="py-3 px-4 text-gray-700">{formatDate(ref.createdISO)}</td>
                    <td className="py-3 px-4">
                      <Badge status={ref.status} label={statusLabel(ref.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
