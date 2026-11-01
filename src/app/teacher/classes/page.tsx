'use client';

import Link from 'next/link';
import { useState } from 'react';
import ConsoleShell from '../../../components/console-shell';
import { Badge, Callout, KeyValueGrid, PageFrame, Panel, Progress, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { atlasStudents, sectionCatalog } from '../../../lib/atlas-data';

export default function TeacherClassesPage() {
  const [selected, setSelected] = useState('JSS 2 Blue');
  const section = sectionCatalog.find(item => item.name === selected) || sectionCatalog[1];
  const roster = atlasStudents.filter(student => student.className === selected);
  const withSupport = roster.filter(student => student.supports.length > 0);

  return (
    <ConsoleShell role="teacher" showSidebar>
      <PageFrame
        eyebrow="Class management"
        title="My classes"
        description="Every class you teach, with the learner context you need: attendance, support flags and the next action."
        actions={<Link href="/teacher/attendance" className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">Take attendance</Link>}
      >
        <StatGrid
          items={[
            { label: 'Classes', value: String(sectionCatalog.length), detail: 'Four teaching groups plus mentor group' },
            { label: 'Learners', value: String(atlasStudents.length), detail: 'Across your teaching groups' },
            { label: 'Support plans', value: String(atlasStudents.filter(student => student.supports.length).length), detail: 'Accommodations on file' },
            { label: 'At risk', value: String(atlasStudents.filter(student => student.risk === 'at-risk').length), detail: 'Flagged by attendance or marks', tone: 'danger' },
          ]}
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sectionCatalog.map(item => {
            const active = item.name === selected;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item.name)}
                className={`rounded-lg border bg-white p-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-[#2e9fff] ${active ? 'border-[#2e9fff] ring-1 ring-[#2e9fff]/20' : 'border-[#e1e5eb]'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-[14px] font-semibold text-[#2f3338]">{item.name}</h2>
                  <Badge tone={active ? 'info' : 'neutral'}>{item.room}</Badge>
                </div>
                <p className="mt-1 text-[12px] text-[#6b7380]">{item.grade} · Homeroom {item.homeroom}</p>
                <div className="mt-3"><Progress value={(item.learners / item.capacity) * 100} tone="info" label={`${item.learners} of ${item.capacity} seats`} /></div>
                <p className="mt-2 text-[11px] text-[#9aa3ad]">Class average {item.average}</p>
              </button>
            );
          })}
        </div>

        <Panel
          title={`${section.name} roster`}
          description={`${roster.length} learners in the record set · homeroom ${section.homeroom}`}
          action={<Link href="/teacher/marks" className="text-[12px] font-semibold text-[#2e9fff] hover:underline">Open markbook →</Link>}
          className="overflow-hidden"
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead}>
                <tr><Th>Learner</Th><Th>Guardian</Th><Th>Attendance</Th><Th>Average</Th><Th>Support</Th><Th>Risk</Th><Th className="text-right">Record</Th></tr>
              </thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {roster.map(student => (
                  <tr key={student.id} className="hover:bg-[#fbfcfd]">
                    <Td>
                      <p className="font-semibold text-[#2f3338]">{student.name}</p>
                      <p className="mt-0.5 text-[11px] text-[#9aa3ad]">{student.studentId}</p>
                    </Td>
                    <Td>
                      <p>{student.guardian}</p>
                      <p className="mt-0.5 text-[11px] text-[#9aa3ad]">{student.guardianEmail}</p>
                    </Td>
                    <Td className="w-[120px]"><Progress value={student.attendance} tone={student.attendance < 85 ? 'warn' : 'success'} label={`${student.attendance}%`} /></Td>
                    <Td className="font-semibold">{student.average}</Td>
                    <Td>{student.supports.length ? student.supports.map(support => <span key={support} className="mr-1 inline-block rounded bg-[#e8eefc] px-2 py-0.5 text-[10px] font-semibold text-[#1738a8]">{support}</span>) : <span className="text-[#9aa3ad]">—</span>}</Td>
                    <Td><Badge tone={statusTone(student.risk)}>{student.risk}</Badge></Td>
                    <Td className="text-right"><Link href={`/admin/students/${student.id}`} className="text-[12px] font-semibold text-[#2e9fff] hover:underline">Snapshot →</Link></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!roster.length && <p className="px-5 py-8 text-center text-[13px] text-[#9aa3ad]">No learners assigned to this section yet.</p>}
        </Panel>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Differentiation notes" description="Support and extension flags for this class.">
            {withSupport.length ? (
              <ul className="divide-y divide-[#eef1f4]">
                {withSupport.map(student => (
                  <li key={student.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0 text-[13px]">
                    <span className="font-medium text-[#2f3338]">{student.name}</span>
                    <span className="text-[#6b7380]">{student.supports.join(' · ')}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-[13px] text-[#6b7380]">No support flags in this section.</p>}
          </Panel>
          <Panel title="Class quick facts">
            <KeyValueGrid
              items={[
                { label: 'Room', value: section.room },
                { label: 'Homeroom', value: section.homeroom },
                { label: 'Class average', value: String(section.average) },
                { label: 'Attendance', value: '96% today' },
                { label: 'Next lesson', value: 'Mathematics · 09:00' },
                { label: 'Parent meetings', value: '4 Nov · 14:00' },
              ]}
            />
          </Panel>
        </div>

        <Callout tone="info" title="Private teacher notes are just that.">
          Personal notes you add to a learner are visible only to you unless you deliberately share them with the tutor or safeguarding lead.
        </Callout>
      </PageFrame>
    </ConsoleShell>
  );
}
