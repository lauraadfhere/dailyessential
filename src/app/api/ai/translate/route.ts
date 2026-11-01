import { NextRequest, NextResponse } from 'next/server';
import { aiProviderStatus } from '../../../../lib/ai/providers';
import { checkRateLimit, extractJson, runAI } from '../../../../lib/ai/engine';
import type { Locale } from '../../../../lib/i18n/config';

export const runtime = 'nodejs';
export const maxDuration = 60;

const TARGETS: Locale[] = ['fr', 'ar'];
const MAX_TEXTS = 40;
const MAX_CHARS = 220;
const MAX_TOTAL = 6000;

/** Shared phrase cache: a phrase is translated once for every visitor. */
const cache = new Map<string, { value: string; expires: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24 * 30;
const CACHE_LIMIT = 8000;

const LANGUAGE: Record<Exclude<Locale, 'en'>, string> = {
  fr: 'French',
  ar: 'Arabic',
};

const SYSTEM = `You are a professional localiser for a school website.
You translate short interface strings from English into the requested language.
Rules:
- Keep brand names unchanged: Daily Essential, Daily Essential School, DAMMI, DAMMI AI, PDF, QR, DZD, USD, ID.
- Keep numbers, times, dates, symbols and emoji unchanged.
- Keep the same tone: short, clear, welcoming, suitable for learners and parents.
- Never add explanations, notes or extra punctuation.
- Reply with JSON only.`;

function clamp(text: string) {
  return text.replace(/\s+/g, ' ').trim().slice(0, MAX_CHARS);
}

function looksTranslatable(text: string) {
  if (text.length < 2 || text.length > MAX_CHARS) return false;
  if (!/[A-Za-z]{2}/.test(text)) return false;
  if (/^https?:|^\/|^[\w.-]+@[\w.-]+$/.test(text)) return false;
  if (/^\d+([.,:/-]\d+)?$/.test(text)) return false;
  return true;
}

export async function POST(request: NextRequest) {
  const status = aiProviderStatus();
  if (!status.nvidia && !status.cloudflare) {
    return NextResponse.json({ error: 'Translation is not available until the AI provider is configured.' }, { status: 503 });
  }

  let body: { locale?: string; texts?: unknown };
  try {
    body = (await request.json()) as { locale?: string; texts?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const locale = String(body.locale || '').toLowerCase() as Locale;
  if (!TARGETS.includes(locale)) {
    return NextResponse.json({ error: 'Only fr and ar are supported.' }, { status: 400 });
  }

  const incoming = Array.isArray(body.texts) ? body.texts : [];
  const texts = [...new Set(incoming.map(item => clamp(String(item ?? ''))).filter(looksTranslatable))].slice(0, MAX_TEXTS);
  if (!texts.length) return NextResponse.json({ translations: {} });

  const totalChars = texts.reduce((sum, text) => sum + text.length, 0);
  if (totalChars > MAX_TOTAL) {
    return NextResponse.json({ error: 'Too much text in one request.' }, { status: 413 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const limit = checkRateLimit(`translate:${ip}`, 'translate');
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Translation limit reached for today.' }, { status: 429 });
  }

  const translations: Record<string, string> = {};
  const missing: string[] = [];

  texts.forEach(text => {
    const key = `${locale}:${text}`;
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) translations[text] = hit.value;
    else missing.push(text);
  });

  if (!missing.length) return NextResponse.json({ translations, cached: true });

  const numbered = missing.map((text, index) => `[${index}] ${text}`).join('\n');
  const messages = [
    { role: 'system' as const, content: SYSTEM },
    {
      role: 'user' as const,
      content: `Translate each numbered English interface string into ${LANGUAGE[locale as Exclude<Locale, 'en'>]}.\nReturn a JSON object whose keys are the numbers as strings ("0", "1", …) and whose values are the translations. Keep every entry, even if it is one word.\n\n${numbered}`,
    },
  ];

  try {
    const result = await runAI('hint', messages, { temperature: 0.2, maxTokens: 1600, json: true });
    const parsed = extractJson<Record<string, string>>(result.text);

    missing.forEach((text, index) => {
      const value = parsed[String(index)];
      if (typeof value !== 'string') return;
      const clean = value.replace(/\s+/g, ' ').trim();
      if (!clean) return;
      translations[text] = clean;
      if (cache.size >= CACHE_LIMIT) cache.clear();
      cache.set(`${locale}:${text}`, { value: clean, expires: Date.now() + CACHE_TTL });
    });

    return NextResponse.json({ translations, provider: result.provider, model: result.model });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Translation failed.',
        translations,
      },
      { status: 502 },
    );
  }
}
