import Link from 'next/link';
import ProgressReport from './progress-report';

/** Blue course header without a logo: a "Courses" tag, the course name and the page's section tabs. */
export default function CourseHeader({ courseTitle, courseSlug, section }: { courseTitle: string; courseSlug: string; section?: string }) {
  return (
    <header className="bg-[#1738a8] px-4 py-3 text-white sm:px-9">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/courses" className="shrink-0 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.14em] text-[#1738a8] hover:bg-slate-100">
            Courses
          </Link>
          <Link href={`/courses/${courseSlug}`} className="truncate text-sm font-semibold text-white hover:underline sm:text-base">
            {courseTitle}
          </Link>
        </div>
        <nav aria-label="Course sections" className="flex items-center gap-2 text-[12px] font-semibold sm:text-[13px]">
          <Link href={`/courses/${courseSlug}/reader`} className={`px-3 py-1.5 hover:bg-white/15 ${section === 'reader' ? 'bg-white/20' : 'border border-white/40'}`}>Reader</Link>
          <Link href={`/courses/${courseSlug}`} className={`px-3 py-1.5 hover:bg-white/15 ${section === 'overview' ? 'bg-white/20' : 'border border-white/40'}`}>Overview</Link>
          <ProgressReport />
        </nav>
      </div>
    </header>
  );
}
