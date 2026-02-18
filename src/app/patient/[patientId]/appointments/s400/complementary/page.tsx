'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

const services = [
  { id: 'acupuncture', name: 'דיקור סיני', code: 'CMP-101', description: 'טיפול בכאב, מתח ובעיות שונות באמצעות מחטים' },
  { id: 'naturopathy', name: 'נטורופתיה', code: 'CMP-102', description: 'רפואה טבעית הכוללת תזונה, צמחי מרפא ותוספי תזונה' },
  { id: 'homeopathy', name: 'הומאופתיה', code: 'CMP-103', description: 'טיפול הוליסטי המבוסס על עקרונות ריפוי טבעיים' },
  { id: 'reflexology', name: 'רפלקסולוגיה', code: 'CMP-104', description: 'טיפול באמצעות לחיצות על נקודות בכפות הרגליים' },
];

export default function ComplementaryMedicinePage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const store = useStore();
  const patient = store.getPatient(patientId);

  if (!patient) return null;

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-3">
        <button
          onClick={() => router.push(`/patient/${patientId}/appointments/book`)}
          className="hover:text-[#4472C4] underline"
        >
          זימון תור חדש
        </button>
        <span>&laquo;</span>
        <span className="text-gray-700 font-medium">רפואה משלימה</span>
      </div>

      {/* Toolbar */}
      <div className="bg-gradient-to-b from-[#e8ecf0] to-[#d4dae0] border border-gray-400 px-1.5 py-0.5 flex items-center gap-0.5 mb-3">
        {[
          { icon: '🖨️', label: 'הדפסה' },
          { icon: '🔄', label: 'רענון' },
          { icon: '❓', label: 'עזרה' },
        ].map((btn) => (
          <button
            key={btn.label}
            className="flex items-center gap-1 px-2 py-0.5 text-[10px] text-gray-600 hover:bg-[#c8d0d8] border border-transparent hover:border-gray-400 rounded-sm transition-colors"
          >
            <span className="text-xs">{btn.icon}</span>
            {btn.label}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-[9px] text-gray-400">F1=עזרה</span>
      </div>

      {/* Services data grid */}
      <div className="border border-gray-400 bg-white overflow-hidden mb-3">
        <div className="bg-[#4472C4] px-3 py-1.5 flex items-center justify-between">
          <span className="text-[11px] font-bold text-white">שירותי רפואה משלימה</span>
          <span className="text-[10px] text-blue-200">{services.length} שירותים</span>
        </div>

        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-[#d6dce4]">
              <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700 w-8">#</th>
              <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700 w-20">קוד</th>
              <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700">שם שירות</th>
              <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700">תיאור</th>
              <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700 w-20">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {services.map((svc, i) => (
              <tr
                key={svc.id}
                className={i % 2 === 0 ? 'bg-white' : 'bg-[#f5f7fa]'}
              >
                <td className="px-2 py-1.5 border border-gray-300 text-gray-400 text-center">{i + 1}</td>
                <td className="px-2 py-1.5 border border-gray-300 text-gray-600 font-mono">{svc.code}</td>
                <td className="px-2 py-1.5 border border-gray-300 text-gray-900 font-medium">{svc.name}</td>
                <td className="px-2 py-1.5 border border-gray-300 text-gray-600">{svc.description}</td>
                <td className="px-2 py-1.5 border border-gray-300 text-center">
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-300">
                    טלפוני
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info panel */}
      <div className="border border-gray-400 bg-[#f4f4f4]">
        <div className="bg-gradient-to-b from-[#d0d8e8] to-[#b8c4d8] px-3 py-1.5 border-b border-gray-400">
          <span className="text-[11px] font-bold text-[#2F5496]">הנחיות לקביעת תור</span>
        </div>
        <div className="px-3 py-3 text-xs text-gray-700 space-y-2">
          <p>שירותי רפואה משלימה זמינים לזימון טלפוני בלבד.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">מוקד שירות:</span>
              <span className="font-bold text-[#2F5496] font-mono">*2700</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">אזור אישי:</span>
              <span className="font-medium text-gray-900">leumit.co.il</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 border-t border-gray-300 pt-2 mt-2">
            לתשומת לב: שירותים אלה כפופים לתנאי התכנית המשלימה של המטופל/ת.
          </p>
        </div>
      </div>

      {/* Status bar */}
      <div className="mt-4 bg-[#e0e4e8] border border-gray-400 px-3 py-1 flex items-center justify-between text-[10px] text-gray-500">
        <div className="flex items-center gap-3">
          <span>Bossa Nova v8.4.2</span>
          <span className="text-gray-300">|</span>
          <span>מודול: רפואה משלימה</span>
          <span className="text-gray-300">|</span>
          <span>סניף: {patient.branch.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          <span>מחובר</span>
        </div>
      </div>
    </div>
  );
}
