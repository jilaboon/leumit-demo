'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import ServiceCard from '@/components/ServiceCard';
import Badge from '@/components/Badge';
import { formatDate, formatTime } from '@/lib/utils';
import { Appointment } from '@/types';

interface ServiceConfig {
  id: string;
  category: Appointment['serviceCategory'];
  title: string;
  subtitle: string;
  icon: string;
  href: string;
  isDemo: boolean;
}

const SERVICES: ServiceConfig[] = [
  { id: 'ultrasound', category: 'Ultrasound', title: 'אולטרסאונד', subtitle: 'בדיקות דימות אולטרסאונד', icon: '📡', href: '/appointments/qf/ultrasound/book', isDemo: true },
  { id: 'family', category: 'Family', title: 'רפואת משפחה / ילדים', subtitle: 'ייעוץ, מעקב, חיסונים', icon: '👨‍👩‍👧‍👦', href: '/appointments/s400?family', isDemo: false },
  { id: 'consultant', category: 'Consultant', title: 'רפואה מייעצת', subtitle: 'ייעוץ מומחים', icon: '🩺', href: '/appointments/s400?consultant', isDemo: false },
  { id: 'institutes', category: 'Institutes', title: 'מכונים', subtitle: 'מעבדות ומכונים', icon: '🏥', href: '/appointments/s400?institutes', isDemo: false },
  { id: 'complementary', category: 'Complementary', title: 'רפואה משלימה', subtitle: 'דיקור, נטורופתיה', icon: '🌿', href: '/appointments/s400?complementary', isDemo: false },
];

export default function AppointmentsCenterPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const store = useStore();
  const patient = store.getPatient(patientId);

  if (!patient) return null;

  const allFuture = store.getAllFutureAppointments(patientId);

  const openReferrals = store.getReferrals(patientId).filter(r => r.status === 'Open');
  const activeCommitments = store.getCommitments(patientId).filter(c => c.status === 'Active');

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <button
          onClick={() => router.push(`/patient/${patientId}/appointments`)}
          className="hover:text-teal-600 transition-colors"
        >
          מבט 360°
        </button>
        <span>←</span>
        <span className="text-gray-900 font-medium">מרכז זימון תורים</span>
      </div>

      {/* Page title */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">מרכז זימון תורים</h2>
        <p className="text-sm text-gray-500 mt-1">בחר שירות לקביעת תור חדש</p>
      </div>

      {/* Two column layout */}
      <div className="flex flex-col lg:flex-row-reverse gap-6">
        {/* Main: Service Cards */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICES.map((svc) => {
              const nextApt = store.getNextAppointmentByCategory(patientId, svc.category);
              const lastApt = store.getLastAppointmentByCategory(patientId, svc.category);

              const contextRows = [
                { label: 'סניף ברירת מחדל', value: patient.branch.name },
                ...(svc.category === 'Family' || svc.category === 'Consultant'
                  ? [{ label: 'רופא/ה מטפל/ת', value: patient.assignedDoctor.name }]
                  : []),
                {
                  label: 'תור הבא',
                  value: nextApt
                    ? `${formatDate(nextApt.startISO)} ${formatTime(nextApt.startISO)}`
                    : 'אין',
                  emphasis: !!nextApt,
                },
                {
                  label: 'תור אחרון',
                  value: lastApt ? formatDate(lastApt.startISO) : 'אין',
                },
                ...(svc.isDemo
                  ? [{ label: 'זמן המתנה משוער', value: '3-7 ימים' }]
                  : []),
              ];

              return (
                <ServiceCard
                  key={svc.id}
                  title={svc.title}
                  subtitle={svc.subtitle}
                  icon={svc.icon}
                  highlighted={svc.isDemo}
                  statusBadge={
                    svc.isDemo
                      ? { label: 'זמין', variant: 'available' }
                      : { label: 'S400', variant: 'disabled' }
                  }
                  contextRows={contextRows}
                  primaryAction={{
                    label: 'זימון תור',
                    href: `/patient/${patientId}${svc.href}`,
                    disabled: !svc.isDemo,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
          {/* Future Appointments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">תורים עתידיים</h3>
              <span className="text-[11px] text-gray-400">{allFuture.length} תורים</span>
            </div>
            <div className="divide-y divide-gray-50">
              {allFuture.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  אין תורים עתידיים
                </div>
              ) : (
                allFuture.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-blue-700 leading-none">
                        {new Date(apt.startISO).toLocaleDateString('he-IL', { day: '2-digit' })}
                      </span>
                      <span className="text-[9px] text-blue-500 leading-none">
                        {new Date(apt.startISO).toLocaleDateString('he-IL', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-900 truncate">{apt.serviceName}</div>
                      <div className="text-[11px] text-gray-500 truncate">
                        {formatTime(apt.startISO)} • {apt.clinic.name}
                      </div>
                    </div>
                    <Badge status={apt.status} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">התראות והפניות</h3>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              {openReferrals.map((ref) => (
                <div key={ref.id} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-[10px]">📄</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">{ref.type}</p>
                    <p className="text-[11px] text-gray-500">
                      תקפה עד {formatDate(ref.expiresISO)}
                    </p>
                  </div>
                </div>
              ))}
              {activeCommitments.map((cmt) => (
                <div key={cmt.id} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 text-[10px]">📌</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">{cmt.description}</p>
                    <p className="text-[11px] text-gray-500">
                      {cmt.status === 'Active' ? 'פעיל' : 'סגור'} • מ-{formatDate(cmt.createdISO)}
                    </p>
                  </div>
                </div>
              ))}
              {openReferrals.length === 0 && activeCommitments.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">אין התראות פעילות</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
