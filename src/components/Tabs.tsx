'use client';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface Props {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange }: Props) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex gap-1" aria-label="טאבים">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-5 py-3 text-sm font-medium rounded-t-lg transition-colors relative
              ${activeTab === tab.id
                ? 'text-teal-700 bg-white border border-gray-200 border-b-white -mb-px'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.icon && <span className="ml-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
