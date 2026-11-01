import { isParseConfigured, parseCreate } from '../parse-server';
import {
  aiProviderStatus,
  cloudflareChat,
  nvidiaChatWithFallback,
  nvidiaModels,
  type AiMessage,
} from './providers';

export type AiTask =
  | 'study_buddy'
  | 'test_generation'
  | 'essay_eval'
  | 'feedback'
  | 'admission_summary'
  | 'hint'
  | 'moderation'
  | 'translate';

/** Tasks that need the premium reasoning model rather than the fast one. */
const HEAVY_TASKS: AiTask[] = ['test_generation', 'essay_eval', 'admission_summary'];

const DAILY_LIMITS: Record<AiTask, number> = {
  study_buddy: 60,
  hint: 80,
  feedback: 40,
  test_generation: 40,
  essay_eval: 80,
  admission_summary: 60,
  moderation: 150,
  // Interface localisation: the whole UI is translated once, then served from cache.
  translate: 4000,
};

/** In-process guards; replace with a shared store when running more than one instance. */
const rateBuckets = new Map<string, { day: string; count: number }>();
const cache = new Map<string, { value: string; expires: number }>();

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function checkRateLimit(userId: string, task: AiTask) {
  const key = `${userId}:${task}`;
  const day = today();
  const bucket = rateBuckets.get(key);
  const count = bucket && bucket.day === day ? bucket.count : 0;
  const limit = DAILY_LIMITS[task];
  if (count >= limit) return { allowed: false, remaining: 0, limit };
  rateBuckets.set(key, { day, count: count + 1 });
  return { allowed: true, remaining: limit - count - 1, limit };
}

let logSchemaReady = false;

async function ensureLogSchema() {
  if (!isParseConfigured() || logSchemaReady) return;
  logSchemaReady = true;
  try {
    const { hasParseMasterKey, parseServerRequest } = await import('../parse-server');
    if (!hasParseMasterKey()) return;
    await parseServerRequest('schemas/AILog', {
      method: 'POST',
      body: JSON.stringify({
        className: 'AILog',
        fields: {
          userId: { type: 'String' },
          feature: { type: 'String' },
          provider: { type: 'String' },
          model: { type: 'String' },
          latencyMs: { type: 'Number' },
          ok: { type: 'Boolean' },
          error: { type: 'String' },
        },
      }),
    });
  } catch {
    /* class already exists */
  }
}

export async function logAiCall(entry: {
  userId: string;
  feature: AiTask;
  provider: 'nvidia' | 'cloudflare';
  model: string;
  latencyMs: number;
  ok: boolean;
  error?: string;
}) {
  if (!isParseConfigured()) return;
  await ensureLogSchema();
  try {
    await parseCreate('AILog', { ...entry, error: entry.error?.slice(0, 400) || '' });
  } catch {
    /* logging must never break a learner request */
  }
}

export type RunAiResult = {
  text: string;
  provider: 'nvidia' | 'cloudflare';
  model: string;
  latencyMs: number;
};

export async function runAI(
  task: AiTask,
  messages: AiMessage[],
  opts: { userId?: string; temperature?: number; maxTokens?: number; json?: boolean } = {},
): Promise<RunAiResult> {
  const status = aiProviderStatus();
  if (!status.nvidia && !status.cloudflare) {
    throw new Error('AI is not configured yet. Add NVIDIA_API_KEY on the server.');
  }

  const heavy = HEAVY_TASKS.includes(task);
  const started = Date.now();
  const userId = opts.userId || 'anonymous';

  if (status.nvidia) {
    try {
      const model = heavy ? nvidiaModels.reasoning : nvidiaModels.fast;
      const text = await nvidiaChatWithFallback(messages, {
        model,
        temperature: opts.temperature,
        maxTokens: opts.maxTokens,
        json: opts.json,
      });
      const latencyMs = Date.now() - started;
      void logAiCall({ userId, feature: task, provider: 'nvidia', model, latencyMs, ok: true });
      return { text, provider: 'nvidia', model, latencyMs };
    } catch (error) {
      void logAiCall({
        userId,
        feature: task,
        provider: 'nvidia',
        model: heavy ? nvidiaModels.reasoning : nvidiaModels.fast,
        latencyMs: Date.now() - started,
        ok: false,
        error: error instanceof Error ? error.message : 'unknown error',
      });
      if (!status.cloudflare) throw error;
    }
  }

  const text = await cloudflareChat(messages, {
    temperature: opts.temperature,
    maxTokens: opts.maxTokens,
  });
  const latencyMs = Date.now() - started;
  void logAiCall({
    userId,
    feature: task,
    provider: 'cloudflare',
    model: status.models.cloudflareFast,
    latencyMs,
    ok: true,
  });
  return { text, provider: 'cloudflare', model: status.models.cloudflareFast, latencyMs };
}

/** Short-lived cache for repeated prompts. */
export async function runCached(
  key: string,
  ttlMs: number,
  produce: () => Promise<RunAiResult>,
): Promise<RunAiResult> {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) {
    return { text: hit.value, provider: 'nvidia', model: 'cache', latencyMs: 0 };
  }
  const result = await produce();
  if (cache.size > 300) cache.clear();
  cache.set(key, { value: result.text, expires: Date.now() + ttlMs });
  return result;
}

/** Pull the first JSON object or array out of a model reply (handles ``` fences and chatter). */
export function extractJson<T>(text: string): T {
  const cleaned = text.replace(/```(?:json)?/gi, '').trim();
  const objectStart = cleaned.indexOf('{');
  const arrayStart = cleaned.indexOf('[');
  const start = arrayStart >= 0 && (objectStart < 0 || arrayStart < objectStart) ? arrayStart : objectStart;
  if (start < 0) throw new Error('The AI reply did not contain JSON.');

  const open = cleaned[start];
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < cleaned.length; index++) {
    const char = cleaned[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === open) depth += 1;
    else if (char === close) {
      depth -= 1;
      if (depth === 0) return JSON.parse(cleaned.slice(start, index + 1)) as T;
    }
  }
  throw new Error('The AI reply contained incomplete JSON.');
}
