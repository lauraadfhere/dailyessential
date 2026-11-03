'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge, EmptyNote, Panel } from '../platform/kit';
import { courses } from '../../lib/courses-data';
import { toTwenty } from '../../lib/grading';

type Assignment = {
  id: string; title: string; description: string; courseSlug: string; courseTitle: string; dueAt: string; maxMarks: number;
  status: string; createdBy: string; counts: { submitted: number; graded: number };
};
type HandIn = {
  id: string; assignmentId: string; studentName: string; studentEmail: string; fileUrl: string; fileName: string; note: string;
  status: 'submitted' | 'graded'; marks: number | null; maxMarks: number | null; feedback: string; submittedAt: string; late: boolean;
};

const input = 'mt-1 w-full rounded border border-[#d8dde4] bg-white px-3 py-2 text-[13px] text-[#2f3338] outline-none focus:border-[#2e9fff]';
const labelCls = 'block text-[10px] font-bold uppercase tracking-[.12em] text-[#9aa3ad]';

function GradeRow({ item, max, onSaved }: { item: HandIn; max: number; onSaved: () => void }) {
  const [marks, setMarks] = useState(item.marks === null ? '' : String(item.marks));
  const [feedback, setFeedback] = useState(item.feedback);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/assignments/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, marks: Number(marks), maxMarks: max, feedback }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not save the grade.');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the grade.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="space-y-3 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[13px] font-semibold text-[#2f3338]">{item.studentName}</p>
          <p className="text-[11px] text-[#9aa3ad]">{item.studentEmail} · handed in {new Date(item.submittedAt).toLocaleString()}{item.late ? ' · late' : ''}</p>
        </div>
        <Badge tone={item.status === 'graded' ? 'success' : 'warn'}>{item.status === 'graded' ? `${item.marks}/${item.maxMarks}` : 'Needs marking'}</Badge>
      </div>
      <p className="text-[13px]">
        <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1372b8] underline">{item.fileName}</a>
        {item.note && <span className="ml-2 text-[#6b7380]">Note: {item.note}</span>}
      </p>
      <div className="grid gap-3 sm:grid-cols-[120px_1fr_auto] sm:items-end">
        <label className={labelCls}>Mark (out of {max})
          <input type="number" min={0} max={max} step="0.25" value={marks} onChange={event => setMarks(event.target.value)} className={input} />
          {marks !== '' && Number(marks) >= 0 && <span className="mt-1 block normal-case tracking-normal text-[#6b7380]">= {toTwenty((Number(marks) / max) * 100)}/20</span>}
        </label>
        <label className={labelCls}>Notes for the student
          <textarea value={feedback} onChange={event => setFeedback(event.target.value)} rows={2} maxLength={3000} className={input} />
        </label>
        <button type="button" onClick={save} disabled={busy || marks === ''} className="rounded bg-[#2e9fff] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#1f8eef] disabled:opacity-50">{busy ? 'Saving…' : item.status === 'graded' ? 'Update' : 'Save mark'}</button>
      </div>
      {error && <p role="alert" className="text-[12px] font-semibold text-red-600">{error}</p>}
    </li>
  );
}

/** Create assignments, see who handed in a PDF, and give marks and notes. Used by teachers, examiners and admins. */
export default function StaffAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [handIns, setHandIns] = useState<Record<string, HandIn[]>>({});
  const [form, setForm] = useState({ title: '', description: '', courseSlug: '', dueAt: '', maxMarks: '20' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const load = useCallback(() => {
    fetch('/api/assignments', { cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Could not load assignments.');
        setAssignments(data.assignments || []);
        setError('');
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load assignments.'))
      .finally(() => setLoading(false));
  }, []);

  const loadHandIns = useCallback((id: string) => {
    fetch(`/api/assignments/submissions?assignmentId=${encodeURIComponent(id)}`, { cache: 'no-store' })
      .then(response => response.json())
      .then(data => setHandIns(current => ({ ...current, [id]: data.submissions || [] })))
      .catch(() => undefined);
  }, []);

  useEffect(load, [load]);

  const create = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, maxMarks: Number(form.maxMarks) || 20, dueAt: form.dueAt || undefined, courseSlug: form.courseSlug || undefined }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not create the assignment.');
      setForm({ title: '', description: '', courseSlug: '', dueAt: '', maxMarks: '20' });
      setNotice({ tone: 'ok', text: 'Assignment posted. Learners of the course were notified.' });
      load();
    } catch (err) {
      setNotice({ tone: 'error', text: err instanceof Error ? err.message : 'Could not create the assignment.' });
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (id: string, status: 'closed' | 'published') => {
    await fetch('/api/assignments', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    load();
  };

  const toggle = (id: string) => {
    if (open === id) return setOpen(null);
    setOpen(id);
    loadHandIns(id);
  };

  return (
    <div className="space-y-5 px-4 py-6 sm:px-7">
      <div className="border-b border-[#e6e9ee] pb-4">
        <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#9aa3ad]">Teaching</p>
        <h1 className="mt-1 text-xl font-bold text-[#2f3338] sm:text-2xl">Assignments</h1>
        <p className="mt-1 text-[13px] text-[#6b7380]">Post an assignment, collect PDFs, then give each learner a mark out of 20 and written notes. They are notified at every step.</p>
      </div>

      <Panel title="New assignment" description="Learners of the chosen course are notified. Leave the course empty for a school-wide assignment.">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={`${labelCls} sm:col-span-2`}>Title
            <input value={form.title} maxLength={160} onChange={event => setForm({ ...form, title: event.target.value })} className={input} />
          </label>
          <label className={`${labelCls} sm:col-span-2`}>Instructions
            <textarea value={form.description} rows={4} maxLength={4000} onChange={event => setForm({ ...form, description: event.target.value })} className={input} />
          </label>
          <label className={labelCls}>Course
            <select value={form.courseSlug} onChange={event => setForm({ ...form, courseSlug: event.target.value })} className={input}>
              <option value="">All learners</option>
              {courses.map(course => <option key={course.slug} value={course.slug}>{course.code} · {course.title}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelCls}>Due date
              <input type="datetime-local" value={form.dueAt} onChange={event => setForm({ ...form, dueAt: event.target.value })} className={input} />
            </label>
            <label className={labelCls}>Out of
              <input type="number" min={1} max={100} value={form.maxMarks} onChange={event => setForm({ ...form, maxMarks: event.target.value })} className={input} />
            </label>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={create} disabled={busy || form.title.trim().length < 3} className="rounded bg-[#2e9fff] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef] disabled:opacity-50">{busy ? 'Posting…' : 'Post assignment'}</button>
          {notice && <span role={notice.tone === 'error' ? 'alert' : 'status'} className={`text-[12px] font-semibold ${notice.tone === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>{notice.text}</span>}
        </div>
      </Panel>

      {error && <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-700">{error}</p>}
      {loading && <EmptyNote>Loading assignments…</EmptyNote>}
      {!loading && !error && assignments.length === 0 && <EmptyNote>No assignments yet. Post the first one above.</EmptyNote>}

      <div className="space-y-4">
        {assignments.map(item => (
          <Panel
            key={item.id}
            title={item.title}
            description={`${item.courseTitle || 'All learners'}${item.dueAt ? ` · due ${new Date(item.dueAt).toLocaleString()}` : ''} · out of ${item.maxMarks} · by ${item.createdBy}`}
            action={<Badge tone={item.status === 'published' ? 'success' : 'neutral'}>{item.status}</Badge>}
          >
            <div className="flex flex-wrap items-center gap-3 text-[12px]">
              <span className="text-[#6b7380]">{item.counts.submitted} to mark · {item.counts.graded} graded</span>
              <button type="button" onClick={() => toggle(item.id)} className="rounded border border-[#d8dde4] px-3 py-1.5 font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">{open === item.id ? 'Hide hand-ins' : 'View hand-ins'}</button>
              <button type="button" onClick={() => setStatus(item.id, item.status === 'published' ? 'closed' : 'published')} className="rounded border border-[#d8dde4] px-3 py-1.5 font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">{item.status === 'published' ? 'Close' : 'Reopen'}</button>
            </div>
            {open === item.id && (
              <div className="mt-3 border border-[#e6e9ee]">
                {(handIns[item.id] || []).length === 0 ? <p className="px-4 py-5 text-center text-[13px] text-[#9aa3ad]">No hand-ins yet.</p> : (
                  <ul className="divide-y divide-[#eef1f4]">
                    {(handIns[item.id] || []).map(handIn => (
                      <GradeRow key={`${handIn.id}-${handIn.status}-${handIn.marks}`} item={handIn} max={item.maxMarks} onSaved={() => { loadHandIns(item.id); load(); }} />
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}
