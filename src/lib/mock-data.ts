import { Patient, Appointment, Referral, Commitment, AvailableSlot, ServiceCategory } from '@/types';

// Helpers for relative dates
function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

function daysAgo(days: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function daysFromNowAt(days: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

// ─── Clinics ───
const clinics = {
  ramatAviv: { id: 'CL-001', name: 'מרפאת רמת אביב', city: 'תל אביב' },
  herzliya: { id: 'CL-002', name: 'מכון דימות הרצליה', city: 'הרצליה' },
  petahTikva: { id: 'CL-003', name: 'מרכז רפואי פתח תקווה', city: 'פתח תקווה' },
};

// ─── Patients (1 family, 3 members) ───
export const patients: Patient[] = [
  {
    id: '123456789',
    firstName: 'דוד',
    lastName: 'כהן',
    gender: 'זכר',
    age: 45,
    dateOfBirth: '1981-03-15',
    address: 'רחוב הרצל 42, תל אביב',
    phone: '050-1234567',
    branch: { id: 'BR-001', name: 'סניף רמת אביב', city: 'תל אביב' },
    assignedDoctor: { id: 'DR-001', name: 'ד"ר רחל לוי' },
    familyId: 'FAM-001',
  },
  {
    id: '987654321',
    firstName: 'שרה',
    lastName: 'כהן',
    gender: 'נקבה',
    age: 42,
    dateOfBirth: '1984-07-22',
    address: 'רחוב הרצל 42, תל אביב',
    phone: '050-7654321',
    branch: { id: 'BR-001', name: 'סניף רמת אביב', city: 'תל אביב' },
    assignedDoctor: { id: 'DR-002', name: 'ד"ר מיכל אברהם' },
    familyId: 'FAM-001',
  },
  {
    id: '111222333',
    firstName: 'נועם',
    lastName: 'כהן',
    gender: 'זכר',
    age: 12,
    dateOfBirth: '2014-01-10',
    address: 'רחוב הרצל 42, תל אביב',
    phone: '050-1234567',
    branch: { id: 'BR-001', name: 'סניף רמת אביב', city: 'תל אביב' },
    assignedDoctor: { id: 'DR-003', name: 'ד"ר יוסי מזרחי' },
    familyId: 'FAM-001',
  },
];

// ─── Appointments ───
export const initialAppointments: Appointment[] = [
  // David - past
  { id: 'APT-001', patientId: '123456789', familyId: 'FAM-001', serviceCategory: 'Family', serviceName: 'בדיקה תקופתית', clinic: clinics.ramatAviv, providerName: 'ד"ר רחל לוי', startISO: daysAgo(120, 9), status: 'Completed' },
  { id: 'APT-002', patientId: '123456789', familyId: 'FAM-001', serviceCategory: 'Ultrasound', serviceName: 'אולטרסאונד בטן', clinic: clinics.herzliya, providerName: 'ד"ר אלון שמיר', startISO: daysAgo(75, 11), status: 'Completed' },
  { id: 'APT-003', patientId: '123456789', familyId: 'FAM-001', serviceCategory: 'Consultant', serviceName: 'ייעוץ קרדיולוגי', clinic: clinics.petahTikva, providerName: 'ד"ר דנה פרידמן', startISO: daysAgo(30, 14), status: 'Completed' },
  // David - future
  { id: 'APT-004', patientId: '123456789', familyId: 'FAM-001', serviceCategory: 'Family', serviceName: 'מעקב שגרתי', clinic: clinics.ramatAviv, providerName: 'ד"ר רחל לוי', startISO: daysFromNowAt(14, 10, 30), status: 'Scheduled' },

  // Sarah - past
  { id: 'APT-005', patientId: '987654321', familyId: 'FAM-001', serviceCategory: 'Ultrasound', serviceName: 'אולטרסאונד שד', clinic: clinics.herzliya, providerName: 'ד"ר אלון שמיר', startISO: daysAgo(90, 10), status: 'Completed' },
  { id: 'APT-006', patientId: '987654321', familyId: 'FAM-001', serviceCategory: 'Family', serviceName: 'בדיקת דם שגרתית', clinic: clinics.ramatAviv, providerName: 'ד"ר מיכל אברהם', startISO: daysAgo(45, 8), status: 'Completed' },
  { id: 'APT-007', patientId: '987654321', familyId: 'FAM-001', serviceCategory: 'Complementary', serviceName: 'דיקור סיני', clinic: clinics.ramatAviv, providerName: 'יעל גולן', startISO: daysAgo(15, 16), status: 'Completed' },
  // Sarah - future
  { id: 'APT-008', patientId: '987654321', familyId: 'FAM-001', serviceCategory: 'Consultant', serviceName: 'ייעוץ גינקולוגי', clinic: clinics.petahTikva, providerName: 'ד"ר נורית בן דוד', startISO: daysFromNowAt(7, 11, 0), status: 'Scheduled' },

  // Noam - past
  { id: 'APT-009', patientId: '111222333', familyId: 'FAM-001', serviceCategory: 'Family', serviceName: 'בדיקת התפתחות', clinic: clinics.ramatAviv, providerName: 'ד"ר יוסי מזרחי', startISO: daysAgo(60, 15), status: 'Completed' },
  { id: 'APT-010', patientId: '111222333', familyId: 'FAM-001', serviceCategory: 'Ultrasound', serviceName: 'אולטרסאונד בטן', clinic: clinics.herzliya, providerName: 'ד"ר אלון שמיר', startISO: daysAgo(20, 9), status: 'Completed' },
  // Noam - future
  { id: 'APT-011', patientId: '111222333', familyId: 'FAM-001', serviceCategory: 'Family', serviceName: 'חיסון שגרתי', clinic: clinics.ramatAviv, providerName: 'ד"ר יוסי מזרחי', startISO: daysFromNowAt(21, 14, 0), status: 'Scheduled' },
];

// ─── Referrals ───
export const initialReferrals: Referral[] = [
  // David
  { id: 'REF-001', patientId: '123456789', familyId: 'FAM-001', type: 'הפניה לבדיקות דם', examCode: 'BLD-100', examName: 'בדיקות דם', referringDoctor: 'ד"ר רחל לוי', referralNumber: 'HP-20250801', createdISO: daysAgo(30), expiresISO: daysFromNow(60), status: 'Open' },
  { id: 'REF-002', patientId: '123456789', familyId: 'FAM-001', type: 'הפניה לקרדיולוג', examCode: 'CRD-200', examName: 'קרדיולוג', referringDoctor: 'ד"ר רחל לוי', referralNumber: 'HP-20250645', createdISO: daysAgo(90), expiresISO: daysAgo(5), status: 'Used' },
  { id: 'REF-003', patientId: '123456789', familyId: 'FAM-001', type: 'הפניה לבדיקת אק"ג', examCode: 'ECG-300', examName: 'בדיקת אק"ג', referringDoctor: 'ד"ר דנה פרידמן', referralNumber: 'HP-20250590', createdISO: daysAgo(120), expiresISO: daysAgo(30), status: 'Expired' },
  { id: 'REF-004', patientId: '123456789', familyId: 'FAM-001', type: 'הפניה לאולטרסאונד בטן', examCode: 'US-101', examName: 'אולטרסאונד בטן', referringDoctor: 'ד"ר רחל לוי', referralNumber: 'HP-20250422', createdISO: daysAgo(60), expiresISO: daysFromNow(30), status: 'Open' },
  { id: 'REF-005', patientId: '123456789', familyId: 'FAM-001', type: 'הפניה לפעילות גופנית לגיל השלישי', examCode: 'FIT-400', examName: 'פעילות גופנית לגיל השלישי', referringDoctor: 'ד"ר רחל לוי', referralNumber: 'HP-20250310', createdISO: daysAgo(180), expiresISO: daysAgo(90), status: 'Canceled' },
  { id: 'REF-006', patientId: '123456789', familyId: 'FAM-001', type: 'הפניה לטיפול פיזיותרפי פרטני', examCode: 'PHY-500', examName: 'טיפול פיזיותרפי פרטני', referringDoctor: 'ד"ר יוסי מזרחי', referralNumber: 'HP-20250287', createdISO: daysAgo(45), expiresISO: daysFromNow(45), status: 'Open' },
  { id: 'REF-007', patientId: '123456789', familyId: 'FAM-001', type: 'הפניה לשירות סוציאלי', examCode: 'SOC-600', examName: 'שירות סוציאלי', referringDoctor: 'ד"ר רחל לוי', referralNumber: 'HP-20250155', createdISO: daysAgo(200), expiresISO: daysAgo(110), status: 'Used' },
  // Sarah
  { id: 'REF-008', patientId: '987654321', familyId: 'FAM-001', type: 'הפניה לאולטרסאונד שד', examCode: 'US-201', examName: 'אולטרסאונד שד', referringDoctor: 'ד"ר מיכל אברהם', referralNumber: 'HP-20250830', createdISO: daysAgo(100), expiresISO: daysAgo(10), status: 'Used' },
  { id: 'REF-009', patientId: '987654321', familyId: 'FAM-001', type: 'הפניה לגינקולוג', examCode: 'GYN-700', examName: 'גינקולוג', referringDoctor: 'ד"ר מיכל אברהם', referralNumber: 'HP-20250760', createdISO: daysAgo(30), expiresISO: daysFromNow(60), status: 'Open' },
  // Noam
  { id: 'REF-010', patientId: '111222333', familyId: 'FAM-001', type: 'הפניה לאולטרסאונד בטן', examCode: 'US-101', examName: 'אולטרסאונד בטן', referringDoctor: 'ד"ר יוסי מזרחי', referralNumber: 'HP-20250900', createdISO: daysAgo(25), expiresISO: daysFromNow(65), status: 'Open' },
  { id: 'REF-011', patientId: '111222333', familyId: 'FAM-001', type: 'הפניה לרופא עיניים', examCode: 'EYE-800', examName: 'רופא עיניים', referringDoctor: 'ד"ר יוסי מזרחי', referralNumber: 'HP-20250050', createdISO: daysAgo(150), expiresISO: daysAgo(60), status: 'Expired' },
];

// ─── Commitments ───
export const initialCommitments: Commitment[] = [
  { id: 'CMT-001', patientId: '123456789', familyId: 'FAM-001', description: 'התחייבות לבדיקת דם תקופתית', createdISO: daysAgo(90), status: 'Active' },
  { id: 'CMT-002', patientId: '123456789', familyId: 'FAM-001', description: 'מעקב לחץ דם - 3 חודשים', createdISO: daysAgo(60), status: 'Closed' },
  { id: 'CMT-003', patientId: '987654321', familyId: 'FAM-001', description: 'בדיקת ממוגרפיה שנתית', createdISO: daysAgo(30), status: 'Active' },
  { id: 'CMT-004', patientId: '987654321', familyId: 'FAM-001', description: 'מעקב תירואיד', createdISO: daysAgo(120), status: 'Active' },
  { id: 'CMT-005', patientId: '111222333', familyId: 'FAM-001', description: 'חיסונים לפי גיל', createdISO: daysAgo(45), status: 'Active' },
];

// ─── Available Slots ───
export const availableSlots: AvailableSlot[] = [
  { id: 'SL-001', serviceName: 'אולטרסאונד בטן', treatmentCode: 'US-101', startISO: daysFromNowAt(2, 9, 0), clinic: clinics.ramatAviv, providerName: 'ד"ר אלון שמיר', distanceKm: 2.1 },
  { id: 'SL-002', serviceName: 'אולטרסאונד בטן', treatmentCode: 'US-101', startISO: daysFromNowAt(2, 11, 30), clinic: clinics.herzliya, providerName: 'ד"ר נועה ברק', distanceKm: 12.5 },
  { id: 'SL-003', serviceName: 'אולטרסאונד בטן', treatmentCode: 'US-101', startISO: daysFromNowAt(3, 14, 0), clinic: clinics.petahTikva, providerName: 'ד"ר אלון שמיר', distanceKm: 18.3 },
  { id: 'SL-004', serviceName: 'אולטרסאונד בטן', treatmentCode: 'US-101', startISO: daysFromNowAt(5, 10, 0), clinic: clinics.ramatAviv, providerName: 'ד"ר נועה ברק', distanceKm: 2.1 },
  { id: 'SL-005', serviceName: 'אולטרסאונד שד', treatmentCode: 'US-201', startISO: daysFromNowAt(2, 10, 0), clinic: clinics.herzliya, providerName: 'ד"ר מיכל רוזן', distanceKm: 12.5 },
  { id: 'SL-006', serviceName: 'אולטרסאונד שד', treatmentCode: 'US-201', startISO: daysFromNowAt(4, 9, 30), clinic: clinics.ramatAviv, providerName: 'ד"ר מיכל רוזן', distanceKm: 2.1 },
  { id: 'SL-007', serviceName: 'אולטרסאונד תירואיד', treatmentCode: 'US-301', startISO: daysFromNowAt(3, 8, 30), clinic: clinics.ramatAviv, providerName: 'ד"ר אלון שמיר', distanceKm: 2.1 },
  { id: 'SL-008', serviceName: 'אולטרסאונד תירואיד', treatmentCode: 'US-301', startISO: daysFromNowAt(6, 13, 0), clinic: clinics.petahTikva, providerName: 'ד"ר נועה ברק', distanceKm: 18.3 },
  { id: 'SL-009', serviceName: 'אולטרסאונד הריון', treatmentCode: 'US-401', startISO: daysFromNowAt(1, 10, 0), clinic: clinics.ramatAviv, providerName: 'ד"ר שירה כץ', distanceKm: 2.1 },
  { id: 'SL-010', serviceName: 'אולטרסאונד הריון', treatmentCode: 'US-401', startISO: daysFromNowAt(3, 15, 30), clinic: clinics.herzliya, providerName: 'ד"ר שירה כץ', distanceKm: 12.5 },
  { id: 'SL-011', serviceName: 'אולטרסאונד כליות', treatmentCode: 'US-501', startISO: daysFromNowAt(4, 11, 0), clinic: clinics.petahTikva, providerName: 'ד"ר אלון שמיר', distanceKm: 18.3 },
  { id: 'SL-012', serviceName: 'אולטרסאונד כליות', treatmentCode: 'US-501', startISO: daysFromNowAt(7, 9, 0), clinic: clinics.ramatAviv, providerName: 'ד"ר נועה ברק', distanceKm: 2.1 },
  { id: 'SL-013', serviceName: 'אולטרסאונד בטן', treatmentCode: 'US-101', startISO: daysFromNowAt(8, 10, 30), clinic: clinics.herzliya, providerName: 'ד"ר אלון שמיר', distanceKm: 12.5 },
  { id: 'SL-014', serviceName: 'אולטרסאונד דופלר', treatmentCode: 'US-601', startISO: daysFromNowAt(5, 14, 0), clinic: clinics.ramatAviv, providerName: 'ד"ר שירה כץ', distanceKm: 2.1 },
  { id: 'SL-015', serviceName: 'אולטרסאונד דופלר', treatmentCode: 'US-601', startISO: daysFromNowAt(9, 11, 30), clinic: clinics.petahTikva, providerName: 'ד"ר נועה ברק', distanceKm: 18.3 },
  { id: 'SL-016', serviceName: 'אולטרסאונד שד', treatmentCode: 'US-201', startISO: daysFromNowAt(10, 9, 0), clinic: clinics.ramatAviv, providerName: 'ד"ר מיכל רוזן', distanceKm: 2.1 },
  { id: 'SL-017', serviceName: 'אולטרסאונד בטן', treatmentCode: 'US-101', startISO: daysFromNowAt(11, 13, 0), clinic: clinics.petahTikva, providerName: 'ד"ר אלון שמיר', distanceKm: 18.3 },
  { id: 'SL-018', serviceName: 'אולטרסאונד תירואיד', treatmentCode: 'US-301', startISO: daysFromNowAt(12, 10, 0), clinic: clinics.herzliya, providerName: 'ד"ר אלון שמיר', distanceKm: 12.5 },
];

// ─── Service Categories ───
export const serviceCategories: ServiceCategory[] = [
  { id: 'family', name: 'רפואה ראשונית', icon: '👨‍👩‍👧‍👦', isQF: false },
  { id: 'consultant', name: 'רפואה יועצת', icon: '🩺', isQF: false },
  { id: 'ultrasound', name: 'אולטרסאונד', icon: '📡', isQF: true },
  { id: 'institutes', name: 'מכונים', icon: '🏥', isQF: false },
  { id: 'complementary', name: 'רפואה משלימה', icon: '🌿', isQF: false },
];

// ─── Ultrasound exam types for search dropdown ───
export const ultrasoundExamTypes = [
  { code: 'US-101', name: 'אולטרסאונד בטן' },
  { code: 'US-201', name: 'אולטרסאונד שד' },
  { code: 'US-301', name: 'אולטרסאונד תירואיד' },
  { code: 'US-401', name: 'אולטרסאונד הריון' },
  { code: 'US-501', name: 'אולטרסאונד כליות' },
  { code: 'US-601', name: 'אולטרסאונד דופלר' },
];

// ─── S400 Mock Data ───

// Family doctor available slots
export const familyDoctorSlots = [
  { id: 'FD-001', time: daysFromNowAt(1, 8, 30), type: 'ביקור רגיל' },
  { id: 'FD-002', time: daysFromNowAt(1, 10, 0), type: 'ביקור רגיל' },
  { id: 'FD-003', time: daysFromNowAt(2, 9, 0), type: 'מעקב' },
  { id: 'FD-004', time: daysFromNowAt(2, 14, 30), type: 'ביקור רגיל' },
  { id: 'FD-005', time: daysFromNowAt(3, 11, 0), type: 'ביקור דחוף' },
  { id: 'FD-006', time: daysFromNowAt(4, 8, 0), type: 'ביקור רגיל' },
];

// Consultant specialties
export const consultantSpecialties = [
  { id: 'surgery', name: 'כירורגיה', subSpecialties: ['כירורגיה כללית', 'כירורגיית כלי דם'] },
  { id: 'neurology', name: 'נוירולוגיה', subSpecialties: ['נוירולוגיה כללית', 'נוירולוגיה ילדים'] },
  { id: 'cardiology', name: 'קרדיולוגיה', subSpecialties: ['קרדיולוגיה כללית', 'אלקטרופיזיולוגיה'] },
  { id: 'ent', name: 'אף אוזן גרון', subSpecialties: ['כללי', 'אלרגולוגיה'] },
  { id: 'ophthalmology', name: 'עיניים', subSpecialties: ['עיניים כללי', 'רשתית'] },
  { id: 'dermatology', name: 'עור', subSpecialties: ['עור כללי', 'עור קוסמטי'] },
  { id: 'orthopedics', name: 'אורתופדיה', subSpecialties: ['אורתופדיה כללית', 'ספורט'] },
  { id: 'gastro', name: 'גסטרואנטרולוגיה', subSpecialties: ['גסטרו כללי', 'כבד'] },
];

// Mock consultant slots
export const consultantSlots = [
  { id: 'CS-001', doctorName: 'ד"ר יעקב גולדברג', specialty: 'קרדיולוגיה', subSpecialty: 'קרדיולוגיה כללית', clinic: clinics.ramatAviv, startISO: daysFromNowAt(3, 10, 0) },
  { id: 'CS-002', doctorName: 'ד"ר סמדר ביטון', specialty: 'נוירולוגיה', subSpecialty: 'נוירולוגיה כללית', clinic: clinics.petahTikva, startISO: daysFromNowAt(4, 14, 30) },
  { id: 'CS-003', doctorName: 'ד"ר אמיר חסון', specialty: 'אורתופדיה', subSpecialty: 'אורתופדיה כללית', clinic: clinics.herzliya, startISO: daysFromNowAt(2, 9, 0) },
  { id: 'CS-004', doctorName: 'ד"ר רונית שפירא', specialty: 'עיניים', subSpecialty: 'עיניים כללי', clinic: clinics.ramatAviv, startISO: daysFromNowAt(5, 11, 30) },
  { id: 'CS-005', doctorName: 'ד"ר משה דהן', specialty: 'עור', subSpecialty: 'עור כללי', clinic: clinics.petahTikva, startISO: daysFromNowAt(6, 8, 0) },
  { id: 'CS-006', doctorName: 'ד"ר טלי ורדי', specialty: 'גסטרואנטרולוגיה', subSpecialty: 'גסטרו כללי', clinic: clinics.ramatAviv, startISO: daysFromNowAt(3, 15, 0) },
  { id: 'CS-007', doctorName: 'ד"ר עופר נחום', specialty: 'כירורגיה', subSpecialty: 'כירורגיה כללית', clinic: clinics.herzliya, startISO: daysFromNowAt(7, 10, 0) },
  { id: 'CS-008', doctorName: 'ד"ר לימור אלון', specialty: 'אף אוזן גרון', subSpecialty: 'כללי', clinic: clinics.petahTikva, startISO: daysFromNowAt(4, 9, 30) },
  { id: 'CS-009', doctorName: 'ד"ר יעקב גולדברג', specialty: 'קרדיולוגיה', subSpecialty: 'אלקטרופיזיולוגיה', clinic: clinics.herzliya, startISO: daysFromNowAt(8, 13, 0) },
  { id: 'CS-010', doctorName: 'ד"ר אמיר חסון', specialty: 'אורתופדיה', subSpecialty: 'ספורט', clinic: clinics.ramatAviv, startISO: daysFromNowAt(5, 16, 0) },
];

// Institute types
export const instituteTypes = [
  { id: 'xray', name: 'רנטגן', code: 'XR-100' },
  { id: 'holter', name: 'הולטר', code: 'HLT-200' },
  { id: 'pregnancy', name: 'מעקב הריון', code: 'PRG-300' },
  { id: 'hearing', name: 'בדיקת שמיעה', code: 'AUD-400' },
  { id: 'physio', name: 'פיזיותרפיה', code: 'PHY-500' },
  { id: 'stress', name: 'בדיקת מאמץ', code: 'STR-600' },
];

// Mock institute slots
export const instituteSlots = [
  { id: 'IS-001', instituteName: 'רנטגן', code: 'XR-100', clinic: clinics.ramatAviv, startISO: daysFromNowAt(1, 8, 0), providerName: 'צוות רנטגן' },
  { id: 'IS-002', instituteName: 'רנטגן', code: 'XR-100', clinic: clinics.herzliya, startISO: daysFromNowAt(2, 10, 30), providerName: 'צוות רנטגן' },
  { id: 'IS-003', instituteName: 'הולטר', code: 'HLT-200', clinic: clinics.petahTikva, startISO: daysFromNowAt(3, 9, 0), providerName: 'מעבדת הולטר' },
  { id: 'IS-004', instituteName: 'הולטר', code: 'HLT-200', clinic: clinics.ramatAviv, startISO: daysFromNowAt(5, 11, 0), providerName: 'מעבדת הולטר' },
  { id: 'IS-005', instituteName: 'מעקב הריון', code: 'PRG-300', clinic: clinics.ramatAviv, startISO: daysFromNowAt(2, 14, 0), providerName: 'ד"ר שירה כץ' },
  { id: 'IS-006', instituteName: 'בדיקת שמיעה', code: 'AUD-400', clinic: clinics.herzliya, startISO: daysFromNowAt(4, 8, 30), providerName: 'מכון שמיעה' },
  { id: 'IS-007', instituteName: 'פיזיותרפיה', code: 'PHY-500', clinic: clinics.ramatAviv, startISO: daysFromNowAt(1, 16, 0), providerName: 'מכון פיזיותרפיה' },
  { id: 'IS-008', instituteName: 'פיזיותרפיה', code: 'PHY-500', clinic: clinics.petahTikva, startISO: daysFromNowAt(3, 10, 0), providerName: 'מכון פיזיותרפיה' },
  { id: 'IS-009', instituteName: 'בדיקת מאמץ', code: 'STR-600', clinic: clinics.herzliya, startISO: daysFromNowAt(6, 9, 0), providerName: 'מעבדת מאמץ' },
  { id: 'IS-010', instituteName: 'בדיקת מאמץ', code: 'STR-600', clinic: clinics.ramatAviv, startISO: daysFromNowAt(8, 13, 30), providerName: 'מעבדת מאמץ' },
];
