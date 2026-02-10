'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/Toast';
import SectionCard from '@/components/SectionCard';
import { formatDate, formatTime } from '@/lib/utils';
import { AvailableSlot } from '@/types';

export default function ConfirmPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const store = useStore();
  const { showToast } = useToast();

  const [slot, setSlot] = useState<AvailableSlot | null>(null);
  const [confirming, setConfirming] = useState(false);

  const patient = store.getPatient(patientId);

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedSlot');
    if (stored) {
      setSlot(JSON.parse(stored));
    } else {
      router.push(`/patient/${patientId}/appointments/qf/ultrasound/book`);
    }
  }, [patientId, router]);

  if (!patient || !slot) return null;

  const handleConfirm = async () => {
    setConfirming(true);

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 700));

    store.bookAppointment(patientId, slot);

    showToast('התור נקבע בהצלחה!', 'success');

    // Short delay before navigating to success
    await new Promise(r => setTimeout(r, 300));

    showToast('SMS נשלח למטופל', 'info');

    await new Promise(r => setTimeout(r, 400));

    showToast('CRM עודכן', 'info');

    await new Promise(r => setTimeout(r, 400));

    showToast('אזור אישי עודכן', 'info');

    // Navigate to success
    router.push(`/patient/${patientId}/appointments/qf/ultrasound/success`);
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button onClick={() => router.push(`/patient/${patientId}/appointments/book`)} className="hover:text-teal-600 transition-colors">
          זימון תור חדש
        </button>
        <span>←</span>
        <button onClick={() => router.push(`/patient/${patientId}/appointments/qf/ultrasound/book`)} className="hover:text-teal-600 transition-colors">
          חיפוש תור
        </button>
        <span>←</span>
        <span className="text-gray-900 font-medium">אישור תור</span>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-6">אישור קביעת תור</h2>

      {/* Summary card */}
      <SectionCard title="פרטי התור" className="mb-5">
        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
          <SummaryItem label="סוג בדיקה" value={slot.serviceName} />
          <SummaryItem label="קוד טיפול" value={slot.treatmentCode} dir="ltr" />
          <SummaryItem label="תאריך" value={formatDate(slot.startISO)} />
          <SummaryItem label="שעה" value={formatTime(slot.startISO)} />
          <SummaryItem label="מרפאה" value={slot.clinic.name} />
          <SummaryItem label="עיר" value={slot.clinic.city} />
          <SummaryItem label="מבצע הבדיקה" value={slot.providerName} />
          {slot.distanceKm !== undefined && (
            <SummaryItem label='מרחק' value={`${slot.distanceKm} ק"מ`} />
          )}
        </div>
      </SectionCard>

      <SectionCard title="פרטי המטופל" className="mb-6">
        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
          <SummaryItem label="שם מלא" value={`${patient.firstName} ${patient.lastName}`} />
          <SummaryItem label="ת.ז." value={patient.id} dir="ltr" />
          <SummaryItem label="טלפון" value={patient.phone} dir="ltr" />
          <SummaryItem label="סניף" value={patient.branch.name} />
        </div>
      </SectionCard>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 text-gray-600 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          חזרה לחיפוש
        </button>
        <button
          onClick={handleConfirm}
          disabled={confirming}
          className="px-10 py-3 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {confirming ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              מעבד...
            </span>
          ) : (
            'אישור וקביעת תור'
          )}
        </button>
      </div>
    </div>
  );
}

function SummaryItem({ label, value, dir }: { label: string; value: string; dir?: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500 mb-0.5">{label}</dt>
      <dd className="text-sm font-semibold text-gray-900" dir={dir}>{value}</dd>
    </div>
  );
}
