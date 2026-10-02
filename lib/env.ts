import "server-only";
import { z } from "zod";

/**
 * Server-only environment. Validated lazily (on first use) so `next build`
 * does not require secrets; a misconfigured deployment fails loudly on the
 * first contact request and in /api/health instead of silently dropping leads.
 *
 * Variable names are shared with the DATASHEQ site, so the same Railway
 * variables work for both services:
 *   company inbox  → ADMIN_EMAIL        (alias: CONTACT_TO_EMAIL)  — comma-separated list allowed
 *   sender address → SENDGRID_SENDER_EMAIL (alias: SENDGRID_FROM_EMAIL)
 *   sender name    → SENDGRID_SENDER_NAME  (alias: SENDGRID_FROM_NAME)
 */
const email = z.string().trim().pipe(z.email("must be a valid email"));

const serverEnvSchema = z
  .object({
    SENDGRID_API_KEY: z.string().trim().optional(),
    SENDGRID_SENDER_EMAIL: email,
    SENDGRID_SENDER_NAME: z.string().trim().min(1).max(80).default("C-Legal"),
    // Inbox(es) that receive every new lead. First address is also the Reply-To of the client confirmation.
    ADMIN_EMAILS: z.array(email).min(1, "is required"),
    // "1" logs emails instead of sending them (local development / staging).
    SENDGRID_DRY_RUN: z
      .enum(["0", "1", "true", "false"])
      .optional()
      .transform((v) => v === "1" || v === "true"),
  })
  .refine((env) => env.SENDGRID_DRY_RUN || (env.SENDGRID_API_KEY?.length ?? 0) > 0, {
    path: ["SENDGRID_API_KEY"],
    message: "is required",
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export class EnvError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid server environment: ${issues.join("; ")}`);
    this.name = "EnvError";
  }
}

/** First non-empty value among the given variable names. */
function pick(source: NodeJS.ProcessEnv, ...names: string[]): string | undefined {
  for (const name of names) {
    const value = source[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

function list(value: string | undefined): string[] {
  return (value ?? "")
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getServerEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  const parsed = serverEnvSchema.safeParse({
    SENDGRID_API_KEY: pick(source, "SENDGRID_API_KEY"),
    SENDGRID_SENDER_EMAIL: pick(source, "SENDGRID_SENDER_EMAIL", "SENDGRID_FROM_EMAIL"),
    SENDGRID_SENDER_NAME: pick(source, "SENDGRID_SENDER_NAME", "SENDGRID_FROM_NAME"),
    ADMIN_EMAILS: list(pick(source, "ADMIN_EMAIL", "CONTACT_TO_EMAIL")),
    SENDGRID_DRY_RUN: pick(source, "SENDGRID_DRY_RUN"),
  });
  if (!parsed.success) {
    throw new EnvError(
      parsed.error.issues.map((i) => {
        const key = i.path[0] === "ADMIN_EMAILS" ? "ADMIN_EMAIL (or CONTACT_TO_EMAIL)" : i.path.join(".") || "env";
        return `${key} ${i.message}`;
      }),
    );
  }
  return parsed.data;
}
