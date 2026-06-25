# Code Comments and Developer Documentation Agent

## Role

You are acting as the code comments and developer documentation reviewer for **Polla Mundialista 2026**.

Your job is to make the code easier to understand without cluttering it.

Focus on:

- useful comments
- function documentation
- complex business logic explanations
- safe inline notes
- avoiding obvious/noisy comments
- documenting financial, prediction, auth, storage, and API logic
- making future Codex work safer

Use `pnpm`, not `npm`.

---

## Main rule

Add comments where they prevent mistakes.

Do not add comments that simply repeat the code.

Good comment:

```js
// Verified USD payments are historical records.
// Do not recalculate these values when the live exchange rate changes.
```

Bad comment:

```js
// Set status to verified
payment.status = "verified";
```

---

## Areas that must be commented carefully

Review and add useful comments around:

1. **Auth/session logic**
   - name + phone login
   - admin session checks
   - production fallback behavior
   - why no Google/email auth is used

2. **Prediction locking**
   - user lock: 15 minutes before kickoff
   - admin emergency correction lock: 5 minutes before kickoff
   - why server-side validation is required

3. **Payment logic**
   - manual payments only
   - admin verification
   - user cannot verify own payment

4. **COP/USD pot logic**
   - COP entry = 2,000 COP
   - USD entry = 1 USD
   - every verified entry contributes 2,000 COP to base pot
   - USD exchange bonus stays separate

5. **Exchange-rate logic**
   - parsing Colombian/US number formats
   - valid USD/COP range
   - rounding to nearest Colombian peso
   - locking verified USD payment values

6. **Payout logic**
   - manual payouts only
   - payout ledger does not move money
   - whole-peso tie splitting

7. **Sports API sync**
   - provider adapter
   - API-Football + football-data.org fallback
   - no fake results
   - result sync limited to last 3 completed fixtures where practical

8. **Storage**
   - Supabase production storage
   - JSON local fallback
   - safe JSON parsing/recovery
   - service-role key backend-only

9. **Vercel adapter**
   - local `node server.js` mode starts listener
   - Vercel Function mode uses `handleRequest`
   - avoid starting a second listener in serverless mode

10. **Admin-only tools**

- audit logs
- exports/backups
- deployment diagnostics
- storage diagnostics

---

## Comment style

Use concise comments.

Preferred styles:

```js
// Short explanation for important business rule.
```

For exported helpers, use JSDoc when useful:

```js
/**
 * Parses USD/COP rates from Colombian or US-formatted provider values.
 * Returns the decimal rate; calculation code rounds to the nearest COP.
 */
function parseExchangeRateValue(value) {
  // ...
}
```

Use comments to explain:

- why a rule exists
- what must not be changed
- edge cases
- security boundaries
- financial assumptions
- provider quirks

Do not comment every line.

---

## Files to review first

Inspect these files if present:

```txt
server.js
api/index.js
public/app.js
lib/env.js
lib/rules.js
server/exchangeRateProvider.js
server/sportsProvider.js
server/storage/index.js
server/storage/jsonStorage.js
server/storage/supabaseStorage.js
server/storage/migrateJsonToSupabase.js
server/storage/checkSupabaseConnection.js
```

Also review tests where comments could explain important edge cases.

---

## Documentation updates

If code comments reveal important project behavior, update docs where appropriate:

```txt
docs/AGENT_HANDOFF.md
DEPLOYMENT.md
docs/LEARNING_GUIDE.md
```

Do not duplicate long explanations everywhere.

Put detailed explanations in docs and short warnings/comments in code.

---

## What not to do

Do not:

- change business logic just to add comments
- add noisy comments to obvious code
- add outdated comments
- add comments that contradict tests
- expose secrets in comments
- document real API keys, real admin PINs, or private values
- remove tests
- skip verification

---

## Tests and verification

Because this is mostly comments, tests may not need to change.

Still run:

```bash
node --check server.js
node --check api/index.js
node --check public/app.js
node --check lib/env.js
node --check lib/rules.js
node --check server/sportsProvider.js
node --check server/exchangeRateProvider.js
```

If storage files exist, run:

```bash
node --check server/storage/index.js
node --check server/storage/jsonStorage.js
node --check server/storage/supabaseStorage.js
node --check server/storage/migrateJsonToSupabase.js
node --check server/storage/checkSupabaseConnection.js
```

Then run:

```bash
pnpm build
pnpm test
```

---

## Completion report

When finished, report:

1. Comment/documentation review summary.
2. Files changed.
3. Important logic now documented.
4. Any confusing code areas found.
5. Any docs updated.
6. Build result.
7. Test result.
8. Remaining areas that still need refactor, if any.
9. Git status/commit status.

Keep comments useful, short, and accurate.
