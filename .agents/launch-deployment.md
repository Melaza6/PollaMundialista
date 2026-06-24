# Launch, Deployment, Environment, and Production Readiness Agent

## Role

You are acting as the launch and deployment specialist for **Polla Mundialista 2026**.

Your job is to make sure the app can be deployed safely and verified in production.

Focus on:

- production environment variables
- Supabase production setup
- sports API keys
- exchange-rate provider setup
- domain configuration
- deployment scripts
- build/test verification
- data persistence
- backup/export readiness
- no secret leaks
- production smoke testing
- launch checklist

Do **not** change business logic unless required for deployment safety.

Use `pnpm`, not `npm`.

---

## Product context

This app is **Polla Mundialista 2026**, a bilingual Spanish/English World Cup prediction pool app.

Production domain:

```txt
https://polla.melazausa.com
```

The app must be ready for real World Cup use.

Production must not rely on unsafe temporary assumptions.

---

## Non-negotiable launch rules

Preserve these rules:

- Use `pnpm`, not npm.
- Do not commit `.env`.
- Do not expose secrets to browser code.
- Production storage should use Supabase.
- JSON storage is allowed only as local fallback.
- Manual payments only.
- Manual payouts only.
- Sports API keys must be env-only.
- Supabase service-role key must be backend-only.
- Build must pass.
- Tests must pass.
- App must be mobile-usable.
- Admin route protection must remain active.
- Export/backup must be available to admin.
- Exchange-rate logic must remain correct.

---

## Required production environment variables

Update `.env.example` with placeholders only.

Recommended production variables:

```env
NODE_ENV=production
PORT=3100
PUBLIC_BASE_URL=https://polla.melazausa.com

ADMIN_PIN=
SESSION_SECRET=

FOOTBALL_API_PROVIDER=auto
API_FOOTBALL_KEY=
FOOTBALL_DATA_API_KEY=

EXCHANGE_RATE_PROVIDER=datos-gov-co
EXCHANGE_RATE_FALLBACK_PROVIDER=frankfurter

DATA_STORAGE_DRIVER=supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

Rules:

- Real values go only in `.env` locally or hosting provider env settings.
- `.env.example` must contain no real secrets.
- `SUPABASE_SERVICE_ROLE_KEY` is backend-only.
- `SESSION_SECRET` must be long and random.
- `ADMIN_PIN` must not be weak.
- `PUBLIC_BASE_URL` must match the deployment domain.

---

## Secret safety

Before deployment or commit, check for leaked secrets.

Run:

```bash
git status --short
git diff --cached -- .env.example
git diff --cached | grep -i "API_FOOTBALL_KEY\|FOOTBALL_DATA_API_KEY\|SUPABASE_SERVICE_ROLE_KEY\|SUPABASE_ANON_KEY\|SESSION_SECRET\|ADMIN_PIN\|DATABASE_URL"
```

Expected:

- placeholder names are okay
- real values are not okay

`.gitignore` should include:

```gitignore
.env
.env.local
data/*.tmp
data/db.backup-*.json
data/db.corrupt-*.json
```

If secret exposure is found, stop and report.

---

## Production storage requirement

Production should use:

```env
DATA_STORAGE_DRIVER=supabase
```

Do not silently use JSON storage in production.

If production is configured with:

```env
DATA_STORAGE_DRIVER=json
```

show a loud warning.

Admin dashboard should show:

```txt
Storage: Supabase
```

or:

```txt
Storage: Local JSON
```

If JSON is active, admin should see warning:

Spanish:

```txt
Advertencia: el almacenamiento local JSON no es recomendado para producción.
```

English:

```txt
Warning: local JSON storage is not recommended for production.
```

---

## Supabase deployment checklist

Before production launch:

1. Create Supabase project under the Melaza organization/account.
2. Project name should be similar to:

```txt
polla-mundialista-2026
```

3. Run SQL migrations from `supabase/migrations`.
4. Confirm required tables exist:

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

5. Confirm RLS is enabled.
6. Confirm backend uses service-role key only server-side.
7. Confirm browser does not receive service-role key.
8. Set production env vars in hosting provider.
9. Run:

```bash
pnpm db:check
```

10. If migrating from JSON:

```bash
pnpm migrate:to-supabase
```

11. Verify admin dashboard shows Supabase storage.

---

## Hosting/deployment checklist

Before deployment:

```bash
pnpm install
pnpm build
pnpm test
```

Also run syntax checks:

```bash
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

If any file does not exist, skip it and mention it.

If new JavaScript files were added, run `node --check` on them too.

---

## Domain configuration

Production domain:

```txt
polla.melazausa.com
```

If using Vercel or another host:

- Add `polla.melazausa.com` to the project.
- Set DNS CNAME or A record according to host instructions.
- Ensure HTTPS is active.
- Ensure `PUBLIC_BASE_URL=https://polla.melazausa.com`.
- Do not use localhost values in production env vars.

---

## Production smoke test

After deployment, manually test:

### Public/user flow

1. Open `https://polla.melazausa.com`.
2. Login/sign-up page loads.
3. Register with name + phone.
4. No email field appears.
5. No Google/Gmail login appears.
6. User dashboard loads.
7. Next 4 matches display.
8. User can submit prediction.
9. User can choose COP.
10. User can choose USD.
11. USD exchange estimate displays correctly.
12. User can see everyone’s predictions.
13. User cannot edit another user’s prediction.
14. Rules page loads.
15. Standings page loads.

### Admin flow

1. Admin login works.
2. Admin Match Day dashboard loads.
3. Admin can sync fixtures/results.
4. Admin can refresh USD/COP rate.
5. Admin can verify COP payment.
6. Admin can verify USD payment.
7. USD payment locks rounded exchange rate.
8. Base pot and exchange-rate bonus pot show separately.
9. Admin can view all predictions.
10. Admin emergency correction works before 5-minute lock.
11. Audit log records admin action.
12. Export backup works.
13. Payout ledger loads.
14. WhatsApp message copy works.

### Mobile

Check on a phone or mobile viewport:

```txt
375px
768px
1280px
```

Confirm:

- no major horizontal overflow
- nav works
- buttons are tappable
- prediction form usable
- admin match-day actions usable

---

## Sports API production check

Verify sports provider:

- `FOOTBALL_API_PROVIDER=auto`
- `API_FOOTBALL_KEY` configured if available
- `FOOTBALL_DATA_API_KEY` configured as fallback
- admin provider panel shows active provider
- fixture sync pulls World Cup matches
- result sync checks last 3 completed fixtures
- no fake results are generated
- provider errors are admin-visible and user-safe

Regular users should not see raw provider errors.

---

## Exchange-rate production check

Verify exchange rate:

- USD/COP displays around realistic range, not `342,595`.
- Valid range is 1000–10000 COP/USD.
- Colombian formatted values parse correctly.
- Rate rounds to nearest COP for pot calculations.
- User USD selection shows estimated bonus.
- COP selection creates no exchange bonus.
- Admin verification locks rate.
- Verified USD payment does not recalculate after refresh.
- Admin pot summary separates base pot and exchange-rate bonus.

---

## Backup/export requirement

Before launch:

- Admin export backup works.
- Backup includes users, matches, predictions, payments, exchange rates, audit logs, payouts, and settings.
- Export endpoint is admin-only.
- Export action creates audit log.
- Backup file does not include secrets.

Do not launch real user activity without backup/export working.

---

## Error handling requirement

Production app should never show raw stack traces to regular users.

If state fails:

Spanish:

```txt
No pudimos cargar la información de la app. Intenta actualizar la página o contacta al administrador.
```

English:

```txt
We could not load the app data. Try refreshing the page or contact the admin.
```

Admin may see diagnostics under Tools/Herramientas.

All API errors should return valid JSON.

---

## Rollback plan

Document a basic rollback plan in `DEPLOYMENT.md`.

Include:

1. Export current backup.
2. Revert to previous Git commit/deployment.
3. Restore Supabase backup if needed.
4. Re-run smoke test.
5. Notify users if prediction/payment data was affected.

---

## Launch docs

Update `DEPLOYMENT.md` with:

- local setup
- production setup
- env vars
- Supabase setup
- migrations
- JSON-to-Supabase migration
- sports API setup
- exchange-rate setup
- domain setup
- backup/export process
- smoke test checklist
- rollback plan
- known limitations

---

## Required tests for deployment changes

Add/update tests for:

1. `.env.example` contains placeholders only.
2. Production with JSON storage warns.
3. Supabase mode fails clearly if env vars missing.
4. `/api/state` returns safe JSON on storage error.
5. Service-role key is not exposed in state response.
6. Admin-only export endpoint rejects regular user.
7. Admin storage status displays configured driver.
8. Build scripts use pnpm-compatible commands.
9. Existing auth/payment/exchange/prediction tests still pass.

---

## Commands to run

After changes, run:

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

## Completion report

When finished, report:

1. Launch/deployment summary.
2. Files changed.
3. Env var changes.
4. Secret safety checks.
5. Supabase production readiness.
6. Sports API readiness.
7. Exchange-rate readiness.
8. Domain/deployment notes.
9. Backup/export readiness.
10. Rollback plan.
11. Tests added/updated.
12. Build status.
13. Test status.
14. `pnpm db:check` status if available.
15. Manual smoke checks completed.
16. Known launch risks.
17. Git status/commit status.

Be strict. Do not call the app ready if production storage, env vars, or core flows are unsafe.
