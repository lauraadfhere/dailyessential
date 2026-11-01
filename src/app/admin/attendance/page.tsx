import Link from 'next/link';
import ConsoleShell from '../../../components/console-shell';
import { Badge, BarList, Callout, PageFrame, Panel, Progress, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { attendanceAlerts, attendanceBySection, attendanceTrend, weekDays } from '../../../lib/atlas-data';

const offsets: Record<string, number[]> = {
  'JSS 1 Amber': [0, 3, -2, 2, -4],
  'JSS 2 Blue': [2, 1, 0, 3, -1],
  'JSS 3 Coral': [-3, 0, 1, -2, -5],
  'SS1 Digital': [-6, -2, 0, 1, -7],
  'SS2 Design': [1, 3, 0, 2, -2],
};

function heatTone(rate: number) {
  if (rate >= 95) return 'bg-emerald-100 text-emerald-800';
  if (rate >= 90) return 'bg-sky-100 text-sky-800';
  if (rate >= 85) return 'bg-amber-100 text-amber-800';
  return 'bg-rose-100 text-rose-800';
}

export default function AdminAttendancePage() {
  const present = attendanceBySection.reduce((total, section) => total + section.present, 0);
  const learners = attendanceBySection.reduce((total, section) => total + section.present + section.absent + section.late, 0);
  const rate = Math.round((present / learners) * 100);

  return (
    <ConsoleShell role="admin" showSidebar>
      <PageFrame
        eyebrow="Daily operations"
        title="Attendance"
        description="Live registers, absence alerts and statutory reporting. Thresholds trigger parent notifications automatically."
        actions={
          <>
            <button type="button" className="rounded border border-[#d8dde4] px-3 py-2 text-[13px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Export return</button>
            <Link href="/teacher/attendance" className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">Open registers</Link>
          </>
        }
      >
        <StatGrid
          items={[
            { label: 'Attendance today', value: `${rate}%`, detail: `${present} present · ${learners - present} late or absent` },
            { label: 'Absences', value: String(learners - present), detail: '2 unauthorised, 3 excused', tone: 'warn' },
            { label: 'Chronic absence', value: '2 learners', detail: 'Below 80% this term', tone: 'danger' },
            { label: 'Alerts sent', value: '7', detail: 'SMS / email delivered today' },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <Panel title="This week" description="Whole-school daily attendance rate.">
            <BarList items={attendanceTrend.map(day => ({ label: day.day, value: day.rate, display: `${day.rate}%` }))} tone="info" />
          </Panel>
          <Panel title="Sections today" description="Present, late and absent counts." className="overflow-hidden" bodyClassName="p-0">
            <table className="min-w-full text-sm">
              <thead className={tableHead}>
                <tr><Th>Section</Th><Th>Present</Th><Th>Late</Th><Th>Absent</Th><Th>Rate</Th></tr>
              </thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {attendanceBySection.map(section => (
                  <tr key={section.section}>
                    <Td className="font-semibold text-[#2f3338]">{section.section}</Td>
                    <Td>{section.present}</Td>
                    <Td>{section.late}</Td>
                    <Td className={section.absent ? 'font-semibold text-rose-600' : ''}>{section.absent}</Td>
                    <Td className="w-[120px]"><Progress value={section.rate} tone={section.rate < 90 ? 'warn' : 'success'} label={`${section.rate}%`} /></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>

        <Panel title="Attendance heatmap" description="Section by weekday — spot patterns such as Monday absence or a period a cohort skips.">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-1 text-center text-[12px]">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left text-[10px] font-bold uppercase tracking-[.1em] text-[#9aa3ad]">Section</th>
                  {weekDays.map(day => <th key={day} className="px-2 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#9aa3ad]">{day}</th>)}
                </tr>
              </thead>
              <tbody>
                {attendanceBySection.map(section => (
                  <tr key={section.section}>
                    <th className="whitespace-nowrap px-2 py-1.5 text-left text-[12px] font-medium text-[#3d4450]">{section.section}</th>
                    {(offsets[section.section] || [0, 0, 0, 0, 0]).map((offset, index) => {
                      const value = Math.max(60, Math.min(100, section.rate + offset));
                      return <td key={`${section.section}-${weekDays[index]}`} className={`rounded px-2 py-2 font-semibold ${heatTone(value)}`}>{value}%</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Threshold alerts" description="Escalation is configurable — letter, tutor meeting or parent call." className="overflow-hidden" bodyClassName="p-0">
          <table className="min-w-full text-sm">
            <thead className={tableHead}><tr><Th>Learner</Th><Th>Rate</Th><Th>Pattern</Th><Th>Next action</Th><Th>Status</Th></tr></thead>
            <tbody className="divide-y divide-[#eef1f4]">
              {attendanceAlerts.map(alert => (
                <tr key={alert.student}>
                  <Td className="font-semibold text-[#2f3338]">{alert.student}</Td>
                  <Td>{alert.rate}%</Td>
                  <Td>{alert.pattern}</Td>
                  <Td>{alert.action}</Td>
                  <Td><Badge tone={statusTone(alert.action)}>{alert.rate < 80 ? 'escalated' : 'in progress'}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Callout tone="info" title="Edits after the lock period need a reason.">
          Registers lock 24 hours after a lesson. Corrections keep the original value, the new value, the reason and the approving staff member.
        </Callout>
      </PageFrame>
    </ConsoleShell>
  );
}
