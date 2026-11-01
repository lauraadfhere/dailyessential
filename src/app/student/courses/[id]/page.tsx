import Link from 'next/link';
import { notFound } from 'next/navigation';
import PortalShell from '../../../../components/portal-shell';
import { Badge, Callout, KeyValueGrid, PageFrame, Panel, Progress, StatGrid, statusTone, tableHead, Td, Th } from '../../../../components/platform/kit';
import { assignmentRecords, courseCatalog } from '../../../../lib/atlas-data';

const lessonTitles = [
  'Course orientation and assessment plan',
  'Core concepts and vocabulary',
  'Guided practice with worked examples',
  'Studio task — apply the concept',
  'Peer critique and revision',
  'Checkpoint quiz and reflection',
  'Project build',
  'Showcase and next steps',
];

const resources = [
  { title: 'Course syllabus (PDF)', type: 'Document' },
  { title: 'Lesson slides — week 9', type: 'Slides' },
  { title: 'Practice dataset', type: 'Data' },
  { title: 'Revision guide', type: 'PDF' },
];

export default async function StudentCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = courseCatalog.find(item => item.id === id);
  if (!course) notFound();

  const completed = Math.round((course.completed / course.lessons) * lessonTitles.length);
  const courseAssignments = assignmentRecords.filter(item => item.course === course.title);

  return (
    <PortalShell role="student">
      <PageFrame
        variant="portal"
        eyebrow={`${course.code} · ${course.section}`}
        title={course.title}
        description={`${course.teacher} · ${course.lessons} lessons this term. Complete lessons in order to unlock the next checkpoint.`}
        actions={<Link href="/student/courses" className="rounded border border-[#1738a8] px-3 py-2 text-[13px] font-semibold text-[#1738a8] hover:bg-[#e8eefc]">All courses</Link>}
      >
        <StatGrid
          items={[
            { label: 'Progress', value: `${course.progress}%`, detail: `${course.completed} of ${course.lessons} lessons` },
            { label: 'Next lesson', value: course.nextLesson, detail: 'Unlocks after the current checkpoint' },
            { label: 'Assignments', value: String(courseAssignments.length), detail: 'One due this week' },
            { label: 'Course average', value: '84%', detail: 'Grade B · above target', tone: 'success' },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <Panel title="Lessons" description="Mark a lesson complete as you finish it." className="overflow-hidden" bodyClassName="p-0">
            <ul className="divide-y divide-slate-100">
              {lessonTitles.map((lesson, index) => {
                const done = index < completed;
                return (
                  <li key={lesson} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${done ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{done ? '✓' : index + 1}</span>
                      <div className="min-w-0">
                        <p className={`truncate text-[13px] font-semibold ${done ? 'text-slate-500' : 'text-[#15133d]'}`}>{lesson}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{index === completed ? 'Current lesson' : done ? 'Completed' : 'Locked until previous lesson'}</p>
                      </div>
                    </div>
                    {index === completed && <Badge tone="brand">Open</Badge>}
                  </li>
                );
              })}
            </ul>
          </Panel>

          <div className="space-y-5">
            <Panel title="Course details">
              <KeyValueGrid
                items={[
                  { label: 'Teacher', value: course.teacher },
                  { label: 'Section', value: course.section },
                  { label: 'Delivery', value: 'Blended · studio + online' },
                  { label: 'Assessment', value: 'Homework 20 · Project 30 · Exam 50' },
                ]}
              />
            </Panel>
            <Panel title="Resources">
              <ul className="divide-y divide-slate-100">
                {resources.map(resource => (
                  <li key={resource.title} className="flex items-center justify-between gap-3 py-2.5 text-[13px] first:pt-0 last:pb-0">
                    <span className="font-medium text-slate-700">{resource.title}</span>
                    <span className="text-[11px] text-slate-400">{resource.type}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>

        <Panel title="Assignments and marks" description="Only published marks are shown." className="overflow-hidden" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Assignment</Th><Th>Due</Th><Th>Status</Th><Th>Score</Th><Th>Feedback</Th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {courseAssignments.map(item => (
                  <tr key={item.id}>
                    <Td className="font-semibold text-[#15133d]">{item.title}</Td>
                    <Td className="whitespace-nowrap">{item.due}</Td>
                    <Td><Badge tone={statusTone(item.status)}>{item.status}</Badge></Td>
                    <Td>{item.score === null ? '—' : `${item.score} / ${item.max}`}</Td>
                    <Td className="max-w-sm">{item.feedback || 'Awaiting marking'}</Td>
                  </tr>
                ))}
                {!courseAssignments.length && <tr><Td className="text-slate-500">No assignments set for this course yet.</Td><Td>—</Td><Td>—</Td><Td>—</Td><Td>—</Td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="flex flex-wrap gap-3">
          <Link href="/student/assignments" className="rounded bg-[#1738a8] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#102d88]">Open assignments</Link>
          <Link href="/student/grades" className="rounded border border-[#1738a8] px-4 py-2.5 text-[13px] font-bold text-[#1738a8] hover:bg-[#e8eefc]">View all grades</Link>
        </div>

        <Callout tone="brand" title="Need help with this course?">
          Book office hours with {course.teacher} from the timetable, or ask DAMMI AI for a guided explanation of the current lesson.
        </Callout>
      </PageFrame>
    </PortalShell>
  );
}
