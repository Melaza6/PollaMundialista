# Polla Mundialista 2026 Learning Guide

This guide explains the production deployment choices for the app.

## Vercel Services Used

- **Deployments:** Vercel builds and releases the app from the GitHub repo.
- **Preview Deployments:** Branches and pull requests can be tested before production.
- **Production Deployment:** The main production release should point to `https://polla.melazausa.com`.
- **Environment Variables:** Secrets and production configuration live in Vercel Project Settings, not in Git.
- **Custom Domain:** `polla.melazausa.com` should be configured in Vercel Domains and DNS.
- **Vercel Functions:** `api/index.js` adapts the existing Node server handler for Vercel's Node runtime.
- **Web Analytics:** Optional page-level usage analytics. Do not send phone numbers, payment comments, admin notes, audit logs, or prediction details.
- **Speed Insights:** Optional performance monitoring for page speed and loading experience.
- **System Environment Variables:** Admin Tools can show safe metadata such as environment, branch, short commit SHA, and deployment URL.
- **Rollbacks:** Vercel can roll back to a previous deployment if a release has a problem.

## Why Supabase Remains The Database

Supabase remains the production database because this app stores relational data:

- users
- matches
- predictions
- payments
- exchange rates
- audit logs
- payout records
- app settings
- sync logs
- export records

These records reference each other. Supabase Postgres is a better fit than Vercel Storage for relational records, admin auditing, migration, backup, and future reporting.

Vercel Storage can be considered later for file or blob use cases, such as archived export files or public assets. It should not replace Supabase for core app data right now.

## Safe Deployment Workflow

```text
feature branch -> Vercel preview -> QA -> merge main -> production deployment -> smoke test
```

Before production:

1. Run `pnpm vercel:check`.
2. Confirm Vercel env vars are set.
3. Confirm Supabase migrations are applied.
4. Run `pnpm db:check` with Supabase env vars.
5. Confirm admin export backup works.
6. Confirm the app works on mobile, tablet, and desktop.

## Secret Safety

Never commit `.env`, `.env.local`, `.vercel`, API keys, Supabase keys, `ADMIN_PIN`, `SESSION_SECRET`, or `DATABASE_URL`.

`SUPABASE_SERVICE_ROLE_KEY` is backend-only. It must never appear in browser code or API responses.
