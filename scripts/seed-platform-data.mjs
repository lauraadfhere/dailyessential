import { readFile } from 'node:fs/promises';

const localEnv = await readFile(new URL('../.env.local', import.meta.url), 'utf8').catch(() => '');
for (const line of localEnv.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const url = process.env.PARSE_SERVER_URL;
const appId = process.env.PARSE_APPLICATION_ID;
const masterKey = process.env.PARSE_MASTER_KEY;
if (!url || !appId || !masterKey) throw new Error('Set PARSE_SERVER_URL, PARSE_APPLICATION_ID and PARSE_MASTER_KEY in .env.local');

const base = url.replace(/\/$/, '');
const headers = { 'X-Parse-Application-Id': appId, 'X-Parse-Master-Key': masterKey, 'Content-Type': 'application/json' };

async function api(path, init = {}) {
  const response = await fetch(`${base}/${path.replace(/^\//, '')}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!response.ok && !(response.status === 400 && data?.code === 202)) {
    throw new Error(`${path}: ${response.status} ${text}`);
  }
  return { ok: response.ok, status: response.status, data };
}

async function ensureClassObject(className, where, payload) {
  const query = encodeURIComponent(JSON.stringify(where));
  const existing = await api(`classes/${className}?where=${query}&limit=1`);
  if (existing.data?.results?.length) return existing.data.results[0];
  const created = await api(`classes/${className}`, { method: 'POST', body: JSON.stringify(payload) });
  return created.data;
}

const firstNames = ['Amina','Ibrahim','Chloe','Sara','Kwame','Fatima','Noah','Zainab','Daniel','Maya','Omar','Grace','Tunde','Lila','Hassan','Nina','Emeka','Sofia','Yuri','Ada','Jamal','Helen','Kofi','Ruth','Samir','Elena','Bola','Ivy','Malik','Nora','Pedro','Aisha','Leo','Mariam','Victor','Joy','Idris','Hannah','Felix','Amara','Sean','Blessing','Raj','Cynthia','David','Farah','Paul','Naomi','Andre','Salma'];
const lastNames = ['Ahmed','Yusuf','Nwosu','Okonkwo','Mensah','Diallo','Okoye','Bello','Adeyemi','Kamara','Osei','Traore','Nkrumah','Bakare','Ibrahim','Chen','Santos','Mwangi','Dlamini','Okoro'];
const programmes = ['UI / UX Design','Digital Literacy','Computer Basics','Data Foundations','Creative Media','Robotics Intro'];
const campuses = ['Main Campus','Digital Learning Hub','Evening Programme'];
const classes = ['JSS 2 Blue','JSS 2 Green','SS1 Digital','SS1 Media','JSS 3 Alpha'];
const grades = ['JSS 2','JSS 3','SS 1'];
const modes = ['In person','Online','Hybrid'];

const courses = [
  { title: 'UI / UX Studio', programme: 'UI / UX Design', level: 'Intermediate', summary: 'Studio workshops for interface design and critique.', seats: 24 },
  { title: 'Digital Literacy Path', programme: 'Digital Literacy', level: 'Beginner', summary: 'Core digital skills for school and home.', seats: 40 },
  { title: 'Computer Basics Evening', programme: 'Computer Basics', level: 'Beginner', summary: 'After-hours fundamentals for working learners.', seats: 18 },
  { title: 'Data Foundations', programme: 'Data Foundations', level: 'Intermediate', summary: 'Tables, charts and introductory analysis.', seats: 28 },
  { title: 'Creative Media Lab', programme: 'Creative Media', level: 'Intermediate', summary: 'Visual storytelling and media production.', seats: 20 },
  { title: 'Robotics Intro', programme: 'Robotics Intro', level: 'Beginner', summary: 'Sensors, logic and classroom robotics projects.', seats: 16 },
  { title: 'Web Starter', programme: 'Digital Literacy', level: 'Beginner', summary: 'HTML foundations for young builders.', seats: 30 },
  { title: 'Portfolio Prep', programme: 'UI / UX Design', level: 'Advanced', summary: 'Prepare a school-ready design portfolio.', seats: 14 },
];

console.log('Seeding BIFTI platform data...');

const org = await ensureClassObject('Organization', { name: 'BIFTI School' }, { name: 'BIFTI School', status: 'active' });
const orgPointer = { __type: 'Pointer', className: 'Organization', objectId: org.objectId };
console.log(`Organization: ${org.objectId}`);

for (const campus of campuses) {
  await ensureClassObject('Campus', { name: campus, organization: orgPointer }, { name: campus, organization: orgPointer });
}
console.log(`Campuses: ${campuses.length}`);

const courseIds = [];
for (const course of courses) {
  const coverSeed = course.title.replace(/\s+/g, '-');
  const saved = await ensureClassObject('Course', { title: course.title, organization: orgPointer }, {
    ...course,
    organization: orgPointer,
    status: 'open',
    coverUrl: `https://placehold.co/800x450/1738a8/ffffff/png?text=${encodeURIComponent(coverSeed)}`,
    coverPublicId: `bifti/courses/${coverSeed.toLowerCase()}`,
  });
  courseIds.push(saved);
}
console.log(`Courses: ${courseIds.length}`);

let createdStudents = 0;
const studentProfiles = [];
for (let i = 0; i < 50; i++) {
  const first = firstNames[i % firstNames.length];
  const last = lastNames[i % lastNames.length];
  const fullName = `${first} ${last}`;
  const n = String(i + 1).padStart(3, '0');
  const email = `student${n}@learner.bifti.school`;
  const studentId = `BF-2026-${String(1000 + i)}`;
  const backupSerial = `BFT-SR-${String(50000 + i)}`;
  const barcodeValue = `BFT${String(2026000 + i)}`;
  const classGroup = classes[i % classes.length];
  const programme = programmes[i % programmes.length];
  const campus = campuses[i % campuses.length];
  const gradeLevel = grades[i % grades.length];
  const status = i % 17 === 0 ? 'pending' : i % 23 === 0 ? 'inactive' : 'active';

  const profile = await ensureClassObject('StudentProfile', { studentId }, {
    organization: orgPointer,
    fullName,
    email,
    studentId,
    backupSerial,
    barcodeValue,
    classGroup,
    gradeLevel,
    programme,
    campus,
    status,
    deliveryMode: modes[i % modes.length],
    guardian: `${last} Guardian`,
    guardianEmail: `guardian${n}@family.bifti.school`,
    attendance: `${80 + (i % 20)}%`,
    avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=1738a8&textColor=ffffff`,
    avatarPublicId: `bifti/avatars/${studentId.toLowerCase()}`,
    phone: `+234 80${String(10000000 + i).slice(0, 8)}`,
    country: 'Nigeria',
    address: `${campus}, BIFTI School`,
  });
  studentProfiles.push(profile);
  createdStudents += 1;
}
console.log(`Student profiles: ${createdStudents}`);

// Notifications for first student demo account if present
const demoWhere = encodeURIComponent(JSON.stringify({ email: 'student@bifti.school' }));
const demoUser = await api(`users?where=${demoWhere}&limit=1`);
const recipient = demoUser.data?.results?.[0];
if (recipient) {
  const notes = [
    { type: 'assessment', title: 'New mark published', message: 'UI Critique 1 results are now available.', link: '/student/dashboard', priority: 'normal' },
    { type: 'schedule', title: 'Timetable update', message: 'Digital Literacy moved to Room B2 on Thursday.', link: '/workspace/student/calendar', priority: 'high' },
    { type: 'identity', title: 'ID card ready', message: 'Your student ID, barcode and backup serial are available on your profile.', link: '/student/profile', priority: 'normal' },
    { type: 'general', title: 'Library resources', message: 'New course covers and reading packs were added this week.', link: '/courses', priority: 'low' },
    { type: 'general', title: 'Support tickets open', message: 'You can now submit portal tickets and complaints from Support.', link: '/student/tickets', priority: 'normal' },
  ];
  for (const note of notes) {
    await ensureClassObject('Notification', { title: note.title, recipient: { __type: 'Pointer', className: '_User', objectId: recipient.objectId } }, {
      ...note,
      organization: orgPointer,
      recipient: { __type: 'Pointer', className: '_User', objectId: recipient.objectId },
    });
  }
  console.log('Notifications: seeded for student@bifti.school');
}

const tickets = [
  { subject: 'Cannot open lesson materials', category: 'portal', priority: 'high', status: 'open', message: 'Course resources fail to load after sign-in.', requesterName: 'Amina Ahmed', requesterEmail: 'student@bifti.school' },
  { subject: 'Wrong class on timetable', category: 'academics', priority: 'normal', status: 'in-progress', message: 'Listed in JSS 2 Green instead of JSS 2 Blue.', requesterName: 'Ibrahim Yusuf', requesterEmail: 'student001@learner.bifti.school' },
  { subject: 'Payment receipt missing', category: 'finance', priority: 'normal', status: 'resolved', message: 'Need September subscription receipt.', requesterName: 'Chloe Nwosu', requesterEmail: 'student002@learner.bifti.school' },
];
for (const ticket of tickets) {
  await ensureClassObject('SupportTicket', { subject: ticket.subject, requesterEmail: ticket.requesterEmail }, { ...ticket, organization: orgPointer, assignedRole: 'admin' });
}

const complaints = [
  { subject: 'Lab equipment unavailable', category: 'facilities', status: 'open', message: 'Two workstations offline in Media Lab.', reporterName: 'Sara Okonkwo', reporterEmail: 'student003@learner.bifti.school', confidentiality: false },
  { subject: 'Late feedback on assessment', category: 'academics', status: 'reviewing', message: 'Waiting two weeks for quiz feedback.', reporterName: 'Kwame Mensah', reporterEmail: 'student004@learner.bifti.school', confidentiality: true },
];
for (const complaint of complaints) {
  await ensureClassObject('Complaint', { subject: complaint.subject, reporterEmail: complaint.reporterEmail }, { ...complaint, organization: orgPointer });
}

console.log('Tickets & complaints seeded.');

const learningDocs = [
  {
    title: 'BIFTI Learner Handbook',
    summary: 'Portal access, attendance and school policies for learners.',
    category: 'Handbook',
    programme: 'General',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    filePublicId: 'bifti/docs/learner-handbook',
    pages: 1,
  },
  {
    title: 'Assessment Guidelines',
    summary: 'Marks, evaluations, appeals and examiner workflow.',
    category: 'Assessments',
    programme: 'General',
    fileUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    filePublicId: 'bifti/docs/assessment-guidelines',
    pages: 14,
  },
  {
    title: 'UI / UX Studio Brief',
    summary: 'Studio critique checklist and portfolio submission rules.',
    category: 'Course pack',
    programme: 'UI / UX Design',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    filePublicId: 'bifti/docs/uiux-studio-brief',
    pages: 1,
  },
  {
    title: 'Digital Literacy Reading Pack',
    summary: 'Weekly reading pack for Digital Literacy Path.',
    category: 'Reading',
    programme: 'Digital Literacy',
    fileUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    filePublicId: 'bifti/docs/digital-literacy-pack',
    pages: 14,
  },
];

for (const doc of learningDocs) {
  await ensureClassObject('LearningDocument', { title: doc.title }, {
    ...doc,
    organization: orgPointer,
    resourceType: 'raw',
    mimeType: 'application/pdf',
    status: 'published',
    visibility: 'students',
    uploadedByName: 'BIFTI Library',
  });
}
console.log(`Learning documents: ${learningDocs.length}`);
console.log('✓ Platform seed complete.');
