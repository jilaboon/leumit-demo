'use client';

import { use, useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { formatDate, formatTime } from '@/lib/utils';
import { instituteTypes, instituteSlots } from '@/lib/mock-data';

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
        <span>מודול: מכונים</span>
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

export default function InstitutesSearchPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  return (
    <Suspense>
      <InstitutesSearchInner params={params} />
    </Suspense>
  );
}

function InstitutesSearchInner({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useStore();
  const patient = store.getPatient(patientId);

  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Pre-fill from query param (e.g., from referrals page)
  const prefillSearch = searchParams.get('search');
  useEffect(() => {
    if (!prefillSearch) return;
    setQuery(prefillSearch);
    setHasSearched(true);
    setShowSuggestions(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillSearch]);

  if (!patient) return null;

  const suggestions = useMemo(() => {
    if (!query.trim()) return instituteTypes;
    return instituteTypes.filter((t) => t.name.includes(query.trim()));
  }, [query]);

  const isUltrasoundSearch = (term: string) => {
    const normalized = term.trim();
    return normalized.includes('אולטרסאונד') || normalized.includes('אולטראסאונד') || normalized.includes('על-קול') || normalized.includes('על קול');
  };

  const handleSearch = (searchTerm?: string) => {
    const term = searchTerm || query;
    if (isUltrasoundSearch(term)) {
      router.push(`/patient/${patientId}/appointments/qf/ultrasound/book?prefill=${encodeURIComponent(term)}`);
      return;
    }
    setHasSearched(true);
    setSelectedSlotId(null);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (name: string) => {
    setQuery(name);
    setShowSuggestions(false);
    if (isUltrasoundSearch(name)) {
      router.push(`/patient/${patientId}/appointments/qf/ultrasound/book?prefill=${encodeURIComponent(name)}`);
      return;
    }
    setHasSearched(true);
    setSelectedSlotId(null);
  };

  const results = useMemo(() => {
    if (!hasSearched) return [];
    const q = query.trim();
    if (!q) return instituteSlots;
    return instituteSlots.filter(
      (s) =>
        s.instituteName.includes(q) ||
        s.code.toLowerCase().includes(q.toLowerCase()) ||
        s.clinic.name.includes(q) ||
        s.clinic.city.includes(q)
    );
  }, [hasSearched, query]);

  const handleBook = () => {
    setBooked(true);
  };

  if (booked) {
    const slot = instituteSlots.find((s) => s.id === selectedSlotId);
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
          <span className="text-gray-700 font-medium">מכונים</span>
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
                  תור ל{slot.instituteName} נקבע בהצלחה
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
        <span className="text-gray-700 font-medium">מכונים</span>
      </div>

      <BossaToolbar />

      {/* Search fieldset panel */}
      <div className="border border-gray-400 bg-[#f4f4f4] mb-3">
        <div className="bg-gradient-to-b from-[#d0d8e8] to-[#b8c4d8] px-3 py-1.5 border-b border-gray-400">
          <span className="text-[11px] font-bold text-[#2F5496]">חיפוש בדיקה / מכון</span>
        </div>
        <div className="px-3 py-2">
          <div className="relative">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder='הקלד שם בדיקה - לדוגמה: "רנטגן", "הולטר", "אולטרסאונד"...'
                className="flex-1 px-2 py-1 text-xs border border-gray-400 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#4472C4]"
              />
              <button
                onClick={() => handleSearch()}
                className="px-5 py-1 bg-[#4472C4] text-white text-xs font-medium border border-[#2F5496] hover:bg-[#3a64b0] transition-colors"
              >
                חיפוש
              </button>
            </div>

            {/* Autocomplete suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 top-full mt-0.5 left-0 right-16 bg-white border border-gray-400 shadow-md overflow-hidden">
                {suggestions.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleSuggestionClick(type.name)}
                    className="w-full px-3 py-1.5 flex items-center justify-between text-right hover:bg-[#e8f0ff] transition-colors text-xs border-b border-gray-200 last:border-b-0"
                  >
                    <span className="text-gray-900">{type.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{type.code}</span>
                  </button>
                ))}
                {/* Ultrasound QF option */}
                <button
                  onClick={() => handleSuggestionClick('אולטרסאונד')}
                  className="w-full px-3 py-1.5 flex items-center justify-between text-right hover:bg-[#e8f5f0] transition-colors text-xs border-t border-gray-300 bg-[#f0f8f4]"
                >
                  <span className="text-teal-700 font-medium">אולטרסאונד</span>
                  <span className="text-[10px] text-teal-500 font-medium">QF &larr;</span>
                </button>
              </div>
            )}
          </div>
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
              לא נמצאו תוצאות. נסה לחפש בדיקה אחרת.
            </div>
          ) : (
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#d6dce4]">
                  <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700 w-8">#</th>
                  <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700">בדיקה</th>
                  <th className="text-right px-2 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-700 w-20">קוד</th>
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
                    <td className="px-2 py-1.5 border border-gray-300 text-gray-900 font-medium">{slot.instituteName}</td>
                    <td className="px-2 py-1.5 border border-gray-300 text-gray-600 font-mono">{slot.code}</td>
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
                  {instituteSlots.find((s) => s.id === selectedSlotId)?.instituteName} —{' '}
                  {formatDate(instituteSlots.find((s) => s.id === selectedSlotId)!.startISO)}{' '}
                  {formatTime(instituteSlots.find((s) => s.id === selectedSlotId)!.startISO)}
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
