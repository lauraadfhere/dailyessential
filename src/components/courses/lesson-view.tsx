'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { currentStudent } from './enrolment';
import LessonBody from './lesson-body';
import type { Course } from '../../lib/courses-data';

type Progress = { enrolled: boolean; status: string; completedLessons: number[]; lastLesson: number };

/** Standalone lesson page (/courses/[slug]/lessons/[index]). The reader uses LessonBody directly. */
export default function LessonView({ course, lessonIndex }: { course: Course; lessonIndex: number }) {
  const [progress, setProgress] = useState<Progress>({ enrolled: false, status: 'none', completedLessons: [], lastLesson: 0 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const total = course.modules.length;
  const completed = progress.completedLessons;
  const percent = Math.round((completed.length / total) * 100);
  const done = completed.includes(lessonIndex);

  useEffect(() => {
    const student = currentStudent();
    fetch(`/api/enrollments?email=${encodeURIComponent(student.email)}`)
      .then(response => response.json())
      .then(data => {
        const row = (data.enrollments || []).find((item: { courseSlug: string; status: string }) =>
          item.courseSlug === course.slug && ['active', 'completed'].includes(item.status),
        );
        if (row) {
          setProgress({ enrolled: true, status: row.status, completedLessons: row.completedLessons || [], lastLesson: row.lastLesson || 0 });
          fetch('/api/enrollments', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseSlug: course.slug, lessonIndex, action: 'open' }),
          }).catch(() => undefined);
        } else {
          setProgress(current => ({ ...current, enrolled: false }));
        }
      })
      .catch(() => setMessage('Could not load your progress.'));
  }, [course.slug, lessonIndex]);

  async function toggle() {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/enrollments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug: course.slug, lessonIndex, action: done ? 'uncomplete' : 'complete' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save progress');
      setProgress(current => ({ ...current, status: data.enrollment.status, completedLessons: data.enrollment.completedLessons, lastLesson: data.enrollment.lastLesson }));
      if (data.enrollment.status === 'completed') setMessage('Congratulations, you have completed this course!');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not save progress');
    } finally {
      setSaving(false);
    }
  }

  const prev = lessonIndex > 0 ? lessonIndex - 1 : null;
  const next = lessonIndex < total - 1 ? lessonIndex + 1 : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-8 lg:grid-cols-[1fr_280px]">
      <section className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1738a8]">
          Lesson {lessonIndex + 1} of {total}
        </p>
        <h1 className="mt-3 border-b-4 border-[#1738a8] bg-[#e9eef5] px-4 py-4 text-2xl font-bold text-slate-900">{course.modules[lessonIndex]}</h1>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">{progress.enrolled ? `${completed.length} of ${total} lessons, ${percent}%` : 'Open lesson — enrol to save progress and get a grade'}</p>
          {progress.enrolled && (
            <button
              type="button"
              onClick={toggle}
              disabled={saving}
              className="bg-[#1738a8] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#102d88] disabled:opacity-60"
            >
              {saving ? 'Saving…' : done ? 'Mark as not complete' : 'Mark as complete'}
            </button>
          )}
        </div>
        {message && <p className="mt-3 text-sm font-semibold text-emerald-700">{message}</p>}

        <div className="mt-6">
          <LessonBody course={course} lessonIndex={lessonIndex} />
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm">
          {prev !== null ? <Link href={`/courses/${course.slug}/lessons/${prev}`} className="font-bold text-[#1738a8] hover:underline">← Previous</Link> : <span />}
          {next !== null ? <Link href={`/courses/${course.slug}/lessons/${next}`} className="font-bold text-[#1738a8] hover:underline">Next →</Link> : <span />}
        </div>
      </section>

      <aside className="h-fit border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-400">Course outline</p>
        <ol className="mt-3 space-y-1">
          {course.modules.map((module, index) => {
            const isDone = completed.includes(index);
            return (
              <li key={module}>
                <Link
                  href={`/courses/${course.slug}/lessons/${index}`}
                  aria-current={index === lessonIndex ? 'page' : undefined}
                  className={`flex items-start gap-2 px-2 py-1.5 text-[12px] hover:bg-slate-50 ${index === lessonIndex ? 'bg-[#e9eef5] font-bold text-[#1738a8]' : 'text-slate-700'}`}
                >
                  <span aria-hidden="true">{isDone ? '✓' : '•'}</span>
                  <span>{module}</span>
                  <span className="sr-only">{isDone ? '(completed)' : ''}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
}
