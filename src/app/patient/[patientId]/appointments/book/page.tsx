'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import ServiceCard from '@/components/ServiceCard';
import { formatDate, formatTime } from '@/lib/utils';
import { Appointment } from '@/types';

interface ServiceConfig {
  id: string;
  category: Appointment['serviceCategory'];
  title: string;
  subtitle: string;
  icon: string;
  href: string;
  isS400: boolean;
}

const SERVICES: ServiceConfig[] = [
  { id: 'family', category: 'Family', title: 'רפואה ראשונית', subtitle: 'ייעוץ, מעקב, חיסונים', icon: '👨‍👩‍👧‍👦', href: '/appointments/s400/family', isS400: true },
  { id: 'consultant', category: 'Consultant', title: 'רפואה יועצת', subtitle: 'ייעוץ מומחים', icon: '🩺', href: '/appointments/s400/consultant', isS400: true },
  { id: 'institutes', category: 'Institutes', title: 'מכונים', subtitle: 'מעבדות, דימות ומכונים', icon: '🏥', href: '/appointments/qf/institutes', isS400: false },
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

  const openReferrals = store.getAllPatientReferrals(patientId).filter(r => r.status === 'Open').length;

  return (
    <div className="animate-fade-in">
      {/* Page title */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">זימון תור חדש</h2>
        <p className="text-sm text-gray-500 mt-1">בחר שירות לקביעת תור</p>
      </div>

      {/* Service Cards — 4 sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SERVICES.map((svc) => {
          const nextApt = store.getNextAppointmentByCategory(patientId, svc.category);
          const lastApt = store.getLastAppointmentByCategory(patientId, svc.category);

          const contextRows = [
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
          ];

          const isQF = !svc.isS400;

          return (
            <ServiceCard
              key={svc.id}
              title={svc.title}
              subtitle={svc.subtitle}
              icon={svc.icon}
              highlighted={isQF}
              statusBadge={
                isQF
                  ? { label: 'QF', variant: 'available' }
                  : { label: 'S400', variant: 'limited' }
              }
              contextRows={contextRows}
              primaryAction={{
                label: svc.id === 'institutes' ? 'חיפוש וזימון' : 'זימון תור',
                href: `/patient/${patientId}${svc.href}`,
              }}
            />
          );
        })}

        {/* Referrals card */}
        <ServiceCard
          title="הפניות"
          subtitle="צפייה וניהול הפניות מטופל"
          icon="📄"
          highlighted={true}
          statusBadge={{ label: 'זמין', variant: 'available' }}
          contextRows={[
            { label: 'הפניות פתוחות', value: `${openReferrals}`, emphasis: openReferrals > 0 },
          ]}
          primaryAction={{
            label: 'צפייה בהפניות',
            href: `/patient/${patientId}/referrals`,
          }}
        />
      </div>
    </div>
  );
}
