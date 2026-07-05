# Launch Operations Readiness - Polla Mundialista 2026

Date: 2026-07-05
Branch: `ops/launch-operations-readiness`
Workspace: `C:\Users\Owner\Documents\Melaza Ecosystem\Polla mundial`
Production URL: `https://polla.melazausa.com`

## Summary

This pass completed the launch operations layer for Polla Mundialista after the access-control regression branch was merged to `main`.

Scope:

- production readiness smoke after the access-control merge
- manual matchday, payment, payout, and refund operations runbook
- sports API readiness review
- export/backup readiness review

No app behavior was changed. No auth, scoring, match pot, USD exchange bonus, payment, payout/refund, sports provider, storage, RLS, Vercel config, or package files were changed.

## Production Readiness Smoke

Production endpoints checked:

| Endpoint | Result |
| --- | --- |
| `/` | HTTP 200 |
| `/app.js` | HTTP 200, no secret markers found |
| `/styles.css` | HTTP 200, no secret markers found |
| `/api/state` anonymous | HTTP 200, valid JSON |
| `/api/live-readiness` | HTTP 200, `ready:true` |
| `/api/admin/export/backup` anonymous | HTTP 403 |
| `/api/sync/status` anonymous | HTTP 403 |
| `/api/exchange-rate/usd-cop` anonymous | HTTP 403 |

Anonymous `/api/state` remained public-safe:

- `currentUser`: `null`
- matches: 109
- next matches: 4
- users: 0
- payments: 0
- payouts/refunds: 0
- audit logs: 0
- admin predictions: 0
- no phone or normalized-phone keys detected
- no payment, payout/refund, audit, diagnostics, admin config, or env-like secret markers detected

`/api/live-readiness` returned `ready:true` with no failing keys.

The latest access-control hardening is reflected in production for the two newly protected read endpoints:

- anonymous `GET /api/sync/status`: HTTP 403
- anonymous `GET /api/exchange-rate/usd-cop`: HTTP 403

## Credentialed Checks

Admin credential handling:

- `.env.local` was confirmed ignored by Git.
- `ADMIN_PIN` was loaded from ignored `.env.local` only into the active command process.
- The `ADMIN_PIN` value was not printed, written to files, committed, documented, or included in command output.
- The transient `ADMIN_PIN` environment value was cleared after use.

Admin smoke result:

- admin login returned role `ADMIN`
- authenticated admin `/api/state` returned role `ADMIN`
- admin state included users, payments, payouts/refunds, audit logs, admin predictions, sports diagnostics, and storage status
- admin storage label reported `Supabase`
- admin state secret-marker scan found no secret markers

Authenticated admin export backup result:

- authenticated admin `GET /api/admin/export/backup`: HTTP 200
- export parsed as JSON
- export was inspected in memory only
- no export file was written, committed, uploaded, or left behind
- export secret-marker scan found no API key, Supabase key, service-role key, session secret, database URL, `ADMIN_PIN`, or old PIN marker

Regular-user smoke in this pass:

- Deferred.
- Reason: no approved regular-user full-name plus phone credential pair was available under the expected non-logging environment variable names in the active process or ignored `.env.local`.
- No fake production user was created.
- Previous logged-in regular-user browser/mobile QA remains documented in `docs/LOGGED_IN_BROWSER_QA.md`.

Production data touched:

- admin session records and audit entries from admin login/export/sports status checks, created by existing app behavior
- no predictions created or edited
- no payments confirmed, rejected, or changed
- no payouts/refunds approved, marked paid, or changed
- no match results changed
- no fixture sync or result sync triggered
- no exchange-rate refresh triggered
- no export file written locally

## Sports API Readiness

Read-only authenticated sports checks were run through existing admin-only status endpoints. No fixture sync, result sync, or exchange-rate refresh was triggered.

Result:

- sports provider configured: yes
- API-Football configured: yes
- football-data.org configured: yes
- active provider: `football-data`
- provider status: `SYNCED`
- World Cup 2026 sanity check: passed
- fixtures pulled: 104
- upcoming fixtures in verification sample: 3
- completed fixtures: 82
- warnings: none
- sync status provider: `football-data`
- sync status message: `Synced 104 matches from football-data.`

Operational notes:

- API keys are configured through environment variables.
- UI must continue calling internal app endpoints only.
- No fake results are used.
- Result sync should remain admin-triggered and focus on recent completed fixtures where practical.
- Sports sync was not triggered during this pass because it can mutate production match/result data.
- Regular users should see friendly pending-result messaging, not raw provider diagnostics.
- Admin diagnostics remain admin-only.

## Export And Backup Readiness

Access checks:

- anonymous export remains denied with HTTP 403
- regular-user export was not rerun in this pass because no regular-user credential pair was available
- previous regular-user export denial remains documented in `docs/CREDENTIALED_PRODUCTION_SMOKE.md` and `docs/LOGGED_IN_BROWSER_QA.md`
- authenticated admin export passed with HTTP 200

Backup handling rules:

- never commit export files
- never upload export files into the repo
- inspect exports in memory when possible
- if a file must be created, store it outside Git tracking, delete it after inspection, or report the untracked path
- treat exports as private pool data because they include users, predictions, payments, payouts, and audit logs

Admin should export backups:

- before tournament starts
- before each matchday
- after each matchday settlement
- before manual payout/refund updates
- after manual payout/refund updates
- after final tournament settlement
- before any high-risk admin operation

## Before Each Match

Admin checklist:

- confirm fixture and kickoff time
- confirm the 15-minute user prediction lock time
- confirm the 5-minute admin emergency correction lock time
- confirm participants who submitted predictions
- confirm manual payment status
- identify missing predictions
- identify unpaid or pending participants
- export backup before high-risk operations
- do not edit predictions after lock windows
- keep sports provider diagnostics under admin Tools

## During Prediction Window

Operational flow:

- users may submit or edit predictions until 15 minutes before kickoff
- users can see all predictions
- users can edit only their own prediction
- admin should monitor missing predictions
- admin should monitor pending payments
- admin should use WhatsApp reminders if needed
- do not confirm payments without manual review
- do not expose phone numbers outside admin workflows

## After Match Result Is Final

Settlement checklist:

- confirm or sync the official result
- verify the match is final/completed before settlement
- verify exact-score winners
- calculate the match base pot
- split the base match pot among exact-score winner(s)
- if no exact-score winner exists, create manual refund records for verified match participants
- verify refunds include only the base match contribution
- verify the USD exchange-rate bonus is not included in match payouts or refunds
- review payout/refund records before marking anything paid/refunded
- export backup after settlement review

Important boundary:

- match winners receive only the match base pot
- no-exact-score refunds include only the base match contribution
- the USD exchange-rate bonus remains separate until final tournament settlement

## Manual Payment Confirmation

Rules:

- admin verifies payment manually
- COP entry contributes 2,000 COP base value
- USD entry contributes 2,000 COP base value
- USD exchange excess is locked separately when payment is verified
- app does not process payments
- app does not collect cards
- app does not move money
- app records admin payment status only

Admin checklist:

- confirm the participant identity
- review the user's payment comment if present
- confirm the currency
- for COP, keep base contribution at 2,000 COP and exchange bonus at 0 COP
- for USD, confirm actual COP received or the locked valid USD/COP value
- verify only after manual confirmation outside the app
- reject or keep pending if payment cannot be confirmed

## Manual Payout/Refund Handling

Rules:

- app creates or calculates manual ledger records
- admin sends money outside the app
- admin marks payouts/refunds manually
- no automatic payouts
- no automatic refunds
- no money movement through the app
- export backup before and after marking paid/refunded

Admin checklist:

- review calculated payout/refund records
- confirm the source: match winner, no-exact-score refund, final tournament bonus, or manual adjustment
- confirm amount is in whole COP pesos where applicable
- approve only after review
- send money outside the app
- mark paid/refunded manually only after the external payment is complete
- do not store bank or card details in the app

## Final Tournament Settlement

Rules:

- tournament winner is the user with the most exact-score points
- tied tournament winners split USD exchange-rate bonus deterministically in whole COP pesos
- USD exchange-rate bonus goes only to final tournament winner(s)
- USD exchange bonus must not go to match winners
- export final backup

Admin checklist:

- confirm all tournament matches are final
- confirm all scoring is complete
- review standings and exact-score totals
- verify the USD exchange-rate bonus pot
- calculate final tournament bonus
- review tied-winner split if applicable
- export backup before approval
- send final bonus money outside the app
- mark final payout manually after external payment is complete
- export final backup after settlement

## Operational Safety Rules

- never commit exports
- never expose phone numbers outside admin workflows
- never share admin PIN
- rotate admin PIN if exposed
- keep `.env.local` ignored
- keep Supabase service-role key backend-only
- keep sports API keys backend-only
- do not trigger fixture/result sync unless admin intends to update production data
- do not refresh USD/COP rate during a read-only smoke because the endpoint records an audit entry
- do not mutate predictions, payments, payouts/refunds, or match results during smoke tests
- keep admin diagnostics and exports admin-only

## Recommendation

Ready with warnings for launch operations.

Completed:

- anonymous production readiness smoke after the access-control merge
- admin production smoke
- authenticated admin export backup smoke
- Supabase/storage confirmation through admin state
- read-only sports API readiness confirmation
- manual operations runbook for matchday, payments, payouts/refunds, final tournament settlement, and backups

Remaining warnings:

- regular-user smoke was not rerun in this pass because no approved regular-user credential pair was available under expected non-logging env names
- production exports contain private pool data and must be handled only through secure admin workflows
- sports sync and exchange-rate refresh were not triggered during this pass because they can mutate production state
- rerun logged-in regular-user browser/mobile QA if production match or prediction data changes materially before launch
- local runner may still use a Node version different from the project engine `22.x`
