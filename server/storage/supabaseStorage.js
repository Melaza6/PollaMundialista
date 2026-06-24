import { safeJsonParse } from "../../lib/safeJson.js";

const SNAPSHOT_KEY = "app_db_snapshot";

function requiredEnv(env, key) {
  const value = String(env[key] || "").trim();
  if (!value) throw new Error(`Missing ${key} for Supabase storage.`);
  return value;
}

function createClient(env = process.env) {
  const rawUrl = requiredEnv(env, "SUPABASE_URL").replace(/\/+$/, "");
  const restUrl = rawUrl.endsWith("/rest/v1") ? rawUrl : `${rawUrl}/rest/v1`;
  requiredEnv(env, "SUPABASE_ANON_KEY");
  const serviceKey = requiredEnv(env, "SUPABASE_SERVICE_ROLE_KEY");
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
  return { restUrl, headers };
}

async function request(client, path, options = {}) {
  const response = await fetch(`${client.restUrl}/${path}`,
  {
    ...options,
    headers: { ...client.headers, ...(options.headers || {}) },
  });
  const text = await response.text().catch(() => "");
  if (!response.ok) {
    throw new Error(`Supabase request failed (${response.status}): ${text || response.statusText}`);
  }
  if (response.status === 204 || !text.trim()) return null;
  const parsed = safeJsonParse(text);
  if (!parsed.ok) throw new Error(`Supabase returned invalid JSON: ${parsed.error.message}`);
  return parsed.value;
}

async function upsertRows(client, table, rows, conflict = "id") {
  if (!rows.length) return [];
  return request(client, `${table}?on_conflict=${encodeURIComponent(conflict)}`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  });
}

function dateOnly(value) {
  return value ? String(value).slice(0, 10) : null;
}

function mapUser(user) {
  return {
    id: user.id,
    name: user.name || "Unknown",
    normalized_name: user.normalizedName || "",
    phone: user.phone || "",
    normalized_phone: user.normalizedPhone || user.id,
    role: user.role || "USER",
    language: user.language || "es",
    created_at: user.createdAt || new Date().toISOString(),
    updated_at: user.updatedAt || user.createdAt || new Date().toISOString(),
    last_login_at: user.lastLoginAt || null,
  };
}

function mapMatch(match) {
  return {
    id: match.id,
    external_id: match.externalId || match.apiId || match.id,
    provider: match.resultSync?.source || match.provider || null,
    home_team: match.homeTeam || "TBD",
    away_team: match.awayTeam || "TBD",
    kickoff_at: match.kickoffAt,
    stage: match.stage || "",
    group_name: match.group || "",
    status: match.status || "SCHEDULED",
    home_score: match.result?.homeScore ?? match.apiResult?.homeScore ?? null,
    away_score: match.result?.awayScore ?? match.apiResult?.awayScore ?? null,
    result_source: match.result?.source || match.resultSync?.source || null,
    result_synced_at: match.result?.syncedAt || match.resultSync?.lastSyncedAt || null,
    raw: match,
    updated_at: match.updatedAt || new Date().toISOString(),
  };
}

function mapPrediction(prediction) {
  return {
    id: prediction.id,
    user_id: prediction.userId,
    match_id: prediction.matchId,
    predicted_home_score: prediction.homeScore,
    predicted_away_score: prediction.awayScore,
    submitted_at: prediction.createdAt || prediction.updatedAt || new Date().toISOString(),
    updated_at: prediction.updatedAt || prediction.createdAt || new Date().toISOString(),
    submitted_before_lock: prediction.submittedBeforeLock ?? true,
    points: prediction.points ?? 0,
    exact_score: prediction.exactScore ?? false,
    correct_winner: prediction.correctWinner ?? false,
    raw: prediction,
  };
}

function mapPayment(payment) {
  return {
    id: payment.id,
    user_id: payment.userId,
    match_id: payment.matchId || null,
    prediction_id: payment.predictionId || null,
    currency: payment.currency === "USD" ? "USD" : "COP",
    amount: payment.amountMinor || (payment.currency === "USD" ? 1 : 2000),
    status: payment.verificationStatus || payment.paidStatus || "PENDING",
    user_comment: payment.userComment || "",
    admin_notes: payment.adminNotes || payment.notes || "",
    base_pot_contribution_cop: payment.basePotContributionCop ?? payment.baseContributionCop ?? 0,
    exchange_rate_source: payment.exchangeRateSource || null,
    exchange_rate_date: dateOnly(payment.exchangeRateDate),
    exchange_rate_usd_cop: payment.exchangeRateUsdCop ?? null,
    actual_cop_received: payment.actualCopReceived ?? payment.copEquivalent ?? null,
    exchange_excess: payment.exchangeExcess ?? payment.excessContributionCop ?? 0,
    rate_locked_at: payment.rateLockedAt || null,
    verified_by: payment.verifiedBy || null,
    verified_at: payment.verifiedAt || null,
    rejected_by: payment.rejectedBy || null,
    rejected_at: payment.rejectedAt || null,
    raw: payment,
    created_at: payment.createdAt || payment.paidAt || new Date().toISOString(),
    updated_at: payment.updatedAt || payment.verifiedAt || payment.paidAt || new Date().toISOString(),
  };
}

function mapAuditLog(log) {
  return {
    id: log.id,
    actor_user_id: log.actorUserId || null,
    actor_role: log.actorRole || null,
    action: log.action || log.type || "UNKNOWN",
    entity_type: log.entityType || "legacy",
    entity_id: log.entityId || null,
    old_value: log.oldValue || null,
    new_value: log.newValue || null,
    reason: log.reason || log.text || "",
    created_at: log.createdAt || log.at || new Date().toISOString(),
  };
}

function mapCorrection(correction) {
  return {
    id: correction.id,
    prediction_id: correction.predictionId,
    match_id: correction.matchId,
    user_id: correction.userId,
    corrected_by_admin_id: correction.correctedByAdminId || null,
    previous_home_score: correction.previousHomeScore ?? null,
    previous_away_score: correction.previousAwayScore ?? null,
    new_home_score: correction.newHomeScore,
    new_away_score: correction.newAwayScore,
    reason: correction.reason,
    corrected_at: correction.correctedAt || new Date().toISOString(),
  };
}

function mapPayout(payout) {
  return {
    id: payout.id,
    user_id: payout.userId,
    prize_type: payout.prizeType,
    amount_cop: payout.amountCop || 0,
    amount_usd: payout.amountUsd || 0,
    source: payout.source || null,
    status: payout.status || "calculated",
    admin_notes: payout.adminNotes || "",
    calculated_at: payout.calculatedAt || new Date().toISOString(),
    approved_by: payout.approvedBy || null,
    approved_at: payout.approvedAt || null,
    paid_by: payout.paidBy || null,
    paid_at: payout.paidAt || null,
  };
}

function mapExchangeRate(rate) {
  if (!rate) return null;
  return {
    id: rate.id || `usd_cop_${rate.cacheDate || dateOnly(rate.fetchedAt) || "latest"}`,
    pair: "USD_COP",
    rate: rate.rate ?? null,
    source: rate.source || "unknown",
    rate_date: dateOnly(rate.date || rate.fetchedAt),
    fetched_at: rate.fetchedAt || new Date().toISOString(),
    is_valid: Boolean(rate.rate && rate.status !== "INVALID" && rate.status !== "UNAVAILABLE"),
    raw_value: rate.invalidRejected?.rawValue ? String(rate.invalidRejected.rawValue) : null,
    rejected_reason: rate.invalidRejected ? "Invalid USD/COP rate rejected" : null,
    raw: rate,
  };
}

async function persistRelationalTables(client, db) {
  const users = (db.users || []).map(mapUser);
  const matches = (db.matches || []).map(mapMatch);
  const predictions = (db.predictions || []).map(mapPrediction);
  const payments = (db.payments || []).map(mapPayment).filter((payment) => users.some((user) => user.id === payment.user_id));
  const auditLogs = (db.auditLogs || []).map(mapAuditLog);
  const corrections = (db.predictionCorrections || []).map(mapCorrection);
  const payouts = (db.payouts || []).map(mapPayout);
  const exchangeRate = mapExchangeRate(db.exchangeRate);

  await upsertRows(client, "users", users, "id");
  await upsertRows(client, "matches", matches, "id");
  await upsertRows(client, "predictions", predictions, "id");
  await upsertRows(client, "payments", payments, "id");
  if (exchangeRate) await upsertRows(client, "exchange_rates", [exchangeRate], "id");
  await upsertRows(client, "audit_logs", auditLogs, "id");
  await upsertRows(client, "prediction_corrections", corrections, "id");
  await upsertRows(client, "payouts", payouts, "id");
}

export function assertSupabaseConfig(env = process.env) {
  createClient(env);
  return true;
}

export function createSupabaseStorage({ env = process.env, seedDb, migrateDb }) {
  const client = createClient(env);

  async function readSnapshot() {
    const rows = await request(client, `app_settings?key=eq.${encodeURIComponent(SNAPSHOT_KEY)}&select=value&limit=1`);
    return rows?.[0]?.value || null;
  }

  async function writeSnapshot(db) {
    await persistRelationalTables(client, db);
    await request(client, "app_settings?on_conflict=key", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        key: SNAPSHOT_KEY,
        value: db,
        updated_at: new Date().toISOString(),
      }),
    });
  }

  async function readDb() {
    const snapshot = await readSnapshot();
    if (!snapshot) {
      const seeded = seedDb();
      await writeSnapshot(seeded);
      return seeded;
    }
    const migrated = migrateDb(snapshot);
    if (migrated.changed) await writeSnapshot(migrated.db);
    return migrated.db;
  }

  async function writeDb(db) {
    await writeSnapshot(db);
  }

  async function checkConnection() {
    const tables = [
      "users",
      "matches",
      "predictions",
      "payments",
      "exchange_rates",
      "audit_logs",
      "prediction_corrections",
      "payouts",
      "app_settings",
      "sync_logs",
      "exports",
    ];
    for (const table of tables) {
      await request(client, `${table}?select=*&limit=1`);
    }
    return { ok: true, tables };
  }

  return {
    driver: "supabase",
    label: "Supabase",
    readDb,
    writeDb,
    checkConnection,
  };
}


