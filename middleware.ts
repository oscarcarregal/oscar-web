import { NextRequest, NextResponse } from "next/server";

const CANONICAL_HOST = process.env.NEXT_PUBLIC_SITE_HOST || "www.oscarcarregal.es";

export function middleware(request: NextRequest) {
  const { hostname, pathname, search } = request.nextUrl;
  const normalizedHost = hostname.toLowerCase();

  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  if (normalizedHost === "oscarcarregal.es") {
    const url = request.nextUrl.clone();
    url.hostname = CANONICAL_HOST;
    url.protocol = "https:";

    return NextResponse.redirect(url, 308);
  }

  if (pathname !== "/" && pathname.endsWith("/")) {
    const cleanPath = pathname.replace(/\/+$/, "");
    const url = request.nextUrl.clone();
    url.pathname = cleanPath;

    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets/).*)"],
};
