# Credentialed Production Smoke - Polla Mundialista 2026

Date: 2026-07-02  
Branch: `qa/credentialed-production-smoke`  
Production URL: `https://polla.melazausa.com`  
Scope: credentialed production smoke follow-up after the anonymous production readiness smoke. No app behavior was changed.

## Ecosystem Location

Polla Mundialista is a standalone Melaza ecosystem product app managed through Melaza Network.

- MLP / Melaza Landing Page: public marketing website, ecosystem app, public showcase.
- MN / Melaza Network: internal operations/admin platform, ecosystem app, private or sanitized showcase only.
- Polla Mundialista: standalone product app, ecosystem app, public showcase, managed through MN.

Polla Mundialista sits alongside MLP and MN at the ecosystem level. MN manages and tracks Polla Mundialista as an app record, but Polla Mundialista is not structurally part of MN. The verified local workspace is `C:\Users\Owner\Documents\Melaza Ecosystem\Polla mundial`.

## Credentials Used

- Regular-user smoke used the approved production test user for this session: display name `Leo`; phone number intentionally omitted from this document.
- Admin PIN was provided in chat, but it was not available to the command environment as `ADMIN_PIN`. To avoid placing the admin PIN in shell commands, tool logs, files, screenshots, commits, or reports, the admin login/export smoke was not executed in this pass.
- Production `ADMIN_PIN` should be rotated because a value was pasted into chat.

## Admin/Export Follow-Up - 2026-07-03

Branch: `qa/admin-export-smoke-after-pin-rotation`  
Report: `docs/ADMIN_EXPORT_SMOKE.md`

Per task context, production `ADMIN_PIN` was rotated before this follow-up. The rotated value was loaded only from ignored `.env.local` into the active command process and was not printed, written to files, captured in screenshots, committed, or documented.

Follow-up results:

- `.env.local` exists and is ignored by Git.
- Admin production smoke passed.
- Admin dashboard loaded in headless Chromium without screenshots.
- Admin-only sections/tabs were visible for match day, predictions/admin review, payments, prizes/payouts, rules, and tools.
- Authenticated admin export backup returned HTTP 200 and parsed as JSON.
- Anonymous admin export remained denied with HTTP 403.
- Export response was inspected in memory only and contained no secret markers or PIN value.
- Admin state reported storage label: `Supabase`.
- No export file was written, committed, uploaded, or left behind locally.
- No payment, payout/refund, match result, or sports sync mutation was performed.

Production data touched in the follow-up was limited to existing app behavior for admin session records and audit logs from admin login/export.

## Regular-User Production Smoke Result

Completed using the approved regular test user.

- Production app `/`: HTTP 200.
- Regular login: succeeded; returned a user session with role `USER`.
- Matches loaded: 109.
- Predictions loaded: 35 public-safe prediction rows.
- Standings/leaderboard loaded: 5 rows.
- Current-user scoped payments loaded: 7.
- Current-user scoped payouts/refunds loaded: 7.
- No admin tools were exercised or exposed through the inspected API state.

## `/api/state` Regular-User Scoping Result

The authenticated regular-user `/api/state` response was inspected through safe counts and flags only. The response did not expose:

- other users' phone fields or normalized phone fields
- other users' payment records
- payout/refund ledger beyond current-user scoped records
- audit logs
- diagnostics/storage/provider internals
- admin config
- env-like secret names

Regular-user state did include the expected user-safe data needed by the app: matches, public-safe predictions, standings, current-user profile/session-safe state, and current-user payment/payout status.

## Admin Production Smoke Result

Initial 2026-07-02 result: not completed.

Reason: the approved admin PIN was not available to the shell as an environment variable, and using the chat value directly in a shell command would have placed the secret into tool logs. The admin dashboard, admin-only sections, admin `/api/state`, and admin diagnostics still require a credentialed production smoke with the admin PIN supplied through a non-logging channel or preloaded environment variable.

Continuation note on 2026-07-02: a later attempt confirmed `ADMIN_PIN` was still not visible to the Codex command environment. A proposed command that would have loaded the value from a local file and fetched the protected backup was rejected because the task instructions said to use the environment variable only and because the backup contains private production data. No admin login was attempted in that continuation.

Follow-up 2026-07-03 result: passed after production `ADMIN_PIN` rotation and approved ignored `.env.local` loading.

- Admin login returned HTTP 200.
- Authenticated user role was `ADMIN`.
- Admin state included users, payments, payouts/refunds, admin predictions/review, and diagnostics/readiness data.
- Headless Chromium confirmed the admin dashboard and admin tabs/panels loaded.
- Admin state secret-marker scan found no real secrets or PIN value.

## Admin Export Backup Smoke Result

Initial 2026-07-02 result: partially completed.

- Anonymous `GET /api/admin/export/backup`: 403 Forbidden.
- Regular-user `GET /api/admin/export/backup`: 403 Forbidden.
- Authenticated admin export backup: not executed because admin login was blocked by the credential-handling constraint above.
- No export file was created, downloaded, committed, uploaded, or left behind locally.
- Continuation result: still not executed; no local export file was created.

Follow-up 2026-07-03 result: passed.

- Anonymous `GET /api/admin/export/backup`: 403 Forbidden.
- Authenticated admin `GET /api/admin/export/backup`: HTTP 200.
- Export response parsed as JSON.
- Export response included users, matches, predictions, payments, standings, prize summary, payouts, and audit logs.
- Export response secret-marker scan found no API key, Supabase key, service-role key, session secret, database URL, `ADMIN_PIN`, old PIN marker, or rotated PIN value.
- Export was inspected in memory only; no export file was written, committed, uploaded, or left behind locally.

## `/api/state` Admin State Result

Initial 2026-07-02 result: not completed against production because admin login was not executed.

Follow-up 2026-07-03 result: completed. Admin login returned admin-scoped state only after successful admin verification.

## Supabase/Storage Confirmation Result

Initial 2026-07-02 result: not confirmed in this pass.

- `/api/live-readiness` previously returned `ready:true`, but it does not expose an explicit storage-driver/Supabase result to anonymous callers.
- The regular-user scoped state correctly hides storage diagnostics.
- Local `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` were not available in this shell, so `pnpm db:check` was skipped.
- Confirm production storage mode through admin Tools/Diagnostics, Vercel environment evidence, or an existing safe admin-only readiness surface.

Follow-up 2026-07-03 result: completed through authenticated admin state.

- Admin state reported storage label: `Supabase`.
- No storage secrets were exposed in admin state or the export response.

## Production Data Touched

- Regular login with the approved test user was performed. This may create a production session and login audit record according to existing app behavior.
- No predictions were created or edited.
- No payments were confirmed, rejected, or changed.
- No payouts/refunds were approved, marked paid, or changed.
- No match results were changed.
- No result sync or fixture sync was triggered.
- No admin export was created.

Follow-up production data touched:

- admin session records and audit entries from admin login/export, created by existing app behavior
- no predictions created or edited
- no payments confirmed, rejected, or changed
- no payouts/refunds approved, marked paid, or changed
- no match results changed
- no result sync or fixture sync triggered
- no local export file created

## Local Verification

- `node --check server.js`: passed.
- `node --check public/app.js`: passed.
- `node --check lib/rules.js`: passed.
- `pnpm install --frozen-lockfile`: passed; the first continuation rerun needed `--config.confirmModulesPurge=false`, then an escalated rerun completed after sandbox/network friction.
- `pnpm build`: passed on escalated rerun; tests passed 54/54 inside build. The first sandbox run failed only with `spawn EPERM` in the child-process storage-error test.
- `pnpm test`: passed 54/54 on escalated rerun. The first sandbox run failed only with `spawn EPERM` in the same child-process test.
- `VERCEL=1 NODE_ENV=production pnpm test`: passed 54/54 on escalated rerun after restoring dependencies. The first sandbox run failed during package fetch with `ECONNREFUSED`.
- `pnpm db:check`: skipped because Supabase env vars were unavailable.

Known local warning: current Node is `v24.14.0`; project engines require Node `22.x`.

## Remaining Risks

- Admin production smoke is complete as of the 2026-07-03 follow-up.
- Authenticated admin export backup smoke is complete as of the 2026-07-03 follow-up.
- Supabase/storage confirmation is complete as of the 2026-07-03 follow-up; admin state reported `Supabase`.
- Real mobile/browser QA at 375x812, 768x1024, and 1280x900 remains deferred as a separate launch gate.
- Production `ADMIN_PIN` must remain rotated and secret.

## Recommended Next Branch

`qa/admin-export-smoke-after-pin-rotation`

Use this branch for review/commit of the admin/export smoke documentation follow-up.

## P0 Closeout Follow-Up - 2026-07-02

Branch: `p0/closeout-production-readiness`

Regular-user production smoke was deferred in this pass because no regular test-user credentials were available in the shell environment. No production users were created.

Admin production smoke was deferred because `ADMIN_PIN` was not present in the shell environment. This pass did not guess, bypass, weaken auth, or use any value from chat.

Authenticated admin export backup smoke was deferred because admin auth was not available.

Anonymous export denial was rechecked:

- anonymous `GET /api/admin/export/backup`: 403 Forbidden

No export file was created, downloaded, committed, or left behind locally.

Required next step remains:

- keep production `ADMIN_PIN` rotated and secret
- complete any remaining logged-in regular-user browser QA if fresh regular-user credentials are needed

See `docs/P0_CLOSEOUT_REPORT.md` for the full closeout.
