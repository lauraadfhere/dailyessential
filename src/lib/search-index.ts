import { courses } from './courses-data';

export type SearchKind = 'course' | 'person' | 'page';

export type SearchEntry = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  kind: SearchKind;
  keywords: string;
};

const courseEntries: SearchEntry[] = courses.map(course => ({
  id: `course:${course.slug}`,
  title: course.title,
  subtitle: `${course.category} · ${course.modules.length} modules · ${course.hours} hours`,
  href: `/courses/${course.slug}`,
  kind: 'course',
  keywords: [course.description, course.category, course.code, course.outcome, ...course.modules].join(' '),
}));

const peopleEntries: SearchEntry[] = [
  ['Mrs. Adebayo', 'Teacher · Digital Literacy', 'Adebayo teacher digital literacy'],
  ['Mr. Okafor', 'Examination officer · Assessment office', 'Okafor examiner assessment results'],
  ['Principal', 'Academic leadership · School office', 'principal head of school leadership'],
  ['Vice Principal', 'Academic leadership · School office', 'vice principal discipline academics'],
  ['Registrar', 'Operations · Records and enrolment', 'registrar records enrolment transcripts'],
  ['Admissions Officer', 'Operations · Applications and offers', 'admissions officer application offer'],
  ['Librarian', 'Operations · PDF library and reading lists', 'librarian library reading books'],
  ['IT Administrator', 'Operations · Accounts and devices', 'it administrator password account devices'],
  ['Counselor', 'Student support · Wellbeing and guidance', 'counselor wellbeing guidance support'],
  ['Finance Officer', 'Operations · Fees and invoices', 'finance officer fees invoices payments'],
].map(([title, subtitle, keywords]) => ({
  id: `person:${title}`,
  title,
  subtitle,
  href: '/access',
  kind: 'person' as const,
  keywords,
}));

const pageEntries: SearchEntry[] = [
  ['Admissions', 'Apply online, upload documents and track your application.', '/admissions', 'apply application admission form documents entrance'],
  ['Courses', 'The full catalogue of twenty courses with covers and modules.', '/courses', 'courses catalogue programmes modules enrol'],
  ['Pricing', 'Monthly school pricing in Algerian dinar and US dollars.', '/pricing', 'price cost fees monthly dzd usd plan subscription'],
  ['PDF library', 'Lesson notes, past papers and school documents.', '/library', 'library pdf documents notes past papers resources'],
  ['News & updates', 'Term dates, announcements and school events.', '/news', 'news events announcements calendar term'],
  ['Contact & support', 'Reach the school office, admissions or technical support.', '/contact', 'contact support help email phone office'],
  ['DAMMI AI', 'Your study buddy for explanations, hints and revision.', '/dummi-ai', 'ai dammi tutor chat study buddy hints revision'],
  ['Student portal', 'Courses, assignments, grades, ID card and recovery key.', '/login/student', 'student portal login dashboard assignments grades id'],
  ['Teacher portal', 'Classes, planner, marks and evaluations.', '/login/teacher', 'teacher portal login classes planner marks'],
  ['Parent portal', 'Progress, attendance and fee information for guardians.', '/login/parent', 'parent guardian portal fees progress attendance'],
  ['Examiner portal', 'Assessment review, gradebook verification and results.', '/login/examiner', 'examiner portal assessment results verify'],
  ['Admin login', 'School administration, admissions review and publishing.', '/admin/login', 'admin login dashboard management staff'],
  ['Role access & portals', 'Every portal and login the school offers.', '/access', 'access roles portals logins accounts'],
  ['Policies & forms', 'School rules, safeguarding and downloadable forms.', '/policies', 'policy policies rules forms safeguarding handbook'],
  ['Privacy policy', 'How learner data is stored, used and protected.', '/privacy', 'privacy data gdpr security consent'],
  ['Terms of service', 'The agreement that covers platform use.', '/terms', 'terms conditions agreement legal'],
  ['Student ID & recovery key', 'Digital ID card, student number and account recovery.', '/student/id', 'id card qr code recovery key student number'],
  ['My courses', 'Your enrolled courses and module progress.', '/student/courses', 'my courses enrolled progress modules reviews'],
  ['Assignments', 'Everything due, submitted or graded.', '/student/assignments', 'assignments homework submissions due graded'],
  ['Grades', 'Marks per course, term and assessment.', '/student/grades', 'grades marks results report card transcript'],
  ['Timetable', 'Your weekly lessons, rooms and tutors.', '/student/timetable', 'timetable schedule lessons rooms'],
  ['Attendance', 'Register history and attendance rate.', '/student/attendance', 'attendance register absence late'],
  ['Student profile', 'Your details, photo and contact information.', '/student/profile', 'profile photo avatar details contact settings'],
].map(([title, subtitle, href, keywords]) => ({
  id: `page:${href}`,
  title,
  subtitle,
  href,
  kind: 'page' as const,
  keywords,
}));

export const searchIndex: SearchEntry[] = [...courseEntries, ...peopleEntries, ...pageEntries];

function normalise(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Ranked search across courses, people and pages.
 *
 * Every query term has to appear somewhere in the entry, so results stay
 * relevant; title matches outrank keyword matches and courses edge ahead of
 * static pages on a tie because they are the destination people look for most.
 */
export function searchPlatform(query: string, limit = 24): SearchEntry[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const phrase = normalise(trimmed);
  const terms = phrase.split(/\s+/).filter(term => term.length > 1);
  if (!terms.length) return [];

  const ranked: { entry: SearchEntry; score: number }[] = [];

  searchIndex.forEach(entry => {
    const title = normalise(entry.title);
    const body = normalise(`${entry.subtitle} ${entry.keywords}`);
    let score = 0;

    for (const term of terms) {
      const inTitle = title.includes(term);
      const inBody = body.includes(term);
      if (!inTitle && !inBody) {
        score = 0;
        break;
      }
      if (title === phrase) score += 120;
      else if (title.startsWith(term)) score += 45;
      if (inTitle) score += 30;
      if (inBody) score += 10;
      if (entry.kind === 'course') score += 4;
    }

    if (score > 0) ranked.push({ entry, score });
  });

  ranked.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
  return ranked.slice(0, limit).map(item => item.entry);
}
