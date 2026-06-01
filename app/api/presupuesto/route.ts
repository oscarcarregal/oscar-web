import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getClientIpFromHeaders } from "@/app/lib/admin-auth";
import { redis } from "@/app/lib/redis";
import { sendNotificationEmail } from "@/app/lib/email";



// Rate limit independiente del de login: máx 5 presupuestos por IP cada 10 min
const PRESUP_MAX = 5;
const PRESUP_WINDOW_SEC = 10 * 60; // 10 minutos en segundos

async function checkPresupuestoLimit(ip: string): Promise<boolean> {
  const key = `rl:presupuesto:${ip}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, PRESUP_WINDOW_SEC);
  }

  return count <= PRESUP_MAX;
}

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

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string) {
  const digits = String(phone).replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

export async function POST(req: NextRequest) {
  // Comprobación de rate limit por IP
  const ip = getClientIpFromHeaders(req.headers);
  const allowed = await checkPresupuestoLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Inténtalo de nuevo en unos minutos." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    const nombre = sanitizeString(body.nombre, 200);
    const telefono = sanitizeString(body.telefono, 30);
    const email = sanitizeString(body.email, 200);
    const servicio = sanitizeString(body.servicio, 100);
    const descripcion = sanitizeString(body.descripcion, 5000);

    // At least one contact method required (telefono o email)
    const fieldErrors: Record<string, string> = {};
    if (!nombre || !servicio || !descripcion) {
      return NextResponse.json(
        { error: "Campos obligatorios incompletos" },
        { status: 400 }
      );
    }

    if (!telefono && !email) {
      fieldErrors.contacto = "Indica al menos un método de contacto: teléfono o email.";
    } else {
      if (telefono && !isValidPhone(telefono)) {
        fieldErrors.telefono = "El teléfono no tiene un formato válido.";
      }
      if (email && !isValidEmail(email)) {
        fieldErrors.email = "El email no tiene un formato válido.";
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json({ error: "Validación", fieldErrors }, { status: 400 });
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
    let data = await redis.get<StoredPresupuesto[]>("presupuestos") || [];
    if (!Array.isArray(data)) data = [];

    // Prepend (newest first)
    data.unshift(presupuesto);

    await redis.set("presupuestos", data);

    // Enviar notificación por email de forma asíncrona (no bloquea la respuesta al cliente)
    sendNotificationEmail({
      nombre,
      email,
      telefono,
      servicio,
      descripcion
    }).catch(() => {});

    return NextResponse.json({ success: true, id: presupuesto.id });
  } catch {
    return NextResponse.json({ error: "Error guardando solicitud" }, { status: 500 });
  }
}
