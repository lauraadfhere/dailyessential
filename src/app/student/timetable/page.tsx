import Link from 'next/link';
import PortalShell from '../../../components/portal-shell';
import { Badge, Callout, PageFrame, Panel, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { timetabledPeriods, timetableSlots, todaySchedule, weekDays } from '../../../lib/atlas-data';

const classSlots = timetableSlots.filter(slot => slot.className === 'JSS 2 Blue' || slot.className === 'Whole school');

const upcoming = [
  { title: 'Mathematics Paper 1', when: '9 Nov 2026 · 09:00', where: 'Main Hall', type: 'Exam' },
  { title: 'Usability test report due', when: '2 Nov 2026 · 23:59', where: 'Online submission', type: 'Assignment' },
  { title: 'Parent–teacher conferences', when: '4 Nov 2026 · 14:00', where: 'Main Hall', type: 'Meeting' },
  { title: 'Design showcase', when: '14 Nov 2026 · 10:00', where: 'Studio D', type: 'Event' },
];

export default function StudentTimetablePage() {
  return (
    <PortalShell role="student">
      <PageFrame
        variant="portal"
        eyebrow="Student space"
        title="My timetable"
        description="Week 9 of Term 1 · JSS 2 Blue. Room changes and substitutions appear here in real time."
        actions={<button type="button" className="rounded border border-[#1738a8] px-3 py-2 text-[13px] font-semibold text-[#1738a8] hover:bg-[#e8eefc]">Add to calendar (ICS)</button>}
      >
        <StatGrid
          items={[
            { label: 'Lessons today', value: String(todaySchedule.length), detail: 'One studio double period' },
            { label: 'Next class', value: '10:30', detail: 'Digital Literacy · D-302', tone: 'warn' },
            { label: 'Free periods', value: '2', detail: 'Use for independent study' },
            { label: 'Upcoming exams', value: '1', detail: 'Mathematics · 9 November' },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <Panel title="Week grid" description="Your scheduled classes for the week." className="overflow-hidden" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#f4f5fa]">
                    <th className="w-[70px] border-b border-r border-slate-200 px-2 py-2.5 text-left text-[10px] font-bold uppercase tracking-[.1em] text-slate-400">Time</th>
                    {weekDays.map(day => <th key={day} className="border-b border-slate-200 px-2 py-2.5 text-left text-[10px] font-bold uppercase tracking-[.1em] text-slate-400">{day}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {timetabledPeriods.map(period => (
                    <tr key={period}>
                      <th className="border-b border-r border-slate-200 bg-[#fbfbfd] px-2 py-2.5 text-left text-[11px] font-semibold text-slate-500">{period}</th>
                      {weekDays.map(day => {
                        const cell = classSlots.filter(slot => slot.day === day && slot.period === period);
                        return (
                          <td key={`${day}-${period}`} className="border-b border-slate-200 p-1 align-top">
                            {cell.length ? cell.map(slot => (
                              <div key={`${slot.subject}-${slot.room}`} className="rounded bg-[#f4f7ff] px-2 py-1.5">
                                <p className="text-[11px] font-bold leading-4 text-[#1738a8]">{slot.subject}</p>
                                <p className="mt-0.5 text-[10px] text-slate-500">{slot.room}</p>
                              </div>
                            )) : <span className="block rounded bg-slate-50 px-2 py-1.5 text-[10px] text-slate-400">Study</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Today" description="Live status of your classes.">
            <ul className="space-y-3">
              {todaySchedule.map(item => (
                <li key={`${item.time}-${item.subject}`} className={`rounded border p-3 ${item.state === 'now' ? 'border-[#1738a8] bg-[#f4f7ff]' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-500">{item.time}</span>
                    {item.state === 'now' ? <Badge tone="brand">now</Badge> : item.state === 'next' ? <Badge tone="info">next</Badge> : <Badge tone="neutral">done</Badge>}
                  </div>
                  <p className="mt-1 text-[13px] font-semibold text-[#15133d]">{item.subject}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{item.teacher} · {item.room}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <Panel title="Exams & deadlines" description="Overlay of assessments, events and meetings." className="overflow-hidden" bodyClassName="p-0">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Item</Th><Th>Type</Th><Th>When</Th><Th>Where</Th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {upcoming.map(item => (
                  <tr key={item.title}>
                    <Td className="font-semibold text-[#15133d]">{item.title}</Td>
                    <Td><Badge tone={statusTone(item.type)}>{item.type}</Badge></Td>
                    <Td className="whitespace-nowrap">{item.when}</Td>
                    <Td>{item.where}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Study planner" description="Protect time for what is coming.">
            <ul className="space-y-2.5 text-[13px] leading-6 text-slate-600">
              <li className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2"><span>Mon 16:00</span><span className="font-semibold text-slate-700">Usability test prep · 45 min</span></li>
              <li className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2"><span>Wed 16:00</span><span className="font-semibold text-slate-700">Maths practice · 40 min</span></li>
              <li className="flex items-center justify-between gap-3"><span>Thu 12:00</span><span className="font-semibold text-slate-700">Maths clinic · B-101</span></li>
            </ul>
            <Link href="/student/assignments" className="mt-4 inline-block text-[12px] font-bold text-[#1738a8] hover:underline">Open assignments →</Link>
          </Panel>
        </div>

        <Callout tone="brand" title="Room changes reach you immediately.">
          If a teacher is absent, the cover lesson and any room change appear here and as a notification. Exam overlays are shown in a different colour so nothing is missed.
        </Callout>
      </PageFrame>
    </PortalShell>
  );
}
