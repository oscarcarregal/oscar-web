import { getBaseUrl } from "@/app/lib/base-url";
import { NextResponse } from "next/server";
import { redis } from "@/app/lib/redis";

export async function GET() {
  try {
    
    let data = await redis.get("site:config");
    
    if (!data) {
      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl}/config.json`);
      if (res.ok) data = await res.json();
    }
    
    return NextResponse.json(data || {});
  } catch {
    return NextResponse.json({ error: "Error leyendo configuración" }, { status: 500 });
  }
}
