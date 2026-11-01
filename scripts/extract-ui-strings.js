/**
 * Collect every human-readable English string the app renders, so the offline
 * translation catalogue can cover the whole platform.
 *
 * Usage: node scripts/extract-ui-strings.js > scripts/ui-strings.json
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..', 'src');
const TARGETS = ['app', 'components', 'lib'];

const SKIP = /^(https?:|\/|#|\.|@|[A-Za-z0-9_-]+\.[A-Za-z0-9]+$)/;
const CODE_HINTS = /[{}<>;=()[\]]|=>|function |const |return |import |className|px-|text-|border-|flex |grid |bg-|rounded |mt-|mb-|w-\[|h-\[/;

/** Strings that are data, not prose, and should not be translated. */
const DATA_KEYS = new Set([
  'slug', 'href', 'src', 'url', 'id', 'code', 'key', 'cover', 'fileUrl', 'mimeType',
  'objectId', 'icon', 'color', 'variant', 'tone', 'status', 'kind', 'type', 'method',
  'provider', 'model', 'email', 'phone', 'password', 'value', 'name', 'campus', 'className',
]);

const TEXT_KEYS = new Set([
  'title', 'label', 'description', 'summary', 'blurb', 'text', 'heading', 'subtitle',
  'caption', 'message', 'detail', 'note', 'body', 'outcome', 'role', 'prompt', 'question',
  'answer', 'placeholder', 'eyebrow', 'feedback', 'noteLabel', 'copy', 'intro', 'detail',
  'tagline', 'reason', 'action', 'cta', 'tooltip', 'hint', 'ctaLabel', 'help', 'empty',
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx|ts)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function acceptable(value) {
  const text = value.replace(/\s+/g, ' ').trim();
  if (text.length < 2 || text.length > 170) return null;
  if (!/[A-Za-z]{2}/.test(text)) return null;
  if (!/[A-Za-z]{2,}\s|[A-Za-z]{2,}$/.test(text)) return null;
  if (SKIP.test(text)) return null;
  if (CODE_HINTS.test(text)) return null;
  if (text === text.toLowerCase() && text.includes('-') && !text.includes(' ')) return null;
  if (!/[aeiouAEIOU]/.test(text)) return null;
  return text;
}

const found = new Map();

function add(value, weight) {
  const text = acceptable(value);
  if (!text) return;
  const current = found.get(text) || { weight: 0, count: 0 };
  found.set(text, { weight: Math.max(current.weight, weight), count: current.count + 1 });
}

/** Is this string literal used as a visible label somewhere? */
function isLabelContext(node) {
  const parent = node.parent;
  if (!parent) return 0;

  // Tuple entries such as ['Overview', '/teacher'] — the label half of a nav item.
  if (ts.isArrayLiteralExpression(parent)) {
    const siblings = parent.elements;
    const index = siblings.indexOf(node);
    const next = siblings[index + 1];
    if (next && ts.isStringLiteral(next) && next.text.startsWith('/')) return 3;
    const previous = siblings[index - 1];
    if (previous && ts.isStringLiteral(previous) && previous.text.startsWith('/')) return 0;
    return 0;
  }

  // { title: '…' } and friends.
  if (ts.isPropertyAssignment(parent) && parent.initializer === node) {
    const name = parent.name.getText().replace(/['"]/g, '');
    if (DATA_KEYS.has(name)) return 0;
    if (TEXT_KEYS.has(name)) return 3;
    return 0;
  }

  // Plain statement strings ("'Overview',") inside data arrays.
  if (ts.isExpressionStatement(parent) || ts.isParenthesizedExpression(parent)) return 0;

  return 0;
}

for (const target of TARGETS) {
  const dir = path.join(ROOT, target);
  if (!fs.existsSync(dir)) continue;
  for (const file of walk(dir)) {
    if (file.includes('.test.')) continue;
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);

    const visit = node => {
      if (ts.isJsxText(node)) {
        add(node.text, 2);
      } else if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer)) {
        if (['placeholder', 'aria-label', 'title', 'alt', 'label'].includes(node.name.getText())) add(node.initializer.text, 3);
      } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        if (isLabelContext(node)) add(node.text, 3);
      } else if (ts.isTemplateExpression(node)) {
        add(node.head.text, 1);
        node.templateSpans.forEach(span => add(span.literal.text, 1));
      }
      ts.forEachChild(node, visit);
    };

    visit(source);
  }
}

const entries = [...found.entries()]
  .filter(([, meta]) => meta.weight > 0)
  .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
  .map(([text, meta]) => ({ text, weight: meta.weight, count: meta.count }));

process.stdout.write(JSON.stringify(entries, null, 1));
process.stderr.write(`extracted ${entries.length} unique strings\n`);
