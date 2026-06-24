# Polla Mundialista 2026 Deployment

Production domain: `https://polla.melazausa.com`

## Runtime

- Node.js 20+
- pnpm 11+
- Start command: `pnpm start`
- Build/check command: `pnpm build`

## Required Environment

Copy `.env.example` into your host environment and set:

- `PUBLIC_BASE_URL=https://polla.melazausa.com`
- `ADMIN_PIN` to a private value, not `2026`
- `SESSION_SECRET` to a long random value
- `FOOTBALL_API_PROVIDER=auto`
- `API_FOOTBALL_KEY` from API-Football by API-SPORTS
- Optional fallback: `FOOTBALL_DATA_API_KEY` from football-data.org
- `EXCHANGE_RATE_PROVIDER=datos-gov-co`
- `DATA_STORAGE_DRIVER=supabase` for production
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` for backend only
- Optional `DATABASE_URL` for SQL tooling

Local development can use a `.env` file in the project root. It is loaded automatically by `node server.js`, `pnpm start`, and `pnpm dev`. `.env` is ignored by Git and must never be committed.

Never put `SUPABASE_SERVICE_ROLE_KEY` in browser code. All Supabase writes in this app go through backend routes that enforce the app's session/admin checks.

## Live Readiness Check

After deploying, open:

```text
https://polla.melazausa.com/api/live-readiness
```

The response should show `"ready": true`.

## Authentication

The app uses server-side session tokens stored through the configured storage driver. Users register and log in with full name, phone, and preferred language. The server normalizes phone and name to prevent duplicate participant profiles. Admin access is protected by an admin session created with `ADMIN_PIN`.

Do not expose `ADMIN_PIN` or `SESSION_SECRET` in client code.

## Payments

The app is manual-payment only. It does not collect card details, open checkout pages, or automatically verify payments.

Admin can mark payments pending, verified, or rejected and enter actual COP received for USD payments. Verified USD payments lock the exchange-rate audit fields and exchange excess at confirmation time.

## Exchange Rate

USD/COP is fetched server-side from Colombia's public TRM data when available. Values are parsed and accepted only when they are between `1000` and `10000` COP per USD. Invalid rates are rejected, recorded in the admin exchange-rate panel, and never used for payment settlement.

For USD payments, the displayed rate is only an estimate. Admin verification locks the final actual COP received and exchange bonus. COP payments always contribute `2,000 COP` to the base pot and `0 COP` to the exchange bonus.

## Persistence

Production storage is Supabase Postgres. Local development can use `DATA_STORAGE_DRIVER=json`, which stores data in `data/db.json` with atomic writes and timestamped backups.

For production, use `DATA_STORAGE_DRIVER=supabase`. If JSON is used in production, the host must provide a persistent writable volume for `data/`; otherwise users, sessions, predictions, payments, audit logs, payouts, and synced fixtures will be lost on redeploy. JSON file storage is not safe for serverless deployments unless the platform guarantees persistent writes.

Supabase setup:

1. Create a Supabase project.
2. Apply SQL migrations from `supabase/migrations`.
3. Copy the project URL.
4. Copy the service-role key for backend environment variables only.
5. Set `DATA_STORAGE_DRIVER=supabase`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
6. Run `pnpm db:check`.
7. If migrating local data, run `pnpm migrate:to-supabase`.
8. Start the app and verify the admin dashboard shows `Storage: Supabase`.

The current storage adapter keeps a full app snapshot in `app_settings` for compatibility with the existing app state, and also upserts normalized launch tables (`users`, `matches`, `predictions`, `payments`, `exchange_rates`, `audit_logs`, `prediction_corrections`, `payouts`). Keep using backend routes for writes until RLS policies are reviewed for direct browser access.

## Sports Data

The browser never calls the football APIs directly. The UI uses internal app endpoints:

- `POST /api/admin/matches/sync`
- `POST /api/admin/results/sync`
- `GET /api/matches/upcoming`
- `GET /api/matches/:id/result`
- `GET /api/sync/status`
- `GET /api/exchange-rate/usd-cop`

Primary provider is API-Football by API-SPORTS. football-data.org is the fallback when configured. Secrets must stay in environment variables. Do not commit API keys.

If both providers are unavailable or unconfigured, the app keeps cached fixtures/results and shows `Pending sync`. Final scores from the sports API are the source of truth for settlement.

Admin verification endpoint:

```text
https://polla.melazausa.com/api/admin/sports/verify
```

The admin dashboard shows provider, configured keys, fixture/result sync times, fixture counts, competition/season, warnings, and sample upcoming games.

## WhatsApp

The app generates WhatsApp-ready messages and share links for invites, payment reminders, prediction reminders, lock warnings, results, standings, winners, and payouts. It does not automatically post into a group chat.

## Admin Launch Tools

The admin dashboard includes:

- Match-day summary for next matches, missing predictions, unpaid users, sync status, and exchange-rate status.
- Audit log for sensitive actions.
- Export buttons for full JSON backup and CSV users, predictions, payments, standings, payouts, and audit logs.
- Payout ledger. Prize payouts are manual; the app calculates records and admin can mark them approved or paid.

## Deployment Checklist

- Install dependencies with `pnpm install`.
- Set production environment variables.
- Create Supabase project and apply `supabase/migrations`.
- Run `pnpm db:check`.
- Run `pnpm migrate:to-supabase` if importing existing local JSON data.
- Run `pnpm build`.
- Run `pnpm test`.
- Start app and verify admin dashboard shows `Storage: Supabase`.
- Confirm the admin export backup downloads.
- Confirm audit log records payment verification and emergency corrections.
- Confirm payout ledger is visible and does not send money automatically.
- Confirm `https://polla.melazausa.com/api/live-readiness`.
- Log in as admin and verify API status.
- Trigger fixture sync and confirm World Cup 2026 games.
- Register a user and confirm duplicate phone/name handling.
- Confirm prediction lock behavior.
- Verify a manual payment.
- Generate WhatsApp messages.
