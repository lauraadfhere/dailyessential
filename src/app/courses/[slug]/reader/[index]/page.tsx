import Link from 'next/link';
import CoursesAssistant from '../../../../../components/courses/courses-assistant';
import { notFound } from 'next/navigation';
import CourseHeader from '../../../../../components/courses/course-header';
import CourseReader from '../../../../../components/courses/course-reader';
import { getCourse } from '../../../../../lib/courses-data';

export async function generateMetadata({ params }: { params: Promise<{ slug: string; index: string }> }) {
  const { slug, index } = await params;
  const course = getCourse(slug);
  if (!course) return { title: 'Course reader not found — Daily Essential School' };
  return { title: `Module ${Number(index) + 1} · ${course.title} — Daily Essential School` };
}

export default async function CourseReaderPage({ params }: { params: Promise<{ slug: string; index: string }> }) {
  const { slug, index } = await params;
  const course = getCourse(slug);
  const moduleIndex = Number(index);
  if (!course || !Number.isInteger(moduleIndex) || moduleIndex < 0 || moduleIndex >= course.modules.length) notFound();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <CourseHeader courseTitle={course.title} courseSlug={course.slug} section="reader" />
      <CourseReader course={course} lessonIndex={moduleIndex} />
      <CoursesAssistant />
    </main>
  );
}
