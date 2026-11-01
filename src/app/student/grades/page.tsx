'use client';

import Link from 'next/link';
import { useState } from 'react';
import FeedbackPanel from '../../../components/ai/feedback-panel';
import PortalShell from '../../../components/portal-shell';
import { Badge, Callout, PageFrame, Panel, Progress, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { gradeBands, gradeCategories } from '../../../lib/atlas-data';

const courses = [
  { name: 'UI / UX Design Studio', average: 86, target: 90 },
  { name: 'Digital Literacy', average: 84, target: 85 },
  { name: 'Computer Science', average: 79, target: 85 },
  { name: 'Mathematics', average: 74, target: 80 },
  { name: 'English Language', average: 91, target: 90 },
];

function bandFor(percent: number) {
  return gradeBands.find(band => {
    const [low, high] = band.range.split('–').map(value => Number(value.trim()));
    return percent >= low && percent <= high;
  }) || gradeBands[gradeBands.length - 1];
}

export default function StudentGradesPage() {
  const [examScore, setExamScore] = useState(81);
  const [target, setTarget] = useState(80);

  const otherWeight = gradeCategories.filter(category => category.name !== 'Exam').reduce((total, category) => total + category.weight, 0);
  const current = Math.round(gradeCategories.reduce((total, category) => total + (category.name === 'Exam' ? examScore : category.average) * category.weight, 0) / 100);
  const remainingWeight = 100 - otherWeight;
  const required = Math.ceil(((target * 100) - gradeCategories.filter(category => category.name !== 'Exam').reduce((total, category) => total + category.average * category.weight, 0)) / remainingWeight);
  const requiredClamped = Math.max(0, Math.min(100, required));
  const band = bandFor(current);

  return (
    <PortalShell role="student">
      <PageFrame
        variant="portal"
        eyebrow="Student space"
        title="My marks"
        description="Published results only. Use the what-if calculator to see the exam score needed for your target grade."
        actions={<Link href="/student/courses" className="rounded border border-[#1738a8] px-3 py-2 text-[13px] font-semibold text-[#1738a8] hover:bg-[#e8eefc]">Courses</Link>}
      >
        <StatGrid
          items={[
            { label: 'Term average', value: `${current}%`, detail: `Grade ${band.letter} · ${band.descriptor}` },
            { label: 'Best course', value: '91%', detail: 'English Language' },
            { label: 'Needs attention', value: '74%', detail: 'Mathematics', tone: 'warn' },
            { label: 'Class rank', value: '6 / 26', detail: 'Shared only with you and your guardian' },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <Panel title="Course results" description="Term 1 · published 27 Oct 2026." className="overflow-hidden" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className={tableHead}><tr><Th>Course</Th><Th>Average</Th><Th>Grade</Th><Th>Target</Th><Th>Gap</Th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map(course => {
                    const courseBand = bandFor(course.average);
                    const gap = course.average - course.target;
                    return (
                      <tr key={course.name}>
                        <Td className="font-semibold text-[#15133d]">{course.name}</Td>
                        <Td><Progress value={course.average} tone={course.average < 80 ? 'warn' : 'brand'} label={`${course.average}%`} /></Td>
                        <Td><Badge tone={statusTone(courseBand.letter === 'A' || courseBand.letter === 'B' ? 'success' : courseBand.letter === 'F' ? 'danger' : 'info')}>{courseBand.letter}</Badge></Td>
                        <Td>{course.target}%</Td>
                        <Td className={gap < 0 ? 'font-semibold text-rose-600' : 'font-semibold text-emerald-700'}>{gap > 0 ? `+${gap}` : gap}</Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Grade scale" description="Daily Essential senior school scale." className="overflow-hidden" bodyClassName="p-0">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Grade</Th><Th>Range</Th><Th>GPA</Th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {gradeBands.map(item => (
                  <tr key={item.letter} className={item.letter === band.letter ? 'bg-[#f4f7ff]' : ''}>
                    <Td className="font-bold text-[#1738a8]">{item.letter}</Td>
                    <Td>{item.range}</Td>
                    <Td>{item.gpa.toFixed(1)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <Panel title="What-if calculator" description="Change the exam score and target to plan your revision.">
            <label className="block text-[13px]">
              <span className="flex items-center justify-between gap-3 text-[#15133d]"><span className="font-semibold">Exam score</span><span className="font-bold text-[#1738a8]">{examScore}%</span></span>
              <input type="range" min={0} max={100} value={examScore} onChange={event => setExamScore(Number(event.target.value))} className="mt-2 w-full accent-[#1738a8]" />
            </label>
            <label className="mt-5 block text-[13px]">
              <span className="font-semibold text-[#15133d]">Target term average</span>
              <select value={target} onChange={event => setTarget(Number(event.target.value))} className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-[#1738a8]">
                {[70, 75, 80, 85, 90].map(value => <option key={value} value={value}>{value}%</option>)}
              </select>
            </label>
            <div className="mt-5 rounded border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[.12em] text-slate-400">Projected term average</p>
              <p className="mt-1 text-3xl font-bold text-[#15133d]">{current}%</p>
              <p className="mt-1 text-[12px] text-slate-500">Grade {band.letter} · {band.descriptor}</p>
              <p className="mt-3 border-t border-slate-200 pt-3 text-[12px] leading-5 text-slate-600">
                To reach <b>{target}%</b> you need about <b>{requiredClamped}%</b> in the exam (weighted at {remainingWeight}%).
              </p>
            </div>
          </Panel>

          <Panel title="How this is calculated" description="Weights are set by the teacher and visible before you submit.">
            <ul className="space-y-3">
              {gradeCategories.map(category => (
                <li key={category.name}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-[13px]">
                    <span className="font-medium text-[#15133d]">{category.name}</span>
                    <span className="text-slate-500">weight {category.weight}% · avg {category.average}%</span>
                  </div>
                  <Progress value={category.average} tone="brand" />
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <Callout tone="info" title="A mark query is a click away.">
                If something looks wrong, open a structured query from the course page. Your teacher sees it with the assessment and the full change history.
              </Callout>
            </div>
          </Panel>
        </div>

        <FeedbackPanel results={courses.map(course => ({ name: course.name, average: course.average }))} />

        <div className="flex flex-wrap gap-3">
          <Link href="/student/wellbeing" className="rounded border border-[#1738a8] px-4 py-2.5 text-[13px] font-bold text-[#1738a8] hover:bg-[#e8eefc]">Exam stress support</Link>
          <Link href="/workspace/student/assessments" className="rounded border border-slate-300 px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50">Assessment schedule</Link>
        </div>
      </PageFrame>
    </PortalShell>
  );
}
