'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { currentStudent } from './enrolment';
import type { Course } from '../../lib/courses-data';
import lessonContent from '../../lib/courses-lessons.json';

type LessonBlock = { number: number; title: string; body: string };
type ModuleContent = {
  title: string;
  whyItMatters: string;
  outcomes: string;
  lessons: LessonBlock[];
  activity: string;
  pitfalls: string;
  knowledgeCheck: string;
  reflection: string;
  activities?: { qcm: { question: string; options: string[]; answer: number }[]; fill: { sentence: string; answer: string }[] };
};

const content = lessonContent as Record<string, Record<string, ModuleContent>>;

function Section({ heading, text }: { heading: string; text: string }) {
  if (!text) return null;
  return (
    <div className="mt-6">
      <h2 className="text-base font-bold text-slate-900">{heading}</h2>
      <div className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">{text}</div>
    </div>
  );
}

type Progress = { enrolled: boolean; status: string; completedLessons: number[]; lastLesson: number };

function Activities({ activities }: { activities: NonNullable<ModuleContent["activities"]> }) {
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [typed, setTyped] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const qcmScore = activities.qcm.filter((q, i) => picked[i] === q.answer).length;
  const fillScore = activities.fill.filter((f, i) => (typed[i] || "").trim().toLowerCase() === f.answer).length;
  return (
    <div className="mt-6">
      <h2 className="text-base font-bold text-slate-900">Activities</h2>
      <p className="mt-1 text-xs text-slate-500">Answer the multiple-choice and fill-in-the-blank questions, then check your answers.</p>
      <div className="mt-4 space-y-5">
        {activities.qcm.map((q, i) => (
          <fieldset key={"q" + i} className="border border-slate-200 p-4">
            <legend className="px-1 text-sm font-bold text-slate-900">Question {i + 1} (multiple choice)</legend>
            <p className="text-sm text-slate-800">{q.question}</p>
            <div className="mt-2 space-y-1">
              {q.options.map((opt, o) => (
                <label key={o} className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="radio" name={"qcm" + i} checked={picked[i] === o} onChange={() => setPicked({ ...picked, [i]: o })} />
                  {opt}
                </label>
              ))}
            </div>
            {checked && <p className={"mt-2 text-xs font-bold " + (picked[i] === q.answer ? "text-emerald-700" : "text-red-700")}>{picked[i] === q.answer ? "Correct" : "Not quite. Review the lesson and try again."}</p>}
          </fieldset>
        ))}
        {activities.fill.map((f, i) => {
          const parts = f.sentence.split("___");
          return (
            <div key={"f" + i} className="border border-slate-200 p-4">
              <p className="text-sm font-bold text-slate-900">Question {activities.qcm.length + i + 1} (fill in the blank)</p>
              <p className="mt-2 text-sm text-slate-800">
                {parts[0]}
                <input type="text" aria-label={"Blank for question " + (i + 1)} value={typed[i] || ""} onChange={e => setTyped({ ...typed, [i]: e.target.value })} className="mx-1 inline-block w-36 border-b-2 border-[#1738a8] bg-transparent px-1 text-sm outline-none" />
                {parts[1]}
              </p>
              {checked && <p className={"mt-2 text-xs font-bold " + ((typed[i] || "").trim().toLowerCase() === f.answer ? "text-emerald-700" : "text-red-700")}>{(typed[i] || "").trim().toLowerCase() === f.answer ? "Correct" : "Expected answer: " + f.answer}</p>}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setChecked(true)} className="bg-[#1738a8] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#102d88]">Check answers</button>
        {checked && <span className="text-sm text-slate-700">Score: {qcmScore + fillScore} of {activities.qcm.length + activities.fill.length}</span>}
      </div>
    </div>
  );
}

export default function LessonView({ course, lessonIndex }: { course: Course; lessonIndex: number }) {
  const [progress, setProgress] = useState<Progress>({ enrolled: false, status: 'none', completedLessons: [], lastLesson: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const total = course.modules.length;
  const completed = progress.completedLessons;
  const percent = Math.round((completed.length / total) * 100);
  const done = completed.includes(lessonIndex);
  const lesson = content[course.title]?.[lessonIndex];

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
        }
      })
      .catch(() => setMessage('Could not load your progress.'))
      .finally(() => setLoading(false));
  }, [course.slug, lessonIndex]);

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

        {lesson && (
          <div className="mt-6">
            <Section heading="Why this matters" text={lesson.whyItMatters} />
            <Section heading="Learning outcomes" text={lesson.outcomes} />
            {lesson.lessons.map(block => (
              <div key={block.number} className="mt-6">
                <h2 className="text-base font-bold text-slate-900">Lesson {block.number}: {block.title}</h2>
                <div className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">{block.body}</div>
              </div>
            ))}
            <Section heading="Guided practical activity" text={lesson.activity} />
            <Section heading="Common difficulties" text={lesson.pitfalls} />
            <Section heading="Knowledge check" text={lesson.knowledgeCheck} />
            <Section heading="Reflection and completion evidence" text={lesson.reflection} />
            {lesson.activities && <Activities activities={lesson.activities} />}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm">
          {prev !== null ? <Link href={`/courses/${course.slug}/lessons/${prev}`} className="font-bold text-[#1738a8] hover:underline">← Previous</Link> : <span />}
          {next !== null ? <Link href={`/courses/${course.slug}/lessons/${next}`} className="font-bold text-[#1738a8] hover:underline">Next →</Link> : <span />}
        </div>
      </section>

      <aside className="border border-slate-200 bg-white p-4 shadow-sm">
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
