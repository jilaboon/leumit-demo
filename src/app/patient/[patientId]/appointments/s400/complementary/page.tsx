'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

const services = [
  { id: 'acupuncture', name: 'דיקור סיני', icon: '\u{1F9D8}', description: 'טיפול בכאב, מתח ובעיות שונות באמצעות מחטים' },
  { id: 'naturopathy', name: 'נטורופתיה', icon: '\u{1F33F}', description: 'רפואה טבעית הכוללת תזונה, צמחי מרפא ותוספי תזונה' },
  { id: 'homeopathy', name: 'הומאופתיה', icon: '\u{1F48A}', description: 'טיפול הוליסטי המבוסס על עקרונות ריפוי טבעיים' },
  { id: 'reflexology', name: 'רפלקסולוגיה', icon: '\u{1F9B6}', description: 'טיפול באמצעות לחיצות על נקודות בכפות הרגליים' },
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
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button
          onClick={() => router.push(`/patient/${patientId}/appointments/book`)}
          className="hover:text-blue-600 transition-colors"
        >
          זימון תור חדש
        </button>
        <span>{'\u2190'}</span>
        <span className="text-gray-900 font-medium">רפואה משלימה</span>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-6">רפואה משלימה</h2>

      {/* Services list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-xl shrink-0">
              {svc.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{svc.name}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{svc.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contact for booking */}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 text-center">
        <div className="text-3xl mb-3">{'\u{1F4DE}'}</div>
        <h3 className="text-base font-semibold text-blue-900 mb-2">לקביעת תור ברפואה משלימה</h3>
        <p className="text-sm text-blue-700 mb-4">
          ניתן לפנות למוקד שירות לאומית בטלפון או דרך האזור האישי
        </p>
        <div className="flex items-center justify-center gap-3">
          <span className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium">
            *2700
          </span>
          <span className="text-sm text-blue-500">או</span>
          <span className="px-5 py-2.5 bg-white border border-blue-200 text-blue-700 rounded-xl text-sm font-medium">
            אזור אישי
          </span>
        </div>
      </div>
    </div>
  );
}
