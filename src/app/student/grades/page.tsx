'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import FeedbackPanel from '../../../components/ai/feedback-panel';
import PortalShell from '../../../components/portal-shell';
import { Badge, Callout, PageFrame, Panel, Progress, StatGrid, tableHead, Td, Th } from '../../../components/platform/kit';
import { GRADE_SCALE, PASS_MARK, toTwenty } from '../../../lib/grading';

type Report = {
  overall: { percent: number; mark: number; label: string; passed: boolean } | null;
  courses: {
    slug: string; title: string; completion: number; quizPercent: number | null; taskPercent: number | null;
    grade: { percent: number; mark: number; label: string; passed: boolean };
  }[];
};

type Assignment = {
  id: string; title: string; courseTitle: string; maxMarks: number;
  mine: { status: string; marks: number | null; maxMarks: number | null; feedback: string; gradedBy: string } | null;
};

const mark = (percent: number | null) => (percent === null ? '—' : `${toTwenty(percent)}/20`);

export default function StudentGradesPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/progress/report', { cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Could not load your marks.');
        setReport(data as Report);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load your marks.'));
    fetch('/api/assignments', { cache: 'no-store' })
      .then(response => (response.ok ? response.json() : { assignments: [] }))
      .then(data => setAssignments(((data.assignments || []) as Assignment[]).filter(item => item.mine?.status === 'graded')))
      .catch(() => undefined);
  }, []);

  const courses = report?.courses ?? [];
  const best = [...courses].sort((a, b) => b.grade.mark - a.grade.mark)[0];
  const weakest = [...courses].sort((a, b) => a.grade.mark - b.grade.mark)[0];

  return (
    <PortalShell role="student">
      <PageFrame
        variant="portal"
        eyebrow="Student space"
        title="My marks"
        description="Marks are out of 20, the Algerian system: your score out of 100 in a course is divided by 5, and 10/20 is the pass mark."
        actions={<Link href="/student/track" className="rounded border border-[#1738a8] px-3 py-2 text-[13px] font-semibold text-[#1738a8] hover:bg-[#e8eefc]">Track progress</Link>}
      >
        {error && <p role="alert" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

        <StatGrid
          items={[
            { label: 'Overall mark', value: report?.overall ? `${report.overall.mark}/20` : '—', detail: report?.overall ? `${report.overall.label}${report.overall.passed ? '' : ' · below 10'}` : 'No graded work yet', tone: report?.overall && !report.overall.passed ? 'warn' : undefined },
            { label: 'Best course', value: best ? `${best.grade.mark}/20` : '—', detail: best?.title || 'Enrol in a course' },
            { label: 'Needs attention', value: weakest && courses.length > 1 ? `${weakest.grade.mark}/20` : '—', detail: courses.length > 1 ? weakest?.title : 'Needs two or more courses', tone: weakest && weakest.grade.mark < PASS_MARK ? 'warn' : undefined },
            { label: 'Graded assignments', value: String(assignments.length), detail: 'With teacher notes' },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Panel title="Course marks" description="Live from your modules, quizzes, tasks and assignments." className="overflow-hidden" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className={tableHead}><tr><Th>Course</Th><Th>Modules</Th><Th>Quizzes</Th><Th>Tasks</Th><Th>Course mark</Th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map(course => (
                    <tr key={course.slug}>
                      <Td className="font-semibold text-[#15133d]"><Link href={`/courses/${course.slug}/reader/0`} className="hover:underline">{course.title}</Link></Td>
                      <Td><Progress value={course.completion} tone="brand" label={`${course.completion}%`} /></Td>
                      <Td>{mark(course.quizPercent)}</Td>
                      <Td>{mark(course.taskPercent)}</Td>
                      <Td><span className="font-bold text-[#1738a8]">{course.grade.mark}/20</span> <Badge tone={course.grade.passed ? 'success' : 'warn'}>{course.grade.label}</Badge></Td>
                    </tr>
                  ))}
                  {report && courses.length === 0 && <tr><Td className="py-6 text-slate-500">You are not enrolled in a course yet.</Td><Td>{null}</Td><Td>{null}</Td><Td>{null}</Td><Td>{null}</Td></tr>}
                  {!report && !error && <tr><Td className="py-6 text-slate-500">Loading…</Td><Td>{null}</Td><Td>{null}</Td><Td>{null}</Td><Td>{null}</Td></tr>}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Marking scale" description="Algerian system, out of 20." className="overflow-hidden" bodyClassName="p-0">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Mark</Th><Th>Appreciation</Th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {GRADE_SCALE.map((row, index) => {
                  const upper = index === 0 ? 20 : GRADE_SCALE[index - 1].min - 0.1;
                  const active = report?.overall && report.overall.mark >= row.min && report.overall.mark <= upper + 0.05;
                  return (
                    <tr key={row.label} className={active ? 'bg-[#f4f7ff]' : ''}>
                      <Td className="font-bold text-[#1738a8]">{row.min === 0 ? `0 – ${upper.toFixed(1)}` : `${row.min} – ${index === 0 ? '20' : upper.toFixed(1)}`}</Td>
                      <Td>{row.label}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>
        </div>

        <Panel title="Graded assignments" description="Your teacher's mark and notes for each assignment you handed in.">
          {assignments.length === 0 ? (
            <p className="py-4 text-[13px] text-slate-500">Nothing graded yet. <Link href="/student/assignments" className="font-bold text-[#1738a8] underline">Open assignments</Link></p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {assignments.map(item => (
                <li key={item.id} className="py-3 text-[13px]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-[#15133d]">{item.title}<span className="ml-2 font-normal text-slate-400">{item.courseTitle}</span></span>
                    <b className="text-[#1738a8]">{item.mine?.marks}/{item.mine?.maxMarks}</b>
                  </div>
                  {item.mine?.feedback && <p className="mt-1 whitespace-pre-line text-slate-600">{item.mine.gradedBy ? `${item.mine.gradedBy}: ` : ''}{item.mine.feedback}</p>}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Callout tone="info" title="Think a mark is wrong?">
          Open the graded task in its module and choose “Report this mark”, or write to your teacher from <Link href="/student/messages" className="font-bold underline">Messages</Link>. They see the task and your note together.
        </Callout>

        {courses.length > 0 && <FeedbackPanel results={courses.map(course => ({ name: course.title, average: course.grade.percent }))} />}

        <div className="flex flex-wrap gap-3">
          <Link href="/student/wellbeing" className="rounded border border-[#1738a8] px-4 py-2.5 text-[13px] font-bold text-[#1738a8] hover:bg-[#e8eefc]">Exam stress support</Link>
          <Link href="/student/assignments" className="rounded border border-slate-300 px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50">Assignments</Link>
        </div>
      </PageFrame>
    </PortalShell>
  );
}
