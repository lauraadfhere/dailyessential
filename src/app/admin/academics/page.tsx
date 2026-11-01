import ConsoleShell from '../../../components/console-shell';
import { Badge, Callout, PageFrame, Panel, Progress, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { academicYears, sectionCatalog, subjectCatalog, terms } from '../../../lib/atlas-data';

export default function AdminAcademicsPage() {
  return (
    <ConsoleShell role="admin" showSidebar>
      <PageFrame
        eyebrow="Academic configuration"
        title="Academic setup"
        description="Years, terms, sections and the subject catalogue are settings — never hard-coded. Changes apply to the next timetabling and grading cycle."
        actions={<button type="button" className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">New academic year</button>}
      >
        <StatGrid
          items={[
            { label: 'Current year', value: '2026 / 2027', detail: 'Term 1 · week 9 of 14' },
            { label: 'Sections', value: String(sectionCatalog.length), detail: `${sectionCatalog.reduce((total, section) => total + section.learners, 0)} learners placed` },
            { label: 'Subjects', value: String(subjectCatalog.length), detail: '2 core · 4 elective pathways' },
            { label: 'Timetable status', value: 'Published', detail: 'Draft v4 in preparation', tone: 'warn' },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Academic years" description="Only one year can be current at a time.">
            <ul className="divide-y divide-[#eef1f4]">
              {academicYears.map(year => (
                <li key={year.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-[13px] font-semibold text-[#2f3338]">{year.label}</p>
                    <p className="mt-0.5 text-[12px] text-[#6b7380]">{year.start} – {year.end}</p>
                  </div>
                  <Badge tone={statusTone(year.status)}>{year.status}</Badge>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Terms" description="Attendance, assessments and reports are scoped to a term.">
            <ul className="space-y-3.5">
              {terms.map(term => (
                <li key={term.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-[13px]">
                    <span className="font-medium text-[#2f3338]">{term.label}</span>
                    <span className="text-[12px] text-[#6b7380]">{term.window}</span>
                  </div>
                  <Progress value={term.status === 'active' ? 64 : 0} tone={term.status === 'active' ? 'info' : 'neutral'} label={`${term.weeks} weeks`} />
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="Sections and homerooms" description="Capacity is enforced during admissions and re-enrolment." className="overflow-hidden" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead}>
                <tr>
                  <Th>Section</Th><Th>Grade</Th><Th>Homeroom</Th><Th>Room</Th><Th>Enrolment</Th><Th>Average</Th><Th>Utilisation</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {sectionCatalog.map(section => (
                  <tr key={section.id}>
                    <Td className="font-semibold text-[#2f3338]">{section.name}</Td>
                    <Td>{section.grade}</Td>
                    <Td>{section.homeroom}</Td>
                    <Td>{section.room}</Td>
                    <Td>{section.learners} / {section.capacity}</Td>
                    <Td>{section.average}</Td>
                    <Td className="w-[150px]"><Progress value={(section.learners / section.capacity) * 100} tone={section.learners / section.capacity > 0.95 ? 'warn' : 'success'} label={`${Math.round((section.learners / section.capacity) * 100)}%`} /></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Subject catalogue" description="Prerequisites, credits and weekly hours feed the timetable generator." className="overflow-hidden" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead}>
                <tr><Th>Code</Th><Th>Subject</Th><Th>Department</Th><Th>Credits</Th><Th>Hours / week</Th><Th>Type</Th></tr>
              </thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {subjectCatalog.map(subject => (
                  <tr key={subject.code}>
                    <Td className="font-mono text-[12px]">{subject.code}</Td>
                    <Td className="font-semibold text-[#2f3338]">{subject.name}</Td>
                    <Td>{subject.department}</Td>
                    <Td>{subject.credits}</Td>
                    <Td>{subject.hours}</Td>
                    <Td><Badge tone={subject.level === 'Core' ? 'brand' : 'info'}>{subject.level}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Callout tone="info" title="Configuration, not code.">
          Grading scales, attendance codes, report templates and subject rules are editable per school. Nothing in this page needs a deployment.
        </Callout>
      </PageFrame>
    </ConsoleShell>
  );
}
