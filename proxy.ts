import { NextResponse, type NextRequest } from "next/server";

/**
 * Spanish (default locale) is served at "/" without a prefix by rewriting to
 * the statically generated /es page; English lives at /en. Visiting /es
 * directly redirects to the canonical "/".
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/es" || pathname.startsWith("/es/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/es";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/es", "/es/:path*"],
};
