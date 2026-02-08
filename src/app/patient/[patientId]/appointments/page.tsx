'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import SectionCard from '@/components/SectionCard';
import Badge from '@/components/Badge';
import Toggle from '@/components/Toggle';
import EmptyState from '@/components/EmptyState';
import { formatDate, formatTime } from '@/lib/utils';
import { Appointment, Referral, Commitment } from '@/types';

export default function PatientDashboardPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const store = useStore();
  const [viewMode, setViewMode] = useState<'patient' | 'family'>('patient');

  const patient = store.getPatient(patientId);
  if (!patient) return null;

  const familyMembers = store.getFamilyMembers(patient.familyId);

  const futureAppointments = viewMode === 'patient'
    ? store.getFutureAppointments(patientId)
    : store.getFamilyFutureAppointments(patient.familyId);

  const pastAppointments = viewMode === 'patient'
    ? store.getPastAppointments(patientId)
    : store.getFamilyPastAppointments(patient.familyId);

  const referrals = viewMode === 'patient'
    ? store.getReferrals(patientId)
    : store.getFamilyReferrals(patient.familyId);

  const commitments = viewMode === 'patient'
    ? store.getCommitments(patientId)
    : store.getFamilyCommitments(patient.familyId);

  const getPatientLabel = (pid: string): string => {
    const p = store.getPatient(pid);
    return p ? `${p.firstName} ${p.lastName}` : '';
  };

  return (
    <div className="animate-fade-in">
      {/* Controls bar */}
      <div className="flex items-center justify-between mb-6">
        <Toggle
          options={[
            { id: 'patient', label: 'מטופל' },
            { id: 'family', label: 'משפחה' },
          ]}
          value={viewMode}
          onChange={(id) => setViewMode(id as 'patient' | 'family')}
        />

        <button
          onClick={() => router.push(`/patient/${patientId}/appointments/book`)}
          className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
        >
          + קביעת תור חדש
        </button>
      </div>

      {/* Family members indicator */}
      {viewMode === 'family' && (
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-lg px-4 py-2.5">
          <span className="font-medium">בני משפחה:</span>
          {familyMembers.map((m, i) => (
            <span key={m.id}>
              <span className={m.id === patientId ? 'font-bold text-teal-700' : ''}>
                {m.firstName} {m.lastName}
              </span>
              {i < familyMembers.length - 1 && <span className="mx-1">•</span>}
            </span>
          ))}
        </div>
      )}

      {/* Dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Future Appointments */}
        <SectionCard title="תורים עתידיים" action={
          <span className="text-xs text-gray-400">{futureAppointments.length} תורים</span>
        }>
          {futureAppointments.length === 0 ? (
            <EmptyState
              icon="📅"
              title="אין תורים עתידיים"
              description="לא נמצאו תורים מתוכננים"
              action={
                <button
                  onClick={() => router.push(`/patient/${patientId}/appointments/book`)}
                  className="text-sm text-teal-600 font-medium hover:underline"
                >
                  קבע תור חדש
                </button>
              }
            />
          ) : (
            <AppointmentTable
              appointments={futureAppointments}
              showPatient={viewMode === 'family'}
              getPatientLabel={getPatientLabel}
            />
          )}
        </SectionCard>

        {/* Past 6 Months */}
        <SectionCard title="6 חודשים אחרונים" action={
          <span className="text-xs text-gray-400">{pastAppointments.length} תורים</span>
        }>
          {pastAppointments.length === 0 ? (
            <EmptyState icon="📋" title="אין היסטוריה" description="לא נמצאו תורים ב-6 חודשים אחרונים" />
          ) : (
            <AppointmentTable
              appointments={pastAppointments}
              showPatient={viewMode === 'family'}
              getPatientLabel={getPatientLabel}
            />
          )}
        </SectionCard>

        {/* Referrals */}
        <SectionCard title="הפניות" action={
          <span className="text-xs text-gray-400">{referrals.length} הפניות</span>
        }>
          {referrals.length === 0 ? (
            <EmptyState icon="📄" title="אין הפניות" description="לא נמצאו הפניות ב-6 חודשים אחרונים" />
          ) : (
            <ReferralTable
              referrals={referrals}
              showPatient={viewMode === 'family'}
              getPatientLabel={getPatientLabel}
            />
          )}
        </SectionCard>

        {/* Commitments */}
        <SectionCard title="התחייבויות" action={
          <span className="text-xs text-gray-400">{commitments.length} התחייבויות</span>
        }>
          {commitments.length === 0 ? (
            <EmptyState icon="📌" title="אין התחייבויות" description="לא נמצאו התחייבויות ב-6 חודשים אחרונים" />
          ) : (
            <CommitmentTable
              commitments={commitments}
              showPatient={viewMode === 'family'}
              getPatientLabel={getPatientLabel}
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function AppointmentTable({
  appointments,
  showPatient,
  getPatientLabel,
}: {
  appointments: Appointment[];
  showPatient: boolean;
  getPatientLabel: (id: string) => string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {showPatient && <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">מטופל</th>}
            <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">תאריך</th>
            <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">שעה</th>
            <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">שירות</th>
            <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">מרפאה</th>
            <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => (
            <tr key={apt.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              {showPatient && (
                <td className="py-2.5 px-2 text-xs font-medium text-teal-700">{getPatientLabel(apt.patientId)}</td>
              )}
              <td className="py-2.5 px-2 font-medium">{formatDate(apt.startISO)}</td>
              <td className="py-2.5 px-2">{formatTime(apt.startISO)}</td>
              <td className="py-2.5 px-2">{apt.serviceName}</td>
              <td className="py-2.5 px-2 text-gray-600">{apt.clinic.name}</td>
              <td className="py-2.5 px-2"><Badge status={apt.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReferralTable({
  referrals,
  showPatient,
  getPatientLabel,
}: {
  referrals: Referral[];
  showPatient: boolean;
  getPatientLabel: (id: string) => string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {showPatient && <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">מטופל</th>}
            <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">סוג</th>
            <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">תאריך יצירה</th>
            <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {referrals.map((ref) => (
            <tr key={ref.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              {showPatient && (
                <td className="py-2.5 px-2 text-xs font-medium text-teal-700">{getPatientLabel(ref.patientId)}</td>
              )}
              <td className="py-2.5 px-2 font-medium">{ref.type}</td>
              <td className="py-2.5 px-2">{formatDate(ref.createdISO)}</td>
              <td className="py-2.5 px-2"><Badge status={ref.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CommitmentTable({
  commitments,
  showPatient,
  getPatientLabel,
}: {
  commitments: Commitment[];
  showPatient: boolean;
  getPatientLabel: (id: string) => string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {showPatient && <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">מטופל</th>}
            <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">תיאור</th>
            <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">תאריך</th>
            <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {commitments.map((cmt) => (
            <tr key={cmt.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              {showPatient && (
                <td className="py-2.5 px-2 text-xs font-medium text-teal-700">{getPatientLabel(cmt.patientId)}</td>
              )}
              <td className="py-2.5 px-2 font-medium">{cmt.description}</td>
              <td className="py-2.5 px-2">{formatDate(cmt.createdISO)}</td>
              <td className="py-2.5 px-2"><Badge status={cmt.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
