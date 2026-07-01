# AGENTS.md — Polla Mundialista 2026

## Shared agent handoff

Before major work, read:

`docs/AGENT_HANDOFF.md`

After major work, update it with:

- what changed
- files changed
- tests added/updated
- commands run
- remaining risks
- recommended next agent

This keeps all specialist agents aligned.

## Project identity

This repo is **Polla Mundialista 2026**, a bilingual Spanish/English World Cup 2026 family prediction pool app.

The app is for a Colombian/LatAm-style “polla mundialista”: users log in with name and phone, submit exact-score predictions, choose COP or USD participation currency, and admin manually confirms payments and payouts.

The app must feel simple, mobile-first, Colombian-inspired, and match-day ready.

## Core stack and commands

Use **pnpm**, never npm.

Run these before reporting completion:

```bash
pnpm build
pnpm test
node --check server.js
node --check public/app.js
node --check lib/env.js
node --check server/sportsProvider.js
node --check server/exchangeRateProvider.js
```

If new JavaScript files are added, run `node --check` on them too.

Do not claim the work is complete unless build and tests pass, or clearly report the exact failure.

## Non-negotiable product rules

Preserve these rules unless the user explicitly changes them.

### Authentication

- No Google/Gmail authentication.
- No email login.
- No required email address for regular users.
- Users register/login with:
  - full name
  - phone number

- Normalize names and phone numbers.
- Do not create duplicate users for the same normalized phone.
- Admin access must remain server-side protected.
- Regular users must never access admin actions or admin data.

### Predictions

- Users can see all submitted predictions for each match.
- Users can only create/update their own prediction.
- Users can submit one prediction per match.
- Duplicate predictions for the same user + match are not allowed.
- User prediction lock: 15 minutes before kickoff.
- Admin emergency correction lock: 5 minutes before kickoff.
- Admin emergency corrections require a reason and must create an audit log.
- After the 5-minute admin lock, nobody can change predictions.
- Prediction ownership must use `userId`, not user name.

### Matches and sports API

- The app uses provider-backed World Cup match data.
- API-Football is supported.
- football-data.org fallback is supported.
- `FOOTBALL_API_PROVIDER=auto` should continue working.
- API keys must come from environment variables.
- UI must call internal app endpoints, not external sports APIs directly.
- User dashboard should show the next 4 upcoming matches.
- Result sync should focus on the last 3 completed fixtures where practical.
- Do not fake real results.
- If provider sync fails, show a clear admin-visible error.

### Payments

Payments are manual only.

Do not add:

- Stripe checkout
- PayPal checkout
- Wompi checkout
- Mercado Pago checkout
- PayU checkout
- card collection
- automatic verification
- automatic payouts

Manual payment flow:

1. User chooses currency during prediction/payment choice.
2. User may add a payment comment.
3. Payment remains unpaid/pending until admin confirms.
4. Admin verifies, rejects, or marks pending.
5. Only verified payments count toward pots.

Payment statuses:

```txt
unpaid
pending
verified
rejected
```

### Currency and pot logic

Core entry rules:

```txt
COP payment amount: 2,000 COP
USD payment amount: 1 USD
Every verified paid entry contributes exactly 2,000 COP to the base pot.
COP payments create 0 exchange-rate bonus.
USD payments may create exchange-rate bonus.
USD exchange-rate bonus pot is separate from the base pot.
```

For COP:

```txt
basePotContributionCop = 2000
exchangeExcess = 0
actualCopReceived = 2000
```

For USD:

```txt
basePotContributionCop = 2000
actualCopReceived = adminProvidedActualCopReceived || lockedValidUsdCopRate
exchangeExcess = Math.max(0, actualCopReceived - 2000)
```

Never mix the USD exchange-rate bonus into the base pot.

The exchange-rate bonus pot goes to the end-of-World-Cup bonus winner according to existing settlement logic.

### Exchange-rate logic

The app must never display or use invalid USD/COP rates like:

```txt
342,595 COP
342595
```

Valid USD/COP rates must be numeric and between:

```txt
1000 and 10000
```

Correct parsing examples:

```txt
"3.425,95" -> 3425.95
"3425,95" -> 3425.95
"3,425.95" -> 3425.95
"3425.95" -> 3425.95
3425.95 -> 3425.95
```

Use exchange rates as estimates for users.

Lock the rate only when admin verifies a USD payment.

Verified USD payments must not recalculate when the live rate changes.

### Payouts

Payouts are manual only.

The app may calculate payout records and allow admin to mark them:

```txt
calculated
approved
paid
failed
cancelled
```

But the app must not send money automatically.

### Audit logs

Create audit logs for sensitive actions:

- user registration
- user login
- prediction created
- prediction updated
- admin emergency correction
- payment marked pending
- payment verified
- payment rejected
- actual COP received changed
- exchange rate refreshed
- invalid exchange rate rejected
- results synced
- payout calculated
- payout approved
- payout marked paid
- export created

Regular users must not access audit logs.

### Storage

Production should use Supabase.

Local development may use JSON fallback.

Storage modes:

```env
DATA_STORAGE_DRIVER=supabase
DATA_STORAGE_DRIVER=json
```

Rules:

- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.
- Service-role key is backend-only.
- Never commit `.env`.
- Keep `.env.example` placeholder-only.
- If production runs with JSON storage, show a warning.
- If Supabase mode is selected but required env vars are missing, fail clearly or return a safe JSON error.

## Specialized agents

For professional UI/UX review tasks, also follow:

- `.agents/ui-ux-review.md` Use that file when the task involves layout, navigation, mobile readiness, accessibility, visual hierarchy, or reducing UX friction.

- `.agents/payments-pot-logic.md` for COP/USD payments, exchange-rate parsing, base pot, bonus pot, settlement, manual payouts, and financial audit logs.

- `.agents/security-auth-review.md` for auth, sessions, admin route protection, user permissions, Supabase key safety, and sensitive endpoint review.

- `.agents/database-supabase.md` for Supabase schema, storage adapters, JSON fallback, migrations, backups, exports, and production persistence.

- `.agents/qa-test-engineer.md` for regression testing, build verification, manual launch checks, and bug triage.

- `.agents/sports-api-sync.md` for World Cup fixtures, result sync, API-Football, football-data.org, provider fallback, next 4 matches, and sports data accuracy.

- `.agents/mobile-responsive-review.md` for mobile-first layout, touch targets, responsive navigation, match cards, and phone/tablet usability.

- `.agents/launch-deployment.md` for production env vars, Supabase deployment, domain setup, build/test checks, backup/export, smoke testing, and launch readiness.

- `.agents/bilingual-copy-review.md` for Spanish/English labels, rules, payment wording, exchange-rate explanations, error states, and WhatsApp messages.

- `.agents/product-manager.md` for feature prioritization, scope control, MVP discipline, launch readiness, and reducing app complexity.

- `.agents/code-review-refactor.md` for maintainability, duplicate-code cleanup, safer helpers, route refactors, and regression-safe code review.

- `.agents/world-cup-rules-scoring.md` for prediction scoring, standings, exact-score winners, tie handling, settlement, World Cup bonus, exchange-rate bonus, and payout calculation.

- `.agents/whatsapp-communications.md` for WhatsApp reminders, payment messages, result/winner messages, standings updates, payout messages, and copy/share workflow.

- `.agents/rules-compliance-risk.md` for participation rules, manual payment/payout language, privacy, dispute prevention, risk review, and avoiding gambling/payment-processor confusion.

- `.agents/supabase-rls-policies.md` for Supabase Row Level Security, policies, service-role key safety, database access control, and preventing public data exposure.

- `.agents/code-comments-documentation.md` for useful code comments, JSDoc, developer documentation, and explaining complex business/security/financial logic without clutter.

- `.agents/agent-supervisor.md` for selecting the right specialist agents, enforcing task scope, coordinating verification, and keeping `docs/AGENT_HANDOFF.md` updated.

## UX rules

The app should feel fast and simple, not like a long admin database.

### Regular user UX

Regular user should quickly answer:

```txt
What match is next?
Did I predict?
Did I pay?
What did everyone predict?
Where am I in the standings?
```

User navigation should be simple:

Spanish:

```txt
Inicio
Partidos
Predicciones
Tabla
Reglas
```

English:

```txt
Home
Matches
Predictions
Standings
Rules
```

Regular users should not see:

- API diagnostics
- storage mode
- audit logs
- export tools
- admin payout tools
- raw sync errors
- Supabase/JSON warnings

### Admin UX

Admin should land on Match Day / Día de partido.

Admin should quickly answer:

```txt
Who has not predicted?
Who has not paid?
What games are next?
What results just came in?
Who won the last prediction?
What WhatsApp message should I send?
```

Admin tabs:

Spanish:

```txt
Día de partido
Predicciones
Pagos
Resultados
Premios
Reglas
Herramientas
```

English:

```txt
Match Day
Predictions
Payments
Results
Prizes
Rules
Tools
```

Advanced tools belong under Tools/Herramientas.

## Visual design

Use Colombian flag-inspired colors professionally.

Theme tokens:

```txt
Yellow: #FCD116
Blue: #003893
Red: #CE1126
Dark navy: #071A3D
White: #FFFFFF
Soft background: #F8FAFC or #FFF8D6
```

Rules:

- Blue for navigation and structure.
- Yellow for highlights and active states.
- Red for errors, danger, closed predictions.
- Avoid noisy full-screen flag stripes.
- Keep UI readable and accessible.
- Use cards, badges, and clear spacing.
- Keep mobile-first layout.

## Mobile readiness

Always consider phone users first.

Check:

```txt
375px
768px
1280px
```

Requirements:

- No major horizontal overflow.
- Buttons and inputs should be at least 44px tall.
- Score inputs must be easy to tap.
- Tables should become cards or safe horizontal scroll areas.
- Bottom nav should work for regular users on mobile.
- Admin tabs should scroll/collapse cleanly.
- Advanced admin sections should be collapsed by default.

## Error handling

Never show raw crashes to regular users.

If `/api/state` fails, show a friendly message.

Spanish:

```txt
No pudimos cargar la información de la app. Intenta actualizar la página o contacta al administrador.
```

English:

```txt
We could not load the app data. Try refreshing the page or contact the admin.
```

Admin may see technical diagnostics under Tools / Diagnostics.

Use safe JSON parsing for:

- `data/db.json`
- localStorage
- import/export
- API responses

If JSON storage is empty or corrupted:

- do not crash
- back up corrupted file if possible
- create safe default shape
- log the recovery clearly

## Data model expectations

Keep or map toward these entities:

```txt
users
matches
predictions
payments
exchange_rates
audit_logs
prediction_corrections
payouts
app_settings
sync_logs
exports
```

Predictions, payments, corrections, and payouts should reference `userId`.

Do not rely on user names as primary identifiers.

## Supabase safety

If modifying Supabase support:

- Use backend storage adapter.
- Do not make browser write directly to Supabase.
- Keep service-role key server-only.
- Keep RLS enabled and future-ready.
- Add migrations in `supabase/migrations`.
- Update `.env.example` with placeholders only.
- Update deployment docs.
- Keep JSON fallback for local development.

## Testing expectations

When changing a feature, add or update tests around the changed behavior.

Protect especially:

- prediction locks
- admin emergency correction lock
- user ownership checks
- admin-only endpoints
- COP/USD pot logic
- exchange-rate parsing
- exchange-rate validation
- verified USD payment locking
- manual payment flow
- payout ledger
- sports API provider fallback
- storage adapter selection
- `/api/state` error safety
- mobile/simple UX rendering if tests exist

## Git and secrets

Before commit:

```bash
git status --short
git diff --cached -- .env.example
git diff --cached | grep -i "API_FOOTBALL_KEY\|FOOTBALL_DATA_API_KEY\|SUPABASE_SERVICE_ROLE_KEY\|SESSION_SECRET\|ADMIN_PIN"
```

Do not commit real secrets.

`.env` must remain ignored.

Ignore generated temp/backup files:

```gitignore
.env
.env.local
data/*.tmp
data/db.backup-*.json
data/db.corrupt-*.json
```

## Reporting format

When finished, report:

1. Summary of changes.
2. Files changed.
3. Business logic affected.
4. Tests added/updated.
5. Build status.
6. Test status.
7. Manual verification performed.
8. Known limitations.
9. Git status/commit status.

Be honest about anything not completed.
