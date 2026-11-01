'use client';

import Link from 'next/link';
import { useState } from 'react';
import PortalShell from '../../../components/portal-shell';
import { Badge, BarList, Callout, PageFrame, Panel, Progress, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { assignmentRecords, attendanceTrend, gradeBands, parentChildren } from '../../../lib/atlas-data';

const courseOffsets = [3, -2, 1, -4, 6];

function bandFor(percent: number) {
  return gradeBands.find(band => {
    const [low, high] = band.range.split('–').map(value => Number(value.trim()));
    return percent >= low && percent <= high;
  }) || gradeBands[gradeBands.length - 1];
}

export default function ParentAcademicsPage() {
  const [childId, setChildId] = useState(parentChildren[0].id);
  const child = parentChildren.find(item => item.id === childId) || parentChildren[0];
  const results = [
    'UI / UX Design Studio',
    'Digital Literacy',
    'Computer Science',
    'Mathematics',
    'English Language',
  ].map((course, index) => {
    const value = Math.max(41, Math.min(98, child.average + courseOffsets[index]));
    return { course, value, band: bandFor(value) };
  });

  return (
    <PortalShell role="parent">
      <PageFrame
        variant="portal"
        eyebrow="Family portal"
        title="Academics"
        description="Marks, attendance and teacher feedback for the selected child. Marks appear only after the school publishes them."
        actions={<Link href="/parent/meetings" className="rounded border border-[#1738a8] px-3 py-2 text-[13px] font-semibold text-[#1738a8] hover:bg-[#e8eefc]">Discuss with teacher</Link>}
      >
        <div className="flex flex-wrap gap-2">
          {parentChildren.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setChildId(item.id)}
              className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition ${item.id === childId ? 'border-[#1738a8] bg-[#1738a8] text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-[#1738a8]'}`}
            >
              {item.name}
            </button>
          ))}
        </div>

        <StatGrid
          items={[
            { label: 'Average', value: `${child.average}%`, detail: `Grade ${bandFor(child.average).letter} · ${bandFor(child.average).descriptor}` },
            { label: 'Attendance', value: `${child.attendance}%`, detail: 'Term 1 to date', tone: child.attendance < 85 ? 'warn' : 'success' },
            { label: 'Assignments', value: child.id === 'st-1' ? '4 of 6 submitted' : '5 of 6 submitted', detail: 'Late work flagged in red' },
            { label: 'Teacher notes', value: '2', detail: 'Recognition and one concern' },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <Panel title="Course results" description={`${child.name} · ${child.className}`} className="overflow-hidden" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className={tableHead}><tr><Th>Course</Th><Th>Average</Th><Th>Grade</Th><Th>Comment</Th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map(result => (
                    <tr key={result.course}>
                      <Td className="font-semibold text-[#15133d]">{result.course}</Td>
                      <Td><Progress value={result.value} tone={result.value < 60 ? 'warn' : 'brand'} label={`${result.value}%`} /></Td>
                      <Td><Badge tone={result.value >= 70 ? 'success' : result.value >= 50 ? 'info' : 'warn'}>{result.band.letter}</Badge></Td>
                      <Td className="max-w-[220px] text-[12px]">
                        {result.value >= 70 ? 'Progressing well and contributing in class.' : 'Needs a steadier study routine; support is available.'}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="space-y-5">
            <Panel title="Attendance" description="Weekly pattern this term.">
              <BarList items={attendanceTrend.map(day => ({ label: day.day, value: day.rate, display: `${day.rate}%` }))} tone="brand" />
              <Link href="/parent/forms" className="mt-4 inline-block text-[12px] font-bold text-[#1738a8] hover:underline">Report an absence →</Link>
            </Panel>
            <Panel title="Teacher feedback">
              <ul className="space-y-3 text-[12px] leading-5 text-slate-600">
                <li className="rounded border-l-2 border-emerald-500 bg-emerald-50/60 px-3 py-2">
                  <span className="font-semibold text-slate-800">Recognition:</span> Outstanding peer mentoring during the design sprint.
                </li>
                <li className="rounded border-l-2 border-amber-500 bg-amber-50/60 px-3 py-2">
                  <span className="font-semibold text-slate-800">Focus:</span> Two homework tasks were submitted late; please check the planner each Monday.
                </li>
              </ul>
            </Panel>
          </div>
        </div>

        <Panel title="Assignments" description="What is submitted, missing or graded." className="overflow-hidden" bodyClassName="p-0">
          <table className="min-w-full text-sm">
            <thead className={tableHead}><tr><Th>Assignment</Th><Th>Course</Th><Th>Due</Th><Th>Status</Th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {assignmentRecords.map(item => (
                <tr key={item.id}>
                  <Td className="font-semibold text-[#15133d]">{item.title}</Td>
                  <Td>{item.course}</Td>
                  <Td className="whitespace-nowrap">{item.due}</Td>
                  <Td><Badge tone={statusTone(item.status)}>{item.status}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Callout tone="brand" title="Marks can be released to families on a delay.">
          The school may show results to learners before guardians, so families can discuss them together. This is configured by the academic director.
        </Callout>
      </PageFrame>
    </PortalShell>
  );
}
