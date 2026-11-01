import Image from 'next/image';
import Link from 'next/link';
import CourseCatalog from '../../components/courses/course-catalog';
import { courseCategories, courses, totalLearningHours, totalModules } from '../../lib/courses-data';

export const metadata = {
  title: 'Courses',
  description: 'Twenty career-focused courses in academics, technology, business, design and wellbeing. Enrol online and learn at your own pace.',
  alternates: { canonical: 'https://dailyessential.school/courses' },
};

const stats = [
  { value: String(courses.length), label: 'Courses in the catalogue' },
  { value: `${totalLearningHours}`, label: 'Estimated learning hours' },
  { value: String(totalModules), label: 'Guided modules' },
  { value: '5', label: 'Learning pathways' },
];

export default function CoursesAdvertPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="bg-[#1738a8] px-4 py-3 sm:px-9">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link href="/" aria-label="Daily Essential School home" className="inline-flex w-[132px] shrink-0 items-center sm:w-[168px]">
            <Image src="/brand/logo-white.png" alt="Daily Essential School" width={1000} height={280} priority className="h-auto w-full object-contain" />
          </Link>
          <div className="flex items-center gap-3 text-[12px] font-semibold text-white/90 sm:gap-5 sm:text-[13px]">
            <Link href="/admissions" className="hidden hover:text-white sm:inline">Admissions</Link>
            <Link href="/library" className="hidden hover:text-white md:inline">PDF library</Link>
            <Link href="/dummi-ai" className="hidden hover:text-white md:inline">DAMMI AI</Link>
            <Link href="/login/student" className="border border-white/40 px-3 py-1.5 hover:bg-white/15">Portal login</Link>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-4 py-3 text-sm sm:px-9">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="font-semibold text-[#1738a8] hover:underline">Home</Link>
          <span className="mx-2 text-slate-400">/</span>
          <span>Courses</span>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1738a8]">Daily Essential School / Course catalogue</p>
        <h1 className="mt-3 border-b-4 border-[#1738a8] bg-[#e9eef5] px-4 py-4 text-2xl font-bold text-slate-900 sm:px-5 sm:py-5 sm:text-4xl">
          Skills that carry into real life
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700 sm:mt-6 sm:text-lg sm:leading-8">
          Twenty structured courses — from mathematics and physics to Python, data science, design and entrepreneurship. Each one is built around short modules, practical work and a final project you can show.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(item => (
            <div key={item.label} className="border-l-4 border-[#1738a8] bg-white p-4 shadow-sm">
              <p className="text-2xl font-bold text-slate-900 sm:text-3xl">{item.value}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courseCategories.map(category => (
            <div key={category.key} className="border border-slate-200 bg-white p-4">
              <p className="text-[13px] font-bold text-[#1738a8]">{category.key}</p>
              <p className="mt-1 text-[12px] leading-5 text-slate-600">{category.blurb}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {courses.filter(course => course.category === category.key).length} courses
              </p>
            </div>
          ))}
        </div>

        <CourseCatalog />

        <section className="mt-10 grid gap-4 border border-slate-200 bg-[#f7f8fc] p-5 sm:grid-cols-2 sm:p-7">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Already enrolled?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Open the student portal to pick up lessons, submit assignments and track your module progress. New students start at any term.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/student/courses" className="bg-[#1738a8] px-4 py-2.5 text-[12px] font-bold text-white hover:bg-[#102d88]">Go to my courses</Link>
              <Link href="/admissions" className="border border-slate-300 bg-white px-4 py-2.5 text-[12px] font-bold text-slate-700 hover:border-[#1738a8] hover:text-[#1738a8]">Apply for admission</Link>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">How a course runs</h2>
            <ul className="mt-2 space-y-2 text-[13px] leading-6 text-slate-600">
              <li className="flex gap-2"><span className="font-bold text-[#1738a8]">1.</span>Enrol from any course page — no application fee.</li>
              <li className="flex gap-2"><span className="font-bold text-[#1738a8]">2.</span>Work through modules at your own pace with a tutor check-in.</li>
              <li className="flex gap-2"><span className="font-bold text-[#1738a8]">3.</span>Finish the practical project and receive a completion record.</li>
            </ul>
          </div>
        </section>

        <div className="mt-9 flex flex-wrap gap-5 text-sm font-bold text-[#1738a8]">
          <Link href="/admissions" className="hover:underline">Admissions</Link>
          <Link href="/policies" className="hover:underline">Policies</Link>
          <Link href="/contact" className="hover:underline">Contact us</Link>
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
            <Link href="/library" className="hover:text-[#1738a8]">Library</Link>
            <Link href="/privacy" className="hover:text-[#1738a8]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#1738a8]">Terms</Link>
            <Link href="/contact" className="hover:text-[#1738a8]">Contact</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
