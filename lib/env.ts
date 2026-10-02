import "server-only";
import { z } from "zod";

/**
 * Server-only environment — the SAME Railway variables as the DATASHEQ site:
 *
 *   SENDGRID_API_KEY         required  API key with "Mail Send" permission
 *   SENDGRID_FROM_EMAIL      required  verified sender address
 *   SENDGRID_FROM_NAME       optional  sender name (default "C-Legal")
 *   CONTACT_TO_EMAIL         required  company inbox(es) that receive every lead, comma-separated
 *   CLIENT_REPLY_TO          optional  Reply-To on the client confirmation (default: first CONTACT_TO_EMAIL)
 *   SENDGRID_SANDBOX         optional  "true" = SendGrid validates but does not deliver
 *   SENDGRID_DATA_RESIDENCY  optional  "eu" for EU-residency SendGrid subusers
 *   CONTACT_RATE_LIMIT       optional  successful submissions per IP per 10 min (default 5)
 *   PUBLIC_BASE_URL          optional  public URL of the site (see lib/site.ts)
 *
 * Older names still work as fallbacks: SENDGRID_SENDER_EMAIL, SENDGRID_SENDER_NAME, ADMIN_EMAIL.
 *
 * Without SendGrid configured, development (NODE_ENV !== "production") saves the
 * emails to ./.mail-outbox instead of sending them — exactly like the DATASHEQ site.
 */
const email = z.string().trim().pipe(z.email("must be a valid email"));

const configuredSchema = z.object({
  SENDGRID_API_KEY: z.string().min(1, "is required"),
  SENDGRID_FROM_EMAIL: email,
  SENDGRID_FROM_NAME: z.string().trim().min(1).max(80),
  CONTACT_TO_EMAILS: z.array(email).min(1, "is required"),
  CLIENT_REPLY_TO: email,
});

export type MailMode = "sendgrid" | "outbox";

export type ServerEnv = z.infer<typeof configuredSchema> & {
  mode: MailMode;
  SENDGRID_SANDBOX: boolean;
  SENDGRID_DATA_RESIDENCY: "eu" | "global";
};

export class EnvError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid server environment: ${issues.join("; ")}`);
    this.name = "EnvError";
  }
}

/** First non-empty value among the given variable names. */
function pick(source: NodeJS.ProcessEnv, ...names: string[]): string {
  for (const name of names) {
    const value = source[name]?.trim();
    if (value) return value;
  }
  return "";
}

function list(value: string): string[] {
  return value
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const LABELS: Record<string, string> = {
  SENDGRID_API_KEY: "SENDGRID_API_KEY",
  SENDGRID_FROM_EMAIL: "SENDGRID_FROM_EMAIL",
  SENDGRID_FROM_NAME: "SENDGRID_FROM_NAME",
  CONTACT_TO_EMAILS: "CONTACT_TO_EMAIL",
  CLIENT_REPLY_TO: "CLIENT_REPLY_TO",
};

export function getServerEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  const to = list(pick(source, "CONTACT_TO_EMAIL", "ADMIN_EMAIL"));
  const raw = {
    SENDGRID_API_KEY: pick(source, "SENDGRID_API_KEY"),
    SENDGRID_FROM_EMAIL: pick(source, "SENDGRID_FROM_EMAIL", "SENDGRID_SENDER_EMAIL"),
    SENDGRID_FROM_NAME: pick(source, "SENDGRID_FROM_NAME", "SENDGRID_SENDER_NAME") || "C-Legal",
    CONTACT_TO_EMAILS: to,
    CLIENT_REPLY_TO: pick(source, "CLIENT_REPLY_TO") || to[0] || "",
  };
  const extras = {
    SENDGRID_SANDBOX: pick(source, "SENDGRID_SANDBOX").toLowerCase() === "true",
    SENDGRID_DATA_RESIDENCY: (pick(source, "SENDGRID_DATA_RESIDENCY").toLowerCase() === "eu" ? "eu" : "global") as
      | "eu"
      | "global",
  };

  // Development without SendGrid: write emails to ./.mail-outbox (same as DATASHEQ).
  const nothingSet = !raw.SENDGRID_API_KEY && !raw.SENDGRID_FROM_EMAIL && to.length === 0;
  if (nothingSet && source.NODE_ENV !== "production") {
    return {
      ...raw,
      SENDGRID_FROM_EMAIL: "no-reply@localhost.test",
      CONTACT_TO_EMAILS: ["leads@localhost.test"],
      CLIENT_REPLY_TO: "leads@localhost.test",
      ...extras,
      mode: "outbox",
    };
  }

  const parsed = configuredSchema.safeParse(raw);
  if (!parsed.success) {
    throw new EnvError(
      parsed.error.issues.map((i) => `${LABELS[String(i.path[0])] ?? i.path.join(".")} ${i.message}`),
    );
  }
  return { ...parsed.data, ...extras, mode: "sendgrid" };
}

/** Successful submissions allowed per IP every 10 minutes (CONTACT_RATE_LIMIT, default 5). */
export function contactRateLimit(source: NodeJS.ProcessEnv = process.env): number {
  const n = Number.parseInt(pick(source, "CONTACT_RATE_LIMIT"), 10);
  return Number.isFinite(n) && n > 0 ? n : 5;
}
