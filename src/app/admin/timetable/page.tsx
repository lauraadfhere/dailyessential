import ConsoleShell from '../../../components/console-shell';
import { Badge, Callout, PageFrame, Panel, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { timetabledPeriods, timetableSlots, weekDays } from '../../../lib/atlas-data';

const versions = [
  { name: 'Published timetable', detail: 'Released 26 Oct 2026 · used by all portals', status: 'published' },
  { name: 'Draft v4', detail: 'Exam fortnight adjustments · needs approval', status: 'draft' },
  { name: 'Draft v3', detail: 'Superseded 26 Oct 2026', status: 'archived' },
];

const bookings = [
  { room: 'Computer Lab', slot: 'Mon 10:30', use: 'Digital Literacy · Mr. Eze', state: 'confirmed' },
  { room: 'Main Hall', slot: 'Wed 09:00', use: 'Exam setup · Exam office', state: 'confirmed' },
  { room: 'Studio D', slot: 'Fri 10:30', use: 'UI / UX critique · Mrs. Adebayo', state: 'confirmed' },
  { room: 'Sports field', slot: 'Sat 08:00', use: 'Inter-house sports briefing', state: 'pending' },
];

export default function AdminTimetablePage() {
  return (
    <ConsoleShell role="admin" showSidebar>
      <PageFrame
        eyebrow="Scheduling"
        title="Timetable"
        description="Weekly teaching grid with room bookings, substitution warnings and version history. Published changes reach every portal immediately."
        actions={
          <>
            <button type="button" className="rounded border border-[#d8dde4] px-3 py-2 text-[13px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Export ICS</button>
            <button type="button" className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">Generate draft</button>
          </>
        }
      >
        <StatGrid
          items={[
            { label: 'Scheduled lessons', value: String(timetableSlots.length), detail: 'Across 5 sections this week' },
            { label: 'Unassigned slots', value: '2', detail: 'Cover needed Thursday 12:00', tone: 'warn' },
            { label: 'Room conflicts', value: '0', detail: 'No double bookings detected' },
            { label: 'Substitutions today', value: '1', detail: 'JSS 3 Computer Science covered' },
          ]}
        />

        <Panel title="Week grid" description="Term 1 · week 9. Published 26 Oct 2026." className="overflow-hidden" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#f7f9fb]">
                  <th className="w-[86px] border-b border-r border-[#eef1f4] px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[.1em] text-[#9aa3ad]">Period</th>
                  {weekDays.map(day => (
                    <th key={day} className="border-b border-[#eef1f4] px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[.1em] text-[#9aa3ad]">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timetabledPeriods.map(period => (
                  <tr key={period}>
                    <th className="border-b border-r border-[#eef1f4] bg-[#fbfcfd] px-3 py-3 text-left text-[12px] font-semibold text-[#4a515a]">{period}</th>
                    {weekDays.map(day => {
                      const cell = timetableSlots.filter(slot => slot.day === day && slot.period === period);
                      return (
                        <td key={`${day}-${period}`} className="border-b border-[#eef1f4] p-1.5 align-top">
                          {cell.length ? cell.map(slot => (
                            <div key={`${slot.subject}-${slot.className}`} className="mb-1 rounded border border-[#e1e5eb] bg-white px-2.5 py-2 last:mb-0">
                              <p className="text-[12px] font-semibold leading-4 text-[#2f3338]">{slot.subject}</p>
                              <p className="mt-1 text-[10px] text-[#6b7380]">{slot.className}</p>
                              <p className="text-[10px] text-[#9aa3ad]">{slot.room}</p>
                            </div>
                          )) : <span className="block px-2 py-3 text-[11px] text-[#c0c6ce]">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Versions" description="Compare before publishing.">
            <ul className="divide-y divide-[#eef1f4]">
              {versions.map(version => (
                <li key={version.name} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-[13px] font-semibold text-[#2f3338]">{version.name}</p>
                    <p className="mt-0.5 text-[12px] text-[#6b7380]">{version.detail}</p>
                  </div>
                  <Badge tone={statusTone(version.status)}>{version.status}</Badge>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Room bookings" description="Labs, halls and shared spaces." className="overflow-hidden" bodyClassName="p-0">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Room</Th><Th>Slot</Th><Th>Use</Th><Th>State</Th></tr></thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {bookings.map(booking => (
                  <tr key={`${booking.room}-${booking.slot}`}>
                    <Td className="font-semibold text-[#2f3338]">{booking.room}</Td>
                    <Td>{booking.slot}</Td>
                    <Td>{booking.use}</Td>
                    <Td><Badge tone={statusTone(booking.state)}>{booking.state}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>

        <Callout tone="warn" title="Two cover slots still need a teacher.">
          Thursday 12:00 JSS 2 Blue mentor group and Friday 12:00 clubs. The substitution engine suggests available staff by subject and workload.
        </Callout>
      </PageFrame>
    </ConsoleShell>
  );
}
