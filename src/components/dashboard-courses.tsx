'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { CourseCard } from './courses/course-card';
import { EnrolButton, EnrolmentProvider, useEnrolments } from './courses/enrolment';
import { courses, getCourse, totalLearningHours } from '../lib/courses-data';

function DashboardCoursesInner() {
  const { enrollments, enrolledSlugs, loading, error } = useEnrolments();

  const myCourses = useMemo(
    () => enrollments.map(row => ({ row, course: getCourse(row.courseSlug) })).filter(item => item.course),
    [enrollments],
  );

  const recommended = useMemo(
    () => courses.filter(course => !enrolledSlugs.has(course.slug)).slice(0, 3),
    [enrolledSlugs],
  );

  if (loading) {
    return (
      <div className="mt-4 space-y-4 sm:mt-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse bg-slate-200" />)}
        </div>
        <div className="h-56 animate-pulse bg-slate-200" />
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-5">
        {[
          [String(myCourses.length), 'Courses enrolled'],
          [String(courses.length), 'Courses in the catalogue'],
          [`${totalLearningHours}`, 'Learning hours available'],
        ].map(([value, label]) => (
          <article key={label} className="border-l-4 border-black bg-white p-4 shadow-sm sm:p-5">
            <p className="text-2xl font-bold text-[#1738a8] sm:text-3xl">{value}</p>
            <p className="mt-1 text-sm text-slate-600">{label}</p>
          </article>
        ))}
      </div>

      <section className="mt-4 bg-white p-4 shadow-sm sm:mt-5 sm:p-6">
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1738a8] sm:text-lg">My courses</h2>
            <p className="mt-0.5 text-[12px] text-slate-500">
              {myCourses.length ? 'Pick up where you left off, or open a module outline.' : 'You are not enrolled on a course yet.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/student/courses" className="text-xs font-bold text-[#1738a8] hover:underline">Manage my courses →</Link>
          </div>
        </div>

        {error && <p className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700">{error}</p>}

        {myCourses.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {myCourses.map(({ row, course }) => (
              <CourseCard
                key={row.id}
                course={course!}
                href={`/courses/${course!.slug}`}
                footer={
                  <div className="w-full">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>Progress</span>
                      <span>{row.progress}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full bg-slate-100">
                      <div className="h-full bg-[#1738a8]" style={{ width: `${Math.max(row.progress, 2)}%` }} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {row.progress > 0 ? 'Continue course' : `Start module 1 of ${course!.modules.length}`}
                      </span>
                      <Link href={`/courses/${course!.slug}`} className="text-[11px] font-bold text-[#1738a8] hover:underline">Open →</Link>
                    </div>
                  </div>
                }
              />
            ))}
          </div>
        ) : (
          <div className="px-1 py-8 text-center sm:py-10">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e8eefc] text-2xl text-[#1738a8]">▣</div>
            <h3 className="mt-4 font-bold">No courses yet</h3>
            <p className="mt-2 text-sm text-slate-500">Browse the catalogue and enrol on your first course — it appears here instantly.</p>
            <Link href="/courses" className="mt-4 inline-block bg-black px-4 py-2.5 text-xs font-bold text-white">Explore courses</Link>
          </div>
        )}
      </section>

      <section className="mt-4 bg-white p-4 shadow-sm sm:mt-5 sm:p-6">
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-[#1738a8] sm:text-lg">Recommended next</h2>
          <Link href="/courses" className="self-start text-xs font-bold text-[#1738a8] hover:underline sm:self-auto">View all {courses.length} courses →</Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {recommended.map(course => (
            <CourseCard
              key={course.slug}
              course={course}
              href={`/courses/${course.slug}`}
              footer={
                <div className="flex w-full items-center justify-between gap-2">
                  <Link href={`/courses/${course.slug}`} className="text-[11px] font-bold text-[#1738a8] hover:underline">Details →</Link>
                  <EnrolButton course={course} label="Enrol" />
                </div>
              }
            />
          ))}
        </div>
      </section>
    </>
  );
}

export default function DashboardCourses() {
  return (
    <EnrolmentProvider>
      <DashboardCoursesInner />
    </EnrolmentProvider>
  );
}
