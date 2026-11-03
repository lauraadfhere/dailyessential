'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ConsoleShell from '../../../components/console-shell';
import { gradeFromPercent } from '../../../lib/grading';

type Submission = {
  id: string;
  studentEmail: string;
  studentName: string;
  courseSlug: string;
  courseTitle: string;
  lessonIndex: number;
  taskKey: string;
  text: string;
  status: 'submitted' | 'graded';
  marks: number | null;
  maxMarks: number | null;
  feedback: string;
  gradedBy: string;
  submittedAt: string;
};

type Draft = { marks: string; max: string; feedback: string; busy?: boolean; ai?: boolean; error?: string; notice?: string };

const taskName = (key: string) => (key === 'practical' ? 'Guided practical activity' : key === 'reflection' ? 'Reflection' : key);

export default function TeacherMarksPage() {
  const [view, setView] = useState<'queue' | 'graded'>('queue');
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const query = view === 'queue' ? 'queue=1' : 'status=graded';
    fetch(`/api/activities?${query}`, { cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Could not load submissions.');
        setRows(((data.submissions || []) as (Submission & { kind: string })[]).filter(row => row.kind === 'task'));
        setError('');
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load submissions.'))
      .finally(() => setLoading(false));
  }, [view]);

  useEffect(load, [load]);

  const draftFor = (row: Submission): Draft =>
    drafts[row.id] || { marks: row.marks === null ? '' : String(row.marks), max: String(row.maxMarks ?? 20), feedback: row.feedback };
  const patch = (id: string, row: Submission, change: Partial<Draft>) =>
    setDrafts(current => ({ ...current, [id]: { ...draftFor(row), ...current[id], ...change } }));

  const save = async (row: Submission) => {
    const draft = draftFor(row);
    patch(row.id, row, { busy: true, error: '', notice: '' });
    try {
      const response = await fetch('/api/activities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, marks: Number(draft.marks), maxMarks: Number(draft.max), feedback: draft.feedback }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not save the grade.');
      setRows(current => (view === 'queue' ? current.filter(item => item.id !== row.id) : current.map(item => (item.id === row.id ? { ...item, status: 'graded', marks: Number(draft.marks), maxMarks: Number(draft.max), feedback: draft.feedback } : item))));
      setOpen(null);
    } catch (err) {
      patch(row.id, row, { busy: false, error: err instanceof Error ? err.message : 'Could not save the grade.' });
    }
  };

  const suggest = async (row: Submission) => {
    const draft = draftFor(row);
    const max = Math.max(1, Number(draft.max) || 20);
    patch(row.id, row, { ai: true, error: '', notice: '' });
    try {
      const response = await fetch('/api/ai/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `${row.courseTitle}, module ${row.lessonIndex + 1}: ${taskName(row.taskKey)}. Mark how complete, accurate and thoughtful the learner's answer is.`,
          answer: row.text,
          rubric: [{ criterion: 'Completeness and accuracy', max: Math.ceil(max / 2) }, { criterion: 'Understanding and reflection', max: Math.floor(max / 2) || 1 }],
          maxMarks: max,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'The AI could not suggest a mark.');
      patch(row.id, row, {
        ai: false,
        marks: String(Math.min(max, Math.round(Number(data.total) || 0))),
        feedback: draft.feedback || String(data.feedback || ''),
        notice: data.needsTeacherReview ? 'AI is unsure — please review carefully.' : 'AI suggestion filled in. Check it, then save.',
      });
    } catch (err) {
      patch(row.id, row, { ai: false, error: err instanceof Error ? err.message : 'The AI could not suggest a mark.' });
    }
  };

  const pending = useMemo(() => rows.length, [rows]);

  return (
    <ConsoleShell role="teacher" showSidebar>
      <div className="border-b border-[#eef1f4] px-5 py-4">
        <h2 className="text-lg font-semibold text-[#2f3338]">Assign marks</h2>
        <p className="mt-1 text-sm text-[#6b7380]">Grade the tasks learners submit in their courses. Marks (out of 20 by default) and your feedback go straight to the learner&apos;s report.</p>
        <div className="mt-3 flex gap-2 text-xs font-bold">
          {(['queue', 'graded'] as const).map(name => (
            <button key={name} type="button" onClick={() => setView(name)} className={`px-3 py-1.5 ${view === name ? 'bg-[#1738a8] text-white' : 'border border-slate-300 text-slate-600 hover:border-[#1738a8]'}`}>
              {name === 'queue' ? 'To grade' : 'Graded'}
            </button>
          ))}
          <button type="button" onClick={load} className="border border-slate-300 px-3 py-1.5 text-slate-600 hover:border-[#1738a8]">Refresh</button>
        </div>
      </div>

      {error && <p role="alert" className="m-5 border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

      <div className="bg-white">
        {loading && <p className="px-5 py-6 text-sm text-slate-500">Loading submissions…</p>}
        {!loading && !error && rows.length === 0 && (
          <p className="px-5 py-8 text-sm text-slate-500">{view === 'queue' ? 'Nothing is waiting for grading.' : 'No graded work yet.'}</p>
        )}
        {!loading && pending > 0 && (
          <ul className="divide-y divide-slate-100">
            {rows.map(row => {
              const draft = draftFor(row);
              const percent = Number(draft.marks) >= 0 && draft.marks !== '' ? Math.round((Number(draft.marks) / (Number(draft.max) || 20)) * 100) : null;
              return (
                <li key={row.id} className="px-5 py-4">
                  <button type="button" onClick={() => setOpen(open === row.id ? null : row.id)} aria-expanded={open === row.id} className="flex w-full flex-wrap items-center justify-between gap-3 text-left">
                    <span>
                      <span className="block text-sm font-semibold text-slate-800">{row.studentName || row.studentEmail}</span>
                      <span className="block text-xs text-slate-500">{row.courseTitle} · module {row.lessonIndex + 1} · {taskName(row.taskKey)}</span>
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${row.status === 'graded' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {row.status === 'graded' ? `${row.marks}/${row.maxMarks}` : 'Needs grading'}
                    </span>
                  </button>

                  {open === row.id && (
                    <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_300px]">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Learner&apos;s answer</p>
                        <p className="mt-1 max-h-72 overflow-y-auto whitespace-pre-line border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">{row.text}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{row.studentEmail}{row.submittedAt ? ` · submitted ${new Date(row.submittedAt).toLocaleString()}` : ''}</p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-end gap-2">
                          <label className="text-xs font-bold text-slate-600">Marks
                            <input type="number" min={0} max={Number(draft.max) || 20} step="0.5" value={draft.marks} onChange={event => patch(row.id, row, { marks: event.target.value })} className="mt-1 block h-9 w-20 border border-slate-300 px-2 text-sm outline-none focus:border-[#1738a8]" />
                          </label>
                          <label className="text-xs font-bold text-slate-600">out of
                            <input type="number" min={1} max={1000} value={draft.max} onChange={event => patch(row.id, row, { max: event.target.value })} className="mt-1 block h-9 w-20 border border-slate-300 px-2 text-sm outline-none focus:border-[#1738a8]" />
                          </label>
                          {percent !== null && <span className="pb-1.5 text-sm font-bold text-[#1738a8]">{gradeFromPercent(percent).mark}/20 equivalent</span>}
                        </div>
                        <label className="block text-xs font-bold text-slate-600">Feedback to the learner
                          <textarea value={draft.feedback} onChange={event => patch(row.id, row, { feedback: event.target.value })} rows={4} maxLength={2000} className="mt-1 w-full border border-slate-300 p-2 text-sm outline-none focus:border-[#1738a8]" />
                        </label>
                        {draft.error && <p role="alert" className="text-xs font-semibold text-red-700">{draft.error}</p>}
                        {draft.notice && <p className="text-xs font-semibold text-amber-700">{draft.notice}</p>}
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => save(row)} disabled={draft.busy || draft.marks === ''} className="bg-[#1738a8] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{draft.busy ? 'Saving…' : row.status === 'graded' ? 'Update grade' : 'Save grade'}</button>
                          <button type="button" onClick={() => suggest(row)} disabled={draft.ai} className="border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:border-[#1738a8] disabled:opacity-50">{draft.ai ? 'Thinking…' : 'AI suggestion'}</button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </ConsoleShell>
  );
}
