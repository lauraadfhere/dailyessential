export type MarkRow = {
  id: string;
  learner: string;
  className: string;
  assessment: string;
  score: number | null;
  max: number;
  status: 'draft' | 'submitted' | 'published';
};

export type EvaluationTrack = {
  id: string;
  learner: string;
  subject: string;
  stage: 'requested' | 'in-review' | 'scored' | 'shared';
  updatedAt: string;
  notes: string;
};

export type ProgressTrack = {
  id: string;
  learner: string;
  course: string;
  completion: number;
  lastActivity: string;
  risk: 'on-track' | 'watch' | 'at-risk';
};

export const markbook: MarkRow[] = [
  { id: 'm1', learner: 'Amina Ahmed', className: 'JSS 2 Blue', assessment: 'UI Critique 1', score: 18, max: 20, status: 'published' },
  { id: 'm2', learner: 'Ibrahim Yusuf', className: 'JSS 2 Blue', assessment: 'UI Critique 1', score: null, max: 20, status: 'draft' },
  { id: 'm3', learner: 'Chloe Nwosu', className: 'JSS 2 Blue', assessment: 'Wireframe quiz', score: 14, max: 20, status: 'submitted' },
  { id: 'm4', learner: 'Sara Okonkwo', className: 'SS1 Digital', assessment: 'Literacy check', score: 22, max: 25, status: 'draft' },
  { id: 'm5', learner: 'Kwame Mensah', className: 'SS1 Digital', assessment: 'Literacy check', score: null, max: 25, status: 'draft' },
];

export const evaluationTracks: EvaluationTrack[] = [
  { id: 'et1', learner: 'Fatima Diallo', subject: 'UI / UX Design', stage: 'in-review', updatedAt: '2026-10-17', notes: 'Portfolio samples received' },
  { id: 'et2', learner: 'Kwame Mensah', subject: 'Digital Literacy', stage: 'requested', updatedAt: '2026-10-16', notes: 'Awaiting certificates' },
  { id: 'et3', learner: 'Sara Okonkwo', subject: 'Computer Basics', stage: 'scored', updatedAt: '2026-10-14', notes: 'Ready to share with family' },
  { id: 'et4', learner: 'Amina Ahmed', subject: 'UI / UX Design', stage: 'shared', updatedAt: '2026-10-12', notes: 'Parent notified' },
];

export const progressTracks: ProgressTrack[] = [
  { id: 'p1', learner: 'Amina Ahmed', course: 'UI / UX Design', completion: 78, lastActivity: 'Yesterday', risk: 'on-track' },
  { id: 'p2', learner: 'Ibrahim Yusuf', course: 'Digital Literacy', completion: 42, lastActivity: '4 days ago', risk: 'watch' },
  { id: 'p3', learner: 'Chloe Nwosu', course: 'Computer Basics', completion: 21, lastActivity: '9 days ago', risk: 'at-risk' },
  { id: 'p4', learner: 'Sara Okonkwo', course: 'Digital Literacy', completion: 91, lastActivity: 'Today', risk: 'on-track' },
];

export type StudentRecord = {
  id: string;
  name: string;
  email: string;
  studentId: string;
  className: string;
  gradeLevel: string;
  programme: string;
  campus: string;
  status: 'active' | 'pending' | 'inactive';
  deliveryMode: 'In person' | 'Online' | 'Hybrid';
  guardian: string;
  guardianEmail: string;
  attendance: string;
  lastEvaluation: string;
  enrolledAt: string;
  backupSerial?: string;
  barcodeValue?: string;
  avatarUrl?: string;
  phone?: string;
  country?: string;
  address?: string;
};

export const studentDirectory: StudentRecord[] = [
  {
    id: 'st-1',
    name: 'Amina Ahmed',
    email: 'student@bifti.school',
    studentId: 'BFT-2026-0142',
    className: 'JSS 2 Blue',
    gradeLevel: 'JSS 2',
    programme: 'UI / UX Design',
    campus: 'Main Campus',
    status: 'active',
    deliveryMode: 'Hybrid',
    guardian: 'Hassan Ahmed',
    guardianEmail: 'hassan.ahmed@email.com',
    attendance: '96%',
    lastEvaluation: 'Shared · 12 Oct 2026',
    enrolledAt: '2 Sep 2026',
  },
  {
    id: 'st-2',
    name: 'Ibrahim Yusuf',
    email: 'ibrahim.y@email.com',
    studentId: 'BFT-2026-0188',
    className: 'JSS 2 Blue',
    gradeLevel: 'JSS 2',
    programme: 'Digital Literacy',
    campus: 'Digital Learning Hub',
    status: 'active',
    deliveryMode: 'Online',
    guardian: 'Mariama Yusuf',
    guardianEmail: 'mariama.y@email.com',
    attendance: '88%',
    lastEvaluation: 'Requested · 16 Oct 2026',
    enrolledAt: '4 Sep 2026',
  },
  {
    id: 'st-3',
    name: 'Chloe Nwosu',
    email: 'chloe.n@email.com',
    studentId: 'BFT-2026-0210',
    className: 'SS1 Digital',
    gradeLevel: 'SS 1',
    programme: 'Computer Basics',
    campus: 'Evening Programme',
    status: 'pending',
    deliveryMode: 'In person',
    guardian: 'Ngozi Nwosu',
    guardianEmail: 'ngozi.n@email.com',
    attendance: '74%',
    lastEvaluation: 'In review · 10 Oct 2026',
    enrolledAt: '8 Sep 2026',
  },
  {
    id: 'st-4',
    name: 'Sara Okonkwo',
    email: 'sara.o@email.com',
    studentId: 'BFT-2026-0091',
    className: 'SS1 Digital',
    gradeLevel: 'SS 1',
    programme: 'Digital Literacy',
    campus: 'Main Campus',
    status: 'active',
    deliveryMode: 'Hybrid',
    guardian: 'Chidi Okonkwo',
    guardianEmail: 'chidi.o@email.com',
    attendance: '98%',
    lastEvaluation: 'Scored · 14 Oct 2026',
    enrolledAt: '1 Sep 2026',
  },
  {
    id: 'st-5',
    name: 'Kwame Mensah',
    email: 'kwame.m@email.com',
    studentId: 'BFT-2026-0255',
    className: 'JSS 2 Blue',
    gradeLevel: 'JSS 2',
    programme: 'Digital Literacy',
    campus: 'Main Campus',
    status: 'active',
    deliveryMode: 'In person',
    guardian: 'Ama Mensah',
    guardianEmail: 'ama.m@email.com',
    attendance: '91%',
    lastEvaluation: 'Requested · 16 Oct 2026',
    enrolledAt: '5 Sep 2026',
  },
  {
    id: 'st-6',
    name: 'Fatima Diallo',
    email: 'fatima.diallo@email.com',
    studentId: 'BFT-2026-0301',
    className: 'SS1 Digital',
    gradeLevel: 'SS 1',
    programme: 'UI / UX Design',
    campus: 'Digital Learning Hub',
    status: 'inactive',
    deliveryMode: 'Online',
    guardian: 'Ibrahim Diallo',
    guardianEmail: 'ibrahim.d@email.com',
    attendance: '62%',
    lastEvaluation: 'In review · 17 Oct 2026',
    enrolledAt: '12 Sep 2026',
  },
];
