import { redirect, notFound } from "next/navigation";
import { getCourse } from '../../../../lib/courses-data';

export default async function CourseReaderIndex({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  redirect(`/courses/${course.slug}/reader/0`);
}
