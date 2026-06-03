import { getBaseUrl } from "@/app/lib/base-url";
/* API para subir y eliminar fotos del showroom/tienda.
   Las imágenes se guardan en public/tienda/ y el array
   storePhotos de config.json se actualiza automáticamente. */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, NO_STORE_HEADERS } from "@/app/lib/admin-auth";
import { sanitizeConfigPayload } from "@/app/lib/config-security";
import { redis } from "@/app/lib/redis";
import { put, del } from "@vercel/blob";



const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/** 
 * Extensiones seguras basadas en MIME type 
 */
function safeExtFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

async function readConfig(): Promise<any> {
  let data: any = await redis.get("site:config");
  if (!data) {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/config.json`);
    if (res.ok) data = await res.json();
  }
  return data || {};
}

async function writeConfig(data: unknown) {
  await redis.set("site:config", data);
}

/* POST — sube una o varias imágenes al showroom */
export async function POST(req: NextRequest) {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No se enviaron imágenes" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const savedPhotos: { src: string; alt: string }[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) continue;
      if (file.size > MAX_FILE_SIZE) continue;

      const ext = safeExtFromMime(file.type);
      const safeName = `tienda/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const blob = await put(safeName, file, {
        access: 'public',
        contentType: file.type
      });

      savedPhotos.push({ src: blob.url, alt: "" });
    }

    // Añadir las nuevas fotos al array storePhotos de config.json
    const config = await readConfig();
    const currentPhotos = Array.isArray(config.storePhotos) ? config.storePhotos : [];
    const updated = { ...config, storePhotos: [...currentPhotos, ...savedPhotos] };

    const validation = sanitizeConfigPayload(updated);
    if (validation.ok && validation.data) {
      await writeConfig(validation.data);
    }

    return NextResponse.json(
      { success: true, files: savedPhotos },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error: any) {
    console.error("Error subiendo imagen tienda:", error);
    return NextResponse.json(
      { error: error.message || "Error subiendo imágenes" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

/* DELETE — elimina una foto del showroom por su ruta /tienda/filename */
export async function DELETE(req: NextRequest) {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const { src } = await req.json();
    if (!src || typeof src !== "string") {
      return NextResponse.json(
        { error: "Ruta de imagen requerida" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    // Borrar la URL del Blob si existe
    if (src.startsWith("http")) {
      await del(src).catch(() => console.error("Error borrando blob de tienda"));
    }

    // Actualizar config.json eliminando la foto del array storePhotos
    const config = await readConfig();
    const currentPhotos = Array.isArray(config.storePhotos) ? config.storePhotos : [];
    const updatedPhotos = currentPhotos.filter(
      (p: { src: string }) => p.src !== src
    );
    const updated = { ...config, storePhotos: updatedPhotos };

    const validation = sanitizeConfigPayload(updated);
    if (validation.ok && validation.data) {
      await writeConfig(validation.data);
    }

    return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Error eliminando imagen" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
