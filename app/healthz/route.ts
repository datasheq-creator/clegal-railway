import { healthResponse } from "@/lib/http/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Liveness probe for Railway (railway.toml → healthcheckPath), same path as the DATASHEQ site. */
export function GET() {
  return healthResponse();
}
