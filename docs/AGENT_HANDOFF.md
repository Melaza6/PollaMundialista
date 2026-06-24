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
