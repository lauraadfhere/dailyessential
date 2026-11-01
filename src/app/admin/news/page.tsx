'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AdminListPanel from '../../../components/admin-list-panel';
import AdminShell from '../../../components/admin-shell';
import { countByStatus, formatAdminDate, newsUpdates, type NewsStatus, type NewsUpdateItem } from '../../../lib/admin-data';

export default function AdminNewsPage() {
  const [rows, setRows] = useState<NewsUpdateItem[]>(newsUpdates);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.news) && data.news.length) setRows(data.news);
      })
      .catch(() => undefined);
  }, []);

  const tabs = useMemo(() => ([
    { id: 'published', label: 'Published', count: countByStatus(rows, 'published') },
    { id: 'draft', label: 'Draft', count: countByStatus(rows, 'draft') },
    { id: 'archived', label: 'Archived', count: countByStatus(rows, 'archived') },
    { id: 'all', label: 'All', count: rows.length },
  ] as const), [rows]);

  return (
    <AdminShell showSidebar>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef1f4] px-5 py-4">
        <div>
          <h1 className="text-lg font-semibold text-[#2f3338]">Latest News & Updates</h1>
          <p className="mt-1 text-sm text-[#6b7380]">Publish school announcements and keep families informed.</p>
        </div>
        <Link href="/admin/news/new" className="rounded bg-[#2e9fff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f8eef]">
          New update
        </Link>
      </div>

      <AdminListPanel
        tabs={[...tabs]}
        defaultTab="published"
        searchPlaceholder="Search news..."
        emptyTitle="No news items in this view yet."
        emptyHint="Draft an update for parents, learners and staff"
      >
        {({ tab, query }) => {
          const status = tab as NewsStatus;
          const filtered = rows.filter(item => {
            const statusMatch = status === 'all' || item.status === status;
            const q = !query
              || item.title.toLowerCase().includes(query)
              || item.summary.toLowerCase().includes(query)
              || item.category.toLowerCase().includes(query);
            return statusMatch && q;
          });
          if (!filtered.length) return null;

          return filtered.map(item => (
            <article key={item.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-[15px] font-semibold text-[#2f3338]">{item.title}</h3>
                  {item.pinned && <span className="rounded bg-[#e8eefc] px-2 py-0.5 text-[10px] font-bold uppercase text-[#1738a8]">Pinned</span>}
                </div>
                <p className="mt-1 text-sm text-[#6b7380]">{item.category} · {item.authorName}</p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4a515a]">{item.summary}</p>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9aa3ad]">{item.status}</p>
                <p className="mt-1 text-sm text-[#6b7380]">{formatAdminDate(item.publishedAt)}</p>
                <Link href={`/admin/news/${item.id}`} className="mt-3 inline-block rounded border border-[#d8dde4] px-3 py-1.5 text-xs font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">
                  Open
                </Link>
              </div>
            </article>
          ));
        }}
      </AdminListPanel>
    </AdminShell>
  );
}
