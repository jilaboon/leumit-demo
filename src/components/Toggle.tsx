'use client';

interface Props {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}

export default function Toggle({ options, value, onChange }: Props) {
  return (
    <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-1">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`
            px-4 py-2 text-sm font-medium rounded-md transition-all
            ${value === opt.id
              ? 'bg-white text-teal-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
