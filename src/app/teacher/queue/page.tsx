'use client';

import AdminListPanel from '../../../components/admin-list-panel';
import ConsoleShell from '../../../components/console-shell';
import { evaluationTracks, markbook } from '../../../lib/teacher-data';

const pendingMarks = markbook.filter(item => item.status === 'draft' || item.status === 'submitted');
const pendingEvals = evaluationTracks.filter(item => item.stage === 'requested' || item.stage === 'in-review');

export default function TeacherQueuePage() {
  const pendingCount = pendingMarks.length + pendingEvals.length;

  return (
    <ConsoleShell role="teacher" showSidebar>
      <AdminListPanel
        tabs={[
          { id: 'pending', label: 'Pending', count: pendingCount },
          { id: 'approved', label: 'Approved', count: markbook.filter(i => i.status === 'published').length },
          { id: 'spam', label: 'Needs rework', count: evaluationTracks.filter(i => i.stage === 'requested').length },
          { id: 'deleted', label: 'Archived', count: 0 },
          { id: 'all', label: 'All', count: markbook.length + evaluationTracks.length },
        ]}
        defaultTab="pending"
        searchPlaceholder="Search action queue..."
        emptyTitle="Nice work! You've moderated all Pending classroom actions."
        emptyHint="Want to keep classes thriving? Review attendance and progress next."
      >
        {({ tab, query }) => {
          const markRows = markbook.filter(item => {
            if (tab === 'spam') return false;
            const statusMatch = tab === 'all'
              || (tab === 'pending' && (item.status === 'draft' || item.status === 'submitted'))
              || (tab === 'approved' && item.status === 'published')
              || tab === 'deleted';
            const q = !query || item.learner.toLowerCase().includes(query) || item.assessment.toLowerCase().includes(query);
            return statusMatch && q;
          });
          const evalRows = evaluationTracks.filter(item => {
            const statusMatch = tab === 'all'
              || (tab === 'pending' && (item.stage === 'requested' || item.stage === 'in-review'))
              || (tab === 'approved' && (item.stage === 'scored' || item.stage === 'shared'))
              || (tab === 'spam' && item.stage === 'requested');
            const q = !query || item.learner.toLowerCase().includes(query) || item.subject.toLowerCase().includes(query);
            return statusMatch && q;
          });

          const rows = [
            ...markRows.map(item => ({
              id: item.id,
              title: `${item.assessment} · ${item.learner}`,
              meta: `${item.className} · mark ${item.score ?? '—'}/${item.max}`,
              status: item.status,
            })),
            ...evalRows.map(item => ({
              id: item.id,
              title: `${item.subject} · ${item.learner}`,
              meta: `${item.notes} · ${item.updatedAt}`,
              status: item.stage,
            })),
          ];

          if (!rows.length) return null;

          return rows.map(item => (
            <article key={item.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-[#2f3338]">{item.title}</h3>
                <p className="mt-1 text-sm text-[#6b7380]">{item.meta}</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-[#9aa3ad]">{item.status}</span>
            </article>
          ));
        }}
      </AdminListPanel>
    </ConsoleShell>
  );
}
