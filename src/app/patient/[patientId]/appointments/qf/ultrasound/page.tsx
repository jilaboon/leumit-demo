import { redirect } from 'next/navigation';

export default async function QFUltrasoundPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  redirect(`/patient/${patientId}/appointments/qf/ultrasound/book`);
}
