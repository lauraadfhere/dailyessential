import { NextRequest, NextResponse } from 'next/server';
import { getSession, isStaff } from '../../../../lib/authz';
import { withoutAnswers } from '../../../../lib/lesson-text';
import { getLessonContent } from '../../../../lib/course-content';
import { getCourse } from '../../../../lib/courses-data';

/** Lesson content for signed-in users only. */
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'Sign in to read this lesson.' }, { status: 401 });

  const course = getCourse(request.nextUrl.searchParams.get('slug') || '');
  const index = Number(request.nextUrl.searchParams.get('index'));
  if (!course) return NextResponse.json({ error: 'Unknown course.' }, { status: 404 });
  if (!Number.isInteger(index) || index < 0 || index >= course.modules.length) {
    return NextResponse.json({ error: 'Unknown lesson.' }, { status: 404 });
  }

  const lesson = await getLessonContent(course.title, index, course.slug);
  return NextResponse.json(
    { lesson: lesson && !isStaff(session) ? withoutAnswers(lesson) : lesson },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
