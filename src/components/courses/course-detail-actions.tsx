'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EnrolmentProvider, currentStudent, useEnrolments } from './enrolment';
import type { Course } from '../../lib/courses-data';

function EnrolPanel({ course }: { course: Course }) {
  const { enrolledSlugs, enrollments, pendingSlug, enrol, error } = useEnrolments();
  const [student, setStudent] = useState({ email: 'student@bifti.school', name: 'Student' });
  const [justEnrolled, setJustEnrolled] = useState(false);

  useEffect(() => {
    setStudent(currentStudent());
  }, []);

  const enrolled = enrolledSlugs.has(course.slug);
  const pending = pendingSlug === course.slug;
  const row = enrollments.find(item => item.courseSlug === course.slug);
  const completedCount = row?.completedLessons?.length ?? 0;
  const resumeLesson = row?.lastLesson ?? 0;

  return (
    <div className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-400">Enrolment</p>
      {enrolled ? (
        <>
          <p className="mt-2 flex items-center gap-2 text-sm font-bold text-emerald-700">
            <span aria-hidden="true">✓</span> Enrolled
          </p>
          <p className="mt-1 text-[12px] leading-5 text-slate-600">
            {row?.status === 'completed'
              ? `You completed all ${course.modules.length} lessons.`
              : `${completedCount} of ${course.modules.length} lessons completed.`}
          </p>
          <Link href={`/courses/${course.slug}/lessons/${resumeLesson}`} className="mt-3 block bg-[#1738a8] px-4 py-2.5 text-center text-[12px] font-bold text-white hover:bg-[#102d88]">
            {row?.status === 'completed' ? 'Review course' : completedCount ? 'Continue learning' : 'Start course'}
          </Link>
          <Link href="/student/courses" className="mt-2 block border border-slate-300 px-4 py-2.5 text-center text-[12px] font-bold text-slate-700 hover:border-[#1738a8] hover:text-[#1738a8]">
            Go to my courses
          </Link>
        </>
      ) : (
        <>
          <p className="mt-2 text-[12px] leading-5 text-slate-600">
            Enrolling is free for admitted students. You will appear on the class roster and can start module 1 immediately.
          </p>
          <button
            type="button"
            onClick={async () => { const ok = await enrol(course); if (ok) setJustEnrolled(true); }}
            disabled={pending}
            className="mt-3 w-full bg-[#1738a8] px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#102d88] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Enrolling…' : `Enrol on ${course.title}`}
          </button>
          <p className="mt-2 truncate text-[11px] text-slate-500">Enrolling as {student.email}</p>
        </>
      )}
      {justEnrolled && <p className="mt-2 text-[12px] font-semibold text-emerald-700">You are on the roster. Open “My courses” to begin.</p>}
      {error && <p className="mt-2 text-[12px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}

export default function CourseDetailActions({ course }: { course: Course }) {
  return (
    <EnrolmentProvider>
      <EnrolPanel course={course} />
    </EnrolmentProvider>
  );
}
