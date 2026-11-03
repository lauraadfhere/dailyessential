import { courseGuard } from '../../../components/courses/course-gate';
import CourseAnalytics from '../../../components/courses/course-analytics';

export const metadata = {
  title: 'Learning analytics',
  description: 'See how many hours you have studied, by course, module and schedule.',
  robots: { index: false, follow: false },
};

export default async function CourseAnalyticsPage() {
  const blocked = await courseGuard();
  if (blocked) return blocked;
  return <CourseAnalytics />;
}
