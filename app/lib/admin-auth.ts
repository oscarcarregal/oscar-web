import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const COOKIE_NAME = "admin_session";
const SESSION_TTL = 10 * 60 * 1000; // 10 minutes
const ATTEMPT_TTL = 30 * 60 * 1000; // 30 minutes
export const NO_STORE_HEADERS = Object.freeze({
  "Cache-Control": "no-store, max-age=0",
});

/* ─── Rate Limiter (in-memory) ─── */

const attempts = new Map<
  string,
  { count: number; blockedUntil: number; lastSeen: number }
>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

function normalizeIp(ip: string): string {
  const candidate = ip.trim();
  if (!candidate) return "unknown";

  if (candidate === "::1") return "127.0.0.1";
  if (candidate.startsWith("::ffff:")) return candidate.slice(7);

  return candidate;
}

export function getClientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0] ?? "";
    return normalizeIp(firstIp);
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return normalizeIp(realIp);
  }

  return "unknown";
}

function purgeAttempts(now: number): void {
  for (const [ip, record] of attempts.entries()) {
    const expired =
      (record.blockedUntil > 0 && record.blockedUntil <= now) ||
      now - record.lastSeen > ATTEMPT_TTL;
    if (expired) {
      attempts.delete(ip);
    }
  }
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  purgeAttempts(now);

  const record = attempts.get(ip);

  if (record && record.blockedUntil > now) {
    return { allowed: false, remaining: 0 };
  }

  if (record && record.blockedUntil <= now && record.count >= MAX_ATTEMPTS) {
    attempts.delete(ip);
  }

  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - (record?.count ?? 0),
  };
}

export function recordFailedAttempt(ip: string): void {
  const record = attempts.get(ip) ?? { count: 0, blockedUntil: 0, lastSeen: Date.now() };
  record.count += 1;
  record.lastSeen = Date.now();
  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = Date.now() + BLOCK_DURATION;
  }
  attempts.set(ip, record);
}

export function clearAttempts(ip: string): void {
  attempts.delete(ip);
}

/* ─── Password Verification ─── */

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

/* ─── Revoked Tokens (in-memory) ─── */

const revokedTokens = new Set<string>();

export function revokeToken(token: string): void {
  revokedTokens.add(token);
  // Auto-cleanup after TTL to prevent memory leaks
  setTimeout(() => revokedTokens.delete(token), SESSION_TTL);
}

/* ─── Session Token ─── */

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET not set");
  return secret;
}

function signToken(payload: string): string {
  const hmac = crypto.createHmac("sha256", getSecret());
  hmac.update(payload);
  return hmac.digest("hex");
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_TTL;
  const payload = `admin:${expires}`;
  const signature = signToken(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): boolean {
  let decodedToken = token;
  try {
    decodedToken = decodeURIComponent(token);
  } catch {
    return false;
  }

  // Check if token has been revoked
  if (revokedTokens.has(decodedToken)) return false;

  const parts = decodedToken.split(".");
  if (parts.length !== 2) return false;

  const payload = parts[0];
  const signature = parts[1];
  const expectedSignature = signToken(payload);

  // Constant-time comparison
  if (signature.length !== expectedSignature.length) return false;
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expectedSignature, "hex");
  if (a.length !== b.length) return false;
  if (!crypto.timingSafeEqual(a, b)) return false;

  // Check expiry
  const payloadParts = payload.split(":");
  if (payloadParts.length !== 2 || payloadParts[0] !== "admin") return false;
  const expires = parseInt(payloadParts[1], 10);
  if (isNaN(expires) || Date.now() > expires) return false;

  return true;
}

/* ─── Cookie Helpers ─── */

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL / 1000,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

/* ─── Request Auth Guard ─── */

export async function requireAuth(): Promise<boolean> {
  return getSession();
}

/* ─── Path Safety ─── */

export function sanitizeId(id: string): string | null {
  // Only allow alphanumeric + hyphens + underscores
  if (/^[a-zA-Z0-9_-]+$/.test(id)) return id;
  return null;
}
