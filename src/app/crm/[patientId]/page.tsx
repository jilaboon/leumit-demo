'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { formatDate, formatTime, getCategoryLabel, getPatientName } from '@/lib/utils';
import type { Appointment, Patient } from '@/types';

const tabs = [
  { id: 'personal', label: 'פרטים אישיים' },
  { id: 'appointments', label: 'תורים' },
  { id: 'documents', label: 'מסמכים' },
  { id: 'history', label: 'היסטוריה' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function CrmPatientPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const store = useStore();
  const [activeTab, setActiveTab] = useState<TabId>('appointments');

  const patient = store.getPatient(patientId);

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-lg font-bold text-gray-800 mb-2">מטופל לא נמצא</h2>
        <p className="text-gray-500 mb-4 text-sm">לא נמצא מטופל עם מספר ת.ז. {patientId}</p>
        <a href="/" className="px-4 py-2 bg-blue-700 text-white rounded text-sm hover:bg-blue-800 transition-colors">
          חזרה לחיפוש
        </a>
      </div>
    );
  }

  const futureAppointments = store.getFutureAppointments(patientId);
  const pastAppointments = store.getPastAppointments(patientId);

  return (
    <div className="pb-10">
      {/* Patient Info Bar */}
      <div className="bg-white border border-gray-300 rounded shadow-sm mb-4">
        <div className="bg-blue-800 text-white px-4 py-2 rounded-t flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bold text-sm">{getPatientName(patient.firstName, patient.lastName)}</span>
            <span className="text-blue-200 text-xs">|</span>
            <span className="text-xs text-blue-200">ת.ז: {patient.id}</span>
            <span className="text-blue-200 text-xs">|</span>
            <span className="text-xs text-blue-200">גיל: {patient.age}</span>
            <span className="text-blue-200 text-xs">|</span>
            <span className="text-xs text-blue-200">{patient.gender}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-[10px] text-blue-200">פעיל</span>
          </div>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-gray-500 block">טלפון</span>
            <span className="text-gray-900 font-medium" dir="ltr">{patient.phone}</span>
          </div>
          <div>
            <span className="text-gray-500 block">כתובת</span>
            <span className="text-gray-900 font-medium">{patient.address}</span>
          </div>
          <div>
            <span className="text-gray-500 block">סניף</span>
            <span className="text-gray-900 font-medium">{patient.branch.name}</span>
          </div>
          <div>
            <span className="text-gray-500 block">רופא מטפל</span>
            <span className="text-gray-900 font-medium">{patient.assignedDoctor.name}</span>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border border-gray-300 rounded shadow-sm">
        <div className="flex border-b border-gray-300">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'appointments' && (
            <AppointmentsTab
              futureAppointments={futureAppointments}
              pastAppointments={pastAppointments}
              patientId={patientId}
              router={router}
            />
          )}
          {activeTab === 'personal' && (
            <PersonalTab patient={patient} />
          )}
          {activeTab === 'documents' && (
            <PlaceholderTab label="מסמכים" />
          )}
          {activeTab === 'history' && (
            <PlaceholderTab label="היסטוריה" />
          )}
        </div>
      </div>
    </div>
  );
}

function AppointmentsTab({
  futureAppointments,
  pastAppointments,
  patientId,
  router,
}: {
  futureAppointments: Appointment[];
  pastAppointments: Appointment[];
  patientId: string;
  router: { push: (url: string) => void };
}) {
  return (
    <div className="space-y-5">
      {/* New Appointment Actions */}
      <div className="bg-slate-50 border border-slate-200 rounded p-4">
        <h3 className="text-xs font-bold text-gray-700 mb-3">זימון תור חדש</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => router.push(`/patient/${patientId}/appointments/book`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            זימון תור חדש &mdash; QF
          </button>
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-400 rounded text-sm cursor-not-allowed"
          >
            מערכת S400 (ישנה)
          </button>
        </div>
      </div>

      {/* Future Appointments */}
      <div>
        <h3 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full" />
          תורים עתידיים ({futureAppointments.length})
        </h3>
        {futureAppointments.length === 0 ? (
          <div className="text-xs text-gray-400 bg-gray-50 rounded p-3 border border-gray-200">
            אין תורים עתידיים
          </div>
        ) : (
          <div className="border border-gray-300 rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="text-right px-3 py-2 font-medium text-gray-600">תאריך</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">שעה</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">קטגוריה</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">שירות</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">מרפאה</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {futureAppointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-gray-200 hover:bg-blue-50">
                    <td className="px-3 py-2 text-gray-900">{formatDate(apt.startISO)}</td>
                    <td className="px-3 py-2 text-gray-900">{formatTime(apt.startISO)}</td>
                    <td className="px-3 py-2 text-gray-700">{getCategoryLabel(apt.serviceCategory)}</td>
                    <td className="px-3 py-2 text-gray-700">{apt.serviceName}</td>
                    <td className="px-3 py-2 text-gray-700">{apt.clinic.name}</td>
                    <td className="px-3 py-2">
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">
                        מתוכנן
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Past Appointments */}
      <div>
        <h3 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-400 rounded-full" />
          תורים שהתקיימו ({pastAppointments.length})
        </h3>
        {pastAppointments.length === 0 ? (
          <div className="text-xs text-gray-400 bg-gray-50 rounded p-3 border border-gray-200">
            אין תורים קודמים
          </div>
        ) : (
          <div className="border border-gray-300 rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="text-right px-3 py-2 font-medium text-gray-600">תאריך</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">שעה</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">קטגוריה</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">שירות</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">מרפאה</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {pastAppointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-600">{formatDate(apt.startISO)}</td>
                    <td className="px-3 py-2 text-gray-600">{formatTime(apt.startISO)}</td>
                    <td className="px-3 py-2 text-gray-500">{getCategoryLabel(apt.serviceCategory)}</td>
                    <td className="px-3 py-2 text-gray-500">{apt.serviceName}</td>
                    <td className="px-3 py-2 text-gray-500">{apt.clinic.name}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        apt.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'Canceled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {apt.status === 'Completed' ? 'הושלם' : apt.status === 'Canceled' ? 'בוטל' : apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function PersonalTab({ patient }: { patient: Patient }) {
  return (
    <div className="grid grid-cols-2 gap-4 text-xs">
      <div className="space-y-3">
        <h4 className="font-bold text-gray-700 border-b border-gray-200 pb-1">פרטים אישיים</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-gray-500 block">שם פרטי</span>
            <span className="text-gray-900 font-medium">{patient.firstName}</span>
          </div>
          <div>
            <span className="text-gray-500 block">שם משפחה</span>
            <span className="text-gray-900 font-medium">{patient.lastName}</span>
          </div>
          <div>
            <span className="text-gray-500 block">מין</span>
            <span className="text-gray-900 font-medium">{patient.gender}</span>
          </div>
          <div>
            <span className="text-gray-500 block">תאריך לידה</span>
            <span className="text-gray-900 font-medium">{patient.dateOfBirth}</span>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="font-bold text-gray-700 border-b border-gray-200 pb-1">פרטי קשר</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-gray-500 block">טלפון</span>
            <span className="text-gray-900 font-medium" dir="ltr">{patient.phone}</span>
          </div>
          <div>
            <span className="text-gray-500 block">כתובת</span>
            <span className="text-gray-900 font-medium">{patient.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
      <div className="text-center">
        <div className="text-3xl mb-2 opacity-50">---</div>
        <p>מודול {label} אינו זמין בדמו</p>
      </div>
    </div>
  );
}

