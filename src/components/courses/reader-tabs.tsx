'use client';

import { useState, type ReactNode } from 'react';

const tabs = ['Lesson', 'Activities', 'Notes', 'PDF view', 'AI assistant', 'Files'] as const;
type Tab = (typeof tabs)[number];

/** Moodle-style activity tabs: the lesson, a printable PDF document view, the AI assistant and downloads. */
export default function ReaderTabs({
  lesson,
  activities,
  notes,
  document,
  ai,
  files,
}: {
  lesson: ReactNode;
  activities: ReactNode;
  notes: ReactNode;
  document: ReactNode;
  ai: ReactNode;
  files: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>('Lesson');
  return (
    <div>
      <div role="tablist" aria-label="Reader views" className="no-print flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map(name => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={tab === name}
            onClick={() => setTab(name)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-bold ${tab === name ? 'border-b-2 border-[#1738a8] text-[#1738a8]' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {name}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-6">
        {tab === 'Lesson' && lesson}
        {tab === 'Activities' && activities}
        {tab === 'Notes' && notes}
        {tab === 'PDF view' && document}
        {tab === 'AI assistant' && ai}
        {tab === 'Files' && files}
      </div>
    </div>
  );
}
