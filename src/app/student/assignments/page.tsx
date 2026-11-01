'use client';

import { useState } from 'react';
import PortalShell from '../../../components/portal-shell';
import FilterTabs from '../../../components/platform/filter-tabs';
import { Badge, Callout, EmptyNote, PageFrame, Panel, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { assignmentRecords, type AssignmentStatus } from '../../../lib/atlas-data';

export default function StudentAssignmentsPage() {
  const [tab, setTab] = useState('all');
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [receipt, setReceipt] = useState<string | null>(null);

  const rows = assignmentRecords.map(item => submitted[item.id] ? { ...item, status: 'submitted' as AssignmentStatus } : item);
  const visible = rows.filter(item => tab === 'all' || item.status === tab);
  const pending = rows.filter(item => item.status === 'pending' || item.status === 'late').length;

  const submit = (id: string, title: string) => {
    setSubmitted(current => ({ ...current, [id]: true }));
    setReceipt(title);
  };

  return (
    <PortalShell role="student">
      <PageFrame
        variant="portal"
        eyebrow="Student space"
        title="Assignments"
        description="Everything due, submitted or graded. Upload files, add a note, and keep the submission receipt."
        actions={<button type="button" className="rounded bg-[#1738a8] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#102d88]">New submission</button>}
      >
        <StatGrid
          items={[
            { label: 'Due soon', value: String(pending), detail: 'Including one late item', tone: pending ? 'warn' : undefined },
            { label: 'Submitted', value: String(rows.filter(item => item.status === 'submitted').length), detail: 'Awaiting marking' },
            { label: 'Graded', value: String(rows.filter(item => item.status === 'graded').length), detail: 'Feedback available' },
            { label: 'On-time rate', value: '88%', detail: 'This term' },
          ]}
        />

        {receipt && (
          <div className="rounded border-l-4 border-emerald-500 bg-emerald-50/70 px-4 py-3 text-[13px] text-slate-700">
            <p className="font-semibold text-slate-800">Submission received — {receipt}</p>
            <p className="mt-0.5">Timestamp {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · your teacher has been notified.</p>
          </div>
        )}

        <Panel className="overflow-hidden" bodyClassName="p-0">
          <FilterTabs
            tabs={[
              { id: 'all', label: 'All', count: rows.length },
              { id: 'pending', label: 'To do', count: rows.filter(item => item.status === 'pending').length },
              { id: 'late', label: 'Late', count: rows.filter(item => item.status === 'late').length },
              { id: 'submitted', label: 'Submitted', count: rows.filter(item => item.status === 'submitted').length },
              { id: 'graded', label: 'Graded', count: rows.filter(item => item.status === 'graded').length },
            ]}
            value={tab}
            onChange={setTab}
            className="px-2"
          />
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Assignment</Th><Th>Course</Th><Th>Due</Th><Th>Status</Th><Th>Score</Th><Th className="text-right">Action</Th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map(item => (
                  <tr key={item.id}>
                    <Td>
                      <p className="font-semibold text-[#15133d]">{item.title}</p>
                      {item.feedback && <p className="mt-0.5 max-w-sm text-[11px] text-slate-500">{item.feedback}</p>}
                    </Td>
                    <Td>{item.course}</Td>
                    <Td className="whitespace-nowrap">{item.due}</Td>
                    <Td><Badge tone={statusTone(item.status)}>{item.status}</Badge></Td>
                    <Td>{item.score === null ? '—' : `${item.score} / ${item.max}`}</Td>
                    <Td className="text-right">
                      {item.status === 'pending' || item.status === 'late' ? (
                        <button type="button" onClick={() => submit(item.id, item.title)} className="rounded bg-[#1738a8] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#102d88]">Submit</button>
                      ) : item.status === 'submitted' ? (
                        <span className="text-[11px] text-slate-400">Submitted · locked</span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Graded</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!visible.length && <EmptyNote>Nothing in this view. Enjoy the clear runway.</EmptyNote>}
        </Panel>

        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="Submission options">
            <ul className="space-y-2.5 text-[13px] leading-6 text-slate-600">
              <li className="flex gap-2"><span className="text-[#1738a8]">•</span>Upload one or more files, or type your answer directly.</li>
              <li className="flex gap-2"><span className="text-[#1738a8]">•</span>Use your phone camera for handwritten work.</li>
              <li className="flex gap-2"><span className="text-[#1738a8]">•</span>Drafts save automatically; resubmission is allowed until the due date.</li>
              <li className="flex gap-2"><span className="text-[#1738a8]">•</span>Late work can be submitted with a note after the deadline.</li>
            </ul>
          </Panel>
          <Panel title="Academic integrity">
            <Callout tone="warn" title="Cite every source.">
              Submissions may be checked for similarity. If you used an AI assistant for drafting, declare it in the submission note — undeclared use is treated as misconduct.
            </Callout>
          </Panel>
        </div>
      </PageFrame>
    </PortalShell>
  );
}
