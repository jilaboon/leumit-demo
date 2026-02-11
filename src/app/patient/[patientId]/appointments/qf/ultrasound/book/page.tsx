'use client';

import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import EmptyState from '@/components/EmptyState';
import { formatDate, formatTime } from '@/lib/utils';
import { ultrasoundExamTypes } from '@/lib/mock-data';
import { AvailableSlot } from '@/types';

type SearchMode = 'code' | 'list' | 'text';

const DAYS_HE: { id: number; label: string }[] = [
  { id: 0, label: 'ראשון' },
  { id: 1, label: 'שני' },
  { id: 2, label: 'שלישי' },
  { id: 3, label: 'רביעי' },
  { id: 4, label: 'חמישי' },
  { id: 5, label: 'שישי' },
];

const HOUR_RANGES: { id: string; label: string; from: number; to: number }[] = [
  { id: 'morning', label: 'בוקר (08:00-12:00)', from: 8, to: 12 },
  { id: 'afternoon', label: 'צהריים (12:00-16:00)', from: 12, to: 16 },
  { id: 'evening', label: 'אחה"צ (16:00-20:00)', from: 16, to: 20 },
];

export default function BookPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const store = useStore();

  const [searchMode, setSearchMode] = useState<SearchMode>('code');
  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [rawResults, setRawResults] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [maxDistance, setMaxDistance] = useState(15);

  // Filters
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterDays, setFilterDays] = useState<number[]>([]);
  const [filterHours, setFilterHours] = useState<string[]>([]);

  const patient = store.getPatient(patientId);
  if (!patient) return null;

  const handleSearch = () => {
    const found = store.searchSlots(query, searchMode === 'code' ? 'code' : searchMode === 'list' ? 'list' : 'text');
    setRawResults(found);
    setSearchedQuery(query);
    setHasSearched(true);
    setSelectedSlot(null);
    setMaxDistance(15);
    setFilterCity('');
    setFilterDays([]);
    setFilterHours([]);
  };

  const handleListSelect = (examName: string) => {
    setQuery(examName);
    const found = store.searchSlots(examName, 'list');
    setRawResults(found);
    setSearchedQuery(examName);
    setHasSearched(true);
    setSelectedSlot(null);
    setMaxDistance(15);
    setFilterCity('');
    setFilterDays([]);
    setFilterHours([]);
  };

  const handleExpandSearch = () => {
    setMaxDistance((prev) => prev + 15);
  };

  // Derive exam name for header
  const examName = useMemo(() => {
    if (rawResults.length > 0) return rawResults[0].serviceName;
    if (searchMode === 'list') return searchedQuery;
    const match = ultrasoundExamTypes.find(
      (e) => e.code.toLowerCase() === searchedQuery.trim().toLowerCase() || e.name === searchedQuery
    );
    return match?.name || searchedQuery;
  }, [rawResults, searchedQuery, searchMode]);

  // Available cities from results
  const availableCities = useMemo(() => {
    const cities = [...new Set(rawResults.map((s) => s.clinic.city))];
    return cities.sort();
  }, [rawResults]);

  // Filtered & sorted results
  const results = useMemo(() => {
    let filtered = rawResults.filter((s) => (s.distanceKm ?? 0) <= maxDistance);

    if (filterCity) {
      filtered = filtered.filter((s) => s.clinic.city === filterCity);
    }

    if (filterDays.length > 0) {
      filtered = filtered.filter((s) => {
        const day = new Date(s.startISO).getDay();
        return filterDays.includes(day);
      });
    }

    if (filterHours.length > 0) {
      filtered = filtered.filter((s) => {
        const hour = new Date(s.startISO).getHours();
        return filterHours.some((id) => {
          const range = HOUR_RANGES.find((r) => r.id === id);
          return range && hour >= range.from && hour < range.to;
        });
      });
    }

    return filtered.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
  }, [rawResults, maxDistance, filterCity, filterDays, filterHours]);

  const hasMoreResults = rawResults.some((s) => (s.distanceKm ?? 0) > maxDistance);

  const handleContinue = () => {
    if (!selectedSlot) return;
    sessionStorage.setItem('selectedSlot', JSON.stringify(selectedSlot));
    router.push(`/patient/${patientId}/appointments/qf/ultrasound/confirm`);
  };

  const searchModes: { id: SearchMode; label: string; icon: string }[] = [
    { id: 'code', label: 'קוד טיפול', icon: '🔢' },
    { id: 'list', label: 'בחירה מרשימה', icon: '📋' },
    { id: 'text', label: 'חיפוש חופשי', icon: '🔍' },
  ];

  const toggleDay = (day: number) => {
    setFilterDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const toggleHours = (id: string) => {
    setFilterHours((prev) => (prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]));
  };

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button onClick={() => router.push(`/patient/${patientId}/appointments/book`)} className="hover:text-teal-600 transition-colors">
          זימון תור חדש
        </button>
        <span>←</span>
        <span className="text-gray-900 font-medium">חיפוש תור אולטרסאונד</span>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-6">חיפוש תור אולטרסאונד</h2>

      {/* Search Mode Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex gap-2 mb-5">
          {searchModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setSearchMode(mode.id);
                setQuery('');
                setRawResults([]);
                setHasSearched(false);
                setSelectedSlot(null);
              }}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${searchMode === mode.id
                  ? 'bg-teal-50 text-teal-700 border-2 border-teal-200'
                  : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                }
              `}
            >
              <span>{mode.icon}</span>
              {mode.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        {searchMode === 'code' && (
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder='הקלד קוד טיפול - לדוגמה: "US-101"'
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              dir="ltr"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              חיפוש
            </button>
          </div>
        )}

        {searchMode === 'list' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ultrasoundExamTypes.map((exam) => (
              <button
                key={exam.code}
                onClick={() => handleListSelect(exam.name)}
                className={`
                  px-4 py-3 rounded-xl text-sm font-medium text-right transition-all border-2
                  ${query === exam.name
                    ? 'bg-teal-50 border-teal-300 text-teal-700'
                    : 'bg-gray-50 border-transparent hover:bg-teal-50 hover:border-teal-200 text-gray-700'
                  }
                `}
              >
                <div>{exam.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{exam.code}</div>
              </button>
            ))}
          </div>
        )}

        {searchMode === 'text' && (
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder='חיפוש חופשי - לדוגמה: "בטן", "שד", "תירואיד"...'
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              חיפוש
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header with exam name */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              תוצאות חיפוש — <span className="text-teal-700">{examName}</span>
            </h3>
            <span className="text-xs text-gray-400">{results.length} תורים זמינים</span>
          </div>

          {/* Filters */}
          {rawResults.length > 0 && (
            <div className="px-5 py-3 border-b border-gray-100 space-y-3">
              <div className="flex flex-wrap items-center gap-4">
                {/* City filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">עיר:</span>
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="">הכל</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Day filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-500">יום:</span>
                  {DAYS_HE.map((day) => (
                    <button
                      key={day.id}
                      onClick={() => toggleDay(day.id)}
                      className={`text-xs px-2 py-1 rounded-md transition-all ${
                        filterDays.includes(day.id)
                          ? 'bg-teal-100 text-teal-700 font-medium'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>

                {/* Hour range filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-500">שעות:</span>
                  {HOUR_RANGES.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => toggleHours(range.id)}
                      className={`text-xs px-2 py-1 rounded-md transition-all ${
                        filterHours.includes(range.id)
                          ? 'bg-teal-100 text-teal-700 font-medium'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active filter indicators */}
              {(filterCity || filterDays.length > 0 || filterHours.length > 0) && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">סינון פעיל</span>
                  <button
                    onClick={() => { setFilterCity(''); setFilterDays([]); setFilterHours([]); }}
                    className="text-[11px] text-red-500 hover:text-red-700 underline"
                  >
                    נקה הכל
                  </button>
                </div>
              )}
            </div>
          )}

          {results.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon="🔍"
                title="לא נמצאו תורים"
                description="נסה לשנות את הסינון או להרחיב את טווח החיפוש"
              />
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 px-5 py-2.5 border-b border-gray-100 text-xs font-medium text-gray-500">
                <span>מרפאה</span>
                <span>כתובת</span>
                <span className="w-14 text-center">יום</span>
                <span className="w-20 text-center">תאריך</span>
                <span className="w-16 text-center">שעה</span>
                <span className="w-16 text-center">מרחק</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-50">
                {results.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`
                      w-full px-5 py-3.5 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-2 sm:gap-4 items-center text-right transition-all
                      ${selectedSlot?.id === slot.id
                        ? 'bg-teal-50 border-r-4 border-teal-500'
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    {/* Clinic name */}
                    <div className="text-sm font-semibold text-gray-900">{slot.clinic.name}</div>

                    {/* City / Address */}
                    <div className="text-sm text-gray-600">{slot.clinic.city}</div>

                    {/* Day */}
                    <div className="w-14 text-center text-sm text-gray-600">
                      {new Date(slot.startISO).toLocaleDateString('he-IL', { weekday: 'short' })}
                    </div>

                    {/* Date */}
                    <div className="w-20 text-center text-sm font-medium text-gray-900">{formatDate(slot.startISO)}</div>

                    {/* Time */}
                    <div className="w-16 text-center text-sm text-teal-600 font-medium">{formatTime(slot.startISO)}</div>

                    {/* Distance */}
                    <div className="w-16 text-center text-xs text-gray-400">
                      {slot.distanceKm !== undefined ? `${slot.distanceKm} ק"מ` : '—'}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Expand search button */}
          {hasMoreResults && (
            <div className="px-5 py-4 border-t border-gray-100 flex justify-center">
              <button
                onClick={handleExpandSearch}
                className="px-6 py-2.5 bg-white border-2 border-teal-200 text-teal-700 rounded-xl text-sm font-medium hover:bg-teal-50 transition-colors"
              >
                הרחבת חיפוש (מרחק גדול יותר)
              </button>
            </div>
          )}

          {/* Continue button */}
          {selectedSlot && (
            <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                נבחר: <span className="font-medium text-gray-900">{selectedSlot.clinic.name}</span> ב-{formatDate(selectedSlot.startISO)} {formatTime(selectedSlot.startISO)}
              </div>
              <button
                onClick={handleContinue}
                className="px-8 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                המשך ←
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
