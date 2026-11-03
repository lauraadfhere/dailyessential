import { NextRequest, NextResponse } from 'next/server';
import { isResponse, requireUser } from '../../../lib/authz';
import { getCourse } from '../../../lib/courses-data';
import { hasParseMasterKey, isParseConfigured, parseCreate, parseQuery, parseServerRequest, parseUpdate } from '../../../lib/parse-server';

const CLASS_NAME = 'CourseReview';

type ReviewRow = {
  objectId: string;
  courseSlug: string;
  courseTitle?: string;
  studentEmail: string;
  studentName?: string;
  rating: number;
  comment: string;
  createdAt?: string | { iso?: string };
  updatedAt?: string | { iso?: string };
};

function iso(value?: string | { iso?: string }) {
  if (!value) return '';
  return typeof value === 'string' ? value : value.iso || '';
}

function mapRow(row: ReviewRow) {
  return {
    id: row.objectId,
    courseSlug: row.courseSlug,
    courseTitle: row.courseTitle || getCourse(row.courseSlug)?.title || '',
    studentName: row.studentName || 'Student',
    rating: Number(row.rating) || 0,
    comment: row.comment || '',
    createdAt: iso(row.createdAt),
  };
}

async function ensureSchema() {
  if (!hasParseMasterKey()) return;
  try {
    await parseServerRequest(`schemas/${CLASS_NAME}`, {
      method: 'POST',
      body: JSON.stringify({
        className: CLASS_NAME,
        fields: {
          courseSlug: { type: 'String' },
          courseTitle: { type: 'String' },
          studentEmail: { type: 'String' },
          studentName: { type: 'String' },
          rating: { type: 'Number' },
          comment: { type: 'String' },
        },
      }),
    });
  } catch {
    /* already created */
  }
}

export async function GET(request: NextRequest) {
  const session = await requireUser(request, { reviews: [] });
  if (isResponse(session)) return session;
  if (!isParseConfigured()) return NextResponse.json({ reviews: [], summary: { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] }, configured: false });

  try {
    const { searchParams } = request.nextUrl;
    const courseSlug = (searchParams.get('course') || '').trim();
    if (!courseSlug) return NextResponse.json({ error: 'course is required', reviews: [] }, { status: 400 });

    const data = await parseQuery<ReviewRow>(CLASS_NAME, {
      where: JSON.stringify({ courseSlug }),
      limit: 100,
      order: '-createdAt',
    });

    const reviews = (data.results || []).map(mapRow);
    const count = reviews.length;
    const average = count ? reviews.reduce((total, row) => total + row.rating, 0) / count : 0;
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(row => {
      const index = Math.min(Math.max(Math.round(row.rating), 1), 5) - 1;
      distribution[index] += 1;
    });

    return NextResponse.json({
      reviews,
      summary: { average: Math.round(average * 10) / 10, count, distribution },
      configured: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load reviews', reviews: [], summary: { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] } },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await requireUser(request);
  if (isResponse(session)) return session;
  if (!isParseConfigured()) return NextResponse.json({ error: 'Reviews are unavailable until the school database is configured.' }, { status: 503 });

  try {
    const body = (await request.json()) as { courseSlug?: string; email?: string; name?: string; rating?: number; comment?: string };
    const course = body.courseSlug ? getCourse(body.courseSlug) : undefined;
    const email = session.email;
    const rating = Number(body.rating);
    const comment = (body.comment || '').trim();

    if (!course) return NextResponse.json({ error: 'Unknown course.' }, { status: 404 });
    if (!email || !email.includes('@')) return NextResponse.json({ error: 'Sign in to review a course.' }, { status: 400 });
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: 'Choose a rating from 1 to 5 stars.' }, { status: 400 });
    if (comment.length < 3) return NextResponse.json({ error: 'Write at least a few words about the course.' }, { status: 400 });
    if (comment.length > 1000) return NextResponse.json({ error: 'Keep the review under 1000 characters.' }, { status: 400 });

    // Only learners who are (or were) enrolled can review a course.
    const enrolment = await parseQuery<{ objectId: string }>('CourseEnrollment', {
      where: JSON.stringify({ courseSlug: course.slug, studentEmail: email }),
      limit: 1,
      keys: 'objectId',
    }).catch(() => ({ results: [] as { objectId: string }[] }));
    if (!enrolment.results.length) return NextResponse.json({ error: 'Enrol in this course before reviewing it.' }, { status: 403 });

    const existing = await parseQuery<ReviewRow>(CLASS_NAME, {
      where: JSON.stringify({ courseSlug: course.slug, studentEmail: email }),
      limit: 1,
    });

    const payload = {
      courseSlug: course.slug,
      courseTitle: course.title,
      studentEmail: email,
      studentName: (session.displayName || body.name || 'Student').trim().slice(0, 80),
      rating,
      comment,
    };

    const found = existing.results?.[0];
    if (found) {
      await parseUpdate(CLASS_NAME, found.objectId, payload);
      return NextResponse.json({ review: mapRow({ ...found, ...payload, objectId: found.objectId }), updated: true });
    }

    let created: { objectId: string; createdAt: string };
    try {
      created = await parseCreate(CLASS_NAME, payload);
    } catch {
      await ensureSchema();
      created = await parseCreate(CLASS_NAME, payload);
    }

    return NextResponse.json({ review: mapRow({ ...payload, objectId: created.objectId, createdAt: created.createdAt }), updated: false });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save the review' }, { status: 500 });
  }
}
