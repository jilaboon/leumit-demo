'use client';

import { use, useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { formatDate, formatTime } from '@/lib/utils';
import { consultantSpecialties, consultantSlots } from '@/lib/mock-data';

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
        <span>מודול: רפואה יועצת</span>
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
      <div className="animate-fade-in">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-3">
          <button
            onClick={() => router.push(`/patient/${patientId}/appointments/book`)}
            className="hover:text-[#4472C4] underline"
          >
            זימון תור חדש
          </button>
          <span>&laquo;</span>
          <span className="text-gray-700 font-medium">רפואה יועצת</span>
        </div>

        <BossaToolbar />

        <div className="border border-green-700 bg-[#e8f5e9] p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 bg-green-600 text-white text-xs flex items-center justify-center font-bold">V</span>
            <h2 className="text-sm font-bold text-green-900">פעולה הושלמה — תור נקבע בהצלחה</h2>
          </div>
          <div className="border border-green-300 bg-white p-3 text-xs text-gray-700 leading-relaxed">
            {slot && (
              <>
                <p>
                  תור ל{slot.doctorName} ({slot.specialty}) נקבע בהצלחה
                  לתאריך {formatDate(slot.startISO)} בשעה {formatTime(slot.startISO)} ב{slot.clinic.name}
                </p>
                <p className="mt-1 text-gray-500">מספר אסמכתא: BN-{Date.now().toString().slice(-6)}</p>
              </>
            )}
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
        <span className="text-gray-700 font-medium">רפואה יועצת</span>
      </div>

      <BossaToolbar />

      {/* Search fieldset panel */}
      <div className="border border-gray-400 bg-[#f4f4f4] mb-3">
        <div className="bg-gradient-to-b from-[#d0d8e8] to-[#b8c4d8] px-3 py-1.5 border-b border-gray-400">
          <span className="text-[11px] font-bold text-[#2F5496]">פרמטרי חיפוש</span>
        </div>
        <div className="px-3 py-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
            {/* Specialty */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">התמחות:</label>
              <select
                value={specialty}
                onChange={(e) => {
                  setSpecialty(e.target.value);
                  setSubSpecialty('');
                }}
                className="w-full px-2 py-1 text-xs border border-gray-400 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#4472C4]"
              >
                <option value="">— בחר התמחות —</option>
                {consultantSpecialties.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-specialty */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">תת-התמחות:</label>
              <select
                value={subSpecialty}
                onChange={(e) => setSubSpecialty(e.target.value)}
                disabled={currentSubSpecialties.length === 0}
                className="w-full px-2 py-1 text-xs border border-gray-400 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#4472C4] disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">— הכל —</option>
                {currentSubSpecialties.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor name */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">שם רופא:</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="חיפוש לפי שם"
                className="w-full px-2 py-1 text-xs border border-gray-400 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#4472C4]"
              />
            </div>

            {/* Free text */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">חיפוש חופשי:</label>
              <input
                type="text"
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="מרפאה, עיר, התמחות..."
                className="w-full px-2 py-1 text-xs border border-gray-400 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#4472C4]"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="px-5 py-1.5 bg-[#4472C4] text-white text-xs font-medium border border-[#2F5496] hover:bg-[#3a64b0] transition-colors"
          >
            חיפוש
          </button>
        </div>
      </div>

      {/* Results data grid */}
      {hasSearched && (
        <div className="border border-gray-400 bg-white overflow-hidden">
          <div className="bg-[#4472C4] px-3 py-1.5 flex items-center justify-between">
            <span className="text-[11px] font-bold text-white">תוצאות חיפוש</span>
            <span className="text-[10px] text-blue-200">{results.length} רשומות</span>
          </div>

          {results.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-gray-500">
              לא נמצאו תוצאות. נסה לשנות את פרמטרי החיפוש.
            </div>
          ) : (
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#d6dce4]">
                  <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700 w-8">#</th>
                  <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700">רופא</th>
                  <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700">התמחות</th>
                  <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700">מרפאה</th>
                  <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700">יום</th>
                  <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700">תאריך</th>
                  <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700 w-16">שעה</th>
                </tr>
              </thead>
              <tbody>
                {results.map((slot, i) => (
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
                    <td className="px-2 py-1.5 border border-gray-300 text-gray-900 font-medium">{slot.doctorName}</td>
                    <td className="px-2 py-1.5 border border-gray-300 text-gray-600">{slot.specialty}</td>
                    <td className="px-2 py-1.5 border border-gray-300 text-gray-600">{slot.clinic.name}</td>
                    <td className="px-2 py-1.5 border border-gray-300 text-gray-700">
                      {new Date(slot.startISO).toLocaleDateString('he-IL', { weekday: 'short' })}
                    </td>
                    <td className="px-2 py-1.5 border border-gray-300 text-gray-900 font-medium">
                      {formatDate(slot.startISO)}
                    </td>
                    <td className="px-2 py-1.5 border border-gray-300 text-[#2F5496] font-bold">
                      {formatTime(slot.startISO)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Selection bar */}
          {selectedSlotId && (
            <div className="bg-[#e8ecf0] border-t border-gray-400 px-3 py-2 flex items-center justify-between">
              <div className="text-[11px] text-gray-600">
                נבחר: <span className="font-bold text-gray-900">
                  {consultantSlots.find((s) => s.id === selectedSlotId)?.doctorName} —{' '}
                  {formatDate(consultantSlots.find((s) => s.id === selectedSlotId)!.startISO)}{' '}
                  {formatTime(consultantSlots.find((s) => s.id === selectedSlotId)!.startISO)}
                </span>
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
      )}

      <BossaStatusBar branchName={patient.branch.name} />
    </div>
  );
}
