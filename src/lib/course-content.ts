import lessonContent from './courses-lessons.json';
import type { ModuleContent } from './lesson-text';
import { isParseConfigured, parseCreateEnsured, parseQuery } from './parse-server';

/**
 * Server-only. Lesson bodies are served through authenticated API routes, never bundled for the browser.
 *
 * The built-in lessons ship in `courses-lessons.json`. An administrator can edit any module from
 * the admin console; the edit is stored in Parse (`CourseContent`) and wins over the built-in text.
 */
export type { ModuleContent } from './lesson-text';
export { lessonToText } from './lesson-text';

const builtIn = lessonContent as unknown as Record<string, Record<string, ModuleContent>>;

export const CONTENT_CLASS = 'CourseContent';
export const CONTENT_FIELDS = {
  courseSlug: { type: 'String' },
  lessonIndex: { type: 'Number' },
  content: { type: 'String' },
  updatedBy: { type: 'String' },
} as const;

type OverrideRow = { objectId: string; courseSlug: string; lessonIndex: number; content: string };

/** All overrides, cached briefly so every lesson view does not hit the database. */
let cache: { at: number; rows: Map<string, { id: string; content: ModuleContent }> } | null = null;
const TTL_MS = 30_000;

async function overrides() {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows;
  const rows = new Map<string, { id: string; content: ModuleContent }>();
  if (isParseConfigured()) {
    try {
      const data = await parseQuery<OverrideRow>(CONTENT_CLASS, { limit: 1000 });
      for (const row of data.results || []) {
        try {
          rows.set(`${row.courseSlug}:${row.lessonIndex}`, { id: row.objectId, content: JSON.parse(row.content) as ModuleContent });
        } catch { /* ignore a corrupt row; the built-in lesson is used */ }
      }
    } catch { /* class not created yet */ }
  }
  cache = { at: Date.now(), rows };
  return rows;
}

export function clearContentCache() {
  cache = null;
}

export function getBuiltInLesson(courseTitle: string, index: number): ModuleContent | null {
  return builtIn[courseTitle]?.[String(index)] ?? null;
}

/** The lesson learners see: the admin's edited version if there is one, otherwise the built-in text. */
export async function getLessonContent(courseTitle: string, index: number, courseSlug?: string): Promise<ModuleContent | null> {
  if (courseSlug) {
    const edited = (await overrides()).get(`${courseSlug}:${index}`);
    if (edited) return edited.content;
  }
  return getBuiltInLesson(courseTitle, index);
}

export async function findOverrideId(courseSlug: string, index: number) {
  clearContentCache();
  return (await overrides()).get(`${courseSlug}:${index}`)?.id ?? null;
}

export async function listEditedModules() {
  return [...(await overrides()).keys()];
}

export async function createOverride(courseSlug: string, lessonIndex: number, content: ModuleContent, updatedBy: string) {
  return parseCreateEnsured(CONTENT_CLASS, CONTENT_FIELDS, { courseSlug, lessonIndex, content: JSON.stringify(content), updatedBy });
}
