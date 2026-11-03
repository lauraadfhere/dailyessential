'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ConsoleShell from '../../../components/console-shell';
import { Badge, Panel, StatGrid } from '../../../components/platform/kit';
import { courses, getCourse } from '../../../lib/courses-data';

type Enrollment = {
  id: string;
  studentEmail: string;
  studentName: string;
  courseSlug: string;
  courseTitle: string;
  status: string;
  progress: number;
  enrolledAt: string;
};

export default function AdminCoursesPage() {
  const [rows, setRows] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/enrollments?all=1&limit=500')
      .then(response => response.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setRows(data.enrollments || []);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load enrolments'))
      .finally(() => setLoading(false));
  }, []);

  const active = rows.filter(row => row.status === 'active' || row.status === 'completed');

  const byCourse = useMemo(() => {
    const map = new Map<string, number>();
    active.forEach(row => map.set(row.courseSlug, (map.get(row.courseSlug) || 0) + 1));
    return courses.map(course => ({ course, count: map.get(course.slug) || 0 })).sort((a, b) => b.count - a.count);
  }, [active]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows.slice(0, 60);
    return rows
      .filter(row => row.studentEmail.toLowerCase().includes(q) || row.studentName.toLowerCase().includes(q) || row.courseTitle.toLowerCase().includes(q))
      .slice(0, 60);
  }, [rows, query]);

  return (
    <ConsoleShell role="admin" showSidebar>
      <div className="space-y-5 px-4 py-6 sm:px-7">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#9aa3ad]">Administration / Academics</p>
            <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Course enrolments</h1>
            <p className="mt-1 text-[13px] text-slate-500">Every enrolment created from the course catalogue, with the course roster it feeds.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/course-content" className="rounded bg-[#2e9fff] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#1f8eef]">Edit course content</Link>
            <Link href="/admin/academics" className="rounded border border-slate-300 px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50">Academic structure</Link>
          </div>
        </div>

        <StatGrid
          items={[
            { label: 'Active enrolments', value: String(active.length), detail: 'Across all courses' },
            { label: 'Courses with learners', value: String(new Set(active.map(row => row.courseSlug)).size), detail: `of ${courses.length} in the catalogue` },
            { label: 'Withdrawn', value: String(rows.length - active.length), detail: 'Retained for audit' },
            { label: 'Latest enrolment', value: active[0] ? new Date(active[0].enrolledAt).toLocaleDateString() : '—', detail: 'Newest record' },
          ]}
        />

        {error && <p className="border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-700">{error}</p>}

        <Panel title="Roster by course" description="Active learners per course in the catalogue.">
          <div className="grid gap-2 sm:grid-cols-2">
            {byCourse.map(({ course, count }) => (
              <div key={course.code} className="flex items-center justify-between gap-3 border border-slate-100 bg-slate-50 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-slate-800">{course.code} · {course.title}</p>
                  <p className="text-[11px] text-slate-500">{course.category}</p>
                </div>
                <Badge tone={count ? 'success' : 'neutral'}>{count} enrolled</Badge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Enrolment records" description="Newest first. Search by student or course.">
          <label className="mb-3 flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-500 sm:max-w-sm">
            <span className="sr-only">Search enrolments</span>
            <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="10.8" cy="10.8" r="5.6" />
              <path strokeLinecap="round" d="m15.1 15.1 4.1 4.1" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search student email or course"
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-slate-400"
            />
          </label>

          {loading ? (
            <p className="py-6 text-center text-[13px] text-slate-500">Loading enrolments…</p>
          ) : visible.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-slate-500">No enrolments recorded yet. Students appear here as soon as they enrol from the catalogue.</p>
          ) : (
            <div className="overflow-x-auto border border-slate-200">
              <table className="min-w-full text-[13px]">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[.1em] text-slate-500">
                  <tr>
                    <th className="px-3 py-2.5 text-left">Student</th>
                    <th className="px-3 py-2.5 text-left">Course</th>
                    <th className="px-3 py-2.5 text-left">Enrolled</th>
                    <th className="px-3 py-2.5 text-left">Progress</th>
                    <th className="px-3 py-2.5 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {visible.map(row => (
                    <tr key={row.id}>
                      <td className="px-3 py-2.5">
                        <p className="font-semibold text-slate-800">{row.studentName || row.studentEmail.split('@')[0]}</p>
                        <p className="text-[11px] text-slate-500">{row.studentEmail}</p>
                      </td>
                      <td className="px-3 py-2.5 text-slate-700">{getCourse(row.courseSlug)?.title || row.courseTitle}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">{row.enrolledAt ? new Date(row.enrolledAt).toLocaleDateString() : '—'}</td>
                      <td className="px-3 py-2.5 text-slate-600">{row.progress}%</td>
                      <td className="px-3 py-2.5">
                        <Badge tone={row.status === 'active' ? 'success' : 'neutral'}>{row.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </ConsoleShell>
  );
}
