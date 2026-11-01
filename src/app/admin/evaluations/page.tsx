'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminListPanel from '../../../components/admin-list-panel';
import AdminShell from '../../../components/admin-shell';
import { countByStatus, evaluationRequests, formatAdminDate, type EvaluationRequestItem, type EvaluationStatus } from '../../../lib/admin-data';

export default function AdminEvaluationsPage() {
  const [rows, setRows] = useState<EvaluationRequestItem[]>(evaluationRequests);
  const [source, setSource] = useState('demo');

  useEffect(() => {
    fetch('/api/admin/overview')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.evaluations) && data.evaluations.length) {
          setRows(data.evaluations);
          setSource(data.source || 'parse');
        }
      })
      .catch(() => undefined);
  }, []);

  const tabs = useMemo(() => ([
    { id: 'pending', label: 'Pending', count: countByStatus(rows, 'pending') },
    { id: 'approved', label: 'Approved', count: countByStatus(rows, 'approved') },
    { id: 'spam', label: 'Spam', count: countByStatus(rows, 'spam') },
    { id: 'deleted', label: 'Deleted', count: countByStatus(rows, 'deleted') },
    { id: 'all', label: 'All', count: rows.length },
  ] as const), [rows]);

  return (
    <AdminShell showSidebar>
      <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-[#9aa3ad]">Evaluations · {source}</p>
      <AdminListPanel
        tabs={[...tabs]}
        defaultTab="pending"
        searchPlaceholder="Search evaluation requests..."
        emptyTitle="Nice work! You've reviewed all Pending evaluation requests."
        emptyHint="School tips · keep placement criteria up to date"
      >
        {({ tab, query }) => {
          const status = tab as EvaluationStatus;
          const filtered = rows.filter(item => {
            const statusMatch = status === 'all' || item.status === status;
            const q = !query
              || item.requesterName.toLowerCase().includes(query)
              || item.subject.toLowerCase().includes(query)
              || item.programme.toLowerCase().includes(query);
            return statusMatch && q;
          });

          if (!filtered.length) return null;

          return filtered.map(item => (
            <article key={item.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-[15px] font-semibold text-[#2f3338]">{item.subject}</h3>
                  {item.priority === 'high' && (
                    <span className="rounded bg-[#fff4e5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#b86e00]">High</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-[#6b7380]">
                  {item.requesterName} · {item.requesterEmail} · {item.programme}
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4a515a]">{item.message}</p>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9aa3ad]">{item.status}</p>
                <p className="mt-1 text-sm text-[#6b7380]">{formatAdminDate(item.createdAt)}</p>
                <div className="mt-3 flex gap-2 sm:justify-end">
                  <button type="button" className="rounded border border-[#d8dde4] px-3 py-1.5 text-xs font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Open</button>
                  <button type="button" className="rounded bg-[#2e9fff] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1f8eef]">Approve</button>
                </div>
              </div>
            </article>
          ));
        }}
      </AdminListPanel>
    </AdminShell>
  );
}
