'use client';

import { createContext, useContext } from 'react';
import { Patient, Appointment, Referral, Commitment, AvailableSlot, NotificationEvent } from '@/types';
import { patients, initialAppointments, initialReferrals, initialCommitments, availableSlots } from './mock-data';

export interface AppState {
  patients: Patient[];
  appointments: Appointment[];
  referrals: Referral[];
  commitments: Commitment[];
  availableSlots: AvailableSlot[];
  notifications: NotificationEvent[];
  bookedSlotIds: string[];
}

export interface AppStore extends AppState {
  getPatient: (id: string) => Patient | undefined;
  getFamilyMembers: (familyId: string) => Patient[];
  getFutureAppointments: (patientId: string) => Appointment[];
  getPastAppointments: (patientId: string) => Appointment[];
  getFamilyFutureAppointments: (familyId: string) => Appointment[];
  getFamilyPastAppointments: (familyId: string) => Appointment[];
  getNextAppointmentByCategory: (patientId: string, category: Appointment['serviceCategory']) => Appointment | undefined;
  getLastAppointmentByCategory: (patientId: string, category: Appointment['serviceCategory']) => Appointment | undefined;
  getAllFutureAppointments: (patientId: string) => Appointment[];
  getReferrals: (patientId: string) => Referral[];
  getFamilyReferrals: (familyId: string) => Referral[];
  getCommitments: (patientId: string) => Commitment[];
  getFamilyCommitments: (familyId: string) => Commitment[];
  searchSlots: (query: string, mode: 'text' | 'list' | 'code') => AvailableSlot[];
  bookAppointment: (patientId: string, slot: AvailableSlot) => void;
  addNotification: (notification: NotificationEvent) => void;
  reset: () => void;
}

function createInitialState(): AppState {
  return {
    patients: [...patients],
    appointments: [...initialAppointments],
    referrals: [...initialReferrals],
    commitments: [...initialCommitments],
    availableSlots: [...availableSlots],
    notifications: [],
    bookedSlotIds: [],
  };
}

const now = new Date();
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

export function createStore(state: AppState, setState: (s: AppState) => void): AppStore {
  return {
    ...state,

    getPatient: (id: string) => state.patients.find(p => p.id === id),

    getFamilyMembers: (familyId: string) => state.patients.filter(p => p.familyId === familyId),

    getFutureAppointments: (patientId: string) =>
      state.appointments
        .filter(a => a.patientId === patientId && new Date(a.startISO) >= now && a.status === 'Scheduled')
        .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime()),

    getPastAppointments: (patientId: string) =>
      state.appointments
        .filter(a => a.patientId === patientId && new Date(a.startISO) < now && new Date(a.startISO) >= sixMonthsAgo)
        .sort((a, b) => new Date(b.startISO).getTime() - new Date(a.startISO).getTime()),

    getFamilyFutureAppointments: (familyId: string) =>
      state.appointments
        .filter(a => a.familyId === familyId && new Date(a.startISO) >= now && a.status === 'Scheduled')
        .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime()),

    getFamilyPastAppointments: (familyId: string) =>
      state.appointments
        .filter(a => a.familyId === familyId && new Date(a.startISO) < now && new Date(a.startISO) >= sixMonthsAgo)
        .sort((a, b) => new Date(b.startISO).getTime() - new Date(a.startISO).getTime()),

    getNextAppointmentByCategory: (patientId: string, category: Appointment['serviceCategory']) =>
      state.appointments
        .filter(a => a.patientId === patientId && a.serviceCategory === category && new Date(a.startISO) >= now && a.status === 'Scheduled')
        .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime())[0],

    getLastAppointmentByCategory: (patientId: string, category: Appointment['serviceCategory']) =>
      state.appointments
        .filter(a => a.patientId === patientId && a.serviceCategory === category && new Date(a.startISO) < now && new Date(a.startISO) >= sixMonthsAgo)
        .sort((a, b) => new Date(b.startISO).getTime() - new Date(a.startISO).getTime())[0],

    getAllFutureAppointments: (patientId: string) =>
      state.appointments
        .filter(a => a.patientId === patientId && new Date(a.startISO) >= now && a.status === 'Scheduled')
        .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime()),

    getReferrals: (patientId: string) =>
      state.referrals
        .filter(r => r.patientId === patientId && new Date(r.createdISO) >= sixMonthsAgo)
        .sort((a, b) => new Date(b.createdISO).getTime() - new Date(a.createdISO).getTime()),

    getFamilyReferrals: (familyId: string) =>
      state.referrals
        .filter(r => r.familyId === familyId && new Date(r.createdISO) >= sixMonthsAgo)
        .sort((a, b) => new Date(b.createdISO).getTime() - new Date(a.createdISO).getTime()),

    getCommitments: (patientId: string) =>
      state.commitments
        .filter(c => c.patientId === patientId && new Date(c.createdISO) >= sixMonthsAgo)
        .sort((a, b) => new Date(b.createdISO).getTime() - new Date(a.createdISO).getTime()),

    getFamilyCommitments: (familyId: string) =>
      state.commitments
        .filter(c => c.familyId === familyId && new Date(c.createdISO) >= sixMonthsAgo)
        .sort((a, b) => new Date(b.createdISO).getTime() - new Date(a.createdISO).getTime()),

    searchSlots: (query: string, mode: 'text' | 'list' | 'code') => {
      const available = state.availableSlots.filter(s => !state.bookedSlotIds.includes(s.id));
      if (!query.trim()) return available;
      const q = query.trim().toLowerCase();

      if (mode === 'code') {
        return available.filter(s => s.treatmentCode.toLowerCase().includes(q));
      }
      if (mode === 'list') {
        return available.filter(s => s.serviceName === query);
      }
      // free text
      return available.filter(s =>
        s.serviceName.includes(q) ||
        s.treatmentCode.toLowerCase().includes(q) ||
        s.clinic.name.includes(q) ||
        s.clinic.city.includes(q) ||
        s.providerName.includes(q)
      );
    },

    bookAppointment: (patientId: string, slot: AvailableSlot) => {
      const patient = state.patients.find(p => p.id === patientId);
      if (!patient) return;

      const newAppointment: Appointment = {
        id: `APT-${Date.now()}`,
        patientId,
        familyId: patient.familyId,
        serviceCategory: 'Ultrasound',
        serviceName: slot.serviceName,
        clinic: slot.clinic,
        providerName: slot.providerName,
        startISO: slot.startISO,
        status: 'Scheduled',
      };

      const newNotifications: NotificationEvent[] = [
        {
          id: `NTF-${Date.now()}-1`,
          type: 'AGENT_SUMMARY',
          title: 'סיכום נציג',
          detail: `נקבע תור ${slot.serviceName} עבור ${patient.firstName} ${patient.lastName} בתאריך ${new Date(slot.startISO).toLocaleDateString('he-IL')} בשעה ${new Date(slot.startISO).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })} ב${slot.clinic.name}`,
          createdISO: new Date().toISOString(),
          status: 'OK',
        },
        {
          id: `NTF-${Date.now()}-2`,
          type: 'SMS',
          title: 'SMS נשלח למטופל',
          detail: `שלום ${patient.firstName}, תור ${slot.serviceName} נקבע לך בתאריך ${new Date(slot.startISO).toLocaleDateString('he-IL')} בשעה ${new Date(slot.startISO).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}. מיקום: ${slot.clinic.name}, ${slot.clinic.city}. לביטול חייגו *2700.`,
          createdISO: new Date().toISOString(),
          status: 'OK',
        },
        {
          id: `NTF-${Date.now()}-3`,
          type: 'CRM',
          title: 'CRM עודכן',
          detail: `רשומת תור חדשה נוספה למערכת CRM - ${newAppointment.id}`,
          createdISO: new Date().toISOString(),
          status: 'OK',
        },
        {
          id: `NTF-${Date.now()}-4`,
          type: 'PERSONAL_AREA',
          title: 'אזור אישי עודכן',
          detail: `התור מופיע כעת באזור האישי של המטופל באפליקציה ובאתר`,
          createdISO: new Date().toISOString(),
          status: 'OK',
        },
      ];

      setState({
        ...state,
        appointments: [...state.appointments, newAppointment],
        bookedSlotIds: [...state.bookedSlotIds, slot.id],
        notifications: [...state.notifications, ...newNotifications],
      });
    },

    addNotification: (notification: NotificationEvent) => {
      setState({
        ...state,
        notifications: [...state.notifications, notification],
      });
    },

    reset: () => {
      setState(createInitialState());
    },
  };
}

export const StoreContext = createContext<AppStore | null>(null);

export function useStore(): AppStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used within StoreProvider');
  return store;
}

export { createInitialState };
