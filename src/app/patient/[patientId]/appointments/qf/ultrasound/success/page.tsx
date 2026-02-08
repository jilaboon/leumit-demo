'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import SectionCard from '@/components/SectionCard';
import Badge from '@/components/Badge';

export default function SuccessPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const store = useStore();

  const patient = store.getPatient(patientId);
  const notifications = store.notifications;

  if (!patient) return null;

  // Get the latest notifications (from the most recent booking)
  const latestNotifications = notifications.slice(-4);
  const agentSummary = latestNotifications.find(n => n.type === 'AGENT_SUMMARY');
  const smsNotification = latestNotifications.find(n => n.type === 'SMS');

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">התור נקבע בהצלחה!</h2>
        <p className="text-gray-500">כל הפעולות הושלמו בהצלחה</p>
      </div>

      {/* Agent Summary */}
      {agentSummary && (
        <SectionCard title="סיכום נציג" className="mb-5">
          <div className="bg-teal-50 rounded-xl p-4 text-sm text-teal-800 leading-relaxed">
            {agentSummary.detail}
          </div>
        </SectionCard>
      )}

      {/* SMS Preview */}
      {smsNotification && (
        <SectionCard title="SMS למטופל" className="mb-5">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              נשלח בהצלחה
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">
              {smsNotification.detail}
            </p>
          </div>
        </SectionCard>
      )}

      {/* Integration Status */}
      <SectionCard title="סטטוס אינטגרציות" className="mb-8">
        <div className="space-y-3">
          {latestNotifications.map((ntf) => (
            <div
              key={ntf.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  ntf.type === 'AGENT_SUMMARY' ? 'bg-teal-100 text-teal-700' :
                  ntf.type === 'SMS' ? 'bg-blue-100 text-blue-700' :
                  ntf.type === 'CRM' ? 'bg-purple-100 text-purple-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {ntf.type === 'AGENT_SUMMARY' && '📋'}
                  {ntf.type === 'SMS' && '📱'}
                  {ntf.type === 'CRM' && '💾'}
                  {ntf.type === 'PERSONAL_AREA' && '👤'}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{ntf.title}</div>
                  <div className="text-xs text-gray-500 truncate max-w-sm">{ntf.detail}</div>
                </div>
              </div>
              <Badge status={ntf.status} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => router.push(`/patient/${patientId}/appointments/qf/ultrasound/book`)}
          className="px-6 py-2.5 text-teal-700 bg-teal-50 border border-teal-200 rounded-xl text-sm font-medium hover:bg-teal-100 transition-colors"
        >
          קביעת תור נוסף
        </button>
        <button
          onClick={() => router.push(`/patient/${patientId}/appointments`)}
          className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          חזרה למבט 360°
        </button>
      </div>
    </div>
  );
}
