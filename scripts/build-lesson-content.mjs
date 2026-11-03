// Parses the course manual into structured lesson content.
// Output: src/lib/courses-lessons.json — keyed by course title, then module index.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manualPath = join(root, 'private-content/Daily_Essential_School_Complete_20_Courses_Expanded_Modules.md');
const outPath = join(root, 'src/lib/courses-lessons.json');

const text = readFileSync(manualPath, 'utf8').replace(/\r\n/g, '\n');

// Split on module headings: "# <Course> --- Module NN: <title>"
const moduleRe = /^# (.+?) --- Module (\d+): (.+)$/gm;
const matches = [...text.matchAll(moduleRe)];

const sectionsOf = body => {
  const sections = {};
  const parts = body.split(/^## /m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf('\n');
    const heading = part.slice(0, nl).trim();
    sections[heading] = part.slice(nl + 1).trim();
  }
  return sections;
};

const clean = s => s
  .replace(/\\\n/g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const out = {};
matches.forEach((match, i) => {
  const [, course, moduleNo, title] = match;
  const start = match.index + match[0].length;
  const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
  const body = text.slice(start, end);
  const sections = sectionsOf(body);

  const lessons = [];
  for (const [heading, content] of Object.entries(sections)) {
    const lm = heading.match(/^Lesson (\d+) --- (.+)$/);
    if (lm) lessons.push({ number: Number(lm[1]), title: lm[2].trim(), body: clean(content) });
  }
  lessons.sort((a, b) => a.number - b.number);

  const pick = name => clean(sections[name] || '');
  const topic = title.trim();
  const activities = {
    qcm: [
      {
        question: `Which statement best describes the central idea of "${topic}"?`,
        options: ["Explaining the key idea and applying it to a practical example", "Memorising a list of terms without applying them", "Recording only the final result and skipping the reasoning", "Avoiding review of mistakes or limitations"],
        answer: 0,
      },
      {
        question: "When approaching a new task in this area, which practice does the module recommend?",
        options: ["Guessing the method and checking it at the end", "Separating the underlying idea, the method and the evidence", "Copying a worked answer without explanation", "Working only from memory"],
        answer: 1,
      },
      {
        question: "Which of these is a common difficulty to watch for?",
        options: ["Keeping a glossary of important terms", "Writing stages in order", "Ignoring limitations or accepting a vague answer", "Showing the reasoning behind a result"],
        answer: 2,
      },
    ],
    fill: [
      { sentence: "Keep a ___ of important terms.", answer: "glossary" },
      { sentence: "When a process has stages, write them in ___ and explain why each stage is needed.", answer: "order" },
      { sentence: "Show the ___ rather than recording only the final result.", answer: "reasoning" },
    ],
  };
  (out[course] ||= {})[Number(moduleNo) - 1] = {
    title: title.trim(),
    whyItMatters: pick('Why this module matters'),
    outcomes: pick('Learning outcomes'),
    lessons,
    activity: pick('Guided practical activity'),
    pitfalls: pick('Common difficulties to watch for'),
    knowledgeCheck: pick('Knowledge check'),
    reflection: pick('Reflection and completion evidence'),
    activities,
  };
});

writeFileSync(outPath, JSON.stringify(out, null, 2));
const courseCount = Object.keys(out).length;
const moduleCount = Object.values(out).reduce((n, mods) => n + Object.keys(mods).length, 0);
console.log(`Wrote ${outPath}: ${courseCount} courses, ${moduleCount} modules`);
