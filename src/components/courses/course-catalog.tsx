'use client';

import { useEffect, useMemo, useState } from 'react';
import { CourseCard } from './course-card';
import { courseCategories, courses, type CourseCategory } from '../../lib/courses-data';

const allCategories: (CourseCategory | 'All')[] = ['All', ...courseCategories.map(item => item.key)];

export default function CourseCatalog() {
  const [category, setCategory] = useState<CourseCategory | 'All'>('All');
  const [query, setQuery] = useState('');

  // Arriving from the site search (?q=) or a shared link starts filtered.
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial) setQuery(initial);
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter(course => {
      const matchesCategory = category === 'All' || course.category === category;
      const matchesQuery = !q
        || course.title.toLowerCase().includes(q)
        || course.description.toLowerCase().includes(q)
        || course.category.toLowerCase().includes(q)
        || course.modules.some(module => module.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-3 border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {allCategories.map(key => {
            const active = category === key;
            const count = key === 'All' ? courses.length : courses.filter(course => course.category === key).length;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                aria-pressed={active}
                className={`border px-3 py-1.5 text-[12px] font-semibold transition ${active ? 'border-[#1738a8] bg-[#1738a8] text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-[#1738a8] hover:text-[#1738a8]'}`}
              >
                {key} ({count})
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 border border-slate-200 px-3 py-2 text-sm text-slate-500 sm:w-64">
          <span className="sr-only">Search courses</span>
          <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="10.8" cy="10.8" r="5.6" />
            <path strokeLinecap="round" d="m15.1 15.1 4.1 4.1" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search by course, topic or module"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
          />
        </label>
      </div>

      <p className="mt-4 text-[12px] font-semibold uppercase tracking-[.12em] text-slate-500">
        {visible.length} {visible.length === 1 ? 'course' : 'courses'} {category === 'All' ? 'in the catalogue' : `in ${category}`}
      </p>

      {visible.length === 0 ? (
        <div className="mt-4 border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-slate-700">No courses match that search.</p>
          <button
            type="button"
            onClick={() => { setQuery(''); setCategory('All'); }}
            className="mt-3 text-xs font-bold text-[#1738a8] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(course => (
            <CourseCard key={course.slug} course={course} href={`/courses/${course.slug}`} />
          ))}
        </div>
      )}
    </section>
  );
}
