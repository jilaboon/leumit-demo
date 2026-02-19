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

  const now = new Date();
  const dateStr = now.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="bg-black min-h-screen font-mono text-[13px] p-4 rounded-sm flex flex-col">
      {/* System header */}
      <div className="flex justify-between mb-0">
        <span className="text-white">{dateStr}  M800SMIRI</span>
        <span className="text-[#33ff33]">לאומית שרותי בריאות</span>
      </div>
      <div className="flex justify-between mb-2">
        <span className="text-white">{timeStr}  LT2020R1</span>
        <span className="text-[#33ff33]">רפואה משלימה</span>
      </div>

      {/* Patient info bar */}
      <div className="bg-[#ff00ff] text-black px-2 py-0.5 mb-3 flex justify-between text-[12px]">
        <span>ת.ז: {patient.id.replace('P', '58383838')}-8  שם מטופל: {patient.firstName} {patient.lastName}</span>
        <span>גיל: {patient.age}  ח/נ: קופה</span>
      </div>

      {/* Title */}
      <div className="text-[#00ffff] mb-3">
        שירותי רפואה משלימה — {services.length} שירותים
      </div>

      {/* Table header */}
      <div className="bg-[#008080] text-black px-1 py-0.5 mb-0 text-[12px] font-bold flex">
        <span className="w-8 text-center">#</span>
        <span className="w-20">קוד</span>
        <span className="w-28">שם שירות</span>
        <span className="flex-1">תיאור</span>
        <span className="w-16 text-center">סטטוס</span>
      </div>

      {/* Table rows */}
      <div className="flex-1">
        {services.map((svc, i) => (
          <div
            key={svc.id}
            className="px-1 py-0.5 flex text-[12px] text-[#33ff33]"
          >
            <span className="w-8 text-center text-gray-500">{i + 1}</span>
            <span className="w-20 text-gray-400">{svc.code}</span>
            <span className="w-28 text-[#33ff33] font-bold">{svc.name}</span>
            <span className="flex-1 text-[#33ff33]">{svc.description}</span>
            <span className="w-16 text-center text-yellow-400">טלפוני</span>
          </div>
        ))}
      </div>

      {/* Info section */}
      <div className="mt-4 mb-2">
        <div className="text-[#ff00ff] mb-1">הנחיות לקביעת תור:</div>
        <div className="text-[#33ff33] text-[12px] space-y-1">
          <div>שירותי רפואה משלימה זמינים לזימון טלפוני בלבד.</div>
          <div>
            <span className="text-[#ff00ff]">מוקד שירות: </span>
            <span className="text-[#00ffff] font-bold">*2700</span>
            <span className="text-white">  |  </span>
            <span className="text-[#ff00ff]">אזור אישי: </span>
            <span className="text-[#00ffff]">leumit.co.il</span>
          </div>
          <div className="text-gray-500 mt-2">
            לתשומת לב: שירותים אלה כפופים לתנאי התכנית המשלימה של המטופל/ת.
          </div>
        </div>
      </div>

      <div className="text-right text-gray-500 text-[11px] mt-2 mb-2">Bottom</div>

      {/* Function keys */}
      <div className="border-t border-gray-700 pt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] mt-auto">
        <button onClick={() => router.push(`/patient/${patientId}/appointments/book`)} className="hover:text-white">
          <span className="text-[#ff00ff]">F1</span><span className="text-[#33ff33]">=הסבר</span>
        </button>
        <button onClick={() => router.push(`/patient/${patientId}/appointments/book`)} className="hover:text-white">
          <span className="text-[#ff00ff]">F3</span><span className="text-[#33ff33]">=סיום</span>
        </button>
        <span><span className="text-[#ff00ff]">F5</span><span className="text-[#33ff33]">=רענון</span></span>
        <span><span className="text-[#ff00ff]">F12</span><span className="text-[#33ff33]">=מסך קודם</span></span>
      </div>
    </div>
  );
}
