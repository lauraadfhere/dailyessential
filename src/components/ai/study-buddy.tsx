'use client';

import { useState } from 'react';
import { currentStudent } from '../courses/enrolment';
import type { Course } from '../../lib/courses-data';

type Turn = { role: 'user' | 'assistant'; content: string };

export default function StudyBuddy({ course }: { course?: Course }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const ask = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError('');
    setTurns(current => [...current, { role: 'user', content: trimmed }]);
    setQuestion('');
    try {
      const student = currentStudent();
      const response = await fetch('/api/ai/study-buddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: student.email,
          courseSlug: course?.slug,
          question: trimmed,
          history: turns.slice(-4),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The study buddy could not answer.');
      setTurns(current => [...current, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The study buddy could not answer.');
    } finally {
      setBusy(false);
    }
  };

  const prompts = course
    ? [`Explain the first module of ${course.title} simply`, 'Give me a practice question on this topic', 'How should I revise this course each week?']
    : ['Explain fractions with an example', 'Help me plan my revision week', 'What is a variable in programming?'];

  return (
    <section id="study-buddy" className="mt-8 scroll-mt-6 border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(current => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#1738a8] text-[12px] font-bold text-white">AI</span>
          <span>
            <span className="block text-[14px] font-bold text-slate-900">Ask DAMMI, your study buddy</span>
            <span className="block text-[11px] text-slate-500">Hints and explanations for school subjects — never a shortcut through a live test.</span>
          </span>
        </span>
        <span aria-hidden="true" className={`text-slate-400 transition ${open ? 'rotate-45' : ''}`}>+</span>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4">
          {turns.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {prompts.map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => ask(prompt)}
                  className="border border-slate-200 px-2.5 py-1.5 text-left text-[11px] font-semibold text-slate-600 hover:border-[#1738a8] hover:text-[#1738a8]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {turns.length > 0 && (
            <ol className="max-h-80 space-y-3 overflow-y-auto pr-1">
              {turns.map((turn, index) => (
                <li key={index} className={turn.role === 'user' ? 'text-right' : ''}>
                  <p className={`inline-block max-w-[92%] whitespace-pre-wrap px-3 py-2 text-left text-[13px] leading-6 ${turn.role === 'user' ? 'bg-[#1738a8] text-white' : 'bg-[#f4f6fb] text-slate-700'}`}>
                    {turn.content}
                  </p>
                </li>
              ))}
              {busy && <li className="text-[12px] font-semibold text-slate-400">DAMMI is thinking…</li>}
            </ol>
          )}

          <form
            onSubmit={event => {
              event.preventDefault();
              ask(question);
            }}
            className="mt-3 flex items-end gap-2"
          >
            <label className="flex-1">
              <span className="sr-only">Your question</span>
              <textarea
                value={question}
                onChange={event => setQuestion(event.target.value)}
                rows={2}
                maxLength={600}
                placeholder={course ? `Ask about ${course.title}…` : 'Ask a school question…'}
                className="w-full resize-none border border-slate-300 px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-[#1738a8]"
              />
            </label>
            <button
              type="submit"
              disabled={busy || question.trim().length < 4}
              className="bg-[#1738a8] px-4 py-2.5 text-[12px] font-bold text-white hover:bg-[#102d88] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ask
            </button>
          </form>

          <p className="mt-2 text-[10px] leading-4 text-slate-500">
            AI answers can be wrong. Check with your tutor before relying on them. Your questions are logged for safety and quality.
          </p>
          {error && <p className="mt-2 text-[12px] font-semibold text-red-600">{error}</p>}
        </div>
      )}
    </section>
  );
}
