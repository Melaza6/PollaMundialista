# Polla Mundialista 2026 Deployment

Production domain: `https://polla.melazausa.com`

This app is a bilingual family World Cup prediction pool. It uses a custom Node HTTP server, server-side sessions, manual payments, manual payouts, provider-backed sports sync, and Supabase for production persistence.

## Local Development

1. Install dependencies with `pnpm install`.
2. Create a private `.env` from `.env.example`.
3. For local-only storage, use `DATA_STORAGE_DRIVER=json`.
4. Start locally with `pnpm start` or `pnpm dev`.
5. Open `http://localhost:3000` unless `PORT` is changed.

Local `.env` files are loaded automatically by `node server.js`, `pnpm start`, and `pnpm dev`. `.env` is ignored by Git and must never be committed.

## Vercel Setup

Recommended Vercel services for this app:

- Vercel Deployments for production releases.
- Preview Deployments for branch/PR QA.
- Production Deployment from the protected main branch.
- Environment Variables in the Vercel dashboard.
- Custom Domain: `polla.melazausa.com`.
- Vercel Functions with Node.js 20 runtime through `api/index.js`.
- Web Analytics for page-level usage only.
- Speed Insights for page performance only.
- Vercel System Environment Variables for safe admin diagnostics.
- Deployment Protection for previews and admin-only review links where useful.
- Rollback through previous Vercel deployments.

Do not force Vercel Storage for app data. Supabase remains the production database.

## Vercel Compatibility

The app's source server is `server.js`. Local development still runs as a long-running Node process with `node server.js`.

For Vercel, `server.js` exports `handleRequest`, and `api/index.js` re-exports it as a Vercel Function. `vercel.json` rewrites all requests to that function so the existing server code can serve both `/api/*` routes and static files from `public/`.

Vercel should use:

- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Runtime: Node.js 20+

Run `pnpm vercel:check` before pushing a deployment candidate.

## Required Vercel Environment Variables

Set production values in Vercel Project Settings, not in source code.

```env
NODE_ENV=production
PUBLIC_BASE_URL=https://polla.melazausa.com

ADMIN_PIN=
SESSION_SECRET=

FOOTBALL_API_PROVIDER=auto
API_FOOTBALL_KEY=
API_FOOTBALL_WORLD_CUP_LEAGUE_ID=1
API_FOOTBALL_SEASON=2026
FOOTBALL_DATA_API_KEY=

EXCHANGE_RATE_PROVIDER=datos-gov-co
EXCHANGE_RATE_FALLBACK_PROVIDER=default-estimate
DEFAULT_USD_COP_RATE=4000

DATA_STORAGE_DRIVER=supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

ENABLE_VERCEL_ANALYTICS=true
ENABLE_VERCEL_SPEED_INSIGHTS=true
```

Security notes:

- `ADMIN_PIN` must be private and not weak.
- `SESSION_SECRET` must be long and random.
- API keys are server-side only.
- `SUPABASE_SERVICE_ROLE_KEY` is backend-only and must never be exposed to browser code.
- `DATABASE_URL` is optional for SQL tooling and must not be exposed to the browser.
- Do not print or log secrets.

## Supabase Production Database

Supabase should remain the production database for this app.

Reason:

- The app has relational data: users, matches, predictions, payments, exchange rates, audit logs, payout records, app settings, sync logs, and export records.
- Predictions, payments, corrections, payouts, and audit logs reference users and matches.
- Supabase Postgres is a better fit than Vercel Storage for relational records and future reporting.
- Vercel Storage can be considered later only for file/blob needs, such as public assets or archived export files.

Supabase setup:

1. Create a Supabase project under the Melaza account or organization.
2. Apply SQL migrations from `supabase/migrations`.
3. Confirm these tables exist: `users`, `matches`, `predictions`, `payments`, `exchange_rates`, `audit_logs`, `prediction_corrections`, `payouts`, `app_settings`, `sync_logs`, `exports`.
4. Confirm RLS is enabled on app tables.
5. Set `DATA_STORAGE_DRIVER=supabase` in Vercel.
6. Add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in Vercel env vars.
7. Run `pnpm db:check` locally or in a safe CI environment with production-like env vars.
8. If migrating local JSON data, run `pnpm migrate:to-supabase` once after backing up.
9. Verify Admin -> Tools shows `Storage: Supabase` and no secrets.

## JSON Storage Fallback

`DATA_STORAGE_DRIVER=json` is for local development only.

In production, JSON storage is risky because serverless files are not persistent across deployments. If production runs with JSON storage, admin tools show a warning. Use Supabase for real family activity.

## Sports API Setup

The browser must never call external football APIs directly. It uses internal app endpoints only.

Primary provider:

- API-Football by API-SPORTS
- Env key: `API_FOOTBALL_KEY`

Fallback provider:

- football-data.org
- Env key: `FOOTBALL_DATA_API_KEY`

Recommended setting:

```env
FOOTBALL_API_PROVIDER=auto
```

Admin can trigger fixture/result sync from the app. If providers are unavailable, cached data remains and users see pending sync instead of fake results.

## Exchange-Rate Setup

The app fetches USD/COP from Colombia TRM data (`datos.gov.co`) when available.

Rules:

- Valid USD/COP rates must be between 1000 and 10000.
- Values are rounded to the nearest Colombian peso for calculations.
- Invalid rates are rejected and shown to admin only.
- `DEFAULT_USD_COP_RATE` is the safe fallback estimate when TRM sync is unavailable.
- Verified USD payments lock the actual COP received and do not recalculate later.
- Base pot and exchange-rate bonus pot stay separate.

## Manual Payments and Payouts

This app does not use in-app checkout or automatic payouts.

- Users choose COP or USD and may add a payment comment.
- Admin manually verifies or rejects payments.
- Admin may enter actual COP received for USD payments.
- The app calculates payout records, but admin sends prize money manually.

## Web Analytics and Speed Insights

Enable Web Analytics and Speed Insights in the Vercel dashboard if desired.

Use them only for page-level and performance-level information. Do not send these private values to analytics:

- phone numbers
- payment comments
- admin notes
- audit logs
- prediction details tied to a person
- API keys or database URLs

This app currently documents the Vercel toggles with `ENABLE_VERCEL_ANALYTICS` and `ENABLE_VERCEL_SPEED_INSIGHTS`. It does not add client-side analytics packages, because this plain HTML/JS app does not need them for launch and should avoid collecting private pool details.

## Vercel System Environment Variables

Vercel provides safe deployment metadata such as:

```env
VERCEL_ENV
VERCEL_GIT_COMMIT_SHA
VERCEL_GIT_COMMIT_REF
VERCEL_URL
```

Admin -> Tools may show safe diagnostics:

- provider (`vercel` or `local`)
- deployment environment
- short commit SHA
- branch
- deployment URL
- public base URL

The app must not show secrets, database URLs, API keys, service-role keys, or the full environment object.

## Preview Deployments

Recommended workflow:

```text
feature branch -> Vercel preview -> QA -> merge main -> production deployment
```

Use previews for:

- mobile/tablet/desktop QA
- Spanish/English copy checks
- admin workflow checks
- result sync UI checks with safe test env values

Preview guidance:

- Do not use production-only secrets in previews unless required.
- Prefer separate preview Supabase data or safe test data.
- Protect preview deployments if family or payment data could be visible.
- Run `pnpm vercel:check` before relying on a preview.

## Custom Domain Setup

Domain: `polla.melazausa.com`

1. Add `polla.melazausa.com` in Vercel Project Settings -> Domains.
2. Configure DNS at Namecheap or the current DNS provider using the record Vercel provides.
3. Wait for DNS propagation.
4. Confirm HTTPS is active in Vercel.
5. Set `PUBLIC_BASE_URL=https://polla.melazausa.com` in production env vars.
6. Redeploy after env var changes.
7. Open `https://polla.melazausa.com/api/live-readiness` and confirm readiness.

## Deployment Protection

Recommended:

- Keep production deployment limited to the main branch.
- Use Vercel preview deployment protection for non-public previews.
- Do not expose admin credentials in preview comments or logs.
- Rotate `ADMIN_PIN` and `SESSION_SECRET` if accidentally shared.

## Production Startup Safety

The app should behave safely at startup:

- `NODE_ENV=production` with `DATA_STORAGE_DRIVER=json` produces a clear warning.
- `DATA_STORAGE_DRIVER=supabase` with missing env vars returns safe JSON errors instead of crashing `/api/state` with raw output.
- `/api/state` must not expose stack traces or secrets.
- Regular users see friendly error messages.
- Admin tools may show safe diagnostics only.

## Production Smoke Test

After deployment, test:

1. Open `https://polla.melazausa.com`.
2. Login/sign-up page loads.
3. Register a test user with name + phone.
4. Confirm no email field and no Google/Gmail auth.
5. User sees next 4 matches.
6. User submits a COP prediction.
7. User submits a USD prediction.
8. Admin login works.
9. Admin verifies COP payment.
10. Admin verifies USD payment.
11. USD payment locks rounded exchange rate.
12. Base pot and exchange bonus remain separate.
13. Sports fixture sync works.
14. Result sync works without fake results.
15. Exchange-rate refresh works or shows safe fallback.
16. Rules page loads.
17. Admin Tools are protected from regular users.
18. Export backup works.
19. WhatsApp copy/share workflow works.
20. Mobile views work at about 375px, 768px, and 1280px.
21. `https://polla.melazausa.com/api/live-readiness` returns expected readiness JSON.

## Backup and Export

Before real family activity:

- Verify admin export backup works.
- Confirm exports include users, matches, predictions, payments, exchange rates, audit logs, payouts, settings, sync logs, and export records.
- Confirm export endpoints are admin-only.
- Confirm export actions create audit logs.
- Store backups securely; they may include phone numbers and payment comments.

## Rollback

If a production deployment causes problems:

1. Export a backup first if the app is still usable.
2. Use Vercel's previous deployment rollback.
3. If data was affected, restore from Supabase backup or the admin export as appropriate.
4. Re-run the production smoke test.
5. Notify family users if prediction/payment data may have been affected.

## Final Launch Checklist

- `pnpm install` completed.
- `.env.example` has placeholders only.
- Vercel env vars are set in the dashboard.
- Supabase migrations are applied.
- `pnpm db:check` passes with Supabase env vars.
- `pnpm build` passes.
- `pnpm test` passes.
- `pnpm vercel:check` passes.
- Production domain and HTTPS work.
- Admin dashboard shows Supabase storage.
- Admin export backup works.
- Sports sync works or shows safe pending sync.
- Exchange-rate sync works or shows safe fallback.
- Production smoke test passes.
