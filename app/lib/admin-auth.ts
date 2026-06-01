import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Redis } from "@upstash/redis";

const COOKIE_NAME = "admin_session";
const SESSION_TTL = 30 * 60 * 1000; // 30 minutos
const ATTEMPT_TTL = 30 * 60 * 1000; // 30 minutos
export const NO_STORE_HEADERS = Object.freeze({
  "Cache-Control": "no-store, max-age=0",
});

/* ─── Rate Limiter (Redis) ─── */

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60; // 15 minutes in seconds
const ATTEMPT_TTL_SEC = 30 * 60; // 30 minutes in seconds

export async function checkRateLimit(ip: string): Promise<{
  allowed: boolean;
  remaining: number;
}> {
  const redis = Redis.fromEnv();
  const key = `rl:login:${ip}`;
  const count = await redis.get<number>(key) || 0;

  if (count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }

  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - count,
  };
}

export async function recordFailedAttempt(ip: string): Promise<void> {
  const redis = Redis.fromEnv();
  const key = `rl:login:${ip}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, ATTEMPT_TTL_SEC);
  } else if (count >= MAX_ATTEMPTS) {
    await redis.expire(key, BLOCK_DURATION);
  }
}

export async function clearAttempts(ip: string): Promise<void> {
  const redis = Redis.fromEnv();
  await redis.del(`rl:login:${ip}`);
}

/* ─── Password Verification ─── */

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

/* ─── Revoked Tokens (Redis) ─── */

export async function revokeToken(token: string): Promise<void> {
  const redis = Redis.fromEnv();
  // El TTL de la cookie es SESSION_TTL (milisegundos)
  await redis.set(`revoked:${token}`, 1, { ex: Math.floor(SESSION_TTL / 1000) });
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

export async function verifySessionToken(token: string): Promise<boolean> {
  let decodedToken = token;
  try {
    decodedToken = decodeURIComponent(token);
  } catch {
    return false;
  }

  // Check if token has been revoked in Redis
  const redis = Redis.fromEnv();
  const isRevoked = await redis.exists(`revoked:${decodedToken}`);
  if (isRevoked) return false;

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
  return await verifySessionToken(token);
}

/* ─── Request Auth Guard ─── */

export async function requireAuth(): Promise<boolean> {
  return getSession();
}

/**
 * Renueva la cookie de sesión si el token actual es válido.
 * Llamar desde rutas API autenticadas para implementar sliding session.
 */
export async function renewSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token && await verifySessionToken(token)) {
    const newToken = createSessionToken();
    await setSessionCookie(newToken);
  }
}

/* ─── Path Safety ─── */

export function sanitizeId(id: string): string | null {
  // Only allow alphanumeric + hyphens + underscores
  if (/^[a-zA-Z0-9_-]+$/.test(id)) return id;
  return null;
}
