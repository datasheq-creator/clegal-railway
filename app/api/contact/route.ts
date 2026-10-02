import { NextResponse, type NextRequest } from "next/server";
import { contactSchema, HONEYPOT_FIELD, toFieldErrors } from "@/lib/contact/schema";
import { DispatchError, dispatchLeadEmails } from "@/lib/email/dispatch";
import { EnvError, getServerEnv } from "@/lib/env";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;
// 5 submissions per IP per 10 minutes.
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

type ErrorCode = "invalid_json" | "payload_too_large" | "validation" | "rate_limited" | "config" | "delivery" | "unsupported_media_type" | "method_not_allowed";

function error(status: number, code: ErrorCode, extra: Record<string, unknown> = {}, headers?: HeadersInit) {
  return NextResponse.json({ ok: false, error: code, ...extra }, { status, headers });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return error(415, "unsupported_media_type");
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) return error(413, "payload_too_large");

  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return error(413, "payload_too_large");

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return error(400, "invalid_json");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return error(400, "invalid_json");

  const ip = clientIp(request.headers);

  // Honeypot: bots fill every field. Pretend success, send nothing.
  const honeypot = (body as Record<string, unknown>)[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    console.warn("[contact] honeypot triggered", { ip });
    return NextResponse.json({ ok: true });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return error(422, "validation", { fieldErrors: toFieldErrors(parsed.error) });
  }

  // Only submissions that would actually send email count against the limit.
  const rate = limiter.check(ip);
  if (!rate.ok) {
    return error(429, "rate_limited", { retryAfter: rate.retryAfterSec }, { "Retry-After": String(rate.retryAfterSec) });
  }

  let env;
  try {
    env = getServerEnv();
  } catch (err) {
    console.error("[contact]", err instanceof EnvError ? err.message : err);
    return error(500, "config");
  }

  try {
    const result = await dispatchLeadEmails(
      parsed.data,
      {
        receivedAt: new Date(),
        ip,
        userAgent: request.headers.get("user-agent") ?? "unknown",
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL ? SITE_URL : null,
      },
      env,
    );
    return NextResponse.json({ ok: true, confirmation: result.confirmation });
  } catch (err) {
    console.error("[contact]", err instanceof DispatchError ? err.message : err);
    return error(502, "delivery");
  }
}

export function GET() {
  return error(405, "method_not_allowed", {}, { Allow: "POST" });
}
