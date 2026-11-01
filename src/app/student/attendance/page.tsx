'use client';

import { useState } from 'react';
import PortalShell from '../../../components/portal-shell';
import { Badge, BarList, Callout, PageFrame, Panel, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { attendanceTrend } from '../../../lib/atlas-data';

const history = [
  { date: '28 Oct 2026', status: 'present', note: 'All four periods' },
  { date: '27 Oct 2026', status: 'late', note: 'Arrived 09:12 · transport delay' },
  { date: '26 Oct 2026', status: 'present', note: 'Full day' },
  { date: '23 Oct 2026', status: 'absent', note: 'Excused · medical appointment' },
  { date: '22 Oct 2026', status: 'present', note: 'Full day' },
];

export default function StudentAttendancePage() {
  const [date, setDate] = useState('2026-11-03');
  const [reason, setReason] = useState('Medical appointment');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <PortalShell role="student">
      <PageFrame
        variant="portal"
        eyebrow="Student space"
        title="My attendance"
        description="96% this term — above the 90% threshold. Report an absence in advance and attach supporting evidence if you have it."
      >
        <StatGrid
          items={[
            { label: 'Attendance', value: '96%', detail: 'Term 1 to date', tone: 'success' },
            { label: 'Days present', value: '42', detail: 'Of 44 teaching days' },
            { label: 'Late arrivals', value: '3', detail: 'Second threshold triggers a tutor meeting', tone: 'warn' },
            { label: 'Excused absences', value: '1', detail: 'Documentation on file' },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <Panel title="Weekly pattern" description="Your attendance across the last teaching week.">
            <BarList items={attendanceTrend.map(day => ({ label: day.day, value: day.rate, display: `${day.rate}%` }))} tone="brand" />
            <p className="mt-4 text-[12px] text-slate-500">Attendance is recorded every period. If a register is wrong, ask your class tutor to correct it within 24 hours.</p>
          </Panel>

          <Panel title="Report an absence" description="Guardian approval is required for absence during school hours.">
            {submitted ? (
              <div className="rounded border-l-4 border-emerald-500 bg-emerald-50/70 p-4 text-[13px] text-slate-700">
                <p className="font-semibold text-slate-800">Absence reported for {date}</p>
                <p className="mt-1">Your class tutor and guardian have been notified. You will see the approval in this page.</p>
                <button type="button" onClick={() => { setSubmitted(false); setNote(''); }} className="mt-3 rounded border border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-white">Report another</button>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-[13px]">
                  <span className="font-semibold text-[#15133d]">Date</span>
                  <input type="date" value={date} onChange={event => setDate(event.target.value)} className="mt-1.5 w-full rounded border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-[#1738a8]" />
                </label>
                <label className="block text-[13px]">
                  <span className="font-semibold text-[#15133d]">Reason</span>
                  <select value={reason} onChange={event => setReason(event.target.value)} className="mt-1.5 w-full rounded border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-[#1738a8]">
                    {['Medical appointment', 'Family emergency', 'School-approved activity', 'Transport disruption', 'Other'].map(option => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label className="block text-[13px]">
                  <span className="font-semibold text-[#15133d]">Note for your tutor</span>
                  <textarea value={note} onChange={event => setNote(event.target.value)} rows={3} placeholder="Add any details that would help your tutor." className="mt-1.5 w-full rounded border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-[#1738a8]" />
                </label>
                <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-[12px] text-slate-500">Attach a document (optional) · PDF or photo up to 5 MB</div>
                <button type="button" onClick={() => setSubmitted(true)} className="rounded bg-[#1738a8] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#102d88]">Submit request</button>
              </div>
            )}
          </Panel>
        </div>

        <Panel title="Attendance history" description="Recent registers and the reason recorded." className="overflow-hidden" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Date</Th><Th>Status</Th><Th>Note</Th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {history.map(item => (
                  <tr key={item.date}>
                    <Td className="font-medium text-[#15133d]">{item.date}</Td>
                    <Td><Badge tone={statusTone(item.status)}>{item.status}</Badge></Td>
                    <Td>{item.note}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Callout tone="warn" title="Exam eligibility depends on attendance.">
          Learners below 85% attendance in a subject may need an attendance review before sitting the exam. Talk to your tutor early — support is available.
        </Callout>
      </PageFrame>
    </PortalShell>
  );
}
