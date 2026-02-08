'use client';

import { Patient } from '@/types';

interface Props {
  patient: Patient;
}

export default function PatientHeaderCard({ patient }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-2xl font-bold">
            {patient.firstName.charAt(0)}
          </span>
        </div>

        {/* Patient info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-gray-900">
              {patient.firstName} {patient.lastName}
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-medium">
              {patient.gender === 'זכר' ? '♂' : '♀'} {patient.gender}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 mt-3">
            <InfoItem label="ת.ז." value={patient.id} />
            <InfoItem label="גיל" value={`${patient.age}`} />
            <InfoItem label="תאריך לידה" value={new Date(patient.dateOfBirth).toLocaleDateString('he-IL')} />
            <InfoItem label="טלפון" value={patient.phone} />
            <InfoItem label="כתובת" value={patient.address} />
            <InfoItem label="סניף" value={`${patient.branch.name}, ${patient.branch.city}`} />
            <InfoItem label="רופא/ה מטפל/ת" value={patient.assignedDoctor.name} />
            <InfoItem label="קוד משפחה" value={patient.familyId} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 truncate">{value}</dd>
    </div>
  );
}
