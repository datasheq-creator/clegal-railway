import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { settings } from "@/lib/site";

export type StoreTarget = "ios" | "android" | "auto";

/**
 * Store redirects used by the store icons and the QR codes — same behaviour as the
 * DATASHEQ site: go to the store link from lib/site.ts, or to the "Descarga" section
 * while the link is empty. "auto" picks the store from the visitor's device.
 */
export function storeRedirect(request: NextRequest, which: StoreTarget) {
  const { appStoreUrl, googlePlayUrl } = settings.app;
  const ua = request.headers.get("user-agent") ?? "";
  let target: string = "";
  if (which === "ios") target = appStoreUrl;
  else if (which === "android") target = googlePlayUrl;
  else if (/android/i.test(ua)) target = googlePlayUrl;
  else if (/iphone|ipad|ipod/i.test(ua)) target = appStoreUrl;
  else target = googlePlayUrl || appStoreUrl;
  if (target) return NextResponse.redirect(target, 302);
  return new NextResponse(null, { status: 302, headers: { Location: "/#descarga" } });
}
