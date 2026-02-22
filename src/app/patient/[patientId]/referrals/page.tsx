'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

interface ReferralRow {
  id: number;
  serviceCode: string;
  serviceName: string;
  schedulingSystem: 'BossaNova' | 'QFlow';
  status: string;
}

const referrals: ReferralRow[] = [
  { id: 1, serviceCode: '141', serviceName: 'קרדיולוגיה', schedulingSystem: 'BossaNova', status: 'Open' },
  { id: 2, serviceCode: '131', serviceName: 'גינקולוגיה', schedulingSystem: 'BossaNova', status: 'Open' },
  { id: 3, serviceCode: '221', serviceName: 'אולטרסאונד כללי', schedulingSystem: 'QFlow', status: 'Open' },
  { id: 4, serviceCode: '222', serviceName: 'אולטרסאונד גינקולוגי', schedulingSystem: 'BossaNova', status: 'Open' },
  { id: 5, serviceCode: '213', serviceName: 'בדיקות דם', schedulingSystem: 'BossaNova', status: 'Open' },
];

export default function ReferralsPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const store = useStore();
  const patient = store.getPatient(patientId);

  if (!patient) return null;

  const handleRowClick = (row: ReferralRow) => {
    const base = `/patient/${patientId}/appointments`;

    if (row.schedulingSystem === 'QFlow') {
      // Route to QF booking with pre-fill
      router.push(`${base}/qf/ultrasound/book?prefill=${encodeURIComponent(row.serviceName)}&from=referrals`);
    } else {
      // Route to BossaNova — determine the right S400 page
      if (row.serviceName === 'קרדיולוגיה') {
        router.push(`${base}/s400/consultant?specialty=קרדיולוגיה&from=referrals`);
      } else if (row.serviceName === 'גינקולוגיה') {
        router.push(`${base}/s400/consultant?specialty=גינקולוגיה&from=referrals`);
      } else {
        router.push(`${base}/s400/institutes?search=${encodeURIComponent(row.serviceName)}&from=referrals`);
      }
    }
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
        <span>&larr;</span>
        <span className="text-gray-900 font-medium">הפניות מטופל</span>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">הפניות מטופל</h2>
      <p className="text-sm text-gray-500 mb-6">
        לחץ על הפנייה לזימון תור — המערכת תנתב אוטומטית למערכת הזימון המתאימה
      </p>

      {/* Referrals table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-600">מס׳ הפנייה</th>
                <th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-600">קוד שירות</th>
                <th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-600">שם שירות</th>
                <th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-600">מערכת זימון</th>
                <th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-600">סטטוס</th>
                <th className="py-3.5 px-5 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((row) => {
                const isQF = row.schedulingSystem === 'QFlow';
                return (
                  <tr
                    key={row.id}
                    onClick={() => handleRowClick(row)}
                    className="border-b border-gray-50 cursor-pointer hover:bg-teal-50/50 transition-colors group"
                  >
                    <td className="py-3.5 px-5 font-medium text-gray-900">{row.id}</td>
                    <td className="py-3.5 px-5 font-mono text-gray-600">{row.serviceCode}</td>
                    <td className="py-3.5 px-5 font-medium text-gray-900">{row.serviceName}</td>
                    <td className="py-3.5 px-5">
                      <span className={`
                        inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full
                        ${isQF
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-amber-100 text-amber-700'
                        }
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isQF ? 'bg-teal-500' : 'bg-amber-500'}`} />
                        {row.schedulingSystem}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        פתוחה
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="text-gray-300 group-hover:text-teal-500 transition-colors text-lg">&larr;</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">QFlow</span>
          <span>זימון מהיר — מערכת חדשה</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">BossaNova</span>
          <span>מערכת קיימת</span>
        </div>
      </div>
    </div>
  );
}
