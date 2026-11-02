'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { courses, type Course } from '../../lib/courses-data';
import { currentStudent, type Enrollment } from './enrolment';

type Row = Enrollment & { timeSpent?: number };

const hours = (minutes: number) => (minutes / 60).toFixed(1);

function Bars({ items, unit, empty }: { items: { label: string; value: number }[]; unit: (v: number) => string; empty: string }) {
  const max = Math.max(1, ...items.map(item => item.value));
  if (!items.length || items.every(item => item.value === 0)) {
    return <p className="py-6 text-sm text-slate-500">{empty}</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map(item => (
        <li key={item.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm">
          <div className="min-w-0">
            <p className="truncate text-slate-800">{item.label}</p>
            <div className="mt-1 h-3 w-full bg-slate-100" role="presentation">
              <div className="h-3 bg-[#1738a8]" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </div>
          <span className="whitespace-nowrap font-semibold text-slate-700">{unit(item.value)}</span>
        </li>
      ))}
    </ul>
  );
}

export default function CourseAnalytics() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const student = currentStudent();
    fetch(`/api/enrollments?email=${encodeURIComponent(student.email)}`)
      .then(response => response.json())
      .then(data => setRows((data.enrollments || []) as Row[]))
      .catch(() => setRows([]))
      .finally(() => setLoaded(true));
  }, []);

  const active = useMemo(() => rows.filter(row => ['active', 'completed'].includes(row.status)), [rows]);

  const perCourse = useMemo(
    () => active.map(row => ({ label: row.courseTitle, value: row.timeSpent || 0 })).sort((a, b) => b.value - a.value),
    [active],
  );

  // Time is stored per course, so each course's time is shared across its modules in proportion to lessons completed.
  const perModule = useMemo(() => {
    const items: { label: string; value: number }[] = [];
    active.forEach(row => {
      const course: Course | undefined = courses.find(item => item.slug === row.courseSlug);
      if (!course) return;
      const minutes = row.timeSpent || 0;
      const done = row.completedLessons || [];
      const share = done.length ? minutes / done.length : 0;
      course.modules.forEach((title, index) => {
        if (done.includes(index)) items.push({ label: `${course.title} · ${index + 1}. ${title}`, value: Math.round(share) });
      });
    });
    return items.sort((a, b) => b.value - a.value).slice(0, 12);
  }, [active]);

  // Schedule: total time grouped by the month each course was started.
  const perSchedule = useMemo(() => {
    const byMonth = new Map<string, number>();
    active.forEach(row => {
      const date = new Date(row.enrolledAt);
      if (Number.isNaN(date.getTime())) return;
      const key = date.toLocaleString('en-GB', { month: 'short', year: 'numeric' });
      byMonth.set(key, (byMonth.get(key) || 0) + (row.timeSpent || 0));
    });
    return [...byMonth.entries()].map(([label, value]) => ({ label, value }));
  }, [active]);

  const totalMinutes = active.reduce((sum, row) => sum + (row.timeSpent || 0), 0);
  const avgPerCourse = active.length ? totalMinutes / active.length : 0;

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="border-b border-slate-200 bg-white px-4 py-3 text-sm sm:px-9">
        <div className="mx-auto max-w-6xl">
          <Link href="/courses" className="font-semibold text-[#1738a8] hover:underline">Courses</Link>
          <span className="mx-2 text-slate-400">/</span>
          <span>Learning analytics</span>
        </div>
      </div>

      <section className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-8">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Learning analytics</h1>
          <p className="mt-2 text-sm text-slate-600">Hours you have spent studying, by course, module and schedule.</p>
        </div>

        {!loaded ? (
          <p className="text-sm text-slate-500">Loading your analytics…</p>
        ) : active.length === 0 ? (
          <div className="border border-slate-200 bg-white p-6 text-sm text-slate-600">
            You are not enrolled in any course yet. <Link href="/courses" className="font-semibold text-[#1738a8] hover:underline">Browse the courses</Link> and start a lesson to see your hours here.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="border-l-4 border-[#1738a8] bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold">{hours(totalMinutes)} h</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total time studied</p>
              </div>
              <div className="border-l-4 border-[#1738a8] bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold">{hours(avgPerCourse)} h</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Average per course</p>
              </div>
              <div className="border-l-4 border-[#1738a8] bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold">{active.length}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Courses enrolled</p>
              </div>
            </div>

            <section className="border border-slate-200 p-5">
              <h2 className="text-lg font-semibold">Hours per course</h2>
              <Bars items={perCourse} unit={v => `${hours(v)} h`} empty="No study time recorded yet." />
            </section>

            <section className="border border-slate-200 p-5">
              <h2 className="text-lg font-semibold">Time per module</h2>
              <p className="mt-1 text-xs text-slate-500">Estimated: each course&apos;s time is shared across its completed modules.</p>
              <Bars items={perModule} unit={v => `${v} min`} empty="Complete a module to see its time here." />
            </section>

            <section className="border border-slate-200 p-5">
              <h2 className="text-lg font-semibold">Time per schedule</h2>
              <p className="mt-1 text-xs text-slate-500">Grouped by the month each course was started.</p>
              <Bars items={perSchedule} unit={v => `${hours(v)} h`} empty="No schedule data yet." />
            </section>
          </>
        )}
      </section>
    </main>
  );
}
