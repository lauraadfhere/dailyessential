'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CourseCard } from './course-card';
import { EnrolButton, EnrolmentProvider, useEnrolments } from './enrolment';
import ReviewDialog from './review-dialog';
import { courseCategories, courses, getCourse, type CourseCategory } from '../../lib/courses-data';

function StudentCoursesInner() {
  const { enrollments, enrolledSlugs, loading, error, withdraw, pendingSlug } = useEnrolments();
  const [category, setCategory] = useState<CourseCategory | 'All'>('All');
  const [query, setQuery] = useState('');

  const myCourses = enrollments
    .map(row => ({ row, course: getCourse(row.courseSlug) }))
    .filter(item => item.course);
  const inProgress = myCourses.filter(item => item.row.status !== 'completed');
  const finished = myCourses.filter(item => item.row.status === 'completed');

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter(course => {
      const matchesCategory = category === 'All' || course.category === category;
      const matchesQuery = !q || course.title.toLowerCase().includes(q) || course.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <div className="space-y-6">
      <section className="border-b border-slate-300 pb-5">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#1738a8]">Student space / Courses</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#15133d] sm:text-2xl">My courses</h2>
            <p className="mt-1 text-sm text-slate-500">Enrol on a course to unlock its modules, resources and final project.</p>
          </div>
          <Link href="/courses" className="self-start bg-[#1738a8] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#102d88] sm:self-auto">
            Browse catalogue
          </Link>
        </div>
      </section>

      {error && <p className="border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-700">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          [String(inProgress.length), 'In progress'],
          [String(finished.length), 'Completed'],
          [String(courses.length - enrolledSlugs.size), 'Available to add'],
          [String(courses.reduce((total, course) => total + course.hours, 0)), 'Catalogue learning hours'],
        ].map(([value, label]) => (
          <article key={label} className="border-l-4 border-[#1738a8] bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-[#1738a8]">{value}</p>
            <p className="mt-1 text-[12px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          </article>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-72 animate-pulse bg-slate-200" />)}
        </div>
      ) : myCourses.length ? (
        <div className="space-y-8">
          {[
            { title: 'In progress', items: inProgress },
            { title: 'Completed', items: finished },
          ].filter(group => group.items.length).map(group => (
            <section key={group.title}>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-[.14em] text-slate-500">{group.title}</h3>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.items.map(({ row, course }) => {
                  const completedCount = row.completedLessons?.length ?? 0;
                  const lastLesson = row.lastLesson ?? 0;
                  const isCompleted = row.status === 'completed';
                  return (
                    <CourseCard
                      key={row.id}
                      course={course!}
                      href={`/courses/${course!.slug}`}
                      footer={
                        <div className="w-full">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                            <span>{isCompleted ? 'Completed' : 'Progress'}</span>
                            <span>{row.progress}% · {completedCount} of {course!.modules.length} lessons</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full bg-slate-100">
                            <div className="h-full bg-[#1738a8]" style={{ width: `${Math.max(row.progress, 2)}%` }} />
                          </div>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-500">Enrolled {row.enrolledAt ? new Date(row.enrolledAt).toLocaleDateString() : ''}</span>
                            <div className="flex items-center gap-3">
                              <ReviewDialog course={course!} />
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Withdraw from ${course!.title}? You can enrol again later.`)) withdraw(row.id);
                                }}
                                disabled={pendingSlug === 'withdraw'}
                                className="text-[11px] font-semibold text-slate-500 hover:text-red-600 disabled:opacity-50"
                              >
                                Withdraw
                              </button>
                              <Link href={`/courses/${course!.slug}/lessons/${lastLesson}`} className="text-[11px] font-bold text-[#1738a8] hover:underline">
                                {isCompleted ? 'Review →' : completedCount ? 'Continue →' : 'Start →'}
                              </Link>
                            </div>
                          </div>
                        </div>
                      }
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-slate-300 bg-white p-8 text-center">
          <h3 className="text-base font-bold text-slate-800">You have not enrolled on a course yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Pick a course below and enrol in one click. Twenty courses are available across five pathways.</p>
        </div>
      )}

      <section className="border-t border-slate-200 pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#15133d]">Available courses</h2>
            <p className="text-[12px] text-slate-500">Filter by pathway, or search by course name.</p>
          </div>
          <label className="flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 text-sm text-slate-500 sm:w-64">
            <span className="sr-only">Search courses</span>
            <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="10.8" cy="10.8" r="5.6" />
              <path strokeLinecap="round" d="m15.1 15.1 4.1 4.1" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search courses"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(['All', ...courseCategories.map(item => item.key)] as (CourseCategory | 'All')[]).map(key => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              aria-pressed={category === key}
              className={`border px-3 py-1.5 text-[12px] font-semibold transition ${category === key ? 'border-[#1738a8] bg-[#1738a8] text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-[#1738a8] hover:text-[#1738a8]'}`}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {available.map(course => (
            <CourseCard
              key={course.slug}
              course={course}
              href={`/courses/${course.slug}`}
              footer={
                <div className="flex w-full items-center justify-between gap-2">
                  <Link href={`/courses/${course.slug}`} className="text-[11px] font-bold text-[#1738a8] hover:underline">Details →</Link>
                  <EnrolButton course={course} />
                </div>
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function StudentCoursesView() {
  return (
    <EnrolmentProvider>
      <StudentCoursesInner />
    </EnrolmentProvider>
  );
}
