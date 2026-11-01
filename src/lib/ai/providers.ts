/**
 * Server-only AI provider clients (NVIDIA NIM + Cloudflare Workers AI).
 * Keys never leave the server: everything is called from route handlers.
 */

export type AiMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const nvidiaKey = process.env.NVIDIA_API_KEY || '';
const nvidiaReasoning = process.env.NVIDIA_MODEL_REASONING || 'nvidia/nemotron-3-ultra-550b-a55b';
const nvidiaFast = process.env.NVIDIA_MODEL_FAST || 'nvidia/nemotron-3.5-bolt-e4b';
const nvidiaFallback = process.env.NVIDIA_MODEL_FALLBACK || 'openai/gpt-oss-20b';
const cfAccount = process.env.CF_ACCOUNT_ID || '';
const cfToken = process.env.CF_API_TOKEN || '';
const cfModel = process.env.CF_MODEL_FAST || '@cf/meta/llama-3.1-8b-instruct';

const NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

export function nvidiaConfigured() {
  return Boolean(nvidiaKey);
}

export function cloudflareConfigured() {
  return Boolean(cfAccount && cfToken);
}

export function aiProviderStatus() {
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

async function nvidiaRequest(model: string, messages: AiMessage[], opts: ChatOptions) {
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
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error(`NVIDIA returned an empty answer from ${model}.`);
    return content;
  } finally {
    clearTimeout(timer);
  }
}

/** Calls a specific NVIDIA model, retrying once on transient failures. */
export async function nvidiaChat(messages: AiMessage[], opts: ChatOptions = {}) {
  const model = opts.model || nvidiaReasoning;
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

/** Premium reasoning model first, then the configured fallback model. */
export async function nvidiaChatWithFallback(
  messages: AiMessage[],
  opts: ChatOptions & { fallbackModel?: string } = {},
) {
  try {
    return await nvidiaChat(messages, { ...opts, model: opts.model || nvidiaReasoning });
  } catch (primaryError) {
    const fallback = opts.fallbackModel || nvidiaFallback;
    if (fallback === (opts.model || nvidiaReasoning)) throw primaryError;
    return nvidiaChat(messages, { ...opts, model: fallback });
  }
}

export async function cloudflareChat(messages: AiMessage[], opts: ChatOptions = {}) {
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

export const nvidiaModels = { reasoning: nvidiaReasoning, fast: nvidiaFast, fallback: nvidiaFallback };
