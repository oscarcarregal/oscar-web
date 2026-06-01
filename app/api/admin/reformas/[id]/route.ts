import { getBaseUrl } from "@/app/lib/base-url";
/* Rutas API para obtener, actualizar y eliminar una reforma individual */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeId } from "@/app/lib/admin-auth";
import { sanitizeConfigPayload } from "@/app/lib/config-security";
import { redis } from "@/app/lib/redis";
import { del } from "@vercel/blob";



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

// Nombres de archivo simples o URLs completas de Vercel Blob
function sanitizeImageNames(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((v) => typeof v === "string")
    .map((v) => (v as string).trim())
    .filter((v) => v.startsWith("http") || /^[a-zA-Z0-9._-]+$/.test(v))
    .slice(0, 500);
}


interface ReformaEntry {
  id: string;
  title: string;
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
    const body = await req.json();
    const reformas = await readReformas();
    const index = reformas.findIndex((r) => r.id === safeId);

    if (index === -1) {
      return NextResponse.json({ error: "Reforma no encontrada" }, { status: 404 });
    }

    const existing = reformas[index];
    reformas[index] = {
      id: safeId,
      title: body.title !== undefined ? sanitizeStr(body.title, 200) || existing.title : existing.title,
      description: body.description !== undefined ? sanitizeStr(body.description, 5000) : existing.description,
      tags: body.tags !== undefined ? sanitizeTags(body.tags) : existing.tags,
      images: body.images !== undefined ? sanitizeImageNames(body.images) : existing.images,
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
    const reformaToDelete = reformas.find((r) => r.id === safeId);
    const updated = reformas.filter((r) => r.id !== safeId);
    await writeReformas(updated);

    // Limpiar referencias en config (featured y carousel) usando Redis
    let config: any = await redis.get("site:config");
    if (!config) {
      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl}/config.json`);
      if (res.ok) config = await res.json();
    }
    if (config) {
      config.featuredReformas = (config.featuredReformas ?? []).filter((r: string) => r !== safeId);
      config.heroCarousel = (config.heroCarousel ?? []).filter(
        (s: { reforma: string }) => s.reforma !== safeId
      );
      const validation = sanitizeConfigPayload(config);
      if (validation.ok && validation.data) {
        await redis.set("site:config", validation.data);
      }
    }

    // Eliminar imágenes de Vercel Blob
    if (reformaToDelete && reformaToDelete.images.length > 0) {
      const blobUrls = reformaToDelete.images.filter(img => img.startsWith("http"));
      if (blobUrls.length > 0) {
        await del(blobUrls).catch(() => console.error("Error borrando blobs en cascada"));
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error eliminando" }, { status: 500 });
  }
}
