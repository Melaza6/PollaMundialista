import { copyFile, mkdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export function createJsonStorage({ dbPath, seedDb, migrateDb }) {
  async function ensureDb() {
    await mkdir(dirname(dbPath), { recursive: true });
    try {
      await stat(dbPath);
    } catch {
      await writeDb(seedDb());
    }
  }

  async function readDb() {
    await ensureDb();
    const db = JSON.parse(await readFile(dbPath, "utf8"));
    const migrated = migrateDb(db);
    if (migrated.changed) await writeDb(migrated.db);
    return migrated.db;
  }

  async function writeDb(db) {
    await mkdir(dirname(dbPath), { recursive: true });
    try {
      await stat(dbPath);
      await copyFile(dbPath, join(dirname(dbPath), `db.backup-${Date.now()}.json`));
    } catch {
      // First write has no previous database to back up.
    }
    const tmpPath = join(dirname(dbPath), `db.${Date.now()}.tmp`);
    await writeFile(tmpPath, JSON.stringify(db, null, 2));
    try {
      await rename(tmpPath, dbPath);
    } catch (error) {
      if (error.code !== "EPERM" && error.code !== "EACCES") throw error;
      await copyFile(tmpPath, dbPath);
      try {
        await unlink(tmpPath);
      } catch {
        // OneDrive can keep temp files locked briefly; cleanup is best-effort.
      }
    }
  }

  return {
    driver: "json",
    label: "Local JSON",
    readDb,
    writeDb,
  };
}
