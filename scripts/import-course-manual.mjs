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

const manualPath = new URL('../private-content/Daily_Essential_School_Complete_20_Courses_Expanded_Modules.md', import.meta.url);
const markdown = (await readFile(manualPath, 'utf8')).replace(/\r\n/g, '\n');

const base = url.replace(/\/$/, '');
const headers = { 'X-Parse-Application-Id': appId, 'X-Parse-Master-Key': masterKey, 'Content-Type': 'application/json' };

async function api(path, init = {}) {
  const response = await fetch(`${base}/${path.replace(/^\//, '')}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(`${path}: ${response.status} ${text}`);
  return data;
}

// Collapse hard line breaks inside paragraphs; keep blank-line paragraph breaks.
function clean(text) {
  return text
    .split(/\n\s*\n/)
    .map(p => p.replace(/\\\s*\n/g, ' ').replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n');
}

function sectionsOf(block) {
  const parts = block.split(/^## /m).slice(1);
  const sections = {};
  for (const part of parts) {
    const nl = part.indexOf('\n');
    const heading = part.slice(0, nl).trim();
    sections[heading] = clean(part.slice(nl + 1).replace(/^-{3,}$/gm, ''));
  }
  return sections;
}

function field(block, label) {
  const match = block.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+(?:\\n(?!\\n)[^\\n]+)*)`));
  return match ? clean(match[1]) : '';
}

// Split the manual into per-course blocks ("# NN. Name") and then per-module blocks.
const courseStarts = [...markdown.matchAll(/^# (\d{2})\. (.+)$/gm)];
const catalogRows = [...markdown.matchAll(/^\s+(\d{2}) (.+?)\s{2,}(\d+) weeks\s+(\d+) hours\s+(\d+)\s*$/gm)];
const catalog = new Map(catalogRows.map(m => [m[1], { weeks: Number(m[3]), hours: Number(m[4]), modules: Number(m[5]) }]));

const courses = courseStarts.map((match, index) => {
  const start = match.index;
  const end = index + 1 < courseStarts.length ? courseStarts[index + 1].index : markdown.length;
  const block = markdown.slice(start, end);
  const number = match[1];
  const title = match[2].trim();
  const catalogEntry = catalog.get(number) || {};

  const moduleStarts = [...block.matchAll(new RegExp(`^# ${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} --- Module (\\d{2}): (.+)$`, 'gm'))];
  const sequence = [...(block.match(/## Module sequence\n\n([\s\S]*?)\n\n## /)?.[1] || '').matchAll(/^\s*\d+\.\s+(.+)$/gm)].map(m => m[1].trim());

  const modules = moduleStarts.map((m, mi) => {
    const mStart = m.index;
    const mEnd = mi + 1 < moduleStarts.length ? moduleStarts[mi + 1].index : block.length;
    const mBlock = block.slice(mStart, mEnd);
    const sections = sectionsOf(mBlock.slice(m[0].length));
    const lessons = Object.entries(sections)
      .filter(([heading]) => /^Lesson \d+/.test(heading))
      .map(([heading, body]) => ({ title: heading.replace(/^Lesson \d+\s*---\s*/, ''), body }));
    return {
      number: Number(m[1]),
      title: m[2].trim(),
      position: field(mBlock, 'Module position'),
      studyTime: field(mBlock, 'Suggested module study time'),
      whyItMatters: sections['Why this module matters'] || '',
      learningOutcomes: (sections['Learning outcomes'] || '').split(/\n\n|(?<=\.)\s+(?=\d+\.)/).map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(Boolean),
      lessons,
      guidedActivity: sections['Guided practical activity'] || '',
      commonDifficulties: sections['Common difficulties to watch for'] || '',
      knowledgeCheck: sections['Knowledge check'] || '',
      completionEvidence: sections['Reflection and completion evidence'] || '',
    };
  });

  const sections = sectionsOf(block.slice(block.indexOf('\n**Course description:**') + 1));
  return {
    code: number,
    title,
    description: field(block, 'Course description'),
    durationWeeks: catalogEntry.weeks,
    estimatedHours: catalogEntry.hours,
    moduleCount: modules.length,
    expectedModuleCount: catalogEntry.modules,
    purpose: sections['Course purpose and learning approach'] || '',
    courseOutcomes: (sections['Course-level learning outcomes'] || '').split(/\s(?=\d+\.\s)/).map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(Boolean),
    moduleSequence: sequence,
    studyPlan: sections['Suggested study plan'] || '',
    finalProject: sections['Final course project'] || '',
    modules,
  };
});

const problems = courses.filter(c => c.moduleCount !== c.expectedModuleCount || !c.description || !c.durationWeeks);
if (problems.length) {
  for (const c of problems) console.warn(`Check ${c.code} ${c.title}: modules ${c.moduleCount}/${c.expectedModuleCount}, description ${Boolean(c.description)}, duration ${c.durationWeeks}`);
}
console.log(`Parsed ${courses.length} courses, ${courses.reduce((n, c) => n + c.modules.length, 0)} modules.`);

const org = (await api('classes/Organization?where=' + encodeURIComponent(JSON.stringify({ name: 'BIFTI School' })) + '&limit=1')).results?.[0];
if (!org) throw new Error('Run scripts/seed-platform-data.mjs first to create the BIFTI School organization.');
const orgPointer = { __type: 'Pointer', className: 'Organization', objectId: org.objectId };

for (const course of courses) {
  const payload = {
    title: course.title,
    code: course.code,
    summary: course.description,
    description: course.description,
    durationWeeks: course.durationWeeks,
    estimatedHours: course.estimatedHours,
    moduleCount: course.moduleCount,
    purpose: course.purpose,
    courseOutcomes: course.courseOutcomes,
    moduleSequence: course.moduleSequence,
    studyPlan: course.studyPlan,
    finalProject: course.finalProject,
    modules: course.modules,
    organization: orgPointer,
    status: 'open',
  };
  const existing = (await api('classes/Course?where=' + encodeURIComponent(JSON.stringify({ title: course.title, organization: orgPointer })) + '&limit=1')).results?.[0];
  if (existing) {
    await api(`classes/Course/${existing.objectId}`, { method: 'PUT', body: JSON.stringify(payload) });
    console.log(`Updated ${course.code} ${course.title}`);
  } else {
    await api('classes/Course', { method: 'POST', body: JSON.stringify(payload) });
    console.log(`Created ${course.code} ${course.title}`);
  }
}
console.log('Course manual import complete.');
