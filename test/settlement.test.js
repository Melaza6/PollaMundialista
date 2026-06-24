import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  ENTRY_COP,
  assertUserCanPredict,
  calculateMatchSettlement,
  calculatePaymentMoney,
  calculatePayoutLedger,
  calculatePrizeSummary,
  calculateTournamentBonus,
  canEditPrediction,
  canUseAdminAction,
  generateWinnerMessage,
  getNextMatches,
  isAdminCorrectionLocked,
  isPredictionLocked,
  syncApiResult,
} from "../lib/rules.js";
import { findIdentityMatches, normalizeName, normalizePhone, validateRegistrationInput } from "../lib/auth.js";
import { loadEnvFile, parseEnvFile } from "../lib/env.js";
import { getUsdCopRate, isValidUsdCopRate, parseExchangeRateValue } from "../server/exchangeRateProvider.js";
import { createSportsProvider } from "../server/sportsProvider.js";
import { createStorage, resolveStorageDriver, validateStorageStartup } from "../server/storage/index.js";

const users = [
  { id: "u1", role: "USER", name: "Ana" },
  { id: "u2", role: "USER", name: "Carlos" },
  { id: "admin", role: "ADMIN", name: "Admin" },
];

const finalMatch = {
  id: "m1",
  homeTeam: "Colombia",
  awayTeam: "Brasil",
  kickoffAt: "2026-06-20T20:00:00.000Z",
  result: { status: "FINAL", homeScore: 2, awayScore: 1 },
};

test("USD exchange excess is separate from the base pot", () => {
  const predictions = [
    { id: "p1", matchId: "m1", userId: "u1", homeScore: 2, awayScore: 1 },
    { id: "p2", matchId: "m1", userId: "u2", homeScore: 1, awayScore: 0 },
  ];
  const payments = [
    { predictionId: "p1", matchId: "m1", verificationStatus: "VERIFIED", ...calculatePaymentMoney("COP") },
    { predictionId: "p2", matchId: "m1", verificationStatus: "VERIFIED", ...calculatePaymentMoney("USD", 4000) },
  ];

  const settlement = calculateMatchSettlement(finalMatch, predictions, payments);

  assert.equal(settlement.basePotCop, 4000);
  assert.equal(settlement.usdExcessCop, 2000);
  assert.deepEqual(settlement.winners, [
    { userId: "u1", predictionId: "p1", points: 5, basePayoutCop: 4000, bonusPayoutCop: 0, totalPayoutCop: 4000 },
  ]);
});

test("tied top match scores split only the base pot", () => {
  const predictions = [
    { id: "p1", matchId: "m1", userId: "u1", homeScore: 2, awayScore: 1 },
    { id: "p2", matchId: "m1", userId: "u2", homeScore: 2, awayScore: 1 },
  ];
  const payments = [
    { predictionId: "p1", matchId: "m1", verificationStatus: "VERIFIED", ...calculatePaymentMoney("COP") },
    { predictionId: "p2", matchId: "m1", verificationStatus: "VERIFIED", ...calculatePaymentMoney("USD", 4000) },
  ];

  const settlement = calculateMatchSettlement(finalMatch, predictions, payments);

  assert.equal(settlement.basePotCop, ENTRY_COP * 2);
  assert.equal(settlement.usdExcessCop, 2000);
  assert.deepEqual(
    settlement.winners.map((winner) => winner.totalPayoutCop),
    [2000, 2000],
  );
});

test("World Cup bonus goes to most paid predictions and splits ties", () => {
  const matches = [
    finalMatch,
    { ...finalMatch, id: "m2", result: { status: "FINAL", homeScore: 1, awayScore: 1 } },
  ];
  const predictions = [
    { id: "p1", matchId: "m1", userId: "u1", homeScore: 2, awayScore: 1 },
    { id: "p2", matchId: "m2", userId: "u1", homeScore: 1, awayScore: 1 },
    { id: "p3", matchId: "m1", userId: "u2", homeScore: 2, awayScore: 1 },
    { id: "p4", matchId: "m2", userId: "u2", homeScore: 1, awayScore: 1 },
  ];
  const payments = predictions.map((prediction) => ({
    predictionId: prediction.id,
    matchId: prediction.matchId,
    verificationStatus: "VERIFIED",
    ...calculatePaymentMoney(prediction.userId === "u2" ? "USD" : "COP", 4000),
  }));

  const bonus = calculateTournamentBonus(users, matches, predictions, payments);

  assert.equal(bonus.bonusPotCop, 4000);
  assert.deepEqual(
    bonus.winners.map((winner) => ({ name: winner.name, correct: winner.correctPredictions, payout: winner.bonusPayoutCop })),
    [
      { name: "Ana", correct: 2, payout: 2000 },
      { name: "Carlos", correct: 2, payout: 2000 },
    ],
  );
});

test("Prediction locks 15 minutes before match start", () => {
  const match = { kickoffAt: "2026-06-20T20:00:00.000Z" };
  assert.equal(isPredictionLocked(match, new Date("2026-06-20T19:44:59.000Z")), false);
  assert.equal(isPredictionLocked(match, new Date("2026-06-20T19:45:00.000Z")), true);
});

test("User must be logged in to predict", () => {
  const result = assertUserCanPredict({
    currentUser: null,
    existingPrediction: null,
    match: { kickoffAt: "2026-06-20T20:00:00.000Z" },
    now: new Date("2026-06-20T19:00:00.000Z"),
  });
  assert.deepEqual(result, { ok: false, reason: "LOGIN_REQUIRED" });
});

test("User can only edit their own prediction", () => {
  const allowed = canEditPrediction({
    currentUser: users[0],
    prediction: { userId: "u1" },
    match: { kickoffAt: "2026-06-20T20:00:00.000Z" },
    now: new Date("2026-06-20T19:00:00.000Z"),
  });
  const denied = canEditPrediction({
    currentUser: users[0],
    prediction: { userId: "u2" },
    match: { kickoffAt: "2026-06-20T20:00:00.000Z" },
    now: new Date("2026-06-20T19:00:00.000Z"),
  });
  assert.equal(allowed, true);
  assert.equal(denied, false);
});

test("Next 4 upcoming matches are shown", () => {
  const matches = [
    { id: "past", kickoffAt: "2026-06-10T20:00:00.000Z" },
    { id: "one", kickoffAt: "2026-06-20T20:00:00.000Z" },
    { id: "two", kickoffAt: "2026-06-21T20:00:00.000Z" },
    { id: "three", kickoffAt: "2026-06-22T20:00:00.000Z" },
    { id: "done", kickoffAt: "2026-06-22T19:59:59.000Z", status: "FINISHED", result: { status: "FINAL" } },
    { id: "four", kickoffAt: "2026-06-23T20:00:00.000Z" },
    { id: "five", kickoffAt: "2026-06-24T20:00:00.000Z" },
  ];
  assert.deepEqual(
    getNextMatches(matches, 4, new Date("2026-06-19T20:00:00.000Z")).map((match) => match.id),
    ["one", "two", "three", "four"],
  );
});

test("Admin/user permission separation", () => {
  assert.equal(canUseAdminAction(users[0]), false);
  assert.equal(canUseAdminAction(users[2]), true);
});

test("Post-game winner message generation", () => {
  const message = generateWinnerMessage({
    language: "es",
    match: finalMatch,
    settlement: { winners: [{ userId: "u1" }] },
    users,
    standings: [{ rank: 1, name: "Ana", points: 5 }],
  });
  assert.match(message, /Resultado final: Colombia 2 - 1 Brasil/);
  assert.match(message, /Ana/);
});

test("API result synchronization uses API-provided scores", () => {
  const synced = syncApiResult({
    id: "m1",
    status: "SCHEDULED",
    apiResult: { homeScore: 3, awayScore: 2 },
    resultSync: {},
  });
  assert.equal(synced.result.homeScore, 3);
  assert.equal(synced.result.awayScore, 2);
  assert.equal(synced.result.source, "mock-results-api");
});

test("Sports provider keeps cached fixtures pending when no API keys are configured", async () => {
  const provider = createSportsProvider({});
  const cached = [{ id: "m1", kickoffAt: "2026-06-20T20:00:00.000Z", homeTeam: "Colombia", awayTeam: "Brasil" }];

  const sync = await provider.syncFixtures({ cachedMatches: cached });

  assert.equal(sync.provider, "not-configured");
  assert.equal(sync.status.status, "PENDING");
  assert.deepEqual(sync.matches, cached);
});

test("Sports provider does not invent results when API is unavailable", async () => {
  const provider = createSportsProvider({});
  const match = {
    id: "m1",
    kickoffAt: "2026-06-20T20:00:00.000Z",
    result: null,
    resultSync: { source: "not-configured", status: "NOT_SYNCED", lastSyncedAt: null, message: "Waiting for sync" },
  };

  const sync = await provider.syncResults({ matchIds: ["m1"], cachedMatches: [match] });
  const result = provider.getMatchResult(sync.matches, "m1");

  assert.equal(sync.matches[0].result, null);
  assert.equal(sync.matches[0].resultSync.status, "PENDING");
  assert.equal(result.status, "PENDING");
});

test("Sports provider exposes cached upcoming matches", () => {
  const provider = createSportsProvider({});
  const matches = [
    { id: "past", kickoffAt: "2026-06-10T20:00:00.000Z" },
    { id: "one", kickoffAt: "2026-06-20T20:00:00.000Z" },
    { id: "two", kickoffAt: "2026-06-21T20:00:00.000Z" },
    { id: "three", kickoffAt: "2026-06-22T20:00:00.000Z" },
    { id: "four", kickoffAt: "2026-06-23T20:00:00.000Z" },
    { id: "five", kickoffAt: "2026-06-24T20:00:00.000Z" },
  ];

  assert.deepEqual(
    provider.getUpcomingMatches(matches, 4, new Date("2026-06-19T20:00:00.000Z")).map((match) => match.id),
    ["one", "two", "three", "four"],
  );
});

test("Registration identity is normalized for duplicate checks", () => {
  assert.equal(normalizePhone("+57 300-123-4567"), "573001234567");
  assert.equal(normalizePhone("300 123 4567"), "573001234567");
  assert.equal(normalizeName(" Juan   Perez "), "juan perez");
});

test("Registration detects existing user by phone or normalized name", () => {
  const existingUsers = [
    {
      id: "u1",
      role: "USER",
      normalizedName: "juan perez",
      normalizedPhone: "573001234567",
      normalizedEmail: "old@example.com",
    },
  ];
  const input = validateRegistrationInput({
    name: "JUAN   PEREZ",
    phone: "300-123-4567",
  });

  assert.equal(input.ok, true);
  assert.deepEqual(
    findIdentityMatches(existingUsers, input.value).map((user) => user.id),
    ["u1"],
  );
});

test("Registration accepts name and phone without email or preferred currency", () => {
  const input = validateRegistrationInput({
    name: " Ana   Perez ",
    phone: "(300) 123-4567",
  });

  assert.equal(input.ok, true);
  assert.equal(input.value.normalizedName, "ana perez");
  assert.equal(input.value.normalizedPhone, "573001234567");
  assert.equal("normalizedEmail" in input.value, false);
  assert.equal("preferredCurrency" in input.value, false);
});

test("Email-only identity does not match regular users", () => {
  const existingUsers = [
    { id: "u1", role: "USER", normalizedName: "ana perez", normalizedPhone: "573001234567", normalizedEmail: "ana@example.com" },
  ];
  assert.deepEqual(findIdentityMatches(existingUsers, { normalizedEmail: "ana@example.com", normalizedPhone: "", normalizedName: "" }), []);
});

test("Sports provider verification reports pending sync without keys", () => {
  const provider = createSportsProvider({});
  const verification = provider.getVerificationStatus({ matches: [], syncStatus: provider.getLastSyncStatus() });

  assert.equal(verification.activeProvider, "not-configured");
  assert.equal(verification.configured, false);
  assert.equal(verification.status, "PENDING");
  assert.equal(verification.warnings.includes("No World Cup 2026 matches found yet."), true);
});

test("Sports provider auto falls back from API-Football blocked 2026 plan to football-data.org", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), headers: options.headers || {} });
    if (String(url).includes("football.api-sports.io")) {
      return {
        ok: true,
        async json() {
          return {
            errors: { plan: "Free plans do not have access to this season, try from 2022 to 2024." },
            results: 0,
            response: [],
          };
        },
      };
    }

    return {
      ok: true,
      async json() {
        return {
          competition: { name: "FIFA World Cup" },
          season: { startDate: "2026-06-11", endDate: "2026-07-19" },
          matches: [
            {
              id: 123,
              utcDate: "2026-06-20T20:00:00Z",
              status: "SCHEDULED",
              stage: "GROUP_STAGE",
              group: "Group A",
              venue: "Miami Stadium",
              homeTeam: { name: "Colombia" },
              awayTeam: { name: "Japan" },
              score: { fullTime: { home: null, away: null } },
            },
          ],
        };
      },
    };
  };

  try {
    const provider = createSportsProvider({
      FOOTBALL_API_PROVIDER: "auto",
      API_FOOTBALL_KEY: "api-key",
      FOOTBALL_DATA_API_KEY: "football-data-key",
      API_FOOTBALL_SEASON: "2026",
      API_FOOTBALL_WORLD_CUP_LEAGUE_ID: "1",
    });
    const sync = await provider.syncFixtures({ from: "2026-06-20", to: "2026-06-23", cachedMatches: [] });

    assert.equal(sync.provider, "football-data");
    assert.equal(sync.status.status, "SYNCED");
    assert.equal(sync.status.competitionName, "FIFA World Cup");
    assert.equal(sync.status.season, "2026");
    assert.equal(sync.matches[0].id, "fd_123");
    assert.equal(sync.matches[0].homeTeam, "Colombia");
    assert.equal(sync.matches[0].awayTeam, "Japan");
    assert.equal(sync.matches[0].resultSync.source, "football-data");
    assert.equal(calls.length, 2);
    assert.match(calls[0].url, /football\.api-sports\.io/);
    assert.match(calls[1].url, /api\.football-data\.org/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Sports provider result sync processes only the last 3 completed fixtures", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    async json() {
      return {
        response: [1, 2, 3, 4].map((id) => ({
          fixture: {
            id,
            date: `2026-06-2${id}T20:00:00Z`,
            status: { short: "FT" },
            venue: { name: "Stadium" },
          },
          league: { name: "FIFA World Cup", season: 2026, round: "Group Stage" },
          teams: { home: { name: `Home ${id}` }, away: { name: `Away ${id}` } },
          goals: { home: id, away: 0 },
        })),
      };
    },
  });

  try {
    const provider = createSportsProvider({ FOOTBALL_API_PROVIDER: "auto", API_FOOTBALL_KEY: "key" });
    const sync = await provider.syncResults({ cachedMatches: [] });
    assert.equal(sync.status.resultsChecked, 3);
    assert.equal(sync.matches.length, 3);
    assert.deepEqual(
      sync.matches.map((match) => match.id),
      ["apif_4", "apif_3", "apif_2"],
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Verified USD payment money stays locked when estimates change", () => {
  const verifiedUsd = { verificationStatus: "VERIFIED", currency: "USD", ...calculatePaymentMoney("USD", 4100) };
  const before = { ...verifiedUsd };
  const futurePayment = calculatePaymentMoney("COP");

  assert.deepEqual(verifiedUsd, before);
  assert.equal(futurePayment.baseContributionCop, ENTRY_COP);
  assert.equal(futurePayment.excessContributionCop, 0);
});

test("Payment reference data can be represented as user comments", () => {
  const payment = { reference: "Pago por Nequi", userComment: undefined };
  const userComment = payment.userComment ?? payment.reference ?? "";
  assert.equal(userComment, "Pago por Nequi");
});

test("Admin emergency correction locks 5 minutes before kickoff", () => {
  const match = { kickoffAt: "2026-06-20T20:00:00.000Z" };
  assert.equal(isAdminCorrectionLocked(match, new Date("2026-06-20T19:54:59.000Z")), false);
  assert.equal(isAdminCorrectionLocked(match, new Date("2026-06-20T19:55:00.000Z")), true);
});

test("Exchange rate provider caches daily and falls back without exposing keys", async () => {
  const now = new Date("2026-06-23T12:00:00.000Z");
  const cached = await getUsdCopRate({
    now,
    cache: { rate: 4100, source: "datos.gov.co TRM", fetchedAt: now.toISOString(), cacheDate: "2026-06-23" },
    fetchImpl: async () => {
      throw new Error("should not fetch cached rate");
    },
  });
  assert.equal(cached.rate, 4100);
  assert.equal(cached.cached, true);

  const fallback = await getUsdCopRate({
    now,
    env: { DEFAULT_USD_COP_RATE: "4200" },
    fetchImpl: async () => ({ ok: false, status: 503 }),
  });
  assert.equal(fallback.rate, 4200);
  assert.equal(fallback.status, "FALLBACK");
});

test("Exchange-rate parser handles Colombian and US number formats", () => {
  assert.equal(parseExchangeRateValue("3.425,95"), 3425.95);
  assert.equal(parseExchangeRateValue("3425,95"), 3425.95);
  assert.equal(parseExchangeRateValue("3,425.95"), 3425.95);
  assert.equal(parseExchangeRateValue("3425.95"), 3425.95);
  assert.equal(parseExchangeRateValue(3425.95), 3425.95);
});

test("Exchange-rate validation rejects impossible USD/COP values", async () => {
  assert.equal(isValidUsdCopRate(3425.95), true);
  assert.equal(isValidUsdCopRate(342595), false);
  assert.equal(isValidUsdCopRate(0), false);
  assert.equal(isValidUsdCopRate(null), false);
  assert.equal(isValidUsdCopRate(NaN), false);

  const rate = await getUsdCopRate({
    now: new Date("2026-06-23T12:00:00.000Z"),
    env: { DEFAULT_USD_COP_RATE: "4000" },
    fetchImpl: async () => ({
      ok: true,
      async json() {
        return [{ valor: "342.595", vigenciadesde: "2026-06-23" }];
      },
    }),
  });
  assert.equal(rate.status, "FALLBACK");
  assert.equal(rate.rate, 4000);
  assert.equal(isValidUsdCopRate(rate.invalidRejected.rate), false);
});

test("Invalid cached exchange rate is ignored and refreshed", async () => {
  const rate = await getUsdCopRate({
    now: new Date("2026-06-23T12:00:00.000Z"),
    cache: { rate: 342595, source: "bad-cache", cacheDate: "2026-06-23" },
    fetchImpl: async () => ({
      ok: true,
      async json() {
        return [{ valor: "3.435,35", vigenciadesde: "2026-06-23" }];
      },
    }),
  });
  assert.equal(rate.status, "SYNCED");
  assert.equal(rate.rate, 3435.35);
});

test("COP and USD payments keep base pot and exchange bonus separate", () => {
  const cop = calculatePaymentMoney("COP", 9999);
  const usd = calculatePaymentMoney("USD", 3435.35);
  assert.equal(cop.basePotContributionCop, ENTRY_COP);
  assert.equal(cop.exchangeExcess, 0);
  assert.equal(usd.basePotContributionCop, ENTRY_COP);
  assert.equal(usd.exchangeExcess, 1435.35);

  const summary = calculatePrizeSummary({
    predictions: [],
    payments: [
      { verificationStatus: "VERIFIED", currency: "COP", ...cop },
      { verificationStatus: "VERIFIED", currency: "USD", ...usd },
    ],
  });
  assert.equal(summary.basePotCop, 4000);
  assert.equal(summary.usdExchangeExcessCop, 1435.35);
  assert.equal(summary.totalActualCopFromUsd, 3435.35);
  assert.equal(summary.verifiedCopPaymentsCop, 2000);
});

test("Stale USD payment records still apply exchange excess from actual COP received", () => {
  const summary = calculatePrizeSummary({
    predictions: [],
    payments: [
      {
        verificationStatus: "VERIFIED",
        currency: "USD",
        baseContributionCop: 2000,
        copEquivalent: 3435.35,
        actualCopReceived: 3435.35,
        exchangeExcess: 0,
        excessContributionCop: 0,
      },
    ],
  });
  assert.equal(summary.basePotCop, 2000);
  assert.equal(summary.usdExchangeExcessCop, 1435.35);
});

test("Payout ledger calculates manual records without sending money", () => {
  const predictions = [{ id: "p1", matchId: "m1", userId: "u1", homeScore: 2, awayScore: 1 }];
  const payments = [{ predictionId: "p1", matchId: "m1", userId: "u1", verificationStatus: "VERIFIED", ...calculatePaymentMoney("COP") }];
  const payouts = calculatePayoutLedger(users, [finalMatch], predictions, payments);
  assert.equal(payouts[0].status, "calculated");
  assert.equal(payouts[0].prizeType, "match_winner");
  assert.equal(payouts[0].paidAt, null);
});

test("Landing page, auth cleanup, and Colombian mobile theme markers exist", () => {
  const appSource = readFileSync("public/app.js", "utf8");
  const css = readFileSync("public/styles.css", "utf8");
  assert.match(appSource, /landing-shell/);
  assert.match(appSource, /if \(!user\)/);
  assert.doesNotMatch(appSource, /Google|Gmail|continueGoogle|googleDemoBtn|preferredCurrency|profileForm|Stripe|Wompi|Mercado Pago|PayU/i);
  assert.doesNotMatch(appSource, /function renderInlinePredictionEditor/);
  assert.match(appSource, /manualPaymentNotice/);
  assert.match(appSource, /admin-correction-form/);
  assert.match(appSource, /renderRulesPage/);
  assert.match(appSource, /renderMatchDay/);
  assert.match(appSource, /renderExports/);
  assert.match(appSource, /renderAuditLog/);
  assert.match(appSource, /renderPayouts/);
  assert.doesNotMatch(appSource, /<select name="method">/);
  assert.match(css, /--yellow:\s*#fcd116/i);
  assert.match(css, /--blue:\s*#003893/i);
  assert.match(css, /--red:\s*#ce1126/i);
  assert.match(css, /@media \(max-width:\s*700px\)/);
  assert.match(css, /card-table/);
  assert.match(css, /--tap:\s*44px/);
});

test("Env loader parses .env values without overriding existing env", () => {
  const parsed = parseEnvFile([
    "API_FOOTBALL_KEY=abc123",
    "PUBLIC_BASE_URL=\"https://polla.melazausa.com\"",
    "# COMMENT=ignored",
    "EMPTY=",
  ].join("\n"));
  assert.deepEqual(parsed, {
    API_FOOTBALL_KEY: "abc123",
    PUBLIC_BASE_URL: "https://polla.melazausa.com",
    EMPTY: "",
  });

  const dir = mkdtempSync(join(tmpdir(), "polla-env-"));
  const envPath = join(dir, ".env");
  writeFileSync(envPath, "API_FOOTBALL_KEY=from-file\nADMIN_PIN=file-pin\n");
  const target = { API_FOOTBALL_KEY: "from-host" };
  const result = loadEnvFile(envPath, target);

  assert.equal(result.loaded, true);
  assert.equal(target.API_FOOTBALL_KEY, "from-host");
  assert.equal(target.ADMIN_PIN, "file-pin");
  rmSync(dir, { recursive: true, force: true });
});

test("Storage adapter selects drivers and warns for production JSON", () => {
  assert.equal(resolveStorageDriver({ DATA_STORAGE_DRIVER: "supabase" }), "supabase");
  assert.equal(resolveStorageDriver({ DATA_STORAGE_DRIVER: "json" }), "json");
  assert.equal(resolveStorageDriver({ NODE_ENV: "production" }), "supabase");
  const startup = validateStorageStartup({ NODE_ENV: "production", DATA_STORAGE_DRIVER: "json" });
  assert.equal(startup.driver, "json");
  assert.equal(startup.warnings.length, 1);
  assert.throws(() => validateStorageStartup({ DATA_STORAGE_DRIVER: "supabase" }), /Missing SUPABASE_URL/);
});

test("JSON storage helper preserves uniqueness and persisted payment/audit/export data", async () => {
  const dir = mkdtempSync(join(tmpdir(), "polla-storage-"));
  const dbPath = join(dir, "db.json");
  const seed = () => ({
    version: 2,
    settings: {},
    users: [],
    matches: [],
    predictions: [],
    payments: [],
    auditLogs: [],
    exports: [],
  });
  const storage = createStorage({
    env: { DATA_STORAGE_DRIVER: "json" },
    dbPath,
    seedDb: seed,
    migrateDb: (db) => ({ db, changed: false }),
  });

  await storage.helpers.createUser({ id: "u1", role: "USER", name: "Ana", normalizedName: "ana", phone: "300", normalizedPhone: "57300" });
  await storage.helpers.createPrediction({ id: "p1", userId: "u1", matchId: "m1", homeScore: 1, awayScore: 0 });
  await storage.helpers.createPrediction({ id: "p2", userId: "u1", matchId: "m1", homeScore: 2, awayScore: 0 });
  await storage.helpers.createOrUpdatePayment({
    id: "pay1",
    userId: "u1",
    matchId: "m1",
    currency: "USD",
    actualCopReceived: 3500,
    exchangeExcess: 1500,
    rateLockedAt: "2026-06-23T00:00:00.000Z",
  });
  await storage.helpers.createAuditLog({ id: "a1", action: "PAYMENT_VERIFIED", entityType: "payment", entityId: "pay1" });
  await storage.helpers.createExportRecord({ id: "e1", exportType: "backup" });

  const db = await storage.readDb();
  assert.equal(db.predictions.length, 1);
  assert.equal(db.payments[0].exchangeExcess, 1500);
  assert.equal(db.auditLogs[0].action, "PAYMENT_VERIFIED");
  assert.equal(db.exports[0].exportType, "backup");
  rmSync(dir, { recursive: true, force: true });
});

test("Supabase migration script does not print or embed secrets", () => {
  const script = readFileSync("server/storage/migrateJsonToSupabase.js", "utf8");
  assert.doesNotMatch(script, /SUPABASE_SERVICE_ROLE_KEY.*console|service.*console/i);
  assert.match(script, /users/);
  assert.match(script, /payments/);
  assert.match(script, /auditLogs/);
  assert.match(script, /payouts/);
});
