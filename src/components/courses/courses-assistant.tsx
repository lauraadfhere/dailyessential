'use client';

import { useState } from 'react';
import { currentStudent } from './enrolment';

type Turn = { role: 'user' | 'assistant'; content: string };

const starters = [
  'Which course should I start with if I am new to business?',
  'I want to learn to code. Where do I begin?',
  'Help me find the module that explains a key idea I am stuck on.',
];

/** Small floating icon on course pages that opens a course-finder chat for the student. */
export default function CoursesAssistant() {
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
    const history = turns.slice(-4);
    setTurns(current => [...current, { role: 'user', content: trimmed }]);
    setQuestion('');
    try {
      const student = currentStudent();
      const response = await fetch('/api/ai/study-buddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: student.email, scope: 'courses', question: trimmed, history }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The course assistant could not answer.');
      setTurns(current => [...current, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The course assistant could not answer.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {open && (
        <div role="dialog" aria-label="Course assistant" className="mb-3 flex max-h-[70vh] w-[min(360px,calc(100vw-2.5rem))] flex-col border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between bg-[#1738a8] px-4 py-3 text-white">
            <span className="text-sm font-bold">Course assistant</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close course assistant" className="px-2 text-lg leading-none hover:opacity-80">×</button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {turns.length === 0 && (
              <div className="space-y-2">
                <p className="text-slate-600">Tell me your goal and I will suggest courses, or help you find the lesson that answers a question.</p>
                {starters.map(text => (
                  <button key={text} type="button" onClick={() => ask(text)} className="block w-full border border-slate-200 px-3 py-2 text-left text-[12px] text-[#1738a8] hover:bg-slate-50">
                    {text}
                  </button>
                ))}
              </div>
            )}
            {turns.map((turn, i) => (
              <p key={i} className={turn.role === 'user' ? 'ml-6 bg-[#e9eef5] px-3 py-2 text-slate-800' : 'mr-6 whitespace-pre-line bg-slate-50 px-3 py-2 text-slate-800'}>
                {turn.content}
              </p>
            ))}
            {busy && <p className="text-xs text-slate-500">Thinking…</p>}
            {error && <p className="text-xs font-bold text-red-700">{error}</p>}
          </div>
          <form
            onSubmit={e => {
              e.preventDefault();
              ask(question);
            }}
            className="flex gap-2 border-t border-slate-200 p-3"
          >
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              maxLength={600}
              aria-label="Ask about courses"
              placeholder="Ask about a course…"
              className="min-w-0 flex-1 border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1738a8]"
            />
            <button type="submit" disabled={busy || question.trim().length < 4} className="bg-[#1738a8] px-3 py-2 text-[12px] font-bold text-white disabled:opacity-50">
              Send
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(current => !current)}
        aria-expanded={open}
        aria-label="Open course assistant"
        className="grid h-12 w-12 place-items-center rounded-full bg-[#1738a8] text-white shadow-lg hover:bg-[#102d88]"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
}
