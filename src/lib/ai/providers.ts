/**
 * Server-only AI provider clients (NVIDIA NIM + Cloudflare Workers AI).
 * Keys never leave the server: everything is called from route handlers.
 */

export type AiMessage = { role: 'system' | 'user' | 'assistant'; content: string };

/** Read lazily: on Workers, secrets are only on process.env while a request is being handled. */
function cfg() {
  const nvidiaFast = process.env.NVIDIA_MODEL_FAST || 'nvidia/nemotron-3.5-bolt-e4b';
  return {
    nvidiaKey: process.env.NVIDIA_API_KEY || '',
    nvidiaReasoning: process.env.NVIDIA_MODEL_REASONING || 'nvidia/nemotron-3-ultra-550b-a55b',
    nvidiaFast,
    nvidiaFallback: process.env.NVIDIA_MODEL_FALLBACK || nvidiaFast,
    cfAccount: process.env.CF_ACCOUNT_ID || '',
    cfToken: process.env.CF_API_TOKEN || '',
    cfModel: process.env.CF_MODEL_FAST || '@cf/meta/llama-3.1-8b-instruct',
  };
}

const NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

export function nvidiaConfigured() {
  return Boolean(cfg().nvidiaKey);
}

export function cloudflareConfigured() {
  const { cfAccount, cfToken } = cfg();
  return Boolean(cfAccount && cfToken);
}

export function aiProviderStatus() {
  const { nvidiaReasoning, nvidiaFast, nvidiaFallback, cfModel } = cfg();
  return {
    provider: 'nvidia',
    nvidia: nvidiaConfigured(),
    cloudflare: cloudflareConfigured(),
    models: {
      reasoning: nvidiaReasoning,
      fast: nvidiaFast,
      fallback: nvidiaFallback,
      cloudflareFast: cfModel,
    },
  };
}

type ChatOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
  timeoutMs?: number;
};

/** Reasoning models may prefix answers with a <think> block. Learners must never see it. */
export function cleanAnswer(text: string) {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/^\s*<\/think>/i, '').trim();
}

async function nvidiaRequest(model: string, messages: AiMessage[], opts: ChatOptions) {
  const { nvidiaKey } = cfg();
  if (!nvidiaKey) throw new Error('NVIDIA is not configured. Add NVIDIA_API_KEY on the server.');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 60_000);
  try {
    const response = await fetch(NVIDIA_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${nvidiaKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.3,
        max_tokens: opts.maxTokens ?? 1200,
        ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
      }),
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 240);
      const error = new Error(`NVIDIA ${response.status} (${model}): ${detail}`);
      (error as Error & { status?: number }).status = response.status;
      throw error;
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string | null }; finish_reason?: string }[];
    };
    const raw = data.choices?.[0]?.message?.content?.trim();
    const content = raw ? cleanAnswer(raw) : '';
    if (!content) throw new Error(`NVIDIA returned an empty answer from ${model}.`);
    return content;
  } finally {
    clearTimeout(timer);
  }
}

/** Calls a specific NVIDIA model, retrying once on transient failures. */
export async function nvidiaChat(messages: AiMessage[], opts: ChatOptions = {}) {
  const model = opts.model || cfg().nvidiaReasoning;
  try {
    return await nvidiaRequest(model, messages, opts);
  } catch (error) {
    const status = (error as Error & { status?: number }).status;
    const retryable = status === undefined || status === 429 || status >= 500;
    if (!retryable) throw error;
    await new Promise(resolve => setTimeout(resolve, 600));
    return nvidiaRequest(model, messages, opts);
  }
}

/**
 * Model used when the primary one fails. A fallback that repeats the primary
 * model is useless, so we always land on the other live model instead of a
 * retired name (retired NVIDIA models answer 410 Gone or stop responding).
 */
export function resolveFallbackModel(primary: string, preferred?: string) {
  const { nvidiaFast, nvidiaReasoning, nvidiaFallback } = cfg();
  const candidate = preferred || nvidiaFallback;
  if (candidate && candidate !== primary) return candidate;
  return primary === nvidiaFast ? nvidiaReasoning : nvidiaFast;
}

/** Premium reasoning model first, then a different live model. */
export async function nvidiaChatWithFallback(
  messages: AiMessage[],
  opts: ChatOptions & { fallbackModel?: string } = {},
) {
  const primary = opts.model || cfg().nvidiaReasoning;
  try {
    return await nvidiaChat(messages, { ...opts, model: primary });
  } catch {
    const fallback = resolveFallbackModel(primary, opts.fallbackModel);
    return nvidiaChat(messages, { ...opts, model: fallback, timeoutMs: opts.timeoutMs ?? 45_000 });
  }
}

export async function cloudflareChat(messages: AiMessage[], opts: ChatOptions = {}) {
  const { cfAccount, cfToken, cfModel } = cfg();
  if (!cfAccount || !cfToken) throw new Error('Cloudflare Workers AI is not configured.');
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${cfAccount}/ai/run/${cfModel}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        temperature: opts.temperature ?? 0.4,
        max_tokens: opts.maxTokens ?? 800,
      }),
      cache: 'no-store',
    },
  );
  if (!response.ok) throw new Error(`Cloudflare ${response.status}: ${(await response.text()).slice(0, 160)}`);
  const data = (await response.json()) as { result?: { response?: string } };
  const content = data.result?.response;
  if (!content) throw new Error('Cloudflare Workers AI returned an empty answer.');
  return content;
}

/** Current model names (resolved on every access so Worker secrets are always read at request time). */
export const nvidiaModels = {
  get reasoning() { return cfg().nvidiaReasoning; },
  get fast() { return cfg().nvidiaFast; },
  get fallback() { return cfg().nvidiaFallback; },
};
