# Agent Handoff — Polla Mundialista 2026

This file is the shared working memory for all Codex agents on this project.

Every major Codex task should read this file before making changes and update it after finishing.

---

## Current production status

| Area          | Status                                    | Notes                                               |
| ------------- | ----------------------------------------- | --------------------------------------------------- |
| App name      | Polla Mundialista 2026                    | Spanish/English World Cup prediction pool           |
| Auth          | Name + phone                              | No email login. No Google/Gmail auth.               |
| Payments      | Manual only                               | Confirmed by admin only.                            |
| Payouts       | Manual only                               | App calculates payouts; admin sends money manually. |
| Sports API    | API-Football + football-data.org fallback | Provider-backed. No fake results.                   |
| Exchange rate | USD/COP with rounding                     | Parse rate, round to nearest COP for calculations.  |
| Storage       | Supabase production, JSON local fallback  | JSON is not recommended for production.             |
| UX            | Mobile-first                              | Colombian-inspired yellow/blue/red theme.           |
| Domain        | polla.melazausa.com                       | Production target.                                  |

---

## Non-negotiable app rules

- Users log in with name + phone only.
- No email login.
- No Google/Gmail authentication.
- Users can see all predictions.
- Users can edit only their own prediction.
- User prediction lock is 15 minutes before kickoff.
- Admin emergency correction lock is 5 minutes before kickoff.
- Admin emergency corrections require a reason and audit log.
- Payments are manual only.
- Payouts are manual only.
- COP participation is 2,000 COP.
- USD participation is 1 USD.
- Every verified entry contributes exactly 2,000 COP to the base pot.
- COP payments create 0 exchange-rate bonus.
- USD payments may create exchange-rate bonus.
- USD/COP rate is rounded to the nearest Colombian peso for calculations.
- Base pot and USD exchange-rate bonus pot must stay separate.
- Verified USD payments lock the rate and do not recalculate later.
- Production storage should use Supabase.
- JSON storage is local fallback only.
- Supabase service-role key is backend-only.
- `.env` must never be committed.

---

## Specialized agents

| Agent                                 | Purpose                                                  |
| ------------------------------------- | -------------------------------------------------------- |
| `.agents/product-manager.md`          | Scope control, MVP discipline, launch priority           |
| `.agents/ui-ux-review.md`             | UX audit, navigation, visual hierarchy                   |
| `.agents/mobile-responsive-review.md` | Phone/tablet/desktop layout                              |
| `.agents/bilingual-copy-review.md`    | Spanish/English copy and labels                          |
| `.agents/payments-pot-logic.md`       | COP/USD, exchange rate, base pot, bonus pot, payout math |
| `.agents/world-cup-rules-scoring.md`  | Scoring, standings, exact-score winners, ties            |
| `.agents/security-auth-review.md`     | Auth, sessions, admin permissions                        |
| `.agents/database-supabase.md`        | Supabase storage, JSON fallback, migration, backups      |
| `.agents/supabase-rls-policies.md`    | RLS, service-role safety, database access control        |
| `.agents/sports-api-sync.md`          | Fixtures, results, provider fallback                     |
| `.agents/whatsapp-communications.md`  | WhatsApp reminders and winner messages                   |
| `.agents/rules-compliance-risk.md`    | Manual payment/payout wording, privacy, trust            |
| `.agents/qa-test-engineer.md`         | Regression tests and launch verification                 |
| `.agents/launch-deployment.md`        | Env vars, domain, deployment, smoke testing              |
| `.agents/code-review-refactor.md`     | Maintainability, safer helpers, refactor review          |

---

## Latest verified commands

Update this after each major task.

```bash
pnpm build
pnpm test
```

Latest result:

```txt
2026-06-29 Vercel production test-timeout fix: pnpm install --frozen-lockfile, pnpm build, pnpm test, VERCEL=1 NODE_ENV=production pnpm test, VERCEL=1 NODE_ENV=production ADMIN_PIN=test-admin-pin-not-2026 SESSION_SECRET=test-session-secret-long-enough-for-production pnpm test, and pnpm db:check all passed. Local runner warned that Node v24.14.0 does not match project engine 22.x.
```

---

## Latest known app state

Update this after each major task.

### Auth

- Status:
- Notes:
- Risks:

### Predictions

- Status:
- Notes:
- Risks:

### Payments and pot logic

- Status:
- Notes:
- Risks:

### Exchange rate

- Status:
- Notes:
- Risks:

### Sports API

- Status:
- Notes:
- Risks:

### Supabase/storage

- Status:
- Notes:
- Risks:

### UI/UX

- Status:
- Notes:
- Risks:

### Mobile

- Status:
- Notes:
- Risks:

### Rules/copy

- Status:
- Notes:
- Risks:

### Deployment

- Status:
- Notes:
- Risks:

---

## Agent findings log

Add a new entry after every major agent run.

### YYYY-MM-DD — Agent name

**Task:**

**Files changed:**

**What changed:**

**Tests added/updated:**

**Commands run:**

```bash
pnpm build
pnpm test
```

**Result:**

**Remaining risks:**

**Recommended next agent:**

---

## Open issues

| Priority | Issue | Owner agent | Status | Notes |
| -------- | ----- | ----------- | ------ | ----- |
| P0       |       |             |        |       |
| P0       | User-reported Vercel deployment blocker: `Function Runtimes must have a valid version` | `.agents/launch-deployment.md` | Open reminder | Do not address in the small UI fix pass; verify current Vercel config/deploy separately. |
| P1       |       |             |        |       |
| P2       |       |             |        |       |
| P3       |       |             |        |       |

Priority guide:

- **P0:** Launch blocker.
- **P1:** Must fix before real users.
- **P2:** Should fix soon.
- **P3:** Nice to have.

---

## Launch checklist snapshot

| Item                            | Status  | Notes |
| ------------------------------- | ------- | ----- |
| Build passes                    | Unknown |       |
| Tests pass                      | Unknown |       |
| Supabase configured             | Unknown |       |
| JSON fallback works             | Unknown |       |
| Sports API sync works           | Unknown |       |
| Exchange rate valid             | Unknown |       |
| Admin can verify payments       | Unknown |       |
| User can submit prediction      | Unknown |       |
| User/admin permissions verified | Unknown |       |
| Export backup works             | Unknown |       |
| Mobile 375px checked            | Unknown |       |
| Production env vars ready       | Unknown |       |
| Domain ready                    | Unknown |       |

---

## Standard Codex completion report

Every agent should finish with:

1. Summary of changes.
2. Files changed.
3. Business logic affected.
4. Tests added/updated.
5. Build status.
6. Test status.
7. Manual verification performed.
8. Remaining risks.
9. Recommended next agent.
10. Git status/commit status.

---

## Standard command checklist

Run what applies:

```bash
pnpm build
pnpm test
node --check server.js
node --check public/app.js
node --check lib/env.js
node --check lib/rules.js
node --check server/sportsProvider.js
node --check server/exchangeRateProvider.js
node --check server/storage/index.js
node --check server/storage/jsonStorage.js
node --check server/storage/supabaseStorage.js
node --check server/storage/migrateJsonToSupabase.js
node --check server/storage/checkSupabaseConnection.js
```

If Supabase env vars are available:

```bash
pnpm db:check
```

---

## Secret safety checklist

Before any commit, check:

```bash
git status --short
git diff --cached -- .env.example
git diff --cached | grep -i "API_FOOTBALL_KEY\|FOOTBALL_DATA_API_KEY\|SUPABASE_SERVICE_ROLE_KEY\|SUPABASE_ANON_KEY\|SESSION_SECRET\|ADMIN_PIN\|DATABASE_URL"
```

Real secrets must not appear.

`.env` must remain ignored.

---

## 2026-06-24 UX resume completion

### Summary
- Resumed the interrupted UX simplification pass in the GitHub-ready folder `C:\Users\Owner\Documents\Polla mundial`.
- Kept the app on the existing name + phone login model, manual payments, manual payouts, internal sports provider adapter, and Spanish/English UI.
- Added/verified tabbed user and admin navigation so the app is easier to use on phone and desktop.
- Kept match cards focused while predictions/results details stay collapsible or on dedicated admin pages.
- Added compact responsive CSS for bottom mobile user navigation, sticky admin tabs, compact details, WhatsApp panel, and card-style payment tables.
- Removed the unused duplicate `renderAdmin()` renderer to prevent future edits from targeting dead UI.

### Files changed
- `public/app.js`
- `public/styles.css`
- `test/settlement.test.js`
- `docs/AGENT_HANDOFF.md`

### Business logic affected
- No settlement/payment rule changes in this pass.
- Existing USD excess tests still confirm the extra USD/COP value remains separate from the 2,000 COP base pot.
- Existing lock, provider fallback, Supabase, JSON recovery, and payout ledger tests remain green.

### Verification
- `node --check public/app.js`: passed
- `pnpm build`: passed
- `pnpm test`: passed, 41/41 tests
- Local server started on `http://localhost:3101` and returned HTTP 200 for `/` and `/api/state`.
- `/api/state` returned valid JSON with `publicBaseUrl` set to `https://polla.melazausa.com`.

### Manual/browser notes
- In-app browser setup failed with its own runtime metadata error before page control was available.
- Local Playwright was not installed, so automated viewport screenshots were not available without adding a dependency.
- Static responsive markers were verified in CSS and tests: mobile bottom nav, admin tabs, responsive card tables, compact details, theme/tap target markers.

### Remaining risks
- A real visual pass in Chrome/Safari at 375px, 768px, and 1280px is still recommended before launch.
- Confirm production Supabase env vars on the host, not just local `.env`.
- Confirm the production reverse proxy/domain points `polla.melazausa.com` to the Node service over HTTPS.

### Git status
- Uncommitted UX changes remain in the working tree.
- No secrets were printed or added.
- No commit was made during this pass.

## 2026-06-25 Vercel readiness verification completion

### Summary
- Finished verification for the current Vercel readiness pass in `C:\Users\Owner\Documents\Polla mundial`.
- Confirmed `api/index.js` imports the exported `handleRequest` from `server.js` for Vercel Functions.
- Confirmed `server.js` still starts a listener for local `node server.js`, while `VERCEL=1` import mode does not start a listener.
- Hardened production credential behavior so blank/missing `ADMIN_PIN` and `SESSION_SECRET` do not silently use local demo defaults in production.
- Added concise comments around production credential fail-closed behavior, admin-only deployment metadata, and the Vercel/local listener boundary.
- Fixed visible mojibake introduced in `public/app.js` by switching affected separators/placeholders to ASCII-safe text.

### Files changed
- `.env.example`
- `.gitignore`
- `AGENTS.md`
- `.agents/code-comments-documentation.md`
- `api/index.js`
- `vercel.json`
- `DEPLOYMENT.md`
- `docs/LEARNING_GUIDE.md`
- `package.json`
- `public/app.js`
- `server.js`
- `test/settlement.test.js`
- `docs/AGENT_HANDOFF.md`

### Comments added
- `server.js`: production credentials fail closed instead of accepting local demo credentials.
- `server.js`: deployment metadata is admin-only and must not expose raw env vars/secrets.
- `server.js`: `handleRequest` is shared by local Node and the Vercel Function adapter.
- `server.js`: Vercel imports the handler, so only local runs open a listener.

### Verification commands
```bash
node --check server.js
node --check api/index.js
node --check public/app.js
node --check test/settlement.test.js
pnpm build
pnpm test
pnpm db:check
```

### Verification results
- `VERCEL=1 node -e "await import('./server.js')"`: passed; import returned without listener.
- `vercel.json` parse/runtime check: passed; rewrite destination is `/api` and runtime is `nodejs20.x`.
- `pnpm build`: passed.
- `pnpm test`: passed, 43/43 tests.
- `pnpm db:check`: passed, Supabase checked 11 tables.
- Local smoke on `http://localhost:3102`: `/`, `/api/state`, and `/api/live-readiness` returned valid responses.
- Production-mode blank credential smoke on `http://localhost:3104`: `/api/live-readiness` returned `ADMIN_PIN=false` and `SESSION_SECRET=false`; admin auth with `2026` returned 503 `Admin PIN is not configured.`
- Secret scan: only placeholder names/docs/test references were present; no real API keys, Supabase keys, admin PIN, session secret, or database URL were found in the diff.

### Remaining risks
- Real Vercel preview/production deployment still needs to be created and tested.
- Configure production env vars in Vercel dashboard, especially `ADMIN_PIN`, `SESSION_SECRET`, Supabase keys, and sports API keys.
- Confirm `polla.melazausa.com` DNS/HTTPS in Vercel.
- Run a real browser/mobile visual QA pass at 375px, 768px, and 1280px after deployment.
- Confirm admin export backup in the deployed environment before real family use.

### Recommended next agents
- `.agents/mobile-responsive-review.md`
- `.agents/ui-ux-review.md`
- `.agents/qa-test-engineer.md`

### Git status
- Changes remain uncommitted.
- No commit was made during this pass.

## 2026-07-01 Exact-score match-pot scoring change

### Summary
- Continued and completed the `logic/exact-score-match-pot` branch after the previous partial edit.
- Changed prediction scoring from the old `5/2/0` model to exact-score-only scoring:
  - exact score = `1` point
  - correct winner/result without exact score = `0` points
  - wrong prediction = `0` points
- Match settlement now uses exact-score winners only. Correct-winner-only predictions cannot win a match pot.
- Only verified paid predictions count toward match pots, winner payouts, and refund records.
- Manual payouts/refunds remain ledger records only; no automatic money movement was added.

### Files changed
- `lib/rules.js`
- `public/app.js`
- `test/settlement.test.js`
- `WORLD_CUP_FAMILY_POOL_APP.md`
- `docs/AGENT_HANDOFF.md`

### Logic changes
- `scorePrediction()` now returns `1`, `0`, or `null` for non-final results.
- `calculateStandings()` now totals exact-score points only and keeps `correctResult` at `0` for compatibility.
- `calculateMatchSettlement()` now:
  - sums only verified match payments into the match base pot
  - keeps USD exchange excess separate from the match pot
  - splits the match pot only among exact-score winners
  - uses deterministic whole-peso split by `userId` for leftover COP
  - returns manual refund records when a final match has verified paid participants but no exact-score winner
- `calculatePayoutLedger()` now emits `match_refund` ledger records for no-exact-winner matches.
- WhatsApp winner copy now mentions `1` point for exact winners and manual refunds when no exact winner exists.

### UI/copy updates
- Match cards and admin match result cards now show settlement summary:
  - match pot
  - winner payout amount
  - split count when multiple exact winners share the pot
  - manual refund state when no exact winner exists
  - exact-score-only points copy
- Spanish/English rules copy now explains exact score = 1 point, all other final predictions = 0 points.
- `WORLD_CUP_FAMILY_POOL_APP.md` was updated to remove old 5/2 examples and describe match-pot refunds.

### Tests added/updated
- Added/updated tests for:
  - exact score gives 1 point
  - correct winner but wrong score gives 0
  - wrong prediction gives 0
  - one exact-score winner receives the match pot
  - multiple exact-score winners split the match pot
  - deterministic whole-peso leftover split by `userId`
  - no exact-score winner creates refund records for verified participants
  - unpaid/rejected predictions do not count toward match pot/refunds
  - payout ledger creates manual `match_refund` records
  - public app includes `renderSettlementSummary()` and rejects old 5/2 copy

### Verification
```bash
node --check lib/rules.js
node --check public/app.js
node --check server.js
pnpm install --frozen-lockfile
pnpm build
pnpm test
VERCEL=1 NODE_ENV=production pnpm test
pnpm db:check
```
- `node --check lib/rules.js`: passed.
- `node --check public/app.js`: passed.
- `node --check server.js`: passed.
- `pnpm install --frozen-lockfile`: passed, already up to date.
- `pnpm build`: passed, 48/48 tests inside build.
- `pnpm test`: passed, 48/48 tests.
- `VERCEL=1 NODE_ENV=production pnpm test`: passed, 48/48 tests.
- `pnpm db:check`: passed, Supabase checked 11 tables.
- Local warning remains: current Node is `v24.14.0`; project engines want Node `22.x`.

### Remaining risks
- Existing launch blockers from prior entries still apply until production env/readiness and unauthenticated state scoping are verified on the live deployment.
- No live browser/production QA was run for this scoring branch.
- Refunds are calculated as manual ledger records only; admin still needs to approve/pay outside the app.

### Recommended next agent
- `.agents/qa-test-engineer.md` for live smoke after deployment.
- `.agents/rules-compliance-risk.md` if legal/compliance wording needs a final human review before real-money family use.

### Git status
- Changes remain uncommitted.
- No commit was made during this pass.

## 2026-06-29 Colombian sleek restyle pass

### Summary
- Adapted the uploaded sleek.design export (`home.html`, `matches.html`, `leaderboard.html`) as visual inspiration only; no exported code, Tailwind CDN, Iconify CDN, external profile images, or new runtime dependencies were copied in.
- Applied a premium dark sports direction while keeping Colombian flag colors visible: yellow `#FCD116`, blue `#003893`, red `#CE1126`, and dark navy/black surfaces.
- Kept scope to UI rendering and CSS. No auth, payment, payout, exchange-rate, sports API, scoring, Supabase, or business-rule logic was changed.
- Used the requested agent guidance: UI/UX, mobile responsive, bilingual copy, product manager, and QA test engineer.

### UI changes completed
- Landing/login now uses a darker Colombian sports theme, stronger first-viewport card, compact chips, and the existing name + phone forms only.
- User home now emphasizes next match, team abbreviations, prediction availability, and prediction-progress bar.
- Match cards now use stronger versus boards, kickoff/status chips, lock messaging, prediction forms, and the existing related-match predictions button behavior.
- Predictions view keeps the recently fixed match-specific open behavior.
- Standings now render as leaderboard cards with rank, participant, points, submitted/correct counts, and a progress bar.
- Mobile bottom nav keeps compact labels with no horizontal overflow; Spanish shows `Pron.` and English is still configured as `Preds`.
- Admin pages remain functional with the darker card/table treatment and reachable tools tab.

### Files changed
- `public/app.js`
- `public/styles.css`
- `docs/AGENT_HANDOFF.md`

### Verification results
```bash
node --check public/app.js
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm db:check
```
- `node --check public/app.js`: passed.
- `pnpm install --frozen-lockfile`: passed, already up to date.
- `pnpm build`: passed. Local warning remains that Node is `v24.14.0` while project engines want `22.x`.
- `pnpm test`: initial sandbox run hit `spawn EPERM` on the child-server storage-error test; elevated rerun passed 43/43.
- `pnpm db:check`: passed, Supabase checked 11 tables.

### Playwright visual QA
- Ran local Playwright smoke against a JSON-storage server with `data/db.json` backed up and restored afterward.
- Viewports checked: 375x812, 768x1024, 1280x900.
- Checks passed: no horizontal overflow, no email input, no Google/Gmail auth text, no "My Bets" wording, compact mobile nav, related-match predictions open correctly, regular users do not get admin tab controls, and admin Tools tab is reachable.
- Screenshots saved under `tmp/visual-qa/`:
  - `sleek-375.png`
  - `sleek-768.png`
  - `sleek-1280.png`
  - `sleek-375-user-predictions.png`
  - `sleek-1280-admin-tools.png`

### Remaining blockers and risks
- Vercel production still needs the unresolved runtime/deployment blocker handled separately: `Function Runtimes must have a valid version`. This pass intentionally did not change Vercel/runtime config.
- Keep the previous launch/security readiness concerns in view before production launch, especially admin-only diagnostics/state scoping and final production QA after redeploy.
- Local verification used Node `v24.14.0`; production/project target remains Node `22.x`.

### Recommended next agent
- `.agents/launch-deployment.md` for the Vercel runtime blocker.
- `.agents/security-auth-review.md` for production state/diagnostic scoping.
- `.agents/qa-test-engineer.md` for final live QA after redeploy.

### Git status
- Restyle changes remain uncommitted.
- No commit was made during this pass.

## 2026-06-25 Final Vercel preview QA

### Summary
- Ran final production-style QA against the current GitHub-ready folder and live domain `https://polla.melazausa.com`.
- Verified local build/test health, deployed domain reachability, `/api/state`, `/api/live-readiness`, Supabase storage connectivity, deployed JS/CSS safety markers, and responsive source markers.
- Browser screenshot-based viewport QA could not be completed because the in-app browser connector failed during setup and local Playwright is not installed.

### Commands run
```bash
pnpm build
pnpm test
pnpm db:check
```

### Results
- `pnpm build`: passed.
- `pnpm test`: passed, 43/43 tests.
- `pnpm db:check`: passed, Supabase checked 11 tables.
- `https://polla.melazausa.com/`: HTTP 200.
- `https://polla.melazausa.com/api/state`: HTTP 200, valid JSON, `dataStorageDriver` is `supabase`.
- `https://polla.melazausa.com/api/live-readiness`: HTTP 200 but `ready:false` because `ADMIN_PIN` check is failing.
- `https://polla.melazausa.com/app.js`: HTTP 200, no secret markers, no Google/Gmail markers, user/admin tab markers present.
- `https://polla.melazausa.com/styles.css`: HTTP 200, mobile nav/admin tabs/tap target markers present.
- Local diff secret scan: no matches for real API keys, Supabase keys, admin PIN, session secret, or database URL.

### Mobile/tablet/desktop QA status
- Source/deployed CSS markers verified for mobile bottom nav, admin tabs, 44px tap target token, mobile media query, and responsive table/card handling.
- Actual visual viewport checks at 375px, 768px, and 1280px were not completed due unavailable browser automation in this environment.

### Launch blockers
- P0: `/api/live-readiness` returns `ready:false` on the live domain because `ADMIN_PIN` is not passing readiness. Set a private non-default `ADMIN_PIN` in Vercel production env vars and redeploy.

### Remaining risks
- Run real browser visual QA on the Vercel deployment at 375px, 768px, and 1280px.
- Verify admin login and admin Tools in the deployed app after fixing `ADMIN_PIN`.
- Confirm production domain remains HTTPS-valid after DNS propagation and future redeploys.
- Confirm export backup from the deployed admin UI before real family use.

### Git status
- Working tree was clean before this handoff update.
- No commit was made in this QA pass.

## 2026-06-25 Vercel runtime build fix

### Summary
- Fixed the Vercel build failure `Function Runtimes must have a valid version` by removing the invalid `functions.runtime` entry from `vercel.json`.
- Vercel now uses its default Node runtime for `api/index.js`; Node version pinning is handled through `package.json` with `engines.node` set to `22.x`.
- Confirmed `api/index.js` exports the default handler from `server.js`, and `server.js` only starts a listener when not running under Vercel.
- No business logic was changed.

### Files changed
- `vercel.json`: removed invalid `functions["api/index.js"].runtime`; kept `maxDuration` and the `/api` rewrite.
- `package.json`: pinned Node with `"engines": { "node": "22.x" }`.
- `test/settlement.test.js`: updated Vercel deployment config assertion to require no explicit runtime and to verify the Node engine pin.
- `docs/AGENT_HANDOFF.md`: recorded this verification pass.

### Local verification
```bash
node --check api/index.js
node --check server.js
node --check public/app.js
pnpm build
pnpm test
pnpm db:check
```

### Results
- `node --check api/index.js`: passed.
- `node --check server.js`: passed.
- `node --check public/app.js`: passed.
- Vercel import smoke with `VERCEL=1`: passed; importing `server.js` did not start a listener.
- Local server smoke: passed on port `3106`; `/` and `/api/state` returned HTTP 200, then the test server was stopped.
- `pnpm build`: passed.
- `pnpm test`: passed, 43/43 tests.
- `pnpm db:check`: passed, Supabase checked 11 tables.
- Secret scan over the working diff: only env variable names in docs/source/tests were found; no real API keys, Supabase keys, admin PIN, session secret, or database URL were found.

### Deployment QA status
- Final QA against `https://polla.melazausa.com` must wait until this runtime fix is committed, pushed, and Vercel redeploys.
- The previous live QA remains useful background, but the live deployment has not yet been verified with this runtime fix.

### Remaining launch blockers
- Commit and push this fix, then confirm Vercel deploys successfully.
- Re-run final Vercel QA against `https://polla.melazausa.com` after redeploy.
- Confirm `/api/live-readiness` returns `ready:true`, especially `ADMIN_PIN` and `SESSION_SECRET` checks.
- Complete real visual QA at 375px, 768px, and 1280px in a browser.

### Recommended next action
- Commit/push the runtime fix and trigger a Vercel redeploy, then run the final production QA checklist.

## 2026-06-25 Final Vercel production QA after redeploy

### Summary
- Ran final production QA against `https://polla.melazausa.com` after redeploy.
- Local build/test/database checks passed.
- Production domain is reachable and `/api/state` uses Supabase.
- Launch verdict: **Not ready** because `/api/live-readiness` is still `ready:false` and unauthenticated `/api/state` returns admin-sensitive collections.

### Commands run
```bash
pnpm build
pnpm test
pnpm db:check
```

### Local verification results
- `pnpm build`: passed.
- `pnpm test`: passed, 43/43 tests.
- `pnpm db:check`: passed, Supabase checked 11 tables.

### Production endpoint QA
- `/`: HTTP 200.
- `/api/state`: HTTP 200, valid JSON, storage driver is `supabase`.
- `/api/live-readiness`: HTTP 200, valid JSON, but `ready:false`.
- `ADMIN_PIN` readiness check: false.
- `SESSION_SECRET` readiness check: true.
- `/app.js`: HTTP 200.
- `/styles.css`: HTTP 200.
- `/rules`, `/reglas`, `/project-guide`, `/guide`, `/docs/LEARNING_GUIDE.md`, and `/DEPLOYMENT.md`: HTTP 200 app-shell responses through SPA fallback.

### Public asset and secret safety QA
- `/app.js`: no secret marker matches for real API keys, Supabase keys, `SESSION_SECRET`, `ADMIN_PIN`, or `DATABASE_URL`.
- `/app.js`: no Google/Gmail/Firebase/OAuth auth markers found.
- `/styles.css`: responsive/mobile markers found: `@media`, `user-bottom-nav`, `admin-tabs`, `--tap: 44px`, `overflow-x`, and `min-height: var(--tap)`.
- `/styles.css`: Colombian palette markers found: `#FCD116`, `#003893`, `#CE1126`, and `#071A3D`.
- `/api/state`, `/app.js`, `/styles.css`, and `/`: no secret marker matches for real API keys, Supabase keys, `SESSION_SECRET`, `ADMIN_PIN`, or `DATABASE_URL`.

### Sports API readiness
- `/api/state` reports `sportsVerification.activeProvider` as `football-data`.
- Sports API is configured, status is `SYNCED`, and appears to be using FIFA World Cup 2026 provider-backed data.
- No fake-result marker was found in the live state; result sync message reports last completed fixtures checked and results updated.

### Exchange-rate readiness
- Live exchange rate is `3428.32`, which is within the valid 1000-10000 COP/USD range.
- No invalid USD/COP value such as `342,595` or `342595` was observed in readiness/state data.

### Access-control and privacy findings
- Regular unauthenticated UI appears to start on the landing/login shell and admin tabs are role-gated in client code.
- P0/P1 blocker: unauthenticated `/api/state` currently includes admin-sensitive collections such as `users`, `payments`, `adminPredictions`, and `auditLogs` keys. Counts observed: `users=4`, `payments=19`, `adminPredictions=19`, `auditLogs=0`.
- Admin deployment metadata was not present for unauthenticated state, and no secrets were observed.

### Page reachability findings
- Landing page is reachable at `/`.
- Rules are reachable through the in-app `#rules` link and SPA fallback routes return HTTP 200.
- Project Guide routes return HTTP 200 via the SPA fallback, but no distinct public Project Guide UI marker was confirmed in the shipped client source.

### Visual/mobile QA status
- In-app browser setup failed in this environment with a browser connector metadata error.
- Local Playwright is not installed, so screenshot-based viewport QA at 375px, 768px, and 1280px could not be completed here.
- Source CSS contains the expected responsive markers, but real visual QA is still required on a device/browser.

### Manual viewport checks still required
- At 375px: verify no horizontal overflow, bottom nav usable, login/sign-up readable, prediction score inputs tappable, match cards compact, and admin tabs scroll cleanly.
- At 768px: verify tablet layout, cards/grid wrapping, admin payment/result panels, and rules readability.
- At 1280px: verify desktop spacing, admin dashboard density, tables/scroll containers, and no excessive empty or oversized panels.

### Launch blockers
- P0: `/api/live-readiness` returns `ready:false` because `ADMIN_PIN` readiness is false. Set a private non-default `ADMIN_PIN` in Vercel production env vars and redeploy.
- P0/P1: unauthenticated `/api/state` exposes admin-sensitive collections. Public state should be scoped to regular-user-safe fields, with admin collections returned only after admin authentication.
- P1: complete real browser visual QA at 375px, 768px, and 1280px.
- P2: confirm whether Project Guide needs a visible public app page/link, because current route checks only confirm SPA fallback reachability.

### Launch verdict
- **Not ready for launch** until the readiness check passes and unauthenticated state is scoped safely.

### Recommended next action
- Fix production `ADMIN_PIN` env configuration in Vercel.
- Patch `/api/state` to return only user-safe data unless an authenticated admin session is present.
- Redeploy, then re-run this QA checklist including browser viewport checks.

## 2026-06-29 Small UI fixes in correct app folder

### Summary
- Applied the requested three small UI fixes in `C:\Users\Owner\Documents\Polla mundial`.
- Removed the unused landing-page Rules button.
- Changed the match-card "Ver predicciones / View predictions" action so it opens the user Predictions tab for that specific match instead of only toggling inline details.
- Shortened the regular-user mobile bottom-nav predictions label to `Pron.` in Spanish and `Preds` in English while preserving full labels on wider layouts.
- Left business logic, auth, payments, payouts, exchange-rate, sports API, and Supabase logic unchanged.

### Files changed
- `public/app.js`
- `public/styles.css`
- `test/settlement.test.js`
- `docs/AGENT_HANDOFF.md`

### Tests added/updated
- Updated the existing UI/source marker test to look for the new `data-show-predictions` action hook and compact mobile tab label marker.

### Commands run
```bash
node --check public/app.js
pnpm build
pnpm test
pnpm db:check
```

### Results
- `node --check public/app.js`: passed.
- `pnpm build`: passed, with Node engine warning because local runtime is Node `v24.14.0` while the project wants `22.x`.
- `pnpm test`: passed, 43/43 tests.
- `pnpm db:check`: passed, Supabase checked 11 tables.
- Playwright 375px smoke passed against a local JSON-storage server with `data/db.json` backed up and restored afterward: no horizontal overflow, mobile nav showed `Pron.`, landing Rules button was absent, and the match-specific predictions action opened the related match in the Predictions tab.

### Remaining risks
- User reports Vercel still has deployment blocker `Function Runtimes must have a valid version`; this pass intentionally did not change deployment/runtime config.
- Keep the production readiness/security blockers from the previous QA entry in view before launch.

### Recommended next agent
- `.agents/launch-deployment.md` for the unresolved Vercel runtime blocker.
- `.agents/qa-test-engineer.md` for final production smoke after redeploy.

### Git status
- Changes remain uncommitted.
- No commit was made during this pass.
