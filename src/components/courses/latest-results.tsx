'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Row = { slug: string; title: string; grade: { mark: number; label: string; percent: number } };

/** Real course grades for the student dashboard (replaces the old placeholder list). */
export default function LatestResults() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    fetch('/api/progress/report', { cache: 'no-store' })
      .then(response => (response.ok ? response.json() : { courses: [] }))
      .then(data => setRows(((data.courses || []) as Row[]).slice(0, 4)))
      .catch(() => setRows([]));
  }, []);

  return (
    <article className="bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-[#1738a8] sm:text-lg">Latest results</h2>
        <Link href="/student/track" className="text-xs font-bold text-slate-900 underline">Track all</Link>
      </div>
      <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
        {rows === null && <p className="text-sm text-slate-500">Loading…</p>}
        {rows?.length === 0 && <p className="text-sm text-slate-500">No graded courses yet. Enrol in a course and complete its activities to see your results here.</p>}
        {rows?.map(row => (
          <Link key={row.slug} href={`/courses/${row.slug}/reader/0`} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 text-sm hover:text-[#1738a8]">
            <span className="min-w-0 truncate">{row.title}</span>
            <b className="shrink-0 text-[#1738a8]">{row.grade.mark}/20</b>
          </Link>
        ))}
      </div>
    </article>
  );
}
