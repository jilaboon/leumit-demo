'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { formatDate, formatTime } from '@/lib/utils';
import { familyDoctorSlots } from '@/lib/mock-data';

const hebrewDay = (iso: string) =>
  new Date(iso).toLocaleDateString('he-IL', { weekday: 'long' });

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

  const now = new Date();
  const dateStr = now.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const handleBook = () => {
    setBooked(true);
  };

  if (booked) {
    const slot = familyDoctorSlots.find((s) => s.id === selectedSlotId);
    return (
      <div className="bg-black min-h-screen font-mono text-base p-4 rounded-sm">
        {/* System header */}
        <div className="flex justify-between mb-1">
          <span className="text-white">{dateStr}  M800SMIRI</span>
          <span className="text-[#33ff33]">לאומית שרותי בריאות</span>
        </div>
        <div className="flex justify-between mb-3">
          <span className="text-white">{timeStr}  LT2020R1</span>
          <span className="text-[#33ff33]">רפואה ראשונית</span>
        </div>

        {/* Success */}
        <div className="my-8">
          <div className="text-[#33ff33] text-center mb-4">
            *** פעולה הושלמה בהצלחה ***
          </div>
          <div className="text-[#33ff33] text-center mb-2">
            תור ל{patient.assignedDoctor.name} נקבע בהצלחה
          </div>
          {slot && (
            <div className="text-[#00ffff] text-center mb-2">
              תאריך: {formatDate(slot.time)}  שעה: {formatTime(slot.time)}
            </div>
          )}
          <div className="text-white text-center mb-6">
            מספר אסמכתא: BN-{Date.now().toString().slice(-6)}
          </div>
          <div className="text-[#ff00ff] text-center">
            הקש Enter לחזרה לתפריט ראשי
          </div>
        </div>

        {/* Function keys */}
        <div className="absolute bottom-0 left-0 right-0 p-2" style={{ position: 'relative', marginTop: 'auto' }}>
          <div className="border-t border-gray-700 pt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <button onClick={() => router.push(`/patient/${patientId}/appointments/book`)} className="hover:text-white">
              <span className="text-[#ff00ff]">F3</span><span className="text-[#33ff33]">=חזרה לזימון</span>
            </button>
            <button onClick={() => router.push(`/patient/${patientId}/appointments/book`)} className="hover:text-white">
              <span className="text-[#ff00ff]">Enter</span><span className="text-[#33ff33]">=המשך</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen font-mono text-base p-4 rounded-sm flex flex-col">
      {/* System header */}
      <div className="flex justify-between mb-0">
        <span className="text-white">{dateStr}  M800SMIRI</span>
        <span className="text-[#33ff33]">לאומית שרותי בריאות</span>
      </div>
      <div className="flex justify-between mb-2">
        <span className="text-white">{timeStr}  LT2020R1</span>
        <span className="text-[#33ff33]">רפואה ראשונית</span>
      </div>

      {/* Patient info bar */}
      <div className="bg-[#ff00ff] text-black px-2 py-0.5 mb-2 flex justify-between text-sm">
        <span>ת.ז: {patient.id.replace('P', '58383838')}-8  שם מטופל: {patient.firstName} {patient.lastName}</span>
        <span>גיל: {patient.age}  ח/נ: קופה</span>
      </div>

      {/* Doctor info */}
      <div className="mb-3">
        <span className="text-[#ff00ff]">רופא אישי: </span>
        <span className="text-[#33ff33]">{patient.assignedDoctor.name}</span>
        <span className="text-white">  |  </span>
        <span className="text-[#ff00ff]">מ.ר.: </span>
        <span className="text-[#33ff33]">{patient.assignedDoctor.id}</span>
        <span className="text-white">  |  </span>
        <span className="text-[#ff00ff]">סניף: </span>
        <span className="text-[#33ff33]">{patient.branch.name}</span>
      </div>

      {/* Instructions */}
      <div className="text-[#00ffff] mb-1">
        בחר תור, הקש Enter.
      </div>
      <div className="text-[#ff00ff] mb-3 text-xs">
        1=בארה  5=רשימת זימונים  7=תחום טיפול  8=מכונים  9=מונגסי  10=הגבלויות
      </div>

      {/* Table header */}
      <div className="bg-[#008080] text-black px-1 py-0.5 mb-0 text-sm font-bold flex">
        <span className="w-8 text-center">#</span>
        <span className="w-24">יום</span>
        <span className="w-24">תאריך</span>
        <span className="w-16">שעה</span>
        <span className="w-20">סוג ביקור</span>
        <span className="flex-1">מרפאה</span>
      </div>

      {/* Table rows */}
      <div className="flex-1">
        {familyDoctorSlots.map((slot, i) => (
          <div
            key={slot.id}
            onClick={() => setSelectedSlotId(slot.id)}
            className={`px-1 py-0.5 flex cursor-pointer text-sm ${
              selectedSlotId === slot.id
                ? 'bg-[#008080] text-black font-bold'
                : 'text-[#33ff33] hover:bg-gray-900'
            }`}
          >
            <span className="w-8 text-center">{i + 1}</span>
            <span className="w-24">{hebrewDay(slot.time)}</span>
            <span className="w-24">{formatDate(slot.time)}</span>
            <span className="w-16">{formatTime(slot.time)}</span>
            <span className="w-20">{slot.type}</span>
            <span className="flex-1">{patient.branch.name}</span>
          </div>
        ))}
      </div>

      {/* Selected info */}
      {selectedSlotId && (
        <div className="mt-2 text-[#00ffff] text-sm">
          נבחר: {patient.assignedDoctor.name} — {formatDate(familyDoctorSlots.find((s) => s.id === selectedSlotId)!.time)} {formatTime(familyDoctorSlots.find((s) => s.id === selectedSlotId)!.time)}
        </div>
      )}

      {/* Bottom / Status */}
      <div className="text-right text-gray-500 text-xs mt-2 mb-2">Bottom</div>

      {/* Function keys */}
      <div className="border-t border-gray-700 pt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs mt-auto">
        <button onClick={() => router.push(`/patient/${patientId}/appointments/book`)} className="hover:text-white">
          <span className="text-[#ff00ff]">F1</span><span className="text-[#33ff33]">=הסבר</span>
        </button>
        <span><span className="text-[#ff00ff]">F2</span><span className="text-[#33ff33]">=הרופאים</span></span>
        <button onClick={() => router.push(`/patient/${patientId}/appointments/book`)} className="hover:text-white">
          <span className="text-[#ff00ff]">F3</span><span className="text-[#33ff33]">=סיום</span>
        </button>
        <span><span className="text-[#ff00ff]">F5</span><span className="text-[#33ff33]">=רענון</span></span>
        <span><span className="text-[#ff00ff]">F7</span><span className="text-[#33ff33]">=מעבדה</span></span>
        <span><span className="text-[#ff00ff]">F8</span><span className="text-[#33ff33]">=מכונים</span></span>
        <span><span className="text-[#ff00ff]">F12</span><span className="text-[#33ff33]">=מסך קודם</span></span>
        {selectedSlotId && (
          <button onClick={handleBook} className="hover:text-white">
            <span className="text-[#ff00ff]">Enter</span><span className="text-[#00ffff]">=קביעת תור</span>
          </button>
        )}
      </div>
    </div>
  );
}
