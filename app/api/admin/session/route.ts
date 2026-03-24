import { NextResponse } from "next/server";
import { getSession, NO_STORE_HEADERS } from "@/app/lib/admin-auth";

export async function GET() {
  const valid = await getSession();
  return NextResponse.json({ authenticated: valid }, { headers: NO_STORE_HEADERS });
}
