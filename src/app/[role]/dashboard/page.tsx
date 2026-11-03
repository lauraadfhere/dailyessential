import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import PortalShell from '../../../components/portal-shell';
import DashboardCourses from '../../../components/dashboard-courses';
import LatestResults from '../../../components/courses/latest-results';

export default async function Dashboard({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (role === 'teacher') redirect('/teacher');
  if (role === 'examiner') redirect('/examiner');
  if (role !== 'student') notFound();

  return (
    <PortalShell role="student">
      <section aria-labelledby="student-actions" className="mb-6 sm:mb-7">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#1738a8]">Quick access</p>
            <h2 id="student-actions" className="mt-1 text-lg font-bold text-[#15133d] sm:text-xl">What would you like to do?</h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/student/messages" aria-label="Messages" title="Messages with your teachers" className="grid h-10 w-10 place-items-center bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100">
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </Link>
            <Link href="/student/track" className="inline-flex h-10 items-center gap-2 bg-black px-3 text-[12px] font-bold text-white shadow-sm hover:bg-slate-800" title="Track your courses, marks and progress">
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
              Track
            </Link>
          </div>
        </div>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {[
            ['Choose courses', 'Browse your pathway and related programmes.', '/courses', <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16M8 7h8M8 11h6" /></>],
            ['Manage exams', 'View assessments, exam schedules and results.', '/workspace/student/assessments', <><path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="m8 12 2.5 2.5L16 9M8 7h8M8 18h5" /></>],
            ['Verify status and identity', 'Review your student profile, avatar and verification status.', '/student/profile', <><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0M19 8h2M20 7v2" /></>],
          ].map(([title, description, href, icon]) => (
            <Link key={title as string} href={href as string} className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-5">
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-950 sm:h-11 sm:w-11">
                  <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">{icon}</svg>
                </span>
                <svg aria-hidden="true" className="mt-1 h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m9 18 6-6-6-6" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 sm:mt-5">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <DashboardCourses />

      <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 md:grid-cols-2">
        <LatestResults />
        <article className="bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-[#1738a8] sm:text-lg">School announcements</h2>
          <p className="mt-4 text-sm leading-6 text-slate-600 sm:mt-5">
            <b className="text-slate-800">New learning resources available.</b>
            <br />
            The Daily Essential digital library has been updated with new resources and support materials.
          </p>
          <Link href="/news" className="mt-5 inline-block text-xs font-bold text-[#1738a8] sm:mt-6">
            View all announcements →
          </Link>
        </article>
      </div>
    </PortalShell>
  );
}
