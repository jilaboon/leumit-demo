'use client';

import { use, useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { formatDate, formatTime } from '@/lib/utils';
import { consultantSpecialties, consultantSlots } from '@/lib/mock-data';

export default function ConsultantSearchPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  return (
    <Suspense>
      <ConsultantSearchInner params={params} />
    </Suspense>
  );
}

function ConsultantSearchInner({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useStore();
  const patient = store.getPatient(patientId);

  const [specialty, setSpecialty] = useState('');
  const [subSpecialty, setSubSpecialty] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [freeText, setFreeText] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  // Pre-fill from query param (e.g., from referrals page)
  const prefillSpecialty = searchParams.get('specialty');
  useEffect(() => {
    if (!prefillSpecialty) return;
    setSpecialty(prefillSpecialty);
    setHasSearched(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillSpecialty]);

  if (!patient) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const currentSubSpecialties = useMemo(() => {
    if (!specialty) return [];
    const found = consultantSpecialties.find((s) => s.name === specialty);
    return found?.subSpecialties || [];
  }, [specialty]);

  const results = useMemo(() => {
    if (!hasSearched) return [];
    let filtered = [...consultantSlots];

    if (specialty) {
      filtered = filtered.filter((s) => s.specialty === specialty);
    }
    if (subSpecialty) {
      filtered = filtered.filter((s) => s.subSpecialty === subSpecialty);
    }
    if (doctorName.trim()) {
      filtered = filtered.filter((s) => s.doctorName.includes(doctorName.trim()));
    }
    if (freeText.trim()) {
      const q = freeText.trim();
      filtered = filtered.filter(
        (s) =>
          s.doctorName.includes(q) ||
          s.specialty.includes(q) ||
          s.subSpecialty.includes(q) ||
          s.clinic.name.includes(q) ||
          s.clinic.city.includes(q)
      );
    }

    return filtered.sort(
      (a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime()
    );
  }, [hasSearched, specialty, subSpecialty, doctorName, freeText]);

  const handleSearch = () => {
    setHasSearched(true);
    setSelectedSlotId(null);
  };

  const handleBook = () => {
    setBooked(true);
  };

  if (booked) {
    const slot = consultantSlots.find((s) => s.id === selectedSlotId);
    return (
      <div className="bg-black min-h-screen font-mono text-[13px] p-4 rounded-sm">
        {/* System header */}
        <div className="flex justify-between mb-0">
          <span className="text-white">{dateStr}  M800SMIRI</span>
          <span className="text-[#33ff33]">לאומית שרותי בריאות</span>
        </div>
        <div className="flex justify-between mb-3">
          <span className="text-white">{timeStr}  LT2020R1</span>
          <span className="text-[#33ff33]">תורים לרופאים לפי תחום טיפול</span>
        </div>

        <div className="my-8">
          <div className="text-[#33ff33] text-center mb-4">
            *** פעולה הושלמה בהצלחה ***
          </div>
          {slot && (
            <>
              <div className="text-[#33ff33] text-center mb-2">
                תור ל{slot.doctorName} ({slot.specialty}) נקבע בהצלחה
              </div>
              <div className="text-[#00ffff] text-center mb-2">
                תאריך: {formatDate(slot.startISO)}  שעה: {formatTime(slot.startISO)}  מרפאה: {slot.clinic.name}
              </div>
            </>
          )}
          <div className="text-white text-center mb-6">
            מספר אסמכתא: BN-{Date.now().toString().slice(-6)}
          </div>
          <div className="text-[#ff00ff] text-center">
            הקש Enter לחזרה לתפריט ראשי
          </div>
        </div>

        <div className="border-t border-gray-700 pt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] mt-8">
          <button onClick={() => router.push(`/patient/${patientId}/appointments/book`)} className="hover:text-white">
            <span className="text-[#ff00ff]">F3</span><span className="text-[#33ff33]">=חזרה לזימון</span>
          </button>
          <button onClick={() => router.push(`/patient/${patientId}/appointments/book`)} className="hover:text-white">
            <span className="text-[#ff00ff]">Enter</span><span className="text-[#33ff33]">=המשך</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen font-mono text-[13px] p-4 rounded-sm flex flex-col">
      {/* System header */}
      <div className="flex justify-between mb-0">
        <span className="text-white">{dateStr}  M800SMIRI</span>
        <span className="text-[#33ff33]">לאומית שרותי בריאות</span>
      </div>
      <div className="flex justify-between mb-2">
        <span className="text-white">{timeStr}  LT2020R1</span>
        <span className="text-[#33ff33]">תורים לרופאים לפי תחום טיפול</span>
      </div>

      {/* Patient info bar */}
      <div className="bg-[#ff00ff] text-black px-2 py-0.5 mb-3 flex justify-between text-[12px]">
        <span>ת.ז: {patient.id.replace('P', '58383838')}-8  שם מטופל: {patient.firstName} {patient.lastName}</span>
        <span>גיל: {patient.age}  ח/נ: קופה</span>
      </div>

      {/* Search fields */}
      <div className="mb-3 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[#ff00ff] w-24">תחום טיפול:</span>
          <select
            value={specialty}
            onChange={(e) => {
              setSpecialty(e.target.value);
              setSubSpecialty('');
            }}
            className="bg-black text-[#33ff33] border border-[#33ff33] px-2 py-0.5 text-[12px] font-mono w-48 focus:outline-none focus:border-[#00ffff]"
          >
            <option value="">— בחר —</option>
            {consultantSpecialties.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>

          <span className="text-[#ff00ff] w-20 mr-4">תת-התמחות:</span>
          <select
            value={subSpecialty}
            onChange={(e) => setSubSpecialty(e.target.value)}
            disabled={currentSubSpecialties.length === 0}
            className="bg-black text-[#33ff33] border border-[#33ff33] px-2 py-0.5 text-[12px] font-mono w-48 focus:outline-none focus:border-[#00ffff] disabled:text-gray-600 disabled:border-gray-600"
          >
            <option value="">— הכל —</option>
            {currentSubSpecialties.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#ff00ff] w-24">שם רופא:</span>
          <input
            type="text"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="הקלד שם"
            className="bg-black text-[#33ff33] border border-[#33ff33] px-2 py-0.5 text-[12px] font-mono w-48 focus:outline-none focus:border-[#00ffff] placeholder:text-gray-600"
          />

          <span className="text-[#ff00ff] w-20 mr-4">חיפוש חופשי:</span>
          <input
            type="text"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="מרפאה, עיר..."
            className="bg-black text-[#33ff33] border border-[#33ff33] px-2 py-0.5 text-[12px] font-mono w-48 focus:outline-none focus:border-[#00ffff] placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="text-[#00ffff] mb-1 text-[12px]">
        {hasSearched
          ? `נמצאו ${results.length} תוצאות. בחר תור, הקש Enter.`
          : 'הקש Enter לחיפוש, או F5 לרענון.'}
      </div>

      {/* Results */}
      {hasSearched && (
        <>
          {/* Table header */}
          <div className="bg-[#008080] text-black px-1 py-0.5 mb-0 text-[12px] font-bold flex">
            <span className="w-8 text-center">#</span>
            <span className="w-36">רופא</span>
            <span className="w-28">התמחות</span>
            <span className="w-28">מרפאה</span>
            <span className="w-16">יום</span>
            <span className="w-24">תאריך</span>
            <span className="w-16">שעה</span>
          </div>

          {/* Table rows */}
          <div className="flex-1 overflow-y-auto">
            {results.length === 0 ? (
              <div className="text-yellow-400 py-4 text-center text-[12px]">
                לא נמצאו תוצאות. שנה פרמטרי חיפוש.
              </div>
            ) : (
              results.map((slot, i) => (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`px-1 py-0.5 flex cursor-pointer text-[12px] ${
                    selectedSlotId === slot.id
                      ? 'bg-[#008080] text-black font-bold'
                      : 'text-[#33ff33] hover:bg-gray-900'
                  }`}
                >
                  <span className="w-8 text-center">{i + 1}</span>
                  <span className="w-36">{slot.doctorName}</span>
                  <span className="w-28">{slot.specialty}</span>
                  <span className="w-28">{slot.clinic.name}</span>
                  <span className="w-16">
                    {new Date(slot.startISO).toLocaleDateString('he-IL', { weekday: 'short' })}
                  </span>
                  <span className="w-24">{formatDate(slot.startISO)}</span>
                  <span className="w-16">{formatTime(slot.startISO)}</span>
                </div>
              ))
            )}
          </div>

          {selectedSlotId && (
            <div className="mt-1 text-[#00ffff] text-[12px]">
              נבחר: {consultantSlots.find((s) => s.id === selectedSlotId)?.doctorName} — {formatDate(consultantSlots.find((s) => s.id === selectedSlotId)!.startISO)} {formatTime(consultantSlots.find((s) => s.id === selectedSlotId)!.startISO)}
            </div>
          )}
        </>
      )}

      <div className="text-right text-gray-500 text-[11px] mt-2 mb-2">Bottom</div>

      {/* Function keys */}
      <div className="border-t border-gray-700 pt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] mt-auto">
        <button onClick={() => router.push(`/patient/${patientId}/appointments/book`)} className="hover:text-white">
          <span className="text-[#ff00ff]">F1</span><span className="text-[#33ff33]">=הסבר</span>
        </button>
        <span><span className="text-[#ff00ff]">F2</span><span className="text-[#33ff33]">=הרופאים</span></span>
        <button onClick={() => router.push(`/patient/${patientId}/appointments/book`)} className="hover:text-white">
          <span className="text-[#ff00ff]">F3</span><span className="text-[#33ff33]">=סיום</span>
        </button>
        <button onClick={handleSearch} className="hover:text-white">
          <span className="text-[#ff00ff]">F5</span><span className="text-[#33ff33]">=רענון</span>
        </button>
        <span><span className="text-[#ff00ff]">F7</span><span className="text-[#33ff33]">=מעבדה</span></span>
        <span><span className="text-[#ff00ff]">F8</span><span className="text-[#33ff33]">=מכונים</span></span>
        <span><span className="text-[#ff00ff]">F12</span><span className="text-[#33ff33]">=מסך קודם</span></span>
        <span><span className="text-[#ff00ff]">F13</span><span className="text-[#33ff33]">=מוצגים נוספים</span></span>
        {selectedSlotId && (
          <button onClick={handleBook} className="hover:text-white">
            <span className="text-[#ff00ff]">Enter</span><span className="text-[#00ffff]">=קביעת תור</span>
          </button>
        )}
      </div>
    </div>
  );
}
