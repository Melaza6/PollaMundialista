# Logged-In Browser QA - Polla Mundialista 2026

Date: 2026-07-03  
Branch: `qa/logged-in-mobile-browser-qa`  
Workspace: `C:\Users\Owner\Documents\Melaza Ecosystem\Polla mundial`  
Production URL: `https://polla.melazausa.com`

## Credential Handling

Logged-in regular-user QA used the approved regular test user loaded from ignored `.env.local`.

- Credential values were not printed.
- Phone number was not documented.
- Credentials were not written to screenshots, reports, commits, or command output.
- `.env.local` was confirmed ignored by Git before use.

Credential source: approved regular test-user entries in ignored `.env.local`; key names and values are intentionally omitted from this report.

## Viewports Tested

- 375x812
- 768x1024
- 1280x900

No screenshots were created.

## Regular-User Login Result

Passed.

- Existing-user login route returned HTTP 200.
- Authenticated role was `USER`.
- Login used full name + phone.
- No email login appeared.
- No Google/Gmail login appeared.

## Mobile/Browser QA Result

Passed across all tested viewports.

- Matches loaded.
- Next matches loaded: 4.
- Prediction form was usable.
- New editable prediction form defaulted to `0-0`.
- Predictions list loaded.
- Public-safe predictions were visible.
- Standings/leaderboard loaded.
- Current-user payment/refund/payout status loaded when applicable.
- Admin tools were hidden.
- Admin diagnostics were hidden.
- No horizontal overflow was detected.
- Tap targets were usable: measured visible input/button/navigation heights were at least 47px on the tested surfaces.
- Mobile/user navigation was usable.
- Cards, forms, buttons, and standings surfaces were readable.

Current production data did not expose a saved editable next-match prediction form for this test user, so saved-score form prefill was not applicable on the current next-match screen. The user's existing saved prediction rows were visible in the predictions list.

Current next-match cards did not render a settlement summary because no visible next-match settlement had a paid count. The Rules surface displayed the match pot, manual refund, USD excess, and prize payout explanation.

## `/api/state` Regular-User Scoping Result

Passed.

Authenticated regular-user `/api/state` returned:

- matches: 109
- next matches: 4
- public-safe predictions: 35
- standings rows: 5
- current-user payment rows: 7
- current-user payout/refund rows: 7

The response did not expose:

- phone or normalized-phone keys
- the test user's phone value
- other users' payment records
- other users' payout/refund records
- audit logs
- admin prediction rows
- diagnostics/storage/provider internals
- admin config
- env-like secret names

Safe admin-only endpoint checks:

- regular-user `GET /api/admin/export/backup`: HTTP 403
- regular-user `GET /api/admin/sports/verify`: HTTP 403
- regular-user `GET /api/admin/matches`: HTTP 403

No brute-force or stress testing was performed.

## Language And Team-Name Checks

Passed across all tested viewports.

- Spanish/English language toggle worked.
- Spanish mode translated mapped team names.
- English mode kept provider names.

## Production Data Touched

The QA avoided business-data mutations.

Existing app behavior records regular-user access, so production may include session/login audit records from the API and browser login checks.

The QA did not:

- create a new user
- create or edit predictions
- create payment records
- confirm, reject, or change payments
- approve, mark paid, or change payouts/refunds
- change match results
- trigger fixture sync or result sync
- create export files

## Screenshots, Exports, And Temp Files

- Screenshots created: none.
- Export files created: none.
- Temporary helper: `tmp/logged-in-browser-qa.mjs`, deleted after use.

## Local Verification

- `pnpm.cmd install --frozen-lockfile`: initial run stopped on pnpm's no-TTY module purge prompt; rerun with `CI=true` and the same pnpm invocation passed.
- `pnpm.cmd build`: passed, 54/54 tests in the build flow.
- `pnpm.cmd test`: initial sandbox run failed only with `spawn EPERM` in the child-process storage-error test; escalated rerun passed, 54/54 tests.
- `VERCEL=1 NODE_ENV=production pnpm.cmd test`: initial sandbox run hit restricted-network package fetches after dependency restore; escalated rerun passed, 54/54 tests.
- `VERCEL` and `NODE_ENV` were cleared after the production-mode test command.

Local warning remains: current Node is `v24.14.0`; project engines require Node `22.x`.

## Remaining Risks

- Saved-score form prefill was not applicable for the current next-match screen because this regular test user had no saved editable next-match prediction form available during the smoke.
- Per-card settlement summary was not visible on current next-match cards because no visible next-match settlement had a paid count; the Rules explanation was visible and readable.
- Production exports contain private pool data and remain admin-only.

## Recommendation

The logged-in regular-user browser/mobile QA gap is complete for the tested production state.

Proceed as ready with warnings: keep credentials out of docs/logs, continue to avoid committing local env files or screenshots, and rerun this QA if fresh production data changes the next-match/prediction-form state before launch.

## Launch Operations Readiness Follow-Up - 2026-07-05

Branch: `ops/launch-operations-readiness`
Runbook: `docs/LAUNCH_OPERATIONS_READINESS.md`

The launch operations pass did not rerun logged-in regular-user browser/mobile QA because no approved regular-user full-name plus phone credential pair was available under expected non-logging env names.

The 2026-07-03 logged-in browser/mobile QA remains the latest regular-user browser evidence. Rerun this QA if production match or prediction data changes materially before launch.
