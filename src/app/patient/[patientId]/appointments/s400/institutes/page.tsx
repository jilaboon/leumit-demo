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
  const fromReferrals = searchParams.get('from') === 'referrals';
  useEffect(() => {
    if (!prefillSearch) return;
    setQuery(prefillSearch);
    setHasSearched(true);
    setShowSuggestions(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillSearch]);

  if (!patient) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

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
      <div className="bg-black min-h-screen font-mono text-base p-4 rounded-sm">
        {/* System header */}
        <div className="flex justify-between mb-0">
          <span className="text-white">{dateStr}  M800SMIRI</span>
          <span className="text-[#33ff33]">לאומית שרותי בריאות</span>
        </div>
        <div className="flex justify-between mb-3">
          <span className="text-white">{timeStr}  LEU201R1</span>
          <span className="text-[#33ff33]">זימון תור לבדיקה — תצוגת מכונים</span>
        </div>

        <div className="my-8">
          <div className="text-[#33ff33] text-center mb-4">
            *** פעולה הושלמה בהצלחה ***
          </div>
          {slot && (
            <>
              <div className="text-[#33ff33] text-center mb-2">
                תור ל{slot.instituteName} נקבע בהצלחה
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

        <div className="border-t border-gray-700 pt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs mt-8">
          <button onClick={() => router.push(fromReferrals ? `/patient/${patientId}/referrals` : `/patient/${patientId}/appointments/book`)} className="hover:text-white">
            <span className="text-[#ff00ff]">F3</span><span className="text-[#33ff33]">{fromReferrals ? '=חזרה להפניות' : '=חזרה לזימון'}</span>
          </button>
          <button onClick={() => router.push(fromReferrals ? `/patient/${patientId}/referrals` : `/patient/${patientId}/appointments/book`)} className="hover:text-white">
            <span className="text-[#ff00ff]">Enter</span><span className="text-[#33ff33]">=המשך</span>
          </button>
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
        <span className="text-white">{timeStr}  LEU201R1</span>
        <span className="text-[#33ff33]">זימון תור לבדיקה — תצוגת מכונים</span>
      </div>

      {/* Patient info bar */}
      <div className="bg-[#ff00ff] text-black px-2 py-0.5 mb-2 flex justify-between text-sm">
        <span>ת.ז: {patient.id.replace('P', '58383838')}-8  שם מטופל: {patient.firstName} {patient.lastName}</span>
        <span>גיל: {patient.age}  ח/נ: קופה</span>
      </div>

      {/* Search */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[#ff00ff]">חיפוש לפי תאור מכון.:</span>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-black text-[#33ff33] border border-[#33ff33] px-2 py-0.5 text-sm font-mono w-64 focus:outline-none focus:border-[#00ffff]"
            />

            {/* Autocomplete suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 top-full mt-0 left-0 w-64 bg-black border border-[#33ff33] max-h-48 overflow-y-auto">
                {suggestions.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleSuggestionClick(type.name)}
                    className="w-full px-2 py-0.5 flex items-center justify-between text-right text-sm text-[#33ff33] hover:bg-[#008080] hover:text-black font-mono"
                  >
                    <span>{type.name}</span>
                    <span className="text-gray-500">{type.code}</span>
                  </button>
                ))}
                {/* Ultrasound QF option */}
                <button
                  onClick={() => handleSuggestionClick('אולטרסאונד')}
                  className="w-full px-2 py-0.5 flex items-center justify-between text-right text-sm text-[#00ffff] hover:bg-[#008080] hover:text-black font-mono border-t border-gray-700"
                >
                  <span>אולטרסאונד</span>
                  <span className="text-[#00ffff]">QF &larr;</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[#ff00ff]">ישוב.......:</span>
          <span className="text-[#33ff33]">{patient.branch.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#ff00ff]">שרות נלווה:</span>
          <span className="text-[#33ff33]">+</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-[#00ffff] mb-1 text-sm">
        {hasSearched
          ? `בחר מכון, הקש Enter.`
          : 'בחר מכון, הקש Enter.'}
      </div>
      <div className="text-[#ff00ff] mb-2 text-xs">
        1=בארה  5=רשימת זימונים למכון
      </div>

      {/* Results */}
      {hasSearched && (
        <>
          <div className="text-white text-sm mb-1">תאור מכון</div>

          {/* Table header */}
          <div className="bg-[#008080] text-black px-1 py-0.5 mb-0 text-sm font-bold flex">
            <span className="w-44">תאור מכון</span>
            <span className="w-16">קוד</span>
            <span className="w-24">סניף</span>
            <span className="w-16">אזור</span>
            <span className="w-24">שרות נלווה</span>
            <span className="w-24">תאריך</span>
            <span className="w-14">שעה</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {results.length === 0 ? (
              <div className="text-yellow-400 py-4 text-center text-sm">
                לא נמצאו תוצאות.
              </div>
            ) : (
              results.map((slot, i) => (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`px-1 py-0.5 flex cursor-pointer text-sm ${
                    selectedSlotId === slot.id
                      ? 'bg-[#008080] text-black font-bold'
                      : 'text-[#33ff33] hover:bg-gray-900'
                  }`}
                >
                  <span className="w-44">{slot.instituteName}</span>
                  <span className="w-16">{slot.code}</span>
                  <span className="w-24">{slot.clinic.name}</span>
                  <span className="w-16">{slot.clinic.city}</span>
                  <span className="w-24">רחובות</span>
                  <span className="w-24">{formatDate(slot.startISO)}</span>
                  <span className="w-14">{formatTime(slot.startISO)}</span>
                </div>
              ))
            )}
          </div>

          {selectedSlotId && (
            <div className="mt-1 text-[#00ffff] text-sm">
              נבחר: {instituteSlots.find((s) => s.id === selectedSlotId)?.instituteName} — {formatDate(instituteSlots.find((s) => s.id === selectedSlotId)!.startISO)} {formatTime(instituteSlots.find((s) => s.id === selectedSlotId)!.startISO)}
            </div>
          )}
        </>
      )}

      <div className="text-right text-gray-500 text-xs mt-2 mb-2">Bottom</div>

      {/* Function keys */}
      <div className="border-t border-gray-700 pt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs mt-auto">
        <button onClick={() => router.push(`/patient/${patientId}/appointments/book`)} className="hover:text-white">
          <span className="text-[#ff00ff]">F1</span><span className="text-[#33ff33]">=הסבר</span>
        </button>
        <button onClick={() => router.push(fromReferrals ? `/patient/${patientId}/referrals` : `/patient/${patientId}/appointments/book`)} className="hover:text-white">
          <span className="text-[#ff00ff]">F3</span><span className="text-[#33ff33]">{fromReferrals ? '=חזרה להפניות' : '=סיום'}</span>
        </button>
        <span><span className="text-[#ff00ff]">F4</span><span className="text-[#33ff33]">=חלון</span></span>
        <button onClick={() => handleSearch()} className="hover:text-white">
          <span className="text-[#ff00ff]">F5</span><span className="text-[#33ff33]">=רענון</span>
        </button>
        <span><span className="text-[#ff00ff]">F7</span><span className="text-[#33ff33]">=מעבדה</span></span>
        <span><span className="text-[#ff00ff]">F8</span><span className="text-[#33ff33]">=הפניות למכונות</span></span>
        <span><span className="text-[#ff00ff]">F11</span><span className="text-[#33ff33]">=פרטים נוספים</span></span>
        <span><span className="text-[#ff00ff]">F12</span><span className="text-[#33ff33]">=מסך קודם</span></span>
        <span><span className="text-[#ff00ff]">F21</span><span className="text-[#33ff33]">=מרחב</span></span>
        {selectedSlotId && (
          <button onClick={handleBook} className="hover:text-white">
            <span className="text-[#ff00ff]">Enter</span><span className="text-[#00ffff]">=קביעת תור</span>
          </button>
        )}
      </div>
    </div>
  );
}
