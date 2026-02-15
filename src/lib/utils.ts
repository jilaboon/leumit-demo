export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} ${formatTime(iso)}`;
}

export function getPatientName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    Scheduled: 'מתוכנן',
    Completed: 'הושלם',
    Canceled: 'בוטל',
    Open: 'פתוח',
    Used: 'נוצל',
    Expired: 'פג תוקף',
    Canceled: 'בוטלה',
    Active: 'פעיל',
    Closed: 'סגור',
    OK: 'תקין',
    WARN: 'אזהרה',
  };
  return map[status] || status;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    Scheduled: 'bg-blue-100 text-blue-800',
    Completed: 'bg-green-100 text-green-800',
    Canceled: 'bg-red-100 text-red-800',
    Open: 'bg-blue-100 text-blue-800',
    Used: 'bg-green-100 text-green-800',
    Expired: 'bg-gray-100 text-gray-600',
    Canceled: 'bg-red-100 text-red-800',
    Active: 'bg-emerald-100 text-emerald-800',
    Closed: 'bg-gray-100 text-gray-600',
    OK: 'bg-green-100 text-green-800',
    WARN: 'bg-amber-100 text-amber-800',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
}

export function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    Family: 'רפואת משפחה',
    Consultant: 'רפואה מייעצת',
    Ultrasound: 'אולטרסאונד',
    Institutes: 'מכונים',
    Complementary: 'רפואה משלימה',
  };
  return map[cat] || cat;
}
