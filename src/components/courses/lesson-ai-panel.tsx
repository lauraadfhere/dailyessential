'use client';

import { useState } from 'react';

type Mode = 'summary' | 'keypoints' | 'quiz' | 'explain' | 'plan' | 'ask';

const actions: { mode: Exclude<Mode, 'ask'>; label: string; hint: string }[] = [
  { mode: 'summary', label: 'Summarise', hint: 'Short overview of this module' },
  { mode: 'keypoints', label: 'Key points', hint: 'What to remember' },
  { mode: 'quiz', label: 'Self-check quiz', hint: 'Test your understanding' },
  { mode: 'explain', label: 'Explain simply', hint: 'Help with the hardest idea' },
  { mode: 'plan', label: 'Study plan', hint: '20-minute plan' },
];

type Result = { title: string; text: string };

/** AI assistant that analyses the text of the module being read. */
export default function LessonAiPanel({ courseSlug, lessonIndex, moduleTitle }: { courseSlug: string; lessonIndex: number; moduleTitle: string }) {
  const [busy, setBusy] = useState<Mode | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');


  const run = async (mode: Mode, title: string) => {
    if (busy) return;
    setBusy(mode);
    setError('');
    try {
      const response = await fetch('/api/ai/course-analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug, lessonIndex, mode, question: mode === 'ask' ? question : undefined }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'The lesson assistant could not answer.');
      setResult({ title, text: String(data.answer || '') });
      if (mode === 'ask') setQuestion('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The lesson assistant could not answer.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section aria-label="AI lesson assistant" className="border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-[#f7f8fc] px-4 py-3">
        <p className="text-sm font-bold text-[#1738a8]">AI lesson assistant</p>
        <p className="mt-0.5 text-xs text-slate-500">Analyses the content of “{moduleTitle}”. Answers are based only on this module.</p>
      </div>

      <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map(action => (
          <button
            key={action.mode}
            type="button"
            disabled={busy !== null}
            onClick={() => run(action.mode, action.label)}
            className="border border-slate-200 px-3 py-2 text-left hover:border-[#1738a8] hover:bg-slate-50 disabled:opacity-60"
          >
            <span className="block text-[13px] font-bold text-slate-900">{busy === action.mode ? 'Working…' : action.label}</span>
            <span className="block text-[11px] text-slate-500">{action.hint}</span>
          </button>
        ))}
      </div>

      <form
        onSubmit={event => {
          event.preventDefault();
          void run('ask', 'Your question');
        }}
        className="flex gap-2 border-t border-slate-200 p-4"
      >
        <input
          value={question}
          onChange={event => setQuestion(event.target.value)}
          maxLength={500}
          aria-label="Ask a question about this module"
          placeholder="Ask a question about this module…"
          className="min-w-0 flex-1 border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1738a8]"
        />
        <button type="submit" disabled={busy !== null || question.trim().length < 4} className="bg-[#1738a8] px-4 py-2 text-[12px] font-bold text-white disabled:opacity-50">
          {busy === 'ask' ? 'Thinking…' : 'Ask'}
        </button>
      </form>

      <div aria-live="polite" className="px-4 pb-4">
        {error && <p role="alert" className="border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p>}
        {result && (
          <div className="mt-1 border-l-4 border-[#1738a8] bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{result.title}</p>
            <div className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-800">{result.text}</div>
            <p className="mt-3 text-[11px] text-slate-400">AI-generated from the lesson text. Check important points against the lesson itself.</p>
          </div>
        )}
      </div>
    </section>
  );
}
