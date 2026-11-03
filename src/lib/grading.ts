/**
 * Shared (browser + server) grading rules, Algerian style: every mark is out of 20 and 10/20 is the pass mark.
 *
 * A course (or any score) is worked out as a percentage out of 100 first, then converted:
 *   mark out of 20 = percent / 5      (100% = 20/20, 50% = 10/20, 5% = 1/20)
 */

export const MAX_MARK = 20;
export const PASS_MARK = 10;

export const GRADE_SCALE: { min: number; label: string }[] = [
  { min: 16, label: 'Très bien' },
  { min: 14, label: 'Bien' },
  { min: 12, label: 'Assez bien' },
  { min: 10, label: 'Passable' },
  { min: 0, label: 'Insuffisant' },
];

/** Percentage (0-100) to a mark out of 20, rounded to one decimal. */
export function toTwenty(percent: number) {
  const clamped = Math.max(0, Math.min(100, percent));
  return Math.round((clamped / 5) * 10) / 10;
}

export function labelFor(mark: number) {
  return (GRADE_SCALE.find(row => mark >= row.min) ?? GRADE_SCALE[GRADE_SCALE.length - 1]).label;
}

/** Display text such as "14.5/20". */
export function formatMark(mark: number) {
  return `${Number.isInteger(mark) ? mark : mark.toFixed(1)}/${MAX_MARK}`;
}

export type GradeInfo = { percent: number; mark: number; label: string; passed: boolean };

export function gradeFromPercent(percent: number): GradeInfo {
  const mark = toTwenty(percent);
  return { percent: Math.round(percent), mark, label: labelFor(mark), passed: mark >= PASS_MARK };
}

/** Weights of each part of a course grade. Parts with no data yet are left out and the rest are rescaled. */
export const GRADE_WEIGHTS = { completion: 50, quizzes: 25, tasks: 25 } as const;

export function courseGrade(parts: { completion: number; quizzes: number | null; tasks: number | null }): GradeInfo {
  let total = GRADE_WEIGHTS.completion * parts.completion;
  let weight = GRADE_WEIGHTS.completion;
  if (parts.quizzes !== null) { total += GRADE_WEIGHTS.quizzes * parts.quizzes; weight += GRADE_WEIGHTS.quizzes; }
  if (parts.tasks !== null) { total += GRADE_WEIGHTS.tasks * parts.tasks; weight += GRADE_WEIGHTS.tasks; }
  return gradeFromPercent(total / weight);
}
