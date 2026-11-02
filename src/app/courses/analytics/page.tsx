import CourseAnalytics from '../../../components/courses/course-analytics';

export const metadata = {
  title: 'Learning analytics',
  description: 'See how many hours you have studied, by course, module and schedule.',
  robots: { index: false, follow: false },
};

export default function CourseAnalyticsPage() {
  return <CourseAnalytics />;
}
