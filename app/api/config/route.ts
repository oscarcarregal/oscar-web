import { NextResponse } from "next/server";
import { redis } from "@/app/lib/redis";

export async function GET() {
  try {
    
    let data = await redis.get("site:config");
    
    if (!data) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/config.json`);
      if (res.ok) data = await res.json();
    }
    
    return NextResponse.json(data || {});
  } catch {
    return NextResponse.json({ error: "Error leyendo configuración" }, { status: 500 });
  }
}
