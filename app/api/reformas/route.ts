import { getBaseUrl } from "@/app/lib/base-url";
import { NextResponse } from "next/server";
import { redis } from "@/app/lib/redis";

export async function GET() {
  try {
    
    let data = await redis.get("reformas");
    
    if (!data) {
      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl}/reformas.json`);
      if (res.ok) data = await res.json();
    }
    
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: "Error leyendo reformas" }, { status: 500 });
  }
}
