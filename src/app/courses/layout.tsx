import type { ReactNode } from 'react';
import CourseGate from '../../components/courses/course-gate';

export const dynamic = 'force-dynamic';

export const metadata = { robots: { index: false, follow: false } };

export default function CoursesLayout({ children }: { children: ReactNode }) {
  return <CourseGate>{children}</CourseGate>;
}
