import { getBaseUrl } from "@/app/lib/base-url";
/* Rutas API para subir y eliminar imágenes de una reforma */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeId } from "@/app/lib/admin-auth";
import { redis } from "@/app/lib/redis";
import { put, del } from "@vercel/blob";



const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Valida los primeros bytes del buffer contra magic numbers conocidos.
 * Evita que un atacante suba un archivo renombrado como imagen.
 */
function isValidImageBuffer(buf: Buffer): boolean {
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return true;
  return false;
}

/** Extensión segura derivada del magic number, no del nombre de archivo */
function safeExtFromBuffer(buf: Buffer): string {
  if (buf[0] === 0xff && buf[1] === 0xd8) return "jpg";
  if (buf[0] === 0x89 && buf[1] === 0x50) return "png";
  if (buf[0] === 0x52 && buf[1] === 0x49) return "webp";
  return "jpg";
}

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
    let data = await redis.get<ReformaEntry[]>("reformas");
    if (!data) {
      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl}/reformas.json`);
      if (res.ok) data = await res.json();
    }
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeReformas(reformas: ReformaEntry[]): Promise<void> {
  await redis.set("reformas", reformas);
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

    // No necesitamos crear carpetas locales con Blob

    const savedFiles: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) continue;
      if (file.size > MAX_FILE_SIZE) continue;

      const buffer = Buffer.from(await file.arrayBuffer());

      // Validar magic number real del archivo
      if (!isValidImageBuffer(buffer)) continue;

      const ext = safeExtFromBuffer(buffer);
      const safeName = `reformas/${safeId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const blob = await put(safeName, buffer, { 
        access: 'public',
        contentType: file.type
      });
      
      savedFiles.push(blob.url);
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

    // Si es una URL de Blob, la borramos (filename será la URL completa)
    if (filename.startsWith("http")) {
      await del(filename).catch(() => console.error("Error borrando blob"));
    }

    // Actualizar reformas.json
    const reformas = await readReformas();
    const index = reformas.findIndex((r) => r.id === safeId);
    if (index !== -1) {
      reformas[index].images = reformas[index].images.filter((img) => img !== filename);
      await writeReformas(reformas);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error eliminando imagen" }, { status: 500 });
  }
}
