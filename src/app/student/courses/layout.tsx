import type { ReactNode } from 'react';
import CourseGate from '../../../components/courses/course-gate';

export const dynamic = 'force-dynamic';

export default function StudentCoursesLayout({ children }: { children: ReactNode }) {
  return <CourseGate>{children}</CourseGate>;
}
