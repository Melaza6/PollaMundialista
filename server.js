import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_USD_COP_RECEIVED,
  ENTRY_COP,
  ENTRY_USD_CENTS,
  calculateMatchSettlement,
  calculatePaymentMoney,
  calculatePayoutLedger,
  calculatePrizeSummary,
  calculateStandings,
  calculateTournamentBonus,
  canUseAdminAction,
  generateWinnerMessage,
  getNextMatches,
  isAdminCorrectionLocked,
  isPredictionLocked,
  scorePrediction,
} from "./lib/rules.js";
import {
  createSession,
  findIdentityMatches,
  findSessionUser,
  normalizeName,
  normalizePhone,
  publicUser,
  validateRegistrationInput,
} from "./lib/auth.js";
import { loadEnvFile } from "./lib/env.js";
import { safeJsonParse } from "./lib/safeJson.js";
import { createSportsProvider } from "./server/sportsProvider.js";
import { getUsdCopRate, isValidUsdCopRate } from "./server/exchangeRateProvider.js";
import { createStorage } from "./server/storage/index.js";

loadEnvFile();

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "public");
const dataDir = join(__dirname, "data");
const dbPath = join(dataDir, "db.json");
const port = Number(process.env.PORT || 3000);
const publicBaseUrl = process.env.PUBLIC_BASE_URL || "https://polla.melazausa.com";
const adminPin = process.env.ADMIN_PIN || "2026";
const sessionSecret = process.env.SESSION_SECRET || "dev-session-secret-change-me";
const sportsProvider = createSportsProvider(process.env);
const appStorage = createStorage({ env: process.env, dbPath, seedDb, migrateDb });
for (const warning of appStorage.startupWarnings || []) console.warn(warning);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

async function readDb() {
  return appStorage.readDb();
}

async function writeDb(db) {
  return appStorage.writeDb(db);
}

function seedDb() {
  const now = new Date().toISOString();
  return {
    version: 2,
    settings: {
      appName: "Polla Mundialista 2026",
      language: "es",
      expectedEntryCop: ENTRY_COP,
      usdEntryCents: ENTRY_USD_CENTS,
      defaultUsdCopReceived: DEFAULT_USD_COP_RECEIVED,
      exchangeRateNotes: "Each paid entry contributes 2,000 COP to the base pot. USD excess is reserved for the end-of-World-Cup bonus.",
      publicBaseUrl,
      resultsProvider: "mock-results-api",
      footballApiProvider: sportsProvider.providerName,
      authProviders: ["Name + phone server session"],
      authNotes: "Family-pool MVP uses server-side sessions with name and phone login.",
      paymentProviders: ["Manual"],
      dataStorageDriver: process.env.DATA_STORAGE_DRIVER || "json",
    },
    users: [
      {
        id: "admin_1",
        role: "ADMIN",
        name: "Administrador",
        normalizedName: normalizeName("Administrador"),
        phone: "",
        normalizedPhone: "",
        email: "",
        normalizedEmail: "",
        paidStatus: "NOT_REQUIRED",
        language: "es",
        createdAt: now,
        updatedAt: now,
        lastLoginAt: null,
      },
    ],
    matches: seedMatches(),
    predictions: [],
    payments: [],
    sessions: [],
    sportsSync: sportsProvider.getLastSyncStatus(),
    exchangeRate: null,
    predictionCorrections: [],
    payouts: [],
    auditLogs: [],
    audit: [{ at: now, type: "APP_CREATED", text: "Seed database created" }],
  };
}

function seedMatches() {
  return [
    createMatch("match_001", "Mexico", "South Africa", "2026-06-13T19:00:00.000Z", "Mexico City Stadium", {
      homeScore: 2,
      awayScore: 0,
    }),
    createMatch("match_002", "Colombia", "Denmark", "2026-06-14T19:00:00.000Z", "Miami Stadium"),
    createMatch("match_003", "Brazil", "Morocco", "2026-06-15T21:00:00.000Z", "Dallas Stadium"),
    createMatch("match_004", "Argentina", "Japan", "2026-06-16T18:00:00.000Z", "Atlanta Stadium"),
    createMatch("match_005", "United States", "Ghana", "2026-06-17T22:00:00.000Z", "Los Angeles Stadium"),
  ];
}

function createMatch(id, homeTeam, awayTeam, kickoffAt, venue, apiResult = null) {
  return {
    id,
    homeTeam,
    awayTeam,
    kickoffAt,
    venue,
    status: "SCHEDULED",
    apiResult,
    result: null,
    resultSync: {
      source: "not-configured",
      status: "PENDING",
      lastSyncedAt: null,
      message: "Pending sync",
    },
  };
}

function migrateDb(db) {
  if (db.version === 2) {
    let changed = false;
    const now = new Date().toISOString();
    if (!db.settings) {
      db.settings = seedDb().settings;
      changed = true;
    }
    if (!db.settings.footballApiProvider) {
      db.settings.footballApiProvider = sportsProvider.providerName;
      changed = true;
    }
    if (["mock", "mock-results-api"].includes(db.settings.footballApiProvider)) {
      db.settings.footballApiProvider = sportsProvider.providerName;
      changed = true;
    }
    if (["mock", "mock-results-api"].includes(db.settings.resultsProvider)) {
      db.settings.resultsProvider = sportsProvider.providerName;
      changed = true;
    }
    const authProviders = ["Name + phone server session"];
    if (JSON.stringify(db.settings.authProviders) !== JSON.stringify(authProviders)) {
      db.settings.authProviders = authProviders;
      changed = true;
    }
    const paymentProviders = ["Manual"];
    if (JSON.stringify(db.settings.paymentProviders) !== JSON.stringify(paymentProviders)) {
      db.settings.paymentProviders = paymentProviders;
      changed = true;
    }
    const authNotes = "Family-pool MVP uses server-side sessions with name and phone login.";
    if (db.settings.authNotes !== authNotes) {
      db.settings.authNotes = authNotes;
      changed = true;
    }
    const dataStorageDriver = process.env.DATA_STORAGE_DRIVER || db.settings.dataStorageDriver || "json";
    if (db.settings.dataStorageDriver !== dataStorageDriver) {
      db.settings.dataStorageDriver = dataStorageDriver;
      changed = true;
    }
    if (!db.sportsSync) {
      db.sportsSync = sportsProvider.getLastSyncStatus();
      changed = true;
    }
    if (!db.sessions) {
      db.sessions = [];
      changed = true;
    }
    db.users = (db.users || []).map((user) => {
      const normalized = {
        ...user,
        role: user.role === "ADMIN" ? "ADMIN" : "USER",
        normalizedName: user.normalizedName || normalizeName(user.name),
        normalizedPhone: user.normalizedPhone || normalizePhone(user.phone),
        normalizedEmail: user.normalizedEmail || "",
        paidStatus: user.paidStatus || "UNPAID",
        language: user.language === "en" ? "en" : "es",
        createdAt: user.createdAt || now,
        updatedAt: user.updatedAt || user.createdAt || now,
        lastLoginAt: user.lastLoginAt || null,
      };
      if (
        normalized.normalizedName !== user.normalizedName ||
        normalized.normalizedPhone !== user.normalizedPhone ||
        normalized.normalizedEmail !== user.normalizedEmail ||
        normalized.paidStatus !== user.paidStatus ||
        normalized.updatedAt !== user.updatedAt
      ) {
        changed = true;
      }
      return normalized;
    });
    db.payments = (db.payments || []).map((payment) => {
      const normalized = {
        ...payment,
        userComment: payment.userComment ?? payment.reference ?? "",
        adminNotes: payment.adminNotes ?? payment.notes ?? "",
        actualCopReceived: payment.actualCopReceived ?? payment.copEquivalent ?? null,
        exchangeExcess: payment.exchangeExcess ?? payment.excessContributionCop ?? 0,
        basePotContributionCop: payment.basePotContributionCop ?? payment.baseContributionCop ?? ENTRY_COP,
        baseContributionCop: payment.baseContributionCop ?? payment.basePotContributionCop ?? ENTRY_COP,
        excessContributionCop: payment.excessContributionCop ?? payment.exchangeExcess ?? 0,
      };
      if (normalized.userComment !== payment.userComment || normalized.adminNotes !== payment.adminNotes) changed = true;
      return normalized;
    });
    const matchesMissingSync = (db.matches || []).some(
      (match) => !match.resultSync || ["mock", "mock-results-api"].includes(match.resultSync.source),
    );
    db.matches = (db.matches || []).map((match) => ({
      ...match,
      resultSync:
        match.resultSync && !["mock", "mock-results-api"].includes(match.resultSync.source)
          ? match.resultSync
          : {
              source: db.settings.resultsProvider || "not-configured",
              status: "PENDING",
              lastSyncedAt: null,
              message: "Pending sync",
            },
    }));
    if (matchesMissingSync) changed = true;
    if (!db.audit) {
      db.audit = [];
      changed = true;
    }
    if (!db.predictionCorrections) {
      db.predictionCorrections = [];
      changed = true;
    }
    if (db.exchangeRate === undefined) {
      db.exchangeRate = null;
      changed = true;
    }
    if (db.exchangeRate?.rate && !isValidUsdCopRate(Number(db.exchangeRate.rate))) {
      db.exchangeRate = {
        ...db.exchangeRate,
        rate: null,
        status: "INVALID",
        invalidRejected: {
          rate: Number(db.exchangeRate.rate),
          source: db.exchangeRate.source || "cache",
          rejectedAt: now,
        },
        message: "Cached USD/COP rate was invalid and must be refreshed.",
      };
      changed = true;
    }
    if (!db.payouts) {
      db.payouts = [];
      changed = true;
    }
    if (!db.auditLogs) {
      db.auditLogs = [];
      changed = true;
    }
    return { db, changed };
  }

  const seeded = seedDb();
  const oldPool = db.pools?.[0];
  if (!oldPool) return { db: seeded, changed: true };

  const users = [...seeded.users];
  const predictions = [];
  const payments = [];

  for (const bet of oldPool.bets || []) {
    const existing = users.find((user) => user.name.toLowerCase() === bet.name.toLowerCase());
    const user =
      existing ||
      {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        role: "USER",
        name: bet.name,
        phone: "",
        email: "",
        createdAt: bet.createdAt || new Date().toISOString(),
      };
    if (!existing) users.push(user);

    const predictionId = bet.id.replace("bet_", "prediction_");
    predictions.push({
      id: predictionId,
      matchId: "match_001",
      userId: user.id,
      homeScore: bet.homeScorePick,
      awayScore: bet.awayScorePick,
      createdAt: bet.createdAt,
      updatedAt: bet.createdAt,
    });

    payments.push({
      id: bet.paymentId || `payment_${predictionId}`,
      predictionId,
      matchId: "match_001",
      userId: user.id,
      currency: bet.currency,
      amountMinor: bet.amountMinor,
      copEquivalent: bet.copEquivalent,
      baseContributionCop: bet.baseContributionCop,
      excessContributionCop: bet.excessContributionCop,
      method: bet.paymentMethod || "Manual",
      reference: "",
      userComment: bet.reference || "",
      adminNotes: "",
      notes: "Migrated from previous app data",
      paidStatus: bet.paymentStatus === "PAID" ? "PAID" : "UNPAID",
      verificationStatus: bet.paymentStatus === "PAID" ? "VERIFIED" : "PENDING",
      paidAt: bet.paidAt || null,
      verifiedAt: bet.paidAt || null,
      verifiedBy: bet.paymentStatus === "PAID" ? "admin_1" : null,
    });
  }

  return {
    db: {
      ...seeded,
      users,
      predictions,
      payments,
      sportsSync: sportsProvider.getLastSyncStatus(),
      audit: [...(seeded.audit || []), ...(oldPool.audit || [])],
    },
    changed: true,
  };
}

function sendJson(res, status, payload) {
  res.writeHead(status, { ...securityHeaders, "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, { ...securityHeaders, "Content-Type": contentType });
  res.end(text);
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows, columns) {
  return [
    columns.map((column) => csvCell(column.label)).join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column.key])).join(",")),
  ].join("\n");
}

function liveReadiness() {
  const checks = [
    {
      key: "PUBLIC_BASE_URL",
      ok: publicBaseUrl === "https://polla.melazausa.com",
      message: "PUBLIC_BASE_URL should be https://polla.melazausa.com for production.",
    },
    {
      key: "ADMIN_PIN",
      ok: adminPin !== "2026",
      message: "Set a private ADMIN_PIN before going live.",
    },
    {
      key: "SESSION_SECRET",
      ok: sessionSecret !== "dev-session-secret-change-me",
      message: "Set SESSION_SECRET before going live.",
    },
    {
      key: "SPORTS_API_KEY",
      ok: sportsProvider.configured,
      message: "Set API_FOOTBALL_KEY or FOOTBALL_DATA_API_KEY for real World Cup fixtures and results.",
    },
    {
      key: "SPORTS_PROVIDER",
      ok: sportsProvider.configured,
      message: "Primary provider is API-Football; football-data.org is used as fallback when configured.",
    },
  ];
  return {
    ready: checks.every((check) => check.ok),
    checks,
  };
}

function authError(code, language = "es") {
  const messages = {
    NAME_PHONE_REQUIRED: {
      es: "Nombre completo y telefono son obligatorios.",
      en: "Full name and phone are required.",
    },
    DUPLICATE_IDENTITY_CONFLICT: {
      es: "Estos datos coinciden con mas de una cuenta. Pide ayuda al administrador.",
      en: "These details match more than one account. Ask the admin for help.",
    },
    USER_NOT_FOUND: {
      es: "No encontramos esa cuenta. Registrate primero.",
      en: "We could not find that account. Register first.",
    },
    PHONE_NAME_CONFLICT: {
      es: "Ese telefono ya pertenece a otro nombre. Contacta al administrador.",
      en: "That phone already belongs to another name. Contact the admin.",
    },
    NAME_PHONE_CONFLICT: {
      es: "Ese nombre ya existe con otro telefono. Verifica el telefono o contacta al administrador.",
      en: "That name exists with another phone. Verify the phone or contact the admin.",
    },
  };
  return messages[code]?.[language] || messages[code]?.es || code;
}

function sessionTokenFromRequest(req) {
  const auth = String(req.headers.authorization || "");
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return String(req.headers["x-session-token"] || "").trim();
}

function startSession(db, user, role = user.role) {
  const now = new Date();
  const session = createSession({ userId: user.id, role, secret: sessionSecret, now });
  db.sessions.push(session.record);
  user.lastLoginAt = now.toISOString();
  user.updatedAt = now.toISOString();
  return session.token;
}

function findUserByLogin(db, body) {
  const phone = normalizePhone(body.phone || body.login);
  const name = normalizeName(body.name);
  return db.users.find(
    (user) =>
      user.role === "USER" &&
      name &&
      phone &&
      user.normalizedName === name &&
      user.normalizedPhone === phone,
  );
}

function mergeSyncStatus(previous, next) {
  const merged = { ...sportsProvider.getLastSyncStatus(previous) };
  for (const [key, value] of Object.entries(next || {})) {
    if (value !== null && value !== undefined) merged[key] = value;
  }
  return merged;
}

function paymentStatusValue(payment) {
  if (!payment) return "UNPAID";
  if (payment.verificationStatus === "VERIFIED") return "VERIFIED";
  if (payment.verificationStatus === "REJECTED") return "REJECTED";
  return payment.paidStatus === "PAID" ? "PENDING" : "UNPAID";
}

function currentValidUsdCopRate(db) {
  const rate = Number(db.exchangeRate?.rate);
  return isValidUsdCopRate(rate) ? rate : null;
}

function addAuditLog(db, { actor = null, action, entityType, entityId, oldValue = null, newValue = null, reason = "" }) {
  const entry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    actorUserId: actor?.id || null,
    actorRole: actor?.role || "SYSTEM",
    action,
    entityType,
    entityId,
    oldValue,
    newValue,
    reason,
    createdAt: new Date().toISOString(),
  };
  db.auditLogs ||= [];
  db.auditLogs.push(entry);
  db.audit ||= [];
  db.audit.push({ at: entry.createdAt, type: action, text: `${entityType}:${entityId}` });
  return entry;
}

function buildPayouts(db) {
  return calculatePayoutLedger(db.users, db.matches, db.predictions, db.payments, db.payouts || []);
}

function matchDaySummary(db) {
  const nextMatches = sportsProvider.getUpcomingMatches(db.matches, 4);
  const liveMatches = db.matches.filter((match) => match.status === "LIVE");
  const completed = db.matches
    .filter((match) => match.status === "FINISHED" || match.result?.status === "FINAL")
    .sort((a, b) => new Date(b.kickoffAt) - new Date(a.kickoffAt))
    .slice(0, 3);
  const users = db.users.filter((user) => user.role === "USER");
  const missingPredictions = nextMatches.map((match) => {
    const predicted = new Set(db.predictions.filter((prediction) => prediction.matchId === match.id).map((prediction) => prediction.userId));
    return {
      matchId: match.id,
      matchName: `${match.homeTeam} vs ${match.awayTeam}`,
      users: users.filter((user) => !predicted.has(user.id)).map((user) => ({ id: user.id, name: user.name, phone: user.phone })),
    };
  });
  const unpaidUsers = users.filter((user) => !db.payments.some((payment) => payment.userId === user.id && payment.verificationStatus === "VERIFIED"));
  return {
    nextMatches,
    liveMatches,
    lastCompleted: completed,
    missingPredictions,
    unpaidUsers: unpaidUsers.map((user) => ({ id: user.id, name: user.name, phone: user.phone })),
    sportsSync: sportsProvider.getLastSyncStatus(db.sportsSync),
    exchangeRate: db.exchangeRate,
  };
}

async function readBody(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  if (!body) return {};
  const parsed = safeJsonParse(body, {});
  if (!parsed.ok) throw Object.assign(new Error("Invalid JSON body"), { status: 400 });
  return parsed.value;
}

function currentUserFromRequest(db, req) {
  return findSessionUser(db, sessionTokenFromRequest(req), sessionSecret);
}

function requireAdmin(db, req) {
  const user = currentUserFromRequest(db, req);
  if (canUseAdminAction(user)) return user;
  if (req.headers["x-admin-pin"] === adminPin) return db.users.find((item) => item.role === "ADMIN");
  return null;
}

function statePayload(db, currentUser = null) {
  const standings = calculateStandings(db.users, db.matches, db.predictions, db.payments);
  const prizeSummary = calculatePrizeSummary({ predictions: db.predictions, payments: db.payments });
  const tournamentBonus = calculateTournamentBonus(db.users, db.matches, db.predictions, db.payments);
  const settlements = db.matches.map((match) => calculateMatchSettlement(match, db.predictions, db.payments));
  const nextMatches = sportsProvider.getUpcomingMatches(db.matches, 4);
  const payouts = buildPayouts(db);
  const predictionRows = db.predictions.map((prediction) => {
    const match = db.matches.find((item) => item.id === prediction.matchId);
    const user = db.users.find((item) => item.id === prediction.userId);
    const payment = db.payments.find((item) => item.predictionId === prediction.id);
    return {
      ...prediction,
      match,
      userName: user?.name || "Unknown",
      payment,
      points: scorePrediction(prediction, match?.result),
      locked: isPredictionLocked(match),
    };
  });
  const adminPredictions = predictionRows.map((prediction) => ({
    id: prediction.id,
    userId: prediction.userId,
    userName: prediction.userName,
    userPhone: db.users.find((user) => user.id === prediction.userId)?.phone || "",
    currency: prediction.payment?.currency || "COP",
    paymentStatus: paymentStatusValue(prediction.payment),
    matchId: prediction.matchId,
    matchName: prediction.match ? `${prediction.match.homeTeam} vs ${prediction.match.awayTeam}` : "",
    predictedScore: `${prediction.homeScore}-${prediction.awayScore}`,
    homeScore: prediction.homeScore,
    awayScore: prediction.awayScore,
    updatedAt: prediction.updatedAt,
    beforeLock: !prediction.locked,
    matchLocked: prediction.locked,
    adminCorrectionLocked: prediction.match ? isAdminCorrectionLocked(prediction.match) : true,
    resultStatus: prediction.match?.result?.status || "PENDING",
    points: prediction.points,
  }));

  return {
    settings: db.settings,
    currentUser: publicUser(currentUser),
    users: db.users.map(publicUser),
    matches: db.matches,
    nextMatches,
    predictions: predictionRows,
    adminPredictions,
    payments: db.payments,
    payouts: currentUser?.role === "ADMIN" ? payouts : payouts.filter((payout) => payout.userId === currentUser?.id),
    auditLogs: currentUser?.role === "ADMIN" ? (db.auditLogs || []).slice(-200).reverse() : [],
    matchDay: currentUser?.role === "ADMIN" ? matchDaySummary(db) : null,
    standings,
    prizeSummary,
    tournamentBonus,
    settlements,
    exchangeRate: db.exchangeRate,
    storage: {
      driver: appStorage.driver,
      label: appStorage.label,
      warning:
        appStorage.startupWarnings?.[0] ||
        ((process.env.NODE_ENV === "production" && appStorage.driver === "json")
          ? "JSON file storage requires a persistent writable volume and is not safe for serverless deployments."
          : null),
    },
    sportsSync: sportsProvider.getLastSyncStatus(db.sportsSync),
    sportsVerification: sportsProvider.getVerificationStatus({ matches: db.matches, syncStatus: db.sportsSync }),
  };
}

function buildWhatsappMessage(db, type, language, matchId) {
  const match = db.matches.find((item) => item.id === matchId) || getNextMatches(db.matches, 1)[0] || db.matches[0];
  const standings = calculateStandings(db.users, db.matches, db.predictions, db.payments);
  const settlement = calculateMatchSettlement(match, db.predictions, db.payments);
  const joinUrl = `${publicBaseUrl}/?match=${match.id}`;

  const pendingUsers = db.users
    .filter((user) => user.role === "USER")
    .filter((user) => !db.payments.some((payment) => payment.userId === user.id && payment.verificationStatus === "VERIFIED"))
    .map((user) => user.name);
  const matchPredictions = db.predictions.filter((prediction) => prediction.matchId === match.id);
  const predictedIds = new Set(matchPredictions.map((prediction) => prediction.userId));
  const missingNames = db.users.filter((user) => user.role === "USER" && !predictedIds.has(user.id)).map((user) => user.name);

  if (type === "winner" || type === "match_winner" || type === "result_posted") {
    return generateWinnerMessage({ language, match, settlement, users: db.users, standings });
  }

  if (type === "payment_reminder") {
    return language === "en"
      ? `Payment reminder - Polla Mundialista 2026\nPending payment: ${pendingUsers.join(", ") || "none"}\nPayments are manual and confirmed by admin.`
      : `Recordatorio de pago - Polla Mundialista 2026\nPago pendiente: ${pendingUsers.join(", ") || "ninguno"}\nLos pagos son manuales y los confirma el administrador.`;
  }

  if (type === "prediction_reminder" || type === "lock_warning") {
    const lockLine =
      type === "lock_warning"
        ? language === "en"
          ? "Predictions close soon. Final warning."
          : "Las predicciones cierran pronto. Ultimo aviso."
        : language === "en"
          ? "Remember to submit your exact score."
          : "Recuerda enviar tu marcador exacto.";
    return language === "en"
      ? `${lockLine}\nMatch: ${match.homeTeam} vs ${match.awayTeam}\nMissing predictions: ${missingNames.join(", ") || "none"}\nJoin: ${joinUrl}`
      : `${lockLine}\nPartido: ${match.homeTeam} vs ${match.awayTeam}\nFaltan predicciones: ${missingNames.join(", ") || "ninguna"}\nEntra: ${joinUrl}`;
  }

  if (type === "match_closed") {
    return language === "en"
      ? `Predictions closed for ${match.homeTeam} vs ${match.awayTeam}. Good luck!`
      : `Predicciones cerradas para ${match.homeTeam} vs ${match.awayTeam}. Buena suerte!`;
  }

  if (type === "standings") {
    const top = standings.slice(0, 5).map((row) => `${row.rank}. ${row.name} (${row.points})`).join("\n");
    return language === "en" ? `Current standings:\n${top || "Pending"}` : `Tabla actual:\n${top || "Pendiente"}`;
  }

  if (type === "final_winner") {
    const top = standings.filter((row) => row.rank === 1).map((row) => row.name).join(", ");
    return language === "en" ? `Final winner(s): ${top || "Pending"}.` : `Ganador(es) finales: ${top || "Pendiente"}.`;
  }

  if (type === "payout_ready" || type === "payout_paid") {
    return language === "en"
      ? `Payout update: ${type === "payout_paid" ? "paid" : "ready for manual payment"}. Admin will confirm details.`
      : `Actualizacion de premio: ${type === "payout_paid" ? "pagado" : "listo para pago manual"}. El administrador confirma los detalles.`;
  }

  if (language === "en") {
    return [
      "Polla Mundialista 2026",
      "",
      `Match: ${match.homeTeam} vs ${match.awayTeam}`,
      "Entry: 2,000 COP or 1 USD",
      "Prediction: exact score",
      "Predictions close 15 minutes before kickoff.",
      "",
      `Join here: ${joinUrl}`,
    ].join("\n");
  }

  return [
    "Polla Mundialista 2026",
    "",
    `Partido: ${match.homeTeam} vs ${match.awayTeam}`,
    "Entrada: 2,000 COP o 1 USD",
    "Prediccion: marcador exacto",
    "Las predicciones cierran 15 minutos antes del inicio.",
    "",
    `Entra aqui: ${joinUrl}`,
  ].join("\n");
}

function apiErrorPayload(error) {
  const storage = error.storageLabel || appStorage.label || appStorage.driver || "unknown";
  return {
    ok: false,
    error: error.message || "Server error",
    storage,
    message:
      error.message ||
      (storage === "Supabase"
        ? "Supabase storage is unavailable. Check environment variables and migrations."
        : "Local JSON storage is unavailable. The app created or will create a safe database when possible."),
  };
}

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/health") return sendJson(res, 200, { ok: true });

  let db;
  try {
    db = await readDb();
  } catch (error) {
    return sendJson(res, error.status || 500, apiErrorPayload(error));
  }
  const parts = pathname.split("/").filter(Boolean);
  const currentUser = currentUserFromRequest(db, req);

  if (req.method === "GET" && pathname === "/api/live-readiness") return sendJson(res, 200, liveReadiness());
  if (req.method === "GET" && pathname === "/api/state") return sendJson(res, 200, statePayload(db, currentUser));
  if (req.method === "GET" && pathname === "/api/sync/status") {
    return sendJson(res, 200, sportsProvider.getLastSyncStatus(db.sportsSync));
  }
  if (req.method === "GET" && pathname === "/api/exchange-rate/usd-cop") {
    const admin = requireAdmin(db, req);
    const rate = await getUsdCopRate({ cache: db.exchangeRate, env: process.env });
    db.exchangeRate = rate;
    addAuditLog(db, {
      actor: admin,
      action: rate.invalidRejected ? "EXCHANGE_RATE_INVALID_REJECTED" : "EXCHANGE_RATE_REFRESHED",
      entityType: "exchangeRate",
      entityId: "usd-cop",
      newValue: rate,
      reason: rate.error || "",
    });
    await writeDb(db);
    return sendJson(res, 200, rate);
  }
  if (req.method === "GET" && pathname === "/api/admin/sports/verify") {
    const admin = requireAdmin(db, req);
    if (!admin) return sendJson(res, 403, { error: "Admin only" });
    return sendJson(res, 200, sportsProvider.getVerificationStatus({ matches: db.matches, syncStatus: db.sportsSync }));
  }
  if (req.method === "GET" && pathname === "/api/admin/matches") {
    const admin = requireAdmin(db, req);
    if (!admin) return sendJson(res, 403, { error: "Admin only" });
    return sendJson(res, 200, { matches: db.matches });
  }
  if (req.method === "GET" && pathname === "/api/admin/results") {
    const admin = requireAdmin(db, req);
    if (!admin) return sendJson(res, 403, { error: "Admin only" });
    return sendJson(res, 200, { results: db.matches.map((match) => sportsProvider.getMatchResult(db.matches, match.id)) });
  }
  if (req.method === "GET" && pathname === "/api/matches/upcoming") {
    return sendJson(res, 200, { matches: sportsProvider.getUpcomingMatches(db.matches, 4) });
  }
  if (req.method === "GET" && parts[0] === "api" && parts[1] === "matches" && parts[2] && parts[3] === "result") {
    return sendJson(res, 200, sportsProvider.getMatchResult(db.matches, parts[2]));
  }

  if (req.method === "POST" && pathname === "/api/auth/register") {
    const body = await readBody(req);
    const input = validateRegistrationInput(body);
    if (!input.ok) return sendJson(res, 400, { error: authError(input.error, body.language) });

    const matches = findIdentityMatches(db.users, input.value);
    const uniqueMatches = [...new Map(matches.map((user) => [user.id, user])).values()];
    const phoneOwner = db.users.find(
      (user) => user.role === "USER" && user.normalizedPhone === input.value.normalizedPhone && user.normalizedName !== input.value.normalizedName,
    );
    if (phoneOwner) return sendJson(res, 409, { error: authError("PHONE_NAME_CONFLICT", input.value.language) });
    const nameOwner = db.users.find(
      (user) => user.role === "USER" && user.normalizedName === input.value.normalizedName && user.normalizedPhone !== input.value.normalizedPhone,
    );
    if (nameOwner) return sendJson(res, 409, { error: authError("NAME_PHONE_CONFLICT", input.value.language) });
    if (uniqueMatches.length > 1) {
      return sendJson(res, 409, { error: authError("DUPLICATE_IDENTITY_CONFLICT", input.value.language) });
    }

    const now = new Date().toISOString();
    let user = uniqueMatches[0];
    if (!user) {
      user = {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        role: "USER",
        name: input.value.name,
        normalizedName: input.value.normalizedName,
        phone: input.value.phone,
        normalizedPhone: input.value.normalizedPhone,
        email: "",
        normalizedEmail: "",
        paidStatus: "UNPAID",
        language: input.value.language,
        authProvider: "server-session",
        createdAt: now,
        updatedAt: now,
        lastLoginAt: null,
      };
      db.users.push(user);
      db.audit.push({ at: now, type: "USER_CREATED", text: `${user.name} registered` });
      addAuditLog(db, {
        actor: user,
        action: "USER_REGISTERED",
        entityType: "user",
        entityId: user.id,
        newValue: { name: user.name, phone: user.phone, language: user.language },
      });
    } else {
      user.name = user.name || input.value.name;
      user.phone = user.phone || input.value.phone;
      user.normalizedName = user.normalizedName || input.value.normalizedName;
      user.normalizedPhone = user.normalizedPhone || input.value.normalizedPhone;
      user.language = input.value.language;
    }

    const sessionToken = startSession(db, user);
    addAuditLog(db, { actor: user, action: "USER_LOGIN", entityType: "user", entityId: user.id });
    await writeDb(db);
    return sendJson(res, 200, { user: publicUser(user), sessionToken, state: statePayload(db, user) });
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    const body = await readBody(req);
    const user = findUserByLogin(db, body);
    if (!user) return sendJson(res, 404, { error: authError("USER_NOT_FOUND", body.language) });
    const sessionToken = startSession(db, user);
    addAuditLog(db, { actor: user, action: "USER_LOGIN", entityType: "user", entityId: user.id });
    await writeDb(db);
    return sendJson(res, 200, { user: publicUser(user), sessionToken, state: statePayload(db, user) });
  }

  if (req.method === "POST" && pathname === "/api/auth/admin") {
    const body = await readBody(req);
    if (String(body.pin || "") !== adminPin) return sendJson(res, 403, { error: "Invalid admin PIN" });
    const admin = db.users.find((user) => user.role === "ADMIN");
    const sessionToken = startSession(db, admin, "ADMIN");
    addAuditLog(db, { actor: admin, action: "ADMIN_LOGIN", entityType: "user", entityId: admin.id });
    await writeDb(db);
    return sendJson(res, 200, { user: publicUser(admin), sessionToken, state: statePayload(db, admin) });
  }

  if (req.method === "POST" && pathname === "/api/predictions") {
    if (!currentUser || currentUser.role !== "USER") return sendJson(res, 401, { error: "Login required" });
    const body = await readBody(req);
    const match = db.matches.find((item) => item.id === body.matchId);
    if (!match) return sendJson(res, 404, { error: "Match not found" });
    if (isPredictionLocked(match)) return sendJson(res, 409, { error: "Prediction closed" });
    const homeScore = Number(body.homeScore);
    const awayScore = Number(body.awayScore);
    if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
      return sendJson(res, 400, { error: "Scores must be valid numbers" });
    }

    let prediction = db.predictions.find((item) => item.matchId === match.id && item.userId === currentUser.id);
    const now = new Date().toISOString();
    const oldPrediction = prediction ? { homeScore: prediction.homeScore, awayScore: prediction.awayScore } : null;
    if (prediction) {
      prediction.homeScore = homeScore;
      prediction.awayScore = awayScore;
      prediction.updatedAt = now;
    } else {
      prediction = {
        id: `prediction_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        matchId: match.id,
        userId: currentUser.id,
        homeScore,
        awayScore,
        createdAt: now,
        updatedAt: now,
      };
      db.predictions.push(prediction);
    }

    let payment = db.payments.find((item) => item.predictionId === prediction.id);
    const currency = body.currency === "USD" ? "USD" : "COP";
    const validRate = currentValidUsdCopRate(db);
    const estimatedCop = currency === "USD" ? Number(body.copReceived || validRate || DEFAULT_USD_COP_RECEIVED) : ENTRY_COP;
    const paymentMoney = calculatePaymentMoney(currency, Number(body.copReceived || estimatedCop));
    const userComment = String(body.userComment || body.comment || body.reference || "");
    if (!payment) {
      payment = {
        id: `payment_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        predictionId: prediction.id,
        matchId: match.id,
        userId: currentUser.id,
        currency,
        amountMinor: paymentMoney.amountMinor,
        copEquivalent: paymentMoney.copEquivalent,
        baseContributionCop: paymentMoney.baseContributionCop,
        excessContributionCop: paymentMoney.excessContributionCop,
        actualCopReceived: null,
        exchangeExcess: paymentMoney.excessContributionCop,
        exchangeRateSource: currency === "USD" && validRate ? db.exchangeRate?.source || "current-estimate" : null,
        exchangeRateDate: currency === "USD" && validRate ? db.exchangeRate?.date || null : null,
        exchangeRateUsdCop: currency === "USD" && validRate ? paymentMoney.copEquivalent : null,
        rateLockedAt: null,
        method: String(body.method || "Manual"),
        reference: userComment,
        userComment,
        adminNotes: "",
        notes: "",
        paidStatus: "UNPAID",
        verificationStatus: "PENDING",
        paidAt: null,
        verifiedAt: null,
        verifiedBy: null,
      };
      db.payments.push(payment);
    } else if (payment.verificationStatus !== "VERIFIED") {
      Object.assign(payment, paymentMoney, {
        currency,
        exchangeExcess: paymentMoney.excessContributionCop,
        exchangeRateSource: currency === "USD" && validRate ? db.exchangeRate?.source || payment.exchangeRateSource || "current-estimate" : null,
        exchangeRateDate: currency === "USD" && validRate ? db.exchangeRate?.date || payment.exchangeRateDate || null : null,
        exchangeRateUsdCop: currency === "USD" && validRate ? paymentMoney.copEquivalent : null,
        method: String(body.method || payment.method || "Manual"),
        reference: userComment,
        userComment,
        verificationStatus: "PENDING",
      });
    }

    addAuditLog(db, {
      actor: currentUser,
      action: oldPrediction ? "PREDICTION_UPDATED" : "PREDICTION_CREATED",
      entityType: "prediction",
      entityId: prediction.id,
      oldValue: oldPrediction,
      newValue: { homeScore, awayScore, matchId: match.id, currency },
    });

    await writeDb(db);
    return sendJson(res, 200, statePayload(db, currentUser));
  }

  if (req.method === "PATCH" && pathname === "/api/profile") {
    if (!currentUser || currentUser.role !== "USER") return sendJson(res, 401, { error: "Login required" });
    const body = await readBody(req);
    currentUser.language = body.language === "en" ? "en" : currentUser.language || "es";
    currentUser.updatedAt = new Date().toISOString();
    await writeDb(db);
    return sendJson(res, 200, statePayload(db, currentUser));
  }

  if (req.method === "PATCH" && parts[0] === "api" && parts[1] === "payments" && parts[2]) {
    if (!currentUser) return sendJson(res, 401, { error: "Login required" });
    const payment = db.payments.find((item) => item.id === parts[2]);
    if (!payment || payment.userId !== currentUser.id) return sendJson(res, 404, { error: "Payment not found" });
    if (payment.verificationStatus === "VERIFIED") return sendJson(res, 409, { error: "Verified payments cannot be changed" });
    const body = await readBody(req);
    const oldPayment = { ...payment };
    payment.currency = body.currency === "USD" ? "USD" : "COP";
    const validRate = currentValidUsdCopRate(db);
    const estimatedCop = payment.currency === "USD" ? Number(body.copReceived || validRate || DEFAULT_USD_COP_RECEIVED) : ENTRY_COP;
    const money = calculatePaymentMoney(payment.currency, Number(body.copReceived || estimatedCop));
    Object.assign(payment, money, {
      actualCopReceived: null,
      exchangeExcess: money.excessContributionCop,
      exchangeRateSource: payment.currency === "USD" && validRate ? db.exchangeRate?.source || payment.exchangeRateSource || "current-estimate" : null,
      exchangeRateDate: payment.currency === "USD" && validRate ? db.exchangeRate?.date || payment.exchangeRateDate || null : null,
      exchangeRateUsdCop: payment.currency === "USD" && validRate ? money.copEquivalent : null,
      rateLockedAt: null,
      method: String(body.method || payment.method),
      reference: String(body.userComment || body.comment || body.reference || ""),
      userComment: String(body.userComment || body.comment || body.reference || ""),
      adminNotes: payment.adminNotes || "",
      notes: payment.notes || "",
      paidStatus: "PAID",
      verificationStatus: "PENDING",
      paidAt: new Date().toISOString(),
    });
    addAuditLog(db, {
      actor: currentUser,
      action: "PAYMENT_UPDATED_BY_USER",
      entityType: "payment",
      entityId: payment.id,
      oldValue: { currency: oldPayment.currency, userComment: oldPayment.userComment },
      newValue: { currency: payment.currency, userComment: payment.userComment },
    });
    await writeDb(db);
    return sendJson(res, 200, statePayload(db, currentUser));
  }

  if (req.method === "PATCH" && parts[0] === "api" && parts[1] === "admin" && parts[2] === "payments" && parts[3]) {
    const admin = requireAdmin(db, req);
    if (!admin) return sendJson(res, 403, { error: "Admin only" });
    const payment = db.payments.find((item) => item.id === parts[3]);
    if (!payment) return sendJson(res, 404, { error: "Payment not found" });
    const body = await readBody(req);
    const oldPayment = { ...payment };
    const status = ["VERIFIED", "PENDING", "REJECTED"].includes(body.verificationStatus) ? body.verificationStatus : "PENDING";
    if (body.currency) payment.currency = body.currency === "USD" ? "USD" : "COP";
    const validRate = currentValidUsdCopRate(db);
    if (status === "VERIFIED" && payment.currency === "USD" && !Number(body.copReceived) && !validRate) {
      return sendJson(res, 400, { error: "A valid USD/COP rate or actual COP received is required to verify USD payment" });
    }
    const receivedCop =
      payment.currency === "USD"
        ? Number(body.copReceived || payment.actualCopReceived || validRate || DEFAULT_USD_COP_RECEIVED)
        : ENTRY_COP;
    const money = calculatePaymentMoney(payment.currency, receivedCop);
    Object.assign(payment, money);
    payment.actualCopReceived = payment.currency === "USD" ? receivedCop : ENTRY_COP;
    payment.exchangeExcess = money.excessContributionCop;
    payment.method = String(body.method || payment.method || "Manual");
    payment.userComment = String(body.userComment ?? body.comment ?? payment.userComment ?? payment.reference ?? "");
    payment.reference = payment.userComment;
    payment.adminNotes = String(body.adminNotes ?? body.notes ?? payment.adminNotes ?? "");
    payment.notes = payment.adminNotes;
    payment.verificationStatus = status;
    payment.paidStatus =
      payment.verificationStatus === "VERIFIED" ? "PAID" : payment.verificationStatus === "REJECTED" ? "UNPAID" : payment.paidStatus;
    payment.verifiedAt = payment.verificationStatus === "VERIFIED" ? new Date().toISOString() : null;
    payment.verifiedBy = payment.verificationStatus === "VERIFIED" ? admin.id : null;
    payment.rejectedAt = payment.verificationStatus === "REJECTED" ? new Date().toISOString() : payment.rejectedAt || null;
    payment.rejectedBy = payment.verificationStatus === "REJECTED" ? admin.id : payment.rejectedBy || null;
    if (payment.verificationStatus === "VERIFIED") {
      payment.exchangeRateSource = payment.currency === "USD" ? db.exchangeRate?.source || payment.exchangeRateSource || "manual-admin" : null;
      payment.exchangeRateDate = payment.currency === "USD" ? db.exchangeRate?.date || payment.exchangeRateDate || null : null;
      payment.exchangeRateUsdCop = payment.currency === "USD" ? receivedCop : null;
      payment.rateLockedAt = payment.verifiedAt;
    } else if (payment.currency !== "USD") {
      payment.exchangeRateSource = null;
      payment.exchangeRateDate = null;
      payment.exchangeRateUsdCop = null;
    }
    addAuditLog(db, {
      actor: admin,
      action:
        payment.verificationStatus === "VERIFIED"
          ? "PAYMENT_VERIFIED"
          : payment.verificationStatus === "REJECTED"
            ? "PAYMENT_REJECTED"
            : "PAYMENT_MARKED_PENDING",
      entityType: "payment",
      entityId: payment.id,
      oldValue: {
        verificationStatus: oldPayment.verificationStatus,
        actualCopReceived: oldPayment.actualCopReceived,
        exchangeExcess: oldPayment.exchangeExcess,
      },
      newValue: {
        verificationStatus: payment.verificationStatus,
        actualCopReceived: payment.actualCopReceived,
        exchangeExcess: payment.exchangeExcess,
      },
      reason: payment.adminNotes,
    });
    await writeDb(db);
    return sendJson(res, 200, statePayload(db, admin));
  }

  if (
    req.method === "POST" &&
    parts[0] === "api" &&
    parts[1] === "admin" &&
    parts[2] === "predictions" &&
    parts[3] &&
    parts[4] === "correction"
  ) {
    const admin = requireAdmin(db, req);
    if (!admin) return sendJson(res, 403, { error: "Admin only" });
    const prediction = db.predictions.find((item) => item.id === parts[3]);
    if (!prediction) return sendJson(res, 404, { error: "Prediction not found" });
    const match = db.matches.find((item) => item.id === prediction.matchId);
    if (!match) return sendJson(res, 404, { error: "Match not found" });
    if (isAdminCorrectionLocked(match)) return sendJson(res, 409, { error: "Correction locked" });
    const body = await readBody(req);
    const reason = String(body.reason || "").trim();
    const homeScore = Number(body.homeScore);
    const awayScore = Number(body.awayScore);
    if (!reason) return sendJson(res, 400, { error: "Correction reason is required" });
    if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
      return sendJson(res, 400, { error: "Scores must be valid numbers" });
    }
    const now = new Date().toISOString();
    const correction = {
      id: `correction_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      predictionId: prediction.id,
      matchId: prediction.matchId,
      userId: prediction.userId,
      correctedByAdminId: admin.id,
      previousHomeScore: prediction.homeScore,
      previousAwayScore: prediction.awayScore,
      newHomeScore: homeScore,
      newAwayScore: awayScore,
      reason,
      correctedAt: now,
    };
    prediction.homeScore = homeScore;
    prediction.awayScore = awayScore;
    prediction.updatedAt = now;
    db.predictionCorrections.push(correction);
    addAuditLog(db, {
      actor: admin,
      action: "PREDICTION_CORRECTION",
      entityType: "prediction",
      entityId: prediction.id,
      oldValue: { homeScore: correction.previousHomeScore, awayScore: correction.previousAwayScore },
      newValue: { homeScore, awayScore },
      reason,
    });
    await writeDb(db);
    return sendJson(res, 200, statePayload(db, admin));
  }

  if (req.method === "POST" && parts[0] === "api" && parts[1] === "admin" && parts[2] === "results" && parts[3] === "sync") {
    const admin = requireAdmin(db, req);
    if (!admin) return sendJson(res, 403, { error: "Admin only" });
    const body = await readBody(req);
    const matchIndex = body.matchId ? db.matches.findIndex((item) => item.id === body.matchId) : -1;
    if (body.matchId && matchIndex === -1) return sendJson(res, 404, { error: "Match not found" });
    const sync = await sportsProvider.syncResults({ matchIds: body.matchId ? [body.matchId] : [], cachedMatches: db.matches });
    if (body.matchId) {
      const syncedMatch = sync.matches.find((match) => match.id === body.matchId);
      if (syncedMatch) db.matches[matchIndex] = syncedMatch;
    } else {
      const existing = new Map(db.matches.map((match) => [match.id, match]));
      for (const match of sync.matches) existing.set(match.id, { ...existing.get(match.id), ...match });
      db.matches = [...existing.values()].sort((a, b) => new Date(a.kickoffAt) - new Date(b.kickoffAt));
    }
    db.sportsSync = mergeSyncStatus(db.sportsSync, sync.status);
    db.settings.footballApiProvider = sync.provider;
    db.settings.resultsProvider = sync.provider;
    addAuditLog(db, {
      actor: admin,
      action: "RESULTS_SYNCED",
      entityType: "sportsSync",
      entityId: body.matchId || "LAST_3_COMPLETED",
      newValue: sync.status,
    });
    await writeDb(db);
    return sendJson(res, 200, statePayload(db, admin));
  }

  if (req.method === "POST" && pathname === "/api/admin/matches/sync") {
    const admin = requireAdmin(db, req);
    if (!admin) return sendJson(res, 403, { error: "Admin only" });
    const body = await readBody(req);
    const sync = await sportsProvider.syncFixtures({ from: body.from, to: body.to, cachedMatches: db.matches });
    if (sync.matches.length) {
      const existing = new Map(db.matches.map((match) => [match.id, match]));
      for (const match of sync.matches) {
        existing.set(match.id, { ...existing.get(match.id), ...match });
      }
      db.matches = [...existing.values()].sort((a, b) => new Date(a.kickoffAt) - new Date(b.kickoffAt));
    }
    db.settings.footballApiProvider = sync.provider;
    db.settings.resultsProvider = sync.provider;
    db.sportsSync = mergeSyncStatus(db.sportsSync, sync.status);
    addAuditLog(db, {
      actor: admin,
      action: "FIXTURES_SYNCED",
      entityType: "sportsSync",
      entityId: "fixtures",
      newValue: sync.status,
      reason: sync.status?.message || "",
    });
    await writeDb(db);
    return sendJson(res, 200, { ...statePayload(db, admin), sync });
  }

  if (req.method === "GET" && parts[0] === "api" && parts[1] === "admin" && parts[2] === "export" && parts[3]) {
    const admin = requireAdmin(db, req);
    if (!admin) return sendJson(res, 403, { error: "Admin only" });
    const type = parts[3];
    addAuditLog(db, { actor: admin, action: "DATA_EXPORT_CREATED", entityType: "export", entityId: type });
    await writeDb(db);
    if (type === "backup") {
      return sendJson(res, 200, {
        exportedAt: new Date().toISOString(),
        users: db.users,
        matches: db.matches,
        predictions: db.predictions,
        payments: db.payments,
        exchangeRate: db.exchangeRate,
        prizeSummary: calculatePrizeSummary({ predictions: db.predictions, payments: db.payments }),
        standings: calculateStandings(db.users, db.matches, db.predictions, db.payments),
        payouts: buildPayouts(db),
        auditLogs: db.auditLogs || [],
      });
    }
    const datasets = {
      users: {
        rows: db.users.filter((user) => user.role === "USER"),
        columns: [
          { key: "id", label: "id" },
          { key: "name", label: "name" },
          { key: "phone", label: "phone" },
          { key: "language", label: "language" },
        ],
      },
      predictions: {
        rows: db.predictions,
        columns: [
          { key: "id", label: "id" },
          { key: "userId", label: "userId" },
          { key: "matchId", label: "matchId" },
          { key: "homeScore", label: "homeScore" },
          { key: "awayScore", label: "awayScore" },
          { key: "updatedAt", label: "updatedAt" },
        ],
      },
      payments: {
        rows: db.payments,
        columns: [
          { key: "id", label: "id" },
          { key: "userId", label: "userId" },
          { key: "matchId", label: "matchId" },
          { key: "currency", label: "currency" },
          { key: "verificationStatus", label: "verificationStatus" },
          { key: "actualCopReceived", label: "actualCopReceived" },
          { key: "basePotContributionCop", label: "basePotContributionCop" },
          { key: "exchangeExcess", label: "exchangeExcess" },
        ],
      },
      standings: {
        rows: calculateStandings(db.users, db.matches, db.predictions, db.payments),
        columns: [
          { key: "rank", label: "rank" },
          { key: "name", label: "name" },
          { key: "points", label: "points" },
          { key: "correctPredictions", label: "correctPredictions" },
          { key: "predictionsSubmitted", label: "predictionsSubmitted" },
        ],
      },
      payouts: {
        rows: buildPayouts(db),
        columns: [
          { key: "id", label: "id" },
          { key: "userId", label: "userId" },
          { key: "prizeType", label: "prizeType" },
          { key: "amountCop", label: "amountCop" },
          { key: "status", label: "status" },
        ],
      },
      audit: {
        rows: db.auditLogs || [],
        columns: [
          { key: "createdAt", label: "createdAt" },
          { key: "actorUserId", label: "actorUserId" },
          { key: "actorRole", label: "actorRole" },
          { key: "action", label: "action" },
          { key: "entityType", label: "entityType" },
          { key: "entityId", label: "entityId" },
          { key: "reason", label: "reason" },
        ],
      },
    };
    const dataset = datasets[type];
    if (!dataset) return sendJson(res, 404, { error: "Export not found" });
    return sendText(res, 200, toCsv(dataset.rows, dataset.columns), "text/csv; charset=utf-8");
  }

  if (req.method === "PATCH" && parts[0] === "api" && parts[1] === "admin" && parts[2] === "payouts" && parts[3]) {
    const admin = requireAdmin(db, req);
    if (!admin) return sendJson(res, 403, { error: "Admin only" });
    const body = await readBody(req);
    const allowed = new Set(["calculated", "approved", "paid", "failed", "cancelled"]);
    const status = allowed.has(body.status) ? body.status : null;
    if (!status) return sendJson(res, 400, { error: "Invalid payout status" });
    const payouts = buildPayouts(db);
    const payout = payouts.find((item) => item.id === parts[3]);
    if (!payout) return sendJson(res, 404, { error: "Payout not found" });
    const existing = (db.payouts || []).find((item) => item.id === payout.id) || payout;
    const now = new Date().toISOString();
    existing.status = status;
    existing.adminNotes = String(body.adminNotes ?? existing.adminNotes ?? "");
    if (status === "approved") {
      existing.approvedBy = admin.id;
      existing.approvedAt = now;
    }
    if (status === "paid") {
      existing.paidBy = admin.id;
      existing.paidAt = now;
    }
    db.payouts = [...(db.payouts || []).filter((item) => item.id !== existing.id), existing];
    addAuditLog(db, {
      actor: admin,
      action: status === "paid" ? "PAYOUT_MARKED_PAID" : "PAYOUT_UPDATED",
      entityType: "payout",
      entityId: existing.id,
      newValue: { status, adminNotes: existing.adminNotes },
    });
    await writeDb(db);
    return sendJson(res, 200, statePayload(db, admin));
  }

  if (req.method === "POST" && pathname === "/api/admin/whatsapp") {
    const admin = requireAdmin(db, req);
    if (!admin) return sendJson(res, 403, { error: "Admin only" });
    const body = await readBody(req);
    const message = buildWhatsappMessage(db, body.type || "invite", body.language || "es", body.matchId);
    return sendJson(res, 200, { message, shareUrl: `https://wa.me/?text=${encodeURIComponent(message)}` });
  }

  return sendJson(res, 404, { error: "Not found" });
}

async function serveStatic(req, res, pathname) {
  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = resolve(publicDir, `.${cleanPath.endsWith("/") ? `${cleanPath}index.html` : cleanPath}`);
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403, securityHeaders);
    res.end("Forbidden");
    return;
  }

  try {
    const data = await readFile(filePath);
    res.writeHead(200, { ...securityHeaders, "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream" });
    res.end(data);
  } catch {
    const data = await readFile(join(publicDir, "index.html"));
    res.writeHead(200, { ...securityHeaders, "Content-Type": contentTypes[".html"] });
    res.end(data);
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url.pathname);
      return;
    }
    await serveStatic(req, res, url.pathname);
  } catch (error) {
    sendJson(res, error.status || 500, apiErrorPayload(error));
  }
}).listen(port, () => {
  console.log(`Polla Mundialista 2026 running at http://localhost:${port}`);
});
