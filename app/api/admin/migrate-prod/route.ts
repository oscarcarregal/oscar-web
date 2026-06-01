import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import configData from "../../../../public/config.json";
import reformasData from "../../../../public/reformas.json";
// Importamos de manera segura los presupuestos
let presupuestosData: any[] = [];
try {
  presupuestosData = require("../../../../data/presupuestos.json");
} catch (e) {
  console.log("No hay presupuestos previos");
}

export async function GET() {
  try {
    const redis = Redis.fromEnv();
    
    await redis.set("site:config", configData);
    await redis.set("reformas", reformasData);
    if (presupuestosData.length > 0) {
      await redis.set("presupuestos", presupuestosData);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "¡Migración de datos a Upstash Redis completada con éxito en Producción!",
      detalles: "Las fotos actuales se sirven directamente desde Vercel (no hace falta subirlas a Blob). Las nuevas fotos irán a Blob automáticamente."
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
