'use client';

import { useEffect, useState } from 'react';
import { currentStudent } from './enrolment';
import type { Course } from '../../lib/courses-data';

export default function ReviewDialog({ course }: { course: Course }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const student = currentStudent();
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug: course.slug, email: student.email, name: student.name, rating, comment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save the review');
      setMessage(data.updated ? 'Your review was updated.' : 'Thanks — your review is published.');
      setComment('');
      setRating(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the review');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setMessage(''); setError(''); }}
        className="text-[11px] font-semibold text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-[#1738a8]"
      >
        Write a review
      </button>

      {open && (
        <div className="fixed inset-0 z-[95] grid place-items-center bg-slate-900/45 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby={`review-${course.slug}`}>
          <form onSubmit={submit} className="w-full max-w-md border-t-4 border-[#1738a8] bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#1738a8]">Course review</p>
                <h2 id={`review-${course.slug}`} className="mt-1 text-lg font-bold text-slate-900">{course.title}</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close review form" className="p-1 text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="mt-4 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" onClick={() => setRating(star)} aria-label={`${star} star${star > 1 ? 's' : ''}`} aria-pressed={rating === star} className="p-0.5">
                  <svg className={`h-7 w-7 ${star <= rating ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L1.6 7.7l5.8-.8z" />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-[12px] font-semibold text-slate-500">{rating ? `${rating}/5` : 'Select a rating'}</span>
            </div>

            <label className="mt-3 block text-[12px] font-semibold text-slate-700">
              What was your experience?
              <textarea
                value={comment}
                onChange={event => setComment(event.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Lessons, pacing, tutor support…"
                className="mt-1.5 w-full border border-slate-300 px-3 py-2 text-[13px] font-normal text-slate-800 outline-none focus:border-[#1738a8]"
              />
            </label>

            {message && <p className="mt-2 text-[12px] font-semibold text-emerald-700">{message}</p>}
            {error && <p className="mt-2 text-[12px] font-semibold text-red-600">{error}</p>}

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="border border-slate-300 px-3 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50">Close</button>
              <button type="submit" disabled={busy || !rating} className="bg-[#1738a8] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#102d88] disabled:cursor-not-allowed disabled:opacity-50">
                {busy ? 'Saving…' : 'Publish review'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
