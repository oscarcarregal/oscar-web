import { getBaseUrl } from "@/app/lib/base-url";
/* Rutas API para subir y eliminar imágenes de una reforma */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeId } from "@/app/lib/admin-auth";
import { redis } from "@/app/lib/redis";
import { put, del } from "@vercel/blob";



const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/** 
 * Extensiones seguras basadas en MIME type 
 */
function safeExtFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
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

      const ext = safeExtFromMime(file.type);
      const safeName = `reformas/${safeId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

      // Usar directamente el objeto File es más eficiente en Vercel
      const blob = await put(safeName, file, { 
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
  } catch (error: any) {
    console.error("Error subiendo imagen de reforma:", error);
    return NextResponse.json({ error: error.message || "Error subiendo imágenes" }, { status: 500 });
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
