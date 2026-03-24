/* Rutas API para listar y crear reformas (lectura/escritura en reformas.json) */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeId } from "@/app/lib/admin-auth";
import fs from "fs/promises";
import path from "path";

const REFORMAS_DIR = path.join(process.cwd(), "public", "reformas");
const REFORMAS_PATH = path.join(process.cwd(), "public", "reformas.json");

interface ReformaEntry {
  id: string;
  title: string;
  location: string;
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

async function generateUniqueReformaId(title: string, location: string): Promise<string> {
  const base = createSlugBase(title, location);

  for (let i = 0; i < 8; i += 1) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 6);
    const candidate = sanitizeId(`${base}-${timestamp}-${random}`);

    if (!candidate) continue;

    try {
      await fs.access(path.join(REFORMAS_DIR, candidate));
    } catch {
      return candidate;
    }
  }

  const fallback = sanitizeId(`reforma-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
  if (!fallback) {
    throw new Error("No se pudo generar un ID válido");
  }
  return fallback;
}

/* Lee el array de reformas del fichero centralizado */
async function readReformas(): Promise<ReformaEntry[]> {
  try {
    const raw = await fs.readFile(REFORMAS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/* Escribe el array completo de reformas */
async function writeReformas(reformas: ReformaEntry[]): Promise<void> {
  await fs.writeFile(REFORMAS_PATH, JSON.stringify(reformas, null, 2), "utf-8");
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
    const { title, location, description, tags } = await req.json();

    const safeId = await generateUniqueReformaId(title || "", location || "");

    // Crear directorio para las imágenes
    await fs.mkdir(path.join(REFORMAS_DIR, safeId), { recursive: true });

    // Añadir entrada al fichero centralizado
    const reformas = await readReformas();
    reformas.push({
      id: safeId,
      title: title || "Nueva Reforma",
      location: location || "",
      description: description || "",
      tags: tags || [],
      images: [],
    });
    await writeReformas(reformas);

    return NextResponse.json({ success: true, id: safeId });
  } catch {
    return NextResponse.json({ error: "Error creando reforma" }, { status: 500 });
  }
}
