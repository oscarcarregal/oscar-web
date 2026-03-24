import { NextRequest, NextResponse } from "next/server";
import { requireAuth, NO_STORE_HEADERS } from "@/app/lib/admin-auth";
import { sanitizeConfigPayload } from "@/app/lib/config-security";
import fs from "fs/promises";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "public", "config.json");

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const data = await fs.readFile(CONFIG_PATH, "utf-8");
    return NextResponse.json(JSON.parse(data), { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Error leyendo config" },
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

    await fs.writeFile(CONFIG_PATH, JSON.stringify(validation.data, null, 2), "utf-8");
    return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Error guardando config" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
