import fs from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { Redis } from "@upstash/redis";

// Usar dotenv para cargar .env.local manualmente en este script
import { config } from "dotenv";
config({ path: ".env.local" });

const redis = Redis.fromEnv();
const PUBLIC_DIR = path.join(process.cwd(), "public");
const DATA_DIR = path.join(process.cwd(), "data");

async function migrateImagesToBlob(reformas: any[]) {
  console.log("🚀 Iniciando migración de imágenes a Vercel Blob...");
  for (const reforma of reformas) {
    console.log(`\nProcesando reforma: ${reforma.id}`);
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
        console.log(`  Subiendo ${decodedImg}...`);
        const blob = await put(safeName, buffer, { access: "public" });
        newImages.push(blob.url);
        console.log(`  ✅ Subido: ${blob.url}`);
      } catch (err) {
        console.error(`  ❌ Error subiendo ${img} (puede que ya no exista localmente)`);
      }
    }
    reforma.images = newImages;
  }
}

async function migrateTiendaImagesToBlob(configData: any) {
  console.log("\n🚀 Iniciando migración de imágenes de Tienda a Vercel Blob...");
  if (!configData.storePhotos || !Array.isArray(configData.storePhotos)) return;

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
      console.log(`  Subiendo ${fileName}...`);
      const blob = await put(safeName, buffer, { access: "public" });
      newPhotos.push({ ...photo, src: blob.url });
      console.log(`  ✅ Subido: ${blob.url}`);
    } catch (err) {
      console.error(`  ❌ Error subiendo ${photo.src}`);
    }
  }
  configData.storePhotos = newPhotos;
}

async function main() {
  try {
    // 1. Migrar Config
    console.log("\n📦 Migrando config.json...");
    const configRaw = await fs.readFile(path.join(PUBLIC_DIR, "config.json"), "utf-8");
    const configData = JSON.parse(configRaw);
    await migrateTiendaImagesToBlob(configData);
    await redis.set("site:config", configData);
    console.log("✅ Configuración guardada en Redis");

    // 2. Migrar Reformas
    console.log("\n📦 Migrando reformas.json...");
    const reformasRaw = await fs.readFile(path.join(PUBLIC_DIR, "reformas.json"), "utf-8");
    const reformasData = JSON.parse(reformasRaw);
    await migrateImagesToBlob(reformasData);
    await redis.set("reformas", reformasData);
    console.log("✅ Reformas guardadas en Redis");

    // 3. Migrar Presupuestos
    console.log("\n📦 Migrando presupuestos.json...");
    try {
      const presupuestosRaw = await fs.readFile(path.join(DATA_DIR, "presupuestos.json"), "utf-8");
      const presupuestosData = JSON.parse(presupuestosRaw);
      await redis.set("presupuestos", presupuestosData);
      console.log("✅ Presupuestos guardados en Redis");
    } catch {
      console.log("⚠️ No hay presupuestos locales para migrar.");
    }

    console.log("\n🎉 ¡Migración completada con éxito!");
  } catch (error) {
    console.error("\n❌ Error fatal en la migración:", error);
  }
}

main();
