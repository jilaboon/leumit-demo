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
  isDemo: boolean;
}

const SERVICES: ServiceConfig[] = [
  { id: 'ultrasound', category: 'Ultrasound', title: 'אולטרסאונד', subtitle: 'בדיקות דימות אולטרסאונד', icon: '📡', href: '/appointments/qf/ultrasound/book', isDemo: true },
  { id: 'family', category: 'Family', title: 'רפואה ראשונית', subtitle: 'ייעוץ, מעקב, חיסונים', icon: '👨‍👩‍👧‍👦', href: '/appointments/s400?family', isDemo: false },
  { id: 'consultant', category: 'Consultant', title: 'רפואה יועצת', subtitle: 'ייעוץ מומחים', icon: '🩺', href: '/appointments/s400?consultant', isDemo: false },
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

  return (
    <div className="animate-fade-in">
      {/* Page title */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">זימון תור חדש</h2>
        <p className="text-sm text-gray-500 mt-1">בחר שירות לקביעת תור</p>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
  );
}
