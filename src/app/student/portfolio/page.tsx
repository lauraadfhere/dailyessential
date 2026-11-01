import Link from 'next/link';
import PortalShell from '../../../components/portal-shell';
import { Badge, Callout, KeyValueGrid, PageFrame, Panel, Progress, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { studentAchievements, studentDocuments, studentSkills } from '../../../lib/atlas-data';

export default function StudentPortfolioPage() {
  const points = studentAchievements.reduce((total, item) => total + item.points, 0);

  return (
    <PortalShell role="student">
      <PageFrame
        variant="portal"
        eyebrow="Student space"
        title="Portfolio & achievements"
        description="Evidence of what you have built, contributed and mastered. Share a verified summary with universities or employers when you need to."
        actions={<button type="button" className="rounded bg-[#1738a8] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#102d88]">Add evidence</button>}
      >
        <StatGrid
          items={[
            { label: 'Achievement points', value: String(points), detail: 'This academic year' },
            { label: 'Skills tracked', value: String(studentSkills.length), detail: 'Self and teacher assessed' },
            { label: 'Service hours', value: '18', detail: 'Community and peer support' },
            { label: 'Certificates', value: '3', detail: 'Design sprint, attendance, mentoring' },
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {studentAchievements.map(item => (
            <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[14px] font-bold text-[#15133d]">{item.title}</h2>
                  <p className="mt-1 text-[12px] text-slate-500">{item.detail}</p>
                </div>
                <Badge tone={item.tone as 'brand' | 'success' | 'info' | 'warn'}>{item.points} pts</Badge>
              </div>
            </article>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <Panel title="Skills and competencies" description="Grows as teachers add evidence from projects and observations.">
            <ul className="space-y-4">
              {studentSkills.map(skill => (
                <li key={skill.name}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-[13px]">
                    <span className="font-medium text-[#15133d]">{skill.name}</span>
                    <span className="text-slate-500">{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} tone={skill.level >= 85 ? 'success' : 'brand'} />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Digital student ID">
            <KeyValueGrid
              items={[
                { label: 'Student', value: 'Amina Ahmed' },
                { label: 'Student ID', value: 'BFT-2026-0142' },
                { label: 'Section', value: 'JSS 2 Blue' },
                { label: 'Campus', value: 'Main Campus' },
              ]}
            />
            <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[.12em] text-slate-400">Card uses</p>
              <p className="mt-1.5 text-[12px] leading-5 text-slate-600">Attendance check-in, library loans and cafeteria balance. The QR code refreshes every minute to prevent sharing.</p>
            </div>
            <Link href="/student/profile" className="mt-4 inline-block text-[12px] font-bold text-[#1738a8] hover:underline">Open full ID card →</Link>
          </Panel>
        </div>

        <Panel title="Documents" description="Verified records you can download or share." className="overflow-hidden" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Document</Th><Th>Type</Th><Th>Updated</Th><Th>Status</Th><Th className="text-right">Action</Th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {studentDocuments.map(document => (
                  <tr key={document.name}>
                    <Td className="font-semibold text-[#15133d]">{document.name}</Td>
                    <Td>{document.type}</Td>
                    <Td className="whitespace-nowrap">{document.updated}</Td>
                    <Td><Badge tone={statusTone(document.status)}>{document.status}</Badge></Td>
                    <Td className="text-right"><button type="button" className="text-[12px] font-bold text-[#1738a8] hover:underline">Download</button></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Callout tone="brand" title="Your portfolio belongs to you.">
          Evidence is private by default. You choose what to include in a shareable summary, and every share link expires.
        </Callout>
      </PageFrame>
    </PortalShell>
  );
}
