'use client';

import { useCallback, useEffect, useState } from 'react';
import PortalShell from '../../../components/portal-shell';
import FilterTabs from '../../../components/platform/filter-tabs';
import { Badge, Callout, EmptyNote, PageFrame, Panel, StatGrid } from '../../../components/platform/kit';

type HandIn = {
  id: string; fileUrl: string; fileName: string; note: string; status: 'submitted' | 'graded';
  marks: number | null; maxMarks: number | null; feedback: string; gradedBy: string; submittedAt: string; late: boolean;
};
type Assignment = {
  id: string; title: string; description: string; courseTitle: string; dueAt: string; maxMarks: number; status: string; mine: HandIn | null;
};

type State = 'todo' | 'late' | 'submitted' | 'graded' | 'closed';

function stateOf(item: Assignment): State {
  if (item.mine) return item.mine.status;
  if (item.status !== 'published') return 'closed';
  return item.dueAt && new Date(item.dueAt).getTime() < Date.now() ? 'late' : 'todo';
}

function HandInForm({ assignment, onDone }: { assignment: Assignment; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const submit = async () => {
    if (!file) return;
    if (file.type !== 'application/pdf') return setMessage({ tone: 'error', text: 'Please choose a PDF file.' });
    if (file.size > 8 * 1024 * 1024) return setMessage({ tone: 'error', text: 'The PDF must be 8 MB or smaller.' });
    setBusy(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'assignments');
      form.append('resourceType', 'raw');
      const upload = await fetch('/api/media/upload', { method: 'POST', body: form });
      const uploaded = await upload.json().catch(() => ({}));
      if (!upload.ok) throw new Error(uploaded.error || 'Upload failed.');

      const response = await fetch('/api/assignments/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: assignment.id, fileUrl: uploaded.url, fileName: file.name, note }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not hand in your assignment.');
      setMessage({ tone: 'ok', text: data.late ? 'Handed in (marked as late).' : 'Handed in. Your teacher will mark it.' });
      setFile(null);
      setNote('');
      onDone();
    } catch (err) {
      setMessage({ tone: 'error', text: err instanceof Error ? err.message : 'Could not hand in your assignment.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
      <label className="block text-[12px] font-bold text-slate-600">PDF file
        <input type="file" accept="application/pdf" onChange={event => setFile(event.target.files?.[0] || null)} className="mt-1 block w-full text-[13px] file:mr-3 file:border-0 file:bg-[#1738a8] file:px-3 file:py-2 file:text-[12px] file:font-bold file:text-white" />
      </label>
      <label className="block text-[12px] font-bold text-slate-600">Note to your teacher (optional)
        <textarea value={note} onChange={event => setNote(event.target.value)} rows={2} maxLength={2000} className="mt-1 w-full border border-slate-300 p-2 text-[13px] outline-none focus:border-[#1738a8]" />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={submit} disabled={busy || !file} className="rounded bg-[#1738a8] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#102d88] disabled:opacity-50">{busy ? 'Uploading…' : assignment.mine ? 'Hand in again' : 'Hand in'}</button>
        {message && <span role={message.tone === 'error' ? 'alert' : 'status'} className={`text-[12px] font-semibold ${message.tone === 'error' ? 'text-red-700' : 'text-emerald-700'}`}>{message.text}</span>}
      </div>
    </div>
  );
}

export default function StudentAssignmentsPage() {
  const [tab, setTab] = useState('all');
  const [rows, setRows] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch('/api/assignments', { cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Could not load assignments.');
        setRows(data.assignments || []);
        setError('');
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load assignments.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const tick = () => { if (document.visibilityState === 'visible') load(); };
    const timer = window.setInterval(tick, 60_000);
    document.addEventListener('visibilitychange', tick);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
  }, [load]);

  const withState = rows.map(item => ({ item, state: stateOf(item) }));
  const visible = withState.filter(({ state }) => tab === 'all' || (tab === 'pending' ? state === 'todo' || state === 'late' : state === tab));
  const count = (...states: State[]) => withState.filter(({ state }) => states.includes(state)).length;

  return (
    <PortalShell role="student">
      <PageFrame
        variant="portal"
        eyebrow="Student space"
        title="Assignments"
        description="Hand in your work as a PDF. Your teacher marks it out of 20 and leaves notes, and you get a notification."
      >
        <StatGrid
          items={[
            { label: 'To hand in', value: String(count('todo', 'late')), detail: count('late') ? `${count('late')} past the due date` : 'Nothing overdue', tone: count('late') ? 'warn' : undefined },
            { label: 'Handed in', value: String(count('submitted')), detail: 'Waiting for marking' },
            { label: 'Graded', value: String(count('graded')), detail: 'Marks and notes available' },
            { label: 'Total', value: String(rows.length), detail: 'Published assignments' },
          ]}
        />

        <FilterTabs
          tabs={[
            { id: 'all', label: 'All', count: rows.length },
            { id: 'pending', label: 'To hand in', count: count('todo', 'late') },
            { id: 'submitted', label: 'Handed in', count: count('submitted') },
            { id: 'graded', label: 'Graded', count: count('graded') },
          ]}
          value={tab}
          onChange={setTab}
        />

        {error && <p role="alert" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
        {loading && <EmptyNote>Loading assignments…</EmptyNote>}
        {!loading && !error && visible.length === 0 && <EmptyNote>{rows.length ? 'Nothing in this view.' : 'No assignments have been posted yet.'}</EmptyNote>}

        <div className="space-y-4">
          {visible.map(({ item, state }) => (
            <Panel
              key={item.id}
              title={item.title}
              description={`${item.courseTitle || 'General'}${item.dueAt ? ` · due ${new Date(item.dueAt).toLocaleString()}` : ''} · out of ${item.maxMarks}`}
              action={<Badge tone={state === 'graded' ? 'success' : state === 'submitted' ? 'info' : state === 'late' ? 'danger' : 'neutral'}>{state === 'todo' ? 'To do' : state}</Badge>}
            >
              {item.description && <p className="whitespace-pre-line text-[13px] leading-6 text-slate-600">{item.description}</p>}

              {item.mine && (
                <div className="mt-3 border border-slate-200 bg-slate-50 p-3 text-[13px]">
                  <p>
                    <a href={item.mine.fileUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1738a8] underline">{item.mine.fileName}</a>
                    <span className="ml-2 text-slate-400">handed in {new Date(item.mine.submittedAt).toLocaleString()}{item.mine.late ? ' · late' : ''}</span>
                  </p>
                  {item.mine.note && <p className="mt-1 text-slate-600">Your note: {item.mine.note}</p>}
                </div>
              )}

              {item.mine?.status === 'graded' && (
                <div className="mt-3">
                  <Callout tone="success" title={`Mark: ${item.mine.marks}/${item.mine.maxMarks}`}>
                    <p className="whitespace-pre-line">{item.mine.gradedBy ? `${item.mine.gradedBy}: ` : ''}{item.mine.feedback || 'No written notes.'}</p>
                  </Callout>
                </div>
              )}

              {state !== 'closed' && (open === item.id ? (
                <HandInForm assignment={item} onDone={() => { setOpen(null); load(); }} />
              ) : (
                <button type="button" onClick={() => setOpen(item.id)} className="mt-4 rounded bg-[#1738a8] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#102d88]">
                  {item.mine ? (item.mine.status === 'graded' ? 'Hand in again' : 'Replace my file') : 'Hand in a PDF'}
                </button>
              ))}
            </Panel>
          ))}
        </div>
      </PageFrame>
    </PortalShell>
  );
}
