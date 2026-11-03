/**
 * End-to-end check of sign-in, authorization and the learning flow against a running server.
 *
 *   node scripts/test-flows.mjs --base http://localhost:3001
 *   node scripts/test-flows.mjs --base https://<your-worker>.workers.dev
 *
 * Uses the demo accounts from USERS.md. It enrols the demo student in one course and writes one
 * quiz result and one task, which is harmless on the demo data.
 */
const base = (process.argv[process.argv.indexOf('--base') + 1] || 'http://localhost:3001').replace(/\/$/, '');
const accounts = {
  student: ['student@bifti.school', 'BiftiStudent!2026'],
  teacher: ['teacher@bifti.school', 'BiftiTeacher!2026'],
  admin: ['admin@bifti.school', 'BiftiAdmin!2026'],
};

let failed = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failed += 1;
  console.log(`${ok ? '  ✓' : '  ✗'} ${name}${detail ? `  (${detail})` : ''}`);
};

async function call(path, { cookie = '', method = 'GET', body } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    redirect: 'manual',
    headers: { ...(cookie ? { cookie } : {}), ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* html */ }
  return { status: response.status, json, text, headers: response.headers };
}

async function login(role) {
  const [username, password] = accounts[role];
  const response = await call('/api/auth/login', { method: 'POST', body: { username, password } });
  const set = response.headers.get('set-cookie') || '';
  const cookie = set.split(',').map(part => part.split(';')[0].trim()).find(part => part.startsWith('bifti_session=')) || '';
  return { ...response, cookie };
}

console.log(`Testing ${base}\n\nAnonymous visitors`);
for (const path of ['/api/students', '/api/admin/overview', '/api/recovery', '/api/notifications', '/api/enrollments?email=student@bifti.school', '/api/progress/report', '/api/activities', '/api/courses/lesson?slug=physics&index=0', '/api/documents', '/api/tickets']) {
  const response = await call(path);
  check(`${path} is refused`, response.status === 401, `HTTP ${response.status}`);
}
const page = await call('/courses');
check('/courses page does not render the catalogue to visitors', !/Skills that carry into real life/.test(page.text));
check('/api/media/upload refuses restricted folders', (await call('/api/media/upload', { method: 'POST' })).status !== 200);

console.log('\nSign-in');
const student = await login('student');
check('student can sign in', student.status === 200 && Boolean(student.cookie), `HTTP ${student.status}`);
check('session cookie is HttpOnly', /httponly/i.test(student.headers.get('set-cookie') || ''));
check('wrong password is rejected', (await call('/api/auth/login', { method: 'POST', body: { username: accounts.student[0], password: 'nope-nope' } })).status === 401);
if (!student.cookie) { console.log('\nCannot continue without a student session.'); process.exit(1); }
const teacher = await login('teacher');
const admin = await login('admin');
check('teacher can sign in', Boolean(teacher.cookie));
check('admin can sign in', Boolean(admin.cookie));

console.log('\nAuthorization');
check('student cannot list students', (await call('/api/students', { cookie: student.cookie })).status === 403);
check('student cannot open admin overview', (await call('/api/admin/overview', { cookie: student.cookie })).status === 403);
check('student cannot grade work', (await call('/api/activities', { cookie: student.cookie, method: 'PATCH', body: { id: 'x', marks: 5 } })).status === 403);
check('student cannot list all enrolments', (await call('/api/enrollments?all=1', { cookie: student.cookie })).status === 403);
check('teacher can list students', (await call('/api/students?limit=3', { cookie: teacher.cookie })).status === 200);
check('teacher cannot open admin overview', (await call('/api/admin/overview', { cookie: teacher.cookie })).status === 403);
check('admin can open admin overview', (await call('/api/admin/overview', { cookie: admin.cookie })).status === 200);
check('student cannot run staff AI marking', (await call('/api/ai/evaluate', { cookie: student.cookie, method: 'POST', body: { role: 'teacher', email: 'teacher@bifti.school', question: 'q', answer: 'a', rubric: [{ criterion: 'x', max: 5 }] } })).status === 403);

console.log('\nLearning flow');
const enrol = await call('/api/enrollments', { cookie: student.cookie, method: 'POST', body: { courseSlug: 'physics', name: 'Demo' } });
check('student can enrol', enrol.status === 200, `HTTP ${enrol.status} ${enrol.json?.error || ''}`);
const lesson = await call('/api/courses/lesson?slug=physics&index=0', { cookie: student.cookie });
check('lesson loads for a signed-in student', lesson.status === 200 && Boolean(lesson.json?.lesson));
const keys = JSON.stringify(lesson.json?.lesson?.activities || {});
check('answer keys are not sent to students', !/"answer"/.test(keys));
const staffLesson = await call('/api/courses/lesson?slug=physics&index=0', { cookie: teacher.cookie });
check('answer keys are available to staff', /"answer"/.test(JSON.stringify(staffLesson.json?.lesson?.activities || {})));

const quiz = await call('/api/activities', { cookie: student.cookie, method: 'POST', body: { courseSlug: 'physics', lessonIndex: 0, kind: 'quiz', qcm: [0, 0, 0, 0, 0], fill: ['', '', '', '', ''] } });
check('quiz is graded on the server', quiz.status === 200 && typeof quiz.json?.score === 'number', `score ${quiz.json?.score}/${quiz.json?.max}`);
const task = await call('/api/activities', { cookie: student.cookie, method: 'POST', body: { courseSlug: 'physics', lessonIndex: 0, kind: 'task', taskKey: 'practical', text: 'Automated test submission for the grading flow.' } });
check('task can be submitted', task.status === 200 && Boolean(task.json?.id), `HTTP ${task.status} ${task.json?.error || ''}`);

const queue = await call('/api/activities?queue=1', { cookie: teacher.cookie });
const mine = (queue.json?.submissions || []).find(row => row.id === task.json?.id);
check('teacher sees it in the grading queue', Boolean(mine));
if (task.json?.id) {
  const bad = await call('/api/activities', { cookie: teacher.cookie, method: 'PATCH', body: { id: task.json.id, marks: 99, maxMarks: 10 } });
  check('marks above the maximum are rejected', bad.status === 400);
  const graded = await call('/api/activities', { cookie: teacher.cookie, method: 'PATCH', body: { id: task.json.id, marks: 8, maxMarks: 10, feedback: 'Good work (automated test).' } });
  check('teacher can grade it', graded.status === 200, `HTTP ${graded.status} ${graded.json?.error || ''}`);
}

const report = await call('/api/progress/report', { cookie: student.cookie });
const physics = report.json?.courses?.find(row => row.slug === 'physics');
check('progress report is built', report.status === 200 && Boolean(physics), `HTTP ${report.status}`);
check('report shows the teacher grade', physics?.taskPercent === 80, `task ${physics?.taskPercent}%`);
check('report lists what is still to do', Array.isArray(report.json?.todo) && report.json.todo.length > 0);

console.log('\nTracking, messages and content editing');
const weekly = report.json?.weekly;
check('report has an 8-week timeline', Array.isArray(weekly) && weekly.length === 8);
check('report has totals and activity', Boolean(report.json?.totals) && Array.isArray(report.json?.activity));
const insights = await call('/api/ai/insights', { cookie: student.cookie });
check('insights return strengths, weaknesses and suggestions', insights.status === 200 && Array.isArray(insights.json?.suggestions) && insights.json.suggestions.length > 0 && Array.isArray(insights.json?.strengths), `HTTP ${insights.status} ai=${insights.json?.ai}`);

const dispute = await call('/api/messages', { cookie: student.cookie, method: 'POST', body: { kind: 'mark-dispute', submissionId: task.json?.id, body: 'I believe my practical activity deserves a higher mark (automated test).' } });
check('student can report a graded mark', dispute.status === 200 || dispute.status === 409, `HTTP ${dispute.status} ${dispute.json?.error || ''}`);
const fake = await call('/api/messages', { cookie: student.cookie, method: 'POST', body: { kind: 'mark-dispute', submissionId: 'does-not-exist', body: 'This should be rejected by the server.' } });
check('reporting someone else\'s / unknown work is rejected', fake.status === 400);
const question = await call('/api/messages', { cookie: student.cookie, method: 'POST', body: { kind: 'question', subject: 'Test question', body: 'Could you explain module one again? (automated test)' } });
check('student can message teachers', question.status === 200 && Boolean(question.json?.id), `HTTP ${question.status} ${question.json?.error || ''}`);
const inbox = await call('/api/messages', { cookie: teacher.cookie });
const thread = (inbox.json?.messages || []).find(item => item.id === question.json?.id);
check('teacher sees the message', Boolean(thread));
const studentInbox = await call('/api/messages', { cookie: student.cookie });
check('student only sees own conversations', (studentInbox.json?.messages || []).every(item => item.studentEmail === 'student@bifti.school'));
if (thread) {
  const answer = await call('/api/messages', { cookie: teacher.cookie, method: 'PATCH', body: { id: thread.id, action: 'reply', text: 'Of course, see the lesson summary (automated test).' } });
  check('teacher can reply', answer.status === 200);
  check('student cannot reply as staff', (await call('/api/messages', { cookie: student.cookie, method: 'PATCH', body: { id: thread.id, text: 'hello again' } })).json?.status === 'open');
  await call('/api/messages', { cookie: teacher.cookie, method: 'PATCH', body: { id: thread.id, action: 'resolve' } });
}

const edit = await call('/api/admin/course-content?slug=physics&index=0', { cookie: admin.cookie });
check('admin can load a module for editing', edit.status === 200 && Boolean(edit.json?.lesson));
check('teacher cannot edit course content', (await call('/api/admin/course-content?slug=physics&index=0', { cookie: teacher.cookie })).status === 403);
const original = edit.json?.lesson;
if (original) {
  const marker = `Edited by automated test ${Date.now()}`;
  const saved = await call('/api/admin/course-content', { cookie: admin.cookie, method: 'PUT', body: { slug: 'physics', index: 0, lesson: { ...original, whyItMatters: marker } } });
  check('admin can save an edit', saved.status === 200, `HTTP ${saved.status} ${saved.json?.error || ''}`);
  const seen = await call('/api/courses/lesson?slug=physics&index=0', { cookie: student.cookie });
  check('learners see the edit immediately', seen.json?.lesson?.whyItMatters === marker);
  const reverted = await call('/api/admin/course-content?slug=physics&index=0', { cookie: admin.cookie, method: 'DELETE' });
  check('admin can revert to the original', reverted.status === 200);
  const back = await call('/api/courses/lesson?slug=physics&index=0', { cookie: student.cookie });
  check('original text is restored', back.json?.lesson?.whyItMatters !== marker);
}
for (const page of ['/student/track', '/student/messages']) {
  const response = await call(page, { cookie: student.cookie });
  check(`${page} opens for a signed-in student`, response.status === 200 && !/Sign in to open courses/.test(response.text));
  check(`${page} is closed to visitors`, /Sign in to open courses/.test((await call(page)).text));
}

console.log('\nMarks out of 20');
check('course marks use the /20 scale', typeof physics?.grade?.mark === 'number' && physics.grade.mark <= 20 && Math.abs(physics.grade.mark - physics.grade.percent / 5) < 0.11, `${physics?.grade?.percent}% -> ${physics?.grade?.mark}/20`);
check('overall mark is /20 with an appreciation', typeof report.json?.overall?.mark === 'number' && Boolean(report.json?.overall?.label));

console.log('\nAssignments (PDF hand-in, marks and notes)');
const title = `Automated test assignment ${Date.now()}`;
const made = await call('/api/assignments', { cookie: teacher.cookie, method: 'POST', body: { title, description: 'Upload any PDF.', courseSlug: 'physics', maxMarks: 20 } });
check('teacher can post an assignment', made.status === 200 && Boolean(made.json?.id), `HTTP ${made.status} ${made.json?.error || ''}`);
check('student cannot post an assignment', (await call('/api/assignments', { cookie: student.cookie, method: 'POST', body: { title: 'x'.repeat(5) } })).status === 403);
const listed = await call('/api/assignments', { cookie: student.cookie });
check('student sees it', (listed.json?.assignments || []).some(item => item.id === made.json?.id));

const pdf = new Blob([`%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF`], { type: 'application/pdf' });
const form = new FormData();
form.append('file', pdf, 'test-assignment.pdf');
form.append('folder', 'assignments');
form.append('resourceType', 'raw');
const uploadRes = await fetch(`${base}/api/media/upload`, { method: 'POST', headers: { cookie: student.cookie }, body: form });
const uploaded = await uploadRes.json().catch(() => ({}));
check('student can upload a PDF', uploadRes.status === 200 && /^https:\/\/res\.cloudinary\.com\//.test(uploaded.url || ''), `HTTP ${uploadRes.status} ${uploaded.error || ''}`);
check('visitors cannot upload to assignments', (await fetch(`${base}/api/media/upload`, { method: 'POST', body: (() => { const f = new FormData(); f.append('file', pdf, 'x.pdf'); f.append('folder', 'assignments'); return f; })() })).status === 401);
check('arbitrary links are refused as a hand-in', (await call('/api/assignments/submissions', { cookie: student.cookie, method: 'POST', body: { assignmentId: made.json?.id, fileUrl: 'https://evil.example/x.pdf' } })).status === 400);
const handIn = await call('/api/assignments/submissions', { cookie: student.cookie, method: 'POST', body: { assignmentId: made.json?.id, fileUrl: uploaded.url, fileName: 'test-assignment.pdf', note: 'Automated test' } });
check('student can hand in', handIn.status === 200 && Boolean(handIn.json?.id), `HTTP ${handIn.status} ${handIn.json?.error || ''}`);
const staffView = await call(`/api/assignments/submissions?assignmentId=${made.json?.id}`, { cookie: teacher.cookie });
check('teacher sees the hand-in', (staffView.json?.submissions || []).some(item => item.id === handIn.json?.id));
check('marks above the maximum are refused', (await call('/api/assignments/submissions', { cookie: teacher.cookie, method: 'PATCH', body: { id: handIn.json?.id, marks: 25 } })).status === 400);
check('student cannot grade', (await call('/api/assignments/submissions', { cookie: student.cookie, method: 'PATCH', body: { id: handIn.json?.id, marks: 20 } })).status === 403);
const gradedHandIn = await call('/api/assignments/submissions', { cookie: teacher.cookie, method: 'PATCH', body: { id: handIn.json?.id, marks: 16.5, feedback: 'Clear and well organised (automated test).' } });
check('teacher can mark with notes', gradedHandIn.status === 200);
const after = await call('/api/assignments', { cookie: student.cookie });
const ownHandIn = (after.json?.assignments || []).find(item => item.id === made.json?.id)?.mine;
check('student sees mark and notes', ownHandIn?.marks === 16.5 && /organised/.test(ownHandIn?.feedback || ''));
const notes = await call('/api/notifications', { cookie: student.cookie });
check('student was notified of the new assignment and its mark', (notes.json?.notifications || []).some(item => /New assignment/.test(item.title)) && (notes.json?.notifications || []).some(item => /Assignment graded/.test(item.title)));
const staffNotes = await call('/api/notifications', { cookie: teacher.cookie });
check('teacher was notified of the hand-in', (staffNotes.json?.notifications || []).some(item => /hand-in|handed/i.test(`${item.title} ${item.message}`)));
const target = (notes.json?.notifications || [])[0];
if (target) {
  await call('/api/notifications', { cookie: student.cookie, method: 'PATCH', body: { id: target.id, action: 'read' } });
  const reread = await call('/api/notifications', { cookie: student.cookie });
  check('a notification can be marked read', Boolean((reread.json?.notifications || []).find(item => item.id === target.id)?.readAt));
  check('another user cannot mark it read', !(await call('/api/notifications', { cookie: teacher.cookie, method: 'PATCH', body: { id: target.id, action: 'read' } })).json?.updated);
}
await call('/api/assignments', { cookie: teacher.cookie, method: 'PATCH', body: { id: made.json?.id, status: 'closed' } });
check('a closed assignment refuses new hand-ins', (await call('/api/assignments/submissions', { cookie: student.cookie, method: 'POST', body: { assignmentId: made.json?.id, fileUrl: uploaded.url } })).status === 409);
const afterReport = await call('/api/progress/report', { cookie: student.cookie });
check('graded assignments count toward the course mark', afterReport.json?.courses?.find(row => row.slug === 'physics')?.taskPercent !== null);

console.log('\nStaff profile');
const before = await call('/api/profile', { cookie: teacher.cookie });
check('teacher profile loads from the account', before.status === 200 && before.json?.source === 'staff' && before.json?.profile?.email === 'teacher@bifti.school');
const oldName = before.json?.profile?.fullName;
const renamed = await call('/api/profile', { cookie: teacher.cookie, method: 'PATCH', body: { displayName: 'Mrs. Adebayo (test)', phone: '+213 555 000 000', department: 'Sciences', bio: 'Automated test bio.' } });
check('teacher can edit their profile', renamed.status === 200 && renamed.json?.profile?.fullName === 'Mrs. Adebayo (test)', `HTTP ${renamed.status} ${renamed.json?.error || ''}`);
const reloaded = await call('/api/profile', { cookie: teacher.cookie });
check('the change is saved', reloaded.json?.profile?.fullName === 'Mrs. Adebayo (test)' && reloaded.json?.extra?.department === 'Sciences');
check('arbitrary photo links are refused', (await call('/api/profile', { cookie: teacher.cookie, method: 'PATCH', body: { avatarUrl: 'https://evil.example/a.png' } })).status === 400);
await call('/api/profile', { cookie: teacher.cookie, method: 'PATCH', body: { displayName: oldName || 'Mrs. Adebayo', phone: '', department: '', bio: '' } });
for (const page of ['/teacher/profile', '/admin/profile', '/examiner/profile', '/teacher/assignments', '/student/assignments', '/student/grades', '/notifications']) {
  check(`${page} renders`, (await call(page, { cookie: teacher.cookie })).status === 200);
}

if (process.argv.includes('--ai')) {
  const notesAi = await call('/api/ai/notes', { cookie: student.cookie, method: 'POST', body: { courseSlug: 'physics', lessonIndex: 0 } });
  console.log('\nAI notes');
  check('AI builds notes and guidelines from my mistakes', notesAi.status === 200 && (notesAi.json?.note?.ai?.notes || []).length > 0 && (notesAi.json?.note?.ai?.guidelines || []).length > 0, `HTTP ${notesAi.status} ${notesAi.json?.error || ''} wrong=${notesAi.json?.basedOn?.wrongAnswers}`);
  check('the notes are based on real mistakes', (notesAi.json?.basedOn?.wrongAnswers ?? 0) > 0);
  if (notesAi.json?.note?.id) {
    const saved = await call('/api/notes?courseSlug=physics&lessonIndex=0', { cookie: student.cookie });
    check('notes are saved for the module', (saved.json?.notes || []).some(item => item.id === notesAi.json.note.id));
    check('another user cannot delete my note', (await call(`/api/notes?id=${notesAi.json.note.id}`, { cookie: teacher.cookie, method: 'DELETE' })).status === 404);
    check('I can delete my note', (await call(`/api/notes?id=${notesAi.json.note.id}`, { cookie: student.cookie, method: 'DELETE' })).status === 200);
  }
}

console.log('\nE-mail templates');
const names = ['notification', 'grade', 'assignment', 'notes', 'reply', 'staff-alert', 'enrolment', 'progress', 'admission'];
for (const template of names) {
  const html = await call(`/api/admin/email-preview?t=${template}`, { cookie: admin.cookie });
  check(`template "${template}" renders`, html.status === 200 && /<html/.test(html.text) && html.text.includes('mail@dailyessential.ca') && !/undefined|NaN|\[object/.test(html.text), `HTTP ${html.status}`);
}
check('Arabic template is right-to-left', /dir="rtl"/.test((await call('/api/admin/email-preview?t=grade&lang=ar', { cookie: admin.cookie })).text));
check('grade e-mail shows the mark out of 20', /8\.5\s*\/\s*10/.test((await call('/api/admin/email-preview?t=grade', { cookie: admin.cookie })).text) && /17<span|17\s*<span/.test((await call('/api/admin/email-preview?t=grade', { cookie: admin.cookie })).text));
check('students cannot preview e-mails', (await call('/api/admin/email-preview?t=grade', { cookie: student.cookie })).status === 403);
check('test send explains SMTP is not set up yet', [503, 200].includes((await call('/api/admin/email-preview', { cookie: admin.cookie, method: 'POST', body: { template: 'grade', to: 'admin@bifti.school' } })).status));

const reader = await call('/courses/physics/reader/0', { cookie: student.cookie });
check('signed-in student can open the reader page', reader.status === 200 && !/Sign in to open courses/.test(reader.text));

if (process.argv.includes('--ai')) {
  console.log('\nAI (makes real provider calls)');
  const analyse = await call('/api/ai/course-analyse', { cookie: student.cookie, method: 'POST', body: { courseSlug: 'physics', lessonIndex: 0, mode: 'keypoints' } });
  check('lesson analysis answers', analyse.status === 200 && (analyse.json?.answer || '').length > 40 && !/<think>/i.test(analyse.json?.answer || ''), `HTTP ${analyse.status} ${analyse.json?.error || ''}`);
  const buddy = await call('/api/ai/study-buddy', { cookie: student.cookie, method: 'POST', body: { scope: 'courses', question: 'Which course should I start with to learn coding?' } });
  check('course finder answers', buddy.status === 200 && (buddy.json?.answer || '').length > 20, `HTTP ${buddy.status} ${buddy.json?.error || ''}`);
  const visitor = await call('/api/ai/study-buddy', { method: 'POST', body: { scope: 'courses', question: 'Which course should I start with?' } });
  check('visitors cannot use the course finder', visitor.status === 401);
  const mark = await call('/api/ai/evaluate', { cookie: teacher.cookie, method: 'POST', body: { question: 'What is speed?', answer: 'Speed is distance divided by time.', rubric: [{ criterion: 'Accuracy', max: 5 }] } });
  check('AI marking works for staff', mark.status === 200 && typeof mark.json?.total === 'number', `HTTP ${mark.status} ${mark.json?.error || ''}`);
}

await call('/api/auth/logout', { cookie: student.cookie, method: 'POST' });
console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.');
process.exit(failed ? 1 : 0);
