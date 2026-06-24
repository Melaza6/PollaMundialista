import { DEFAULT_USD_COP_RECEIVED } from "../lib/rules.js";

const SOCRATA_TRM_URL =
  "https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciadesde%20DESC";
const MIN_USD_COP_RATE = 1000;
const MAX_USD_COP_RATE = 10000;

function todayKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function parseExchangeRateValue(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const cleaned = raw.replace(/[^\d.,-]/g, "");
  if (!cleaned || cleaned.startsWith("-")) return null;
  const comma = cleaned.lastIndexOf(",");
  const dot = cleaned.lastIndexOf(".");
  const decimalIndex = Math.max(comma, dot);
  let normalized;

  if (decimalIndex === -1) {
    normalized = cleaned;
  } else {
    const integerPart = cleaned.slice(0, decimalIndex).replace(/[.,]/g, "");
    const decimalPart = cleaned.slice(decimalIndex + 1).replace(/[.,]/g, "");
    normalized = decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isValidUsdCopRate(rate) {
  return Number.isFinite(rate) && rate >= MIN_USD_COP_RATE && rate <= MAX_USD_COP_RATE;
}

function validRateOrNull(value) {
  const parsed = parseExchangeRateValue(value);
  return isValidUsdCopRate(parsed) ? parsed : null;
}

function cachedForToday(cache, now = new Date()) {
  const rate = validRateOrNull(cache?.rate);
  if (!rate || cache.cacheDate !== todayKey(now)) return null;
  return {
    ...cache,
    rate,
    cached: true,
    status: "CACHED",
  };
}

export async function getUsdCopRate({ cache = null, env = process.env, now = new Date(), fetchImpl = globalThis.fetch } = {}) {
  const cached = cachedForToday(cache, now);
  if (cached) return cached;

  try {
    const response = await fetchImpl(SOCRATA_TRM_URL);
    if (!response.ok) throw new Error(`TRM request failed: ${response.status}`);
    const payload = await response.json();
    const row = Array.isArray(payload) ? payload[0] : null;
    const parsedRate = parseExchangeRateValue(row?.valor);
    if (!isValidUsdCopRate(parsedRate)) {
      throw Object.assign(new Error("TRM response did not include a valid USD/COP rate."), {
        invalidRate: parsedRate,
        invalidRawValue: row?.valor,
      });
    }
    return {
      rate: parsedRate,
      source: "datos.gov.co TRM",
      date: row?.vigenciadesde || todayKey(now),
      fetchedAt: now.toISOString(),
      cacheDate: todayKey(now),
      cached: false,
      status: "SYNCED",
    };
  } catch (error) {
    const fallbackRate = validRateOrNull(env.DEFAULT_USD_COP_RATE || env.DEFAULT_USD_COP_RECEIVED || DEFAULT_USD_COP_RECEIVED);
    const base = {
      source: "default-estimate",
      date: todayKey(now),
      fetchedAt: now.toISOString(),
      cacheDate: todayKey(now),
      cached: false,
      error: error.message,
      invalidRejected: error.invalidRate
        ? {
            rate: error.invalidRate,
            rawValue: error.invalidRawValue,
            source: "datos.gov.co TRM",
            rejectedAt: now.toISOString(),
          }
        : cache?.invalidRejected || null,
    };
    if (!fallbackRate) {
      return {
        ...base,
        rate: null,
        status: "UNAVAILABLE",
        message: "No valid USD/COP exchange rate is available.",
      };
    }
    return {
      ...base,
      rate: fallbackRate,
      status: "FALLBACK",
    };
  }
}
