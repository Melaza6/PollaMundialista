import { loadEnvFile } from "../../lib/env.js";
import { assertSupabaseConfig, createSupabaseStorage } from "./supabaseStorage.js";

loadEnvFile();

async function main() {
  assertSupabaseConfig(process.env);
  const storage = createSupabaseStorage({
    env: process.env,
    seedDb: () => ({ version: 2, settings: {}, users: [], matches: [], predictions: [], payments: [] }),
    migrateDb: (db) => ({ db, changed: false }),
  });
  const check = await storage.checkConnection();
  console.log(JSON.stringify({ ok: true, driver: "supabase", checkedTables: check.tables.length }));
}

main().catch((error) => {
  console.error(`Supabase check failed: ${error.message}`);
  process.exit(1);
});
