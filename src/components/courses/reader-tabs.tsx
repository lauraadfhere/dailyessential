'use client';

import { useState } from 'react';

const tabs = ['Lesson', 'PDF view', 'Files'] as const;
type Tab = (typeof tabs)[number];

/** Tabs for the reader pane: the lesson, a printable PDF view of it, and downloadable course files. */
export default function ReaderTabs({ lesson, pdfTitle, files }: { lesson: React.ReactNode; pdfTitle: string; files: { label: string; href: string }[] }) {
  const [tab, setTab] = useState<Tab>('Lesson');
  return (
    <div>
      <div role="tablist" aria-label="Reader views" className="flex gap-1 border-b border-slate-200">
        {tabs.map(name => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={tab === name}
            onClick={() => setTab(name)}
            className={`px-4 py-2 text-sm font-bold ${tab === name ? 'border-b-2 border-[#1738a8] text-[#1738a8]' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {name}
          </button>
        ))}
      </div>

      {tab === 'Lesson' && <div className="mt-6">{lesson}</div>}

      {tab === 'PDF view' && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm text-slate-700">Print or save this lesson as a PDF using your browser’s print dialog.</p>
            <button type="button" onClick={() => window.print()} className="bg-[#1738a8] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#102d88]">
              Print / save as PDF
            </button>
          </div>
          <div className="printable mt-4 border border-slate-200 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">{pdfTitle}</p>
            <div className="mt-4">{lesson}</div>
          </div>
        </div>
      )}

      {tab === 'Files' && (
        <ul className="mt-6 divide-y divide-slate-200 border border-slate-200 bg-white">
          {files.map(file => (
            <li key={file.href} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="text-slate-800">{file.label}</span>
              <a href={file.href} download className="font-bold text-[#1738a8] hover:underline">Download</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
