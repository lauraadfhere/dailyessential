'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import ConsoleShell from '../../../components/console-shell';
import { Badge, Callout, PageFrame, Panel, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { attendanceRegister } from '../../../lib/atlas-data';

const cycle = ['present', 'late', 'absent', 'excused'] as const;
type AttendanceStatus = (typeof cycle)[number];

const toneFor: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  late: 'bg-amber-50 text-amber-700 border-amber-200',
  absent: 'bg-rose-50 text-rose-700 border-rose-200',
  excused: 'bg-sky-50 text-sky-700 border-sky-200',
};

export default function TeacherAttendancePage() {
  const [rows, setRows] = useState(attendanceRegister.map(row => ({ ...row, status: row.status as AttendanceStatus })));
  const [saved, setSaved] = useState(false);

  const counts = useMemo(() => cycle.reduce<Record<AttendanceStatus, number>>((acc, status) => {
    acc[status] = rows.filter(row => row.status === status).length;
    return acc;
  }, { present: 0, late: 0, absent: 0, excused: 0 }), [rows]);

  const setStatus = (id: string, status: AttendanceStatus) => {
    setRows(current => current.map(row => row.id === id ? { ...row, status } : row));
    setSaved(false);
  };

  const next = (id: string) => {
    const current = rows.find(row => row.id === id);
    if (!current) return;
    const index = cycle.indexOf(current.status);
    setStatus(id, cycle[(index + 1) % cycle.length]);
  };

  const markAllPresent = () => {
    setRows(current => current.map(row => ({ ...row, status: 'present' })));
    setSaved(false);
  };

  return (
    <ConsoleShell role="teacher" showSidebar>
      <PageFrame
        eyebrow="JSS 2 Blue · Period 3 · Digital Literacy"
        title="Take attendance"
        description="Tap a learner to cycle present → late → absent → excused. Attendance locks after 24 hours; later corrections need a reason."
        actions={
          <>
            <button type="button" onClick={markAllPresent} className="rounded border border-[#d8dde4] px-3 py-2 text-[13px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Mark all present</button>
            <button type="button" onClick={() => setSaved(true)} className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">Save register</button>
          </>
        }
      >
        <StatGrid
          items={[
            { label: 'Present', value: String(counts.present), detail: 'Ready to submit' },
            { label: 'Late', value: String(counts.late), detail: 'Parent notified automatically', tone: 'warn' },
            { label: 'Absent', value: String(counts.absent), detail: 'Absence alerts queued', tone: counts.absent ? 'danger' : undefined },
            { label: 'Excused', value: String(counts.excused), detail: 'Documentation on file' },
          ]}
        />

        <Panel className="overflow-hidden" bodyClassName="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef1f4] px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[#2f3338]">Register</h2>
              <p className="mt-1 text-[13px] text-[#6b7380]">{rows.length} learners · JSS 2 Blue · Mr. Eze</p>
            </div>
            {saved && <Badge tone="success">Register saved</Badge>}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Learner</Th><Th>Status</Th><Th className="text-right">Mark</Th></tr></thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {rows.map(row => (
                  <tr key={row.id}>
                    <Td className="font-medium text-[#2f3338]">{row.student}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-1.5">
                        {cycle.map(status => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setStatus(row.id, status)}
                            aria-pressed={row.status === status}
                            className={`rounded border px-2.5 py-1 text-[11px] font-semibold capitalize transition ${row.status === status ? toneFor[status] : 'border-[#e1e5eb] bg-white text-[#9aa3ad] hover:bg-[#f5f7f9]'}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </Td>
                    <Td className="text-right">
                      <button type="button" onClick={() => next(row.id)} className="rounded border border-[#d8dde4] px-2.5 py-1.5 text-[11px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Next →</button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Absence follow-up" description="Automatically queued for learners marked absent.">
            <ul className="space-y-3 text-[13px]">
              <li className="flex items-center justify-between gap-3 border-b border-[#f2f4f7] pb-2.5"><span className="text-[#2f3338]">Chloe Nwosu</span><Badge tone="warn">parent SMS queued</Badge></li>
              <li className="flex items-center justify-between gap-3 border-b border-[#f2f4f7] pb-2.5"><span className="text-[#2f3338]">Kwame Mensah</span><Badge tone="info">late arrival logged</Badge></li>
              <li className="flex items-center justify-between gap-3"><span className="text-[#2f3338]">Daniel Osei</span><Badge tone="neutral">excused · medical note</Badge></li>
            </ul>
          </Panel>
          <Panel title="Offline & kiosk capture" description="For trips and lab lessons.">
            <p className="text-[13px] leading-6 text-[#6b7380]">
              Registers keep working without a connection and sync when the device reconnects. The ID-card kiosk can also capture arrivals automatically.
            </p>
            <Link href="/admin/attendance" className="mt-3 inline-block text-[12px] font-semibold text-[#2e9fff] hover:underline">View school attendance →</Link>
          </Panel>
        </div>

        <Callout tone="warn" title="If you save the wrong status, correct it now.">
          Before the lock period you can edit freely. After it, the correction requires a reason and an administrator approval, and both values are kept.
        </Callout>
      </PageFrame>
    </ConsoleShell>
  );
}
