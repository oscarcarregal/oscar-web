import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/admin-auth";
import { redis } from "@/app/lib/redis";
import { put } from "@vercel/blob";
import { getBaseUrl } from "@/app/lib/base-url";

async function fetchBuffer(url: string): Promise<{ buffer: Buffer; type: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await res.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), type };
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const baseUrl = getBaseUrl();
    let migratedCount = 0;

    // 1. Migrar Reformas
    let reformasData = await redis.get<any[]>("reformas");
    if (!reformasData) {
      const res = await fetch(`${baseUrl}/reformas.json`);
      if (res.ok) reformasData = await res.json();
    }

    if (Array.isArray(reformasData)) {
      for (const r of reformasData) {
        if (!r.images || !Array.isArray(r.images)) continue;
        
        for (let i = 0; i < r.images.length; i++) {
          const img = r.images[i];
          if (!img.startsWith("http")) {
            // Es una imagen local
            const localUrl = `${baseUrl}/reformas/${r.id}/${img}`;
            const fetched = await fetchBuffer(localUrl);
            if (fetched) {
              const safeName = `reformas/${r.id}/${img}`;
              const blob = await put(safeName, fetched.buffer, {
                access: 'public',
                contentType: fetched.type
              });
              // Actualizamos la base de datos con la nueva URL de Blob
              r.images[i] = blob.url;
              migratedCount++;
            }
          }
        }
      }
      await redis.set("reformas", reformasData);
    }

    // 2. Migrar Tienda y HeroCarousel (config.json)
    let configData: any = await redis.get("site:config");
    if (!configData) {
      const res = await fetch(`${baseUrl}/config.json`);
      if (res.ok) configData = await res.json();
    }

    if (configData) {
      let configUpdated = false;

      // Tienda
      if (Array.isArray(configData.storePhotos)) {
        for (let i = 0; i < configData.storePhotos.length; i++) {
          const photo = configData.storePhotos[i];
          if (photo.src && !photo.src.startsWith("http")) {
            const localUrl = `${baseUrl}${photo.src.startsWith('/') ? '' : '/'}${photo.src}`;
            const fetched = await fetchBuffer(localUrl);
            if (fetched) {
              const filename = photo.src.split('/').pop() || `foto_${i}.jpg`;
              const safeName = `tienda/${filename}`;
              const blob = await put(safeName, fetched.buffer, {
                access: 'public',
                contentType: fetched.type
              });
              photo.src = blob.url;
              migratedCount++;
              configUpdated = true;
            }
          }
        }
      }

      // HeroCarousel (Solo actualizar nombres por si acaso, las imagenes de las reformas ya se han migrado)
      // Como el frontend asume que slide.image es lo que se usa para mostrar, actualicémoslo
      // buscando en reformasData la URL completa.
      if (Array.isArray(configData.heroCarousel) && Array.isArray(reformasData)) {
        for (let i = 0; i < configData.heroCarousel.length; i++) {
          const slide = configData.heroCarousel[i];
          if (slide.image && !slide.image.startsWith("http")) {
            const ref = reformasData.find((r: any) => r.id === slide.reforma);
            if (ref && Array.isArray(ref.images)) {
              // Buscar en la reforma migrada si alguna termina con el nombre local antiguo
              const migratedUrl = ref.images.find((img: string) => img.includes(encodeURIComponent(slide.image)) || img.endsWith(slide.image));
              if (migratedUrl) {
                slide.image = migratedUrl;
                configUpdated = true;
              }
            }
          }
        }
      }

      if (configUpdated) {
        await redis.set("site:config", configData);
      }
    }

    return NextResponse.json({ success: true, migratedCount });
  } catch (error: any) {
    console.error("Error en migración:", error);
    return NextResponse.json({ error: error.message || "Error en migración" }, { status: 500 });
  }
}
