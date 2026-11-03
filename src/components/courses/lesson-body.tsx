'use client';

import { useEffect, useState } from 'react';
import type { Course } from '../../lib/courses-data';
import type { ModuleContent } from '../../lib/lesson-text';
import ActivitiesPanel from './activities-panel';

function Section({ heading, text }: { heading: string; text: string }) {
  if (!text) return null;
  return (
    <section className="mt-7">
      <h2 className="text-[15px] font-bold text-slate-900">{heading}</h2>
      <div className="mt-2 whitespace-pre-line text-[15px] leading-7 text-slate-700">{text}</div>
    </section>
  );
}

export type LessonState = { lesson: ModuleContent | null; state: 'loading' | 'ready' | 'error'; error: string };

/** Loads a lesson from the authenticated API (never bundled into the browser). */
export function useLesson(course: Course, lessonIndex: number): LessonState {
  const key = `${course.slug}:${lessonIndex}`;
  const [result, setResult] = useState<{ key: string; lesson: ModuleContent | null; error: string }>({ key: '', lesson: null, error: '' });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/courses/lesson?slug=${encodeURIComponent(course.slug)}&index=${lessonIndex}`, { cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Could not load this lesson.');
        return data.lesson as ModuleContent | null;
      })
      .then(data => {
        if (!cancelled) setResult({ key, lesson: data, error: '' });
      })
      .catch(err => {
        if (!cancelled) setResult({ key, lesson: null, error: err instanceof Error ? err.message : 'Could not load this lesson.' });
      });
    return () => { cancelled = true; };
  }, [course.slug, lessonIndex, key]);

  // A result for a different lesson counts as still loading.
  if (result.key !== key) return { lesson: null, state: 'loading', error: '' };
  return { lesson: result.lesson, state: result.error ? 'error' : 'ready', error: result.error };
}

/**
 * The lesson text, split the way a course platform splits it:
 *  - `content`: what the learner reads (why it matters, outcomes, lessons, common difficulties)
 *  - `document`: everything as plain text for the printable PDF view
 * Activities (practical task, quiz, reflection) live in ActivitiesPanel, not here.
 */
export function LessonContent({ course, lessonIndex, data, part = 'content' }: { course: Course; lessonIndex: number; data: LessonState; part?: 'content' | 'document' }) {
  const { lesson, state, error } = data;

  if (state === 'loading') {
    return (
      <div aria-busy="true" className="space-y-3 py-4">
        <div className="h-4 w-1/3 animate-pulse bg-slate-200" />
        <div className="h-3 w-full animate-pulse bg-slate-100" />
        <div className="h-3 w-5/6 animate-pulse bg-slate-100" />
        <div className="h-3 w-2/3 animate-pulse bg-slate-100" />
      </div>
    );
  }
  if (state === 'error') {
    return (
      <p role="alert" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
        {error}{' '}
        {/sign in/i.test(error) && <a href={`/login/student?next=${encodeURIComponent(`/courses/${course.slug}/reader/${lessonIndex}`)}`} className="underline">Sign in</a>}
      </p>
    );
  }
  if (!lesson) {
    return <p className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">The detailed content for this module is being prepared. The module title and outcomes are listed in the course overview.</p>;
  }

  return (
    <div>
      <Section heading="Why this matters" text={lesson.whyItMatters} />
      <Section heading="Learning outcomes" text={lesson.outcomes} />
      {lesson.lessons.map(block => (
        <section key={block.number} className="mt-7">
          <h2 className="text-[15px] font-bold text-slate-900">Lesson {block.number}: {block.title}</h2>
          <div className="mt-2 whitespace-pre-line text-[15px] leading-7 text-slate-700">{block.body}</div>
        </section>
      ))}
      <Section heading="Common difficulties" text={lesson.pitfalls} />
      {part === 'document' && (
        <>
          <Section heading="Guided practical activity" text={lesson.activity} />
          <Section heading="Knowledge check" text={lesson.knowledgeCheck} />
          <Section heading="Reflection and completion evidence" text={lesson.reflection} />
        </>
      )}
    </div>
  );
}

/** Loads and renders a lesson with its activities. Used by the standalone lesson page. */
export default function LessonBody({ course, lessonIndex }: { course: Course; lessonIndex: number }) {
  const data = useLesson(course, lessonIndex);
  return (
    <div>
      <LessonContent course={course} lessonIndex={lessonIndex} data={data} />
      {data.state === 'ready' && data.lesson && (
        <div className="mt-8 border-t border-slate-200 pt-2">
          <h2 className="mt-6 text-lg font-bold text-slate-900">Activities</h2>
          <ActivitiesPanel course={course} lessonIndex={lessonIndex} lesson={data.lesson} />
        </div>
      )}
    </div>
  );
}
