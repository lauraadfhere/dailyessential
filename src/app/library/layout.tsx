import type { Metadata } from 'next';
import CourseGate from '../../components/courses/course-gate';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'PDF library',
  description: 'Read the Daily Essential School PDF library in the in-app reader — course packs, revision guides and school documents.',
  robots: { index: false, follow: false },
};

/** The library holds learner material, so it needs a signed-in session like the courses do. */
export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <CourseGate>{children}</CourseGate>;
}
