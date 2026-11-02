'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { currentStudent } from './enrolment';
import type { Course } from '../../lib/courses-data';
import LessonView from './lesson-view';
import ReaderTabs from './reader-tabs';
import TimeTracker from './time-tracker';

type Progress = { enrolled: boolean; status: string; completedLessons: number[]; lastLesson: number; progress: number };

/** Letter grade from the share of lessons completed. */
export function gradeFor(completedCount: number, total: number) {
  const percent = total ? Math.round((completedCount / total) * 100) : 0;
  const letter = percent === 100 ? 'A' : percent >= 80 ? 'B' : percent >= 60 ? 'C' : percent >= 40 ? 'D' : 'F';
  return { percent, letter };
}

export default function CourseReader({ course, lessonIndex }: { course: Course; lessonIndex: number }) {
  const total = course.modules.length;
  const [progress, setProgress] = useState<Progress>({ enrolled: false, status: 'none', completedLessons: [], lastLesson: 0, progress: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const student = currentStudent();
    fetch(`/api/enrollments?email=${encodeURIComponent(student.email)}`)
      .then(response => response.json())
      .then(data => {
        const row = (data.enrollments || []).find((item: { courseSlug: string; status: string }) =>
          item.courseSlug === course.slug && ['active', 'completed'].includes(item.status),
        );
        if (row) {
          setProgress({
            enrolled: true,
            status: row.status,
            completedLessons: row.completedLessons || [],
            lastLesson: row.lastLesson || 0,
            progress: row.progress || 0,
          });
        }
      })
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, [course.slug]);

  const completed = useMemo(() => new Set(progress.completedLessons), [progress.completedLessons]);
  const grade = gradeFor(completed.size, total);
  const prev = lessonIndex > 0 ? lessonIndex - 1 : null;
  const next = lessonIndex < total - 1 ? lessonIndex + 1 : null;
  const base = `/courses/${course.slug}/reader`;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-4">
        <div className="border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your grade</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-3xl font-bold text-[#1738a8]">{grade.letter}</span>
            <span className="pb-1 text-sm text-slate-600">{grade.percent}% · {completed.size}/{total} lessons</span>
          </div>
          <div className="mt-3 h-2 w-full bg-slate-200">
            <div className="h-2 bg-[#1738a8]" style={{ width: `${grade.percent}%` }} />
          </div>
          {loaded && !progress.enrolled && (
            <p className="mt-3 text-xs text-slate-500">Enrol in this course to save your progress and grade.</p>
          )}
        </div>

        <nav aria-label="Course modules" className="border border-slate-200 bg-white">
          <p className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">Course content</p>
          <ol className="max-h-[60vh] overflow-y-auto">
            {course.modules.map((title, index) => {
              const isDone = completed.has(index);
              const isCurrent = index === lessonIndex;
              return (
                <li key={index}>
                  <Link
                    href={`${base}/${index}`}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`flex items-start gap-3 px-4 py-3 text-sm hover:bg-slate-50 ${isCurrent ? 'bg-blue-50 font-semibold text-[#1738a8]' : 'text-slate-700'}`}
                  >
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${isDone ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 text-slate-500'}`}>
                      {isDone ? '✓' : index + 1}
                    </span>
                    <span>{title}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </aside>

      <section className="min-w-0">
        {progress.enrolled && <TimeTracker courseSlug={course.slug} />}
        <ReaderTabs
          lesson={<LessonView course={course} lessonIndex={lessonIndex} />}
          pdfTitle={`${course.title} · Module ${lessonIndex + 1}`}
          files={[
            { label: 'Course manual (Markdown)', href: '/courses/Daily_Essential_School_Complete_20_Courses_Expanded_Modules.md' },
            { label: 'Course image', href: course.cover },
          ]}
        />
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-5 text-sm">
          {prev !== null ? (
            <Link href={`${base}/${prev}`} className="font-semibold text-[#1738a8] hover:underline">← Previous module</Link>
          ) : <span />}
          {next !== null ? (
            <Link href={`${base}/${next}`} className="font-semibold text-[#1738a8] hover:underline">Next module →</Link>
          ) : <span />}
        </div>
      </section>
    </div>
  );
}
