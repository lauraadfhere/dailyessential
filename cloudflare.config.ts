import { bindings, defineConfig, defineWorker } from "cf/config";

/**
 * Server-only values the app reads through `process.env`.
 *
 * Declaring them here does two things:
 *  - local dev (`vite dev` / `vite preview`) picks the values up from `.dev.vars`
 *  - the deployed Worker exposes them on `process.env` once the secret exists
 *    in Cloudflare (Settings -> Variables and Secrets)
 *
 * Anything a browser needs (NEXT_PUBLIC_*) is inlined at build time instead,
 * so it belongs in the build environment, not in this list.
 */
const SERVER_SECRETS = [
  // Parse (database + auth)
  "PARSE_SERVER_URL",
  "PARSE_APPLICATION_ID",
  "PARSE_MASTER_KEY",
  "PARSE_REST_KEY",
  // Cloudinary (media)
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLOUDINARY_UPLOAD_PRESET",
  "CLOUDINARY_KEY_NAME",
  // AI providers
  "NVIDIA_API_KEY",
  "NVIDIA_MODEL_REASONING",
  "NVIDIA_MODEL_FAST",
  "NVIDIA_MODEL_FALLBACK",
  "CF_ACCOUNT_ID",
  "CF_API_TOKEN",
  "CF_MODEL_FAST",
  // Student recovery keys
  "RECOVERY_KEY_SECRET",
] as const;

export default defineConfig({
  worker: defineWorker({
    name: "dailyessential",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-30",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      ...Object.fromEntries(SERVER_SECRETS.map(name => [name, bindings.secret()])),
    },
  }),
});
