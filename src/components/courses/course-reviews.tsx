'use client';

import { useEffect, useState } from 'react';
import { currentStudent } from './enrolment';
import type { Course } from '../../lib/courses-data';

type Review = {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type Summary = { average: number; count: number; distribution: number[] };

const emptySummary: Summary = { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] };

function Stars({ value, className = 'h-4 w-4' }: { value: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(star => (
        <svg
          key={star}
          aria-hidden="true"
          className={`${className} ${star <= Math.round(value) ? 'text-amber-400' : 'text-slate-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L1.6 7.7l5.8-.8z" />
        </svg>
      ))}
    </span>
  );
}

export default function CourseReviews({ course }: { course: Course }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    fetch(`/api/reviews?course=${encodeURIComponent(course.slug)}`)
      .then(response => response.json())
      .then(data => {
        setReviews(data.reviews || []);
        setSummary(data.summary || emptySummary);
      })
      .catch(() => setError('Reviews could not be loaded right now.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.slug]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
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
      setRating(0);
      setComment('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the review');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="reviews" className="mt-8 scroll-mt-6 border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Learner reviews</h2>
          <p className="mt-1 text-[13px] text-slate-500">Reviews come from students enrolled on this course.</p>
        </div>
        <div className="flex items-center gap-2">
          <Stars value={summary.average} className="h-5 w-5" />
          <span className="text-sm font-bold text-slate-800">{summary.average || '—'}</span>
          <span className="text-[12px] text-slate-500">({summary.count} {summary.count === 1 ? 'review' : 'reviews'})</span>
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[240px_1fr]">
        <div>
          <p className="text-4xl font-bold text-slate-900">{summary.average || '0.0'}</p>
          <div className="mt-1"><Stars value={summary.average} /></div>
          <p className="mt-1 text-[12px] text-slate-500">{summary.count} verified {summary.count === 1 ? 'review' : 'reviews'}</p>
          <div className="mt-4 space-y-1.5">
            {[5, 4, 3, 2, 1].map(star => {
              const count = summary.distribution[star - 1] || 0;
              const percent = summary.count ? Math.round((count / summary.count) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="w-3 text-right font-semibold">{star}</span>
                  <svg aria-hidden="true" className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L1.6 7.7l5.8-.8z" /></svg>
                  <span className="h-1.5 flex-1 bg-slate-100"><span className="block h-full bg-amber-400" style={{ width: `${percent}%` }} /></span>
                  <span className="w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <form onSubmit={submit} className="border border-slate-200 bg-[#f7f8fc] p-4">
            <p className="text-[13px] font-bold text-slate-800">Rate this course</p>
            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  aria-pressed={rating === star}
                  className="p-0.5"
                >
                  <svg className={`h-7 w-7 transition ${star <= rating ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L1.6 7.7l5.8-.8z" />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-[12px] font-semibold text-slate-500">{rating ? `${rating}/5` : 'Select a rating'}</span>
            </div>
            <label className="mt-3 block text-[12px] font-semibold text-slate-700">
              Your review
              <textarea
                value={comment}
                onChange={event => setComment(event.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="What worked well? What should improve?"
                className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2 text-[13px] font-normal text-slate-800 outline-none focus:border-[#1738a8]"
              />
            </label>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">{comment.length}/1000</span>
              <button type="submit" disabled={busy || !rating} className="bg-[#1738a8] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#102d88] disabled:cursor-not-allowed disabled:opacity-50">
                {busy ? 'Saving…' : 'Publish review'}
              </button>
            </div>
            {message && <p className="mt-2 text-[12px] font-semibold text-emerald-700">{message}</p>}
            {error && <p className="mt-2 text-[12px] font-semibold text-red-600">{error}</p>}
          </form>

          <div className="mt-4">
            {loading ? (
              <p className="text-[13px] text-slate-500">Loading reviews…</p>
            ) : reviews.length === 0 ? (
              <p className="text-[13px] text-slate-500">No reviews yet — be the first to review {course.title}.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {reviews.slice(0, 6).map(review => (
                  <li key={review.id} className="py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold text-slate-800">{review.studentName}</p>
                      <div className="flex items-center gap-2">
                        <Stars value={review.rating} className="h-3.5 w-3.5" />
                        <span className="text-[11px] text-slate-400">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                    <p className="mt-1 text-[13px] leading-6 text-slate-600">{review.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
