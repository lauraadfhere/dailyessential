'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { Course } from '../../lib/courses-data';
import { lessonToText } from '../../lib/lesson-text';
import { LessonContent, useLesson } from './lesson-body';
import ActivitiesPanel from './activities-panel';
import LessonAiPanel from './lesson-ai-panel';
import NotesPanel from './notes-panel';
import ReaderTabs from './reader-tabs';
import TimeTracker from './time-tracker';

type Progress = { enrolled: boolean; status: string; completedLessons: number[]; lastLesson: number; progress: number };



function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'lesson';
}

export default function CourseReader({ course, lessonIndex }: { course: Course; lessonIndex: number }) {
  const router = useRouter();
  const total = course.modules.length;
  const [progress, setProgress] = useState<Progress>({ enrolled: false, status: 'none', completedLessons: [], lastLesson: 0, progress: 0 });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [indexOpen, setIndexOpen] = useState(false);
  const lessonData = useLesson(course, lessonIndex);

  useEffect(() => {
    fetch('/api/enrollments', { cache: 'no-store' })
      .then(response => response.json())
      .then(data => {
        const row = (data.enrollments || []).find((item: { courseSlug: string; status: string }) =>
          item.courseSlug === course.slug && ['active', 'completed'].includes(item.status),
        );
        if (row) {
          setProgress({ enrolled: true, status: row.status, completedLessons: row.completedLessons || [], lastLesson: row.lastLesson || 0, progress: row.progress || 0 });
          fetch('/api/enrollments', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseSlug: course.slug, lessonIndex, action: 'open' }),
          }).catch(() => undefined);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, [course.slug, lessonIndex]);

  const completed = useMemo(() => new Set(progress.completedLessons), [progress.completedLessons]);
  const percentDone = total ? Math.round((completed.size / total) * 100) : 0;
  const done = completed.has(lessonIndex);
  const prev = lessonIndex > 0 ? lessonIndex - 1 : null;
  const next = lessonIndex < total - 1 ? lessonIndex + 1 : null;
  const base = `/courses/${course.slug}/reader`;
  const moduleTitle = course.modules[lessonIndex];

  async function toggleDone() {
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
      setProgress(current => ({
        ...current,
        status: data.enrollment.status,
        completedLessons: data.enrollment.completedLessons,
        lastLesson: data.enrollment.lastLesson,
        progress: data.enrollment.progress,
      }));
      setMessage(data.enrollment.status === 'completed' ? 'Congratulations, you have completed this course!' : done ? '' : 'Marked as done.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not save progress');
    } finally {
      setSaving(false);
    }
  }

  const downloadLesson = () => {
    if (!lessonData.lesson) return;
    const blob = new Blob([`# ${course.title}\n\n${lessonToText(lessonData.lesson, Number.MAX_SAFE_INTEGER)}\n`], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${course.slug}-module-${lessonIndex + 1}-${slugify(moduleTitle)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const lessonView = <LessonContent course={course} lessonIndex={lessonIndex} data={lessonData} />;
  const documentView = <LessonContent course={course} lessonIndex={lessonIndex} data={lessonData} part="document" />;

  const navBar = (
    <div className="no-print flex flex-wrap items-center justify-between gap-3">
      {prev !== null ? (
        <Link href={`${base}/${prev}`} className="border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-bold text-slate-700 hover:border-[#1738a8] hover:text-[#1738a8]">◀ Previous</Link>
      ) : <span />}
      <label className="flex min-w-0 flex-1 items-center justify-center gap-2 text-[12px] text-slate-500 sm:max-w-md">
        <span className="sr-only">Jump to module</span>
        <select
          value={lessonIndex}
          onChange={event => router.push(`${base}/${event.target.value}`)}
          className="w-full min-w-0 border border-slate-300 bg-white px-2 py-1.5 text-[12px] text-slate-800"
        >
          {course.modules.map((title, index) => (
            <option key={index} value={index}>{completed.has(index) ? '✓ ' : ''}{index + 1}. {title}</option>
          ))}
        </select>
      </label>
      {next !== null ? (
        <Link href={`${base}/${next}`} className="bg-[#1738a8] px-3 py-1.5 text-[12px] font-bold text-white hover:bg-[#102d88]">Next ▶</Link>
      ) : <span />}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      <nav aria-label="Breadcrumb" className="no-print mb-4 text-[12px] text-slate-500">
        <Link href="/student/courses" className="font-semibold text-[#1738a8] hover:underline">My courses</Link>
        <span className="mx-2">/</span>
        <Link href={`/courses/${course.slug}`} className="font-semibold text-[#1738a8] hover:underline">{course.title}</Link>
        <span className="mx-2">/</span>
        <span>Module {lessonIndex + 1}</span>
      </nav>

      <button
        type="button"
        onClick={() => setIndexOpen(open => !open)}
        aria-expanded={indexOpen}
        className="no-print mb-4 w-full border border-slate-300 bg-white px-4 py-2.5 text-left text-sm font-bold text-slate-800 lg:hidden"
      >
        {indexOpen ? 'Hide course index' : `Course index · ${percentDone}% complete`}
      </button>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className={`no-print space-y-4 lg:sticky lg:top-4 lg:block lg:self-start ${indexOpen ? 'block' : 'hidden'}`}>
          <div className="border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Your progress</p>
            <div className="mt-2 flex items-end gap-3">
              <span className="text-3xl font-bold text-[#1738a8]">{percentDone}%</span>
              <span className="pb-1 text-sm text-slate-600">{completed.size}/{total} modules done</span>
            </div>
            <div className="mt-3 h-2 w-full bg-slate-200" role="progressbar" aria-valuenow={percentDone} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-2 bg-emerald-600 transition-all" style={{ width: `${percentDone}%` }} />
            </div>
            <p className="mt-3 text-xs text-slate-500">Grades for quizzes and tasks are in your progress report (the document icon in the header).</p>
            {loaded && !progress.enrolled && (
              <p className="mt-3 text-xs text-slate-600">
                You are not enrolled yet.{' '}
                <Link href={`/courses/${course.slug}`} className="font-bold text-[#1738a8] underline">Enrol</Link> to save progress and your grade.
              </p>
            )}
          </div>

          <nav aria-label="Course index" className="border border-slate-200 bg-white">
            <p className="border-b border-slate-200 px-4 py-3 text-sm font-bold text-slate-900">Course index</p>
            <ol className="max-h-[60vh] overflow-y-auto">
              {course.modules.map((title, index) => {
                const isDone = completed.has(index);
                const isCurrent = index === lessonIndex;
                return (
                  <li key={index} className="border-b border-slate-100 last:border-b-0">
                    <Link
                      href={`${base}/${index}`}
                      onClick={() => setIndexOpen(false)}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={`flex items-start gap-3 border-l-4 px-4 py-3 text-[13px] hover:bg-slate-50 ${isCurrent ? 'border-[#1738a8] bg-blue-50 font-semibold text-[#1738a8]' : 'border-transparent text-slate-700'}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${isDone ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 text-slate-500'}`}
                      >
                        {isDone ? '✓' : index + 1}
                      </span>
                      <span>
                        {title}
                        <span className="sr-only">{isDone ? ' (completed)' : ''}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        </aside>

        <section className="min-w-0">
          {progress.enrolled && <TimeTracker courseSlug={course.slug} />}

          <div className="no-print border border-slate-200 bg-white p-4 sm:p-5">
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#1738a8]">{course.title} · Module {lessonIndex + 1} of {total}</p>
            <h1 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">{moduleTitle}</h1>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 text-[13px]">
                <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[12px] font-bold ${done ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-300 bg-slate-50 text-slate-600'}`}>
                  <span aria-hidden="true">{done ? '✓' : '○'}</span>
                  {done ? 'Done' : 'To do'}
                </span>
                <span className="text-slate-500">Read the module, then mark it as done.</span>
              </div>
              {progress.enrolled ? (
                <button
                  type="button"
                  onClick={toggleDone}
                  disabled={saving}
                  className={`px-4 py-2 text-[12px] font-bold disabled:opacity-60 ${done ? 'border border-slate-300 bg-white text-slate-700 hover:border-[#1738a8]' : 'bg-emerald-700 text-white hover:bg-emerald-800'}`}
                >
                  {saving ? 'Saving…' : done ? 'Mark as not done' : 'Mark as done'}
                </button>
              ) : loaded ? (
                <Link href={`/courses/${course.slug}`} className="bg-[#1738a8] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#102d88]">Enrol to track progress</Link>
              ) : null}
            </div>
            {message && <p role="status" className="mt-3 text-sm font-semibold text-emerald-700">{message}</p>}
          </div>

          <div className="mt-4">{navBar}</div>

          <div className="mt-4 border border-slate-200 bg-white p-4 sm:p-6">
            <ReaderTabs
              lesson={lessonView}
              document={
                <div>
                  <div className="no-print flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm text-slate-700">A clean document view of this module. Print it or save it as a PDF from your browser.</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={downloadLesson} disabled={!lessonData.lesson} className="border border-slate-300 bg-white px-3 py-2 text-[12px] font-bold text-slate-700 hover:border-[#1738a8] disabled:opacity-50">Download text</button>
                      <button type="button" onClick={() => window.print()} className="bg-[#1738a8] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#102d88]">Print / save as PDF</button>
                    </div>
                  </div>
                  <article className="printable mx-auto mt-4 max-w-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
                    <p className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-400">Daily Essential School · {course.title}</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">Module {lessonIndex + 1}: {moduleTitle}</h2>
                    <div className="mt-4 border-t border-slate-200 pt-2">{documentView}</div>
                  </article>
                </div>
              }
              activities={
                lessonData.state === 'ready' && lessonData.lesson
                  ? <ActivitiesPanel course={course} lessonIndex={lessonIndex} lesson={lessonData.lesson} />
                  : <LessonContent course={course} lessonIndex={lessonIndex} data={{ ...lessonData, state: lessonData.state === 'ready' ? 'error' : lessonData.state, error: lessonData.error || 'No activities available.' }} />
              }
              notes={<NotesPanel key={`notes-${course.slug}-${lessonIndex}`} courseSlug={course.slug} lessonIndex={lessonIndex} />}
              ai={<LessonAiPanel key={`${course.slug}-${lessonIndex}`} courseSlug={course.slug} lessonIndex={lessonIndex} moduleTitle={moduleTitle} />}
              files={
                <ul className="divide-y divide-slate-200 border border-slate-200 bg-white">
                  <li className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span className="text-slate-800">This module as text (Markdown)</span>
                    <button type="button" onClick={downloadLesson} disabled={!lessonData.lesson} className="font-bold text-[#1738a8] hover:underline disabled:opacity-50">Download</button>
                  </li>
                  <li className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span className="text-slate-800">Course image</span>
                    <a href={course.cover} download className="font-bold text-[#1738a8] hover:underline">Download</a>
                  </li>
                </ul>
              }
            />
          </div>

          <div className="mt-4">{navBar}</div>
        </section>
      </div>
    </div>
  );
}
