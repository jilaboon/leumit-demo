'use client';

import { use, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { institutes, Institute, InstituteService } from '@/lib/mock-data';

// Build a flat list of all services for smart search
const allServices = institutes.flatMap((inst) =>
  inst.services.map((svc) => ({ ...svc, instituteName: inst.name, instituteId: inst.id }))
);

export default function InstitutesSearchPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const store = useStore();
  const patient = store.getPatient(patientId);

  const [selectedInstituteId, setSelectedInstituteId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [smartQuery, setSmartQuery] = useState('');
  const [showSmartResults, setShowSmartResults] = useState(false);
  const smartRef = useRef<HTMLInputElement>(null);

  if (!patient) return null;

  // Current institute and its services
  const currentInstitute = institutes.find((i) => i.id === selectedInstituteId);
  const filteredServices = useMemo(() => {
    if (!currentInstitute) return [];
    if (!serviceFilter.trim()) return currentInstitute.services;
    const q = serviceFilter.trim();
    return currentInstitute.services.filter(
      (s) => s.name.includes(q) || s.code.toLowerCase().includes(q.toLowerCase())
    );
  }, [currentInstitute, serviceFilter]);

  const selectedService = currentInstitute?.services.find((s) => s.id === selectedServiceId);

  // Smart search results
  const smartResults = useMemo(() => {
    if (!smartQuery.trim()) return [];
    const q = smartQuery.trim();
    return allServices.filter(
      (s) =>
        s.name.includes(q) ||
        s.code.toLowerCase().includes(q.toLowerCase()) ||
        s.instituteName.includes(q)
    );
  }, [smartQuery]);

  const navigateToService = (service: InstituteService) => {
    if (!service.available) return;
    if (service.system === 'qf') {
      router.push(
        `/patient/${patientId}/appointments/qf/ultrasound/book?prefill=${encodeURIComponent(service.name)}`
      );
    } else {
      router.push(
        `/patient/${patientId}/appointments/s400/institutes?search=${encodeURIComponent(service.name)}`
      );
    }
  };

  const handleSmartSelect = (result: typeof allServices[0]) => {
    setShowSmartResults(false);
    setSmartQuery('');
    // Auto-populate both fields
    setSelectedInstituteId(result.instituteId);
    setSelectedServiceId(result.id);
    setServiceFilter('');
    // Navigate directly
    navigateToService(result);
  };

  const handleSearch = () => {
    if (!selectedService) return;
    navigateToService(selectedService);
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
      <p className="text-sm text-gray-500 mb-6">בחר מכון ושירות לקביעת תור</p>

      {/* Smart search (optional shortcut) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
        <label className="block text-xs font-medium text-gray-500 mb-1.5">חיפוש חכם</label>
        <div className="relative">
          <input
            ref={smartRef}
            type="text"
            value={smartQuery}
            onChange={(e) => {
              setSmartQuery(e.target.value);
              setShowSmartResults(true);
            }}
            onFocus={() => smartQuery.trim() && setShowSmartResults(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowSmartResults(false);
            }}
            placeholder='הקלד שם שירות — לדוגמה: "דם", "אולטרסאונד", "הולטר"...'
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />

          {/* Smart search results */}
          {showSmartResults && smartResults.length > 0 && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
              {smartResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSmartSelect(result)}
                  disabled={!result.available}
                  className={`
                    w-full px-4 py-3 flex items-center justify-between text-right transition-colors border-b border-gray-50 last:border-b-0
                    ${result.available ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                      result.system === 'qf' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {result.system === 'qf' ? 'QF' : 'S4'}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{result.name}</div>
                      <div className="text-xs text-gray-400">{result.instituteName} &middot; {result.code}</div>
                    </div>
                  </div>
                  {!result.available && (
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">לא זמין</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">קיצור דרך — הקלד שם שירות והמערכת תמלא את השדות אוטומטית</p>
      </div>

      {/* Main two-field search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Field 1: Institute */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">מכון</label>
            <select
              value={selectedInstituteId}
              onChange={(e) => {
                setSelectedInstituteId(e.target.value);
                setSelectedServiceId('');
                setServiceFilter('');
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
            >
              <option value="">— בחר מכון —</option>
              {institutes.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>
          </div>

          {/* Field 2: Service (dependent) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">שירות</label>
            {!selectedInstituteId ? (
              <select
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              >
                <option>— בחר מכון תחילה —</option>
              </select>
            ) : (
              <div className="relative">
                {/* Search within services */}
                <input
                  type="text"
                  value={serviceFilter}
                  onChange={(e) => {
                    setServiceFilter(e.target.value);
                    setSelectedServiceId('');
                  }}
                  placeholder="חיפוש שירות..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent mb-2"
                />

                {/* Service list */}
                <div className="border border-gray-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                  {filteredServices.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400 text-center">לא נמצאו שירותים</div>
                  ) : (
                    filteredServices.map((svc) => (
                      <button
                        key={svc.id}
                        onClick={() => svc.available && setSelectedServiceId(svc.id)}
                        disabled={!svc.available}
                        className={`
                          w-full px-4 py-2.5 flex items-center justify-between text-right transition-colors border-b border-gray-50 last:border-b-0
                          ${!svc.available
                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            : selectedServiceId === svc.id
                            ? 'bg-teal-50 border-r-4 border-r-teal-500'
                            : 'hover:bg-gray-50'
                          }
                        `}
                      >
                        <div>
                          <div className={`text-sm ${svc.available ? 'text-gray-900' : 'text-gray-400'}`}>{svc.name}</div>
                          <div className="text-xs text-gray-400">{svc.code}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!svc.available ? (
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">לא זמין כרגע</span>
                          ) : svc.system === 'qf' ? (
                            <span className="text-[10px] font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">QF</span>
                          ) : null}
                          {selectedServiceId === svc.id && svc.available && (
                            <span className="text-teal-600 text-lg">&#x2713;</span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {selectedService ? (
              <>
                נבחר: <span className="font-medium text-gray-900">{currentInstitute?.name}</span>
                {' → '}
                <span className="font-medium text-gray-900">{selectedService.name}</span>
                {selectedService.system === 'qf' && (
                  <span className="text-[10px] font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full mr-2">זימון מהיר QF</span>
                )}
              </>
            ) : (
              'בחר מכון ושירות לקביעת תור'
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={!selectedService || !selectedService.available}
            className={`
              px-8 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${selectedService && selectedService.available
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            חיפוש תורים
          </button>
        </div>
      </div>
    </div>
  );
}
