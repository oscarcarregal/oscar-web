import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearSessionCookie, revokeToken, NO_STORE_HEADERS } from "@/app/lib/admin-auth";

export async function POST() {
  // Revoke the token server-side (works even via sendBeacon)
  const store = await cookies();
  const token = store.get("admin_session")?.value;
  if (token) {
    try {
      revokeToken(decodeURIComponent(token));
    } catch {
      revokeToken(token);
    }
  }
  await clearSessionCookie();
  return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
}
