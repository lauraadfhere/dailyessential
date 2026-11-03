import { getLessonContent } from './course-content';
import { courses, getCourse } from './courses-data';
import { findAssignments, findHandIns } from './assignments';
import { courseGrade, gradeFromPercent } from './grading';
import { findSubmissions, tasksFor, type SubmissionRow } from './learning';
import { parseQuery } from './parse-server';

type EnrollmentRow = {
  objectId: string;
  courseSlug: string;
  status?: string;
  progress?: number;
  completedLessons?: string;
  completionLog?: string;
  lastLesson?: number;
  timeSpent?: number;
  enrolledAt?: string;
};

function parseList(raw?: string) {
  try {
    const list = JSON.parse(raw || '[]');
    return Array.isArray(list) ? (list.filter(Number.isInteger) as number[]) : [];
  } catch {
    return [];
  }
}

function parseLog(raw?: string) {
  try {
    const list = JSON.parse(raw || '[]');
    return Array.isArray(list) ? (list as { i: number; at: string }[]).filter(item => Number.isInteger(item.i) && item.at) : [];
  } catch {
    return [];
  }
}

const average = (values: number[]) => (values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null);
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const WEEKS = 8;

export type Report = Awaited<ReturnType<typeof buildReport>>;

/** Everything about one learner's progress: grades, what is left to do, a weekly timeline and recent activity. */
export async function buildReport(email: string, name: string) {
  const [enrolData, submissions, handIns, assignments] = await Promise.all([
    parseQuery<EnrollmentRow>('CourseEnrollment', { where: JSON.stringify({ studentEmail: email }), limit: 100, order: '-createdAt' })
      .catch(() => ({ results: [] as EnrollmentRow[] })),
    findSubmissions({ studentEmail: email }, 500),
    findHandIns({ studentEmail: email }, 300),
    findAssignments({ status: 'published' }, 100),
  ]);

  const active = (enrolData.results || []).filter(row => ['active', 'completed'].includes(row.status || 'active'));
  const byCourse = new Map<string, SubmissionRow[]>();
  submissions.forEach(row => byCourse.set(row.courseSlug, [...(byCourse.get(row.courseSlug) || []), row]));

  const todo: { course: string; courseSlug: string; type: 'lesson' | 'task' | 'quiz' | 'waiting'; title: string; href: string }[] = [];
  const events: { at: string; type: 'enrolled' | 'module' | 'quiz' | 'task' | 'graded'; title: string; course: string }[] = [];
  const completionTimes: number[] = [];
  let untimedCompletions = 0;
  let totalModules = 0;

  const reportCourses = [];
  for (const row of active) {
    const course = getCourse(row.courseSlug);
    if (!course) continue;
    const total = course.modules.length;
    totalModules += total;
    const completed = parseList(row.completedLessons);
    const log = parseLog(row.completionLog);
    const rows = byCourse.get(course.slug) || [];
    const completion = Math.round((completed.length / total) * 100);

    log.forEach(entry => {
      if (!completed.includes(entry.i)) return;
      completionTimes.push(new Date(entry.at).getTime());
      events.push({ at: entry.at, type: 'module', title: `Completed module ${entry.i + 1}: ${course.modules[entry.i] ?? ''}`, course: course.title });
    });
    untimedCompletions += Math.max(0, completed.length - log.filter(entry => completed.includes(entry.i)).length);
    if (row.enrolledAt) events.push({ at: row.enrolledAt, type: 'enrolled', title: 'Enrolled', course: course.title });

    const quizzes = rows.filter(item => item.kind === 'quiz' && item.maxScore);
    const quizPercent = average(quizzes.map(item => Math.round(((item.score ?? 0) / (item.maxScore || 1)) * 100)));
    const graded = rows.filter(item => item.kind === 'task' && item.status === 'graded' && item.maxMarks);
    // Teacher-graded course tasks and graded assignments for this course count together.
    const gradedHandIns = handIns.filter(item => item.status === 'graded' && item.maxMarks && item.courseSlug === course.slug);
    const taskPercent = average([
      ...graded.map(item => Math.round(((item.marks ?? 0) / (item.maxMarks || 1)) * 100)),
      ...gradedHandIns.map(item => Math.round(((item.marks ?? 0) / (item.maxMarks || 1)) * 100)),
    ]);
    const grade = courseGrade({ completion, quizzes: quizPercent, tasks: taskPercent });

    rows.forEach(item => {
      if (item.kind === 'quiz' && item.submittedAt) events.push({ at: item.submittedAt, type: 'quiz', title: `Quiz in module ${item.lessonIndex + 1}: ${item.score}/${item.maxScore}`, course: course.title });
      if (item.kind === 'task' && item.submittedAt) events.push({ at: item.submittedAt, type: 'task', title: `Submitted a task in module ${item.lessonIndex + 1}`, course: course.title });
      if (item.kind === 'task' && item.gradedAt) events.push({ at: item.gradedAt, type: 'graded', title: `Task in module ${item.lessonIndex + 1} graded: ${item.marks}/${item.maxMarks}`, course: course.title });
    });

    // The learner is "up to" the furthest module opened or finished, plus the next one.
    const frontier = Math.min(total - 1, Math.max(row.lastLesson ?? 0, ...completed, 0) + (completed.length ? 1 : 0));
    const lessons = [];
    for (let index = 0; index < total; index += 1) {
      const title = course.modules[index];
      const content = await getLessonContent(course.title, index, course.slug);
      const tasks = (await tasksFor(course, index)).map(task => {
        const submission = rows.find(item => item.kind === 'task' && item.lessonIndex === index && item.taskKey === task.key);
        return {
          key: task.key,
          label: task.label,
          submissionId: submission?.objectId ?? null,
          status: submission ? submission.status : 'todo',
          marks: submission?.marks ?? null,
          maxMarks: submission?.maxMarks ?? null,
          feedback: submission?.feedback || '',
        };
      });
      const quiz = rows.find(item => item.kind === 'quiz' && item.lessonIndex === index);
      const hasQuiz = Boolean(content?.activities?.qcm?.length || content?.activities?.fill?.length);
      const done = completed.includes(index);

      const href = `/courses/${course.slug}/reader/${index}`;
      if (!done && index <= frontier) todo.push({ course: course.title, courseSlug: course.slug, type: 'lesson', title: `Read and complete module ${index + 1}: ${title}`, href });
      if (index <= frontier) {
        if (hasQuiz && !quiz) todo.push({ course: course.title, courseSlug: course.slug, type: 'quiz', title: `Take the quiz in module ${index + 1}`, href });
        tasks.forEach(task => {
          if (task.status === 'todo') todo.push({ course: course.title, courseSlug: course.slug, type: 'task', title: `Submit "${task.label}" for module ${index + 1}`, href });
          if (task.status === 'submitted') todo.push({ course: course.title, courseSlug: course.slug, type: 'waiting', title: `Waiting for your teacher to grade "${task.label}" (module ${index + 1})`, href });
        });
      }

      lessons.push({
        index,
        title,
        completed: done,
        quiz: quiz ? { score: quiz.score ?? 0, max: quiz.maxScore ?? 0 } : hasQuiz ? { score: null, max: null } : null,
        tasks,
      });
    }

    reportCourses.push({
      slug: course.slug,
      title: course.title,
      category: course.category,
      status: row.status || 'active',
      completedLessons: completed.length,
      totalLessons: total,
      completion,
      timeSpentMinutes: row.timeSpent ?? 0,
      enrolledAt: row.enrolledAt || '',
      quizPercent,
      taskPercent,
      grade,
      lessons,
    });
  }

  // Weekly timeline: modules finished each week (last 8 weeks) and the running total as a % of all enrolled modules.
  const now = Date.now();
  const weekly = Array.from({ length: WEEKS }, (_, i) => {
    const from = now - (WEEKS - i) * WEEK_MS;
    const to = from + WEEK_MS;
    const done = completionTimes.filter(time => time >= from && time < to).length;
    const before = completionTimes.filter(time => time < to).length + untimedCompletions;
    return {
      label: i === WEEKS - 1 ? 'This week' : `${WEEKS - 1 - i}w ago`,
      completed: done,
      completedPercent: totalModules ? Math.round((done / totalModules) * 100) : 0,
      cumulativePercent: totalModules ? Math.round((Math.min(before, totalModules) / totalModules) * 100) : 0,
    };
  });

  // Assignments: what is still to hand in, and what is waiting for a mark.
  const enrolledSlugs = new Set(reportCourses.map(course => course.slug));
  assignments.forEach(assignment => {
    if (assignment.courseSlug && !enrolledSlugs.has(assignment.courseSlug)) return;
    const mine = handIns.find(item => item.assignmentId === assignment.objectId);
    const due = assignment.dueAt ? ` (due ${new Date(assignment.dueAt).toLocaleDateString()})` : '';
    if (!mine) todo.push({ course: assignment.courseTitle || 'Assignment', courseSlug: assignment.courseSlug || '', type: 'task', title: `Hand in the assignment "${assignment.title}"${due}`, href: '/student/assignments' });
    else if (mine.status === 'submitted') todo.push({ course: assignment.courseTitle || 'Assignment', courseSlug: assignment.courseSlug || '', type: 'waiting', title: `Waiting for your teacher to grade "${assignment.title}"`, href: '/student/assignments' });
  });
  handIns.forEach(item => {
    if (item.submittedAt) events.push({ at: item.submittedAt, type: 'task', title: `Handed in "${item.assignmentTitle || 'assignment'}"`, course: item.courseSlug ? getCourse(item.courseSlug)?.title || '' : 'Assignment' });
    if (item.gradedAt) events.push({ at: item.gradedAt, type: 'graded', title: `Assignment "${item.assignmentTitle || ''}" graded: ${item.marks}/${item.maxMarks}`, course: item.courseSlug ? getCourse(item.courseSlug)?.title || '' : 'Assignment' });
  });

  const overallPercent = average(reportCourses.map(course => course.grade.percent));
  const totalMinutes = reportCourses.reduce((sum, course) => sum + course.timeSpentMinutes, 0);

  return {
    learner: { email, name },
    generatedAt: new Date().toISOString(),
    overall: overallPercent === null ? null : gradeFromPercent(overallPercent),
    totals: {
      courses: reportCourses.length,
      modulesDone: reportCourses.reduce((sum, course) => sum + course.completedLessons, 0),
      modulesTotal: totalModules,
      minutes: totalMinutes,
      gradedTasks: submissions.filter(item => item.kind === 'task' && item.status === 'graded').length + handIns.filter(item => item.status === 'graded').length,
      waitingTasks: submissions.filter(item => item.kind === 'task' && item.status === 'submitted').length + handIns.filter(item => item.status === 'submitted').length,
    },
    courses: reportCourses,
    todo: todo.slice(0, 40),
    weekly,
    activity: events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 15),
    catalogueSize: courses.length,
  };
}
