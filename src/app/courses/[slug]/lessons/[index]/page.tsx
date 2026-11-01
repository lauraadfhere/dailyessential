import Link from 'next/link';
import { notFound } from 'next/navigation';
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
      <div className="border-b border-slate-200 bg-white px-4 py-3 text-sm sm:px-9">
        <div className="mx-auto max-w-6xl">
          <Link href={`/courses/${course.slug}`} className="font-semibold text-[#1738a8] hover:underline">← {course.title}</Link>
        </div>
      </div>
      <LessonView course={course} lessonIndex={lessonIndex} />
    </main>
  );
}
