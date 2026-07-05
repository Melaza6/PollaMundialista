# Admin Export Smoke - Polla Mundialista 2026

Date: 2026-07-03  
Branch: `qa/admin-export-smoke-after-pin-rotation`  
Workspace: `C:\Users\Owner\Documents\Melaza Ecosystem\Polla mundial`  
Production URL: `https://polla.melazausa.com`

## Credential Handling

Per task context, the production `ADMIN_PIN` was rotated before this smoke because a previous value had been pasted into chat.

The rotated `ADMIN_PIN` was loaded only from ignored `.env.local` into the active command process. The value was not printed, written to files, captured in screenshots, committed, or documented.

Credential safety checks:

- `.env.local` exists.
- `git check-ignore -v .env.local` confirmed `.gitignore:8:.env.local`.
- `ADMIN_PIN` loaded successfully into the command process.
- `.env.local` was not staged.

## Production Readiness

`GET /api/live-readiness` returned HTTP 200 with `ready:true`.

## Admin Production Smoke Result

Passed.

- `POST /api/auth/admin` returned HTTP 200.
- Authenticated user role was `ADMIN`.
- Admin state exposed admin-only data only after admin verification.
- Admin state secret-marker scan found no API key, Supabase key, service-role key, session secret, database URL, `ADMIN_PIN`, old PIN marker, or rotated PIN value.
- Headless Chromium admin dashboard smoke passed without screenshots.
- Admin dashboard loaded.
- Admin tabs were visible: match day, predictions, payments, results, prizes, rules, and tools.
- Admin panels loaded for predictions, payments, prizes, and tools.
- Tools showed storage and users sections.

Anonymous and regular-user safety:

- Anonymous `GET /api/admin/export/backup` returned HTTP 403.
- Regular-user export denial was not rerun in this branch because no regular-user session credentials were loaded. The previous credentialed smoke already recorded regular-user export denial as HTTP 403.

No payment, payout, refund, match result, or sports sync action was performed.

## Authenticated Admin Export Backup Smoke Result

Passed.

- Authenticated admin `GET /api/admin/export/backup` returned HTTP 200.
- Export response parsed as JSON.
- Export response included backup data for users, matches, predictions, payments, payouts, standings, prize summary, and audit logs.
- Export response was inspected in memory for secret markers.
- Secret-marker scan found no API key, Supabase key, service-role key, session secret, database URL, `ADMIN_PIN`, old PIN marker, or rotated PIN value.
- No export file was written, committed, uploaded, or left behind locally.

Observed export counts at smoke time:

- users: 6
- matches: 109
- predictions: 35
- payments: 35
- payouts: 29
- audit logs: 180

## Supabase/Storage Confirmation

Confirmed from authenticated admin state.

- Admin diagnostics/state reported storage label: `Supabase`.
- No storage secrets were exposed in the inspected admin state or export response.

## Production Data Touched

The smoke avoided business-data mutations.

Existing app behavior records admin access and exports, so production may include:

- admin session records from the API and browser admin logins
- audit entries for admin login
- an audit entry for export creation

The smoke did not:

- create or edit predictions
- confirm, reject, or change payments
- approve, mark paid, or change payouts/refunds
- change match results
- trigger fixture sync or result sync
- write an export file locally

## Export Files Created/Deleted

None.

The export backup was inspected in memory only. No screenshots were created.

The temporary ignored browser helper `tmp/admin-browser-smoke.mjs` was deleted after use.

## Local Verification

- `pnpm.cmd install --frozen-lockfile`: initial run stopped on pnpm's no-TTY module purge prompt; rerun with `CI=true` and the same pnpm invocation passed.
- `pnpm.cmd build`: passed, 54/54 tests in the build flow.
- `pnpm.cmd test`: initial sandbox run failed only with `spawn EPERM` in the child-process storage-error test; escalated rerun passed, 54/54 tests.
- `VERCEL=1 NODE_ENV=production pnpm.cmd test`: initial sandbox run hit restricted-network package fetches after dependency restore; escalated rerun passed, 54/54 tests.
- `VERCEL` and `NODE_ENV` were cleared after the production-mode test command.

Local warning remains: current Node is `v24.14.0`; project engines require Node `22.x`.

## Remaining Risks

- Logged-in regular-user browser QA remains a separate launch follow-up if fresh regular-user credentials are required.
- Production export contains private pool data by design and should only be handled through secure admin workflows.
- Admin login/export smoke necessarily creates session/audit records through existing app behavior.
- Local runner still uses Node `v24.14.0`; project engines require Node `22.x`.

## Recommendation

Admin production smoke, authenticated admin export backup smoke, and Supabase/storage confirmation are complete for this P0 follow-up.

Proceed as ready with warnings: keep `ADMIN_PIN` rotated and secret, avoid committing local env files or export files, and rerun logged-in regular-user browser QA if production match/prediction data changes materially before launch.

## Logged-In Browser QA Follow-Up

The remaining logged-in regular-user browser/mobile QA gap was completed on 2026-07-03 in `docs/LOGGED_IN_BROWSER_QA.md`.

That follow-up passed at 375x812, 768x1024, and 1280x900 with no screenshots or export files created. Regular-user admin endpoint checks returned HTTP 403, and regular-user `/api/state` remained scoped.

## Launch Operations Readiness Follow-Up

The 2026-07-05 launch operations pass on branch `ops/launch-operations-readiness` reconfirmed authenticated admin export readiness after the access-control regression merge.

See `docs/LAUNCH_OPERATIONS_READINESS.md` for the operational runbook and current smoke details.

Follow-up result:

- anonymous export remained denied with HTTP 403
- authenticated admin export returned HTTP 200
- export parsed as JSON and was inspected in memory only
- no export file was written, committed, uploaded, or left behind
- export secret-marker scan found no API key, Supabase key, service-role key, session secret, database URL, `ADMIN_PIN`, or old PIN marker
- admin state still reported storage label `Supabase`

Production data touched was limited to existing admin session/audit records from admin login/export/status checks.
