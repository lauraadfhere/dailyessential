# DailyEssential --- Backend Issues, Server Requirements & Fix Plan

**Updated:** 2 November 2026\
**Project:** DailyEssential\
**Production Worker:** `dailyessential`\
**Production URL:** `https://dailyessential.cquesenberry5.workers.dev`\
**Backend data service:** Back4App / Parse

------------------------------------------------------------------------

## 1. Executive summary

DailyEssential is deployed on Cloudflare Workers and uses Back4App Parse
as its data/authentication service. The current evidence does **not**
show that the Cloudflare deployment is down. The Worker, student login
page route, and AI status endpoint all respond successfully.

The unresolved issue is the **end-to-end student authentication and data
connection in production**. The local Parse credentials successfully
authenticated a request to Back4App's `/serverInfo` endpoint, but that
only validates the local endpoint and credentials used in that test. It
does not prove that the deployed Worker has the same credentials, that
the browser has the correct public Parse configuration, or that the
login form is sending the correct request.

**Do not rewrite the backend or add a separate VPS yet.** First inspect
the login implementation, confirm Cloudflare runtime configuration, and
test the real production login flow with a dedicated test account.

## 2. Confirmed test results

  -------------------------------------------------------------------------
  Area                    Test result             Interpretation
  ----------------------- ----------------------- -------------------------
  Worker homepage         HTTP 200                Cloudflare Worker serves
                                                  the homepage.

  Student login route     HTTP 200                The route returns a page.
                                                  This does not prove
                                                  authentication succeeds.

  AI status API           HTTP 200; `ok: true`    The status endpoint
                                                  responds and reports
                                                  NVIDIA and Cloudflare
                                                  enabled.

  AI feature status       Five features report    Study Buddy, Generate
                          `ready: true`           Test, Evaluate, Feedback,
                                                  and Admission Summary are
                                                  reported ready by the
                                                  status endpoint.
                                                  End-to-end feature
                                                  behavior has not been
                                                  tested here.

  Unauthenticated         HTTP 401 `unauthorized` Expected for a request
  Back4App `/serverInfo`                          without the required
  request                                         Parse authentication
                                                  headers; not proof that
                                                  Back4App is offline.

  Local authenticated     HTTP 200                The local
  Back4App `/serverInfo`                          `PARSE_SERVER_URL`,
  request                                         `PARSE_APPLICATION_ID`,
                                                  and `PARSE_REST_KEY` used
                                                  by the test successfully
                                                  reached Parse.

  Local Parse             Seven variable names    The names exist in
  variable-name check     found                   `.env.local` or
                                                  `.dev.vars`. This does
                                                  not verify their values
                                                  or Cloudflare
                                                  configuration.
  -------------------------------------------------------------------------

### Local Parse variables found

-   `PARSE_SERVER_URL`
-   `PARSE_APPLICATION_ID`
-   `PARSE_REST_KEY`
-   `PARSE_MASTER_KEY`
-   `NEXT_PUBLIC_PARSE_SERVER_URL`
-   `NEXT_PUBLIC_PARSE_APPLICATION_ID`
-   `NEXT_PUBLIC_PARSE_JAVASCRIPT_KEY`

### Important limitation

The production `/api/ai/status` response is an AI status response, not a
Parse health check. It cannot be used as proof that the Worker can
connect to Back4App.

------------------------------------------------------------------------

## 3. What the supplied source snippets tell us

### 3.1 Student login route

The supplied route is:

``` tsx
import { notFound, redirect } from "next/navigation";
import AuthForm, { PortalRole } from "../../../components/auth-form";

const validRoles = ["student", "teacher", "examiner"] as const;

export default async function RoleLoginPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (role === "admin") redirect("/admin/login");
  if (!validRoles.includes(role as (typeof validRoles)[number])) notFound();
  return <AuthForm mode="login" role={role as PortalRole} />;
}
```

What this confirms:

-   `/login/student`, `/login/teacher`, and `/login/examiner` are
    allowed role routes.
-   `/login/admin` redirects to `/admin/login`.
-   Unknown roles return a 404.
-   The route renders `AuthForm` in login mode and passes the selected
    role.
-   The route itself does not show any Parse request or authenticate a
    user. The actual login behavior is implemented elsewhere, most
    likely in `src/components/auth-form.tsx` or a function it calls.

**Conclusion:** The route returning HTTP 200 is only a page-rendering
check. It does not establish that student login works.

### 3.2 Package configuration

The supplied `package.json` identifies:

-   Project name: `dailyessential`
-   Node engine requirement: `>=20.19.0`
-   Package manager: Yarn `4.18.1`
-   Build script: `vite build`
-   Alternative Next.js build script: `next build`
-   Deploy script: `cf deploy --prebuilt`
-   Cloudflare/Vinext dependencies: `@cloudflare/vite-plugin`,
    `@vinext/cloudflare`, `vinext`, `vite`, and `wrangler`
-   Parse-related scripts: schema application, user configuration, user
    seeding, and platform data seeding.

Important deployment detail: the configured `deploy` script is
`cf deploy --prebuilt`. The build script is `vite build`. The project
also contains `build:next` and `deploy:vinext`, but their presence does
not prove they are the production deployment path.

**Action:** Keep the production build/deploy path consistent. Do not
alternate between `next build`, `vite build`, `cf deploy`, and
`vinext-cloudflare deploy` until the project's actual Cloudflare build
configuration has been inspected.

------------------------------------------------------------------------

## 4. Source files that must be inspected

The earlier project search found these files:

  --------------------------------------------------------------------------
  File                                   Investigation purpose
  -------------------------------------- -----------------------------------
  `src/lib/parse.ts`                     Browser-side Parse SDK
                                         initialization and public
                                         configuration.

  `src/lib/parse-server.ts`              Server-side Parse configuration and
                                         authentication headers.

  `src/components/auth-form.tsx`         Actual student/teacher/examiner
                                         login and sign-up logic.

  `src/app/login/[role]/page.tsx`        Role routing; supplied code
                                         confirms it delegates to
                                         `AuthForm`.

  `src/app/api/students/route.ts`        Student API behavior and
                                         authorization.

  `src/app/api/admissions/route.ts`      Parse URL and credential handling.

  `src/app/api/notifications/route.ts`   Parse URL and credential handling.

  `scripts/verify-stack.mjs`             Existing project health/stack
                                         verification.

  `wrangler.toml`, `wrangler.json`,      Actual Worker entry point,
  `wrangler.jsonc`, `vite.config.*`,     bindings, compatibility settings,
  `vinext.config.*`, or related          and build/deploy configuration.
  Cloudflare config                      
  --------------------------------------------------------------------------

The earlier search showed:

``` ts
// src/app/api/admissions/route.ts
const PARSE_URL = (process.env.NEXT_PUBLIC_PARSE_SERVER_URL || '').replace(/\/$/, '');

// src/app/api/notifications/route.ts
url: (process.env.PARSE_SERVER_URL || process.env.NEXT_PUBLIC_PARSE_SERVER_URL || '').replace(/\/$/, ''),

// src/lib/parse-server.ts
const serverUrl = process.env.PARSE_SERVER_URL || process.env.NEXT_PUBLIC_PARSE_SERVER_URL;

// src/lib/parse.ts
const serverUrl = process.env.NEXT_PUBLIC_PARSE_SERVER_URL;
```

These are configuration paths to review, not confirmed bugs. Server-side
API routes should use server-only configuration for privileged
operations. Public variables must never contain a master key or other
privileged secret.

------------------------------------------------------------------------

## 5. What is probably wrong --- and what is not yet proven

### Issue A --- Production Parse configuration has not been verified

**Evidence:** Local Parse authentication returned HTTP 200. No
equivalent authenticated test has been performed from the deployed
Worker runtime.

**Possible cause:** The Cloudflare Worker may be missing one or more
Parse variables, or may have different values from the local
environment.

**Required action:** - Check the Worker `dailyessential` configuration
in Cloudflare. - Verify that the required Parse variables/secrets are
configured for the production environment. - Confirm the endpoint and
application ID refer to the same Back4App application. - Never print
secret values in logs or share them in diagnostic output.

### Issue B --- Browser Parse configuration may be missing or stale

**Evidence:** `src/lib/parse.ts` reads `NEXT_PUBLIC_PARSE_SERVER_URL`.
The local check found the public Parse variable names, but the
production browser bundle has not been inspected.

**Possible cause:** The frontend build may have embedded an old or
incorrect public Parse URL/application ID/JavaScript key.

**Required action:** - Inspect the exact public variable names used by
`src/lib/parse.ts`. - Confirm the production build receives the correct
public values. - If these values are embedded at build time by the build
tool, update the build environment and rebuild/redeploy. Changing a
Worker runtime secret alone may not change values already embedded in
browser JavaScript.

### Issue C --- Actual login implementation is not yet inspected

**Evidence:** The role page only renders `AuthForm`. The contents of
`src/components/auth-form.tsx` have not yet been provided.

**Possible cause:** Incorrect Parse SDK initialization, wrong login
method, incorrect role validation, wrong request payload, or session
handling.

**Required action:** Inspect `auth-form.tsx` and trace the exact login
request. Do not assume the role route is the cause.

### Issue D --- Parse configuration is not consistently sourced

**Evidence:** The project references both `PARSE_SERVER_URL` and
`NEXT_PUBLIC_PARSE_SERVER_URL` in different server-side files.

**Possible cause:** Different routes may be using different endpoints or
relying on a public variable as a fallback.

**Required action:** Establish one documented server-side Parse
configuration helper for server routes. Keep browser initialization
separate and limited to public Parse values. Confirm which credentials
each operation requires.

### Issue E --- AI health does not prove the full backend is healthy

**Evidence:** `/api/ai/status` reports AI provider readiness, but it
does not test student authentication, student data access, or Back4App
connectivity.

**Required action:** Keep separate health checks for AI, Parse
connectivity, and authentication. A health endpoint should return only
sanitized status, never credentials or student data.

------------------------------------------------------------------------

## 6. What we need on the server

### 6.1 Cloudflare Worker --- required for the current architecture

The current production URL is a `workers.dev` URL, and the project
deploy script targets a prebuilt Cloudflare deployment. Based on the
supplied evidence, Cloudflare Workers are the current application
runtime.

The production Worker needs:

1.  **A successful production build artifact** produced by the project's
    intended Vite/Vinext + Cloudflare build process.
2.  **Correct Worker configuration**: Worker name, entry point,
    compatibility date/settings, and any required bindings.
3.  **Server-side environment variables/secrets**, according to the code
    actually used:
    -   `PARSE_SERVER_URL`
    -   `PARSE_APPLICATION_ID`
    -   `PARSE_REST_KEY`
    -   `PARSE_MASTER_KEY` only if a reviewed server-side operation
        genuinely requires it
    -   NVIDIA/AI credentials and model settings used by the AI routes
    -   Cloudinary server credentials only if server-side upload/signing
        routes use them
    -   Any recovery/encryption secret required by the application
4.  **Public build-time configuration**, if used by the browser:
    -   `NEXT_PUBLIC_PARSE_SERVER_URL`
    -   `NEXT_PUBLIC_PARSE_APPLICATION_ID`
    -   `NEXT_PUBLIC_PARSE_JAVASCRIPT_KEY`
    -   `NEXT_PUBLIC_SITE_URL` if the app uses it
5.  **Correct routing and access controls** for the Worker URL and API
    endpoints.
6.  **Runtime observability**: Cloudflare Worker logs, sanitized errors,
    and a safe health endpoint.

Do not create variables merely because they appear in this list. First
confirm each variable is read by the deployed code. Set secrets as
encrypted Worker secrets where appropriate, not as public plaintext
variables.

### 6.2 Back4App --- Parse backend/data service

Back4App is a separate managed service in this architecture. The local
authenticated `/serverInfo` request proves the tested local credentials
can reach it.

Confirm in Back4App:

-   The correct Parse application is active.
-   The Parse Server URL is the one configured in the application.
-   Application ID and REST key correspond to that same application.
-   Master key is used only by trusted server-side code and is never
    shipped to the browser.
-   Required classes and fields exist for the user/student model.
-   Student records have the expected role field and permitted login
    state.
-   Class-level permissions (CLPs), object-level permissions (ACLs), and
    role permissions allow the intended operations without exposing
    other students' records.
-   Any Cloud Code functions, triggers, or schema requirements used by
    the application are deployed and enabled.

The current evidence does **not** establish which Parse classes, fields,
or Cloud Code functions are required. Inspect the project's schema
scripts and source before making database changes.

### 6.3 Local development/build machine

The supplied `package.json` specifies:

-   Node.js `>=20.19.0`
-   Yarn `4.18.1`
-   Vite build script: `yarn build` / `vite build`
-   Wrangler dependency: `wrangler`
-   Deployment script: `cf deploy --prebuilt`

Use the repository's lockfile and package manager version. Do not
install a different dependency set on the server without checking the
lockfile and build process.

### 6.4 Do we need a separate VPS?

**No separate VPS is currently demonstrated as necessary.**

The current evidence shows a Cloudflare Worker deployment and a Back4App
Parse service. If the application is designed to run fully on Cloudflare
Workers and use Back4App for data/authentication, a traditional Ubuntu
VPS is not automatically required.

A VPS or separate backend host is needed only if the code depends on
services or runtime capabilities that cannot run in the chosen
Cloudflare environment---for example, a persistent process, unsupported
native dependency, long-running background worker, or a separate service
that the architecture explicitly requires.

Before renting or configuring a VPS, inspect the Cloudflare entry point,
package dependencies, and all API routes to determine whether any
workload actually requires one.

------------------------------------------------------------------------

## 7. Recommended server configuration checklist

Use this as an operational checklist; confirm the code dependency before
adding each item.

### Cloudflare Worker

-   [ ] Worker name is `dailyessential`.
-   [ ] Production workers.dev URL is enabled.
-   [ ] Correct build output is deployed.
-   [ ] Correct Worker entry point and compatibility settings are
    configured.
-   [ ] Required server-side Parse secrets are set.
-   [ ] Required AI provider secrets/settings are set.
-   [ ] Cloudinary server secrets are set only if server-side features
    require them.
-   [ ] Recovery/encryption secrets are set if required by code.
-   [ ] Public frontend variables are supplied at build time where
    required.
-   [ ] No privileged secrets are exposed through `NEXT_PUBLIC_*`.
-   [ ] Worker logs show no runtime exceptions during login.

### Back4App

-   [ ] Parse Server URL matches the target application.
-   [ ] Application ID matches the same application.
-   [ ] REST key is valid for the application.
-   [ ] Master key is protected and only used server-side if needed.
-   [ ] User/student classes and required fields exist.
-   [ ] User role values match the app's expected roles.
-   [ ] CLPs and ACLs permit intended student operations.
-   [ ] Test account exists and can authenticate.
-   [ ] Cloud Code and schema migrations are applied if the code
    requires them.

### Build/deployment

-   [ ] Node.js version meets `>=20.19.0`.
-   [ ] Yarn version matches `4.18.1`.
-   [ ] Lockfile is current.
-   [ ] Production build uses the intended Vite/Vinext configuration.
-   [ ] `cf deploy --prebuilt` is run only after the correct prebuild
    step.
-   [ ] `.env.local` and `.dev.vars` are excluded from Git.
-   [ ] No secret files are included in the deployment artifact unless
    explicitly required by a secure runtime mechanism.

------------------------------------------------------------------------

## 8. Exact next investigation steps

Complete these in order before making code changes.

### Step 1 --- Inspect the four login/Parse files

``` bash
echo "========== FRONTEND PARSE =========="
sed -n '1,220p' src/lib/parse.ts

echo "========== SERVER PARSE =========="
sed -n '1,220p' src/lib/parse-server.ts

echo "========== AUTH FORM =========="
sed -n '1,320p' src/components/auth-form.tsx

echo "========== ROLE LOGIN PAGE =========="
sed -n '1,220p' 'src/app/login/[role]/page.tsx'
```

Redact any keys, tokens, passwords, session tokens, and personal data
before sharing output.

### Step 2 --- Locate the Cloudflare build configuration

``` bash
echo "========== ROOT CONFIG FILES =========="
ls -la | grep -Ei 'wrangler|vite|vinext|cloudflare|package|yarn'

echo "========== BUILD/WORKER REFERENCES =========="
grep -RInE 'cloudflare|wrangler|workers_dev|main:|compatibility_date|PARSE_SERVER_URL|NEXT_PUBLIC_PARSE' \
  vite.config.* wrangler.* vinext.config.* package.json src 2>/dev/null | head -200
```

This should identify the actual Cloudflare config file and whether a
separate `wrangler.*` file exists. Do not create a new config until the
existing build setup is understood.

### Step 3 --- Inspect existing verification and schema scripts

``` bash
sed -n '1,260p' scripts/verify-stack.mjs
sed -n '1,260p' scripts/apply-parse-schema.mjs
sed -n '1,260p' scripts/configure-user-fields.mjs
```

These scripts may reveal the expected Parse classes, fields, roles, and
server requirements. Review before running schema or seed commands
against production.

### Step 4 --- Reproduce the production login

Use a dedicated test student account. Record:

-   Exact visible error message.
-   Whether the browser sends a login request.
-   Request URL and HTTP status.
-   Sanitized response body.
-   Whether a Parse session is created.
-   Whether the next student dashboard request succeeds.

Do not share passwords, `X-Parse-Session-Token`, cookies, authorization
headers, or real student data.

### Step 5 --- Add or use a production Parse health check

If no suitable check exists, add a server-only endpoint that uses the
deployed Worker environment. It should make a minimal authenticated
Parse request and return a sanitized result, for example:

``` json
{
  "ok": true,
  "service": "parse"
}
```

On failure, return a safe category such as `missing_configuration`,
`authentication_failed`, or `upstream_unavailable`. Do not return secret
values, raw headers, or database records. Protect the endpoint or
restrict its diagnostic detail.

### Step 6 --- Apply only the confirmed fix

Possible fixes depend on what the source and runtime checks reveal:

-   Correct a missing or mismatched Cloudflare secret.
-   Correct the public Parse build variables and rebuild.
-   Fix Parse SDK initialization.
-   Correct the login request or role validation.
-   Fix session persistence/cookie handling.
-   Correct Parse class permissions or schema, if verified.

Do not run user-seeding or schema-modification scripts against
production until their effects have been reviewed and a backup/rollback
plan exists.

------------------------------------------------------------------------

## 9. Security and credential rotation

Secret values were previously pasted into troubleshooting messages.
Treat any exposed values as compromised and rotate them before
production use:

-   Back4App REST key and master key, and any other exposed Parse
    credentials.
-   NVIDIA API key.
-   Cloudinary API key/secret if exposed.
-   Recovery/encryption secret that was pasted into chat.

After rotation, update the appropriate local development files and
Cloudflare Worker secrets. Keep server-only secrets out of
`NEXT_PUBLIC_*`, browser JavaScript, Git, logs, and screenshots.

Ensure `.env.local` and `.dev.vars` are ignored by Git:

``` bash
git check-ignore .env.local .dev.vars
```

If the command does not confirm they are ignored, correct `.gitignore`
before staging or pushing files. Check `git status` carefully for
accidentally staged environment files.

------------------------------------------------------------------------

## 10. Final diagnosis

### Confirmed

-   Cloudflare Worker is responding.
-   Homepage and student login route return HTTP 200.
-   AI status endpoint returns HTTP 200 and reports its configured
    features ready.
-   Local authenticated Back4App `serverInfo` request returns HTTP 200.
-   The role login page delegates to `AuthForm` and permits student,
    teacher, and examiner roles.
-   The project is configured with a Vite build script and a
    `cf deploy --prebuilt` deployment script.

### Not confirmed

-   Production Worker → Back4App authenticated connectivity.
-   Actual browser-side Parse initialization in production.
-   Actual student login success/failure and its error response.
-   Whether the production Worker has all required Parse secrets.
-   Whether any separate VPS is required by the application.
-   Whether the production build is using the intended
    Vite/Vinext/Cloudflare configuration.

### Recommended decision

**Do not rewrite the backend, add a VPS, or redeploy yet.** First
inspect the Parse initialization, `AuthForm`, Worker configuration, and
production login request. Then fix the specific confirmed issue and
perform an end-to-end test with a dedicated test account.
