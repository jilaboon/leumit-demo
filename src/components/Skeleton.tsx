interface Props {
  className?: string;
  lines?: number;
}

export function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
  );
}

export default function Skeleton({ className = '', lines = 3 }: Props) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-10 bg-gray-100 rounded-lg" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-50 rounded-lg" />
      ))}
    </div>
  );
}
