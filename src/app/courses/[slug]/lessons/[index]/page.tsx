import { notFound } from 'next/navigation';
import CoursesAssistant from '../../../../../components/courses/courses-assistant';
import CourseHeader from '../../../../../components/courses/course-header';
import LessonView from '../../../../../components/courses/lesson-view';
import { getCourse } from '../../../../../lib/courses-data';

export async function generateMetadata({ params }: { params: Promise<{ slug: string; index: string }> }) {
  const { slug, index } = await params;
  const course = getCourse(slug);
  if (!course) return { title: 'Lesson not found — Daily Essential School' };
  const lessonNumber = Number(index) + 1;
  return { title: `Lesson ${lessonNumber} · ${course.title} — Daily Essential School` };
}

export default async function CourseLessonPage({ params }: { params: Promise<{ slug: string; index: string }> }) {
  const { slug, index } = await params;
  const course = getCourse(slug);
  const lessonIndex = Number(index);
  if (!course || !Number.isInteger(lessonIndex) || lessonIndex < 0 || lessonIndex >= course.modules.length) notFound();

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <CourseHeader courseTitle={course.title} courseSlug={course.slug} />
      <LessonView course={course} lessonIndex={lessonIndex} />
      <CoursesAssistant />
    </main>
  );
}
