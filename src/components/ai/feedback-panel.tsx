'use client';

import { useState } from 'react';
import { readPortalIdentity } from '../../lib/portal-session';

type Feedback = {
  wellDone: string;
  lostMarks: string;
  explanation: string;
  practice: string[];
  encouragement: string;
  note: string;
};

type CourseResult = { name: string; average: number };

export default function FeedbackPanel({ results }: { results: CourseResult[] }) {
  const [course, setCourse] = useState(results[0]?.name || '');
  const [score, setScore] = useState(results[0]?.average ?? 75);
  const [answers, setAnswers] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const request = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setFeedback(null);
    try {
      const identity = readPortalIdentity();
      const response = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identity.email || 'student@bifti.school',
          course,
          score,
          classLevel: identity.classGroup || 'JSS 2',
          topic: course,
          answers,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not build your feedback.');
      setFeedback(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not build your feedback.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-[15px] font-bold text-[#15133d]">Your AI study feedback</h2>
          <p className="mt-1 text-[12px] text-slate-500">Pick a course and get what went well, what to fix and three practice questions.</p>
        </div>
        <span className="rounded-full bg-black px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">DAMMI AI</span>
      </div>

      <form onSubmit={request} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_140px_auto] sm:items-end">
        <label className="text-[12px] font-semibold text-slate-600">Course
          <select
            value={course}
            onChange={event => {
              const next = results.find(row => row.name === event.target.value);
              setCourse(event.target.value);
              if (next) setScore(next.average);
            }}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-[13px] font-normal text-slate-800 outline-none focus:border-[#1738a8]"
          >
            {results.map(row => <option key={row.name}>{row.name}</option>)}
          </select>
        </label>
        <label className="text-[12px] font-semibold text-slate-600">Score (%)
          <input
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={event => setScore(Number(event.target.value))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-[13px] font-normal text-slate-800 outline-none focus:border-[#1738a8]"
          />
        </label>
        <button type="submit" disabled={busy} className="bg-[#1738a8] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#102d88] disabled:cursor-wait disabled:opacity-60">
          {busy ? 'Thinking…' : 'Get feedback'}
        </button>
        <label className="text-[12px] font-semibold text-slate-600 sm:col-span-3">Optional: paste the answers you are unsure about
          <textarea
            value={answers}
            onChange={event => setAnswers(event.target.value)}
            rows={2}
            maxLength={3000}
            placeholder="Question 3 — I wrote…"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-[13px] font-normal text-slate-800 outline-none focus:border-[#1738a8]"
          />
        </label>
      </form>

      {error && <p className="mx-5 mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700">{error}</p>}

      {feedback && (
        <div className="border-t border-slate-100 px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded bg-emerald-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">What you did well</p>
              <p className="mt-1 text-[13px] leading-6 text-slate-700">{feedback.wellDone}</p>
            </div>
            <div className="rounded bg-amber-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Where marks went</p>
              <p className="mt-1 text-[13px] leading-6 text-slate-700">{feedback.lostMarks}</p>
            </div>
          </div>
          <div className="mt-3 rounded border border-slate-200 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Simple explanation</p>
            <p className="mt-1 whitespace-pre-wrap text-[13px] leading-6 text-slate-700">{feedback.explanation}</p>
          </div>
          <div className="mt-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Try these now</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5 text-[13px] leading-6 text-slate-700">
              {feedback.practice.map((item, index) => <li key={index}>{item}</li>)}
            </ol>
          </div>
          <p className="mt-3 text-[12px] font-semibold text-[#1738a8]">{feedback.encouragement}</p>
          <p className="mt-2 text-[10px] leading-4 text-slate-400">{feedback.note}</p>
        </div>
      )}
    </section>
  );
}
