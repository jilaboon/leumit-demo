import { getStatusLabel, getStatusColor } from '@/lib/utils';

interface Props {
  status: string;
  label?: string;
  className?: string;
}

export default function Badge({ status, label, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)} ${className}`}>
      {label || getStatusLabel(status)}
    </span>
  );
}
