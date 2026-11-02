import Image from 'next/image';
import Link from 'next/link';

const portals = [
  {
    role: 'Student',
    href: '/login/student',
    destination: '/student/dashboard',
    email: 'student@bifti.school',
    password: 'BiftiStudent!2026',
    access: ['Courses & learning plan', 'Exams and results', 'Profile & notifications', 'Latest news'],
  },
  {
    role: 'Teacher',
    href: '/login/teacher',
    destination: '/teacher',
    email: 'teacher@bifti.school',
    password: 'BiftiTeacher!2026',
    access: ['Shared Disqus-style console', 'Action queue', 'Search students', 'Assign marks', 'Evaluation & progress tracking'],
  },
  {
    role: 'Examiner',
    href: '/login/examiner',
    destination: '/examiner',
    email: 'examiner@bifti.school',
    password: 'BiftiExaminer!2026',
    access: ['Shared Disqus-style console', 'Papers to grade', 'Results review', 'Question bank', 'Quality control'],
  },
  {
    role: 'Admin',
    href: '/admin/login',
    destination: '/admin',
    email: 'admin@bifti.school',
    password: 'BiftiAdmin!2026',
    access: ['Shared Disqus-style console', 'Moderate evaluations', 'Lesson subscriptions', 'Publish news', 'Analytics & settings'],
    dedicated: true,
  },
];

export const metadata = {
  title: 'Portal access',
  description: 'Role-based access links and demo credentials for Daily Essential School portals.',
  alternates: { canonical: 'https://dailyessential.ca/access' },
};

export default function AccessPage() {
  return (
    <main className="min-h-screen bg-[#f4f5fa] text-slate-900">
      <header className="h-[58px] bg-[#1738a8] text-white sm:h-[62px]">
        <div className="mx-auto flex h-full max-w-[1100px] items-center justify-between gap-3 px-4 sm:px-5">
          <Link href="/" aria-label="Daily Essential School home">
            <Image src="/brand/logo-white.png" alt="Daily Essential School" width={120} height={48} className="h-8 w-auto object-contain sm:h-9" />
          </Link>
          <Link href="/" className="text-xs font-semibold text-white/90 hover:text-white sm:text-sm">Back to home</Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1100px] px-4 py-8 sm:px-5 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#1738a8]">Role access</p>
        <h1 className="mt-2 text-2xl font-bold text-[#15133d] sm:text-3xl">Sign in by role</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Each portal has a dedicated login path. Administrators use a separate Admin login page; students, teachers and examiners use the school portal.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {portals.map(portal => (
            <article key={portal.role} className={`rounded-lg border bg-white p-4 shadow-sm sm:p-6 ${portal.dedicated ? 'border-[#2e9fff]' : 'border-slate-200'}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#15133d] sm:text-xl">{portal.role}</h2>
                  {portal.dedicated && <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#2e9fff]">Dedicated admin login</p>}
                </div>
                <Link href={portal.href} className={`self-start rounded px-3 py-2 text-xs font-bold text-white ${portal.dedicated ? 'bg-[#2e9fff]' : 'bg-[#1738a8]'}`}>
                  Open login
                </Link>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Demo credentials</p>
              <p className="mt-1 text-sm text-slate-700">{portal.email}</p>
              <p className="text-sm text-slate-700">{portal.password}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">After login</p>
              <p className="mt-1 text-sm text-[#1738a8]">{portal.destination}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                {portal.access.map(item => (
                  <li key={item}>› {item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
