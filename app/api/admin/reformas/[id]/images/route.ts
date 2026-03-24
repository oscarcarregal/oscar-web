/* Rutas API para subir y eliminar imágenes de una reforma */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeId } from "@/app/lib/admin-auth";
import fs from "fs/promises";
import path from "path";

const REFORMAS_DIR = path.join(process.cwd(), "public", "reformas");
const REFORMAS_PATH = path.join(process.cwd(), "public", "reformas.json");

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

export async function POST(
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
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No se enviaron imágenes" }, { status: 400 });
    }

    const reformaDir = path.join(REFORMAS_DIR, safeId);
    await fs.mkdir(reformaDir, { recursive: true });

    const savedFiles: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) continue;
      if (file.size > MAX_FILE_SIZE) continue;

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const safeName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = path.join(reformaDir, safeName);

      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      savedFiles.push(safeName);
    }

    // Actualizar el array de imágenes en reformas.json
    const reformas = await readReformas();
    const index = reformas.findIndex((r) => r.id === safeId);
    if (index !== -1) {
      reformas[index].images = [...reformas[index].images, ...savedFiles];
      await writeReformas(reformas);
    }

    return NextResponse.json({ success: true, files: savedFiles });
  } catch {
    return NextResponse.json({ error: "Error subiendo imágenes" }, { status: 500 });
  }
}

export async function DELETE(
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
    const { filename } = await req.json();
    if (!filename || typeof filename !== "string") {
      return NextResponse.json({ error: "Nombre de archivo requerido" }, { status: 400 });
    }

    // Eliminar fichero del disco
    const safeName = path.basename(filename);
    const filePath = path.join(REFORMAS_DIR, safeId, safeName);
    await fs.unlink(filePath);

    // Actualizar reformas.json
    const reformas = await readReformas();
    const index = reformas.findIndex((r) => r.id === safeId);
    if (index !== -1) {
      reformas[index].images = reformas[index].images.filter((img) => img !== safeName);
      await writeReformas(reformas);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error eliminando imagen" }, { status: 500 });
  }
}
