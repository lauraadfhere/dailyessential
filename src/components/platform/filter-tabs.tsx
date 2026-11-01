'use client';

export default function FilterTabs({
  tabs,
  value,
  onChange,
  className = '',
}: {
  tabs: { id: string; label: string; count?: number }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-1 border-b border-[#eef1f4] ${className}`} role="tablist">
      {tabs.map(tab => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={`relative px-3.5 py-3 text-[13px] font-medium transition ${selected ? 'text-[#2e9fff]' : 'text-[#6b7380] hover:text-[#2f3338]'}`}
          >
            {tab.label}
            {typeof tab.count === 'number' ? ` (${tab.count})` : ''}
            {selected && <span className="absolute inset-x-2 top-0 h-[3px] rounded-b bg-[#2e9fff]" />}
          </button>
        );
      })}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`flex min-w-[190px] items-center gap-2 rounded border border-[#d8dde4] bg-white px-3 py-2 text-sm text-[#6b7380] ${className}`}>
      <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="10.5" cy="10.5" r="5.5" />
        <path strokeLinecap="round" d="m15 15 3.5 3.5" />
      </svg>
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-[#2f3338] outline-none placeholder:text-[#9aa3ad]"
      />
    </label>
  );
}

export function SelectField({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 rounded border border-[#d8dde4] bg-white px-2.5 py-1.5 text-[12px] text-[#4a515a]">
      {label && <span className="text-[#9aa3ad]">{label}</span>}
      <select value={value} onChange={event => onChange(event.target.value)} className="bg-transparent text-[12px] font-medium outline-none">
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
