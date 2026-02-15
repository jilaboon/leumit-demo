export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'זכר' | 'נקבה' | 'אחר';
  age: number;
  dateOfBirth: string;
  address: string;
  phone: string;
  branch: { id: string; name: string; city: string };
  assignedDoctor: { id: string; name: string };
  familyId: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  familyId: string;
  serviceCategory: 'Family' | 'Consultant' | 'Ultrasound' | 'Institutes' | 'Complementary';
  serviceName: string;
  clinic: { id: string; name: string; city: string };
  providerName: string;
  startISO: string;
  status: 'Scheduled' | 'Completed' | 'Canceled';
}

export interface Referral {
  id: string;
  patientId: string;
  familyId: string;
  type: string;
  examCode: string;
  examName: string;
  referringDoctor: string;
  referralNumber: string;
  createdISO: string;
  expiresISO: string;
  status: 'Open' | 'Used' | 'Expired' | 'Canceled';
}

export interface Commitment {
  id: string;
  patientId: string;
  familyId: string;
  description: string;
  createdISO: string;
  status: 'Active' | 'Closed' | 'Expired';
}

export interface AvailableSlot {
  id: string;
  serviceName: string;
  treatmentCode: string;
  startISO: string;
  clinic: { id: string; name: string; city: string };
  providerName: string;
  distanceKm?: number;
}

export interface NotificationEvent {
  id: string;
  type: 'SMS' | 'CRM' | 'PERSONAL_AREA' | 'AGENT_SUMMARY';
  title: string;
  detail: string;
  createdISO: string;
  status: 'OK' | 'WARN';
}

export type ServiceCategory = {
  id: string;
  name: string;
  icon: string;
  isQF: boolean;
};
