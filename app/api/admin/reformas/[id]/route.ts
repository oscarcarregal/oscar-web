/* Rutas API para obtener, actualizar y eliminar una reforma individual */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeId } from "@/app/lib/admin-auth";
import fs from "fs/promises";
import path from "path";

const REFORMAS_DIR = path.join(process.cwd(), "public", "reformas");
const REFORMAS_PATH = path.join(process.cwd(), "public", "reformas.json");
const CONFIG_PATH = path.join(process.cwd(), "public", "config.json");

interface ReformaEntry {
  id: string;
  title: string;
  location: string;
  description: string;
  tags: string[];
  images: string[];
}

async function readReformas(): Promise<ReformaEntry[]> {
  try {
    const raw = await fs.readFile(REFORMAS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeReformas(reformas: ReformaEntry[]): Promise<void> {
  await fs.writeFile(REFORMAS_PATH, JSON.stringify(reformas, null, 2), "utf-8");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const safeId = sanitizeId(id);
  if (!safeId) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const reformas = await readReformas();
    const reforma = reformas.find((r) => r.id === safeId);
    if (!reforma) {
      return NextResponse.json({ error: "Reforma no encontrada" }, { status: 404 });
    }
    return NextResponse.json(reforma);
  } catch {
    return NextResponse.json({ error: "Error leyendo reforma" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const safeId = sanitizeId(id);
  if (!safeId) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const { title, location, description, tags, images } = await req.json();
    const reformas = await readReformas();
    const index = reformas.findIndex((r) => r.id === safeId);

    if (index === -1) {
      return NextResponse.json({ error: "Reforma no encontrada" }, { status: 404 });
    }

    const existing = reformas[index];
    reformas[index] = {
      id: safeId,
      title: title ?? existing.title,
      location: location ?? existing.location,
      description: description ?? existing.description,
      tags: tags ?? existing.tags,
      images: images ?? existing.images,
    };

    await writeReformas(reformas);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error actualizando" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const safeId = sanitizeId(id);
  if (!safeId) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    // Eliminar del fichero centralizado de reformas
    const reformas = await readReformas();
    const updated = reformas.filter((r) => r.id !== safeId);
    await writeReformas(updated);

    // Limpiar referencias en config.json (featured y carousel)
    const configRaw = await fs.readFile(CONFIG_PATH, "utf-8");
    const config = JSON.parse(configRaw);
    config.featuredReformas = config.featuredReformas.filter((r: string) => r !== safeId);
    config.heroCarousel = config.heroCarousel.filter(
      (s: { reforma: string }) => s.reforma !== safeId
    );
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");

    // Eliminar directorio de imágenes
    const reformaDir = path.join(REFORMAS_DIR, safeId);
    await fs.rm(reformaDir, { recursive: true, force: true });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error eliminando" }, { status: 500 });
  }
}
