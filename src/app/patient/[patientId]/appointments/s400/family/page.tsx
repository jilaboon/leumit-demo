'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { formatDate, formatTime } from '@/lib/utils';
import { familyDoctorSlots } from '@/lib/mock-data';

function BossaToolbar() {
  return (
    <div className="bg-gradient-to-b from-[#e8ecf0] to-[#d4dae0] border border-gray-400 px-1.5 py-0.5 flex items-center gap-0.5 mb-3">
      {[
        { icon: '🖨️', label: 'הדפסה' },
        { icon: '🔄', label: 'רענון' },
        { icon: '📋', label: 'העתקה' },
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
      <span className="text-[9px] text-gray-400">F1=עזרה | F5=רענון</span>
    </div>
  );
}

function BossaStatusBar({ branchName }: { branchName: string }) {
  return (
    <div className="mt-4 bg-[#e0e4e8] border border-gray-400 px-3 py-1 flex items-center justify-between text-[10px] text-gray-500">
      <div className="flex items-center gap-3">
        <span>Bossa Nova v8.4.2</span>
        <span className="text-gray-300">|</span>
        <span>מודול: רפואת משפחה</span>
        <span className="text-gray-300">|</span>
        <span>סניף: {branchName}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
        <span>מחובר</span>
      </div>
    </div>
  );
}

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
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-3">
          <button
            onClick={() => router.push(`/patient/${patientId}/appointments/book`)}
            className="hover:text-[#4472C4] underline"
          >
            זימון תור חדש
          </button>
          <span>&laquo;</span>
          <span className="text-gray-700 font-medium">רפואה ראשונית</span>
        </div>

        <BossaToolbar />

        <div className="border border-green-700 bg-[#e8f5e9] p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 bg-green-600 text-white text-xs flex items-center justify-center font-bold">V</span>
            <h2 className="text-sm font-bold text-green-900">פעולה הושלמה — תור נקבע בהצלחה</h2>
          </div>
          <div className="border border-green-300 bg-white p-3 text-xs text-gray-700 leading-relaxed">
            <p>
              תור ל{patient.assignedDoctor.name} נקבע בהצלחה
              {slot && (
                <> לתאריך {formatDate(slot.time)} בשעה {formatTime(slot.time)}</>
              )}
            </p>
            <p className="mt-1 text-gray-500">מספר אסמכתא: BN-{Date.now().toString().slice(-6)}</p>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => router.push(`/patient/${patientId}/appointments/book`)}
              className="px-4 py-1.5 bg-[#4472C4] text-white text-xs font-medium border border-[#2F5496] hover:bg-[#3a64b0] transition-colors"
            >
              חזרה לזימון תורים
            </button>
          </div>
        </div>

        <BossaStatusBar branchName={patient.branch.name} />
      </div>
    );
  }

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
        <span className="text-gray-700 font-medium">רפואה ראשונית</span>
      </div>

      <BossaToolbar />

      {/* Doctor info panel */}
      <div className="border border-gray-400 bg-[#f4f4f4] mb-3">
        <div className="bg-gradient-to-b from-[#d0d8e8] to-[#b8c4d8] px-3 py-1.5 border-b border-gray-400">
          <span className="text-[11px] font-bold text-[#2F5496]">פרטי רופא/ת משפחה</span>
        </div>
        <div className="px-3 py-2 flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">שם:</span>
            <span className="font-bold text-gray-900">{patient.assignedDoctor.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">מחלקה:</span>
            <span className="text-gray-900">רפואת משפחה</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">סניף:</span>
            <span className="text-gray-900">{patient.branch.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">מ.ר.:</span>
            <span className="text-gray-900 font-mono">{patient.assignedDoctor.id}</span>
          </div>
        </div>
      </div>

      {/* Available slots — data grid */}
      <div className="border border-gray-400 bg-white overflow-hidden">
        <div className="bg-[#4472C4] px-3 py-1.5 flex items-center justify-between">
          <span className="text-[11px] font-bold text-white">תורים פנויים</span>
          <span className="text-[10px] text-blue-200">{familyDoctorSlots.length} רשומות</span>
        </div>

        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-[#d6dce4]">
              <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700 w-8">#</th>
              <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700">יום</th>
              <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700">תאריך</th>
              <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700">שעה</th>
              <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700">סוג ביקור</th>
            </tr>
          </thead>
          <tbody>
            {familyDoctorSlots.map((slot, i) => (
              <tr
                key={slot.id}
                onClick={() => setSelectedSlotId(slot.id)}
                className={`cursor-pointer transition-colors ${
                  selectedSlotId === slot.id
                    ? 'bg-[#cce0ff] border-r-2 border-r-[#4472C4]'
                    : i % 2 === 0
                    ? 'bg-white hover:bg-[#e8f0ff]'
                    : 'bg-[#f5f7fa] hover:bg-[#e8f0ff]'
                }`}
              >
                <td className="px-2 py-1.5 border border-gray-300 text-gray-400 text-center">{i + 1}</td>
                <td className="px-2 py-1.5 border border-gray-300 text-gray-700">
                  {new Date(slot.time).toLocaleDateString('he-IL', { weekday: 'long' })}
                </td>
                <td className="px-2 py-1.5 border border-gray-300 text-gray-900 font-medium">{formatDate(slot.time)}</td>
                <td className="px-2 py-1.5 border border-gray-300 text-[#2F5496] font-bold">{formatTime(slot.time)}</td>
                <td className="px-2 py-1.5 border border-gray-300">
                  <span className={`px-1.5 py-0.5 text-[10px] font-medium border ${
                    slot.type === 'ביקור דחוף'
                      ? 'bg-red-50 text-red-700 border-red-300'
                      : slot.type === 'מעקב'
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-gray-50 text-gray-600 border-gray-300'
                  }`}>
                    {slot.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Selection bar */}
        {selectedSlotId && (
          <div className="bg-[#e8ecf0] border-t border-gray-400 px-3 py-2 flex items-center justify-between">
            <div className="text-[11px] text-gray-600">
              נבחר: <span className="font-bold text-gray-900">
                {formatDate(familyDoctorSlots.find((s) => s.id === selectedSlotId)!.time)}{' '}
                {formatTime(familyDoctorSlots.find((s) => s.id === selectedSlotId)!.time)}
              </span>
              {' — '}{familyDoctorSlots.find((s) => s.id === selectedSlotId)!.type}
            </div>
            <button
              onClick={handleBook}
              className="px-5 py-1.5 bg-[#4472C4] text-white text-xs font-medium border border-[#2F5496] hover:bg-[#3a64b0] transition-colors"
            >
              קביעת תור
            </button>
          </div>
        )}
      </div>

      <BossaStatusBar branchName={patient.branch.name} />
    </div>
  );
}
