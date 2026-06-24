import { createHash, randomBytes } from "node:crypto";

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function normalizePhone(phone) {
  const raw = String(phone || "").trim();
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length === 10) return `57${digits}`;
  if (digits.length === 12 && digits.startsWith("57")) return digits;
  return digits;
}

export function normalizeName(name) {
  return String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function publicUser(user) {
  if (!user) return null;
  const { id, role, name, phone, paidStatus, language, createdAt, updatedAt, lastLoginAt } = user;
  return { id, role, name, phone, paidStatus, language, createdAt, updatedAt, lastLoginAt };
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token, secret = "") {
  return createHash("sha256").update(`${secret}:${token}`).digest("hex");
}

export function createSession({ userId, role, secret, now = new Date() }) {
  const token = createSessionToken();
  return {
    token,
    record: {
      id: `session_${Date.now()}_${randomBytes(4).toString("hex")}`,
      userId,
      role,
      tokenHash: hashSessionToken(token, secret),
      createdAt: now.toISOString(),
      lastSeenAt: now.toISOString(),
    },
  };
}

export function findSessionUser(db, token, secret) {
  if (!token) return null;
  const tokenHash = hashSessionToken(token, secret);
  const session = (db.sessions || []).find((item) => item.tokenHash === tokenHash);
  if (!session) return null;
  return db.users.find((user) => user.id === session.userId) || null;
}

export function validateRegistrationInput(body) {
  const name = String(body.name || "").trim().replace(/\s+/g, " ");
  const phone = String(body.phone || "").trim();
  const language = body.language === "en" ? "en" : "es";

  if (!name || !phone) {
    return { ok: false, error: "NAME_PHONE_REQUIRED" };
  }

  return {
    ok: true,
    value: {
      name,
      phone,
      normalizedName: normalizeName(name),
      normalizedPhone: normalizePhone(phone),
      language,
    },
  };
}

export function findIdentityMatches(users, identity) {
  return users.filter((user) => {
    if (user.role !== "USER") return false;
    return user.normalizedPhone === identity.normalizedPhone || user.normalizedName === identity.normalizedName;
  });
}
