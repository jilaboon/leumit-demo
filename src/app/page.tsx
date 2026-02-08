'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function LandingPage() {
  const [idInput, setIdInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const store = useStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = idInput.trim();
    if (!trimmed) {
      setError('נא להזין מספר תעודת זהות');
      return;
    }

    setLoading(true);

    // Simulate lookup delay
    await new Promise(r => setTimeout(r, 600));

    const patient = store.getPatient(trimmed);
    if (patient) {
      router.push(`/patient/${patient.id}/appointments`);
    } else {
      setError('מטופל לא נמצא. נסה שוב.');
      setLoading(false);
    }
  };

  const quickAccess = [
    { id: '123456789', name: 'דוד כהן' },
    { id: '987654321', name: 'שרה כהן' },
    { id: '111222333', name: 'נועם כהן' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white text-3xl font-bold">QF</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">שלום, נציג/ה</h1>
          <p className="text-gray-500">חפש/י מטופל כדי להתחיל</p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSearch}>
            <label htmlFor="patient-id" className="block text-sm font-medium text-gray-700 mb-2">
              מספר תעודת זהות
            </label>
            <div className="flex gap-3">
              <input
                id="patient-id"
                type="text"
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                placeholder="הקלד מספר ת.ז..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                autoFocus
                dir="ltr"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    מחפש...
                  </span>
                ) : 'חיפוש'}
              </button>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
                <span>⚠</span>
                {error}
              </div>
            )}
          </form>

          {/* Quick access */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3">גישה מהירה (דמו)</p>
            <div className="flex flex-wrap gap-2">
              {quickAccess.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setIdInput(p.id);
                    setError('');
                  }}
                  className="px-3 py-2 bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-200 rounded-lg text-sm text-gray-700 hover:text-teal-700 transition-colors"
                >
                  {p.name} ({p.id})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
