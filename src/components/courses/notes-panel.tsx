'use client';

import { useCallback, useEffect, useState } from 'react';

type Note = {
  id: string; title: string; source: 'ai' | 'manual'; text: string; createdAt: string;
  ai: { mistakes: { question: string; whyWrong: string; tip: string }[]; notes: string[]; guidelines: string[] } | null;
};

/** Personal notes for a module: write your own, or let the AI study your mistakes and build notes and guidelines. */
export default function NotesPanel({ courseSlug, lessonIndex }: { courseSlug: string; lessonIndex: number }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<'ai' | 'save' | null>(null);
  const [text, setText] = useState('');
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const load = useCallback(() => {
    fetch(`/api/notes?courseSlug=${encodeURIComponent(courseSlug)}&lessonIndex=${lessonIndex}`, { cache: 'no-store' })
      .then(response => response.json())
      .then(data => setNotes(data.notes || []))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [courseSlug, lessonIndex]);

  useEffect(load, [load]);

  const generate = async () => {
    setBusy('ai');
    setMessage(null);
    try {
      const response = await fetch('/api/ai/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseSlug, lessonIndex }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not build your notes.');
      const { wrongAnswers, teacherFeedback } = data.basedOn || {};
      setMessage({ tone: 'ok', text: wrongAnswers || teacherFeedback ? `Built from ${wrongAnswers} wrong answer${wrongAnswers === 1 ? '' : 's'} and ${teacherFeedback} teacher comment${teacherFeedback === 1 ? '' : 's'}.` : 'No mistakes found, so these are revision notes. Take the quiz to get notes about your own mistakes.' });
      load();
    } catch (err) {
      setMessage({ tone: 'error', text: err instanceof Error ? err.message : 'Could not build your notes.' });
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    setBusy('save');
    setMessage(null);
    try {
      const response = await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseSlug, lessonIndex, text }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not save the note.');
      setText('');
      load();
    } catch (err) {
      setMessage({ tone: 'error', text: err instanceof Error ? err.message : 'Could not save the note.' });
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    setNotes(current => current.filter(note => note.id !== id));
    await fetch(`/api/notes?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => undefined);
  };

  return (
    <div className="space-y-5">
      <section className="border border-slate-200 bg-[#f8fafc] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">AI notes from my mistakes</h3>
            <p className="text-[12px] text-slate-500">The AI checks your quiz answers and your teacher&apos;s comments, explains what went wrong and writes notes and guidelines.</p>
          </div>
          <button type="button" onClick={generate} disabled={busy !== null} className="bg-slate-900 px-4 py-2 text-[12px] font-bold text-white hover:bg-black disabled:opacity-60">{busy === 'ai' ? 'Analysing…' : 'Generate notes'}</button>
        </div>
      </section>

      <section className="border border-slate-200 bg-white p-4">
        <label htmlFor={`note-${lessonIndex}`} className="text-[12px] font-bold text-slate-600">Write a note</label>
        <textarea id={`note-${lessonIndex}`} value={text} onChange={event => setText(event.target.value)} rows={3} maxLength={6000} placeholder="Something to remember about this module…" className="mt-1 w-full border border-slate-300 p-3 text-sm outline-none focus:border-[#1738a8]" />
        <button type="button" onClick={save} disabled={busy !== null || text.trim().length < 3} className="mt-2 bg-[#1738a8] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#102d88] disabled:opacity-50">{busy === 'save' ? 'Saving…' : 'Save note'}</button>
      </section>

      {message && <p role={message.tone === 'error' ? 'alert' : 'status'} className={`border px-3 py-2 text-[13px] font-semibold ${message.tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{message.text}</p>}
      {loading && <p className="text-sm text-slate-500">Loading notes…</p>}
      {!loading && notes.length === 0 && <p className="border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No notes for this module yet.</p>}

      {notes.map(note => (
        <article key={note.id} className="border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-[14px] font-bold text-slate-900">{note.title}</h4>
              <p className="text-[11px] text-slate-400">{note.source === 'ai' ? 'AI notes' : 'My note'}{note.createdAt ? ` · ${new Date(note.createdAt).toLocaleString()}` : ''}</p>
            </div>
            <button type="button" onClick={() => remove(note.id)} className="text-[12px] font-semibold text-red-600 hover:underline">Delete</button>
          </div>
          {note.text && <p className="mt-3 whitespace-pre-line text-[14px] leading-6 text-slate-700">{note.text}</p>}
          {note.ai && (
            <div className="mt-3 space-y-4 text-[13px] leading-6 text-slate-700">
              {note.ai.mistakes.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Your mistakes</p>
                  <ul className="mt-1 space-y-2">
                    {note.ai.mistakes.map((item, i) => (
                      <li key={i} className="border-l-4 border-slate-900 bg-slate-50 px-3 py-2"><b>{item.question}</b><br />Why: {item.whyWrong}<br /><span className="text-slate-500">Tip: {item.tip}</span></li>
                    ))}
                  </ul>
                </div>
              )}
              {note.ai.notes.length > 0 && (
                <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Revision notes</p><ul className="mt-1 list-disc space-y-1 pl-5">{note.ai.notes.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
              )}
              {note.ai.guidelines.length > 0 && (
                <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">How to improve</p><ol className="mt-1 list-decimal space-y-1 pl-5">{note.ai.guidelines.map((item, i) => <li key={i}>{item}</li>)}</ol></div>
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
