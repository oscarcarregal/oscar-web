import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo interceptar rutas dentro de /admin que NO sean la raíz de admin (el login)
  if (pathname.startsWith("/admin/") || (pathname === "/admin/dashboard")) {
    const hasSession = request.cookies.has(COOKIE_NAME);

    if (!hasSession) {
      const loginUrl = new URL("/admin", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
