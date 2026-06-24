import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadEnvFile } from "../../lib/env.js";
import { createSupabaseStorage } from "./supabaseStorage.js";

loadEnvFile();

function validateDb(db) {
  if (!db || typeof db !== "object") throw new Error("data/db.json must contain an object.");
  for (const key of ["users", "matches", "predictions", "payments"]) {
    if (!Array.isArray(db[key])) throw new Error(`data/db.json is missing array: ${key}`);
  }
}

function dedupeUsersByPhone(users) {
  const byPhone = new Map();
  for (const user of users) {
    const key = user.normalizedPhone || user.phone || user.id;
    if (!byPhone.has(key)) byPhone.set(key, user);
  }
  return [...byPhone.values()];
}

async function main() {
  const dbPath = resolve("data/db.json");
  const db = JSON.parse(await readFile(dbPath, "utf8"));
  validateDb(db);
  const imported = {
    ...db,
    users: dedupeUsersByPhone(db.users || []),
  };
  const storage = createSupabaseStorage({
    env: process.env,
    seedDb: () => imported,
    migrateDb: (value) => ({ db: value, changed: false }),
  });
  await storage.writeDb(imported);
  console.log(
    JSON.stringify({
      ok: true,
      imported: {
        users: imported.users.length,
        matches: imported.matches.length,
        predictions: imported.predictions.length,
        payments: imported.payments.length,
        exchangeRates: imported.exchangeRate ? 1 : 0,
        auditLogs: imported.auditLogs?.length || 0,
        payouts: imported.payouts?.length || 0,
      },
    }),
  );
}

main().catch((error) => {
  console.error(`Migration failed: ${error.message}`);
  process.exit(1);
});
