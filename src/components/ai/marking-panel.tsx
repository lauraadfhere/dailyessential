'use client';

import { useState } from 'react';
import { readPortalIdentity } from '../../lib/portal-session';

type Rubric = { criterion: string; max: number };
type Result = {
  scores: { criterion: string; score: number; reason: string }[];
  total: number;
  maxMarks: number;
  percent: number;
  feedback: string;
  confidence: number;
  needsTeacherReview: boolean;
  note: string;
};

const inputClass = 'mt-1 w-full rounded border border-[#d8dde4] px-3 py-2 text-[13px] text-[#2f3338] outline-none focus:border-[#2e9fff]';

export default function MarkingPanel() {
  const [question, setQuestion] = useState('Explain why the Industrial Revolution began in Britain and give two consequences.');
  const [answer, setAnswer] = useState('');
  const [rubric, setRubric] = useState<Rubric[]>([
    { criterion: 'Accurate causes', max: 4 },
    { criterion: 'Two consequences explained', max: 4 },
    { criterion: 'Clarity and structure', max: 2 },
  ]);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const mark = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const identity = readPortalIdentity();
      const response = await fetch('/api/ai/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identity.email || 'teacher@bifti.school',
          role: identity.role || 'teacher',
          question,
          answer,
          rubric,
          maxMarks: rubric.reduce((total, item) => total + item.max, 0),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not mark this answer.');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not mark this answer.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded border border-[#d8dde4] bg-white">
      <div className="border-b border-[#eef1f4] px-5 py-4">
        <h2 className="text-[15px] font-semibold text-[#2f3338]">Mark a long answer</h2>
        <p className="mt-1 text-[13px] text-[#6b7380]">Rubric-based AI marking with a confidence flag. A teacher confirms every score.</p>
      </div>
      <form onSubmit={mark} className="space-y-4 p-5">
        <label className="block text-[12px] font-semibold text-[#4a515a]">Question
          <textarea value={question} onChange={event => setQuestion(event.target.value)} rows={2} className={inputClass} />
        </label>
        <label className="block text-[12px] font-semibold text-[#4a515a]">Student answer
          <textarea required value={answer} onChange={event => setAnswer(event.target.value)} rows={5} placeholder="Paste the student's typed answer…" className={inputClass} />
        </label>
        <div>
          <p className="text-[12px] font-semibold text-[#4a515a]">Rubric</p>
          <div className="mt-2 space-y-2">
            {rubric.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={item.criterion}
                  onChange={event => setRubric(current => current.map((row, position) => (position === index ? { ...row, criterion: event.target.value } : row)))}
                  className="w-full rounded border border-[#d8dde4] px-2 py-1.5 text-[12px]"
                />
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={item.max}
                  onChange={event => setRubric(current => current.map((row, position) => (position === index ? { ...row, max: Number(event.target.value) } : row)))}
                  className="w-16 rounded border border-[#d8dde4] px-2 py-1.5 text-[12px]"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setRubric(current => [...current, { criterion: '', max: 2 }])}
            className="mt-2 text-[11px] font-semibold text-[#2e9fff] hover:underline"
          >
            + Add criterion
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className="rounded bg-[#2e9fff] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef] disabled:cursor-wait disabled:opacity-60">
            {busy ? 'Marking…' : 'Mark with AI'}
          </button>
          <span className="text-[11px] text-[#9aa3ad]">Low confidence answers are flagged for review.</span>
        </div>
        {error && <p className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-semibold text-rose-700">{error}</p>}
      </form>

      {result && (
        <div className="border-t border-[#eef1f4] px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-2xl font-bold text-[#2f3338]">{result.total} / {result.maxMarks}</p>
            <span className="rounded bg-[#f3f9ff] px-2 py-1 text-[11px] font-bold text-[#2e9fff]">{result.percent}%</span>
            <span className={`rounded px-2 py-1 text-[11px] font-bold ${result.needsTeacherReview ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              confidence {Math.round(result.confidence * 100)}%{result.needsTeacherReview ? ' · review' : ''}
            </span>
          </div>
          <ul className="mt-3 divide-y divide-[#eef1f4]">
            {result.scores.map((score, index) => (
              <li key={index} className="py-2.5 text-[13px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-[#2f3338]">{score.criterion}</span>
                  <span className="font-bold text-[#4a515a]">{score.score}</span>
                </div>
                <p className="mt-1 text-[12px] leading-5 text-[#6b7380]">{score.reason}</p>
              </li>
            ))}
          </ul>
          {result.feedback && <p className="mt-3 rounded bg-[#f7f9fb] px-3 py-2 text-[12px] leading-5 text-[#4a515a]">{result.feedback}</p>}
          <p className="mt-3 text-[11px] text-[#9aa3ad]">{result.note}</p>
        </div>
      )}
    </div>
  );
}
