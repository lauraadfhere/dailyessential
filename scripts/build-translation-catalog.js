/**
 * Pre-translate the whole UI so the app ships with an offline catalogue instead
 * of depending on a live AI call for every phrase.
 *
 * Usage: node scripts/build-translation-catalog.js [locale…]
 * Writes scripts/translation-catalog.json and can be re-run: finished phrases are skipped.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CATALOG = path.join(__dirname, 'translation-catalog.json');
const DICTIONARY = path.join(ROOT, 'src', 'lib', 'i18n', 'dictionary.ts');
const API = process.env.TRANSLATE_API || 'http://localhost:3000/api/ai/translate';

const BATCH_TEXTS = 22;
const BATCH_CHARS = 3000;

const locales = process.argv.slice(2).length ? process.argv.slice(2) : ['ar', 'fr'];

function dictionaryKeys() {
  const source = fs.readFileSync(DICTIONARY, 'utf8');
  const keys = new Set();
  for (const match of source.matchAll(/^\s{2}(?:'([^']+)'|([A-Za-z][\w &?.,'’-]*)):\s*\{\s*fr:/gm)) {
    keys.add(match[1] || match[2]);
  }
  return keys;
}

function readCatalog() {
  try {
    return JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  } catch {
    return {};
  }
}

function saveCatalog(catalog) {
  fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 1));
}

function isWorthTranslating(text) {
  if (!/[A-Za-z]{2,}/.test(text)) return false;
  if (text === text.toUpperCase() && !/\s/.test(text)) return false; // acronyms: AI, USD, GPA
  return true;
}

async function translateBatch(locale, texts) {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, texts }),
      });
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 15000 * attempt));
        continue;
      }
      if (!response.ok) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        continue;
      }
      const data = await response.json();
      return data.translations || {};
    } catch {
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
  return {};
}

(async () => {
  const curated = dictionaryKeys();
  const entries = JSON.parse(fs.readFileSync(path.join(__dirname, 'ui-strings.json'), 'utf8'));
  const catalogue = readCatalog();

  // Every locale translates the same source list; nothing is skipped between passes.
  const all = entries
    .filter(entry => entry.weight >= 2 && isWorthTranslating(entry.text) && !curated.has(entry.text))
    .map(entry => entry.text);

  let done = 0;
  let failed = 0;

  for (const locale of locales) {
    catalogue[locale] = catalogue[locale] || {};
    const pending = all.filter(text => !catalogue[locale][text]);

    // Chunk by count and by characters so requests stay inside the route limits.
    const batches = [];
    let batch = [];
    let chars = 0;
    for (const text of pending) {
      if (batch.length >= BATCH_TEXTS || chars + text.length > BATCH_CHARS) {
        batches.push(batch);
        batch = [];
        chars = 0;
      }
      batch.push(text);
      chars += text.length;
    }
    if (batch.length) batches.push(batch);

    console.log(`${locale}: ${pending.length} phrases in ${batches.length} batches`);
    let index = 0;
    for (const texts of batches) {
      index += 1;
      const translations = await translateBatch(locale, texts);
      const answered = Object.keys(translations).length;
      Object.assign(catalogue[locale], translations);
      done += answered;
      failed += texts.length - answered;
      saveCatalog(catalogue);
      console.log(`${locale} ${index}/${batches.length}: +${answered} (missing ${texts.length - answered})`);
    }
  }

  console.log(`done: ${done} translated, ${failed} unanswered`);
})();
