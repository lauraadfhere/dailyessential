#!/usr/bin/env node
/**
 * End-to-end check of every service this app depends on.
 *
 * It reads the same variables the Worker reads, validates their shape, and then
 * makes one real call per service so a wrong or dead value fails loudly instead
 * of surfacing later as an empty page or a 503.
 *
 *   node scripts/verify-stack.mjs                      # providers + local env
 *   node scripts/verify-stack.mjs --base http://localhost:3000
 *   node scripts/verify-stack.mjs --base https://dailyessential.<sub>.workers.dev
 *   node scripts/verify-stack.mjs --no-ai              # skip paid AI calls
 *   node scripts/verify-stack.mjs --deep               # also call the reasoning model
 *   node scripts/verify-stack.mjs --env .dev.vars      # read only that env file
 *
 * Exit code is 0 when every required check passes, 1 otherwise.
 * Secret values are never printed — only lengths and pass/fail.
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* ------------------------------------------------------------------ output */

const tty = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const paint = (code, text) => (tty ? `\x1b[${code}m${text}\x1b[0m` : text);
const green = text => paint('32', text);
const red = text => paint('31', text);
const yellow = text => paint('33', text);
const dim = text => paint('2', text);
const bold = text => paint('1', text);

const tally = { pass: 0, warn: 0, fail: 0, skip: 0 };
const failures = [];

function line(mark, painted, name, detail) {
  const suffix = detail ? `  ${dim(detail)}` : '';
  console.log(`  ${painted(mark)} ${name.padEnd(36)}${suffix}`);
}

function section(title) {
  console.log(`\n${bold(title)}`);
}

/**
 * Runs one named check. The callback receives helpers bound to the check name;
 * if it returns normally without calling one of them the check counts as passed.
 */
async function check(name, run, { optional = false } = {}) {
  let settled = false;
  const settle = (bucket, paint) => detail => {
    if (settled) return;
    settled = true;
    tally[bucket] += 1;
    if (bucket === 'fail') failures.push(`${name}${detail ? `: ${detail}` : ''}`);
    line(bucket === 'pass' ? '✓' : bucket === 'fail' ? '✗' : bucket === 'warn' ? '!' : '–', paint, name, detail);
  };
  const helpers = {
    ok: settle('pass', green),
    fail: settle('fail', red),
    warn: settle('warn', yellow),
    skip: settle('skip', dim),
  };

  try {
    await run(helpers);
    if (!settled) helpers.ok();
  } catch (error) {
    const message = (error instanceof Error ? error.message : String(error)).slice(0, 220);
    if (optional) helpers.warn(`optional, not usable: ${message}`);
    else helpers.fail(message);
  }
}

/* ------------------------------------------------------------------- utils */

const TIMEOUT = 20_000;

/** fetch that never throws on HTTP status and always exposes the body. */
async function http(url, init = {}, timeoutMs = TIMEOUT) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* not JSON */
  }
  return { ok: response.ok, status: response.status, headers: response.headers, text, json };
}

function snippet(text) {
  return (text || '').replace(/\s+/g, ' ').trim().slice(0, 140);
}

function isSet(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function looksPlaceholder(value) {
  return /your[-_]|changeme|replace[-_]?me|placeholder|xxxx/i.test(value);
}

function fingerprint(value) {
  return createHash('sha256').update(value).digest('hex').slice(0, 8);
}

/* --------------------------------------------------------------- arguments */

function parseArgs(argv) {
  const out = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) continue;
    const [rawKey, inline] = arg.slice(2).split('=');
    if (inline !== undefined) out[rawKey] = inline;
    else if (argv[index + 1] && !argv[index + 1].startsWith('--')) out[rawKey] = argv[++index];
    else out[rawKey] = true;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const skipAi = Boolean(args['no-ai']);
const deepAi = Boolean(args.deep);

/* -------------------------------------------------------------- env loading */

function parseDotenv(contents) {
  const values = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, '').trim();
    }
    values[match[1]] = value;
  }
  return values;
}

const envFiles = args.env ? [String(args.env)] : ['.env', '.env.local', '.dev.vars', '.dev.vars.local'];
const loadedFiles = [];

for (const file of envFiles) {
  const path = resolve(ROOT, file);
  if (!existsSync(path)) continue;
  const values = parseDotenv(readFileSync(path, 'utf8'));
  for (const [key, value] of Object.entries(values)) {
    // A value already present in the shell always wins, so you can test a
    // rotated key with `PARSE_MASTER_KEY=... node scripts/verify-stack.mjs`.
    if (process.env[key] === undefined || process.env[key] === '') process.env[key] = value;
  }
  loadedFiles.push(file);
}

const env = key => (process.env[key] || '').trim();

/* --------------------------------------------------------------- inventory */

const parseUrl = () => env('PARSE_SERVER_URL') || env('NEXT_PUBLIC_PARSE_SERVER_URL');
const parseAppId = () => env('PARSE_APPLICATION_ID') || env('NEXT_PUBLIC_PARSE_APPLICATION_ID');
const parseMasterKey = () => env('PARSE_MASTER_KEY');
const parseRestKey = () => env('PARSE_REST_KEY') || env('NEXT_PUBLIC_PARSE_REST_KEY');

const cloudName = () => env('CLOUDINARY_CLOUD_NAME') || env('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
const cloudKey = () => env('CLOUDINARY_API_KEY');
const cloudSecret = () => env('CLOUDINARY_API_SECRET');
const cloudPreset = () => env('CLOUDINARY_UPLOAD_PRESET') || env('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');

const nvidiaKey = () => env('NVIDIA_API_KEY');
const nvidiaReasoning = () => env('NVIDIA_MODEL_REASONING') || 'nvidia/nemotron-3-ultra-550b-a55b';
const nvidiaFast = () => env('NVIDIA_MODEL_FAST') || 'nvidia/nemotron-3.5-bolt-e4b';
const nvidiaFallback = () => env('NVIDIA_MODEL_FALLBACK') || nvidiaFast();

const cfAccount = () => env('CF_ACCOUNT_ID');
const cfToken = () => env('CF_API_TOKEN');
const cfModel = () => env('CF_MODEL_FAST') || '@cf/meta/llama-3.1-8b-instruct';

const recoverySecret = () => env('RECOVERY_KEY_SECRET');

const NVIDIA_BASE = 'https://integrate.api.nvidia.com/v1';
const CLOUDINARY_API = 'https://api.cloudinary.com/v1_1';

/* ------------------------------------------------------------------- header */

console.log(bold('BIFTI School — stack check'));
console.log(
  dim(
    `${process.version} · ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC · ` +
      `env: ${loadedFiles.length ? loadedFiles.join(', ') : 'none (shell only)'}`,
  ),
);

/* --------------------------------------------------------- environment shape */

section('Environment');

const REQUIRED = [
  { key: 'PARSE_SERVER_URL', test: value => /^https?:\/\/.+/i.test(value), hint: 'must be an http(s) URL' },
  { key: 'PARSE_APPLICATION_ID', test: value => value.length >= 8, hint: 'too short to be an app id' },
  { key: 'PARSE_MASTER_KEY', test: value => value.length >= 20, hint: 'too short' },
  { key: 'PARSE_REST_KEY', test: value => value.length >= 10, hint: 'too short' },
  { key: 'CLOUDINARY_CLOUD_NAME', test: value => /^[a-z0-9_-]+$/i.test(value), hint: 'use the cloud name, not a URL' },
  { key: 'CLOUDINARY_API_KEY', test: value => /^\d{6,}$/.test(value), hint: 'Cloudinary API keys are numeric' },
  { key: 'CLOUDINARY_API_SECRET', test: value => value.length >= 20, hint: 'too short' },
  { key: 'NVIDIA_API_KEY', test: value => /^nvapi-/.test(value), hint: 'NVIDIA keys start with nvapi-' },
];

const OPTIONAL = [
  { key: 'CF_ACCOUNT_ID', test: value => /^[a-f0-9]{32}$/i.test(value), hint: 'expected 32 hex characters' },
  { key: 'CF_API_TOKEN', test: value => value.length >= 30, hint: 'too short' },
  { key: 'RECOVERY_KEY_SECRET', test: value => value.length >= 32, hint: 'should be at least 32 characters' },
];

for (const entry of REQUIRED) {
  await check(entry.key, ({ ok, fail }) => {
    const value = env(entry.key);
    if (!isSet(value)) return fail('missing');
    if (looksPlaceholder(value)) return fail('still holds a placeholder value');
    if (!entry.test(value)) return fail(`malformed — ${entry.hint} (len ${value.length})`);
    ok(`set (len ${value.length})`);
  });
}

for (const entry of OPTIONAL) {
  await check(
    entry.key,
    ({ ok, warn, skip }) => {
      const value = env(entry.key);
      if (!isSet(value)) {
        if (entry.key === 'RECOVERY_KEY_SECRET') {
          return warn('not set — recovery keys fall back to the Parse master key');
        }
        return skip('not set (optional second AI provider)');
      }
      if (looksPlaceholder(value)) return warn('still holds a placeholder value');
      if (!entry.test(value)) return warn(`looks malformed — ${entry.hint} (len ${value.length})`);
      ok(`set (len ${value.length})`);
    },
    { optional: true },
  );
}

const PUBLIC_VARS = [
  'NEXT_PUBLIC_PARSE_SERVER_URL',
  'NEXT_PUBLIC_PARSE_APPLICATION_ID',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET',
  'NEXT_PUBLIC_SITE_URL',
];

console.log(dim('  NEXT_PUBLIC_* are inlined at build time — the Worker never reads them at runtime'));

for (const key of PUBLIC_VARS) {
  await check(
    key,
    ({ ok, warn }) => {
      const value = env(key);
      if (!isSet(value)) return warn('not set — inlined at build time, so the build ships it empty');
      ok(`set (len ${value.length})`);
    },
    { optional: true },
  );
}

/* --------------------------------------------------------------------- Parse */

section('Parse (database + auth)');

const PARSE_READY = isSet(parseUrl()) && isSet(parseAppId());

if (!PARSE_READY) {
  await check('Parse', ({ skip }) => skip('PARSE_SERVER_URL / PARSE_APPLICATION_ID missing'));
} else {
  const base = parseUrl().replace(/\/$/, '');

  await check('Parse reachable', async ({ ok, fail }) => {
    const health = await http(`${base}/health`, { headers: { 'X-Parse-Application-Id': parseAppId() } }, 15_000);
    if (health.ok && health.json?.status === 'ok') return ok(`GET /health → 200 ok`);
    if (health.ok) return ok(`GET /health → 200 ${snippet(health.text)}`);
    // Back4App puts /health behind an app id; a 401 still proves the parse host is alive.
    if (health.status === 401 || health.status === 403) {
      return ok(`GET /health → ${health.status} (protected by the host; session checks below prove the database)`);
    }
    const root = await http(`${base}/`, {}, 15_000);
    if (root.ok && root.json) return ok(`GET / → 200 (Parse ${root.json.version || 'responding'})`);
    fail(`GET /health → ${health.status} ${snippet(health.text)}`);
  });

  await check('Parse master key accepted', async ({ ok, fail }) => {
    const result = await http(`${base}/schemas`, {
      headers: { 'X-Parse-Application-Id': parseAppId(), 'X-Parse-Master-Key': parseMasterKey() },
    });
    if (result.status === 200 && Array.isArray(result.json?.results)) {
      const classes = result.json.results.map(row => row.className).filter(Boolean);
      const hasOrg = classes.includes('Organization');
      return ok(`${classes.length} classes readable${hasOrg ? ' (Organization present)' : ' — Organization missing'}`);
    }
    if (result.status === 401 || result.status === 403) {
      return fail(`master key rejected (${result.status}) ${snippet(result.text)}`);
    }
    fail(`GET /schemas → ${result.status} ${snippet(result.text)}`);
  });

  await check('Parse REST key accepted', async ({ ok, fail, warn }) => {
    const result = await http(`${base}/classes/_User?limit=1`, {
      headers: {
        'X-Parse-Application-Id': parseAppId(),
        'X-Parse-REST-API-Key': parseRestKey(),
      },
    });
    if (result.status === 200) return ok('REST key can query _User');
    if (result.json?.code === 119) return warn('REST key accepted, but class-level permissions deny reads');
    if (result.status === 401 || result.status === 403) {
      return fail(`REST key rejected (${result.status}) ${snippet(result.text)}`);
    }
    fail(`GET /classes/_User → ${result.status} ${snippet(result.text)}`);
  });

  await check('Parse public keys match server keys', async ({ ok, warn }) => {
    const serverUrl = env('PARSE_SERVER_URL');
    const publicUrl = env('NEXT_PUBLIC_PARSE_SERVER_URL');
    const appId = env('PARSE_APPLICATION_ID');
    const publicAppId = env('NEXT_PUBLIC_PARSE_APPLICATION_ID');
    const mismatches = [];
    if (serverUrl && publicUrl && serverUrl.replace(/\/$/, '') !== publicUrl.replace(/\/$/, '')) {
      mismatches.push('server URL');
    }
    if (appId && publicAppId && appId !== publicAppId) mismatches.push('application id');
    if (mismatches.length) {
      return warn(`browser and server point at different ${mismatches.join(' + ')}`);
    }
    ok('browser and server use the same app');
  });
}

/* ---------------------------------------------------------------- Cloudinary */

section('Cloudinary (media)');

const CLOUDINARY_READY = isSet(cloudName()) && isSet(cloudKey()) && isSet(cloudSecret());

function signCloudinary(params) {
  const toSign = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== '')
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(`${toSign}${cloudSecret()}`).digest('hex');
}

if (!CLOUDINARY_READY) {
  await check('Cloudinary', ({ skip }) => skip('cloud name / API key / API secret missing'));
} else {
  const auth = `Basic ${Buffer.from(`${cloudKey()}:${cloudSecret()}`).toString('base64')}`;

  await check('Cloudinary credentials', async ({ ok, fail }) => {
    const result = await http(`${CLOUDINARY_API}/${cloudName()}/usage`, {
      headers: { Authorization: auth },
    });
    if (result.ok && result.json) {
      const used = result.json.credits?.used_percent;
      const plan = result.json.plan || 'unknown plan';
      return ok(`${plan}${used !== undefined ? `, ${used}% of credits used` : ''}`);
    }
    if (result.status === 401) return fail('API key or secret rejected (401)');
    fail(`GET /usage → ${result.status} ${snippet(result.text)}`);
  });

  await check('Cloudinary signed upload', async ({ ok, fail }) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'bifti/verify';
    const publicId = `stack-check-${timestamp}`;
    const signature = signCloudinary({ folder, public_id: publicId, timestamp });
    const png =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    const form = new FormData();
    form.append('file', `data:image/png;base64,${png}`);
    form.append('api_key', cloudKey());
    form.append('timestamp', String(timestamp));
    form.append('signature', signature);
    form.append('folder', folder);
    form.append('public_id', publicId);

    const upload = await http(`${CLOUDINARY_API}/${cloudName()}/image/upload`, {
      method: 'POST',
      body: form,
    });
    if (!upload.ok) return fail(`upload rejected (${upload.status}) ${snippet(upload.text)}`);

    const url = upload.json?.secure_url;

    // Prove delivery works, then remove the test asset so the account stays clean.
    const delivery = url ? await http(url, { method: 'HEAD' }) : { ok: false, status: 0 };
    const publicIdToDelete = upload.json?.public_id ?? '';
    const destroyTimestamp = Math.floor(Date.now() / 1000);
    const destroyForm = new FormData();
    destroyForm.append('public_id', publicIdToDelete);
    destroyForm.append('api_key', cloudKey());
    destroyForm.append('timestamp', String(destroyTimestamp));
    destroyForm.append('signature', signCloudinary({ public_id: publicIdToDelete, timestamp: destroyTimestamp }));
    const destroy = await http(`${CLOUDINARY_API}/${cloudName()}/image/destroy`, {
      method: 'POST',
      body: destroyForm,
    });

    const cleaned = destroy.json?.result === 'ok' ? 'test asset deleted' : 'test asset left behind';
    if (!delivery.ok) return fail(`uploaded, but delivery returned ${delivery.status} (${cleaned})`);
    ok(`upload → ${delivery.status} ok, ${cleaned}`);
  });

  await check(
    'Cloudinary upload preset',
    ({ ok, warn, skip }) => {
      if (!isSet(cloudPreset())) return skip('no upload preset configured (only needed for unsigned browser uploads)');
      return http(`${CLOUDINARY_API}/${cloudName()}/upload_presets/${encodeURIComponent(cloudPreset())}`, {
        headers: { Authorization: auth },
      }).then(async result => {
        if (result.ok) return ok(`preset "${cloudPreset()}" exists (${result.json?.unsigned ? 'unsigned' : 'signed'})`);
        if (result.status === 404) {
          const listing = await http(`${CLOUDINARY_API}/${cloudName()}/upload_presets?max_results=50`, {
            headers: { Authorization: auth },
          });
          const names = (listing.json?.presets || []).map(preset => preset.name);
          return warn(
            `preset "${cloudPreset()}" does not exist here — available: ${names.length ? names.join(', ') : '(none)'}`,
          );
        }
        warn(`could not confirm preset (${result.status})`);
      });
    },
    { optional: true },
  );
}

/* ------------------------------------------------------------------- NVIDIA */

section('NVIDIA NIM (primary AI)');

if (skipAi) {
  await check('NVIDIA', ({ skip }) => skip('skipped by --no-ai'));
} else if (!isSet(nvidiaKey())) {
  await check('NVIDIA', ({ fail }) => fail('NVIDIA_API_KEY is missing — no AI provider is configured'));
} else {
  let liveModels = null;

  await check('NVIDIA key accepted', async ({ ok, fail }) => {
    const result = await http(`${NVIDIA_BASE}/models`, {
      headers: { Authorization: `Bearer ${nvidiaKey()}` },
    });
    if (result.ok && Array.isArray(result.json?.data)) {
      liveModels = new Set(result.json.data.map(row => row.id));
      return ok(`${liveModels.size} models available to this key`);
    }
    if (result.status === 401 || result.status === 403) return fail(`key rejected (${result.status})`);
    fail(`GET /models → ${result.status} ${snippet(result.text)}`);
  });

  await check(
    'Configured model names are live',
    ({ ok, warn, skip }) => {
      if (!liveModels) return skip('model list unavailable');
      const configured = [
        ['NVIDIA_MODEL_FAST', nvidiaFast()],
        ['NVIDIA_MODEL_REASONING', nvidiaReasoning()],
        ['NVIDIA_MODEL_FALLBACK', nvidiaFallback()],
      ];
      const missing = configured.filter(([, model]) => !liveModels.has(model));
      if (!missing.length) return ok('fast, reasoning and fallback all exist');
      return warn(
        `not in the model list: ${missing.map(([key, model]) => `${key}=${model}`).join(', ')} — retired names answer 404/410`,
      );
    },
    { optional: true },
  );

  await check('NVIDIA chat completion (fast model)', async ({ ok, fail }) => {
    const started = Date.now();
    const result = await http(
      `${NVIDIA_BASE}/chat/completions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${nvidiaKey()}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          model: nvidiaFast(),
          messages: [{ role: 'user', content: 'Reply with the single word OK.' }],
          temperature: 0,
          max_tokens: 8,
          stream: false,
        }),
      },
      90_000,
    );
    const latency = Date.now() - started;
    if (!result.ok) return fail(`${nvidiaFast()} → ${result.status} ${snippet(result.text)}`);
    const message = result.json?.choices?.[0]?.message;
    const content = (message?.content || message?.reasoning_content || '').trim();
    if (!content) return fail(`${nvidiaFast()} answered with an empty message`);
    ok(`${nvidiaFast()} → "${content.slice(0, 40)}" in ${latency}ms`);
  }, { optional: false });

  if (deepAi) {
    await check('NVIDIA chat completion (reasoning model)', async ({ ok, fail }) => {
      const started = Date.now();
      const result = await http(
        `${NVIDIA_BASE}/chat/completions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${nvidiaKey()}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            model: nvidiaReasoning(),
            messages: [{ role: 'user', content: 'Reply with the single word OK.' }],
            temperature: 0,
            max_tokens: 32,
            stream: false,
          }),
        },
        120_000,
      );
      const latency = Date.now() - started;
      if (!result.ok) return fail(`${nvidiaReasoning()} → ${result.status} ${snippet(result.text)}`);
      const message = result.json?.choices?.[0]?.message;
      const content = (message?.content || message?.reasoning_content || '').trim();
      if (!content) return warn(`${nvidiaReasoning()} replied without content (reasoning-only output)`);
      ok(`${nvidiaReasoning()} in ${latency}ms`);
    }, { optional: true });
  }
}

/* --------------------------------------------------- Cloudflare Workers AI */

section('Cloudflare Workers AI (optional fallback)');

if (skipAi) {
  await check('Cloudflare Workers AI', ({ skip }) => skip('skipped by --no-ai'));
} else if (!isSet(cfAccount()) || !isSet(cfToken())) {
  await check('Cloudflare Workers AI', ({ skip }) =>
    skip('CF_ACCOUNT_ID / CF_API_TOKEN not set — only needed as a second provider'),
  );
} else {
  await check('Cloudflare token valid', async ({ ok, fail }) => {
    const result = await http('https://api.cloudflare.com/client/v4/user/tokens/verify', {
      headers: { Authorization: `Bearer ${cfToken()}` },
    });
    if (result.ok && result.json?.success) return ok(`token ${result.json.result?.status || 'active'}`);
    if (result.status === 401) return fail('token rejected (401)');
    fail(`verify → ${result.status} ${snippet(result.text)}`);
  });

  await check('Workers AI inference', async ({ ok, fail }) => {
    const started = Date.now();
    const result = await http(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccount()}/ai/run/${cfModel()}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${cfToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Reply with the single word OK.' }],
          max_tokens: 16,
        }),
      },
      60_000,
    );
    const latency = Date.now() - started;
    if (!result.ok || result.json?.success === false) {
      return fail(`${cfModel()} → ${result.status} ${snippet(result.text)}`);
    }
    const content = (result.json?.result?.response || '').trim();
    if (!content) return fail('model answered with an empty response');
    ok(`${cfModel()} → "${content.slice(0, 40)}" in ${latency}ms`);
  });
}

/* ------------------------------------------------------- application surface */

const explicitBase = typeof args.base === 'string' ? args.base.replace(/\/$/, '') : '';
let appBase = explicitBase;

if (!appBase) {
  for (const candidate of ['http://localhost:3000', 'http://localhost:3001']) {
    try {
      const probe = await http(`${candidate}/api/ai/status`, {}, 1500);
      if (probe.status > 0) {
        appBase = candidate;
        break;
      }
    } catch {
      /* nothing listening */
    }
  }
}

section(`Application endpoints${appBase ? ` (${appBase})` : ''}`);

if (!appBase) {
  await check('App endpoints', ({ skip }) =>
    skip('no dev server found — start one and pass --base http://localhost:3000'),
  );
} else {
  await check('GET /api/ai/status', async ({ ok, fail, warn }) => {
    const result = await http(`${appBase}/api/ai/status`);
    if (!result.ok) return fail(`${result.status} ${snippet(result.text)}`);
    const body = result.json || {};
    const localNvidia = isSet(nvidiaKey()) && !skipAi;
    const localCloudflare = isSet(cfAccount()) && isSet(cfToken()) && !skipAi;
    if (localNvidia && !body.nvidia) return fail('server reports NVIDIA unconfigured but NVIDIA_API_KEY is set locally — the secret is not reaching the Worker');
    if (localCloudflare && !body.cloudflare) return fail('server reports Cloudflare AI unconfigured but CF_* is set locally');
    if (!body.ok) return warn('no AI provider is live on this server');
    ok(`nvidia=${Boolean(body.nvidia)} cloudflare=${Boolean(body.cloudflare)} fast=${body.models?.fast ?? '?'}`);
  });

  await check('GET /api/media/upload', async ({ ok, fail }) => {
    const result = await http(`${appBase}/api/media/upload`);
    if (!result.ok) return fail(`${result.status} ${snippet(result.text)}`);
    if (!result.json?.configured && CLOUDINARY_READY) {
      return fail('server reports Cloudinary unconfigured but all three values are set locally');
    }
    ok(`configured=${Boolean(result.json?.configured)} cloud=${result.json?.cloudinary?.cloudName ?? '?'}`);
  });

  await check('GET /api/media/sign', async ({ ok, fail, warn }) => {
    const result = await http(`${appBase}/api/media/sign?folder=bifti/verify`);
    if (!result.ok) return fail(`${result.status} ${snippet(result.text)}`);
    const body = result.json || {};
    if (!body.ok) return fail('signing failed on the server');
    if (!isSet(cloudSecret())) return ok('signature issued (no local secret to compare)');
    const expected = createHash('sha1')
      .update(`folder=${body.folder}&timestamp=${body.timestamp}${cloudSecret()}`)
      .digest('hex');
    if (expected === body.signature) return ok('signature matches the local CLOUDINARY_API_SECRET');
    warn('signature differs from the local secret — the deployed secret was rotated or is different');
  });

  await check('GET /api/qr', async ({ ok, fail }) => {
    const result = await http(`${appBase}/api/qr?data=stack-check&size=120`);
    if (!result.ok) return fail(`${result.status} ${snippet(result.text)}`);
    const type = result.headers.get('content-type') || '';
    if (!type.includes('image/svg+xml') || !result.text.includes('<svg')) {
      return fail(`unexpected payload (${type})`);
    }
    ok(`SVG rendered (${result.text.length} bytes)`);
  });

  await check('GET /api/courses', async ({ ok, fail, warn }) => {
    const result = await http(`${appBase}/api/courses?limit=1`);
    if (!result.ok) return fail(`${result.status} ${snippet(result.text)}`);
    const body = result.json || {};
    if (!body.count) return warn(`no courses returned (source=${body.source ?? 'unknown'}) — schema may be empty`);
    ok(`${body.count} course(s) from ${body.source}`);
  });

  await check('GET / (app shell)', async ({ ok, fail }) => {
    const result = await http(`${appBase}/`);
    if (!result.ok) return fail(`${result.status} ${snippet(result.text)}`);
    if (!(result.headers.get('content-type') || '').includes('text/html')) {
      return fail(`expected HTML, got ${result.headers.get('content-type')}`);
    }
    ok(`HTML in ${result.text.length} bytes`);
  });

  if (skipAi) {
    await check('POST /api/ai/study-buddy', ({ skip }) => skip('skipped by --no-ai'));
  } else {
    await check('POST /api/ai/study-buddy', async ({ ok, fail }) => {
      const started = Date.now();
      const result = await http(
        `${appBase}/api/ai/study-buddy`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'stack-check@visitor.dailyessential.school',
            question: 'In one short sentence, what is 2 + 2?',
            scope: 'portal',
          }),
        },
        90_000,
      );
      const latency = Date.now() - started;
      if (!result.ok) return fail(`${result.status} ${snippet(result.text)}`);
      const text = result.json?.answer || result.json?.text || result.json?.reply || '';
      if (!text) return fail('endpoint answered without text');
      ok(`${result.json?.provider ?? 'ai'} in ${latency}ms — "${String(text).replace(/\s+/g, ' ').slice(0, 50)}…"`);
    });
  }
}

/* ------------------------------------------------------------------ summary */

const total = tally.pass + tally.warn + tally.fail + tally.skip;
const summary = [
  `${total} checks`,
  `${green(`${tally.pass} passed`)}`,
  tally.warn ? yellow(`${tally.warn} warning${tally.warn === 1 ? '' : 's'}`) : `${tally.warn} warnings`,
  `${tally.skip} skipped`,
  tally.fail ? red(`${tally.fail} failed`) : `${tally.fail} failed`,
].join(' · ');

console.log(`\n${bold('Summary')}\n  ${summary}`);

if (failures.length) {
  console.log(`\n${red('Failures')}`);
  for (const failure of failures) console.log(`  ${red('✗')} ${failure}`);
}

if (!tally.fail) console.log(`\n${green('Everything that should work, works.')}`);

process.exit(tally.fail ? 1 : 0);
