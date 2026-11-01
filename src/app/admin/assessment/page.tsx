import ConsoleShell from '../../../components/console-shell';
import { Badge, Callout, PageFrame, Panel, Progress, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { examSchedule, gradeBands, gradeCategories, moderationQueue } from '../../../lib/atlas-data';

const publication = [
  { label: 'Marks entered', value: 92 },
  { label: 'Moderation complete', value: 68 },
  { label: 'Approved by academic director', value: 41 },
  { label: 'Report cards generated', value: 0 },
];

export default function AdminAssessmentPage() {
  return (
    <ConsoleShell role="admin" showSidebar>
      <PageFrame
        eyebrow="Assessment & grading"
        title="Assessment"
        description="Exams, moderation and publication in one workflow: enter → review → approve → lock → publish. Students only ever see published marks."
        actions={
          <>
            <button type="button" className="rounded border border-[#d8dde4] px-3 py-2 text-[13px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Grade scales</button>
            <button type="button" className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">Schedule exam</button>
          </>
        }
      >
        <StatGrid
          items={[
            { label: 'Exams scheduled', value: String(examSchedule.filter(exam => exam.status === 'scheduled').length), detail: 'Two exam weeks remain in Term 1' },
            { label: 'Awaiting moderation', value: String(moderationQueue.filter(item => item.status !== 'approved').length), detail: 'HoD review before approval', tone: 'warn' },
            { label: 'Marks entered', value: '92%', detail: '4 assessments still open' },
            { label: 'Report cards', value: 'Draft', detail: 'Release scheduled 11 Dec 2026' },
          ]}
        />

        <Panel title="Exams" description="Sessions, candidates and invigilation." className="overflow-hidden" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead}>
                <tr><Th>Paper</Th><Th>Level</Th><Th>Date</Th><Th>Room</Th><Th>Candidates</Th><Th>Invigilator</Th><Th>Status</Th></tr>
              </thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {examSchedule.map(exam => (
                  <tr key={exam.id}>
                    <Td className="font-semibold text-[#2f3338]">{exam.paper}</Td>
                    <Td>{exam.level}</Td>
                    <Td className="whitespace-nowrap">{exam.date}</Td>
                    <Td>{exam.room}</Td>
                    <Td>{exam.candidates}</Td>
                    <Td>{exam.invigilator}</Td>
                    <Td><Badge tone={statusTone(exam.status)}>{exam.status}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <Panel title="Moderation queue" description="Second marking and discrepancy resolution." className="overflow-hidden" bodyClassName="p-0">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Course</Th><Th>Teacher</Th><Th>Sample</Th><Th>Status</Th></tr></thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {moderationQueue.map(item => (
                  <tr key={item.id}>
                    <Td>
                      <p className="font-semibold text-[#2f3338]">{item.course}</p>
                      <p className="mt-0.5 text-[11px] text-[#9aa3ad]">{item.section} · discrepancy {item.discrepancy}</p>
                    </Td>
                    <Td>{item.teacher}</Td>
                    <Td>{item.sample}</Td>
                    <Td><Badge tone={statusTone(item.status)}>{item.status}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Publication readiness" description="Term 1 report cards.">
            <ul className="space-y-4">
              {publication.map(step => (
                <li key={step.label}><Progress value={step.value} tone={step.value === 100 ? 'success' : step.value < 50 ? 'warn' : 'info'} label={step.label} /></li>
              ))}
            </ul>
            <p className="mt-4 text-[12px] leading-5 text-[#6b7380]">Release holds for unpaid fees are optional and disabled for this school.</p>
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Grade scale" description="Daily Essential senior school scale · configurable." className="overflow-hidden" bodyClassName="p-0">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Grade</Th><Th>Range</Th><Th>GPA</Th><Th>Descriptor</Th></tr></thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {gradeBands.map(band => (
                  <tr key={band.letter}>
                    <Td className="font-bold text-[#1738a8]">{band.letter}</Td>
                    <Td>{band.range}</Td>
                    <Td>{band.gpa.toFixed(1)}</Td>
                    <Td>{band.descriptor}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Assessment weighting" description="UI / UX Design Studio · Term 1.">
            <ul className="space-y-3">
              {gradeCategories.map(category => (
                <li key={category.name} className="flex items-center justify-between gap-3 border-b border-[#f2f4f7] pb-2.5 text-[13px] last:border-0 last:pb-0">
                  <span className="font-medium text-[#2f3338]">{category.name}</span>
                  <span className="text-[#6b7380]">weight {category.weight}% · average {category.average}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Callout tone="info" title="Change tracking is automatic.">
                Every mark keeps its previous value, author, timestamp and reason, so moderation disputes are resolved from evidence.
              </Callout>
            </div>
          </Panel>
        </div>
      </PageFrame>
    </ConsoleShell>
  );
}
