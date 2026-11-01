import ConsoleShell from '../../../components/console-shell';
import { Badge, Callout, PageFrame, Panel, Progress, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { setupChecklist } from '../../../lib/atlas-data';

const integrations = [
  { name: 'Payment gateway', detail: 'Card, transfer and USSD reconciliation', state: 'connected' },
  { name: 'Email & SMS', detail: 'Notifications, reminders and emergency broadcast', state: 'connected' },
  { name: 'Google Workspace SSO', detail: 'Staff and student sign-in', state: 'connected' },
  { name: 'Accounting export', detail: 'Nightly CSV to the bursar’s ledger', state: 'pending' },
  { name: 'WhatsApp Business', detail: 'Parent alerts for absence and fees', state: 'pending' },
  { name: 'Cloud storage', detail: 'Assignment and document attachments', state: 'connected' },
];

const dataQuality = [
  { issue: 'Guardian phone missing', count: 4, owner: 'Registrar' },
  { issue: 'Photo not on file', count: 11, owner: 'Class tutors' },
  { issue: 'Medical form expired', count: 6, owner: 'Health office' },
  { issue: 'Duplicate learner candidate', count: 1, owner: 'Registrar' },
];

export default function AdminSetupPage() {
  const done = setupChecklist.filter(item => item.done).length;
  const percent = Math.round((done / setupChecklist.length) * 100);

  return (
    <ConsoleShell role="admin" showSidebar>
      <PageFrame
        eyebrow="School configuration"
        title="Setup & health"
        description="A guided checklist for a launch-ready school: academic structure, finance, communication, roles and data import."
        actions={<button type="button" className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">Resume setup</button>}
      >
        <StatGrid
          items={[
            { label: 'Setup progress', value: `${percent}%`, detail: `${done} of ${setupChecklist.length} steps complete` },
            { label: 'Integrations', value: '4 / 6', detail: 'Two awaiting credentials' },
            { label: 'Data quality issues', value: String(dataQuality.reduce((total, item) => total + item.count, 0)), detail: 'Assigned to record owners', tone: 'warn' },
            { label: 'Last backup', value: '02:00', detail: 'Encrypted · restore drill passed', tone: 'success' },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <Panel title="Launch checklist" description="Nothing is marked complete until it has been verified.">
            <Progress value={percent} tone={percent > 70 ? 'success' : 'info'} label="Overall readiness" />
            <ul className="mt-4 divide-y divide-[#eef1f4]">
              {setupChecklist.map(item => (
                <li key={item.label} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                  <span className="flex items-center gap-2.5">
                    <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold ${item.done ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f2f4f7] text-[#9aa3ad]'}`}>{item.done ? '✓' : '·'}</span>
                    <span className={item.done ? 'text-[#2f3338]' : 'text-[#6b7380]'}>{item.label}</span>
                  </span>
                  <Badge tone={item.done ? 'success' : 'neutral'}>{item.done ? 'done' : 'todo'}</Badge>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Integrations" description="Keys live in the managed secret store, never in code." className="overflow-hidden" bodyClassName="p-0">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Service</Th><Th>Purpose</Th><Th>Status</Th></tr></thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {integrations.map(item => (
                  <tr key={item.name}>
                    <Td className="font-semibold text-[#2f3338]">{item.name}</Td>
                    <Td>{item.detail}</Td>
                    <Td><Badge tone={statusTone(item.state)}>{item.state}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Data quality" description="Fix these before the next statutory return." className="overflow-hidden" bodyClassName="p-0">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Issue</Th><Th>Records</Th><Th>Owner</Th><Th className="text-right">Action</Th></tr></thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {dataQuality.map(item => (
                  <tr key={item.issue}>
                    <Td className="font-medium text-[#2f3338]">{item.issue}</Td>
                    <Td>{item.count}</Td>
                    <Td>{item.owner}</Td>
                    <Td className="text-right"><button type="button" className="text-[12px] font-semibold text-[#2e9fff] hover:underline">Fix →</button></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Year-end rollover" description="Archive the year, promote learners and copy the timetable.">
            <ol className="space-y-3 text-[13px] leading-6 text-[#4a515a]">
              <li><span className="font-semibold text-[#2f3338]">1.</span> Freeze Term 3 marks and publish report cards.</li>
              <li><span className="font-semibold text-[#2f3338]">2.</span> Run promotion rules and review the exception list.</li>
              <li><span className="font-semibold text-[#2f3338]">3.</span> Roll over sections, courses and fee plans.</li>
              <li><span className="font-semibold text-[#2f3338]">4.</span> Archive the year; records stay read-only and exportable.</li>
            </ol>
            <div className="mt-4">
              <Callout tone="danger" title="Rollover is irreversible without a restore.">
                Run a dry run first. The preview lists every promotion, repeat and graduation decision for sign-off.
              </Callout>
            </div>
          </Panel>
        </div>
      </PageFrame>
    </ConsoleShell>
  );
}
