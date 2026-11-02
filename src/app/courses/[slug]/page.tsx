import Image from 'next/image';
import CoursesAssistant from '../../../components/courses/courses-assistant';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CourseDetailActions from '../../../components/courses/course-detail-actions';
import CourseReviews from '../../../components/courses/course-reviews';
import StudyBuddy from '../../../components/ai/study-buddy';
import { CourseRow } from '../../../components/courses/course-card';
import { courses, getCourse } from '../../../lib/courses-data';

export function generateStaticParams() {
  return courses.map(course => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return { title: 'Course not found — Daily Essential School' };
  return {
    title: `${course.title} — Daily Essential School`,
    description: course.description,
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const related = courses
    .filter(item => item.category === course.category && item.slug !== course.slug)
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="bg-[#1738a8] px-4 py-3 sm:px-9">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link href="/" aria-label="Daily Essential School home" className="inline-flex w-[132px] shrink-0 items-center sm:w-[168px]">
            <Image src="/brand/logo-white.png" alt="Daily Essential School" width={1000} height={280} priority className="h-auto w-full object-contain" />
          </Link>
          <div className="flex items-center gap-3 text-[12px] font-semibold text-white/90 sm:gap-5 sm:text-[13px]">
            <Link href="/courses" className="hover:text-white">All courses</Link>
            <Link href="/login/student" className="border border-white/40 px-3 py-1.5 hover:bg-white/15">Portal login</Link>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-4 py-3 text-sm sm:px-9">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="font-semibold text-[#1738a8] hover:underline">Home</Link>
          <span className="mx-2 text-slate-400">/</span>
          <Link href="/courses" className="font-semibold text-[#1738a8] hover:underline">Courses</Link>
          <span className="mx-2 text-slate-400">/</span>
          <span>{course.title}</span>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-11">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1738a8]">
          Course {course.code} · {course.category}
        </p>
        <h1 className="mt-3 border-b-4 border-[#1738a8] bg-[#e9eef5] px-4 py-4 text-2xl font-bold text-slate-900 sm:px-5 sm:py-5 sm:text-4xl">
          {course.title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700">{course.description}</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <div className="overflow-hidden border border-slate-200 shadow-sm">
              <Image
                src={course.cover}
                alt={`${course.title} course cover`}
                width={1200}
                height={630}
                priority
                sizes="(max-width: 1024px) 100vw, 720px"
                className="h-auto w-full object-cover"
              />
            </div>

            <dl className="mt-5 grid grid-cols-3 gap-3">
              {[
                ['Duration', course.duration],
                ['Learning time', `${course.hours} hours`],
                ['Modules', String(course.modules.length)],
              ].map(([label, value]) => (
                <div key={label} className="border-l-4 border-[#1738a8] bg-white p-3 shadow-sm">
                  <dt className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">{label}</dt>
                  <dd className="mt-1 text-sm font-bold text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>

            <section className="mt-8">
              <h2 className="text-xl font-bold text-slate-900">Module outline</h2>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Self-paced lessons, guided practice, and a final review or project.</p>
                <Link href={`/courses/${course.slug}/reader`} className="bg-[#1738a8] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#102a80]">Open course reader &amp; grades</Link>
              </div>
              <ol className="mt-4 divide-y divide-slate-100 border border-slate-200 bg-white shadow-sm">
                {course.modules.map((module, index) => {
                  const totalWeeks = Number.parseInt(course.duration, 10) || course.modules.length;
                  const week = Math.max(1, Math.ceil(((index + 1) / course.modules.length) * totalWeeks));
                  return (
                    <li key={module} className="flex items-start gap-3 px-4 py-3">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center bg-[#e9eef5] text-[11px] font-bold text-[#1738a8]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1 text-[13px] leading-6 text-slate-700">
                        <Link href={`/courses/${course.slug}/lessons/${index}`} className="hover:text-[#1738a8] hover:underline">{module}</Link>
                        
                      </span>
                      <span className="shrink-0 whitespace-nowrap pt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">Week {week}</span>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                ['Self-paced', `Work through ${course.modules.length} modules around your own week.`],
                ['Tutor check-ins', 'A subject tutor reviews your work and answers questions.'],
                ['Practical project', 'Finish with a portfolio-ready project and feedback.'],
                ['Completion record', 'Receive a completion record once you meet the threshold.'],
              ].map(([title, detail]) => (
                <div key={title} className="border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-[13px] font-bold text-[#1738a8]">{title}</p>
                  <p className="mt-1 text-[12px] leading-5 text-slate-600">{detail}</p>
                </div>
              ))}
            </section>

            <section className="mt-8 border-l-4 border-[#1738a8] bg-[#f7f8fc] p-5">
              <h2 className="text-base font-bold text-slate-900">Completion outcome</h2>
              <p className="mt-2 text-[13px] leading-6 text-slate-600">{course.outcome}</p>
              <p className="mt-3 text-[11px] leading-5 text-slate-500">
                Duration and study hours are planning estimates, not accredited credit-hour claims. Complete the learning materials, submit the required exercises and meet the assessment threshold to receive a completion record.
              </p>
            </section>

            <CourseReviews course={course} />

            <section className="mt-8">
              <h2 className="text-xl font-bold text-slate-900">Questions about this course</h2>
              <div className="mt-4 divide-y divide-slate-100 border border-slate-200 bg-white shadow-sm">
                {[
                  ['Do I need to apply before enrolling?', 'No. You can enrol straight from this page; admitted students need nothing extra. New students should also complete the admissions application so we can create your school record.'],
                  ['How much time should I plan each week?', `Around ${Math.max(2, Math.round(course.hours / 8))} hours over ${course.duration}. Module activities are short so they fit around school work.`],
                  ['Can I change course later?', 'Yes. Withdraw from your student space and enrol again at any time — your progress on other courses is untouched.'],
                  ['Who do I contact for help?', 'Use the course tutor check-in, the DAMMI AI study buddy, or open a support ticket from the Contact page.'],
                ].map(([question, answer]) => (
                  <details key={question} className="group px-4 py-3.5">
                    <summary className="cursor-pointer list-none text-[13px] font-semibold text-slate-800 marker:content-none">
                      <span className="flex items-center justify-between gap-3">
                        {question}
                        <span aria-hidden="true" className="text-slate-400 transition group-open:rotate-45">+</span>
                      </span>
                    </summary>
                    <p className="mt-2 text-[12px] leading-6 text-slate-600">{answer}</p>
                  </details>
                ))}
              </div>
            </section>

            <StudyBuddy course={course} />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
            <CourseDetailActions course={course} />

            <div className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-400">What you need</p>
              <ul className="mt-2 space-y-2 text-[12px] leading-5 text-slate-600">
                <li className="flex gap-2"><span className="text-[#1738a8]">✓</span>A phone, tablet or laptop with internet access</li>
                <li className="flex gap-2"><span className="text-[#1738a8]">✓</span>Around {Math.max(2, Math.round(course.hours / 8))} hours of study each week</li>
                <li className="flex gap-2"><span className="text-[#1738a8]">✓</span>No prior qualification — beginners are welcome</li>
              </ul>
            </div>

            {related.length > 0 && (
              <div className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-400">More in {course.category}</p>
                <div className="mt-2">
                  {related.map(item => (
                    <CourseRow key={item.slug} course={item} href={`/courses/${item.slug}`} />
                  ))}
                </div>
                <Link href="/courses" className="mt-3 inline-block text-[12px] font-bold text-[#1738a8] hover:underline">
                  Browse all {courses.length} courses →
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-[#f7f8fc]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-[12px] text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-4">
            <Image src="/brand/logo-blue.png" alt="Daily Essential School" width={1000} height={280} className="h-auto w-[104px] object-contain" />
            <span>© 2026 Daily Essential School</span>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/courses" className="hover:text-[#1738a8]">Courses</Link>
            <Link href="/admissions" className="hover:text-[#1738a8]">Admissions</Link>
            <Link href="/privacy" className="hover:text-[#1738a8]">Privacy</Link>
            <Link href="/contact" className="hover:text-[#1738a8]">Contact</Link>
          </nav>
        </div>
      </footer>
      <CoursesAssistant />
    </main>
  );
}
