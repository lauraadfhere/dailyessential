'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import ConsoleShell from '../../../components/console-shell';
import type { StudentRecord } from '../../../lib/teacher-data';

const filterFields = [
  { key: 'programme', label: 'Programme / subject', options: ['UI / UX Design', 'Digital Literacy', 'Computer Basics', 'Data Foundations', 'Creative Media', 'Robotics Intro'] },
  { key: 'gradeLevel', label: 'Grade levels', options: ['JSS 2', 'JSS 3', 'SS 1'] },
  { key: 'campus', label: 'Campus', options: ['Main Campus', 'Digital Learning Hub', 'Evening Programme'] },
  { key: 'status', label: 'Student status', options: ['active', 'pending', 'inactive'] },
  { key: 'deliveryMode', label: 'Delivery mode', options: ['In person', 'Online', 'Hybrid'] },
  { key: 'className', label: 'Class group', options: ['JSS 2 Blue', 'JSS 2 Green', 'SS1 Digital', 'SS1 Media', 'JSS 3 Alpha'] },
] as const;

type FilterKey = (typeof filterFields)[number]['key'];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <div className="flex items-stretch bg-[#eceff3]">
        <span aria-hidden="true" className="w-[5px] shrink-0 bg-[#9b1c2c]" />
        <h3 className="px-4 py-2.5 text-[15px] font-bold text-[#1f2430]">{title}</h3>
      </div>
      <div className="space-y-2 px-1 py-4 text-[14px] leading-7 text-[#222]">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p>
      <span className="font-bold">{label}:</span> {children}
    </p>
  );
}

export default function TeacherSearchPage() {
  const [keyword, setKeyword] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    programme: '',
    gradeLevel: '',
    campus: '',
    status: '',
    deliveryMode: '',
    className: '',
  });
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(keyword.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debounced) params.set('q', debounced);
    Object.entries(filters).forEach(([key, value]) => {
      if (!value) return;
      if (key === 'className') params.set('classGroup', value);
      else params.set(key, value);
    });
    params.set('limit', '100');

    let active = true;
    setLoading(true);
    fetch(`/api/students?${params.toString()}`)
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Search failed');
        return data.students as StudentRecord[];
      })
      .then(rows => {
        if (!active) return;
        setStudents(rows);
        setSelectedId(current => (rows.some(row => row.id === current) ? current : rows[0]?.id || ''));
        setError('');
      })
      .catch(err => {
        if (!active) return;
        setStudents([]);
        setError(err instanceof Error ? err.message : 'Unable to search students');
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [debounced, filters]);

  const selected = useMemo(() => students.find(item => item.id === selectedId) || students[0], [students, selectedId]);

  const setFilter = (key: FilterKey, value: string) => {
    setFilters(current => ({ ...current, [key]: value }));
  };

  return (
    <ConsoleShell role="teacher" showSidebar>
      <nav className="border-b border-[#eef1f4] px-5 py-3 text-sm text-[#1738a8]">
        <Link href="/teacher" className="hover:underline">Home</Link>
        <span className="mx-1.5 text-slate-400">/</span>
        <span className="text-slate-700">Search students</span>
        {selected && (
          <>
            <span className="mx-1.5 text-slate-400">/</span>
            <span className="text-slate-700">{selected.name}</span>
          </>
        )}
      </nav>

      <div className="grid gap-0 bg-white lg:grid-cols-[280px_1fr]">
        <aside className="bg-[#d9e6f2] p-5">
          <h2 className="text-[15px] font-bold uppercase tracking-wide text-[#9b1c2c]">Search &amp; Filter</h2>

          <label className="mt-4 block">
            <span className="sr-only">Enter keyword</span>
            <input
              value={keyword}
              onChange={event => setKeyword(event.target.value)}
              placeholder="Enter keyword"
              className="h-10 w-full border border-[#c5d0db] bg-white px-3 text-sm text-slate-800 outline-none placeholder:text-slate-500 focus:border-[#1738a8]"
            />
          </label>

          <div className="mt-3 space-y-3">
            {filterFields.map(field => (
              <label key={field.key} className="relative block">
                <span className="sr-only">{field.label}</span>
                <select
                  value={filters[field.key]}
                  onChange={event => setFilter(field.key, event.target.value)}
                  className="h-10 w-full appearance-none border border-[#c5d0db] bg-white px-3 pr-9 text-sm text-slate-700 outline-none focus:border-[#1738a8]"
                >
                  <option value="">{field.label}</option>
                  {field.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1738a8]" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                </svg>
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setKeyword('');
              setFilters({ programme: '', gradeLevel: '', campus: '', status: '', deliveryMode: '', className: '' });
            }}
            className="mt-4 text-xs font-bold text-[#1738a8] hover:underline"
          >
            Clear filters
          </button>

          <div className="mt-6 border-t border-[#b7c9db] pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#5b6b7c]">
              {loading ? 'Searching…' : `${students.length} student${students.length === 1 ? '' : 's'}`}
            </p>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            <ul className="mt-3 max-h-[320px] space-y-1 overflow-auto">
              {students.map(student => (
                <li key={student.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(student.id)}
                    className={`w-full rounded px-3 py-2 text-left text-sm transition ${selected?.id === student.id ? 'bg-white font-semibold text-[#1738a8] shadow-sm' : 'text-[#243247] hover:bg-white/60'}`}
                  >
                    <span className="block truncate">{student.name}</span>
                    <span className="block truncate text-[11px] text-[#5b6b7c]">{student.studentId} · {student.className}</span>
                  </button>
                </li>
              ))}
              {!loading && !students.length && <li className="px-1 text-sm text-[#5b6b7c]">No students match these filters.</li>}
            </ul>
          </div>
        </aside>

        <div className="min-h-[640px] bg-white px-6 py-7 sm:px-10">
          {selected ? (
            <>
              <h1 className="text-center text-[28px] font-bold tracking-tight text-[#1f2430] sm:text-[32px]">{selected.name}</h1>

              <Section title="Student and contact">
                <Field label="Student ID">{selected.studentId}</Field>
                <Field label="Backup serial">{(selected as StudentRecord & { backupSerial?: string }).backupSerial || '—'}</Field>
                <Field label="Barcode">{(selected as StudentRecord & { barcodeValue?: string }).barcodeValue || '—'}</Field>
                <Field label="Student status"><span className="capitalize">{selected.status}</span></Field>
                <Field label="Email address"><a href={`mailto:${selected.email}`} className="text-[#0067d9] hover:underline">{selected.email}</a></Field>
                <Field label="Guardian">{selected.guardian}</Field>
                <Field label="Guardian email"><a href={`mailto:${selected.guardianEmail}`} className="text-[#0067d9] hover:underline">{selected.guardianEmail}</a></Field>
              </Section>

              <Section title="Programme overview">
                <Field label="Programme">{selected.programme}</Field>
                <Field label="Class group">{selected.className}</Field>
                <Field label="Grade level">{selected.gradeLevel}</Field>
                <Field label="Campus">{selected.campus}</Field>
                <Field label="Delivery mode">{selected.deliveryMode}</Field>
              </Section>

              <Section title="Tracking summary">
                <Field label="Attendance">{selected.attendance}</Field>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/teacher/marks" className="rounded bg-[#1738a8] px-3 py-2 text-xs font-bold text-white hover:bg-[#102d88]">Assign marks</Link>
                  <Link href="/teacher/evaluations" className="rounded border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Evaluation tracking</Link>
                </div>
              </Section>
            </>
          ) : (
            <div className="flex h-full min-h-[420px] items-center justify-center text-center">
              <div>
                <h1 className="text-2xl font-bold text-[#1f2430]">{loading ? 'Loading students…' : 'No student selected'}</h1>
                <p className="mt-2 text-sm text-slate-600">Adjust search filters to find a learner profile from Parse.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ConsoleShell>
  );
}
