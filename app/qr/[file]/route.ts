import QRCode from "qrcode";
import { NextResponse, type NextRequest } from "next/server";
import { palette } from "@/lib/brand";
import { baseUrl, storePaths } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * QR codes for the "Descarga nuestra app" section: /qr/ios.svg and /qr/android.svg.
 * They encode <site>/app/ios and <site>/app/android (same as the DATASHEQ site), so they
 * keep working when the store links in lib/site.ts change.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const store = file === "ios.svg" ? "ios" : file === "android.svg" ? "android" : null;
  if (!store) return new NextResponse("Not found", { status: 404 });
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  const target = `${baseUrl(host ? `${proto}://${host}` : null)}${storePaths[store]}`;
  const svg = await QRCode.toString(target, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: palette.ink, light: palette.white },
  });
  return new NextResponse(svg, {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
