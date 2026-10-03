import { NextResponse, type NextRequest } from "next/server";

/**
 * Spanish (default locale) is served at "/" without a prefix by rewriting to
 * the statically generated /es page; English lives at /en.
 *
 * Note: Next.js runs the proxy again on the rewritten /es request, so /es must
 * NOT redirect back to "/" (that caused an infinite 308 loop on the home page).
 * /es stays reachable; its canonical URL is "/" (see app/[lang]/layout.tsx).
 */
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/es";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/"],
};
