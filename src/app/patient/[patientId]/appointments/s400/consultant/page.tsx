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
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button
            onClick={() => router.push(`/patient/${patientId}/appointments/book`)}
            className="hover:text-blue-600 transition-colors"
          >
            זימון תור חדש
          </button>
          <span>←</span>
          <span className="text-gray-900 font-medium">רפואה יועצת</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">&#x2705;</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">תור נקבע בהצלחה</h2>
          {slot && (
            <p className="text-sm text-gray-600 mb-6">
              תור ל{slot.doctorName} ({slot.specialty}) נקבע לתאריך {formatDate(slot.startISO)} בשעה {formatTime(slot.startISO)} ב{slot.clinic.name}
            </p>
          )}
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
        <span className="text-gray-900 font-medium">רפואה יועצת</span>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-6">חיפוש תור — רפואה יועצת</h2>

      {/* Search section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Specialty dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">התמחות</label>
            <select
              value={specialty}
              onChange={(e) => {
                setSpecialty(e.target.value);
                setSubSpecialty('');
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">בחר התמחות</option>
              {consultantSpecialties.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-specialty */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">תת-התמחות</label>
            <select
              value={subSpecialty}
              onChange={(e) => setSubSpecialty(e.target.value)}
              disabled={currentSubSpecialties.length === 0}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">הכל</option>
              {currentSubSpecialties.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">שם רופא</label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="חיפוש לפי שם"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Free text */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">חיפוש חופשי</label>
            <input
              type="text"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="מרפאה, עיר, התמחות..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          חיפוש
        </button>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-blue-50 flex items-center justify-between">
            <h3 className="text-base font-semibold text-blue-900">תוצאות חיפוש</h3>
            <span className="text-xs text-blue-600">{results.length} תורים זמינים</span>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <span className="text-4xl mb-4">&#x1F50D;</span>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">לא נמצאו תוצאות</h3>
              <p className="text-sm text-gray-500 max-w-sm">נסה לשנות את פרמטרי החיפוש</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-2.5 border-b border-gray-100 text-xs font-medium text-gray-500">
                <span>רופא</span>
                <span className="w-28 text-center">התמחות</span>
                <span className="w-28 text-center">מרפאה</span>
                <span className="w-14 text-center">יום</span>
                <span className="w-20 text-center">תאריך</span>
                <span className="w-16 text-center">שעה</span>
              </div>

              <div className="divide-y divide-gray-50">
                {results.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`
                      w-full px-5 py-3.5 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 sm:gap-4 items-center text-right transition-all
                      ${selectedSlotId === slot.id
                        ? 'bg-blue-50 border-r-4 border-blue-500'
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="text-sm font-semibold text-gray-900">{slot.doctorName}</div>
                    <div className="w-28 text-center text-xs text-gray-600">{slot.specialty}</div>
                    <div className="w-28 text-center text-sm text-gray-600">{slot.clinic.name}</div>
                    <div className="w-14 text-center text-sm text-gray-600">
                      {new Date(slot.startISO).toLocaleDateString('he-IL', { weekday: 'short' })}
                    </div>
                    <div className="w-20 text-center text-sm font-medium text-gray-900">
                      {formatDate(slot.startISO)}
                    </div>
                    <div className="w-16 text-center text-sm text-blue-600 font-medium">
                      {formatTime(slot.startISO)}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Book button */}
          {selectedSlotId && (
            <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                נבחר:{' '}
                <span className="font-medium text-gray-900">
                  {consultantSlots.find((s) => s.id === selectedSlotId)?.doctorName} —{' '}
                  {formatDate(consultantSlots.find((s) => s.id === selectedSlotId)!.startISO)}{' '}
                  {formatTime(consultantSlots.find((s) => s.id === selectedSlotId)!.startISO)}
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
      )}
    </div>
  );
}
