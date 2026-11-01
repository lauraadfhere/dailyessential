import ConsoleShell from '../../../components/console-shell';
import { Badge, Callout, PageFrame, Panel, Progress, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { schoolEvents } from '../../../lib/atlas-data';

const houses = [
  { name: 'Amber House', points: 1480, lead: 'Ms. Bello' },
  { name: 'Blue House', points: 1425, lead: 'Mrs. Adebayo' },
  { name: 'Coral House', points: 1360, lead: 'Mr. Eze' },
  { name: 'Jade House', points: 1290, lead: 'Ms. Ibrahim' },
];

export default function AdminEventsPage() {
  const open = schoolEvents.filter(event => event.status === 'open').length;
  const taken = schoolEvents.reduce((total, event) => total + event.taken, 0);

  return (
    <ConsoleShell role="admin" showSidebar>
      <PageFrame
        eyebrow="Community"
        title="Events & activities"
        description="Trips, clubs, conferences and house competitions. Capacity, consent and payments are tracked per participant."
        actions={<button type="button" className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">Create event</button>}
      >
        <StatGrid
          items={[
            { label: 'Open events', value: String(open), detail: 'Sign-ups accepting participants' },
            { label: 'Registrations', value: String(taken), detail: 'Across all published events' },
            { label: 'Consent outstanding', value: '12', detail: 'Trip participants missing signatures', tone: 'warn' },
            { label: 'Volunteers', value: '8', detail: 'Parents confirmed for the showcase' },
          ]}
        />

        <Panel title="Event calendar" description="Public and school-only visibility is set per event." className="overflow-hidden" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Event</Th><Th>Type</Th><Th>When</Th><Th>Where</Th><Th>Capacity</Th><Th>Status</Th></tr></thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {schoolEvents.map(event => (
                  <tr key={event.name}>
                    <Td>
                      <p className="font-semibold text-[#2f3338]">{event.name}</p>
                      <p className="mt-0.5 text-[11px] text-[#9aa3ad]">{event.owner}</p>
                    </Td>
                    <Td>{event.type}</Td>
                    <Td className="whitespace-nowrap">{event.when}</Td>
                    <Td>{event.where}</Td>
                    <Td className="w-[160px]">
                      <Progress value={(event.taken / event.seats) * 100} tone={event.taken >= event.seats ? 'warn' : 'info'} label={`${event.taken} / ${event.seats}`} />
                    </Td>
                    <Td><Badge tone={statusTone(event.status)}>{event.status}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="House leaderboard" description="Points from attendance, reading, behaviour and academics.">
            <ul className="space-y-4">
              {houses.map((house, index) => (
                <li key={house.name}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-[13px]">
                    <span className="font-medium text-[#2f3338]">{index + 1}. {house.name}</span>
                    <span className="text-[#6b7380]">{house.points} pts</span>
                  </div>
                  <Progress value={(house.points / houses[0].points) * 100} tone={index === 0 ? 'brand' : 'info'} />
                  <p className="mt-1 text-[11px] text-[#9aa3ad]">Lead · {house.lead}</p>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Clubs & teams" description="Supervisors and meeting times.">
            <ul className="divide-y divide-[#eef1f4]">
              {[
                ['Robotics club', 'Mr. Okafor · Thursdays 15:00 · Lab 2', '19 members'],
                ['Design collective', 'Mrs. Adebayo · Fridays 12:00 · Studio D', '24 members'],
                ['Debate society', 'Ms. Ibrahim · Wednesdays 15:30 · Library', '16 members'],
                ['Football team', 'Coach Bala · Tue & Thu 16:00 · Field', '22 players'],
              ].map(([name, detail, count]) => (
                <li key={name} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-[13px] font-semibold text-[#2f3338]">{name}</p>
                    <p className="mt-0.5 text-[12px] text-[#6b7380]">{detail}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold text-[#9aa3ad]">{count}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Callout tone="warn" title="Trips need risk assessment and consent before departure.">
          The trip checklist requires an itinerary, emergency contacts, medical flags, payment status and signed guardian consent for every participant.
        </Callout>
      </PageFrame>
    </ConsoleShell>
  );
}
