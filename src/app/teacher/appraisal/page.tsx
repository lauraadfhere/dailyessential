import ConsoleShell from '../../../components/console-shell';
import { Badge, Callout, PageFrame, Panel, Progress, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { observations, professionalDevelopment, teacherGoals } from '../../../lib/atlas-data';

const cycle = [
  { step: 'Self-review', detail: 'Completed 15 Oct 2026', state: 'complete' },
  { step: 'Manager review', detail: 'Scheduled 18 Nov 2026', state: 'upcoming' },
  { step: 'Review meeting', detail: '2 Dec 2026 · 45 minutes', state: 'upcoming' },
  { step: 'Development plan', detail: 'Drafted after the meeting', state: 'queued' },
];

export default function TeacherAppraisalPage() {
  const totalHours = professionalDevelopment.reduce((total, item) => total + item.hours, 0);

  return (
    <ConsoleShell role="teacher" showSidebar>
      <PageFrame
        eyebrow="Growth & appraisal"
        title="Appraisal"
        description="Goals, classroom observations and professional development in one place. Criteria are transparent and records stay confidential to you and your evaluators."
        actions={<button type="button" className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">Add evidence</button>}
      >
        <StatGrid
          items={[
            { label: 'Goals on track', value: `${teacherGoals.filter(goal => goal.status === 'on track').length} / ${teacherGoals.length}`, detail: 'Reviewed mid-year and year-end' },
            { label: 'Observations', value: String(observations.length), detail: 'One peer observation this term' },
            { label: 'PD hours', value: String(totalHours), detail: 'Target 20 hours per year' },
            { label: 'Next review', value: '18 Nov', detail: 'Manager review window opens' },
          ]}
        />

        <Panel title="Goals" description="Agreed with your line manager at the start of the year.">
          <ul className="space-y-4">
            {teacherGoals.map(goal => (
              <li key={goal.title} className="border-b border-[#f2f4f7] pb-4 last:border-0 last:pb-0">
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-medium text-[#2f3338]">{goal.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge tone={statusTone(goal.status)}>{goal.status}</Badge>
                    <span className="text-[11px] text-[#9aa3ad]">due {goal.due}</span>
                  </div>
                </div>
                <Progress value={goal.progress} tone={goal.progress === 100 ? 'success' : goal.progress < 50 ? 'warn' : 'info'} />
              </li>
            ))}
          </ul>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <Panel title="Observation history" description="Feedback is evidence-based and shared with you first." className="overflow-hidden" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className={tableHead}><tr><Th>Date</Th><Th>Observer</Th><Th>Focus</Th><Th>Rating</Th><Th>Notes</Th></tr></thead>
                <tbody className="divide-y divide-[#eef1f4]">
                  {observations.map(item => (
                    <tr key={item.date}>
                      <Td className="whitespace-nowrap font-medium text-[#2f3338]">{item.date}</Td>
                      <Td>{item.observer}</Td>
                      <Td>{item.focus}</Td>
                      <Td><Badge tone={statusTone(item.rating)}>{item.rating}</Badge></Td>
                      <Td className="max-w-sm">{item.notes}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Appraisal cycle" description="Appraisal is a conversation, not a surprise.">
            <ol className="space-y-3">
              {cycle.map((item, index) => (
                <li key={item.step} className="flex gap-3">
                  <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${item.state === 'complete' ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f2f4f7] text-[#9aa3ad]'}`}>{item.state === 'complete' ? '✓' : index + 1}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-[#2f3338]">{item.step}</p>
                    <p className="mt-0.5 text-[12px] text-[#6b7380]">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <Panel title="Professional development" description="Courses, certificates and reflection hours." className="overflow-hidden" bodyClassName="p-0">
          <table className="min-w-full text-sm">
            <thead className={tableHead}><tr><Th>Course</Th><Th>Provider</Th><Th>Hours</Th><Th>Status</Th></tr></thead>
            <tbody className="divide-y divide-[#eef1f4]">
              {professionalDevelopment.map(item => (
                <tr key={item.title}>
                  <Td className="font-semibold text-[#2f3338]">{item.title}</Td>
                  <Td>{item.provider}</Td>
                  <Td>{item.hours}</Td>
                  <Td><Badge tone={statusTone(item.status)}>{item.status}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Callout tone="info" title="You can respond to every observation.">
          Right-of-reply notes are stored alongside the observer’s record, and appraisal evidence is never shared beyond your evaluators without your consent.
        </Callout>
      </PageFrame>
    </ConsoleShell>
  );
}
