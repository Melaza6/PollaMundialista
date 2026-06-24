import { createJsonStorage } from "./jsonStorage.js";
import { assertSupabaseConfig, createSupabaseStorage } from "./supabaseStorage.js";

export function resolveStorageDriver(env = process.env) {
  if (env.DATA_STORAGE_DRIVER) return env.DATA_STORAGE_DRIVER;
  return env.NODE_ENV === "production" ? "supabase" : "json";
}

export function validateStorageStartup(env = process.env) {
  const driver = resolveStorageDriver(env);
  const warnings = [];
  if (env.NODE_ENV === "production" && driver === "json") {
    warnings.push("Warning: DATA_STORAGE_DRIVER=json is not recommended for production. Use Supabase with persistent Postgres storage.");
  }
  if (driver === "supabase") assertSupabaseConfig(env);
  if (!["json", "supabase"].includes(driver)) throw new Error(`Unsupported DATA_STORAGE_DRIVER: ${driver}`);
  return { driver, warnings };
}

function snapshotHelpers(storage) {
  async function read() {
    return storage.readDb();
  }
  async function write(db) {
    return storage.writeDb(db);
  }
  return {
    getUsers: async () => (await read()).users || [],
    getUserById: async (id) => (await read()).users?.find((user) => user.id === id) || null,
    findUserByNamePhone: async (normalizedName, normalizedPhone) =>
      (await read()).users?.find((user) => user.normalizedName === normalizedName && user.normalizedPhone === normalizedPhone) || null,
    createUser: async (user) => {
      const db = await read();
      db.users.push(user);
      await write(db);
      return user;
    },
    updateUser: async (id, updates) => {
      const db = await read();
      const user = db.users.find((item) => item.id === id);
      if (user) Object.assign(user, updates);
      await write(db);
      return user || null;
    },
    getMatches: async () => (await read()).matches || [],
    upsertMatches: async (matches) => {
      const db = await read();
      const byId = new Map((db.matches || []).map((match) => [match.id, match]));
      for (const match of matches) byId.set(match.id, { ...byId.get(match.id), ...match });
      db.matches = [...byId.values()];
      await write(db);
      return db.matches;
    },
    getNextMatches: async (limit) => (await read()).matches?.slice(0, limit) || [],
    getLastCompletedMatches: async (limit) => (await read()).matches?.filter((match) => match.result?.status === "FINAL").slice(-limit) || [],
    updateMatchResult: async (matchId, result) => {
      const db = await read();
      const match = db.matches.find((item) => item.id === matchId);
      if (match) match.result = result;
      await write(db);
      return match || null;
    },
    getPredictions: async () => (await read()).predictions || [],
    getPredictionsByMatch: async (matchId) => (await read()).predictions?.filter((prediction) => prediction.matchId === matchId) || [],
    createPrediction: async (prediction) => {
      const db = await read();
      if (!db.predictions.some((item) => item.userId === prediction.userId && item.matchId === prediction.matchId)) db.predictions.push(prediction);
      await write(db);
      return prediction;
    },
    updatePrediction: async (predictionId, updates) => {
      const db = await read();
      const prediction = db.predictions.find((item) => item.id === predictionId);
      if (prediction) Object.assign(prediction, updates);
      await write(db);
      return prediction || null;
    },
    getPayments: async () => (await read()).payments || [],
    getPaymentsByUser: async (userId) => (await read()).payments?.filter((payment) => payment.userId === userId) || [],
    createOrUpdatePayment: async (payment) => {
      const db = await read();
      const index = db.payments.findIndex((item) => item.id === payment.id);
      if (index === -1) db.payments.push(payment);
      else db.payments[index] = { ...db.payments[index], ...payment };
      await write(db);
      return payment;
    },
    verifyPayment: async (paymentId, adminId, values) => storage.helpers.createOrUpdatePayment({ id: paymentId, verifiedBy: adminId, ...values }),
    rejectPayment: async (paymentId, adminId, values) => storage.helpers.createOrUpdatePayment({ id: paymentId, rejectedBy: adminId, ...values }),
    getExchangeRates: async () => [(await read()).exchangeRate].filter(Boolean),
    saveExchangeRate: async (rate) => {
      const db = await read();
      db.exchangeRate = rate;
      await write(db);
      return rate;
    },
    getLatestValidExchangeRate: async () => (await read()).exchangeRate || null,
    createAuditLog: async (log) => {
      const db = await read();
      db.auditLogs ||= [];
      db.auditLogs.push(log);
      await write(db);
      return log;
    },
    getAuditLogs: async () => (await read()).auditLogs || [],
    createPredictionCorrection: async (correction) => {
      const db = await read();
      db.predictionCorrections ||= [];
      db.predictionCorrections.push(correction);
      await write(db);
      return correction;
    },
    getPredictionCorrections: async () => (await read()).predictionCorrections || [],
    getPayouts: async () => (await read()).payouts || [],
    upsertPayouts: async (payouts) => {
      const db = await read();
      db.payouts = payouts;
      await write(db);
      return payouts;
    },
    updatePayoutStatus: async (payoutId, updates) => {
      const db = await read();
      const payout = db.payouts?.find((item) => item.id === payoutId);
      if (payout) Object.assign(payout, updates);
      await write(db);
      return payout || null;
    },
    getAppSetting: async (key) => (await read()).settings?.[key],
    setAppSetting: async (key, value) => {
      const db = await read();
      db.settings ||= {};
      db.settings[key] = value;
      await write(db);
      return value;
    },
    createSyncLog: async (log) => {
      const db = await read();
      db.syncLogs ||= [];
      db.syncLogs.push(log);
      await write(db);
      return log;
    },
    updateSyncLog: async (id, updates) => {
      const db = await read();
      const log = db.syncLogs?.find((item) => item.id === id);
      if (log) Object.assign(log, updates);
      await write(db);
      return log || null;
    },
    createExportRecord: async (record) => {
      const db = await read();
      db.exports ||= [];
      db.exports.push(record);
      await write(db);
      return record;
    },
  };
}

export function createStorage(options) {
  let startup;
  try {
    startup = validateStorageStartup(options.env);
  } catch (error) {
    const driver = resolveStorageDriver(options.env);
    const storage = {
      driver,
      label: driver === "supabase" ? "Supabase" : "Storage unavailable",
      startupError: error,
      startupWarnings: [],
      readDb: async () => {
        throw Object.assign(new Error(error.message), {
          cause: error,
          storageDriver: driver,
          storageLabel: driver === "supabase" ? "Supabase" : "Storage unavailable",
        });
      },
      writeDb: async () => {
        throw Object.assign(new Error(error.message), {
          cause: error,
          storageDriver: driver,
          storageLabel: driver === "supabase" ? "Supabase" : "Storage unavailable",
        });
      },
    };
    storage.helpers = snapshotHelpers(storage);
    return storage;
  }
  const storage =
    startup.driver === "supabase"
      ? createSupabaseStorage(options)
      : createJsonStorage({ dbPath: options.dbPath, seedDb: options.seedDb, migrateDb: options.migrateDb });
  storage.startupWarnings = startup.warnings;
  storage.helpers = snapshotHelpers(storage);
  return storage;
}
