'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import ConsoleShell from '../../../components/console-shell';
import { Badge, Panel } from '../../../components/platform/kit';
import { courses, getCourse } from '../../../lib/courses-data';
import type { ModuleContent } from '../../../lib/lesson-text';

const empty = (title: string): ModuleContent => ({ title, whyItMatters: '', outcomes: '', lessons: [], activity: '', pitfalls: '', knowledgeCheck: '', reflection: '' });

const input = 'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-[#2e9fff]';
const label = 'block text-[10px] font-bold uppercase tracking-[.12em] text-slate-500';

function Area({ name, value, rows = 4, onChange }: { name: string; value: string; rows?: number; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className={label}>{name}</span>
      <textarea value={value} rows={rows} onChange={event => onChange(event.target.value)} className={input} />
    </label>
  );
}

export default function AdminCourseContentPage() {
  const [slug, setSlug] = useState(courses[0].slug);
  const [index, setIndex] = useState(0);
  const [lesson, setLesson] = useState<ModuleContent>(empty(''));
  const [edited, setEdited] = useState(false);
  const [editedList, setEditedList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const course = getCourse(slug)!;

  const refreshList = useCallback(() => {
    fetch('/api/admin/course-content', { cache: 'no-store' })
      .then(response => response.json())
      .then(data => setEditedList(data.edited || []))
      .catch(() => undefined);
  }, []);

  const load = useCallback((nextSlug: string, nextIndex: number) => {
    setLoading(true);
    setMessage(null);
    fetch(`/api/admin/course-content?slug=${encodeURIComponent(nextSlug)}&index=${nextIndex}`, { cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Could not load this module.');
        setLesson({ ...empty(''), ...data.lesson });
        setEdited(Boolean(data.edited));
      })
      .catch(err => setMessage({ tone: 'error', text: err instanceof Error ? err.message : 'Could not load this module.' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(slug, index); }, [load, slug, index]);
  useEffect(refreshList, [refreshList]);

  const save = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/course-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, index, lesson }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not save.');
      setEdited(true);
      setMessage({ tone: 'ok', text: 'Saved. Learners see this version immediately.' });
      refreshList();
    } catch (err) {
      setMessage({ tone: 'error', text: err instanceof Error ? err.message : 'Could not save.' });
    } finally {
      setBusy(false);
    }
  };

  const revert = async () => {
    if (!window.confirm('Remove your edits and go back to the original lesson text?')) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/course-content?slug=${encodeURIComponent(slug)}&index=${index}`, { method: 'DELETE' });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'Could not revert.');
      refreshList();
      load(slug, index);
      setMessage({ tone: 'ok', text: 'Reverted to the original lesson.' });
    } catch (err) {
      setMessage({ tone: 'error', text: err instanceof Error ? err.message : 'Could not revert.' });
    } finally {
      setBusy(false);
    }
  };

  const set = (change: Partial<ModuleContent>) => setLesson(current => ({ ...current, ...change }));
  const qcm = lesson.activities?.qcm ?? [];
  const fill = lesson.activities?.fill ?? [];
  const setActivities = (next: { qcm?: typeof qcm; fill?: typeof fill }) =>
    set({ activities: { qcm: next.qcm ?? qcm, fill: next.fill ?? fill } });

  return (
    <ConsoleShell role="admin" showSidebar>
      <div className="space-y-5 px-4 py-6 sm:px-7">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#9aa3ad]">Administration / Academics</p>
            <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Course content</h1>
            <p className="mt-1 text-[13px] text-slate-500">Edit the lesson text, activities and quiz of any module. Changes go live for learners as soon as you save.</p>
          </div>
          <Link href="/admin/courses" className="rounded border border-slate-300 px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50">Course enrolments</Link>
        </div>

        <Panel title="Choose a module" description={`${editedList.length} module${editedList.length === 1 ? '' : 's'} edited so far.`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={label}>Course</span>
              <select value={slug} onChange={event => { setSlug(event.target.value); setIndex(0); }} className={input}>
                {courses.map(item => <option key={item.slug} value={item.slug}>{item.code} · {item.title}</option>)}
              </select>
            </label>
            <label className="block">
              <span className={label}>Module</span>
              <select value={index} onChange={event => setIndex(Number(event.target.value))} className={input}>
                {course.modules.map((title, i) => (
                  <option key={i} value={i}>{editedList.includes(`${slug}:${i}`) ? '✎ ' : ''}{i + 1}. {title}</option>
                ))}
              </select>
            </label>
          </div>
        </Panel>

        {message && (
          <p role={message.tone === 'error' ? 'alert' : 'status'} className={`border px-3 py-2 text-[13px] font-semibold ${message.tone === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{message.text}</p>
        )}

        {loading ? (
          <p className="py-8 text-center text-[13px] text-slate-500">Loading module…</p>
        ) : (
          <>
            <Panel title={course.modules[index]} description="Reading content" action={edited ? <Badge tone="info">Edited</Badge> : <Badge>Original</Badge>}>
              <div className="space-y-4">
                <Area name="Why this matters" value={lesson.whyItMatters} onChange={value => set({ whyItMatters: value })} />
                <Area name="Learning outcomes" value={lesson.outcomes} onChange={value => set({ outcomes: value })} />

                <div>
                  <div className="flex items-center justify-between">
                    <span className={label}>Lesson sections</span>
                    <button type="button" onClick={() => set({ lessons: [...lesson.lessons, { number: lesson.lessons.length + 1, title: '', body: '' }] })} className="rounded border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">Add section</button>
                  </div>
                  <div className="mt-2 space-y-3">
                    {lesson.lessons.map((block, i) => (
                      <div key={i} className="border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <input value={block.title} onChange={event => set({ lessons: lesson.lessons.map((item, j) => (j === i ? { ...item, title: event.target.value } : item)) })} placeholder={`Section ${i + 1} title`} className="min-w-0 flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-[#2e9fff]" />
                          <button type="button" onClick={() => set({ lessons: lesson.lessons.filter((_, j) => j !== i) })} className="text-[11px] font-semibold text-red-600 hover:underline">Remove</button>
                        </div>
                        <textarea value={block.body} rows={6} onChange={event => set({ lessons: lesson.lessons.map((item, j) => (j === i ? { ...item, body: event.target.value } : item)) })} className={input} />
                      </div>
                    ))}
                    {!lesson.lessons.length && <p className="text-[12px] text-slate-500">No sections yet.</p>}
                  </div>
                </div>

                <Area name="Common difficulties" value={lesson.pitfalls} onChange={value => set({ pitfalls: value })} />
              </div>
            </Panel>

            <Panel title="Activities" description="Tasks the learner submits for a teacher to grade, and the quiz that is marked automatically.">
              <div className="space-y-4">
                <Area name="Guided practical activity (graded task)" value={lesson.activity} onChange={value => set({ activity: value })} />
                <Area name="Knowledge check" value={lesson.knowledgeCheck} onChange={value => set({ knowledgeCheck: value })} />
                <Area name="Reflection and completion evidence (graded task)" value={lesson.reflection} onChange={value => set({ reflection: value })} />

                <div>
                  <div className="flex items-center justify-between">
                    <span className={label}>Multiple-choice questions</span>
                    <button type="button" onClick={() => setActivities({ qcm: [...qcm, { question: '', options: ['', ''], answer: 0 }] })} className="rounded border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">Add question</button>
                  </div>
                  <div className="mt-2 space-y-3">
                    {qcm.map((q, i) => (
                      <div key={i} className="border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <input value={q.question} onChange={event => setActivities({ qcm: qcm.map((item, j) => (j === i ? { ...item, question: event.target.value } : item)) })} placeholder={`Question ${i + 1}`} className="min-w-0 flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-[#2e9fff]" />
                          <button type="button" onClick={() => setActivities({ qcm: qcm.filter((_, j) => j !== i) })} className="text-[11px] font-semibold text-red-600 hover:underline">Remove</button>
                        </div>
                        <div className="mt-2 space-y-1.5">
                          {q.options.map((option, o) => (
                            <div key={o} className="flex items-center gap-2">
                              <input type="radio" name={`correct-${i}`} checked={q.answer === o} onChange={() => setActivities({ qcm: qcm.map((item, j) => (j === i ? { ...item, answer: o } : item)) })} aria-label={`Option ${o + 1} is correct`} />
                              <input value={option} onChange={event => setActivities({ qcm: qcm.map((item, j) => (j === i ? { ...item, options: item.options.map((text, k) => (k === o ? event.target.value : text)) } : item)) })} placeholder={`Option ${o + 1}`} className="min-w-0 flex-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-[13px] outline-none focus:border-[#2e9fff]" />
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 flex gap-3 text-[11px] font-semibold">
                          {q.options.length < 6 && <button type="button" onClick={() => setActivities({ qcm: qcm.map((item, j) => (j === i ? { ...item, options: [...item.options, ''] } : item)) })} className="text-[#1372b8] hover:underline">Add option</button>}
                          <span className="text-slate-400">Select the radio next to the correct answer.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className={label}>Fill-in-the-blank questions</span>
                    <button type="button" onClick={() => setActivities({ fill: [...fill, { sentence: '', answer: '' }] })} className="rounded border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">Add question</button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {fill.map((item, i) => (
                      <div key={i} className="grid gap-2 border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_180px_auto]">
                        <input value={item.sentence} onChange={event => setActivities({ fill: fill.map((row, j) => (j === i ? { ...row, sentence: event.target.value } : row)) })} placeholder="Sentence with ___ where the answer goes" className="rounded border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-[#2e9fff]" />
                        <input value={item.answer ?? ''} onChange={event => setActivities({ fill: fill.map((row, j) => (j === i ? { ...row, answer: event.target.value } : row)) })} placeholder="Correct answer" className="rounded border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-[#2e9fff]" />
                        <button type="button" onClick={() => setActivities({ fill: fill.filter((_, j) => j !== i) })} className="text-[11px] font-semibold text-red-600 hover:underline">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>

            <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:-mx-7 sm:px-7">
              <button type="button" onClick={save} disabled={busy} className="rounded bg-[#2e9fff] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef] disabled:opacity-50">{busy ? 'Working…' : 'Save changes'}</button>
              <Link href={`/courses/${slug}/reader/${index}`} target="_blank" className="rounded border border-slate-300 px-3 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50">Preview as learner</Link>
              {edited && <button type="button" onClick={revert} disabled={busy} className="rounded border border-red-200 px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Revert to original</button>}
            </div>
          </>
        )}
      </div>
    </ConsoleShell>
  );
}
