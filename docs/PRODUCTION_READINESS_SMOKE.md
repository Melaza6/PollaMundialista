# Production Readiness Smoke - Polla Mundialista 2026

Date: 2026-07-01  
Branch: `deploy/production-readiness-smoke`  
Production URL: `https://polla.melazausa.com`  
Scope: post-deploy smoke after the P0 `/api/state` scoping fix. No app behavior was changed.

## Local Verification

- `node --check server.js`: passed.
- `node --check public/app.js`: passed.
- `node --check lib/rules.js`: passed.
- `pnpm install --frozen-lockfile`: passed; lifecycle tests passed 54/54.
- `pnpm build`: passed; tests passed 54/54 inside build.
- `pnpm test`: passed 54/54.
- `VERCEL=1 NODE_ENV=production pnpm test`: passed 54/54.
- `pnpm db:check`: skipped because `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` were not available in this shell.

Known local warning: current Node is `v24.14.0`; project engines require Node `22.x`.

## Production Endpoints Checked

| Endpoint | Result |
| --- | --- |
| `/` | HTTP 200, app shell returned. |
| `/app.js` | HTTP 200, no secret/env markers found. |
| `/styles.css` | HTTP 200, no secret/env markers found. |
| `/api/state` | HTTP 200, valid JSON. |
| `/api/live-readiness` | HTTP 200, `ready:true`. |

## Anonymous `/api/state` Scoping Result

Anonymous `/api/state` returned public-safe bootstrap data:

- `currentUser`: `null`
- `matches`: 109
- `nextMatches`: 4
- `users`: 0
- `payments`: 0
- `payouts`: 0
- `auditLogs`: 0
- `adminPredictions`: 0
- `predictions`: 0

No matches were found for phone fields, session records, embedded storage diagnostics, embedded sports diagnostics, deployment diagnostics, admin notes, payment references, or env-like secret names in the anonymous state response.

The response still includes compatibility keys such as `users`, `payments`, `storage`, `sportsSync`, and `sportsVerification`, but non-public values are empty arrays or `null`.

## `/api/live-readiness` Result

`/api/live-readiness` returned `ready:true`.

Checks reported by the endpoint:

- `PUBLIC_BASE_URL`: `ok:true`
- `ADMIN_PIN`: `ok:true`
- `SESSION_SECRET`: `ok:true`
- `SPORTS_API_KEY`: `ok:true`
- `SPORTS_PROVIDER`: `ok:true`

The readiness endpoint does not currently expose an explicit storage-driver/Supabase check to anonymous callers. Because anonymous state is now scoped and admin credentials were not available during this smoke, production Supabase status was not independently confirmed from this shell.

## Anonymous QA Result

- App shell loads at the production URL.
- Public JS and CSS load.
- Public assets did not expose `API_FOOTBALL_KEY`, `FOOTBALL_DATA_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `SESSION_SECRET`, `ADMIN_PIN`, or `DATABASE_URL`.
- Public client bundle did not contain email/Google/Gmail auth markers.
- Anonymous `/api/state` is public-safe after scoping.
- Anonymous request to `/api/admin/export/backup` returned 403 Forbidden.

## Regular User QA Result

Not executed against production because no test user credentials were provided and creating/logging in as a new user would mutate production data.

Based on anonymous source/endpoint checks:

- Login UI assets load.
- No email or Google/Gmail auth markers were found in the client bundle.
- Scoped `/api/state` keeps public bootstrap safe before login.

## Admin QA Result

Not executed against production because no admin PIN/session was provided.

Admin-only protections checked without credentials:

- `/api/admin/export/backup` rejected anonymous access with 403.
- Admin export exists in the source route and remains server-side protected by `requireAdmin()`.

Admin dashboard, payment/payout/refund review, diagnostics, and authenticated export backup still need a credentialed production smoke.

## Backup/Export Smoke Result

Source route exists:

- `GET /api/admin/export/:type`
- Backup type: `backup`
- Admin-only guard: `requireAdmin()`
- Audit action: `DATA_EXPORT_CREATED`

Production anonymous smoke:

- `GET /api/admin/export/backup`: 403 Forbidden.

Authenticated export was not triggered because admin credentials were not available. No export files were created locally.

## Node/Vercel Consistency

- `package.json` pins Node engine to `22.x`.
- Local verification warning shows the current shell uses Node `v24.14.0`, so local checks are green but not running on the project engine version.
- Existing tests continue to verify Vercel config has no invalid explicit function runtime and that `api/index.js` exports the server handler.
- Production endpoint responses are HTTP 200 for app shell, assets, state, and live readiness.

## Remaining Risks

- Authenticated regular-user and admin production QA still require test credentials or a safe test data plan.
- Admin export backup still needs a credentialed production smoke before real family activity.
- Production Supabase storage mode is not explicitly visible to anonymous smoke after state scoping; confirm through admin Tools, Vercel env, or a storage-aware admin-only readiness check.
- Real browser/mobile visual QA at 375x812, 768x1024, and 1280x900 remains a separate launch gate.
- Consider extending `/api/live-readiness` with an admin-only or safe aggregate storage check if the owner wants Supabase readiness visible in a smoke endpoint.

## Recommended Next Branch

`qa/credentialed-production-smoke`

Use that branch only after safe regular-user and admin test credentials are available.
