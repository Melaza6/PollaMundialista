import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export function parseEnvFile(text) {
  const values = {};
  for (const rawLine of String(text || "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (!key) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }
  return values;
}

export function loadEnvFile(filePath = ".env", target = process.env) {
  const resolved = resolve(filePath);
  if (!existsSync(resolved)) return { loaded: false, keys: [] };

  const values = parseEnvFile(readFileSync(resolved, "utf8"));
  const keys = [];
  for (const [key, value] of Object.entries(values)) {
    if (target[key] === undefined) {
      target[key] = value;
      keys.push(key);
    }
  }

  return { loaded: true, keys };
}
