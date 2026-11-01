'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { currentStudent } from './enrolment';
import type { Course } from '../../lib/courses-data';

type Progress = { enrolled: boolean; status: string; completedLessons: number[]; lastLesson: number };

/** Lesson 1 is a preview anyone can open; every other lesson is locked until the student is enrolled. */
export const PREVIEW_LESSON_INDEX = 0;

export default function LessonView({ course, lessonIndex }: { course: Course; lessonIndex: number }) {
  const router = useRouter();
  const [progress, setProgress] = useState<Progress>({ enrolled: false, status: 'none', completedLessons: [], lastLesson: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const isPreview = lessonIndex === PREVIEW_LESSON_INDEX;
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
            body: JSON.stringify({ email: student.email, courseSlug: course.slug, lessonIndex, action: 'open' }),
          }).catch(() => undefined);
        } else {
          setProgress(current => ({ ...current, enrolled: false }));
          if (!isPreview) router.replace(`/courses/${course.slug}`);
        }
      })
      .catch(() => setMessage('Could not load your progress.'))
      .finally(() => setLoading(false));
  }, [course.slug, lessonIndex, isPreview, router]);

  async function toggle() {
    const student = currentStudent();
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/enrollments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: student.email,
          courseSlug: course.slug,
          lessonIndex,
          action: done ? 'uncomplete' : 'complete',
        }),
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

  if (loading) return <p className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-500 sm:px-8">Loading lesson…</p>;

  if (!isPreview && !progress.enrolled) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-8">
        <h1 className="text-xl font-bold">This lesson is locked</h1>
        <p className="mt-2 text-sm text-slate-600">Enrol in {course.title} to open every lesson.</p>
        <Link href={`/courses/${course.slug}`} className="mt-5 inline-block bg-[#1738a8] px-4 py-2.5 text-[12px] font-bold text-white hover:bg-[#102d88]">
          Go to course page
        </Link>
      </section>
    );
  }

  const prev = lessonIndex > 0 ? lessonIndex - 1 : null;
  const next = lessonIndex < total - 1 ? lessonIndex + 1 : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-8 lg:grid-cols-[1fr_280px]">
      <section className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1738a8]">
          Lesson {lessonIndex + 1} of {total} {isPreview && '· Preview'}
        </p>
        <h1 className="mt-3 border-b-4 border-[#1738a8] bg-[#e9eef5] px-4 py-4 text-2xl font-bold text-slate-900">{course.modules[lessonIndex]}</h1>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">{progress.enrolled ? `${completed.length} of ${total} lessons, ${percent}%` : 'Preview lesson'}</p>
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

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm">
          {prev !== null ? <Link href={`/courses/${course.slug}/lessons/${prev}`} className="font-bold text-[#1738a8] hover:underline">← Previous</Link> : <span />}
          {next !== null ? <Link href={`/courses/${course.slug}/lessons/${next}`} className="font-bold text-[#1738a8] hover:underline">Next →</Link> : <span />}
        </div>
      </section>

      <aside className="border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-400">Course outline</p>
        <ol className="mt-3 space-y-1">
          {course.modules.map((module, index) => {
            const locked = index !== PREVIEW_LESSON_INDEX && !progress.enrolled;
            const isDone = completed.includes(index);
            return (
              <li key={module}>
                {locked ? (
                  <span className="flex items-start gap-2 px-2 py-1.5 text-[12px] text-slate-400">
                    <span aria-hidden="true">🔒</span> {module}
                  </span>
                ) : (
                  <Link
                    href={`/courses/${course.slug}/lessons/${index}`}
                    aria-current={index === lessonIndex ? 'page' : undefined}
                    className={`flex items-start gap-2 px-2 py-1.5 text-[12px] hover:bg-slate-50 ${index === lessonIndex ? 'bg-[#e9eef5] font-bold text-[#1738a8]' : 'text-slate-700'}`}
                  >
                    <span aria-hidden="true">{isDone ? '✓' : index === PREVIEW_LESSON_INDEX && !progress.enrolled ? '👁' : '•'}</span>
                    <span>{module}</span>
                    <span className="sr-only">{isDone ? '(completed)' : ''}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
}
