import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Liveness probe for Railway (railway.toml → healthcheckPath).
 * Always 200 while the process is up; `email` reports whether SendGrid is
 * configured so a broken deploy is visible without exposing secrets.
 */
export function GET() {
  let email: "configured" | "dry-run" | "misconfigured" = "misconfigured";
  try {
    email = getServerEnv().SENDGRID_DRY_RUN ? "dry-run" : "configured";
  } catch {
    email = "misconfigured";
  }
  return NextResponse.json({ status: "ok", email }, { headers: { "Cache-Control": "no-store" } });
}
