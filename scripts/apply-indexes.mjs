import { readFile } from 'node:fs/promises';

/**
 * Adds database indexes (and creates the learning classes) for the queries the app runs most.
 * Safe to run repeatedly: existing indexes are skipped, nothing is deleted.
 *
 *   npm run db:indexes            apply
 *   npm run db:indexes -- --dry   show what would change
 */
for (const file of ['../.dev.vars', '../.env.local']) {
  const text = await readFile(new URL(file, import.meta.url), 'utf8').catch(() => '');
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const url = (process.env.PARSE_SERVER_URL || '').replace(/\/$/, '');
const appId = process.env.PARSE_APPLICATION_ID;
const masterKey = process.env.PARSE_MASTER_KEY;
const dry = process.argv.includes('--dry');
if (!url || !appId || !masterKey) throw new Error('Set PARSE_SERVER_URL, PARSE_APPLICATION_ID and PARSE_MASTER_KEY first.');

const headers = { 'X-Parse-Application-Id': appId, 'X-Parse-Master-Key': masterKey, 'Content-Type': 'application/json' };
const api = (path, init = {}) => fetch(`${url}${path}`, { ...init, headers });

const S = { type: 'String' };
const N = { type: 'Number' };

/** class -> { fields (created only if the class is missing), indexes } */
const plan = {
  CourseEnrollment: { indexes: { by_student_course: { studentEmail: 1, courseSlug: 1 }, by_student: { studentEmail: 1 } } },
  CourseReview: { indexes: { by_course: { courseSlug: 1 }, by_course_student: { courseSlug: 1, studentEmail: 1 } } },
  ActivitySubmission: {
    fields: { studentEmail: S, studentName: S, courseSlug: S, courseTitle: S, lessonIndex: N, kind: S, taskKey: S, text: S, answers: S, score: N, maxScore: N, status: S, marks: N, maxMarks: N, feedback: S, gradedBy: S, gradedAt: S, submittedAt: S },
    indexes: { by_student: { studentEmail: 1 }, by_student_lesson: { studentEmail: 1, courseSlug: 1, lessonIndex: 1 }, by_queue: { status: 1, kind: 1 } },
  },
  StaffMessage: {
    fields: { studentEmail: S, studentName: S, kind: S, subject: S, courseSlug: S, courseTitle: S, lessonIndex: N, submissionId: S, status: S, thread: S, lastAt: S, unreadStaff: { type: 'Boolean' }, unreadStudent: { type: 'Boolean' } },
    indexes: { by_student: { studentEmail: 1 }, by_status: { status: 1 } },
  },
  CourseContent: { fields: { courseSlug: S, lessonIndex: N, content: S, updatedBy: S }, indexes: { by_module: { courseSlug: 1, lessonIndex: 1 } } },
  CourseAssignment: {
    fields: { title: S, description: S, courseSlug: S, courseTitle: S, dueAt: S, maxMarks: N, status: S, createdBy: S, createdByEmail: S },
    indexes: { by_status: { status: 1 }, by_course: { courseSlug: 1 } },
  },
  AssignmentSubmission: {
    fields: { assignmentId: S, assignmentTitle: S, courseSlug: S, studentEmail: S, studentName: S, fileUrl: S, fileName: S, note: S, status: S, marks: N, maxMarks: N, feedback: S, gradedBy: S, gradedAt: S, submittedAt: S, late: { type: 'Boolean' } },
    indexes: { by_assignment: { assignmentId: 1 }, by_student: { studentEmail: 1 }, by_assignment_student: { assignmentId: 1, studentEmail: 1 } },
  },
  StudyNote: {
    fields: { studentEmail: S, courseSlug: S, courseTitle: S, lessonIndex: N, title: S, content: S, source: S, createdAtIso: S },
    indexes: { by_student_lesson: { studentEmail: 1, courseSlug: 1, lessonIndex: 1 } },
  },
  TranslationCache: { fields: { locale: S, source: S, value: S }, indexes: { by_locale_source: { locale: 1, source: 1 } } },
  Notification: { indexes: { by_recipient: { recipient: 1 } } },
  StudentProfile: { indexes: { by_email: { email: 1 }, by_student_id: { studentId: 1 } } },
  SupportTicket: { indexes: { by_status: { status: 1 } } },
  AdmissionApplication: { indexes: { by_reference: { reference: 1 }, by_guardian: { guardianEmail: 1 } } },
  AILog: { indexes: { by_user_feature: { userId: 1, feature: 1 } } },
};

for (const [className, spec] of Object.entries(plan)) {
  const existing = await api(`/schemas/${className}`);
  if (existing.status === 404 || existing.status === 400) {
    if (!spec.fields) { console.log(`- ${className}: class does not exist yet, skipped`); continue; }
    console.log(`${dry ? '(dry) would create' : 'creating'} ${className}`);
    if (!dry) {
      const created = await api('/schemas', { method: 'POST', body: JSON.stringify({ className, fields: spec.fields, indexes: spec.indexes }) });
      console.log(created.ok ? `  ✓ ${className} created with indexes` : `  ✗ ${className}: ${created.status} ${await created.text()}`);
    }
    continue;
  }
  if (!existing.ok) { console.log(`  ✗ ${className}: ${existing.status} ${await existing.text()}`); continue; }

  const schema = await existing.json();
  const have = new Set(Object.keys(schema.indexes || {}));
  const missing = Object.fromEntries(Object.entries(spec.indexes).filter(([name]) => !have.has(name)));
  const unknownField = Object.values(missing).flatMap(Object.keys).find(field => !(field in (schema.fields || {})));
  if (unknownField) { console.log(`- ${className}: field "${unknownField}" is not in the schema yet, skipped`); continue; }
  if (!Object.keys(missing).length) { console.log(`✓ ${className}: indexes already present`); continue; }
  console.log(`${dry ? '(dry) would add' : 'adding'} ${Object.keys(missing).join(', ')} on ${className}`);
  if (dry) continue;
  const updated = await api(`/schemas/${className}`, { method: 'PUT', body: JSON.stringify({ className, indexes: missing }) });
  console.log(updated.ok ? `  ✓ ${className}` : `  ✗ ${className}: ${updated.status} ${await updated.text()}`);
}
