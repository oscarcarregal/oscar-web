import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { Redis } from "@upstash/redis";

export async function GET() {
  try {
    // Vercel dev inyecta las variables de entorno, pero bajo los nombres Vercel Storage
    const redisUrl = process.env.REDIS_KV_REST_API_URL || process.env.KV_REST_API_URL;
    const redisToken = process.env.REDIS_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;
    
    if (!redisUrl || !redisToken) {
      return NextResponse.json({ error: "Missing Redis tokens" });
    }

    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    const PUBLIC_DIR = path.join(process.cwd(), "public");
    const DATA_DIR = path.join(process.cwd(), "data");

    console.log("Iniciando migración local...");

    // 1. Migrar Config
    const configRaw = await fs.readFile(path.join(PUBLIC_DIR, "config.json"), "utf-8");
    const configData = JSON.parse(configRaw);
    
    if (configData.storePhotos && Array.isArray(configData.storePhotos)) {
      const newPhotos = [];
      for (const photo of configData.storePhotos) {
        if (photo.src.startsWith("http")) {
          newPhotos.push(photo);
          continue;
        }
        try {
          const fileName = decodeURIComponent(path.basename(photo.src));
          const filePath = path.join(PUBLIC_DIR, "tienda", fileName);
          const buffer = await fs.readFile(filePath);
          const safeName = `tienda/${fileName}`;
          const blob = await put(safeName, buffer, { access: "public" });
          newPhotos.push({ ...photo, src: blob.url });
        } catch (err) {
          console.error("Error subiendo foto de tienda:", photo.src);
        }
      }
      configData.storePhotos = newPhotos;
    }
    await redis.set("site:config", configData);

    // 2. Migrar Reformas
    const reformasRaw = await fs.readFile(path.join(PUBLIC_DIR, "reformas.json"), "utf-8");
    const reformasData = JSON.parse(reformasRaw);
    
    for (const reforma of reformasData) {
      const newImages = [];
      for (const img of reforma.images) {
        if (img.startsWith("http")) {
          newImages.push(img);
          continue;
        }
        try {
          const decodedImg = decodeURIComponent(img);
          const filePath = path.join(PUBLIC_DIR, "reformas", reforma.id, decodedImg);
          const buffer = await fs.readFile(filePath);
          const safeName = `reformas/${reforma.id}/${decodedImg}`;
          const blob = await put(safeName, buffer, { access: "public" });
          newImages.push(blob.url);
        } catch (err) {
          console.error("Error subiendo reforma img:", img);
        }
      }
      reforma.images = newImages;
    }
    await redis.set("reformas", reformasData);

    // 3. Migrar Presupuestos
    try {
      const presupuestosRaw = await fs.readFile(path.join(DATA_DIR, "presupuestos.json"), "utf-8");
      const presupuestosData = JSON.parse(presupuestosRaw);
      await redis.set("presupuestos", presupuestosData);
    } catch {}

    return NextResponse.json({ success: true, message: "Migración completada" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
