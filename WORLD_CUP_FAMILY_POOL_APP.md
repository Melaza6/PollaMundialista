# Polla Mundialista 2026

Production domain / Dominio de produccion: `https://polla.melazausa.com`

Workspace / Carpeta de trabajo: `C:\Users\Owner\Documents\Melaza Ecosystem\Polla mundial`

## Ecosystem Position

Polla Mundialista is a standalone Melaza ecosystem product app managed through Melaza Network.

- MLP / Melaza Landing Page: public marketing website, ecosystem app, public showcase.
- MN / Melaza Network: internal operations/admin platform, ecosystem app, private or sanitized showcase only.
- Polla Mundialista: standalone product app, ecosystem app, public showcase, managed through MN.

Polla Mundialista sits alongside MLP and MN at the ecosystem level. Melaza Network manages and tracks Polla Mundialista as an app record, but Polla Mundialista is not structurally part of MN.

## Product Summary

Polla Mundialista 2026 is a bilingual Spanish/English family World Cup prediction pool app.

Regular users register or log in with:

- full name
- phone number

No email login, Google login, or Gmail login is used.

Users submit exact-score predictions for World Cup matches, choose a participation currency, add an optional payment comment, view everyone's submitted predictions, and follow the standings.

Admin manually confirms payment status, syncs provider-backed match results, reviews payouts/refunds, exports backups, and keeps audit records for sensitive actions.

## Manual Money-Movement Boundary

The app records manual payment, payout, and refund status only.

- The app does not process payments.
- The app does not move money.
- The app does not send automatic payouts.
- Admin manually confirms payments.
- Admin manually marks payouts/refunds.
- Payment and payout records are admin-tracked ledger/status records.

Preferred wording:

- manual payment confirmation
- manual payout tracking
- manual refund tracking
- admin-recorded payment status
- admin-recorded payout/refund status

## Participation Amounts

Fixed participation amounts:

- COP: 2,000 COP
- USD: 1 USD

Every verified participation contributes exactly 2,000 COP to the base match pot.

## Prediction Rules

Only exact-score predictions earn points.

| Prediction / Prediccion | Points / Puntos |
| --- | ---: |
| Exact score / Marcador exacto | 1 |
| Correct winner only / Ganador correcto solamente | 0 |
| Incorrect result / Resultado incorrecto | 0 |

Users can create or update only their own prediction.

Prediction locks:

- User prediction lock: 15 minutes before kickoff.
- Admin emergency correction lock: 5 minutes before kickoff.
- Admin emergency corrections require a reason and audit log.
- After the admin lock, nobody can change predictions.

Prediction ownership uses `userId`, not user name.

## Pot and Bonus Rules

Core rules:

- COP participation contributes 2,000 COP to the base match pot.
- COP participation creates 0 exchange-rate bonus.
- USD participation contributes 2,000 COP to the base match pot.
- USD exchange-rate excess may create a separate exchange-rate bonus.
- The exchange-rate bonus is never mixed into base match pots.
- Match winners receive only the base match pot for that match.
- If no exact-score winner exists for a final match, verified participants get manual refund ledger records for that match's base-pot contribution.
- The final tournament bonus goes to the user or users with the most exact-score points at the end of the tournament.
- Tied final tournament bonus recipients split whole COP pesos deterministically.

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

## Exchange-Rate Rules

The USD/COP rate shown to users is an estimate.

Admin confirms the actual COP received for USD participation and the rate/value is locked when admin verifies the payment.

Verified USD payment values do not recalculate when the live rate changes.

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

The app must reject impossible values such as:

```txt
342,595 COP
342595
```

## Core Screens

### Regular User

Spanish navigation:

```txt
Inicio
Partidos
Predicciones
Tabla
Reglas
```

English navigation:

```txt
Home
Matches
Predictions
Standings
Rules
```

Regular users should quickly answer:

- What match is next?
- Did I predict?
- Did I pay?
- What did everyone predict?
- Where am I in the standings?
- What are the rules?

Regular users should not see:

- API diagnostics
- storage mode
- audit logs
- export tools
- admin payout tools
- raw sync errors
- Supabase/JSON warnings

### Admin

Spanish admin tabs:

```txt
Dia de partido
Predicciones
Pagos
Resultados
Premios
Reglas
Herramientas
```

English admin tabs:

```txt
Match Day
Predictions
Payments
Results
Prizes
Rules
Tools
```

Admin should quickly answer:

- Who has not predicted?
- Who has not paid?
- What games are next?
- What results just came in?
- Who won the last prediction?
- What WhatsApp message should I send?
- Can I export a backup?

Advanced diagnostics and export tools belong under Tools/Herramientas.

## Sports Data

World Cup match data is provider-backed.

Supported providers:

- API-Football
- football-data.org fallback

Rules:

- `FOOTBALL_API_PROVIDER=auto` should continue working.
- API keys come from environment variables.
- UI calls internal app endpoints only.
- User dashboard shows the next 4 upcoming matches.
- Result sync focuses on the last 3 completed fixtures where practical.
- The app does not fake real results.
- Provider errors are admin-visible and user-safe.

## Storage

Production should use Supabase.

Local development may use JSON fallback.

Storage modes:

```env
DATA_STORAGE_DRIVER=supabase
DATA_STORAGE_DRIVER=json
```

Rules:

- `SUPABASE_SERVICE_ROLE_KEY` is backend-only.
- Browser code must not receive the service-role key.
- `.env` must never be committed.
- `.env.example` must contain placeholders only.
- If production uses JSON storage, show a warning.
- If Supabase mode is selected and env vars are missing, fail clearly or return safe JSON errors.

## Audit Logs

Audit logs are required for sensitive actions:

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

## WhatsApp Messages

The app may prepare WhatsApp copy for admin to share manually.

Messages should reinforce:

- exact-score prediction deadline
- manual payment confirmation
- manual payout/refund tracking
- base match pot and exchange-rate bonus separation
- final result and standings updates

The app should not automate group-message delivery unless a future compliance review explicitly approves it.

## Acceptance Criteria

The app is ready for real family use when:

- users can log in with name + phone
- no email/Google/Gmail login appears
- users can see next 4 matches
- users can submit one exact-score prediction per match
- users can edit only their own prediction before lock
- users can view everyone's submitted predictions
- admin can manually confirm payment status
- admin can manually mark payout/refund status
- base match pot and exchange-rate bonus remain separate
- provider-backed results sync safely
- anonymous and regular-user state remain public-safe
- admin-only routes remain server-side protected
- production storage is safely confirmed
- admin export backup is smoke-tested
- real mobile/browser QA passes at 375px, 768px, and 1280px
- production `ADMIN_PIN` is rotated after any chat exposure
