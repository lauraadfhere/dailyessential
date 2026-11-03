import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '../../../lib/email/mailer';
import { admissionUpdateEmail } from '../../../lib/email/templates';
import { clientKey, getSession, rateLimit, roleOf } from '../../../lib/authz';
import { hasParseMasterKey, isParseConfigured, parseCreate, parseQuery, parseServerRequest, parseUpdate } from '../../../lib/parse-server';

/** Administrators are identified by a verified server session (cookie or session-token header). */
async function isAdminRequest(request: NextRequest) {
  return roleOf(await getSession(request)) === 'admin';
}

const CLASS_NAME = 'AdmissionApplication';
const REQUIRED_DOCUMENTS = ['birth-certificate', 'report-card', 'passport-photo', 'guardian-id'];

type DocumentRow = { type: string; label?: string; url: string; publicId?: string; uploadedAt?: string };

type ApplicationBody = {
  childName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  grade?: string;
  guardianName?: string;
  guardianRelationship?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  emergencyContact?: string;
  previousSchool?: string;
  lastClassCompleted?: string;
  reasonForLeaving?: string;
  medicalNotes?: string;
  notes?: string;
  documents?: DocumentRow[];
};

const statusStages = ['DRAFT', 'SUBMITTED', 'DOCS_REVIEW', 'MORE_INFO', 'TEST_PENDING', 'SHORTLISTED', 'WAITLISTED', 'OFFERED', 'ENROLLED', 'REJECTED'] as const;
const MIN_AGE_YEARS = 3;

function ageInYears(dateOfBirth: string) {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

async function ensureSchema() {
  if (!hasParseMasterKey()) return;
  try {
    await parseServerRequest(`schemas/${CLASS_NAME}`, {
      method: 'POST',
      body: JSON.stringify({
        className: CLASS_NAME,
        fields: {
          reference: { type: 'String' },
          childName: { type: 'String' },
          dateOfBirth: { type: 'String' },
          gender: { type: 'String' },
          nationality: { type: 'String' },
          address: { type: 'String' },
          grade: { type: 'String' },
          guardianName: { type: 'String' },
          guardianRelationship: { type: 'String' },
          guardianEmail: { type: 'String' },
          guardianPhone: { type: 'String' },
          emergencyContact: { type: 'String' },
          previousSchool: { type: 'String' },
          lastClassCompleted: { type: 'String' },
          reasonForLeaving: { type: 'String' },
          medicalNotes: { type: 'String' },
          notes: { type: 'String' },
          documents: { type: 'Array' },
          status: { type: 'String' },
          docsComplete: { type: 'Boolean' },
        },
      }),
    });
  } catch {
    /* class already exists */
  }
}

export async function GET(request: NextRequest) {
  if (!isParseConfigured()) return NextResponse.json({ applications: [], configured: false });
  const reference = (request.nextUrl.searchParams.get('reference') || '').trim().toUpperCase();
  const email = (request.nextUrl.searchParams.get('email') || '').trim().toLowerCase();
  const all = request.nextUrl.searchParams.get('all') === '1';
  if (!reference && !email && !all) return NextResponse.json({ error: 'reference or email is required' }, { status: 400 });
  if (all && !(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Administrator sign-in required.' }, { status: 403 });
  }
  // Looking up by email would let anyone enumerate other families' applications; only the owner or an admin may.
  if (!all && !reference) {
    const session = await getSession(request);
    if (!session || (session.email !== email && roleOf(session) !== 'admin')) {
      return NextResponse.json({ error: 'Sign in with that email address to see its applications.', applications: [] }, { status: 403 });
    }
  }

  try {
    const where = all ? {} : reference ? { reference } : { guardianEmail: email };
    const data = await parseQuery<{
      objectId: string;
      reference: string;
      childName: string;
      grade: string;
      guardianName?: string;
      guardianEmail?: string;
      status: string;
      docsComplete?: boolean;
      documents?: DocumentRow[];
      createdAt?: string;
    }>(CLASS_NAME, { where: JSON.stringify(where), limit: all ? 60 : 5, order: '-createdAt' });

    return NextResponse.json({
      applications: (data.results || []).map(row => ({
        id: row.objectId,
        reference: row.reference,
        childName: row.childName,
        grade: row.grade,
        guardianName: row.guardianName || '',
        guardianEmail: row.guardianEmail || '',
        status: row.status,
        docsComplete: Boolean(row.docsComplete),
        documents: row.documents || [],
        createdAt: row.createdAt,
      })),
      configured: true,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not load applications' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isParseConfigured()) {
    return NextResponse.json({ error: 'Applications are unavailable until the school database is configured.' }, { status: 503 });
  }
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Administrator sign-in required.' }, { status: 403 });
  }
  try {
    const body = (await request.json()) as { id?: string; status?: string; note?: string };
    const id = (body.id || '').trim();
    const status = (body.status || '').trim().toUpperCase();
    if (!id || !statusStages.includes(status as (typeof statusStages)[number])) {
      return NextResponse.json({ error: 'A valid application id and status are required.' }, { status: 400 });
    }
    const existing = await parseServerRequest<{ reference: string; guardianEmail: string; childName: string; status: string }>(
      `classes/${CLASS_NAME}/${encodeURIComponent(id)}`,
    );
    await parseUpdate(CLASS_NAME, id, {
      status,
      ...(body.note ? { adminNote: String(body.note).slice(0, 1000) } : {}),
    });
    if (existing.status !== status) {
      await sendMail(existing.guardianEmail, admissionUpdateEmail({ guardianName: 'parent or guardian', childName: existing.childName, reference: existing.reference, status }));
      const { results: guardians } = await parseQuery<{ objectId: string }>('_User', {
        where: JSON.stringify({ email: existing.guardianEmail }),
        limit: 1,
      });
      if (guardians[0]) {
        const label = status.replace(/_/g, ' ').toLowerCase();
        await parseCreate('Notification', {
          type: 'announcement',
          title: `Application ${existing.reference}: ${label}`,
          message: `Update for ${existing.childName}: the application is now ${label}.`,
          priority: 'normal',
          sourceType: 'AdmissionApplication',
          sourceId: id,
          recipient: { __type: 'Pointer', className: '_User', objectId: guardians[0].objectId },
        });
      }
    }
    return NextResponse.json({ id, status });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not update the application' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isParseConfigured()) {
    return NextResponse.json({ error: 'Applications are unavailable until the school database is configured.' }, { status: 503 });
  }
  if (!rateLimit(`admission:${clientKey(request)}`, 6, 30 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many submissions from this connection. Please try again later.' }, { status: 429 });
  }

  try {
    const body = (await request.json()) as ApplicationBody;
    const childName = (body.childName || '').trim();
    const guardianName = (body.guardianName || '').trim();
    const guardianEmail = (body.guardianEmail || '').trim().toLowerCase();
    const guardianPhone = (body.guardianPhone || '').trim();
    const grade = (body.grade || '').trim();

    if (!childName || !guardianName || !guardianPhone || !grade) {
      return NextResponse.json({ error: 'Child name, grade, guardian name and phone are required.' }, { status: 400 });
    }
    if (!guardianEmail.includes('@')) {
      return NextResponse.json({ error: 'Enter a valid guardian email address.' }, { status: 400 });
    }
    const dateOfBirth = (body.dateOfBirth || '').trim();
    if (dateOfBirth) {
      const age = ageInYears(dateOfBirth);
      if (age === null) return NextResponse.json({ error: 'Enter a valid date of birth.' }, { status: 400 });
      if (age < MIN_AGE_YEARS) {
        return NextResponse.json({ error: `The child must be at least ${MIN_AGE_YEARS} years old to apply.` }, { status: 400 });
      }
    }
    const duplicate = await parseQuery<{ objectId: string }>(CLASS_NAME, {
      where: JSON.stringify({
        childName,
        grade,
        guardianEmail,
        status: { $nin: ['REJECTED', 'ENROLLED'] },
      }),
      limit: 1,
    });
    if (duplicate.results?.length) {
      return NextResponse.json({ error: 'An active application for this child and grade already exists.' }, { status: 409 });
    }

    const documents = (body.documents || [])
      .filter(doc => doc && doc.url && doc.type)
      .map(doc => ({
        type: String(doc.type).slice(0, 60),
        label: String(doc.label || doc.type).slice(0, 120),
        url: String(doc.url).slice(0, 600),
        publicId: doc.publicId ? String(doc.publicId).slice(0, 300) : '',
        uploadedAt: doc.uploadedAt || new Date().toISOString(),
      }));

    const uploadedTypes = new Set(documents.map(doc => doc.type));
    const missing = REQUIRED_DOCUMENTS.filter(type => !uploadedTypes.has(type));
    if (missing.length) {
      return NextResponse.json(
        { error: `Upload the required documents before submitting: ${missing.join(', ').replace(/-/g, ' ')}.`, missing },
        { status: 400 },
      );
    }

    const suffix = Array.from(crypto.getRandomValues(new Uint8Array(4)), byte => (byte % 36).toString(36)).join('').toUpperCase();
    const reference = `DE-${new Date().getFullYear()}-${suffix}`;

    const payload = {
      reference,
      childName: childName.slice(0, 120),
      dateOfBirth: (body.dateOfBirth || '').slice(0, 20),
      gender: (body.gender || '').slice(0, 20),
      nationality: (body.nationality || '').slice(0, 80),
      address: (body.address || '').slice(0, 300),
      grade,
      guardianName: guardianName.slice(0, 120),
      guardianRelationship: (body.guardianRelationship || '').slice(0, 40),
      guardianEmail,
      guardianPhone: guardianPhone.slice(0, 40),
      emergencyContact: (body.emergencyContact || '').slice(0, 160),
      previousSchool: (body.previousSchool || '').slice(0, 160),
      lastClassCompleted: (body.lastClassCompleted || '').slice(0, 80),
      reasonForLeaving: (body.reasonForLeaving || '').slice(0, 300),
      medicalNotes: (body.medicalNotes || '').slice(0, 1000),
      notes: (body.notes || '').slice(0, 2000),
      documents,
      status: 'SUBMITTED' as (typeof statusStages)[number],
      docsComplete: true,
    };

    let created: { objectId: string; createdAt: string };
    try {
      created = await parseCreate(CLASS_NAME, payload);
    } catch {
      await ensureSchema();
      created = await parseCreate(CLASS_NAME, payload);
    }

    return NextResponse.json({
      application: {
        id: created.objectId,
        ...payload,
        createdAt: created.createdAt,
      },
      nextStage: 'Assessment booking',
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not submit the application' }, { status: 500 });
  }
}
