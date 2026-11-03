/** Browser-safe lesson types and text helpers (no lesson data is imported here). */
export type ModuleContent = {
  title: string;
  whyItMatters: string;
  outcomes: string;
  lessons: { number: number; title: string; body: string }[];
  activity: string;
  pitfalls: string;
  knowledgeCheck: string;
  reflection: string;
  /** Answer keys are present only on the server (and for staff); learners never receive them. */
  activities?: { qcm: { question: string; options: string[]; answer?: number }[]; fill: { sentence: string; answer?: string }[] };
};

/** Remove the answer keys so a lesson can be sent to a learner. */
export function withoutAnswers(lesson: ModuleContent): ModuleContent {
  if (!lesson.activities) return lesson;
  return {
    ...lesson,
    activities: {
      qcm: lesson.activities.qcm.map(({ question, options }) => ({ question, options })),
      fill: lesson.activities.fill.map(({ sentence }) => ({ sentence })),
    },
  };
}

/** Plain-text rendering of a lesson, used for downloads and as AI analysis input. */
export function lessonToText(lesson: ModuleContent, maxChars = 9000) {
  const parts: string[] = [`# ${lesson.title}`];
  const add = (heading: string, text?: string) => {
    if (text && text.trim()) parts.push(`## ${heading}\n${text.trim()}`);
  };
  add('Why this matters', lesson.whyItMatters);
  add('Learning outcomes', lesson.outcomes);
  lesson.lessons.forEach(block => add(`Lesson ${block.number}: ${block.title}`, block.body));
  add('Guided practical activity', lesson.activity);
  add('Common difficulties', lesson.pitfalls);
  add('Knowledge check', lesson.knowledgeCheck);
  add('Reflection', lesson.reflection);
  const text = parts.join('\n\n');
  return text.length > maxChars ? `${text.slice(0, maxChars)}\n[…lesson truncated for analysis]` : text;
}
