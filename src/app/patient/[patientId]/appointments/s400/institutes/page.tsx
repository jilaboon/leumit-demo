'use client';

import { use, useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { formatDate, formatTime } from '@/lib/utils';
import { instituteTypes, instituteSlots } from '@/lib/mock-data';

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
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button
            onClick={() => router.push(`/patient/${patientId}/appointments/book`)}
            className="hover:text-blue-600 transition-colors"
          >
            זימון תור חדש
          </button>
          <span>←</span>
          <span className="text-gray-900 font-medium">מכונים</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">&#x2705;</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">תור נקבע בהצלחה</h2>
          {slot && (
            <p className="text-sm text-gray-600 mb-6">
              תור ל{slot.instituteName} נקבע לתאריך {formatDate(slot.startISO)} בשעה {formatTime(slot.startISO)} ב{slot.clinic.name}
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
        <span className="text-gray-900 font-medium">מכונים</span>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-6">חיפוש תור — מכונים</h2>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">חיפוש בדיקה / מכון</label>
        <div className="relative">
          <div className="flex gap-3">
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
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => handleSearch()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              חיפוש
            </button>
          </div>

          {/* Autocomplete suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 top-full mt-1 left-0 right-12 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {suggestions.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleSuggestionClick(type.name)}
                  className="w-full px-4 py-3 flex items-center justify-between text-right hover:bg-blue-50 transition-colors"
                >
                  <span className="text-sm text-gray-900">{type.name}</span>
                  <span className="text-xs text-gray-400">{type.code}</span>
                </button>
              ))}
              {/* Always show ultrasound as an option */}
              <button
                onClick={() => handleSuggestionClick('אולטרסאונד')}
                className="w-full px-4 py-3 flex items-center justify-between text-right hover:bg-teal-50 transition-colors border-t border-gray-100"
              >
                <span className="text-sm text-teal-700 font-medium">אולטרסאונד</span>
                <span className="text-xs text-teal-500">QF &larr;</span>
              </button>
            </div>
          )}
        </div>
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
              <p className="text-sm text-gray-500 max-w-sm">נסה לחפש בדיקה אחרת</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-2.5 border-b border-gray-100 text-xs font-medium text-gray-500">
                <span>בדיקה</span>
                <span className="w-32 text-center">מרפאה</span>
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
                      w-full px-5 py-3.5 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-2 sm:gap-4 items-center text-right transition-all
                      ${selectedSlotId === slot.id
                        ? 'bg-blue-50 border-r-4 border-blue-500'
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{slot.instituteName}</div>
                      <div className="text-xs text-gray-400">{slot.code}</div>
                    </div>
                    <div className="w-32 text-center text-sm text-gray-600">{slot.clinic.name}</div>
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
                  {instituteSlots.find((s) => s.id === selectedSlotId)?.instituteName} —{' '}
                  {formatDate(instituteSlots.find((s) => s.id === selectedSlotId)!.startISO)}{' '}
                  {formatTime(instituteSlots.find((s) => s.id === selectedSlotId)!.startISO)}
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
