export type ConsoleRole = 'admin' | 'teacher' | 'examiner';

export type ConsoleNavItem = { key: string; label: string; href: string };
export type ConsoleSidebarGroup = { label: string; items: { href: string; label: string; permission?: string }[] };
export type ConsoleHomeCard = {
  href: string;
  title: string;
  action: string;
  description: string;
  permission: string;
};

export type ConsoleConfig = {
  role: ConsoleRole;
  homeHref: string;
  loginHref: string;
  label: string;
  campusLabel: string;
  campusCount: number;
  greetingName: string;
  permissions: string[];
  topNav: ConsoleNavItem[];
  sidebar: ConsoleSidebarGroup[];
  footer: [string, string][];
  helpHref: string;
  settingsHref: string;
  accountHref: string;
  homeCards: ConsoleHomeCard[];
};

const allAdminPerms = [
  'evaluation.moderate', 'lesson.manage', 'news.publish', 'analytics.view',
  'settings.manage', 'users.manage', 'import.export', 'audit.view',
  'admissions.manage', 'student.record', 'academics.manage', 'timetable.manage',
  'attendance.manage', 'assessment.manage', 'finance.manage', 'library.manage',
  'reports.view', 'roles.manage', 'setup.manage', 'events.manage', 'support.manage',
];

const teacherPerms = [
  'student.search', 'marks.assign', 'evaluation.track', 'progress.view',
  'attendance.record', 'class.manage', 'assignment.create',
];

const examinerPerms = [
  'assessment.review', 'grade.verify', 'question.bank', 'quality.control',
  'results.publish', 'reports.view', 'audit.view',
];

export const consoleConfigs: Record<ConsoleRole, ConsoleConfig> = {
  admin: {
    role: 'admin',
    homeHref: '/admin',
    loginHref: '/admin/login',
    label: 'Admin',
    campusLabel: 'Your campuses',
    campusCount: 3,
    greetingName: 'Admin',
    permissions: allAdminPerms,
    topNav: [
      { key: 'overview', label: 'Overview', href: '/admin' },
      { key: 'evaluations', label: 'Evaluations', href: '/admin/evaluations' },
      { key: 'lessons', label: 'Lessons', href: '/admin/subscriptions' },
      { key: 'news', label: 'News', href: '/admin/news' },
      { key: 'settings', label: 'Settings', href: '/admin/settings' },
      { key: 'help', label: 'Help', href: '/admin/help' },
    ],
    sidebar: [
      {
        label: 'General',
        items: [
          { href: '/admin/evaluations', label: 'Moderate evaluations', permission: 'evaluation.moderate' },
          { href: '/admin/subscriptions', label: 'Lesson subscriptions', permission: 'lesson.manage' },
          { href: '/admin/admissions', label: 'Admissions', permission: 'admissions.manage' },
        ],
      },
      {
        label: 'People',
        items: [
          { href: '/admin/students', label: 'Student records', permission: 'student.record' },
          { href: '/admin/roles', label: 'Roles & permissions', permission: 'roles.manage' },
        ],
      },
      {
        label: 'Academics',
        items: [
          { href: '/admin/academics', label: 'Programmes & classes', permission: 'academics.manage' },
          { href: '/admin/courses', label: 'Course enrolments', permission: 'academics.manage' },
          { href: '/admin/timetable', label: 'Timetable builder', permission: 'timetable.manage' },
          { href: '/admin/attendance', label: 'Attendance', permission: 'attendance.manage' },
          { href: '/admin/assessment', label: 'Assessment & results', permission: 'assessment.manage' },
          { href: '/admin/library', label: 'Library & resources', permission: 'library.manage' },
        ],
      },
      {
        label: 'Operations',
        items: [
          { href: '/admin/finance', label: 'Finance & fees', permission: 'finance.manage' },
          { href: '/admin/reports', label: 'Reports', permission: 'reports.view' },
          { href: '/admin/events', label: 'Events & calendar', permission: 'events.manage' },
          { href: '/admin/support', label: 'Support inbox', permission: 'support.manage' },
        ],
      },
      {
        label: 'Analytics',
        items: [
          { href: '/admin/analytics', label: 'Student progress', permission: 'analytics.view' },
          { href: '/admin/news', label: 'Latest news', permission: 'news.publish' },
          { href: '/admin/audit', label: 'Audit trail', permission: 'audit.view' },
        ],
      },
      {
        label: 'Configuration',
        items: [
          { href: '/admin/settings', label: 'Settings', permission: 'settings.manage' },
          { href: '/admin/setup', label: 'School setup', permission: 'setup.manage' },
          { href: '/admin/settings#filters', label: 'Word filters', permission: 'settings.manage' },
          { href: '/admin/settings#access', label: 'Access controls', permission: 'users.manage' },
        ],
      },
      {
        label: 'Tools',
        items: [
          { href: '/admin/settings#import', label: 'Import', permission: 'import.export' },
          { href: '/admin/settings#export', label: 'Export', permission: 'import.export' },
          { href: '/admin/ai', label: 'AI screening', permission: 'admissions.manage' },
          { href: '/admin/help', label: 'Admin 101', permission: 'audit.view' },
        ],
      },
    ],
    footer: [
      ['Features', '/admin'],
      ['Company', '/'],
      ['News', '/admin/news'],
      ['Help', '/admin/help'],
      ['Policies', '/policies'],
      ['Privacy', '/privacy'],
    ],
    helpHref: '/admin/help',
    settingsHref: '/admin/settings',
    accountHref: '/admin/login',
    homeCards: [
      { href: '/admin/admissions', title: 'Admissions pipeline', action: 'Review applications', description: 'Move applicants from enquiry to enrolment.', permission: 'admissions.manage' },
      { href: '/admin/ai', title: 'AI screening', action: 'Open screening', description: 'Anonymised summaries that support a human admission decision.', permission: 'admissions.manage' },
      { href: '/admin/students', title: 'Student records', action: 'Open records', description: 'Search learners, guardians and enrolment history.', permission: 'student.record' },
      { href: '/admin/courses', title: 'Course enrolments', action: 'Open rosters', description: 'See who enrolled on which course and track progress.', permission: 'academics.manage' },
      { href: '/admin/finance', title: 'Fees & invoices', action: 'Open finance', description: 'Track fee collection, invoices and balances.', permission: 'finance.manage' },
      { href: '/admin/timetable', title: 'Timetable builder', action: 'Build timetable', description: 'Schedule classes, rooms and teacher assignments.', permission: 'timetable.manage' },
      { href: '/admin/attendance', title: 'Attendance', action: 'Review attendance', description: 'Daily registers, chronic absences and follow-ups.', permission: 'attendance.manage' },
      { href: '/admin/evaluations', title: 'Moderate evaluations', action: 'Open queue', description: 'Review placement and transfer evaluation requests.', permission: 'evaluation.moderate' },
      { href: '/admin/subscriptions', title: 'Lesson subscriptions', action: 'Manage lessons', description: 'Confirm seats, plans and learner subscriptions.', permission: 'lesson.manage' },
      { href: '/admin/news', title: 'Latest news', action: 'Publish updates', description: 'Share announcements with the school community.', permission: 'news.publish' },
      { href: '/admin/analytics', title: 'Analyze progress', action: 'Open analytics', description: 'Track engagement across campuses.', permission: 'analytics.view' },
    ],
  },

  teacher: {
    role: 'teacher',
    homeHref: '/teacher',
    loginHref: '/login/teacher',
    label: 'Teacher',
    campusLabel: 'Your classes',
    campusCount: 4,
    greetingName: 'Mrs. Adebayo',
    permissions: teacherPerms,
    topNav: [
      { key: 'overview', label: 'Overview', href: '/teacher' },
      { key: 'queue', label: 'Action queue', href: '/teacher/queue' },
      { key: 'students', label: 'Students', href: '/teacher/search' },
      { key: 'marks', label: 'Marks', href: '/teacher/marks' },
      { key: 'settings', label: 'Settings', href: '/teacher/settings' },
      { key: 'help', label: 'Help', href: '/teacher/help' },
    ],
    sidebar: [
      {
        label: 'General',
        items: [
          { href: '/teacher/queue', label: 'Moderate action queue', permission: 'marks.assign' },
          { href: '/teacher/search', label: 'Search students', permission: 'student.search' },
        ],
      },
      {
        label: 'Class management',
        items: [
          { href: '/teacher/classes', label: 'My classes', permission: 'class.manage' },
          { href: '/teacher/marks', label: 'Assign marks', permission: 'marks.assign' },
          { href: '/teacher/gradebook', label: 'Gradebook', permission: 'marks.assign' },
          { href: '/teacher/evaluations', label: 'Evaluation tracking', permission: 'evaluation.track' },
          { href: '/teacher/tracking', label: 'Progress tracking', permission: 'progress.view' },
        ],
      },
      {
        label: 'Delivery',
        items: [
          { href: '/workspace/teacher/assignments', label: 'Class assignments', permission: 'assignment.create' },
          { href: '/workspace/teacher/attendance', label: 'Attendance', permission: 'attendance.record' },
          { href: '/teacher/attendance', label: 'Take register', permission: 'attendance.record' },
          { href: '/teacher/planner', label: 'Lesson planner', permission: 'class.manage' },
          { href: '/teacher/ai', label: 'AI assistant', permission: 'assignment.create' },
        ],
      },
      {
        label: 'Communication',
        items: [
          { href: '/teacher/messages', label: 'Messages', permission: 'class.manage' },
          { href: '/teacher/meetings', label: 'Meetings', permission: 'class.manage' },
          { href: '/teacher/appraisal', label: 'Appraisal', permission: 'progress.view' },
        ],
      },
      {
        label: 'Tools',
        items: [
          { href: '/teacher/settings', label: 'Teacher settings', permission: 'class.manage' },
          { href: '/teacher/help', label: 'Teacher 101', permission: 'class.manage' },
        ],
      },
    ],
    footer: [
      ['Features', '/teacher'],
      ['Courses', '/courses'],
      ['Help', '/teacher/help'],
      ['Policies', '/policies'],
    ],
    helpHref: '/teacher/help',
    settingsHref: '/teacher/settings',
    accountHref: '/login/teacher',
    homeCards: [
      { href: '/teacher/classes', title: 'My classes', action: 'Open classes', description: 'Rosters, averages and today’s periods for each group.', permission: 'class.manage' },
      { href: '/teacher/attendance', title: 'Take register', action: 'Mark attendance', description: 'Record today’s attendance and notify guardians of absences.', permission: 'attendance.record' },
      { href: '/teacher/gradebook', title: 'Gradebook', action: 'Open gradebook', description: 'Scores per assessment, class averages and ungraded work.', permission: 'marks.assign' },
      { href: '/teacher/planner', title: 'Lesson planner', action: 'Plan lessons', description: 'Weekly objectives, resources and homework checkpoints.', permission: 'class.manage' },
      { href: '/teacher/queue', title: 'Action queue', action: 'Moderate queue', description: 'Pending marks, evaluations and follow-ups requiring action.', permission: 'marks.assign' },
      { href: '/teacher/search', title: 'Search students', action: 'Find learners', description: 'Filter and open learner profiles for your classes.', permission: 'student.search' },
      { href: '/teacher/marks', title: 'Assign marks', action: 'Open markbook', description: 'Enter, submit and publish assessment scores.', permission: 'marks.assign' },
      { href: '/teacher/evaluations', title: 'Evaluation tracking', action: 'Track evaluations', description: 'Follow placement requests from review to shared results.', permission: 'evaluation.track' },
      { href: '/teacher/messages', title: 'Messages', action: 'Open inbox', description: 'Guardian conversations and class announcements.', permission: 'class.manage' },
    ],
  },

  examiner: {
    role: 'examiner',
    homeHref: '/examiner',
    loginHref: '/login/examiner',
    label: 'Examiner',
    campusLabel: 'Exam centres',
    campusCount: 2,
    greetingName: 'Mr. Okafor',
    permissions: examinerPerms,
    topNav: [
      { key: 'overview', label: 'Overview', href: '/examiner' },
      { key: 'grading', label: 'Grading', href: '/examiner/grading' },
      { key: 'results', label: 'Results', href: '/examiner/results' },
      { key: 'quality', label: 'Quality', href: '/examiner/quality' },
      { key: 'settings', label: 'Settings', href: '/examiner/settings' },
      { key: 'help', label: 'Help', href: '/examiner/help' },
    ],
    sidebar: [
      {
        label: 'General',
        items: [
          { href: '/examiner/grading', label: 'Papers to grade', permission: 'assessment.review' },
          { href: '/examiner/results', label: 'Results review', permission: 'grade.verify' },
        ],
      },
      {
        label: 'Assessments',
        items: [
          { href: '/examiner/questions', label: 'Question bank', permission: 'question.bank' },
          { href: '/examiner/quality', label: 'Quality control', permission: 'quality.control' },
        ],
      },
      {
        label: 'Reporting',
        items: [
          { href: '/examiner/reports', label: 'Exam reports', permission: 'reports.view' },
          { href: '/workspace/examiner/audit', label: 'Audit trail', permission: 'audit.view' },
        ],
      },
      {
        label: 'Tools',
        items: [
          { href: '/examiner/settings', label: 'Examiner settings', permission: 'results.publish' },
          { href: '/examiner/help', label: 'Examiner 101', permission: 'reports.view' },
        ],
      },
    ],
    footer: [
      ['Features', '/examiner'],
      ['Courses', '/courses'],
      ['Help', '/examiner/help'],
      ['Policies', '/policies'],
    ],
    helpHref: '/examiner/help',
    settingsHref: '/examiner/settings',
    accountHref: '/login/examiner',
    homeCards: [
      { href: '/examiner/grading', title: 'Papers to grade', action: 'Open grading', description: 'Moderate pending scripts waiting for examiner review.', permission: 'assessment.review' },
      { href: '/examiner/results', title: 'Results review', action: 'Verify results', description: 'Approve or return scored papers before release.', permission: 'grade.verify' },
      { href: '/examiner/questions', title: 'Question bank', action: 'Manage bank', description: 'Maintain secure item banks for assessments.', permission: 'question.bank' },
      { href: '/examiner/quality', title: 'Quality control', action: 'Open QC', description: 'Sample reviews and consistency checks.', permission: 'quality.control' },
    ],
  },
};

export function canAccess(role: ConsoleRole, permission: string) {
  return consoleConfigs[role].permissions.includes(permission);
}

export function activeTopKey(role: ConsoleRole, pathname: string) {
  const config = consoleConfigs[role];
  const match = [...config.topNav]
    .sort((a, b) => b.href.length - a.href.length)
    .find(item => item.href === config.homeHref ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));
  return match?.key || 'overview';
}

export function portalPermissionsCatalog() {
  return [
    ...allAdminPerms.map(code => ({ code, portal: 'admin' as const })),
    ...teacherPerms.map(code => ({ code, portal: 'teacher' as const })),
    ...examinerPerms.map(code => ({ code, portal: 'examiner' as const })),
  ];
}
