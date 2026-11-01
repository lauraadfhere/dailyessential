/**
 * ATLAS domain data for the Daily Essential School platform.
 *
 * These records back the academic, admissions, attendance, finance, library,
 * wellbeing and governance pages. They mirror the ATLAS specification so each
 * page can be wired to a real data source later without changing the UI shape.
 */

export const academicYears = [
  { id: 'ay-2026', label: '2026 / 2027', start: '1 Sep 2026', end: '16 Jul 2027', status: 'current' },
  { id: 'ay-2025', label: '2025 / 2026', start: '1 Sep 2025', end: '17 Jul 2026', status: 'archived' },
];

export const terms = [
  { id: 'term-1', label: 'Term 1', window: '1 Sep – 11 Dec 2026', weeks: 14, status: 'active' },
  { id: 'term-2', label: 'Term 2', window: '12 Jan – 26 Mar 2027', weeks: 11, status: 'upcoming' },
  { id: 'term-3', label: 'Term 3', window: '19 Apr – 16 Jul 2027', weeks: 12, status: 'upcoming' },
];

export const sectionCatalog = [
  { id: 'sec-j1a', name: 'JSS 1 Amber', grade: 'JSS 1', homeroom: 'Mr. Eze', room: 'B-101', learners: 24, capacity: 30, average: 74 },
  { id: 'sec-j2b', name: 'JSS 2 Blue', grade: 'JSS 2', homeroom: 'Mrs. Adebayo', room: 'B-204', learners: 26, capacity: 30, average: 78 },
  { id: 'sec-j3a', name: 'JSS 3 Coral', grade: 'JSS 3', homeroom: 'Ms. Bello', room: 'B-208', learners: 29, capacity: 30, average: 81 },
  { id: 'sec-s1d', name: 'SS1 Digital', grade: 'SS 1', homeroom: 'Mr. Okafor', room: 'D-302', learners: 22, capacity: 28, average: 76 },
  { id: 'sec-s2b', name: 'SS2 Design', grade: 'SS 2', homeroom: 'Ms. Ibrahim', room: 'D-305', learners: 19, capacity: 26, average: 83 },
];

export const subjectCatalog = [
  { code: 'MTH-10', name: 'Mathematics', department: 'Sciences', credits: 4, hours: 5, level: 'Core' },
  { code: 'ENG-10', name: 'English Language', department: 'Languages', credits: 4, hours: 5, level: 'Core' },
  { code: 'ICT-20', name: 'Digital Literacy', department: 'Computing', credits: 3, hours: 3, level: 'Core' },
  { code: 'UXD-30', name: 'UI / UX Design', department: 'Computing', credits: 3, hours: 4, level: 'Elective' },
  { code: 'CSC-30', name: 'Computer Science', department: 'Computing', credits: 3, hours: 4, level: 'Elective' },
  { code: 'BUS-20', name: 'Business Studies', department: 'Humanities', credits: 3, hours: 3, level: 'Core' },
];

export type AtlasStudentStatus = 'active' | 'pending' | 'inactive';
export type RiskLevel = 'on-track' | 'watch' | 'at-risk';

export type AtlasStudent = {
  id: string;
  name: string;
  email: string;
  studentId: string;
  className: string;
  grade: string;
  programme: string;
  campus: string;
  status: AtlasStudentStatus;
  attendance: number;
  average: number;
  risk: RiskLevel;
  guardian: string;
  guardianEmail: string;
  balance: number;
  joined: string;
  supports: string[];
};

export const atlasStudents: AtlasStudent[] = [
  { id: 'st-1', name: 'Amina Ahmed', email: 'student@bifti.school', studentId: 'BFT-2026-0142', className: 'JSS 2 Blue', grade: 'JSS 2', programme: 'UI / UX Design', campus: 'Main Campus', status: 'active', attendance: 96, average: 88, risk: 'on-track', guardian: 'Hassan Ahmed', guardianEmail: 'hassan.ahmed@email.com', balance: 0, joined: '2 Sep 2026', supports: [] },
  { id: 'st-2', name: 'Ibrahim Yusuf', email: 'ibrahim.y@email.com', studentId: 'BFT-2026-0188', className: 'JSS 2 Blue', grade: 'JSS 2', programme: 'Digital Literacy', campus: 'Digital Learning Hub', status: 'active', attendance: 88, average: 71, risk: 'watch', guardian: 'Mariama Yusuf', guardianEmail: 'mariama.y@email.com', balance: 18500, joined: '4 Sep 2026', supports: ['Reading support'] },
  { id: 'st-3', name: 'Chloe Nwosu', email: 'chloe.n@email.com', studentId: 'BFT-2026-0210', className: 'SS1 Digital', grade: 'SS 1', programme: 'Computer Basics', campus: 'Evening Programme', status: 'pending', attendance: 74, average: 64, risk: 'at-risk', guardian: 'Ngozi Nwosu', guardianEmail: 'ngozi.n@email.com', balance: 42000, joined: '8 Sep 2026', supports: ['Catch-up plan'] },
  { id: 'st-4', name: 'Sara Okonkwo', email: 'sara.o@email.com', studentId: 'BFT-2026-0091', className: 'SS1 Digital', grade: 'SS 1', programme: 'Digital Literacy', campus: 'Main Campus', status: 'active', attendance: 98, average: 91, risk: 'on-track', guardian: 'Chidi Okonkwo', guardianEmail: 'chidi.o@email.com', balance: 0, joined: '1 Sep 2026', supports: ['Extension work'] },
  { id: 'st-5', name: 'Kwame Mensah', email: 'kwame.m@email.com', studentId: 'BFT-2026-0255', className: 'JSS 2 Blue', grade: 'JSS 2', programme: 'Digital Literacy', campus: 'Main Campus', status: 'active', attendance: 91, average: 76, risk: 'on-track', guardian: 'Ama Mensah', guardianEmail: 'ama.m@email.com', balance: 9000, joined: '5 Sep 2026', supports: [] },
  { id: 'st-6', name: 'Fatima Diallo', email: 'fatima.diallo@email.com', studentId: 'BFT-2026-0301', className: 'SS1 Digital', grade: 'SS 1', programme: 'UI / UX Design', campus: 'Digital Learning Hub', status: 'inactive', attendance: 62, average: 58, risk: 'at-risk', guardian: 'Ibrahim Diallo', guardianEmail: 'ibrahim.d@email.com', balance: 61500, joined: '12 Sep 2026', supports: ['Counselling', 'Fee plan'] },
  { id: 'st-7', name: 'Daniel Osei', email: 'daniel.osei@email.com', studentId: 'BFT-2026-0117', className: 'JSS 3 Coral', grade: 'JSS 3', programme: 'Computer Science', campus: 'Main Campus', status: 'active', attendance: 94, average: 84, risk: 'on-track', guardian: 'Grace Osei', guardianEmail: 'grace.osei@email.com', balance: 0, joined: '1 Sep 2026', supports: [] },
  { id: 'st-8', name: 'Zainab Bello', email: 'zainab.b@email.com', studentId: 'BFT-2026-0074', className: 'SS2 Design', grade: 'SS 2', programme: 'UI / UX Design', campus: 'Main Campus', status: 'active', attendance: 97, average: 93, risk: 'on-track', guardian: 'Yusuf Bello', guardianEmail: 'yusuf.bello@email.com', balance: 0, joined: '1 Sep 2026', supports: ['Scholarship'] },
  { id: 'st-9', name: 'Emeka Obi', email: 'emeka.obi@email.com', studentId: 'BFT-2026-0202', className: 'JSS 1 Amber', grade: 'JSS 1', programme: 'Digital Literacy', campus: 'Digital Learning Hub', status: 'active', attendance: 83, average: 69, risk: 'watch', guardian: 'Ada Obi', guardianEmail: 'ada.obi@email.com', balance: 12000, joined: '6 Sep 2026', supports: ['Language support'] },
  { id: 'st-10', name: 'Nadia Kamara', email: 'nadia.k@email.com', studentId: 'BFT-2026-0163', className: 'SS2 Design', grade: 'SS 2', programme: 'UI / UX Design', campus: 'Main Campus', status: 'active', attendance: 92, average: 86, risk: 'on-track', guardian: 'Salif Kamara', guardianEmail: 'salif.k@email.com', balance: 0, joined: '2 Sep 2026', supports: [] },
  { id: 'st-11', name: 'Tunde Balogun', email: 'tunde.b@email.com', studentId: 'BFT-2026-0238', className: 'JSS 3 Coral', grade: 'JSS 3', programme: 'Computer Science', campus: 'Evening Programme', status: 'pending', attendance: 79, average: 72, risk: 'watch', guardian: 'Bisi Balogun', guardianEmail: 'bisi.b@email.com', balance: 24500, joined: '9 Sep 2026', supports: [] },
  { id: 'st-12', name: 'Lina Haddad', email: 'lina.h@email.com', studentId: 'BFT-2026-0055', className: 'SS1 Digital', grade: 'SS 1', programme: 'Digital Literacy', campus: 'Main Campus', status: 'active', attendance: 90, average: 80, risk: 'on-track', guardian: 'Rami Haddad', guardianEmail: 'rami.h@email.com', balance: 0, joined: '1 Sep 2026', supports: [] },
];

export type ApplicationStatus = 'new' | 'review' | 'interview' | 'offer' | 'enrolled' | 'rejected';

export type Application = {
  id: string;
  child: string;
  grade: string;
  guardian: string;
  email: string;
  submitted: string;
  status: ApplicationStatus;
  reviewer: string;
  score: number | null;
  documents: string;
  notes: string;
};

export const applications: Application[] = [
  { id: 'APP-2041', child: 'Halima Sani', grade: 'JSS 1', guardian: 'Aisha Sani', email: 'aisha.sani@email.com', submitted: '28 Oct 2026', status: 'new', reviewer: 'Registrar', score: null, documents: '4 of 5 received', notes: 'Sibling priority — one older sister in JSS 3.' },
  { id: 'APP-2040', child: 'Noah Mensah', grade: 'JSS 2', guardian: 'Kofi Mensah', email: 'kofi.m@email.com', submitted: '27 Oct 2026', status: 'review', reviewer: 'Admissions', score: 82, documents: 'All received', notes: 'Transfer from Accra Grammar. Awaiting maths placement test.' },
  { id: 'APP-2039', child: 'Amara Eze', grade: 'SS 1', guardian: 'Ify Eze', email: 'ify.eze@email.com', submitted: '26 Oct 2026', status: 'interview', reviewer: 'Principal', score: 88, documents: 'All received', notes: 'Interview booked for 4 Nov, 10:00.' },
  { id: 'APP-2038', child: 'Yusuf Lawal', grade: 'JSS 1', guardian: 'Musa Lawal', email: 'musa.lawal@email.com', submitted: '24 Oct 2026', status: 'offer', reviewer: 'Registrar', score: 79, documents: 'All received', notes: 'Offer sent — expires 8 Nov 2026.' },
  { id: 'APP-2037', child: 'Grace Adeyemi', grade: 'SS 2', guardian: 'Tope Adeyemi', email: 'tope.a@email.com', submitted: '22 Oct 2026', status: 'enrolled', reviewer: 'Registrar', score: 90, documents: 'All received', notes: 'Deposit paid. Section: SS2 Design.' },
  { id: 'APP-2036', child: 'Peter Nkemdirim', grade: 'JSS 3', guardian: 'Uche Nkemdirim', email: 'uche.n@email.com', submitted: '20 Oct 2026', status: 'rejected', reviewer: 'Admissions', score: 48, documents: '3 of 5 received', notes: 'Placement test below threshold. Advised to reapply next term.' },
];

export const admissionsFunnel = [
  { label: 'Inquiries', value: 148 },
  { label: 'Applications', value: 96 },
  { label: 'Reviewed', value: 71 },
  { label: 'Interviews', value: 44 },
  { label: 'Offers', value: 31 },
  { label: 'Enrolled', value: 24 },
];

export const applicationChecklist = [
  'Birth certificate verified',
  'Previous school report received',
  'Guardian identity confirmed',
  'Medical and emergency form complete',
  'Placement assessment recorded',
];

export type CourseRecord = {
  id: string;
  title: string;
  code: string;
  teacher: string;
  section: string;
  progress: number;
  nextLesson: string;
  lessons: number;
  completed: number;
};

export const courseCatalog: CourseRecord[] = [
  { id: 'crs-uxd', title: 'UI / UX Design Studio', code: 'UXD-30', teacher: 'Mrs. Adebayo', section: 'SS2 Design', progress: 78, nextLesson: 'Usability testing basics', lessons: 32, completed: 25 },
  { id: 'crs-ict', title: 'Digital Literacy', code: 'ICT-20', teacher: 'Mr. Eze', section: 'JSS 2 Blue', progress: 64, nextLesson: 'Spreadsheets and data', lessons: 28, completed: 18 },
  { id: 'crs-csc', title: 'Computer Science', code: 'CSC-30', teacher: 'Mr. Okafor', section: 'JSS 3 Coral', progress: 71, nextLesson: 'Algorithms in practice', lessons: 30, completed: 21 },
  { id: 'crs-mth', title: 'Mathematics', code: 'MTH-10', teacher: 'Ms. Bello', section: 'JSS 2 Blue', progress: 58, nextLesson: 'Linear equations', lessons: 36, completed: 21 },
  { id: 'crs-eng', title: 'English Language', code: 'ENG-10', teacher: 'Ms. Ibrahim', section: 'JSS 2 Blue', progress: 82, nextLesson: 'Persuasive writing', lessons: 34, completed: 28 },
];

export type AssignmentStatus = 'graded' | 'submitted' | 'pending' | 'late';

export type AssignmentRecord = {
  id: string;
  title: string;
  course: string;
  due: string;
  status: AssignmentStatus;
  score: number | null;
  max: number;
  feedback?: string;
};

export const assignmentRecords: AssignmentRecord[] = [
  { id: 'asg-1', title: 'Usability test report', course: 'UI / UX Design Studio', due: '2 Nov 2026', status: 'pending', score: null, max: 40 },
  { id: 'asg-2', title: 'Wireframe critique response', course: 'UI / UX Design Studio', due: '26 Oct 2026', status: 'submitted', score: null, max: 20 },
  { id: 'asg-3', title: 'Spreadsheet dashboard', course: 'Digital Literacy', due: '29 Oct 2026', status: 'graded', score: 17, max: 20, feedback: 'Clear structure. Add a summary row next time.' },
  { id: 'asg-4', title: 'Linear equations set B', course: 'Mathematics', due: '24 Oct 2026', status: 'late', score: null, max: 25 },
  { id: 'asg-5', title: 'Algorithms worksheet', course: 'Computer Science', due: '30 Oct 2026', status: 'pending', score: null, max: 30 },
  { id: 'asg-6', title: 'Persuasive essay draft', course: 'English Language', due: '21 Oct 2026', status: 'graded', score: 26, max: 30, feedback: 'Strong argument. Tighten the conclusion.' },
];

export const gradeCategories = [
  { name: 'Homework', weight: 20, average: 84 },
  { name: 'Tests', weight: 30, average: 76 },
  { name: 'Project', weight: 20, average: 88 },
  { name: 'Exam', weight: 30, average: 81 },
];

export const gradeBands = [
  { letter: 'A', range: '80 – 100', gpa: 4.0, descriptor: 'Excellent' },
  { letter: 'B', range: '70 – 79', gpa: 3.5, descriptor: 'Very good' },
  { letter: 'C', range: '60 – 69', gpa: 3.0, descriptor: 'Good' },
  { letter: 'D', range: '50 – 59', gpa: 2.0, descriptor: 'Satisfactory' },
  { letter: 'E', range: '40 – 49', gpa: 1.0, descriptor: 'Needs support' },
  { letter: 'F', range: '0 – 39', gpa: 0, descriptor: 'Not yet achieved' },
];

export const gradebookColumns = [
  { id: 'hw1', title: 'Homework 1', max: 20, weight: 10 },
  { id: 'hw2', title: 'Homework 2', max: 20, weight: 10 },
  { id: 'quiz1', title: 'Quiz 1', max: 30, weight: 15 },
  { id: 'proj', title: 'Project', max: 40, weight: 25 },
  { id: 'exam', title: 'Term exam', max: 100, weight: 40 },
];

export const gradebookRows: { id: string; student: string; scores: Record<string, number | null> }[] = [
  { id: 'g1', student: 'Amina Ahmed', scores: { hw1: 18, hw2: 17, quiz1: 27, proj: 36, exam: 84 } },
  { id: 'g2', student: 'Ibrahim Yusuf', scores: { hw1: 14, hw2: 12, quiz1: 19, proj: 28, exam: 61 } },
  { id: 'g3', student: 'Chloe Nwosu', scores: { hw1: 11, hw2: 13, quiz1: 16, proj: 24, exam: 52 } },
  { id: 'g4', student: 'Sara Okonkwo', scores: { hw1: 19, hw2: 20, quiz1: 29, proj: 38, exam: 91 } },
  { id: 'g5', student: 'Kwame Mensah', scores: { hw1: 16, hw2: null, quiz1: 22, proj: 31, exam: 73 } },
  { id: 'g6', student: 'Zainab Bello', scores: { hw1: 20, hw2: 19, quiz1: 30, proj: 39, exam: 94 } },
];

export const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

export const timetableSlots = [
  { day: 'Mon', period: '08:00', subject: 'Mathematics', className: 'JSS 2 Blue', room: 'B-204' },
  { day: 'Mon', period: '09:00', subject: 'English Language', className: 'JSS 2 Blue', room: 'B-204' },
  { day: 'Mon', period: '10:30', subject: 'Digital Literacy', className: 'SS1 Digital', room: 'D-302' },
  { day: 'Mon', period: '12:00', subject: 'UI / UX Design Studio', className: 'SS2 Design', room: 'D-305' },
  { day: 'Tue', period: '08:00', subject: 'Computer Science', className: 'JSS 3 Coral', room: 'D-301' },
  { day: 'Tue', period: '09:00', subject: 'UI / UX Design Studio', className: 'SS2 Design', room: 'D-305' },
  { day: 'Tue', period: '10:30', subject: 'Digital Literacy', className: 'JSS 2 Blue', room: 'B-204' },
  { day: 'Tue', period: '12:00', subject: 'Maths support clinic', className: 'JSS 1 Amber', room: 'B-101' },
  { day: 'Wed', period: '08:00', subject: 'English Language', className: 'SS1 Digital', room: 'D-302' },
  { day: 'Wed', period: '09:00', subject: 'Mathematics', className: 'JSS 2 Blue', room: 'B-204' },
  { day: 'Wed', period: '10:30', subject: 'Department meeting', className: 'Computing', room: 'Staff room' },
  { day: 'Wed', period: '12:00', subject: 'Computer Science', className: 'SS2 Design', room: 'D-301' },
  { day: 'Thu', period: '08:00', subject: 'UI / UX Design Studio', className: 'SS2 Design', room: 'D-305' },
  { day: 'Thu', period: '09:00', subject: 'Digital Literacy', className: 'SS1 Digital', room: 'D-302' },
  { day: 'Thu', period: '10:30', subject: 'Mathematics', className: 'JSS 1 Amber', room: 'B-101' },
  { day: 'Thu', period: '12:00', subject: 'Mentor group', className: 'JSS 2 Blue', room: 'B-204' },
  { day: 'Fri', period: '08:00', subject: 'Computer Science', className: 'JSS 3 Coral', room: 'D-301' },
  { day: 'Fri', period: '09:00', subject: 'English Language', className: 'JSS 2 Blue', room: 'B-204' },
  { day: 'Fri', period: '10:30', subject: 'UI / UX critique', className: 'SS2 Design', room: 'D-305' },
  { day: 'Fri', period: '12:00', subject: 'Clubs & activities', className: 'Whole school', room: 'Hall' },
];

export const timetabledPeriods = ['08:00', '09:00', '10:30', '12:00'];

export const attendanceBySection = [
  { section: 'JSS 1 Amber', present: 22, late: 1, absent: 1, rate: 92 },
  { section: 'JSS 2 Blue', present: 24, late: 2, absent: 0, rate: 96 },
  { section: 'JSS 3 Coral', present: 26, late: 1, absent: 2, rate: 90 },
  { section: 'SS1 Digital', present: 19, late: 2, absent: 1, rate: 86 },
  { section: 'SS2 Design', present: 18, late: 0, absent: 1, rate: 95 },
];

export const attendanceAlerts = [
  { student: 'Chloe Nwosu', rate: 74, pattern: '4 consecutive absences', action: 'Parent meeting due' },
  { student: 'Fatima Diallo', rate: 62, pattern: 'Low Monday attendance', action: 'Tutor check-in sent' },
  { student: 'Emeka Obi', rate: 83, pattern: '3 late arrivals this week', action: 'Attendance letter drafted' },
  { student: 'Tunde Balogun', rate: 79, pattern: 'Missed 2 evening sessions', action: 'Guardian notified' },
];

export const attendanceRegister = [
  { id: 'r1', student: 'Amina Ahmed', status: 'present' },
  { id: 'r2', student: 'Ibrahim Yusuf', status: 'present' },
  { id: 'r3', student: 'Chloe Nwosu', status: 'absent' },
  { id: 'r4', student: 'Sara Okonkwo', status: 'present' },
  { id: 'r5', student: 'Kwame Mensah', status: 'late' },
  { id: 'r6', student: 'Zainab Bello', status: 'present' },
  { id: 'r7', student: 'Daniel Osei', status: 'excused' },
];

export const attendanceTrend = [
  { day: 'Mon', rate: 93 },
  { day: 'Tue', rate: 95 },
  { day: 'Wed', rate: 91 },
  { day: 'Thu', rate: 96 },
  { day: 'Fri', rate: 89 },
];

export type ExamRecord = {
  id: string;
  paper: string;
  level: string;
  date: string;
  room: string;
  candidates: number;
  invigilator: string;
  status: 'scheduled' | 'in-progress' | 'marked' | 'published';
};

export const examSchedule: ExamRecord[] = [
  { id: 'ex-1', paper: 'Mathematics Paper 1', level: 'JSS 2', date: '9 Nov 2026 · 09:00', room: 'Main Hall', candidates: 26, invigilator: 'Ms. Bello', status: 'scheduled' },
  { id: 'ex-2', paper: 'English Language Paper 2', level: 'JSS 2', date: '10 Nov 2026 · 09:00', room: 'Main Hall', candidates: 26, invigilator: 'Ms. Ibrahim', status: 'scheduled' },
  { id: 'ex-3', paper: 'Digital Literacy Practical', level: 'SS 1', date: '11 Nov 2026 · 13:00', room: 'Computer Lab', candidates: 22, invigilator: 'Mr. Eze', status: 'scheduled' },
  { id: 'ex-4', paper: 'UI / UX Portfolio Defence', level: 'SS 2', date: '5 Nov 2026 · 10:00', room: 'Studio D', candidates: 19, invigilator: 'Mrs. Adebayo', status: 'in-progress' },
  { id: 'ex-5', paper: 'Computer Science Paper 1', level: 'JSS 3', date: '2 Nov 2026 · 09:00', room: 'Main Hall', candidates: 29, invigilator: 'Mr. Okafor', status: 'marked' },
];

export const moderationQueue = [
  { id: 'mod-1', course: 'Digital Literacy', section: 'JSS 2 Blue', teacher: 'Mr. Eze', submitted: '27 Oct 2026', sample: '6 scripts', discrepancy: '2 marks', status: 'awaiting review' },
  { id: 'mod-2', course: 'UI / UX Design', section: 'SS2 Design', teacher: 'Mrs. Adebayo', submitted: '26 Oct 2026', sample: '5 projects', discrepancy: '0 marks', status: 'approved' },
  { id: 'mod-3', course: 'Mathematics', section: 'JSS 3 Coral', teacher: 'Ms. Bello', submitted: '25 Oct 2026', sample: '8 scripts', discrepancy: '4 marks', status: 're-mark requested' },
];

export type InvoiceRecord = {
  id: string;
  student: string;
  guardian: string;
  plan: string;
  amount: number;
  paid: number;
  due: string;
  status: 'paid' | 'partial' | 'overdue';
};

export const invoices: InvoiceRecord[] = [
  { id: 'INV-8841', student: 'Amina Ahmed', guardian: 'Hassan Ahmed', plan: 'Term 1 tuition', amount: 145000, paid: 145000, due: '12 Sep 2026', status: 'paid' },
  { id: 'INV-8842', student: 'Ibrahim Yusuf', guardian: 'Mariama Yusuf', plan: 'Term 1 tuition', amount: 145000, paid: 126500, due: '12 Sep 2026', status: 'partial' },
  { id: 'INV-8843', student: 'Chloe Nwosu', guardian: 'Ngozi Nwosu', plan: 'Evening programme', amount: 78000, paid: 36000, due: '5 Oct 2026', status: 'overdue' },
  { id: 'INV-8844', student: 'Sara Okonkwo', guardian: 'Chidi Okonkwo', plan: 'Term 1 tuition', amount: 145000, paid: 145000, due: '12 Sep 2026', status: 'paid' },
  { id: 'INV-8845', student: 'Fatima Diallo', guardian: 'Ibrahim Diallo', plan: 'Term 1 tuition', amount: 145000, paid: 83500, due: '12 Sep 2026', status: 'overdue' },
  { id: 'INV-8846', student: 'Emeka Obi', guardian: 'Ada Obi', plan: 'Digital hub tuition', amount: 98000, paid: 86000, due: '20 Oct 2026', status: 'partial' },
];

export const feePlans = [
  { name: 'Main campus tuition', grades: 'JSS 1 – SS 2', amount: 145000, installments: '3 instalments', uptake: 186 },
  { name: 'Digital hub tuition', grades: 'JSS 1 – SS 2', amount: 98000, installments: '3 instalments', uptake: 74 },
  { name: 'Evening programme', grades: 'JSS 3 – SS 1', amount: 78000, installments: '2 instalments', uptake: 41 },
  { name: 'Transport — Zone B', grades: 'All grades', amount: 32000, installments: 'Per term', uptake: 63 },
];

export const financeAging = [
  { bucket: '0 – 30 days', amount: 61000, share: 34 },
  { bucket: '31 – 60 days', amount: 74000, share: 41 },
  { bucket: '61 – 90 days', amount: 28000, share: 15 },
  { bucket: '90+ days', amount: 18000, share: 10 },
];

export const scholarships = [
  { name: 'STEM Merit Award', student: 'Zainab Bello', value: '50% tuition', status: 'active', renewed: 'Renews Sep 2027' },
  { name: 'Community Service Grant', student: 'Sara Okonkwo', value: '₦40,000 / term', status: 'active', renewed: 'Renews Jan 2027' },
  { name: 'Hardship Bursary', student: 'Chloe Nwosu', value: '30% tuition', status: 'review', renewed: 'Committee review 5 Nov' },
];

export type LibraryItem = {
  id: string;
  title: string;
  author: string;
  type: string;
  subject: string;
  copies: number;
  available: number;
};

export const libraryCatalog: LibraryItem[] = [
  { id: 'lib-1', title: 'Designing Interfaces', author: 'Jenifer Tidwell', type: 'Book', subject: 'UI / UX Design', copies: 6, available: 2 },
  { id: 'lib-2', title: 'Mathematics for Junior Secondary', author: 'Daily Essential Press', type: 'Textbook', subject: 'Mathematics', copies: 30, available: 11 },
  { id: 'lib-3', title: 'Digital Literacy Workbook', author: 'Daily Essential Press', type: 'Workbook', subject: 'Digital Literacy', copies: 25, available: 4 },
  { id: 'lib-4', title: 'Algorithms Unlocked', author: 'Thomas Cormen', type: 'Book', subject: 'Computer Science', copies: 4, available: 1 },
  { id: 'lib-5', title: 'The Writing Life', author: 'Annie Dillard', type: 'E-book', subject: 'English', copies: 999, available: 999 },
  { id: 'lib-6', title: 'Physics Practical Guide', author: 'Daily Essential Science Dept.', type: 'PDF', subject: 'Science', copies: 999, available: 999 },
];

export const bookLoans = [
  { id: 'loan-1', title: 'Designing Interfaces', borrower: 'Amina Ahmed', due: '4 Nov 2026', status: 'on time' },
  { id: 'loan-2', title: 'Algorithms Unlocked', borrower: 'Daniel Osei', due: '29 Oct 2026', status: 'due soon' },
  { id: 'loan-3', title: 'Digital Literacy Workbook', borrower: 'Emeka Obi', due: '21 Oct 2026', status: 'overdue' },
  { id: 'loan-4', title: 'Mathematics for Junior Secondary', borrower: 'Tunde Balogun', due: '1 Nov 2026', status: 'on time' },
];

export const auditEntries = [
  { id: 'AUD-9182', at: '30 Oct 2026 · 09:42', actor: 'Mrs. Adebayo', role: 'Teacher', action: 'Grade published', entity: 'UI / UX Design · SS2 Design', detail: 'Portfolio defence scores released', ip: '10.20.4.18' },
  { id: 'AUD-9181', at: '30 Oct 2026 · 09:10', actor: 'Registrar', role: 'Registrar', action: 'Student record updated', entity: 'BFT-2026-0301', detail: 'Guardian phone number changed', ip: '10.20.4.7' },
  { id: 'AUD-9180', at: '30 Oct 2026 · 08:55', actor: 'Finance Officer', role: 'Finance', action: 'Payment recorded', entity: 'INV-8842', detail: 'Bank transfer ₦18,500 allocated', ip: '10.20.4.22' },
  { id: 'AUD-9179', at: '29 Oct 2026 · 17:31', actor: 'Admin', role: 'School Admin', action: 'Permission changed', entity: 'Substitute teacher · 2 weeks', detail: 'Temporary attendance.edit grant', ip: '10.20.4.2' },
  { id: 'AUD-9178', at: '29 Oct 2026 · 16:04', actor: 'Mr. Okafor', role: 'Examiner', action: 'Result locked', entity: 'Computer Science Paper 1', detail: 'Moderation complete, no changes', ip: '10.20.4.31' },
  { id: 'AUD-9177', at: '29 Oct 2026 · 14:18', actor: 'Chloe Nwosu', role: 'Student', action: 'Login failed', entity: 'Session', detail: '3rd failed attempt, rate limit applied', ip: '102.89.34.12' },
];

export const roleDefinitions = [
  { name: 'School Admin', users: 2, scope: 'Whole school', description: 'Full configuration, publication and records access.' },
  { name: 'Registrar', users: 1, scope: 'Admissions & records', description: 'Applications, enrolment, student records and transcripts.' },
  { name: 'Teacher', users: 18, scope: 'Own classes', description: 'Attendance, marks, assignments and parent communication.' },
  { name: 'Finance Officer', users: 2, scope: 'Finance only', description: 'Invoices, payments, waivers and reconciliation.' },
  { name: 'Counselor', users: 1, scope: 'Assigned cases', description: 'Wellbeing cases, appointments and confidential notes.' },
  { name: 'Librarian', users: 1, scope: 'Library', description: 'Catalogue, loans, reservations and fines.' },
];

export const permissionMatrix = {
  columns: ['Student', 'Parent', 'Teacher', 'HoD', 'Registrar', 'Admin'],
  rows: [
    { label: 'View own marks', grants: [true, false, false, false, false, true] },
    { label: "View child's marks", grants: [false, true, false, false, false, true] },
    { label: 'Enter marks (own classes)', grants: [false, false, true, true, false, true] },
    { label: 'Moderate department marks', grants: [false, false, false, true, false, true] },
    { label: 'Publish report cards', grants: [false, false, false, false, false, true] },
    { label: 'Take attendance', grants: [false, false, true, true, false, true] },
    { label: 'Edit student records', grants: [false, false, false, false, true, true] },
    { label: 'Manage fees', grants: [false, false, false, false, false, true] },
    { label: 'Manage roles & permissions', grants: [false, false, false, false, false, true] },
    { label: 'View confidential wellbeing notes', grants: [false, false, false, false, false, true] },
  ],
};

export const reportLibrary = [
  { name: 'Attendance by section', category: 'Attendance', description: 'Daily and term attendance rates with chronic-absence flags.', schedule: 'Every Monday · 07:00' },
  { name: 'Grade distribution', category: 'Academic', description: 'Score bands per course, section and teacher.', schedule: 'On demand' },
  { name: 'Outstanding fees aging', category: 'Finance', description: 'Unpaid balances grouped by aging bucket and guardian.', schedule: 'Every Friday · 16:00' },
  { name: 'Admissions funnel', category: 'Admissions', description: 'Inquiry-to-enrolment conversion by grade and source.', schedule: 'Monthly' },
  { name: 'Behaviour incidents', category: 'Wellbeing', description: 'Incidents by type, location, time and resolution status.', schedule: 'On demand' },
  { name: 'Library circulation', category: 'Library', description: 'Loans, returns, overdue items and popular titles.', schedule: 'Monthly' },
];

export const scheduledReports = [
  { name: 'Weekly principal digest', recipients: 'Principal, Vice Principal', next: '2 Nov 2026 · 06:00', format: 'PDF + email' },
  { name: 'Finance aging export', recipients: 'Finance Officer', next: '30 Oct 2026 · 16:00', format: 'CSV' },
  { name: 'Attendance statutory return', recipients: 'Ministry portal', next: '1 Dec 2026 · 09:00', format: 'API' },
];

export const schoolEvents = [
  { name: 'Parent–teacher conferences', type: 'Meeting', when: '4 Nov 2026 · 14:00', where: 'Main Hall', owner: 'Class tutors', seats: 120, taken: 86, status: 'open' },
  { name: 'Design showcase', type: 'Exhibition', when: '14 Nov 2026 · 10:00', where: 'Studio D', owner: 'Mrs. Adebayo', seats: 90, taken: 61, status: 'open' },
  { name: 'Inter-house sports', type: 'Sports', when: '21 Nov 2026 · 08:00', where: 'Sports field', owner: 'PE department', seats: 400, taken: 275, status: 'open' },
  { name: 'University visit — Lagos', type: 'Trip', when: '28 Nov 2026 · 07:30', where: 'Off campus', owner: 'Career office', seats: 45, taken: 45, status: 'full' },
  { name: 'Robotics club', type: 'Club', when: 'Every Thursday · 15:00', where: 'Lab 2', owner: 'Mr. Okafor', seats: 24, taken: 19, status: 'open' },
  { name: 'Student council elections', type: 'Election', when: '8 Nov 2026 · 09:00', where: 'Online', owner: 'Student affairs', seats: 320, taken: 0, status: 'scheduled' },
];

export const orientationJourneys = [
  { name: 'New student — Term 1', audience: 'Students', steps: 9, completed: 7, owners: 'Class tutor', status: 'in progress' },
  { name: 'Parent welcome pack', audience: 'Parents', steps: 6, completed: 4, owners: 'Admissions', status: 'in progress' },
  { name: 'New teacher onboarding', audience: 'Staff', steps: 12, completed: 12, owners: 'HR', status: 'complete' },
  { name: 'Mid-year joiner', audience: 'Students', steps: 7, completed: 1, owners: 'Registrar', status: 'queued' },
];

export const orientationChecklist = [
  { label: 'Account activated and first login complete', done: true, owner: 'Student' },
  { label: 'Profile, photo and emergency contacts added', done: true, owner: 'Student' },
  { label: 'Handbook and code of conduct acknowledged', done: true, owner: 'Student + parent' },
  { label: 'Electives and clubs selected', done: false, owner: 'Student' },
  { label: 'Placement tests scheduled', done: true, owner: 'Academics' },
  { label: 'Buddy / mentor assigned', done: false, owner: 'Class tutor' },
  { label: 'Digital ID card issued', done: true, owner: 'Registrar' },
];

export const setupChecklist = [
  { label: 'School profile and branding', done: true },
  { label: 'Campuses, buildings and rooms', done: true },
  { label: 'Academic year and terms', done: true },
  { label: 'Grade levels and sections', done: true },
  { label: 'Subject catalogue and course offerings', done: true },
  { label: 'Grading scales and report templates', done: true },
  { label: 'Fee plans and invoicing rules', done: false },
  { label: 'Notification templates and channels', done: false },
  { label: 'Roles, permissions and delegations', done: false },
  { label: 'Data import and reconciliation', done: false },
];

export const teacherGoals = [
  { title: 'Raise JSS 2 digital literacy pass rate to 90%', progress: 72, due: '15 Dec 2026', status: 'on track' },
  { title: 'Run three peer-observation cycles', progress: 33, due: '26 Jan 2027', status: 'watch' },
  { title: 'Complete inclusive-teaching PD pathway', progress: 100, due: '30 Nov 2026', status: 'complete' },
];

export const observations = [
  { date: '21 Oct 2026', observer: 'Academic Director', focus: 'Questioning and checks for understanding', rating: 'Proficient', notes: 'Strong cold-calling routines; plan for deliberate pair work.' },
  { date: '16 Sep 2026', observer: 'HoD Computing', focus: 'Practical lesson structure', rating: 'Expert', notes: 'Excellent live demonstration and safe lab transitions.' },
  { date: '12 Feb 2026', observer: 'Peer — Ms. Bello', focus: 'Feedback and marking', rating: 'Developing', notes: 'Introduce whole-class feedback to reduce marking load.' },
];

export const professionalDevelopment = [
  { title: 'Inclusive teaching foundations', hours: 6, status: 'complete', provider: 'Daily Essential Academy' },
  { title: 'Designing effective rubrics', hours: 3, status: 'complete', provider: 'Daily Essential Academy' },
  { title: 'Safeguarding refresher', hours: 2, status: 'due 30 Nov', provider: 'School DSL' },
  { title: 'Assessment moderation workshop', hours: 4, status: 'enrolled 12 Nov', provider: 'Exam office' },
];

export const messageThreads = [
  { id: 't1', from: 'Hassan Ahmed', role: 'Parent · Amina', subject: 'Usability test report deadline', preview: 'Amina will be travelling on Friday — can she submit Monday?', when: '09:12', unread: true },
  { id: 't2', from: 'Ibrahim Yusuf', role: 'Student · JSS 2', subject: 'Missed quiz — catch-up', preview: 'Could I redo the spreadsheet quiz during Wednesday clinic?', when: '08:40', unread: true },
  { id: 't3', from: 'Ms. Ibrahim', role: 'Teacher · English', subject: 'Cross-curricular project', preview: 'Can we align the persuasive writing task with the design pitch?', when: 'Yesterday', unread: false },
  { id: 't4', from: 'Registrar', role: 'Office', subject: 'New learner joining JSS 2 Blue', preview: 'Grace Adeyemi starts Monday — seating and buddy needed.', when: 'Yesterday', unread: false },
];

export const parentMeetingSlots = [
  { id: 'm1', time: '14:00', parent: 'Hassan Ahmed', student: 'Amina Ahmed', mode: 'In person', status: 'confirmed' },
  { id: 'm2', time: '14:20', parent: 'Mariama Yusuf', student: 'Ibrahim Yusuf', mode: 'Video call', status: 'confirmed' },
  { id: 'm3', time: '14:40', parent: 'Ngozi Nwosu', student: 'Chloe Nwosu', mode: 'In person', status: 'requested' },
  { id: 'm4', time: '15:00', parent: 'Ada Obi', student: 'Emeka Obi', mode: 'Video call', status: 'available' },
  { id: 'm5', time: '15:20', parent: 'Bisi Balogun', student: 'Tunde Balogun', mode: 'In person', status: 'available' },
];

export const moodWeek = [
  { day: 'Mon', score: 4 },
  { day: 'Tue', score: 3 },
  { day: 'Wed', score: 4 },
  { day: 'Thu', score: 5 },
  { day: 'Fri', score: 4 },
];

export const wellbeingResources = [
  { title: 'Exam stress: a five-minute reset', type: 'Audio · 5 min' },
  { title: 'Talking to a trusted adult', type: 'Guide · 3 min read' },
  { title: 'Sleep and study balance', type: 'Video · 6 min' },
  { title: 'When a friend is struggling', type: 'Guide · 4 min read' },
];

export const counselingCases = [
  { id: 'cs-1', student: 'Fatima Diallo', concern: 'Attendance and anxiety', priority: 'high', next: '5 Nov · 11:00', stage: 'Active support' },
  { id: 'cs-2', student: 'Chloe Nwosu', concern: 'Catch-up stress', priority: 'medium', next: '3 Nov · 14:30', stage: 'Monitoring' },
  { id: 'cs-3', student: 'Emeka Obi', concern: 'Transition to new campus', priority: 'low', next: '12 Nov · 10:00', stage: 'Check-in' },
];

export const behaviourIncidents = [
  { id: 'inc-1', student: 'Tunde Balogun', type: 'Late to class', severity: 'Low', date: '28 Oct 2026', status: 'Resolved with tutor' },
  { id: 'inc-2', student: 'Chloe Nwosu', type: 'Missing homework (repeat)', severity: 'Medium', date: '27 Oct 2026', status: 'Parent contacted' },
  { id: 'inc-3', student: 'Emeka Obi', type: 'Uniform policy', severity: 'Low', date: '24 Oct 2026', status: 'Closed' },
];

export const parentForms = [
  { id: 'f1', title: 'Robotics club trip — consent', child: 'Amina Ahmed', due: '2 Nov 2026', status: 'pending' },
  { id: 'f2', title: 'Photo and media consent renewal', child: 'Amina Ahmed', due: '8 Nov 2026', status: 'pending' },
  { id: 'f3', title: 'Term 1 report acknowledgement', child: 'Amina Ahmed', due: 'Signed 20 Oct 2026', status: 'signed' },
  { id: 'f4', title: 'Medical treatment authorisation', child: 'Amina Ahmed', due: 'Signed 2 Sep 2026', status: 'signed' },
];

export const parentChildren = [
  { id: 'st-1', name: 'Amina Ahmed', className: 'JSS 2 Blue', campus: 'Main Campus', average: 88, attendance: 96, balance: 0, next: 'Mathematics · 08:00 · B-204' },
  { id: 'st-9', name: 'Emeka Obi', className: 'JSS 1 Amber', campus: 'Digital Learning Hub', average: 69, attendance: 83, balance: 12000, next: 'Digital Literacy · 10:30 · D-302' },
];

export const parentAnnouncements = [
  { title: 'Parent–teacher conferences', body: 'Bookings open for 4 November. Slots are released by class tutor.', when: 'Today · 08:00' },
  { title: 'Term 1 report cards', body: 'Reports are published on 11 December. Please acknowledge receipt in the portal.', when: '27 Oct 2026' },
  { title: 'Design showcase volunteers', body: 'We need four parents to help with the showcase on 14 November.', when: '26 Oct 2026' },
];

export const todaySchedule = [
  { time: '08:00', subject: 'Mathematics', room: 'B-204', teacher: 'Ms. Bello', state: 'done' },
  { time: '09:00', subject: 'English Language', room: 'B-204', teacher: 'Ms. Ibrahim', state: 'done' },
  { time: '10:30', subject: 'Digital Literacy', room: 'D-302', teacher: 'Mr. Eze', state: 'now' },
  { time: '12:00', subject: 'UI / UX Design Studio', room: 'D-305', teacher: 'Mrs. Adebayo', state: 'next' },
];

export const studentAchievements = [
  { title: 'Design sprint winner', detail: 'Inter-house innovation day · Oct 2026', points: 50, tone: 'brand' },
  { title: 'Perfect attendance', detail: 'September 2026', points: 25, tone: 'success' },
  { title: 'Peer mentor', detail: 'Supporting two JSS 1 learners', points: 30, tone: 'info' },
  { title: 'Reading streak', detail: '12 weeks in the digital library', points: 40, tone: 'warn' },
];

export const studentSkills = [
  { name: 'Design research', level: 82 },
  { name: 'Prototyping', level: 74 },
  { name: 'Written communication', level: 88 },
  { name: 'Collaboration', level: 91 },
  { name: 'Data literacy', level: 68 },
];

export const studentDocuments = [
  { name: 'Term 1 report card', type: 'PDF', updated: '11 Oct 2026', status: 'Ready' },
  { name: 'Enrolment letter', type: 'PDF', updated: '2 Sep 2026', status: 'Ready' },
  { name: 'Student ID card', type: 'Digital', updated: '2 Sep 2026', status: 'Verified' },
  { name: 'Medical consent form', type: 'Signed', updated: '2 Sep 2026', status: 'On file' },
];

export function currency(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
}
