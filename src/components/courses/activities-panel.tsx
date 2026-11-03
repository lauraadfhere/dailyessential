'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Course } from '../../lib/courses-data';
import type { ModuleContent } from '../../lib/lesson-text';

type Submission = {
  id: string;
  kind: 'quiz' | 'task';
  taskKey: string;
  text: string;
  score: number | null;
  maxScore: number | null;
  status: 'submitted' | 'graded';
  marks: number | null;
  maxMarks: number | null;
  feedback: string;
  gradedBy: string;
};

type QuizResult = {
  qcm: { correct: boolean; correctIndex: number }[];
  fill: { correct: boolean; expected: string }[];
  score: number;
  max: number;
  saved?: boolean;
  notice?: string;
};

function Text({ heading, text }: { heading: string; text: string }) {
  if (!text) return null;
  return (
    <div>
      <h3 className="text-[15px] font-bold text-slate-900">{heading}</h3>
      <div className="mt-2 whitespace-pre-line text-[15px] leading-7 text-slate-700">{text}</div>
    </div>
  );
}

/** Lets a learner ask the teacher to review a mark they believe is wrong. */
function ReportMark({ submissionId }: { submissionId: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const send = async () => {
    setBusy(true);
    setState(null);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'mark-dispute', submissionId, body: text }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not send your report.');
      setState({ tone: 'ok', text: 'Sent. Your teacher will review the mark; follow the reply in Messages.' });
      setOpen(false);
      setText('');
    } catch (err) {
      setState({ tone: 'error', text: err instanceof Error ? err.message : 'Could not send your report.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 border-t border-emerald-200 pt-3">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="text-[12px] font-bold text-emerald-900 underline">Report this mark</button>
      ) : (
        <div className="space-y-2">
          <label className="block text-[12px] font-bold" htmlFor={`dispute-${submissionId}`}>Why do you think this mark is wrong?</label>
          <textarea id={`dispute-${submissionId}`} value={text} onChange={event => setText(event.target.value)} rows={3} maxLength={3000} className="w-full border border-emerald-300 bg-white p-2 text-sm text-slate-900 outline-none" />
          <div className="flex gap-2">
            <button type="button" onClick={send} disabled={busy || text.trim().length < 10} className="bg-emerald-800 px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-50">{busy ? 'Sending…' : 'Send to teacher'}</button>
            <button type="button" onClick={() => setOpen(false)} className="border border-emerald-400 px-3 py-1.5 text-[12px] font-bold">Cancel</button>
          </div>
        </div>
      )}
      {state && <p role={state.tone === 'error' ? 'alert' : 'status'} className={`mt-2 text-[12px] font-semibold ${state.tone === 'error' ? 'text-red-700' : 'text-emerald-900'}`}>{state.text}</p>}
    </div>
  );
}

function TaskCard({
  course,
  lessonIndex,
  taskKey,
  label,
  prompt,
  existing,
  onSaved,
}: {
  course: Course;
  lessonIndex: number;
  taskKey: 'practical' | 'reflection';
  label: string;
  prompt: string;
  existing?: Submission;
  onSaved: () => void;
}) {
  const [text, setText] = useState(existing?.text || '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async () => {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug: course.slug, lessonIndex, kind: 'task', taskKey, text }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not submit your work.');
      setMessage('Submitted. Your teacher will grade it.');
      onSaved();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not submit your work.');
    } finally {
      setBusy(false);
    }
  };

  const graded = existing?.status === 'graded';
  return (
    <section className="border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[15px] font-bold text-slate-900">{label}</h3>
        <span
          className={`border px-2 py-0.5 text-[11px] font-bold ${graded ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : existing ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-300 bg-slate-50 text-slate-600'}`}
        >
          {graded ? `Graded ${existing?.marks}/${existing?.maxMarks}` : existing ? 'Waiting for grading' : 'To do'}
        </span>
      </div>
      <div className="mt-2 whitespace-pre-line text-[15px] leading-7 text-slate-700">{prompt}</div>

      <label className="mt-4 block text-[12px] font-bold text-slate-600" htmlFor={`${taskKey}-${lessonIndex}`}>Your answer</label>
      <textarea
        id={`${taskKey}-${lessonIndex}`}
        value={text}
        onChange={event => setText(event.target.value)}
        rows={5}
        maxLength={6000}
        placeholder="Write your work here…"
        className="mt-1 w-full border border-slate-300 p-3 text-sm outline-none focus:border-[#1738a8]"
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button type="button" onClick={submit} disabled={busy || text.trim().length < 10} className="bg-[#1738a8] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#102d88] disabled:opacity-50">
          {busy ? 'Submitting…' : existing ? 'Resubmit' : 'Submit for grading'}
        </button>
        {message && <span role="status" className="text-xs font-semibold text-slate-600">{message}</span>}
      </div>

      {graded && (
        <div className="mt-4 border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-bold">Teacher feedback{existing?.gradedBy ? ` · ${existing.gradedBy}` : ''}</p>
          <p className="mt-1 whitespace-pre-line">{existing?.feedback || 'No written feedback.'}</p>
          <ReportMark submissionId={existing!.id} />
        </div>
      )}
    </section>
  );
}

function Quiz({ course, lessonIndex, activities, existing, onSaved }: {
  course: Course;
  lessonIndex: number;
  activities: NonNullable<ModuleContent['activities']>;
  existing?: Submission;
  onSaved: () => void;
}) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [typed, setTyped] = useState<Record<number, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseSlug: course.slug,
          lessonIndex,
          kind: 'quiz',
          qcm: activities.qcm.map((_, index) => (picked[index] ?? -1)),
          fill: activities.fill.map((_, index) => typed[index] ?? ''),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not check your answers.');
      setResult(data as QuizResult);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not check your answers.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="border border-slate-200 bg-[#f8fafc] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[15px] font-bold text-slate-900">Quiz</h3>
        {existing && <span className="border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700">Best score {existing.score}/{existing.maxScore}</span>}
      </div>
      <p className="mt-1 text-xs text-slate-500">Answer every question, then check. Your best score is saved to your progress.</p>

      <div className="mt-4 space-y-4">
        {activities.qcm.map((q, i) => (
          <fieldset key={`q${i}`} className="border border-slate-200 bg-white p-4">
            <legend className="px-1 text-sm font-bold text-slate-900">Question {i + 1} (multiple choice)</legend>
            <p className="text-sm text-slate-800">{q.question}</p>
            <div className="mt-2 space-y-1">
              {q.options.map((option, o) => (
                <label key={o} className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="radio" name={`qcm-${lessonIndex}-${i}`} checked={picked[i] === o} onChange={() => setPicked({ ...picked, [i]: o })} />
                  {option}
                </label>
              ))}
            </div>
            {result && (
              <p className={`mt-2 text-xs font-bold ${result.qcm[i]?.correct ? 'text-emerald-700' : 'text-red-700'}`}>
                {result.qcm[i]?.correct ? 'Correct' : `Not quite. Correct answer: ${q.options[result.qcm[i]?.correctIndex] ?? '—'}`}
              </p>
            )}
          </fieldset>
        ))}
        {activities.fill.map((f, i) => {
          const parts = f.sentence.split('___');
          return (
            <div key={`f${i}`} className="border border-slate-200 bg-white p-4">
              <p className="text-sm font-bold text-slate-900">Question {activities.qcm.length + i + 1} (fill in the blank)</p>
              <p className="mt-2 text-sm text-slate-800">
                {parts[0]}
                <input type="text" aria-label={`Blank for question ${activities.qcm.length + i + 1}`} value={typed[i] || ''} onChange={event => setTyped({ ...typed, [i]: event.target.value })} className="mx-1 inline-block w-36 border-b-2 border-[#1738a8] bg-transparent px-1 text-sm outline-none" />
                {parts[1]}
              </p>
              {result && (
                <p className={`mt-2 text-xs font-bold ${result.fill[i]?.correct ? 'text-emerald-700' : 'text-red-700'}`}>
                  {result.fill[i]?.correct ? 'Correct' : `Expected answer: ${result.fill[i]?.expected}`}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={submit} disabled={busy} className="bg-[#1738a8] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#102d88] disabled:opacity-50">
          {busy ? 'Checking…' : result ? 'Check again' : 'Check answers'}
        </button>
        {result && <span className="text-sm font-semibold text-slate-800">Score: {result.score} of {result.max}</span>}
        {result?.notice && <span className="text-xs font-semibold text-amber-700">{result.notice}</span>}
        {error && <span role="alert" className="text-xs font-semibold text-red-700">{error}</span>}
      </div>
    </section>
  );
}

/** The "Activities" part of a module: practical task, knowledge check, quiz and reflection, kept apart from the lesson text. */
export default function ActivitiesPanel({ course, lessonIndex, lesson }: { course: Course; lessonIndex: number; lesson: ModuleContent }) {
  const [rows, setRows] = useState<Submission[]>([]);
  const [signedOut, setSignedOut] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/activities?courseSlug=${encodeURIComponent(course.slug)}&lessonIndex=${lessonIndex}`, { cache: 'no-store' })
      .then(async response => {
        if (response.status === 401) { setSignedOut(true); return; }
        const data = await response.json().catch(() => ({}));
        setRows((data.submissions || []) as Submission[]);
      })
      .catch(() => undefined);
  }, [course.slug, lessonIndex]);

  useEffect(load, [load]);

  const task = (key: string) => rows.find(row => row.kind === 'task' && row.taskKey === key);
  const quiz = rows.find(row => row.kind === 'quiz');
  const hasQuiz = Boolean(lesson.activities && (lesson.activities.qcm.length || lesson.activities.fill.length));

  if (!lesson.activity && !lesson.reflection && !lesson.knowledgeCheck && !hasQuiz) {
    return <p className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">This module has no activities yet.</p>;
  }

  return (
    <div className="space-y-6">
      {signedOut && <p role="alert" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">Sign in again to save your work.</p>}

      {lesson.activity && (
        <TaskCard key={`p${lessonIndex}${task('practical')?.status}`} course={course} lessonIndex={lessonIndex} taskKey="practical" label="Guided practical activity" prompt={lesson.activity} existing={task('practical')} onSaved={load} />
      )}

      {(lesson.knowledgeCheck || hasQuiz) && (
        <div className="space-y-4">
          <Text heading="Knowledge check" text={lesson.knowledgeCheck} />
          {hasQuiz && lesson.activities && <Quiz key={`quiz${lessonIndex}`} course={course} lessonIndex={lessonIndex} activities={lesson.activities} existing={quiz} onSaved={load} />}
        </div>
      )}

      {lesson.reflection && (
        <TaskCard key={`r${lessonIndex}${task('reflection')?.status}`} course={course} lessonIndex={lessonIndex} taskKey="reflection" label="Reflection and completion evidence" prompt={lesson.reflection} existing={task('reflection')} onSaved={load} />
      )}
    </div>
  );
}
