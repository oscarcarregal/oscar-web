import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const PRESUPUESTOS_PATH = path.join(process.cwd(), "data", "presupuestos.json");

interface StoredPresupuesto {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  servicio: string;
  descripcion: string;
  fecha: string;
  estado: "nuevo" | "contactado" | "cerrado";
}

function sanitizeString(str: unknown, maxLen = 2000): string {
  if (typeof str !== "string") return "";
  return str.slice(0, maxLen).trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const nombre = sanitizeString(body.nombre, 200);
    const telefono = sanitizeString(body.telefono, 30);
    const email = sanitizeString(body.email, 200);
    const servicio = sanitizeString(body.servicio, 100);
    const descripcion = sanitizeString(body.descripcion, 5000);

    if (!nombre || !telefono || !servicio || !descripcion) {
      return NextResponse.json(
        { error: "Campos obligatorios incompletos" },
        { status: 400 }
      );
    }

    const presupuesto: StoredPresupuesto = {
      id: crypto.randomUUID(),
      nombre,
      telefono,
      email,
      servicio,
      descripcion,
      fecha: new Date().toISOString(),
      estado: "nuevo",
    };

    // Read existing
    let data: StoredPresupuesto[] = [];
    try {
      const raw = await fs.readFile(PRESUPUESTOS_PATH, "utf-8");
      data = JSON.parse(raw);
    } catch {
      // File doesn't exist yet
    }

    // Prepend (newest first)
    data.unshift(presupuesto);

    // Ensure data directory exists
    await fs.mkdir(path.dirname(PRESUPUESTOS_PATH), { recursive: true });
    await fs.writeFile(PRESUPUESTOS_PATH, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json({ success: true, id: presupuesto.id });
  } catch {
    return NextResponse.json({ error: "Error guardando solicitud" }, { status: 500 });
  }
}
