import { NextRequest, NextResponse } from "next/server";

/**
 * Protege la ruta /admin/dashboard a nivel de proxy de Next.js.
 * Si no hay cookie de sesión válida, redirige al login.
 * Nota: aquí no verificamos la firma HMAC (eso es costoso en Edge Runtime),
 * solo comprobamos que la cookie existe. La verificación completa ocurre
 * en cada llamada a la API (requireAuth).
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Solo aplica a las rutas del dashboard de admin
  if (pathname.startsWith("/admin/dashboard")) {
    const session = req.cookies.get("admin_session");

    // Sin cookie → redirigir al login
    if (!session?.value) {
      const loginUrl = new URL("/admin", req.url);
      loginUrl.searchParams.set("redirect", "1");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};
