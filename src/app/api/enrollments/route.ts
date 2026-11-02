import { NextRequest, NextResponse } from 'next/server';
import { getCourse } from '../../../lib/courses-data';
import { hasParseMasterKey, isParseConfigured, parseCreate, parseQuery, parseServerRequest, parseUpdate } from '../../../lib/parse-server';

const CLASS_NAME = 'CourseEnrollment';

type EnrollmentRow = {
  objectId: string;
  studentEmail: string;
  studentName?: string;
  courseSlug: string;
  courseTitle: string;
  status?: string;
  progress?: number;
  completedLessons?: string;
  lastLesson?: number;
  timeSpent?: number;
  enrolledAt?: string | { iso?: string };
  createdAt?: string | { iso?: string };
};

function iso(value?: string | { iso?: string }) {
  if (!value) return '';
  return typeof value === 'string' ? value : value.iso || '';
}

function parseCompletedLessons(raw?: string) {
  try {
    const list = JSON.parse(raw || '[]');
    return Array.isArray(list) ? list.filter(item => Number.isInteger(item)) : [];
  } catch {
    return [];
  }
}

function mapRow(row: EnrollmentRow) {
  return {
    id: row.objectId,
    studentEmail: row.studentEmail,
    studentName: row.studentName || '',
    courseSlug: row.courseSlug,
    courseTitle: row.courseTitle,
    status: row.status || 'active',
    progress: row.progress ?? 0,
    completedLessons: parseCompletedLessons(row.completedLessons),
    lastLesson: row.lastLesson ?? 0,
    timeSpent: row.timeSpent ?? 0,
    enrolledAt: iso(row.enrolledAt) || iso(row.createdAt),
  };
}

/** Parse creates classes on first write when the master key is available; retry once after creating the schema. */
async function ensureSchema() {
  if (!hasParseMasterKey()) return;
  try {
    await parseServerRequest(`schemas/${CLASS_NAME}`, {
      method: 'POST',
      body: JSON.stringify({
        className: CLASS_NAME,
        fields: {
          studentEmail: { type: 'String' },
          studentName: { type: 'String' },
          courseSlug: { type: 'String' },
          courseTitle: { type: 'String' },
          status: { type: 'String' },
          progress: { type: 'Number' },
          completedLessons: { type: 'String' },
          lastLesson: { type: 'Number' },
          timeSpent: { type: 'Number' },
          enrolledAt: { type: 'String' },
        },
      }),
    });
  } catch {
    /* schema already exists or cannot be created — the write retry will surface the real error */
  }
}

export async function GET(request: NextRequest) {
  if (!isParseConfigured()) {
    return NextResponse.json({ enrollments: [], configured: false, source: 'unconfigured' });
  }
  try {
    const { searchParams } = request.nextUrl;
    const email = (searchParams.get('email') || '').trim().toLowerCase();
    const all = searchParams.get('all') === '1';
    const limit = Math.min(Number(searchParams.get('limit') || 200), 500);

    if (!all && !email) {
      return NextResponse.json({ error: 'An email or all=1 is required', enrollments: [] }, { status: 400 });
    }

    const where: Record<string, unknown> = {};
    if (!all) where.studentEmail = email;

    const data = await parseQuery<EnrollmentRow>(CLASS_NAME, {
      where: JSON.stringify(where),
      limit,
      order: '-createdAt',
    });

    return NextResponse.json({
      enrollments: (data.results || []).map(mapRow),
      configured: true,
      source: 'parse',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load enrolments', enrollments: [] },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isParseConfigured()) {
    return NextResponse.json({ error: 'Enrolments are unavailable until the school database is configured.' }, { status: 503 });
  }
  try {
    const body = (await request.json()) as { email?: string; name?: string; courseSlug?: string };
    const email = (body.email || '').trim().toLowerCase();
    const course = body.courseSlug ? getCourse(body.courseSlug) : undefined;

    if (!email || !email.includes('@')) return NextResponse.json({ error: 'A valid student email is required.' }, { status: 400 });
    if (!course) return NextResponse.json({ error: 'Unknown course.' }, { status: 404 });

    const existing = await parseQuery<EnrollmentRow>(CLASS_NAME, {
      where: JSON.stringify({ studentEmail: email, courseSlug: course.slug }),
      limit: 1,
    });

    const found = existing.results?.[0];
    if (found) {
      if ((found.status || 'active') === 'active' || found.status === 'completed') {
        return NextResponse.json({ enrollment: mapRow(found), alreadyEnrolled: true });
      }
      // Re-enrolling keeps earlier progress.
      await parseUpdate(CLASS_NAME, found.objectId, { status: 'active', progress: found.progress ?? 0 });
      return NextResponse.json({ enrollment: mapRow({ ...found, status: 'active' }), alreadyEnrolled: false });
    }

    const payload = {
      studentEmail: email,
      studentName: (body.name || '').trim(),
      courseSlug: course.slug,
      courseTitle: course.title,
      status: 'active',
      progress: 0,
      completedLessons: '[]',
      lastLesson: 0,
      timeSpent: 0,
      enrolledAt: new Date().toISOString(),
    };

    let created: { objectId: string; createdAt: string };
    try {
      created = await parseCreate(CLASS_NAME, payload);
    } catch {
      await ensureSchema();
      created = await parseCreate(CLASS_NAME, payload);
    }

    return NextResponse.json({
      enrollment: mapRow({ ...payload, objectId: created.objectId, createdAt: created.createdAt }),
      alreadyEnrolled: false,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not complete enrolment' },
      { status: 500 },
    );
  }
}

/** Lesson progress for an enrolled student: mark a lesson complete/uncomplete, or record the last lesson opened. */
export async function PATCH(request: NextRequest) {
  if (!isParseConfigured()) {
    return NextResponse.json({ error: 'Progress is unavailable until the school database is configured.' }, { status: 503 });
  }
  try {
    const body = (await request.json()) as { email?: string; courseSlug?: string; lessonIndex?: number; action?: 'complete' | 'uncomplete' | 'open' | 'time'; minutes?: number };
    const email = (body.email || '').trim().toLowerCase();
    const course = body.courseSlug ? getCourse(body.courseSlug) : undefined;
    const lessonIndex = Number(body.lessonIndex);
    if (!email || !course) return NextResponse.json({ error: 'email and courseSlug are required' }, { status: 400 });
    if (body.action === 'time') {
      // Time is added in small steps; one request can never add more than 30 minutes.
      const minutes = Math.min(30, Math.max(0, Math.round(Number(body.minutes) || 0)));
      if (!minutes) return NextResponse.json({ error: 'minutes must be a positive number.' }, { status: 400 });
      const record = await parseQuery<EnrollmentRow>(CLASS_NAME, { where: JSON.stringify({ studentEmail: email, courseSlug: course.slug }), limit: 1 });
      const found = record.results?.[0];
      if (!found || !['active', 'completed'].includes(found.status || 'active')) {
        return NextResponse.json({ error: 'You are not enrolled in this course.' }, { status: 403 });
      }
      const timeSpent = (found.timeSpent ?? 0) + minutes;
      await parseUpdate(CLASS_NAME, found.objectId, { timeSpent });
      return NextResponse.json({ enrollment: mapRow({ ...found, timeSpent }) });
    }
    if (!Number.isInteger(lessonIndex) || lessonIndex < 0 || lessonIndex >= course.modules.length) {
      return NextResponse.json({ error: 'Unknown lesson.' }, { status: 400 });
    }

    const record = await parseQuery<EnrollmentRow>(CLASS_NAME, {
      where: JSON.stringify({ studentEmail: email, courseSlug: course.slug }),
      limit: 1,
    });
    const found = record.results?.[0];
    if (!found || !['active', 'completed'].includes(found.status || 'active')) {
      return NextResponse.json({ error: 'You are not enrolled in this course.' }, { status: 403 });
    }

    const completed = new Set(parseCompletedLessons(found.completedLessons));
    if (body.action === 'complete') completed.add(lessonIndex);
    if (body.action === 'uncomplete') completed.delete(lessonIndex);
    const completedList = [...completed].filter(index => index < course.modules.length).sort((a, b) => a - b);
    const progress = Math.round((completedList.length / course.modules.length) * 100);
    const status = progress === 100 ? 'completed' : 'active';
    const lastLesson = body.action === 'complete' || body.action === 'uncomplete' ? (found.lastLesson ?? 0) : lessonIndex;
    const completedJson = JSON.stringify(completedList);

    await parseUpdate(CLASS_NAME, found.objectId, {
      completedLessons: completedJson,
      progress,
      status,
      lastLesson,
    });

    return NextResponse.json({
      enrollment: mapRow({ ...found, status, progress, completedLessons: completedJson, lastLesson }),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not save progress' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isParseConfigured()) {
    return NextResponse.json({ error: 'Enrolments are unavailable until the school database is configured.' }, { status: 503 });
  }
  try {
    const { searchParams } = request.nextUrl;
    const id = (searchParams.get('id') || '').trim();
    const email = (searchParams.get('email') || '').trim().toLowerCase();
    if (!id || !email) return NextResponse.json({ error: 'id and email are required' }, { status: 400 });

    const record = await parseQuery<EnrollmentRow>(CLASS_NAME, {
      where: JSON.stringify({ objectId: id, studentEmail: email }),
      limit: 1,
    });
    if (!record.results?.[0]) return NextResponse.json({ error: 'Enrolment not found' }, { status: 404 });

    // Progress is kept on the record so re-enrolling resumes where the student stopped.
    await parseUpdate(CLASS_NAME, id, { status: 'withdrawn' });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not withdraw from the course' },
      { status: 500 },
    );
  }
}
