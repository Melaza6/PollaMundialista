# All Agents App Review - Polla Mundialista 2026

Date: 2026-07-01  
Branch: `audit/all-agents-app-review`  
Scope: documentation-only multi-agent audit. No production app behavior was changed.

## Ecosystem Location

Polla Mundialista is a standalone Melaza ecosystem product app managed through Melaza Network.

- MLP / Melaza Landing Page: public marketing website, ecosystem app, public showcase.
- MN / Melaza Network: internal operations/admin platform, ecosystem app, private or sanitized showcase only.
- Polla Mundialista: standalone product app, ecosystem app, public showcase, managed through MN.

Polla Mundialista sits alongside MLP and MN at the ecosystem level. MN manages and tracks Polla Mundialista as an app record, but Polla Mundialista is not structurally part of MN. The verified local workspace is `C:\Users\Owner\Documents\Melaza Ecosystem\Polla mundial`.

## 1. Executive Summary

Polla Mundialista 2026 is close to a focused MVP: name + phone access, no email/Google auth, exact-score-only scoring, manual payments, manual payouts, Supabase production storage, JSON local fallback, provider-backed World Cup sync, Colombian-themed bilingual UI, and mobile-first navigation are all represented in the current codebase.

The largest launch risks are not feature gaps. They are trust and production-readiness gaps: unauthenticated `/api/state` returned admin-oriented collections before the `security/scope-public-state` branch. The `deploy/production-readiness-smoke` branch confirmed anonymous production state is now scoped and `/api/live-readiness` returns `ready:true`; credentialed regular-user/admin smoke, export backup, live mobile QA, and stale documentation cleanup still need follow-up.

Recommendation: treat the app as **ready with warnings**, not fully launch-ready, until credentialed regular-user/admin QA, admin export backup smoke testing, live mobile QA, and documentation cleanup are complete.

## 2. Current App Rules Confirmed

- Users register/login with full name and phone only.
- No email login and no Google/Gmail authentication.
- Payments are manual only and admin-confirmed.
- Payouts and refunds are manual ledger records only.
- Users can see predictions but edit only their own.
- User prediction lock is 15 minutes before kickoff.
- Admin emergency correction lock is 5 minutes before kickoff.
- Admin corrections require a reason and audit log.
- Exact score gives 1 point.
- All non-exact predictions give 0 points.
- Only verified paid predictions count toward match pots/refunds.
- Each match has a base match pot.
- Exact-score match winner(s) split that match pot.
- If no exact-score winner exists, verified match participants get manual refund records.
- COP entry contributes 2,000 COP to the match base pot.
- USD entry contributes 2,000 COP to the match base pot, with excess tracked separately.
- USD exchange-rate bonus is separate from match pots and refunds.
- USD exchange-rate bonus goes only to the final tournament winner by exact-score points.
- Spanish UI translates team names at display/message level only.
- English UI keeps provider team names.
- New prediction forms default to 0-0; existing predictions load saved scores.

## 3. Current Technical State

- Stack: plain Node HTTP server, Vercel Function adapter, static HTML/CSS/JS frontend, pnpm, Node engine `22.x`.
- Main server: `server.js`.
- Frontend: `public/app.js`, `public/styles.css`, `public/teamNames.js`.
- Core rules: `lib/rules.js`.
- Auth helpers: `lib/auth.js`.
- Storage: `server/storage/*` with JSON local fallback and Supabase snapshot/relational persistence.
- Sports sync: `server/sportsProvider.js` with API-Football and football-data.org support.
- Exchange rate: `server/exchangeRateProvider.js` with valid USD/COP range checks.
- Deployment: `api/index.js` exports `server.js` handler for Vercel; `vercel.json` rewrites all traffic to `/api`.
- Tests: `test/settlement.test.js` currently covers scoring, match pots, refunds, USD bonus split, team translation, auth normalization, sports fallback, exchange rate parsing, storage safety, Vercel config, and deployment diagnostics.

## 4. Agent-by-Agent Findings

### Agent Supervisor

The app scope is now coherent: private family prediction pool, not a public money-movement platform. The highest priority is keeping launch scope narrow while resolving data exposure, deployment readiness, live QA, and stale docs.

### Git Branch Hygiene Agent

Current branch was created from clean `main`. Local merged branches shown by Git are `main` and this audit branch only; no branch deletion was performed. Remote feature branches exist and should not be deleted without approval.

### Product Manager Agent

The MVP is strong when the user journey answers: next match, prediction status, payment status, everyone else's predictions, standings, and rules. The admin journey has the right pieces, but should be verified as a match-day checklist rather than a generic dashboard.

### UI/UX Review Agent

The dark Colombian restyle and bottom nav direction fit the app. Next improvements should focus on clarity: compact match cards, settlement summaries, payment/refund explanations, and keeping admin diagnostics under Tools.

### Mobile Responsive Review Agent

Source includes mobile nav and responsive markers, but real browser QA at 375x812, 768x1024, and 1280x900 should remain a launch gate. Admin payment/result tables are the most likely mobile friction point.

### Bilingual Copy Review Agent

Current UI has Spanish/English dictionaries and team-name translation helpers. Project docs now need to keep the same safe language consistently: prediction, participation, manual payment, manual payout, base pot, and exchange-rate bonus.

### World Cup Rules Scoring Agent

`lib/rules.js` implements exact-score-only scoring and deterministic whole-peso splits. Key edge case: tournament bonus is calculable before the tournament is actually over, so UI/docs should call it provisional until admin finalization or a tournament-complete flag exists.

### Payments Pot Logic Agent

Base match pot and USD exchange-rate bonus are separated in the current rule helpers and tests. The next risk is operational: admin must clearly know when a payout/refund is calculated, approved, and paid manually.

### Rules Compliance Risk Agent

The current app boundary is safer than earlier docs: no automatic money movement. Risk remains if user-facing or documentation language suggests app-based money movement, automatic settlement, or public participation beyond the intended family/friend pool. Phone-number exposure should also be minimized outside admin views.

### Security Auth Review Agent

Admin routes generally call `requireAdmin()`, but `/api/state` currently returns admin-oriented fields like `adminPredictions`, `payments`, `storage`, and sports diagnostics to non-admin requests. This should be scoped before wider use.

### Supabase RLS Policies Agent

The migration enables RLS on all app tables and the browser does not directly write to Supabase. Because the app uses a backend service-role adapter and custom sessions, endpoint-level authorization remains the primary control and should be tested aggressively.

### Database Supabase Agent

Storage adapters and `pnpm db:check` are present. Supabase persistence uses both relational table upserts and an `app_settings` snapshot. That is practical for MVP, but future reporting/migration work should reduce reliance on the snapshot as the source of truth.

### Sports API Sync Agent

Sports API logic is centralized in `server/sportsProvider.js`, with no direct browser calls found. Result sync avoids fake results when providers are unavailable. Add monitoring around provider warnings and wrong competition/season detection.

### WhatsApp Communications Agent

WhatsApp is admin-only and manual/share-link based. Templates exist but are minimal compared with the required message catalog; missing types include richer no-exact-winner, payout paid, standings update, and final tournament winner templates.

### Launch Deployment Agent

Vercel config no longer includes the previous invalid runtime entry. Production readiness still depends on env vars, Supabase setup, domain, live readiness, and post-deploy smoke testing. The historical `/api/live-readiness` `ADMIN_PIN=false` issue should be rechecked on the live deployment.

### QA Test Engineer Agent

Automated coverage is good for core rules and server behaviors. Missing coverage is mostly access-control response shape, live browser flows, admin payment/payout operations end-to-end, and production smoke tests.

### Code Review Refactor Agent

`server.js` and `public/app.js` are large and carry many concerns. The app is stable enough for launch work, but future branches should extract route handlers, public/admin state serializers, WhatsApp templates, and admin render helpers.

### Code Comments Documentation Agent

Important code comments exist around production credential fallback and Vercel/server mode. Documentation needs a cleanup pass to align `WORLD_CUP_FAMILY_POOL_APP.md` with the current manual-payment, exact-score, multi-match tournament app.

## 5. Priority Recommendations

### P0 Critical before public launch

| Agent | Area | Recommendation | Why it matters | Suggested branch | Requires |
|---|---|---|---|---|---|
| Security Auth Review | API state exposure | Scope `/api/state` by session role so unauthenticated/regular users do not receive admin prediction rows, payment admin data, storage diagnostics, or provider diagnostics. | Phone numbers, payment status/admin context, and diagnostics should not be public. | `security/scope-public-state` | Code, tests |
| Launch Deployment | Production readiness | Re-run live `/api/live-readiness` after deploy and ensure `ADMIN_PIN`, `SESSION_SECRET`, Supabase, sports API, and domain are configured. | Admin auth and persistence must be production-safe before real users. | `deploy/live-readiness-smoke` | Config, tests/docs |
| Database Supabase | Backup/export | Perform an admin export backup smoke test against production/preview and store the backup securely. | World Cup prediction/payment data must be recoverable. | `qa/admin-export-smoke` | Config, tests/docs |
| Rules Compliance Risk | Stale payment docs | Keep docs aligned with manual payment confirmation, manual payout/refund tracking, and no app-based money movement. | Conflicting docs can cause legal/payment trust confusion. | `docs/manual-payment-language-cleanup` | Docs |

### P1 Important before wider use

| Agent | Area | Recommendation | Why it matters | Suggested branch | Requires |
|---|---|---|---|---|---|
| QA Test Engineer | Access-control tests | Add API tests proving regular users cannot access admin exports, audit logs, payment verification, payout updates, sports sync, or admin state fields. | Prevents regressions in the highest-risk boundary. | `security/admin-access-regression-tests` | Tests |
| Mobile Responsive Review | Real device QA | Run Playwright or browser QA at 375x812, 768x1024, and 1280x900 for login, prediction, payment comment, standings, admin payments, results, and tools. | Most users will use phones; source markers are not enough. | `qa/mobile-production-smoke` | Tests/docs |
| Payments Pot Logic | Payout operations | Add an admin settlement checklist/status display that separates calculated, approved, paid, failed, and cancelled records for match winners, refunds, and tournament bonus. | Manual money operations need explicit tracking. | `ui/admin-settlement-checklist` | Code, tests |
| World Cup Rules Scoring | Final tournament bonus | Make USD tournament bonus clearly provisional until tournament completion or admin finalization. | Prevents premature payout of the final bonus. | `logic/final-bonus-finalization` | Code, tests, copy |
| Supabase RLS Policies | Policy verification | Add a lightweight RLS/policy verification checklist or script that confirms RLS is enabled on all tables and no broad public policies exist. | Service-role backend is primary, but RLS is defense-in-depth. | `security/supabase-rls-verification` | Tests/config/docs |
| Sports API Sync | Provider monitoring | Surface provider warnings only to admin and test wrong season/competition warnings in production-like sync data. | Incorrect fixtures/results can corrupt locks and settlements. | `qa/sports-provider-readiness` | Tests/docs |

### P2 Useful improvements

| Agent | Area | Recommendation | Why it matters | Suggested branch | Requires |
|---|---|---|---|---|---|
| UI/UX Review | Match cards | Tighten match cards around kickoff, lock state, prediction status, match pot, and one primary action. | Faster prediction flow on phone. | `ui/match-card-clarity` | Code, tests |
| WhatsApp Communications | Templates | Add complete bilingual templates for missing predictions, no exact winner/refunds, standings update, payout ready/paid, and final tournament winner. | Admin communication becomes faster and less error-prone. | `ui/whatsapp-template-library` | Code, tests, copy |
| Bilingual Copy Review | Team/name accents | Decide whether source should stay ASCII-only or use proper Spanish accents, then make copy consistent. | Current copy is understandable but less polished. | `copy/spanish-polish-pass` | Copy, tests |
| Code Review Refactor | Server structure | Extract public/admin state serializers and admin route handlers from `server.js`. | Reduces risk of future security and route regressions. | `refactor/state-and-admin-routes` | Code, tests |
| Database Supabase | Snapshot dependency | Plan a migration path where relational tables, not only `app_settings` snapshot, are the durable source of truth. | Improves reporting, recovery, and data integrity. | `db/relational-source-of-truth-plan` | Docs, later code |

### P3 Later polish

| Agent | Area | Recommendation | Why it matters | Suggested branch | Requires |
|---|---|---|---|---|---|
| Product Manager | Post-launch scope | Defer automatic WhatsApp, payment processors, public registration controls, logos, analytics, and advanced tournament modes. | Keeps launch simple and safer. | `product/post-launch-backlog` | Docs |
| UI/UX Review | Empty states | Improve empty states and loading states with shorter bilingual copy. | Makes the app feel calmer when data is missing. | `ui/empty-state-polish` | Code, copy |
| Code Comments Documentation | Developer docs | Add a short architecture map for state serialization, settlement, and storage adapters. | Helps future agents avoid accidental rule changes. | `docs/architecture-map` | Docs |

## 6. Suggested Next Branches

1. `security/scope-public-state`
2. `deploy/live-readiness-smoke`
3. `docs/manual-payment-language-cleanup`
4. `security/admin-access-regression-tests`
5. `qa/mobile-production-smoke`
6. `logic/final-bonus-finalization`
7. `ui/whatsapp-template-library`
8. `refactor/state-and-admin-routes`

## 7. Suggested Tests to Add

- `/api/state` unauthenticated response excludes `adminPredictions`, full `payments`, storage diagnostics, deployment metadata, audit logs, and admin-only sports diagnostics.
- Authenticated regular user receives only safe self/user-facing state and own payout status.
- Admin state receives admin collections after server-side admin auth.
- Regular user cannot call admin export, audit, sports sync, payment verification, payout update, or WhatsApp endpoints.
- Admin export creates an audit log and does not include secrets.
- Tournament bonus is not marked payable before tournament finalization.
- WhatsApp templates never render `undefined`, `null`, `[object Object]`, phone numbers, admin notes, or secrets.
- Playwright smoke: no email field, no Google/Gmail text, no horizontal overflow, prediction submit works, related match predictions open, regular users do not see admin tools.
- Supabase RLS verification: all app tables have RLS enabled; no broad public policies on sensitive tables.
- Sports sync test for wrong competition/season warning and provider fallback.

## 8. Suggested UX Improvements

- Make next match and prediction status the clearest element on user home.
- Keep long payment/exchange explanations in Rules, not every card.
- Use compact "Preds"/"Pron." labels only where space is tight; keep full labels on larger screens.
- Keep admin Tools as the only place for diagnostics, exports, audit logs, storage mode, and provider details.
- Add a match settlement review card for admin: base pot, exact winners, refunds, and USD bonus separation.
- Make manual refund status clear without implying automatic money transfer.

## 9. Suggested Security/Deployment Improvements

- Split public and admin serializers for `/api/state`.
- Add endpoint authorization tests for every admin route.
- Verify production env vars in Vercel after every deploy.
- Keep `ADMIN_PIN` non-default and `SESSION_SECRET` long/random.
- Rotate the production `ADMIN_PIN` because a value was pasted into chat during credentialed smoke planning.
- Confirm browser source and API responses do not expose service-role keys, database URLs, or sports API keys.
- Run production/preview smoke tests after Vercel deploy. Regular-user credentialed smoke passed on `qa/credentialed-production-smoke`; local verification passed again on 2026-07-02. Admin/export smoke remains open until the admin PIN is available as an environment variable to the Codex command environment, or until the owner explicitly approves a different non-logging credential-loading path.
- Confirm Supabase migrations, RLS, and production storage mode are applied before real family activity; this still needs admin/Vercel evidence.

## 10. Suggested Documentation Improvements

- Rewrite `WORLD_CUP_FAMILY_POOL_APP.md` to match the current multi-match tournament product.
- Keep stale payment-provider, checkout, app-based money movement, and automatic settlement language out of user-facing docs.
- Add a one-page admin operating guide: before match day, during match day, after final result, refunds, payout approval, backup/export.
- Add a production launch checklist that includes state scoping, env readiness, Supabase RLS, export backup, sports sync, mobile QA, and secret scan.
- Document that USD exchange-rate bonus is final-tournament-only and provisional until tournament completion.

## 11. Risks and Open Questions

- Should `/api/state` be accessible before login at all, or should it return only landing/rules-safe data?
- Should users see other users' payment statuses, or only their own status plus aggregate pot summaries?
- When exactly is the tournament considered complete for USD bonus payout?
- Should admin have a "finalize tournament bonus" action to prevent accidental early payout?
- Should prediction picks be visible before kickoff, or only after lock/kickoff?
- Should phone numbers ever appear outside admin export/payment screens?
- Should production previews use a separate Supabase project to avoid real data exposure?
- Should Spanish source copy use accents now that the app is stable, or remain ASCII-only for safer terminal handling?

## 12. Final Recommended Roadmap

1. **Secure state and admin boundaries.** Fix `/api/state` role scoping and add access-control tests.
2. **Verify production readiness.** Re-run Vercel readiness, Supabase check, admin login, export backup, and mobile smoke.
3. **Clean user-facing docs/copy.** Keep docs aligned with manual payments, manual payouts, and manual refund tracking.
4. **Harden settlement operations.** Add tournament bonus finalization and clearer admin payout/refund workflow.
5. **Broaden QA.** Add Playwright smoke for mobile and core user/admin flows.
6. **Refactor carefully.** Extract state serializers and route groups once security tests are in place.

## 13. P0 Closeout Update - 2026-07-02

Branch: `p0/closeout-production-readiness`

Completed:

- `WORLD_CUP_FAMILY_POOL_APP.md` was rewritten to match the current manual-payment/manual-payout product boundary.
- Anonymous production endpoint smoke passed again after the Melaza ecosystem workspace move.
- `/api/live-readiness` returned `ready:true`.
- Anonymous `/api/state` remained public-safe.
- Anonymous admin export access returned 403.
- Playwright anonymous browser QA passed at 375x812, 768x1024, and 1280x900 with no horizontal overflow.

Still deferred:

- Admin production smoke: `ADMIN_PIN` is not available in the shell environment.
- Authenticated admin export backup smoke: admin auth is not available.
- Supabase/storage confirmation: anonymous readiness does not expose storage mode and Supabase env vars are not available in this shell.
- Logged-in regular-user browser QA: regular test-user credentials are not available in this shell.

Final P0 recommendation: ready with warnings for anonymous production readiness and public-safe state; not ready for unrestricted real-family launch until `ADMIN_PIN` is rotated, admin/export smoke is completed, production storage mode is confirmed, and logged-in browser QA is completed.

## 14. P1 Access-Control Regression Update - 2026-07-03

Branch: `security/access-control-regression-tests`

Completed:

- Added deeper regression coverage for anonymous, regular-user, and admin `/api/state` response shapes.
- Added real HTTP denial checks for anonymous and regular users against admin-only export, match/result, payment, payout, prediction-correction, WhatsApp, sports verification, sync status, and exchange-rate refresh endpoints.
- Confirmed admin `/api/state` and admin export remain available after server-side admin session verification.
- Confirmed admin state/export do not expose secret marker names or test-only secret values.
- Confirmed regular prediction writes remain scoped to the authenticated session user and cannot be redirected by request-body `userId`.
- Fixed two P1 access-control gaps by requiring admin authorization on `GET /api/sync/status` and `GET /api/exchange-rate/usd-cop`.

Remaining risk:

- Supabase RLS verification remains a separate defense-in-depth task.
- Future endpoint additions should include explicit anonymous, regular-user, and admin coverage before launch use.

## 15. Launch Operations Readiness Update - 2026-07-05

Branch: `ops/launch-operations-readiness`
Runbook: `docs/LAUNCH_OPERATIONS_READINESS.md`

Completed:

- rechecked production readiness after the access-control regression branch was merged to `main`
- confirmed anonymous `/api/state` remains public-safe
- confirmed `/api/live-readiness` returned `ready:true`
- confirmed anonymous export, sync status, and USD/COP refresh endpoints return HTTP 403
- completed admin smoke using `ADMIN_PIN` loaded only from ignored `.env.local`
- completed authenticated admin export backup smoke in memory with no export file written
- confirmed admin state reports storage label `Supabase`
- confirmed sports API readiness through read-only admin status: API-Football and football-data.org configured, active provider `football-data`, status `SYNCED`, World Cup 2026 sanity passed, no warnings
- created the manual launch operations runbook for matchday, payment confirmation, payout/refund handling, final settlement, and export/backup timing

Current launch recommendation:

- ready with warnings for launch operations
- keep exports private and out of Git
- do not trigger fixture sync, result sync, or exchange-rate refresh during read-only smoke checks
- rerun logged-in regular-user browser/mobile QA if production match or prediction data changes materially before launch
- Supabase RLS verification remains a separate defense-in-depth task
