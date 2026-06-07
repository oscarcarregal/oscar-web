import { NextRequest, NextResponse } from "next/server";
import { requireAuth, NO_STORE_HEADERS } from "@/app/lib/admin-auth";
import { sanitizeConfigPayload } from "@/app/lib/config-security";
import { redis } from "@/app/lib/redis";

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const data = await redis.get("site:config");
    return NextResponse.json(data, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Error leyendo configuración" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Formato no soportado" },
        { status: 415, headers: NO_STORE_HEADERS }
      );
    }

    const body = await req.json();
    const validation = sanitizeConfigPayload(body);
    if (!validation.ok || !validation.data) {
      return NextResponse.json(
        { error: validation.error || "Configuración inválida" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    await redis.set("site:config", validation.data);
    return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Error guardando config" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
