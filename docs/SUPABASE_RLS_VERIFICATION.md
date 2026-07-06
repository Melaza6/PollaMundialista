# Supabase RLS Verification

## Executive Summary

Polla Mundialista's Supabase Row Level Security posture was verified as a defense-in-depth control for the current backend-service-role architecture.

Result: **passed with warnings**.

Required app tables are present in the live `PollaMundialista` Supabase project, RLS is enabled on every required table, no broad public policies are present, and count-only checks as `anon` and `authenticated` returned zero visible rows for all required app tables.

The main warning is architectural: the app intentionally uses a backend storage adapter with the Supabase service-role key and custom name-plus-phone sessions, so Supabase RLS is not the primary app authorization boundary. Backend route authorization and response scoping remain the primary boundary.

## Date

2026-07-06

Live Supabase metadata was captured on 2026-07-05 and final local verification completed on 2026-07-06.

## Branch

`qa/supabase-rls-verification`

## Workspace

`C:\Users\Owner\Documents\Melaza Ecosystem\Polla mundial`

## Project Checked

- Supabase project name: `PollaMundialista`
- Supabase project ref: `pftzfdedqeajtmbnpows`
- Project status observed through the Supabase plugin: `ACTIVE_HEALTHY`

The project name clearly matched this app, so live read-only metadata checks were safe to perform.

## Plugin And Tool Used

Used the Supabase plugin in read-only mode:

- listed Supabase projects
- listed public tables and metadata
- queried `information_schema`, `pg_catalog`, and `pg_policies`
- ran count-only direct-access checks under `anon` and `authenticated`
- read the Supabase security advisor output

No row contents were queried. No writes, migrations, policy changes, inserts, updates, deletes, or destructive operations were performed.

## Check Type

This was a combined verification:

- live Supabase metadata verification
- live count-only direct-access verification
- static repo/code review
- documentation update

## Required Table Existence

All required public app tables were present:

- `users`
- `matches`
- `predictions`
- `payments`
- `exchange_rates`
- `audit_logs`
- `prediction_corrections`
- `payouts`
- `app_settings`
- `sync_logs`
- `exports`

The live table list matched the required Polla Mundialista storage model.

## RLS Result

RLS was enabled on every required table:

- `app_settings`
- `audit_logs`
- `exchange_rates`
- `exports`
- `matches`
- `payments`
- `payouts`
- `prediction_corrections`
- `predictions`
- `sync_logs`
- `users`

`FORCE ROW LEVEL SECURITY` was not enabled. That is acceptable for this app because backend service-role access is intentional, but it reinforces that backend route checks must remain the primary authorization control.

## Policy Review

`pg_policies` returned no policies for the required app tables.

This is conservative for the current architecture because the browser does not directly read or write Supabase tables and the app uses backend routes plus custom sessions. With RLS enabled and no policies, direct `anon` and `authenticated` table access is denied.

No broad public policies were found:

- no `using (true)` policies
- no `with check (true)` policies
- no broad anon write policies
- no `auth.uid()` assumptions that falsely map Supabase Auth users to Polla app users

Supabase's security advisor reported `RLS Enabled No Policy` as INFO for the app tables. In this app, that aligns with the intentionally conservative backend-only access model.

## Anonymous And Authenticated Direct Access

Count-only checks were run under both roles without reading row contents.

As `anon`, all required app tables returned zero visible rows.

As `authenticated`, all required app tables returned zero visible rows.

This confirms that direct Supabase table reads are blocked for both public and authenticated API roles under the current no-policy RLS posture.

## Write Access Review

No write probes were executed against production data.

Write posture was verified by policy metadata:

- no insert policies
- no update policies
- no delete policies
- no `with check` policies

Because RLS is enabled and no write policies exist, direct `anon` and `authenticated` writes are blocked by RLS.

One hardening note: table privileges for `anon` and `authenticated` appear broad at the grant layer, but RLS currently blocks access because there are no policies. That is not a launch blocker, but a future hardening branch may consider revoking unnecessary direct table privileges after confirming Supabase/PostgREST compatibility.

## Service-Role Safety

Static review found the service-role key is used only by backend storage tooling:

- `server/storage/supabaseStorage.js`
- `server/storage/checkSupabaseConnection.js`
- `server/storage/migrateJsonToSupabase.js`

`public/app.js` does not import Supabase or call Supabase directly.

`.env.example` and `DEPLOYMENT.md` contain placeholder env var names only:

- `SUPABASE_URL=`
- `SUPABASE_ANON_KEY=`
- `SUPABASE_SERVICE_ROLE_KEY=`
- `DATABASE_URL=`

`.gitignore` includes `.env` and `.env.local`.

## Backend Adapter Review

The app continues to use the backend storage adapter as the data boundary:

- production storage resolves to Supabase when configured
- local fallback remains JSON
- Supabase storage reads/writes through server code only
- the service-role key is attached only to backend REST calls
- `pnpm db:check` checks required tables without printing secrets
- migration tooling prints safe summaries only

No browser-side Supabase writes were found.

## State And Admin Endpoint Relationship

`/api/state` remains scoped by session role:

- anonymous users receive public-safe bootstrap state
- regular users receive safe user state only
- admins receive full admin state only after server-side admin verification

Admin endpoints continue to call `requireAdmin()` before returning sensitive data or mutating state, including:

- admin export
- sports verification
- sync status
- exchange-rate refresh
- payment updates
- payout updates
- prediction correction
- match/result sync

This is important because backend route authorization is the primary boundary while RLS remains defense-in-depth.

## Existing Test Coverage

Existing regression tests cover the highest-risk app boundary:

- anonymous `/api/state` public-safe scoping
- regular-user `/api/state` private-data scoping
- admin `/api/state` admin-data availability after server-side verification
- anonymous and regular-user denial for admin endpoints
- admin export protection
- admin state/export secret-marker checks
- regular-user prediction ownership scoping
- service-role key absence from browser source checks
- `.env.example` placeholder checks

No new automated test was added in this branch because the live RLS verification was documentation and metadata-only.

## Static Repo Findings

Static review confirmed:

- `supabase/migrations/202606230001_initial_schema.sql` enables RLS on all required app tables
- no migration defines broad public policies
- no migration defines Supabase Auth `auth.uid()` policies
- `public/app.js` calls internal app endpoints, not Supabase
- `server.js` uses server-side session/admin checks before sensitive admin actions
- deployment docs state the service-role key is backend-only

## Gaps And Risks

Remaining risks:

- RLS has no direct user-level policies because the app does not use Supabase Auth as the primary login system.
- Backend route authorization must remain correct because the service-role key bypasses RLS.
- Broad direct grants are present for `anon` and `authenticated`, but RLS/no-policies blocks access today.
- There is no automated local SQL/policy test suite or pgTAP setup.
- The Supabase schema still keeps an `app_settings` snapshot as the MVP source-of-truth bridge, while relational tables are also upserted.

None of these are current P0 blockers after the live metadata and endpoint regression checks.

## Recommendations

Recommended next steps:

1. Keep the current conservative no-direct-client-policy RLS posture until Supabase Auth or custom JWT claims are intentionally designed.
2. Do not add `using (true)` or `with check (true)` policies on sensitive tables.
3. Keep all browser access routed through app API endpoints.
4. Keep service-role access backend-only.
5. Add a lightweight repeatable RLS metadata script or CI check if this verification should become routine.
6. Consider a future hardening branch to review direct table grants for `anon` and `authenticated`.
7. If the app later adopts Supabase Auth, add an explicit auth-user mapping and rewrite policies to enforce app-user ownership.

## Deferred Or Not Performed

Deferred:

- no production data row contents were inspected
- no write probes were performed
- no policies or grants were changed
- no migrations were applied
- no Supabase Auth policy design was attempted
- no pgTAP/Supabase local policy test suite was added

These deferrals are intentional because the task was read-only verification.

## Local Verification

Final command results for this branch:

- `pnpm.cmd install --frozen-lockfile`: first run hit pnpm's no-TTY module purge prompt; rerun with `CI=true` passed.
- `pnpm.cmd build`: passed, 57/57 tests inside the build flow.
- `pnpm.cmd test`: sandbox run failed only because child-process tests hit `spawn EPERM`; escalated rerun passed, 57/57.
- `VERCEL=1 NODE_ENV=production pnpm.cmd test`: passed, 57/57, and `VERCEL`/`NODE_ENV` were cleared afterward.
- `pnpm.cmd db:check`: first run hit pnpm's no-TTY dependency-status prompt; rerun with `CI=true` passed with `{"ok":true,"driver":"supabase","checkedTables":11}`.

Local warning remains: the runner uses Node `v24.14.0`; the project engine expects Node `22.x`.

## Secret Scan

Final diff scan found only placeholder env var names and safety wording. No real API key, Supabase key, service-role key, session secret, admin PIN, old PIN marker, database URL, phone number, or credential was found.

## Final Verdict

**Passed with warnings.**

Supabase RLS is correctly enabled as defense-in-depth for all required app tables in the live `PollaMundialista` project, and direct `anon`/`authenticated` table reads are blocked by the no-policy posture.

Polla Mundialista remains launch-ready with the existing warning that backend authorization and response scoping are the primary data boundary while the app uses custom sessions and the backend service-role adapter.
