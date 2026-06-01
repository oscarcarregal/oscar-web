/* Rutas API para listar y crear reformas (lectura/escritura en reformas.json) */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeId, NO_STORE_HEADERS } from "@/app/lib/admin-auth";
import { redis } from "@/app/lib/redis";



function sanitizeStr(val: unknown, max: number): string {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, max);
}

function sanitizeTags(val: unknown, maxItems = 20, maxLen = 60): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((t) => typeof t === "string")
    .map((t) => (t as string).trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}


interface ReformaEntry {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: string[];
}

function createSlugBase(...parts: string[]): string {
  const joined = parts
    .join("-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const slug = joined
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "reforma";
}

async function generateUniqueReformaId(title: string): Promise<string> {
  const base = createSlugBase(title);
  const reformas = await readReformas();
  const existingIds = new Set(reformas.map(r => r.id));

  for (let i = 0; i < 8; i += 1) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 6);
    const candidate = sanitizeId(`${base}-${timestamp}-${random}`);

    if (candidate && !existingIds.has(candidate)) {
      return candidate;
    }
  }

  const fallback = sanitizeId(`reforma-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
  if (!fallback) {
    throw new Error("No se pudo generar un ID válido");
  }
  return fallback;
}

/* Lee el array de reformas del fichero centralizado (Redis) */
async function readReformas(): Promise<ReformaEntry[]> {
  try {
    let data = await redis.get<ReformaEntry[]>("reformas");
    if (!data) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/reformas.json`);
      if (res.ok) data = await res.json();
    }
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/* Escribe el array completo de reformas */
async function writeReformas(reformas: ReformaEntry[]): Promise<void> {
  await redis.set("reformas", reformas);
}

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const reformas = await readReformas();
    return NextResponse.json(reformas);
  } catch {
    return NextResponse.json({ error: "Error leyendo reformas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const title = sanitizeStr(body.title, 200) || "Nueva Reforma";
    const description = sanitizeStr(body.description, 5000);
    const tags = sanitizeTags(body.tags);

    const safeId = await generateUniqueReformaId(title);

    // Añadir entrada al fichero centralizado
    const reformas = await readReformas();
    reformas.push({
      id: safeId,
      title,
      description,
      tags,
      images: [],
    });
    await writeReformas(reformas);

    return NextResponse.json({ success: true, id: safeId });
  } catch {
    return NextResponse.json({ error: "Error creando reforma" }, { status: 500 });
  }
}
