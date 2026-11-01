'use client';

import { useMemo, useState, type ReactNode } from 'react';

export type AdminTab = {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
};

export default function AdminListPanel({
  tabs,
  defaultTab,
  searchPlaceholder = 'Search all...',
  emptyTitle,
  emptyHint,
  children,
}: {
  tabs: AdminTab[];
  defaultTab?: string;
  searchPlaceholder?: string;
  emptyTitle: string;
  emptyHint?: string;
  children: (ctx: { tab: string; query: string }) => ReactNode;
}) {
  const [tab, setTab] = useState(defaultTab || tabs[0]?.id || 'all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const activeTab = useMemo(() => tabs.find(item => item.id === tab) || tabs[0], [tab, tabs]);
  const content = children({ tab, query: query.trim().toLowerCase() });
  const isEmpty = content == null || content === false || (Array.isArray(content) && content.length === 0);

  return (
    <div className="flex min-h-[640px] flex-col">
      <div className="flex flex-wrap border-b border-[#e6e9ee]">
        {tabs.map(item => {
          const selected = item.id === activeTab?.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`relative flex items-center gap-2 px-4 py-3.5 text-[13px] font-medium transition ${selected ? 'text-[#2e9fff]' : 'text-[#6b7380] hover:text-[#2f3338]'}`}
            >
              {item.icon}
              <span>
                {item.label}
                {typeof item.count === 'number' ? ` (${item.count})` : ''}
              </span>
              {selected && <span className="absolute inset-x-0 top-0 h-[3px] bg-[#2e9fff]" />}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[#e6e9ee] bg-white px-3 py-2.5">
        <input type="checkbox" aria-label="Select all" className="h-4 w-4 accent-[#2e9fff]" />
        <label className="relative ml-1 flex min-w-[180px] flex-1 items-center gap-2 rounded border border-[#d8dde4] bg-white px-3 py-1.5 text-sm text-[#6b7380]">
          <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="10.5" cy="10.5" r="5.5" />
            <path strokeLinecap="round" d="m15 15 3.5 3.5" />
          </svg>
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#9aa3ad]"
          />
        </label>
        <button type="button" className="rounded border border-[#d8dde4] px-3 py-1.5 text-[12px] font-medium text-[#4a515a] hover:bg-[#f5f7f9]">Expand</button>
        <button type="button" className="rounded border border-[#d8dde4] px-3 py-1.5 text-[12px] font-medium text-[#4a515a] hover:bg-[#f5f7f9]">Filter by ▾</button>
        <button type="button" className="rounded border border-[#d8dde4] px-3 py-1.5 text-[12px] font-medium text-[#4a515a] hover:bg-[#f5f7f9]">
          <span className="inline-flex items-center gap-1.5">
            <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M8 3v4M16 3v4M3 11h18" />
            </svg>
            Past Year ▾
          </span>
        </button>
        <label className="rounded border border-[#d8dde4] px-2 py-1.5 text-[12px] font-medium text-[#4a515a]">
          <select value={sort} onChange={event => setSort(event.target.value)} className="bg-transparent outline-none">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </label>
      </div>

      <div className="flex flex-1 flex-col">
        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <div className="relative mb-6 flex items-end justify-center gap-3">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-[#e8f5ff] text-2xl text-[#2e9fff]">🙂</span>
              <span className="grid h-20 w-20 place-items-center rounded-full bg-[#dff1ff] text-3xl text-[#2e9fff]">💬</span>
              <span className="grid h-14 w-14 place-items-center rounded-full bg-[#e8f5ff] text-xl text-[#2e9fff]">:)</span>
            </div>
            <h2 className="max-w-md text-2xl font-semibold text-[#2f3338]">{emptyTitle}</h2>
            {emptyHint && <p className="mt-3 text-sm text-[#2e9fff]">{emptyHint}</p>}
          </div>
        ) : (
          <div className="divide-y divide-[#eef1f4]">{content}</div>
        )}
      </div>
    </div>
  );
}
