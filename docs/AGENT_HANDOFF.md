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
Not updated yet.
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
