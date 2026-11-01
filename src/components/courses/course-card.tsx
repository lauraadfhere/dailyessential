import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Course } from '../../lib/courses-data';

export function CourseCard({
  course,
  href,
  footer,
}: {
  course: Course;
  href: string;
  footer?: ReactNode;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#1738a8] hover:shadow-md">
      <Link href={href} className="relative block overflow-hidden bg-[#1738a8]">
        <Image
          src={course.cover}
          alt={`${course.title} course cover`}
          width={1200}
          height={630}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="aspect-[1200/630] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em]">
          <span className="bg-[#e9eef5] px-2 py-1 text-[#1738a8]">{course.code}</span>
          <span className="text-slate-500">{course.category}</span>
        </div>
        <h3 className="mt-3 text-lg font-bold leading-snug text-slate-900">
          <Link href={href} className="hover:text-[#1738a8]">{course.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-[13px] leading-6 text-slate-600">{course.description}</p>
        <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          <div>
            <dt className="font-semibold uppercase tracking-wide text-slate-400">Duration</dt>
            <dd className="mt-0.5 font-bold text-slate-700">{course.duration}</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wide text-slate-400">Study</dt>
            <dd className="mt-0.5 font-bold text-slate-700">{course.hours} hrs</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wide text-slate-400">Modules</dt>
            <dd className="mt-0.5 font-bold text-slate-700">{course.modules.length}</dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-1 items-end">
          {footer ?? (
            <Link href={href} className="text-[12px] font-bold text-[#1738a8] hover:underline">
              View course →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function CourseRow({ course, href, children }: { course: Course; href: string; children?: ReactNode }) {
  return (
    <article className="flex gap-3 border-b border-slate-100 py-3 last:border-b-0">
      <Link href={href} className="relative block h-16 w-24 shrink-0 overflow-hidden">
        <Image src={course.cover} alt="" width={240} height={126} sizes="96px" className="h-full w-full object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#1738a8]">{course.category}</p>
        <h4 className="mt-0.5 truncate text-[13px] font-semibold text-slate-900">
          <Link href={href} className="hover:underline">{course.title}</Link>
        </h4>
        <p className="truncate text-[11px] text-slate-500">{course.duration} · {course.hours} hours · {course.modules.length} modules</p>
        {children}
      </div>
    </article>
  );
}
