'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readPortalIdentity } from '../../lib/portal-session';
import type { Course } from '../../lib/courses-data';

export type Enrollment = {
  id: string;
  studentEmail: string;
  studentName: string;
  courseSlug: string;
  courseTitle: string;
  status: string;
  progress: number;
  completedLessons: number[];
  lastLesson: number;
  timeSpent?: number;
  enrolledAt: string;
};

export const demoStudentEmail = 'student@bifti.school';

export function currentStudent() {
  if (typeof window === 'undefined') return { email: demoStudentEmail, name: 'Student' };
  const identity = readPortalIdentity();
  return {
    email: (identity.email || demoStudentEmail).trim().toLowerCase(),
    name: identity.displayName || 'Student',
  };
}

type EnrolmentContextValue = {
  enrollments: Enrollment[];
  enrolledSlugs: Set<string>;
  loading: boolean;
  pendingSlug: string | null;
  error: string;
  enrol: (course: Course) => Promise<boolean>;
  withdraw: (enrollmentId: string) => Promise<void>;
};

const EnrolmentContext = createContext<EnrolmentContextValue | null>(null);

export function EnrolmentProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState('');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const student = currentStudent();
    setEmail(student.email);
    fetch(`/api/enrollments?email=${encodeURIComponent(student.email)}`)
      .then(response => response.json())
      .then(data => setEnrollments((data.enrollments || []).filter((row: Enrollment) => ['active', 'completed'].includes(row.status))))
      .catch(() => setError('Could not load your enrolments.'))
      .finally(() => setLoading(false));
  }, []);

  const enrolledSlugs = useMemo(() => new Set(enrollments.map(row => row.courseSlug)), [enrollments]);

  const enrol = useCallback(
    async (course: Course) => {
      setPendingSlug(course.slug);
      setError('');
      try {
        const student = currentStudent();
        const response = await fetch('/api/enrollments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: student.email, name: student.name, courseSlug: course.slug }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Enrolment failed');
        const row = data.enrollment as Enrollment;
        setEnrollments(current => {
          const without = current.filter(item => item.courseSlug !== row.courseSlug);
          return [{ ...row, status: row.status || 'active' }, ...without];
        });
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Enrolment failed');
        return false;
      } finally {
        setPendingSlug(null);
      }
    },
    [],
  );

  const withdraw = useCallback(
    async (enrollmentId: string) => {
      if (!email) return;
      setPendingSlug('withdraw');
      setError('');
      try {
        const response = await fetch(`/api/enrollments?id=${encodeURIComponent(enrollmentId)}&email=${encodeURIComponent(email)}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Could not withdraw');
        }
        setEnrollments(current => current.filter(item => item.id !== enrollmentId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not withdraw');
      } finally {
        setPendingSlug(null);
      }
    },
    [email],
  );

  const value: EnrolmentContextValue = {
    enrollments,
    enrolledSlugs,
    loading,
    pendingSlug,
    error,
    enrol,
    withdraw,
  };

  return <EnrolmentContext.Provider value={value}>{children}</EnrolmentContext.Provider>;
}

export function useEnrolments() {
  const context = useContext(EnrolmentContext);
  if (!context) throw new Error('useEnrolments must be used inside <EnrolmentProvider>');
  return context;
}

export function EnrolButton({ course, label = 'Enrol' }: { course: Course; label?: string }) {
  const { enrolledSlugs, pendingSlug, enrol } = useEnrolments();
  const enrolled = enrolledSlugs.has(course.slug);
  const pending = pendingSlug === course.slug;

  if (enrolled) {
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700">
        <span aria-hidden="true">✓</span> Enrolled
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => enrol(course)}
      disabled={pending}
      className="shrink-0 bg-[#1738a8] px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-[#102d88] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Enrolling…' : label}
    </button>
  );
}
