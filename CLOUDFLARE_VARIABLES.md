# Cloudflare variables manifest

Every runtime value this project reads through `process.env`, and where each one has to
live on Cloudflare. Derived from `.env.local` plus a scan of `src/` and `scripts/`.

There are two different mechanisms, and mixing them up is the usual cause of a deploy that
"builds fine" but runs with missing config:

| Kind | Set in | Why |
| --- | --- | --- |
| **Worker secrets** (`PARSE_*`, `NVIDIA_*`, `CLOUDINARY_*`, `CF_*`, `RECOVERY_KEY_SECRET`) | Worker → Settings → Variables and Secrets | read at request time by route handlers |
| **Build-time public values** (`NEXT_PUBLIC_*`) | Cloudflare build environment (Workers Builds → Build variables and secrets) | inlined into the client bundle while `vite build` runs; absent at build time means the value is baked in as `undefined` |

Server secrets must also be declared in `cloudflare.config.ts` (already done) — the adapter
only injects a local `.dev.vars` value for bindings that are declared there.

---

## 1. Required for the app to work at all

| Variable | Type | Used by | Without it |
| --- | --- | --- | --- |
| `PARSE_SERVER_URL` | server secret | `src/lib/parse-server.ts` | every database read/write and all sign-in fails |
| `PARSE_APPLICATION_ID` | server secret | `src/lib/parse-server.ts` | as above |
| `PARSE_MASTER_KEY` | server secret | `src/lib/parse-server.ts`, schema scripts | admin/server-side writes fail |

## 2. AI features

| Variable | Type | Required | Default if unset |
| --- | --- | --- | --- |
| `NVIDIA_API_KEY` | server secret | **yes** for AI | AI endpoints return `503` "not configured" |
| `NVIDIA_MODEL_REASONING` | server secret | no | `nvidia/nemotron-3-ultra-550b-a55b` |
| `NVIDIA_MODEL_FAST` | server secret | no | `nvidia/nemotron-3.5-bolt-e4b` |
| `NVIDIA_MODEL_FALLBACK` | server secret | no | falls back to the other live model automatically |
| `CF_ACCOUNT_ID` | server secret | no | Cloudflare Workers AI fallback disabled |
| `CF_API_TOKEN` | server secret | no | as above |
| `CF_MODEL_FAST` | server secret | no | `@cf/meta/llama-3.1-8b-instruct` |

Only `NVIDIA_API_KEY` is mandatory. If it is missing, `/api/ai/status` reports
`ok: false` and every AI route answers `503` — it does not crash the site.

## 3. Media (Cloudinary)

| Variable | Type | Required | Notes |
| --- | --- | --- | --- |
| `CLOUDINARY_CLOUD_NAME` | server secret | yes for uploads | signed uploads |
| `CLOUDINARY_API_KEY` | server secret | yes for uploads | |
| `CLOUDINARY_API_SECRET` | server secret | yes for uploads | never expose |
| `CLOUDINARY_UPLOAD_PRESET` | server secret | no | only for unsigned browser uploads |
| `CLOUDINARY_KEY_NAME` | server secret | no | display label, default `BIFTISHCOOL` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | build-time public | no | delivery URLs in the browser |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | build-time public | no | unsigned direct uploads |

## 4. Auth / identity in the browser

| Variable | Type | Required | Used by |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_PARSE_SERVER_URL` | build-time public | yes | client-side Parse SDK |
| `NEXT_PUBLIC_PARSE_APPLICATION_ID` | build-time public | yes | client-side Parse SDK |
| `NEXT_PUBLIC_PARSE_REST_KEY` | build-time public | yes | client-side Parse REST calls |
| `NEXT_PUBLIC_PARSE_JAVASCRIPT_KEY` | build-time public | no | legacy/optional; unused in current code |

## 5. Site metadata and recovery

| Variable | Type | Required | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | build-time public | recommended | canonical URL for metadata, `robots.txt`, `sitemap.xml`; defaults to `https://dailyessential.school` |
| `RECOVERY_KEY_SECRET` | server secret | yes for student recovery keys | signs downloadable recovery keys |
| `PARSE_REST_KEY` | server secret | optional | server-side REST reads |

---

## Adding them on Cloudflare

1. Open **Workers & Pages → dailyessential → Settings → Variables and Secrets**.
2. Add each secret from section 1–3 and 5 as type **Secret** (encrypted), one per name.
3. Add the `NEXT_PUBLIC_*` values in **Workers Builds → Settings → Build variables and secrets**
   so the Vite build can inline them, then redeploy.
4. Verify after deploy: `GET /api/ai/status` must return `ok: true` when `NVIDIA_API_KEY` is set.

Secrets are per Worker, not per git branch — a preview deploy that shares the same Worker
name sees the same values.

## Deploy aborts with "Aborting the upload operation because of conflicts"

`cf deploy` uploads with Wrangler's `--strict` flag. Before uploading, Wrangler compares the
remote Worker config (whatever was last saved in the dashboard) with the config generated
from `cloudflare.config.ts`, and refuses to continue when the upload would *remove* remote
values. This project has no `wrangler.json`/`wrangler.toml` — `cf` builds that config in
memory — so the only thing it can compare against is the bindings declared in
`cloudflare.config.ts`.

Concretely: `cloudflare.config.ts` declares the server values as **secret** bindings, which
do not appear in the generated config. If the same names were added in the dashboard as
plain-text **Variables**, the remote config has `vars` that the local config does not, every
one of them shows up as a `-` line in the diff, and the deploy aborts.

Fix: make the Worker's variable list match what the config declares.

1. Open **Workers & Pages → dailyessential → Settings → Variables and Secrets**.
2. Re-add each server value from sections 1–3 and 5 as type **Secret** (encrypted), then
   delete its plain-text counterpart. The value stays the same; only the storage type changes.
3. The `NEXT_PUBLIC_*` entries are inlined at build time and are not read by the Worker at
   runtime — delete them from the Worker; keep them in the build environment.
4. Redeploy. With no plain-text `vars` left on the Worker, the diff is additive only and the
   upload proceeds.

`keep_vars: true` is **not** a fix here. It is a Wrangler-only field (not part of the `cf`
config schema), and it only affects how `vars` are sent during the upload — the strict diff
runs before that and still reports the removals as destructive. Once a Worker has been
deployed from the CLI once, Wrangler stops treating it as dashboard-managed, so this check
no longer fires on later deploys.

## Verifying every variable at once

`scripts/verify-stack.mjs` reads the same env files the app reads, validates the shape of
every variable, and then makes one real call per service: Parse health + master key + REST
key, a signed Cloudinary upload (deleted afterwards), the NVIDIA model list and a chat
completion, Cloudflare Workers AI when configured, and — when given a server — this app's
own endpoints.

```
npm run verify                                        # providers only, from .dev.vars
node scripts/verify-stack.mjs --base http://localhost:3000
node scripts/verify-stack.mjs --base https://<your-worker-url>
node scripts/verify-stack.mjs --no-ai                 # skip paid AI calls
node scripts/verify-stack.mjs --deep                  # also call the reasoning model
```

It exits non-zero when a required check fails, prints only lengths (never secret values),
and treats a value that is set locally but reported unconfigured by the server as a failure
— that is the signature of a secret that never reached the Worker.

## Checking the deployed Worker

```
curl -s https://<your-worker-url>/api/ai/status
```

Expected with AI configured:

```json
{ "ok": true, "nvidia": true, "cloudflare": false, "models": { ... } }
```

If `nvidia` is `false`, the `NVIDIA_API_KEY` secret is missing or was added after the last
deploy. If `cloudflare` is `false`, `CF_ACCOUNT_ID` / `CF_API_TOKEN` are absent — that only
disables the secondary provider.

## Local development

Copy `.dev.vars.example` to `.dev.vars` (git-ignored) and fill it in, then run
`npm run dev:vinext`. Any secret declared in `cloudflare.config.ts` but missing locally
produces a startup warning naming exactly which ones are absent.
