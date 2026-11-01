'use client';

import AdminListPanel from '../../../components/admin-list-panel';
import ConsoleShell from '../../../components/console-shell';
import { countPapers, gradingPapers } from '../../../lib/examiner-data';

export default function ExaminerGradingPage() {
  return (
    <ConsoleShell role="examiner" showSidebar>
      <AdminListPanel
        tabs={[
          { id: 'pending', label: 'Pending', count: countPapers('pending') },
          { id: 'approved', label: 'Approved', count: countPapers('approved') },
          { id: 'spam', label: 'Returned', count: countPapers('returned') },
          { id: 'deleted', label: 'Deleted', count: countPapers('deleted') },
          { id: 'all', label: 'All', count: countPapers('all') },
        ]}
        defaultTab="pending"
        searchPlaceholder="Search papers..."
        emptyTitle="Nice work! You've moderated all Pending papers."
        emptyHint="Check quality control samples to keep marking consistent."
      >
        {({ tab, query }) => {
          const rows = gradingPapers.filter(item => {
            const statusMatch = tab === 'all' || item.status === tab || (tab === 'spam' && item.status === 'returned');
            const q = !query || item.candidate.toLowerCase().includes(query) || item.paper.toLowerCase().includes(query) || item.subject.toLowerCase().includes(query);
            return statusMatch && q;
          });
          if (!rows.length) return null;
          return rows.map(item => (
            <article key={item.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-[#2f3338]">{item.paper}</h3>
                <p className="mt-1 text-sm text-[#6b7380]">{item.candidate} · {item.subject}</p>
                <p className="mt-2 text-sm text-[#4a515a]">Submitted {item.submittedAt} · Score {item.score ?? '—'} / {item.max}</p>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9aa3ad]">{item.status}</p>
                <div className="mt-3 flex gap-2 sm:justify-end">
                  <button type="button" className="rounded border border-[#d8dde4] px-3 py-1.5 text-xs font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Open</button>
                  <button type="button" className="rounded bg-[#2e9fff] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1f8eef]">Approve</button>
                </div>
              </div>
            </article>
          ));
        }}
      </AdminListPanel>
    </ConsoleShell>
  );
}
