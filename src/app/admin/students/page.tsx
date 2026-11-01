'use client';

import Link from 'next/link';
import { useState } from 'react';
import ConsoleShell from '../../../components/console-shell';
import FilterTabs, { SearchField, SelectField } from '../../../components/platform/filter-tabs';
import { Badge, EmptyNote, PageFrame, Panel, Progress, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { atlasStudents, currency, sectionCatalog } from '../../../lib/atlas-data';

export default function AdminStudentsPage() {
  const [tab, setTab] = useState('all');
  const [section, setSection] = useState('all');
  const [query, setQuery] = useState('');

  const visible = atlasStudents.filter(student => {
    const statusMatch = tab === 'all' || student.status === tab;
    const sectionMatch = section === 'all' || student.className === section;
    const text = `${student.name} ${student.studentId} ${student.guardian} ${student.programme}`.toLowerCase();
    return statusMatch && sectionMatch && text.includes(query.trim().toLowerCase());
  });

  const outstanding = atlasStudents.reduce((total, student) => total + student.balance, 0);
  const atRisk = atlasStudents.filter(student => student.risk === 'at-risk').length;

  return (
    <ConsoleShell role="admin" showSidebar>
      <PageFrame
        eyebrow="Student information system"
        title="Student records"
        description="One record per learner: enrolment, guardians, academics, attendance, wellbeing and finance, with every change audited."
        actions={
          <>
            <button type="button" className="rounded border border-[#d8dde4] px-3 py-2 text-[13px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Import CSV</button>
            <Link href="/admin/admissions" className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">Enrol learner</Link>
          </>
        }
      >
        <StatGrid
          items={[
            { label: 'Active learners', value: String(atlasStudents.filter(student => student.status === 'active').length), detail: `Across ${sectionCatalog.length} sections` },
            { label: 'Pending enrolment', value: String(atlasStudents.filter(student => student.status === 'pending').length), detail: 'Awaiting deposit or documents', tone: 'warn' },
            { label: 'At-risk learners', value: String(atRisk), detail: 'Attendance or marks below threshold', tone: atRisk ? 'danger' : undefined },
            { label: 'Outstanding fees', value: currency(outstanding), detail: 'Linked to finance records' },
          ]}
        />

        <Panel className="overflow-hidden" bodyClassName="p-0">
          <div className="flex flex-col gap-3 px-5 pt-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[#2f3338]">Directory</h2>
              <p className="mt-1 text-[13px] text-[#6b7380]">Search, filter and open a complete learner record.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SearchField value={query} onChange={setQuery} placeholder="Search name, ID or guardian…" />
              <SelectField
                label="Section"
                value={section}
                onChange={setSection}
                options={[{ value: 'all', label: 'All sections' }, ...sectionCatalog.map(item => ({ value: item.name, label: item.name }))]}
              />
            </div>
          </div>
          <FilterTabs
            tabs={[
              { id: 'all', label: 'All', count: atlasStudents.length },
              { id: 'active', label: 'Active', count: atlasStudents.filter(student => student.status === 'active').length },
              { id: 'pending', label: 'Pending', count: atlasStudents.filter(student => student.status === 'pending').length },
              { id: 'inactive', label: 'Inactive', count: atlasStudents.filter(student => student.status === 'inactive').length },
            ]}
            value={tab}
            onChange={setTab}
            className="mt-3 px-2"
          />
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead}>
                <tr>
                  <Th>Learner</Th>
                  <Th>Section</Th>
                  <Th>Attendance</Th>
                  <Th>Average</Th>
                  <Th>Risk</Th>
                  <Th>Fee balance</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Record</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {visible.map(student => (
                  <tr key={student.id} className="hover:bg-[#fbfcfd]">
                    <Td>
                      <Link href={`/admin/students/${student.id}`} className="font-semibold text-[#2f3338] hover:text-[#2e9fff]">{student.name}</Link>
                      <p className="mt-0.5 text-[11px] text-[#9aa3ad]">{student.studentId} · {student.programme}</p>
                    </Td>
                    <Td>
                      <p>{student.className}</p>
                      <p className="mt-0.5 text-[11px] text-[#9aa3ad]">{student.campus}</p>
                    </Td>
                    <Td className="w-[130px]"><Progress value={student.attendance} tone={student.attendance < 85 ? 'warn' : 'success'} label={`${student.attendance}%`} /></Td>
                    <Td className="font-semibold">{student.average}</Td>
                    <Td><Badge tone={statusTone(student.risk)}>{student.risk}</Badge></Td>
                    <Td className={student.balance ? 'font-semibold text-rose-600' : 'text-[#6b7380]'}>{student.balance ? currency(student.balance) : 'Clear'}</Td>
                    <Td><Badge tone={statusTone(student.status)}>{student.status}</Badge></Td>
                    <Td className="text-right">
                      <Link href={`/admin/students/${student.id}`} className="text-[12px] font-semibold text-[#2e9fff] hover:underline">Open →</Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!visible.length && <EmptyNote>No learners match these filters.</EmptyNote>}
        </Panel>
      </PageFrame>
    </ConsoleShell>
  );
}
