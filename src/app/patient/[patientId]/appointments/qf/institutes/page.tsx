'use client';

import { use, useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { instituteTypes } from '@/lib/mock-data';

// All searchable services — includes both QF and S400 services
const allServices = [
  ...instituteTypes.map((t) => ({ ...t, system: 's400' as const })),
  { id: 'ultrasound', name: 'אולטרסאונד', code: 'US-700', system: 'qf' as const },
  { id: 'ultrasound-gyn', name: 'אולטרסאונד גינקולוגי', code: 'US-701', system: 'qf' as const },
  { id: 'ultrasound-abd', name: 'אולטרסאונד בטן', code: 'US-702', system: 'qf' as const },
  { id: 'ultrasound-preg', name: 'אולטרסאונד הריון', code: 'US-703', system: 'qf' as const },
];

export default function InstitutesSearchPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const store = useStore();
  const patient = store.getPatient(patientId);

  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (!query.trim()) return allServices;
    const q = query.trim();
    return allServices.filter(
      (s) =>
        s.name.includes(q) ||
        s.code.toLowerCase().includes(q.toLowerCase())
    );
  }, [query]);

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  if (!patient) return null;

  const navigateToService = (service: typeof allServices[0]) => {
    setShowSuggestions(false);
    if (service.system === 'qf') {
      // QF-supported → go to QF ultrasound booking with pre-fill
      router.push(
        `/patient/${patientId}/appointments/qf/ultrasound/book?prefill=${encodeURIComponent(service.name)}`
      );
    } else {
      // Legacy → go to S400 Bossa Nova institutes
      router.push(
        `/patient/${patientId}/appointments/s400/institutes?search=${encodeURIComponent(service.name)}`
      );
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    // Check if query matches a QF service
    const isUltrasound =
      query.includes('אולטרסאונד') ||
      query.includes('אולטראסאונד') ||
      query.includes('על-קול') ||
      query.includes('על קול');

    if (isUltrasound) {
      router.push(
        `/patient/${patientId}/appointments/qf/ultrasound/book?prefill=${encodeURIComponent(query)}`
      );
    } else {
      router.push(
        `/patient/${patientId}/appointments/s400/institutes?search=${encodeURIComponent(query)}`
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') handleSearch();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        navigateToService(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button
          onClick={() => router.push(`/patient/${patientId}/appointments/book`)}
          className="hover:text-teal-600 transition-colors"
        >
          זימון תור חדש
        </button>
        <span>&larr;</span>
        <span className="text-gray-900 font-medium">מכונים</span>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">חיפוש מכונים ובדיקות</h2>
      <p className="text-sm text-gray-500 mb-6">הקלד שם בדיקה או מכון — המערכת תנתב אותך למסך המתאים</p>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">חיפוש בדיקה / מכון</label>
        <div className="relative">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder='הקלד שם בדיקה — לדוגמה: "רנטגן", "הולטר", "אולטרסאונד"...'
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              autoFocus
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              חיפוש
            </button>
          </div>

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={listRef}
              className="absolute z-20 top-full mt-1 left-0 right-14 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-80 overflow-y-auto"
            >
              {suggestions.map((svc, i) => {
                const isQF = svc.system === 'qf';
                return (
                  <button
                    key={svc.id}
                    onClick={() => navigateToService(svc)}
                    className={`
                      w-full px-4 py-3 flex items-center justify-between text-right transition-colors
                      ${i === selectedIndex ? (isQF ? 'bg-teal-50' : 'bg-blue-50') : 'hover:bg-gray-50'}
                      ${i > 0 ? 'border-t border-gray-50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isQF ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {isQF ? 'QF' : 'S4'}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{svc.name}</div>
                        <div className="text-xs text-gray-400">{svc.code}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isQF && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
                          זימון מהיר
                        </span>
                      )}
                      <span className="text-gray-300">&larr;</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-3">
          שירותים הזמינים בזימון מהיר (QF) יועברו ישירות למסך זימון חדש. שירותים אחרים יועברו למערכת הקיימת.
        </p>
      </div>

      {/* Quick access tiles */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">גישה מהירה</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {allServices.map((svc) => {
            const isQF = svc.system === 'qf';
            // Only show one ultrasound tile
            if (svc.id.startsWith('ultrasound-')) return null;
            return (
              <button
                key={svc.id}
                onClick={() => navigateToService(svc)}
                className={`
                  p-4 rounded-xl border text-right transition-all hover:shadow-sm
                  ${isQF
                    ? 'border-teal-200 bg-teal-50 hover:bg-teal-100'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                  }
                `}
              >
                <div className="text-sm font-medium text-gray-900">{svc.name}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-gray-400">{svc.code}</span>
                  {isQF ? (
                    <span className="text-[10px] font-medium text-teal-600">QF</span>
                  ) : (
                    <span className="text-[10px] font-medium text-gray-400">S400</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
