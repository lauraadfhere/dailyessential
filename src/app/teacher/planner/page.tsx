import ConsoleShell from '../../../components/console-shell';
import { Badge, Callout, PageFrame, Panel, Progress, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { courseCatalog } from '../../../lib/atlas-data';

const plans = [
  { title: 'Usability testing basics', course: 'UI / UX Design Studio', week: 'Week 9', status: 'approved', standard: 'UXD.3.2', activities: 4 },
  { title: 'Spreadsheets and data', course: 'Digital Literacy', week: 'Week 9', status: 'ready', standard: 'ICT.2.4', activities: 3 },
  { title: 'Linear equations', course: 'Mathematics', week: 'Week 9', status: 'draft', standard: 'MTH.1.6', activities: 5 },
  { title: 'Algorithms in practice', course: 'Computer Science', week: 'Week 10', status: 'draft', standard: 'CSC.4.1', activities: 4 },
];

const resources = [
  { title: 'Usability test script template', type: 'Document', shared: 'Computing department' },
  { title: 'Spreadsheet practice dataset', type: 'CSV', shared: 'Digital Literacy team' },
  { title: 'Linear equations slides', type: 'Slides', shared: 'Mathematics department' },
  { title: 'Accessibility checklist', type: 'PDF', shared: 'Whole school' },
];

export default function TeacherPlannerPage() {
  return (
    <ConsoleShell role="teacher" showSidebar>
      <PageFrame
        eyebrow="Lesson planning"
        title="Planner"
        description="Plan against the curriculum, share with your department and leave a clear plan for a cover teacher. Every plan carries its objectives, standards and assessment."
        actions={<button type="button" className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">New lesson plan</button>}
      >
        <StatGrid
          items={[
            { label: 'Plans this week', value: String(plans.length), detail: '2 approved · 2 in draft' },
            { label: 'Curriculum coverage', value: '81%', detail: 'Standards assessed so far' },
            { label: 'Shared resources', value: String(resources.length), detail: 'From your department' },
            { label: 'Cover plans ready', value: '3 of 4', detail: 'One class still needs a plan', tone: 'warn' },
          ]}
        />

        <Panel title="This week's plans" description="Draft → submitted → approved by HoD." className="overflow-hidden" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Lesson</Th><Th>Course</Th><Th>Week</Th><Th>Standard</Th><Th>Activities</Th><Th>Status</Th></tr></thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {plans.map(plan => (
                  <tr key={plan.title}>
                    <Td className="font-semibold text-[#2f3338]">{plan.title}</Td>
                    <Td>{plan.course}</Td>
                    <Td>{plan.week}</Td>
                    <Td className="font-mono text-[11px]">{plan.standard}</Td>
                    <Td>{plan.activities}</Td>
                    <Td><Badge tone={statusTone(plan.status)}>{plan.status}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <Panel title="Plan template" description="Start from the Daily Essential lesson structure.">
            <div className="space-y-3 text-[13px]">
              {[
                ['Learning objective', 'Evaluate a prototype with five usability heuristics'],
                ['Curriculum standard', 'UXD.3.2 — usability evaluation'],
                ['Starter (5 min)', 'Two-minute heuristic sort, pairs'],
                ['Main activity (30 min)', 'Guided test on a peer prototype'],
                ['Differentiation', 'Script template for support · open brief for extension'],
                ['Assessment evidence', 'Completed findings table with severity ratings'],
              ].map(([label, value], index) => (
                <label key={label} className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#9aa3ad]">{label}</span>
                  {index === 3 ? (
                    <textarea defaultValue={value} rows={2} className="mt-1.5 w-full rounded border border-[#d8dde4] px-3 py-2 text-[13px] text-[#2f3338] outline-none focus:border-[#2e9fff]" />
                  ) : (
                    <input defaultValue={value} className="mt-1.5 w-full rounded border border-[#d8dde4] px-3 py-2 text-[13px] text-[#2f3338] outline-none focus:border-[#2e9fff]" />
                  )}
                </label>
              ))}
              <div className="flex flex-wrap gap-2 pt-1">
                <button type="button" className="rounded bg-[#2e9fff] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#1f8eef]">Save draft</button>
                <button type="button" className="rounded border border-[#d8dde4] px-3 py-2 text-[12px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Submit for approval</button>
              </div>
            </div>
          </Panel>

          <div className="space-y-5">
            <Panel title="Pacing" description="Term 1 delivery against the map.">
              <ul className="space-y-4">
                {courseCatalog.slice(0, 3).map(course => (
                  <li key={course.id}><Progress value={course.progress} tone={course.progress < 60 ? 'warn' : 'info'} label={course.title} /></li>
                ))}
              </ul>
            </Panel>
            <Panel title="Shared resources" description="Reusable across the department.">
              <ul className="divide-y divide-[#eef1f4]">
                {resources.map(resource => (
                  <li key={resource.title} className="flex items-center justify-between gap-3 py-2.5 text-[13px] first:pt-0 last:pb-0">
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-[#2f3338]">{resource.title}</span>
                      <span className="block text-[11px] text-[#9aa3ad]">{resource.shared}</span>
                    </span>
                    <Badge tone="neutral">{resource.type}</Badge>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>

        <Callout tone="info" title="Cover teachers see the plan, not your private notes.">
          Sharing a lesson for cover includes the plan, class list, accommodations and emergency contacts — but never your personal notes about learners.
        </Callout>
      </PageFrame>
    </ConsoleShell>
  );
}
