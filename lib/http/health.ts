import "server-only";
import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import pkg from "@/package.json";

/**
 * Health payload — same shape as the DATASHEQ site's /healthz:
 * { status: "ok", version, mail: { configured, sandbox } }. Never exposes secrets.
 */
export function healthResponse() {
  let configured = false;
  let sandbox = false;
  let mode: "sendgrid" | "outbox" | "misconfigured" = "misconfigured";
  try {
    const env = getServerEnv();
    configured = env.mode === "sendgrid";
    sandbox = env.SENDGRID_SANDBOX;
    mode = env.mode;
  } catch {
    /* misconfigured */
  }
  return NextResponse.json(
    { status: "ok", version: pkg.version, mail: { configured, sandbox, mode } },
    { headers: { "Cache-Control": "no-store" } },
  );
}
