import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassword,
  createSessionToken,
  setSessionCookie,
  checkRateLimit,
  recordFailedAttempt,
  clearAttempts,
  getClientIpFromHeaders,
  NO_STORE_HEADERS,
} from "@/app/lib/admin-auth";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { error: "Formato no soportado" },
      { status: 415, headers: NO_STORE_HEADERS }
    );
  }

  const ip = getClientIpFromHeaders(req.headers);

  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera 15 minutos." },
      { status: 429, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const { password } = await req.json();

    if (!password || typeof password !== "string" || password.length > 256) {
      return NextResponse.json(
        { error: "Contraseña requerida" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const valid = await verifyPassword(password);

    if (!valid) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    clearAttempts(ip);
    const token = createSessionToken();
    await setSessionCookie(token);

    return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
