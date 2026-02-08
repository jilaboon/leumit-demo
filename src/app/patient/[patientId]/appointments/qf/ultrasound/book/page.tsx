'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import { formatDate, formatTime } from '@/lib/utils';
import { ultrasoundExamTypes } from '@/lib/mock-data';
import { AvailableSlot } from '@/types';

type SearchMode = 'text' | 'list' | 'code';

export default function BookPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const store = useStore();

  const [searchMode, setSearchMode] = useState<SearchMode>('text');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const patient = store.getPatient(patientId);
  if (!patient) return null;

  const handleSearch = () => {
    const found = store.searchSlots(query, searchMode);
    setResults(found);
    setHasSearched(true);
    setSelectedSlot(null);
  };

  const handleListSelect = (examName: string) => {
    setQuery(examName);
    const found = store.searchSlots(examName, 'list');
    setResults(found);
    setHasSearched(true);
    setSelectedSlot(null);
  };

  const handleContinue = () => {
    if (!selectedSlot) return;
    // Store selected slot in sessionStorage for confirm page
    sessionStorage.setItem('selectedSlot', JSON.stringify(selectedSlot));
    router.push(`/patient/${patientId}/appointments/qf/ultrasound/confirm`);
  };

  const searchModes: { id: SearchMode; label: string; icon: string }[] = [
    { id: 'text', label: 'חיפוש חופשי', icon: '🔍' },
    { id: 'list', label: 'בחירה מרשימה', icon: '📋' },
    { id: 'code', label: 'קוד טיפול', icon: '🔢' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button onClick={() => router.push(`/patient/${patientId}/appointments`)} className="hover:text-teal-600 transition-colors">
          מבט 360°
        </button>
        <span>←</span>
        <button onClick={() => router.push(`/patient/${patientId}/appointments/book`)} className="hover:text-teal-600 transition-colors">
          מרכז זימון תורים
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
                setResults([]);
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
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">תוצאות חיפוש</h3>
            <span className="text-xs text-gray-400">{results.length} תורים זמינים</span>
          </div>

          {results.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon="🔍"
                title="לא נמצאו תורים"
                description="נסה לשנות את החיפוש או להרחיב את טווח התאריכים"
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {results.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`
                    w-full px-5 py-4 flex items-center gap-4 text-right transition-all
                    ${selectedSlot?.id === slot.id
                      ? 'bg-teal-50 border-r-4 border-teal-500'
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  {/* Date/Time */}
                  <div className="w-24 flex-shrink-0">
                    <div className="text-sm font-bold text-gray-900">{formatDate(slot.startISO)}</div>
                    <div className="text-sm text-teal-600 font-medium">{formatTime(slot.startISO)}</div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900">{slot.serviceName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {slot.clinic.name} • {slot.clinic.city}
                    </div>
                  </div>

                  {/* Provider */}
                  <div className="text-sm text-gray-600">
                    {slot.providerName}
                  </div>

                  {/* Distance */}
                  {slot.distanceKm !== undefined && (
                    <div className="text-xs text-gray-400 w-16 text-center">
                      {slot.distanceKm} ק&quot;מ
                    </div>
                  )}

                  {/* Availability badge */}
                  <Badge status="Scheduled" className="flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Continue button */}
          {selectedSlot && (
            <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                נבחר: <span className="font-medium text-gray-900">{selectedSlot.serviceName}</span> ב-{formatDate(selectedSlot.startISO)} {formatTime(selectedSlot.startISO)}
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
