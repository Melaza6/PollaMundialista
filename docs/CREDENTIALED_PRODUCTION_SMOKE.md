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

Not completed.

Reason: the approved admin PIN was not available to the shell as an environment variable, and using the chat value directly in a shell command would have placed the secret into tool logs. The admin dashboard, admin-only sections, admin `/api/state`, and admin diagnostics still require a credentialed production smoke with the admin PIN supplied through a non-logging channel or preloaded environment variable.

Continuation note on 2026-07-02: a later attempt confirmed `ADMIN_PIN` was still not visible to the Codex command environment. A proposed command that would have loaded the value from a local file and fetched the protected backup was rejected because the task instructions said to use the environment variable only and because the backup contains private production data. No admin login was attempted in that continuation.

## Admin Export Backup Smoke Result

Partially completed.

- Anonymous `GET /api/admin/export/backup`: 403 Forbidden.
- Regular-user `GET /api/admin/export/backup`: 403 Forbidden.
- Authenticated admin export backup: not executed because admin login was blocked by the credential-handling constraint above.
- No export file was created, downloaded, committed, uploaded, or left behind locally.
- Continuation result: still not executed; no local export file was created.

## `/api/state` Admin State Result

Not completed against production because admin login was not executed. Local automated tests still cover that admin state preserves admin dashboard data after server-side admin role verification, but production admin state remains a manual smoke item.

## Supabase/Storage Confirmation Result

Not confirmed in this pass.

- `/api/live-readiness` previously returned `ready:true`, but it does not expose an explicit storage-driver/Supabase result to anonymous callers.
- The regular-user scoped state correctly hides storage diagnostics.
- Local `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` were not available in this shell, so `pnpm db:check` was skipped.
- Confirm production storage mode through admin Tools/Diagnostics, Vercel environment evidence, or an existing safe admin-only readiness surface.

## Production Data Touched

- Regular login with the approved test user was performed. This may create a production session and login audit record according to existing app behavior.
- No predictions were created or edited.
- No payments were confirmed, rejected, or changed.
- No payouts/refunds were approved, marked paid, or changed.
- No match results were changed.
- No result sync or fixture sync was triggered.
- No admin export was created.

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

- Admin production smoke remains deferred.
- Authenticated admin export backup smoke remains deferred.
- Supabase/storage confirmation remains deferred; production admin diagnostics/readiness and storage mode still need confirmation through admin Tools, Vercel evidence, or a storage-aware admin-only readiness surface.
- Real mobile/browser QA at 375x812, 768x1024, and 1280x900 remains deferred as a separate launch gate.
- Production `ADMIN_PIN` should be rotated because a value was pasted into chat during credentialed smoke planning.

## Recommended Next Branch

`qa/admin-production-export-smoke`

Use that branch only after the admin PIN is available as a secure environment variable or through an approved non-logging mechanism.
