'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

type Message = {
  id: string;
  studentEmail: string;
  studentName: string;
  kind: 'question' | 'mark-dispute';
  subject: string;
  courseSlug: string;
  courseTitle: string;
  lessonIndex: number | null;
  status: 'open' | 'answered' | 'resolved';
  thread: { by: string; role: string; text: string; at: string }[];
  lastAt: string;
  unreadStaff: boolean;
  unreadStudent: boolean;
};

const statusStyle = {
  open: 'border-amber-300 bg-amber-50 text-amber-800',
  answered: 'border-blue-200 bg-blue-50 text-blue-800',
  resolved: 'border-emerald-300 bg-emerald-50 text-emerald-800',
} as const;

/** Conversation list + thread. Learners write to teachers (and report marks); staff reply, resolve and open the grade. */
export default function MessagesPanel({ mode }: { mode: 'student' | 'staff' }) {
  const staff = mode === 'staff';
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'answered' | 'resolved'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ subject: '', body: '' });
  const bottom = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    fetch('/api/messages', { cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Could not load messages.');
        setMessages(data.messages || []);
        setError('');
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load messages.'))
      .finally(() => setLoading(false));
  }, []);

  // Near real time: poll every 20 s while the tab is visible.
  useEffect(() => {
    load();
    const tick = () => { if (document.visibilityState === 'visible') load(); };
    const timer = window.setInterval(tick, 20_000);
    document.addEventListener('visibilitychange', tick);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
  }, [load]);

  const current = messages.find(item => item.id === selected) || null;
  const visible = messages.filter(item => filter === 'all' || item.status === filter);
  const unreadFor = (item: Message) => (staff ? item.unreadStaff : item.unreadStudent);

  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest' }); }, [current?.thread.length, selected]);

  const patch = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/messages', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not update the conversation.');
      load();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the conversation.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const open = (item: Message) => {
    setSelected(item.id);
    setComposing(false);
    if (unreadFor(item)) {
      setMessages(list => list.map(row => (row.id === item.id ? { ...row, [staff ? 'unreadStaff' : 'unreadStudent']: false } : row)));
      void patch({ id: item.id, action: 'read' });
    }
  };

  const reply = async () => {
    if (!current || draft.trim().length < 2) return;
    if (await patch({ id: current.id, action: 'reply', text: draft })) setDraft('');
  };

  const create = async () => {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'question', ...form }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not send your message.');
      setForm({ subject: '', body: '' });
      setComposing(false);
      setSelected(data.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your message.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {(['all', 'open', 'answered', 'resolved'] as const).map(name => (
            <button key={name} type="button" onClick={() => setFilter(name)} className={`px-3 py-1.5 capitalize ${filter === name ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-600 hover:border-slate-900'}`}>{name}</button>
          ))}
        </div>
        {!staff && <button type="button" onClick={() => { setComposing(true); setSelected(null); }} className="bg-[#1738a8] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#102d88]">New message to a teacher</button>}
      </div>

      {error && <p role="alert" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="max-h-[70vh] overflow-y-auto border border-slate-200 bg-white">
          {loading && <p className="p-4 text-sm text-slate-500">Loading…</p>}
          {!loading && visible.length === 0 && <p className="p-4 text-sm text-slate-500">{staff ? 'No conversations.' : 'No messages yet. Ask your teacher a question, or report a mark from a graded task.'}</p>}
          <ul className="divide-y divide-slate-100">
            {visible.map(item => (
              <li key={item.id}>
                <button type="button" onClick={() => open(item)} className={`block w-full px-4 py-3 text-left hover:bg-slate-50 ${selected === item.id ? 'bg-slate-100' : ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-semibold text-slate-900">{staff ? item.studentName : item.subject}</span>
                    {unreadFor(item) && <span className="h-2 w-2 shrink-0 rounded-full bg-[#1738a8]" aria-label="Unread" />}
                  </div>
                  {staff && <p className="mt-0.5 truncate text-[12px] text-slate-700">{item.subject}</p>}
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`border px-1.5 py-0.5 text-[10px] font-bold uppercase ${statusStyle[item.status]}`}>{item.status}</span>
                    {item.kind === 'mark-dispute' && <span className="border border-slate-900 bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Mark review</span>}
                  </div>
                  <p className="mt-1 truncate text-[11px] text-slate-400">{item.thread[item.thread.length - 1]?.text}</p>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="min-w-0 border border-slate-200 bg-white">
          {composing && !staff && (
            <div className="space-y-3 p-5">
              <h3 className="text-base font-bold text-slate-900">New message</h3>
              <label className="block text-xs font-bold text-slate-600">Subject
                <input value={form.subject} maxLength={140} onChange={event => setForm({ ...form, subject: event.target.value })} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1738a8]" />
              </label>
              <label className="block text-xs font-bold text-slate-600">Message
                <textarea value={form.body} rows={6} maxLength={3000} onChange={event => setForm({ ...form, body: event.target.value })} className="mt-1 w-full border border-slate-300 p-3 text-sm outline-none focus:border-[#1738a8]" />
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={create} disabled={busy || !form.subject.trim() || form.body.trim().length < 10} className="bg-[#1738a8] px-4 py-2 text-[12px] font-bold text-white disabled:opacity-50">{busy ? 'Sending…' : 'Send'}</button>
                <button type="button" onClick={() => setComposing(false)} className="border border-slate-300 px-4 py-2 text-[12px] font-bold text-slate-700">Cancel</button>
              </div>
              <p className="text-[11px] text-slate-400">To report a mark, open the graded task in its module and choose “Report this mark”.</p>
            </div>
          )}

          {!composing && !current && <p className="grid min-h-[260px] place-items-center p-6 text-sm text-slate-500">Select a conversation.</p>}

          {!composing && current && (
            <div className="flex min-h-[320px] flex-col">
              <div className="border-b border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900">{current.subject}</h3>
                  <span className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyle[current.status]}`}>{current.status}</span>
                </div>
                <p className="mt-1 text-[12px] text-slate-500">
                  {staff && <>{current.studentName} · {current.studentEmail} · </>}
                  {current.courseTitle && <>{current.courseTitle}{current.lessonIndex !== null && current.lessonIndex >= 0 ? `, module ${current.lessonIndex + 1}` : ''}</>}
                </p>
                {staff && current.kind === 'mark-dispute' && (
                  <p className="mt-2 text-[12px]"><Link href="/teacher/marks" className="font-bold text-[#1738a8] underline">Open the grading page</Link> to review or change this mark (see the “Graded” tab).</p>
                )}
              </div>

              <div className="max-h-[48vh] flex-1 space-y-3 overflow-y-auto p-4">
                {current.thread.map((entry, i) => {
                  const mine = staff ? entry.role === 'staff' : entry.role === 'student';
                  return (
                    <div key={i} className={`max-w-[88%] border p-3 text-[13px] leading-6 ${mine ? 'ml-auto border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-800'}`}>
                      <p className="whitespace-pre-line">{entry.text}</p>
                      <p className={`mt-1 text-[10px] ${mine ? 'text-white/60' : 'text-slate-400'}`}>{entry.by}{entry.role === 'staff' ? ' (teacher)' : ''} · {new Date(entry.at).toLocaleString()}</p>
                    </div>
                  );
                })}
                <div ref={bottom} />
              </div>

              <div className="border-t border-slate-200 p-4">
                {current.status === 'resolved' ? (
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    This conversation is resolved.
                    <button type="button" onClick={() => patch({ id: current.id, action: 'reopen' })} disabled={busy} className="border border-slate-300 px-3 py-1.5 text-[12px] font-bold text-slate-700 hover:border-slate-900">Reopen</button>
                  </div>
                ) : (
                  <>
                    <textarea value={draft} onChange={event => setDraft(event.target.value)} rows={3} maxLength={3000} placeholder={staff ? 'Write your reply to the learner…' : 'Write a reply…'} aria-label="Reply" className="w-full border border-slate-300 p-3 text-sm outline-none focus:border-[#1738a8]" />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="button" onClick={reply} disabled={busy || draft.trim().length < 2} className="bg-[#1738a8] px-4 py-2 text-[12px] font-bold text-white disabled:opacity-50">{busy ? 'Sending…' : 'Send reply'}</button>
                      <button type="button" onClick={() => patch({ id: current.id, action: 'resolve' })} disabled={busy} className="border border-slate-300 px-4 py-2 text-[12px] font-bold text-slate-700 hover:border-slate-900">Mark as resolved</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
