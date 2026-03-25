/* API para subir y eliminar fotos del showroom/tienda.
   Las imágenes se guardan en public/tienda/ y el array
   storePhotos de config.json se actualiza automáticamente. */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, NO_STORE_HEADERS } from "@/app/lib/admin-auth";
import { sanitizeConfigPayload } from "@/app/lib/config-security";
import fs from "fs/promises";
import path from "path";

const TIENDA_DIR = path.join(process.cwd(), "public", "tienda");
const CONFIG_PATH = path.join(process.cwd(), "public", "config.json");

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

async function readConfig() {
  const raw = await fs.readFile(CONFIG_PATH, "utf-8");
  return JSON.parse(raw);
}

async function writeConfig(data: unknown) {
  await fs.writeFile(CONFIG_PATH, JSON.stringify(data, null, 2), "utf-8");
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

    await fs.mkdir(TIENDA_DIR, { recursive: true });

    const savedPhotos: { src: string; alt: string }[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) continue;
      if (file.size > MAX_FILE_SIZE) continue;

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      // Nombre seguro sin caracteres especiales
      const safeName = `tienda_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = path.join(TIENDA_DIR, safeName);

      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      savedPhotos.push({ src: `/tienda/${safeName}`, alt: "" });
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
  } catch {
    return NextResponse.json(
      { error: "Error subiendo imágenes" },
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

    // Extraer solo el nombre de fichero para evitar path traversal
    const safeName = path.basename(src);
    if (!safeName || safeName.startsWith(".")) {
      return NextResponse.json(
        { error: "Ruta inválida" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    // Eliminar el fichero del disco (sin fallar si ya no existe)
    const filePath = path.join(TIENDA_DIR, safeName);
    await fs.unlink(filePath).catch(() => {});

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
