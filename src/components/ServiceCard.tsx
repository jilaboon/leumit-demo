'use client';

import Link from 'next/link';

interface ContextRow {
  label: string;
  value: string;
  emphasis?: boolean;
}

interface Action {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface Props {
  title: string;
  subtitle?: string;
  icon: string;
  statusBadge: { label: string; variant: 'available' | 'limited' | 'disabled' };
  contextRows: ContextRow[];
  primaryAction: { label: string; href: string; disabled?: boolean };
  secondaryActions?: Action[];
  highlighted?: boolean;
}

export default function ServiceCard({
  title,
  subtitle,
  icon,
  statusBadge,
  contextRows,
  primaryAction,
  secondaryActions,
  highlighted,
}: Props) {
  const badgeColors = {
    available: 'bg-green-100 text-green-700',
    limited: 'bg-amber-100 text-amber-700',
    disabled: 'bg-gray-100 text-gray-500',
  };

  return (
    <div
      className={`
        bg-white rounded-2xl border-2 shadow-sm flex flex-col transition-all
        ${highlighted ? 'border-teal-200 ring-1 ring-teal-100' : 'border-gray-100'}
      `}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${highlighted ? 'bg-teal-50' : 'bg-gray-50'}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${badgeColors[statusBadge.variant]}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Context rows */}
      <div className="px-5 py-3 flex-1">
        <div className="space-y-2.5">
          {contextRows.map((row, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{row.label}</span>
              <span className={`font-medium ${row.emphasis ? 'text-teal-700' : 'text-gray-900'} truncate max-w-[60%] text-left`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {secondaryActions?.map((action, i) => (
            action.href ? (
              <Link
                key={i}
                href={action.href}
                className="text-xs text-gray-500 hover:text-teal-600 transition-colors"
              >
                {action.label}
              </Link>
            ) : (
              <button
                key={i}
                onClick={action.onClick}
                className="text-xs text-gray-500 hover:text-teal-600 transition-colors"
              >
                {action.label}
              </button>
            )
          ))}
        </div>

        {primaryAction.disabled ? (
          <span
            className="px-4 py-2 rounded-xl text-xs font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
            title="מחוץ להדגמה"
          >
            {primaryAction.label}
          </span>
        ) : (
          <Link
            href={primaryAction.href}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          >
            {primaryAction.label}
          </Link>
        )}
      </div>
    </div>
  );
}
