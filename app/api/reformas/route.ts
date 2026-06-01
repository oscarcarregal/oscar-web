import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export async function GET() {
  try {
    const redis = Redis.fromEnv();
    let data = await redis.get("reformas");
    
    if (!data) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/reformas.json`);
      if (res.ok) data = await res.json();
    }
    
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: "Error leyendo reformas" }, { status: 500 });
  }
}
