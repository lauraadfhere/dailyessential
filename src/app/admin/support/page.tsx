import ConsoleShell from '../../../components/console-shell';
import { Badge, BarList, Callout, PageFrame, Panel, Progress, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { behaviourIncidents, counselingCases, moodWeek, wellbeingResources } from '../../../lib/atlas-data';

export default function AdminSupportPage() {
  return (
    <ConsoleShell role="admin" showSidebar>
      <PageFrame
        eyebrow="Student support"
        title="Wellbeing & behaviour"
        description="Pastoral care, behaviour records and confidential counselling. Access is restricted to the safeguarding and counselling teams."
        actions={<button type="button" className="rounded border border-[#d8dde4] px-3 py-2 text-[13px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Open case log</button>}
      >
        <StatGrid
          items={[
            { label: 'Open cases', value: String(counselingCases.length), detail: 'One high-priority case' },
            { label: 'Behaviour incidents', value: String(behaviourIncidents.length), detail: 'This month · all followed up' },
            { label: 'Wellbeing check-ins', value: '84%', detail: 'Of learners completed this week' },
            { label: 'Safeguarding concerns', value: '0', detail: 'No open referrals', tone: 'success' },
          ]}
        />

        <Callout tone="danger" title="Confidential by design.">
          Counselling notes, safeguarding cases and medical details are field-encrypted and visible only to the Designated Safeguarding Lead and assigned counsellor. Access is audited.
        </Callout>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <Panel title="Counselling caseload" description="Appointments and support stage." className="overflow-hidden" bodyClassName="p-0">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Learner</Th><Th>Concern</Th><Th>Priority</Th><Th>Next</Th><Th>Stage</Th></tr></thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {counselingCases.map(item => (
                  <tr key={item.id}>
                    <Td className="font-semibold text-[#2f3338]">{item.student}</Td>
                    <Td>{item.concern}</Td>
                    <Td><Badge tone={statusTone(item.priority)}>{item.priority}</Badge></Td>
                    <Td className="whitespace-nowrap">{item.next}</Td>
                    <Td>{item.stage}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Wellbeing pulse" description="Anonymous weekly check-in average (1–5).">
            <BarList items={moodWeek.map(day => ({ label: day.day, value: day.score, display: `${day.score} / 5` }))} tone="success" />
            <p className="mt-4 text-[12px] leading-5 text-[#6b7380]">Individual responses are never shown here — only aggregates above a minimum response threshold.</p>
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <Panel title="Behaviour incidents" description="Positive points outweigh incidents 11:1 this month." className="overflow-hidden" bodyClassName="p-0">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Learner</Th><Th>Incident</Th><Th>Severity</Th><Th>Date</Th><Th>Resolution</Th></tr></thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {behaviourIncidents.map(item => (
                  <tr key={item.id}>
                    <Td className="font-semibold text-[#2f3338]">{item.student}</Td>
                    <Td>{item.type}</Td>
                    <Td><Badge tone={statusTone(item.severity)}>{item.severity}</Badge></Td>
                    <Td className="whitespace-nowrap">{item.date}</Td>
                    <Td>{item.status}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Resources shared with learners" description="Also available in the student wellbeing space.">
            <ul className="divide-y divide-[#eef1f4]">
              {wellbeingResources.map(resource => (
                <li key={resource.title} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="text-[13px] font-medium text-[#2f3338]">{resource.title}</span>
                  <span className="shrink-0 text-[11px] text-[#9aa3ad]">{resource.type}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Progress value={84} tone="info" label="Weekly check-in completion" />
            </div>
          </Panel>
        </div>
      </PageFrame>
    </ConsoleShell>
  );
}
