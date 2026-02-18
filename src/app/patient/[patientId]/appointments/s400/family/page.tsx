'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { formatDate, formatTime } from '@/lib/utils';
import { familyDoctorSlots } from '@/lib/mock-data';

export default function FamilyDoctorPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const store = useStore();
  const patient = store.getPatient(patientId);

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  if (!patient) return null;

  const handleBook = () => {
    setBooked(true);
  };

  if (booked) {
    const slot = familyDoctorSlots.find((s) => s.id === selectedSlotId);
    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button
            onClick={() => router.push(`/patient/${patientId}/appointments/book`)}
            className="hover:text-blue-600 transition-colors"
          >
            זימון תור חדש
          </button>
          <span>←</span>
          <span className="text-gray-900 font-medium">רפואה ראשונית</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">&#x2705;</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">תור נקבע בהצלחה</h2>
          <p className="text-sm text-gray-600 mb-6">
            תור ל{patient.assignedDoctor.name} נקבע בהצלחה
            {slot && (
              <>
                {' '}לתאריך {formatDate(slot.time)} בשעה {formatTime(slot.time)}
              </>
            )}
          </p>
          <button
            onClick={() => router.push(`/patient/${patientId}/appointments/book`)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            חזרה לזימון תורים
          </button>
        </div>
      </div>
    );
  }

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
        <span>←</span>
        <span className="text-gray-900 font-medium">רפואה ראשונית</span>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-6">רפואה ראשונית — תור לרופא/ת משפחה</h2>

      {/* Doctor info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl">
            &#x1F468;&#x200D;&#x2695;&#xFE0F;
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{patient.assignedDoctor.name}</h3>
            <p className="text-sm text-gray-500">רופא/ת משפחה | {patient.branch.name}</p>
          </div>
        </div>
      </div>

      {/* Available slots */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-blue-50">
          <h3 className="text-base font-semibold text-blue-900">תורים פנויים</h3>
          <p className="text-xs text-blue-600 mt-0.5">{familyDoctorSlots.length} תורים זמינים</p>
        </div>

        <div className="divide-y divide-gray-50">
          {familyDoctorSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => setSelectedSlotId(slot.id)}
              className={`
                w-full px-5 py-3.5 flex items-center justify-between text-right transition-all
                ${selectedSlotId === slot.id
                  ? 'bg-blue-50 border-r-4 border-blue-500'
                  : 'hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">{formatDate(slot.time)}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(slot.time).toLocaleDateString('he-IL', { weekday: 'long' })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{slot.type}</span>
                <span className="text-sm font-semibold text-blue-600">{formatTime(slot.time)}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Book button */}
        {selectedSlotId && (
          <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              נבחר: <span className="font-medium text-gray-900">
                {formatDate(familyDoctorSlots.find((s) => s.id === selectedSlotId)!.time)}{' '}
                {formatTime(familyDoctorSlots.find((s) => s.id === selectedSlotId)!.time)}
              </span>
            </div>
            <button
              onClick={handleBook}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              קביעת תור
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
