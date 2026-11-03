'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Report = {
  learner: { email: string; name: string };
  generatedAt: string;
  overall: { percent: number; mark: number; label: string; passed: boolean } | null;
  todo: { course: string; courseSlug: string; type: 'lesson' | 'task' | 'quiz' | 'waiting'; title: string; href: string }[];
  courses: {
    slug: string;
    title: string;
    status: string;
    completedLessons: number;
    totalLessons: number;
    completion: number;
    timeSpentMinutes: number;
    quizPercent: number | null;
    taskPercent: number | null;
    grade: { percent: number; mark: number; label: string; passed: boolean };
    lessons: {
      index: number;
      title: string;
      completed: boolean;
      quiz: { score: number | null; max: number | null } | null;
      tasks: { key: string; label: string; status: string; marks: number | null; maxMarks: number | null; feedback: string }[];
    }[];
  }[];
};

const typeLabel = { lesson: 'Lesson', task: 'Task', quiz: 'Quiz', waiting: 'Waiting' } as const;
const typeTone = {
  lesson: 'border-blue-200 bg-blue-50 text-blue-800',
  task: 'border-amber-300 bg-amber-50 text-amber-800',
  quiz: 'border-violet-200 bg-violet-50 text-violet-800',
  waiting: 'border-slate-300 bg-slate-50 text-slate-600',
} as const;

function hours(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

/** Small icon that opens the learner's full progress report: grades, activities and what is still to do. */
export default function ProgressReport({ className = '', label = 'Progress report', tone = 'on-dark' }: { className?: string; label?: string; tone?: 'on-dark' | 'on-light' }) {
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch('/api/progress/report', { cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Could not load your report.');
        if (!cancelled) { setReport(data as Report); setError(''); }
      })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load your report.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => { setLoading(true); setOpen(true); }}
        aria-label={label}
        title={label}
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center border ${tone === 'on-dark' ? 'border-white/40 bg-transparent text-white hover:bg-white/15' : 'border-slate-300 bg-white text-[#1738a8] hover:border-[#1738a8]'} ${className}`}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 2h9l5 5v15H6z" />
          <path d="M14 2v6h6M9 13h6M9 17h6M9 9h2" />
        </svg>
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Progress report" className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-900/60 p-3 sm:p-8" onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
          <div className="w-full max-w-4xl bg-white shadow-2xl">
            <div className="no-print flex items-center justify-between gap-3 border-b border-slate-200 bg-[#1738a8] px-5 py-3 text-white">
              <p className="text-sm font-bold">Progress report</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => window.print()} disabled={!report} className="border border-white/40 px-3 py-1 text-[12px] font-bold hover:bg-white/15 disabled:opacity-50">Print / save as PDF</button>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close report" className="px-2 text-xl leading-none hover:opacity-80">×</button>
              </div>
            </div>

            <div className="printable p-5 sm:p-7">
              {loading && <p className="py-10 text-center text-sm text-slate-500">Building your report…</p>}
              {error && <p role="alert" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

              {report && !loading && (
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-400">Daily Essential School</p>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">{report.learner.name}</h2>
                      <p className="text-xs text-slate-500">{report.learner.email} · generated {new Date(report.generatedAt).toLocaleString()}</p>
                    </div>
                    {report.overall && (
                      <div className="text-right">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Overall mark</p>
                        <p className="text-4xl font-bold text-[#1738a8]">{report.overall.mark}<span className="text-lg text-slate-400">/20</span></p>
                        <p className="text-xs text-slate-600">{report.overall.label} · {report.overall.passed ? 'pass' : 'below the pass mark (10)'}</p>
                      </div>
                    )}
                  </div>

                  <section className="mt-5">
                    <h3 className="text-sm font-bold text-slate-900">What you need to do next</h3>
                    {report.todo.length === 0 ? (
                      <p className="mt-2 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        {report.courses.length ? 'You are up to date. Open a course to continue.' : 'You are not enrolled in any course yet.'}{' '}
                        {!report.courses.length && <Link href="/courses" className="font-bold underline">Browse courses</Link>}
                      </p>
                    ) : (
                      <ul className="mt-2 divide-y divide-slate-100 border border-slate-200">
                        {report.todo.map((item, index) => (
                          <li key={index} className="flex flex-wrap items-center gap-3 px-3 py-2.5 text-sm">
                            <span className={`border px-2 py-0.5 text-[11px] font-bold ${typeTone[item.type]}`}>{typeLabel[item.type]}</span>
                            <Link href={item.href} onClick={() => setOpen(false)} className="min-w-0 flex-1 text-slate-800 hover:text-[#1738a8] hover:underline">{item.title}</Link>
                            <span className="text-[11px] text-slate-400">{item.course}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  <section className="mt-6">
                    <h3 className="text-sm font-bold text-slate-900">Courses and grades</h3>
                    <div className="mt-2 space-y-3">
                      {report.courses.map(course => (
                        <article key={course.slug} className="border border-slate-200">
                          <button type="button" onClick={() => setExpanded(expanded === course.slug ? null : course.slug)} aria-expanded={expanded === course.slug} className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50">
                            <span>
                              <span className="block text-sm font-bold text-slate-900">{course.title}</span>
                              <span className="block text-[11px] text-slate-500">
                                {course.completedLessons}/{course.totalLessons} modules · quizzes {course.quizPercent === null ? '—' : `${course.quizPercent}%`} · tasks {course.taskPercent === null ? 'not graded yet' : `${course.taskPercent}%`} · {hours(course.timeSpentMinutes)}
                              </span>
                            </span>
                            <span className="text-right">
                              <span className="block text-2xl font-bold text-[#1738a8]">{course.grade.mark}<span className="text-sm text-slate-400">/20</span></span>
                              <span className="block text-[11px] text-slate-500">{course.grade.label}</span>
                            </span>
                          </button>
                          <div className="h-1.5 bg-slate-100"><div className="h-1.5 bg-emerald-600" style={{ width: `${course.completion}%` }} /></div>

                          {(expanded === course.slug) && (
                            <ol className="divide-y divide-slate-100 border-t border-slate-200 text-[13px]">
                              {course.lessons.map(lesson => (
                                <li key={lesson.index} className="px-4 py-2.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span aria-hidden="true" className={lesson.completed ? 'text-emerald-600' : 'text-slate-300'}>{lesson.completed ? '✓' : '○'}</span>
                                    <Link href={`/courses/${course.slug}/reader/${lesson.index}`} onClick={() => setOpen(false)} className="font-semibold text-slate-800 hover:text-[#1738a8] hover:underline">{lesson.index + 1}. {lesson.title}</Link>
                                    {lesson.quiz && <span className="text-[11px] text-slate-500">Quiz: {lesson.quiz.score === null ? 'not taken' : `${lesson.quiz.score}/${lesson.quiz.max}`}</span>}
                                  </div>
                                  {lesson.tasks.length > 0 && (
                                    <ul className="ml-6 mt-1 space-y-0.5 text-[12px] text-slate-600">
                                      {lesson.tasks.map(task => (
                                        <li key={task.key}>
                                          {task.label}: {task.status === 'graded' ? <b className="text-emerald-700">{task.marks}/{task.maxMarks}</b> : task.status === 'submitted' ? 'waiting for grading' : 'not submitted'}
                                          {task.feedback && <span className="text-slate-500"> — “{task.feedback}”</span>}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              ))}
                            </ol>
                          )}
                        </article>
                      ))}
                      {!report.courses.length && <p className="text-sm text-slate-500">No enrolled courses yet.</p>}
                    </div>
                  </section>

                  <p className="mt-6 border-t border-slate-200 pt-3 text-[11px] leading-5 text-slate-500">
                    Marks are out of 20 (Algerian system): a course score out of 100 is divided by 5, so 100 = 20/20 and 50 = 10/20. The pass mark is 10/20.
                    Course score = module completion (50%) + quizzes (25%) + teacher-graded tasks and assignments (25%); a part with no results yet is left out and the rest are rescaled.
                    Scale: 16+ Très bien, 14+ Bien, 12+ Assez bien, 10+ Passable, below 10 Insuffisant.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
