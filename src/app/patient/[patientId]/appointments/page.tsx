import { redirect } from 'next/navigation';

export default async function AppointmentsPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  redirect(`/patient/${patientId}/appointments/book`);
}
