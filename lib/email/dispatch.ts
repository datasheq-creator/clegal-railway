import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sgMail, { type MailDataRequired } from "@sendgrid/mail";
import type { ContactPayload } from "@/lib/contact/schema";
import type { ServerEnv } from "@/lib/env";
import { buildConfirmationEmail, buildInternalEmail, type LeadMeta } from "./templates";

/** Minimal surface of @sendgrid/mail used here (injectable for tests). */
export interface MailClient {
  setApiKey(key: string): void;
  setTimeout?(ms: number): void;
  client?: { setDataResidency?(region: string): void };
  send(data: MailDataRequired): Promise<unknown>;
}

export class DispatchError extends Error {
  constructor(
    public readonly stage: "internal",
    public readonly cause: unknown,
  ) {
    super(`SendGrid ${stage} notification failed: ${describeError(cause)}`);
    this.name = "DispatchError";
  }
}

export type DispatchResult = { internal: "sent" | "outbox"; confirmation: "sent" | "failed" | "outbox" };

/** Extracts SendGrid's error details without leaking the API key. */
export function describeError(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as { code?: number; message?: string; response?: { body?: unknown } };
    const body = e.response?.body;
    const detail =
      body && typeof body === "object" && "errors" in body
        ? JSON.stringify((body as { errors: unknown }).errors)
        : typeof body === "string"
          ? body
          : "";
    return [e.code, e.message, detail].filter(Boolean).join(" | ");
  }
  return String(err);
}

const trackingOff = {
  clickTracking: { enable: false, enableText: false },
  openTracking: { enable: false },
} as const;

/** Development without SendGrid: save each email as an HTML file in ./.mail-outbox (same as DATASHEQ). */
async function writeToOutbox(msg: MailDataRequired): Promise<void> {
  const dir = path.join(process.cwd(), ".mail-outbox");
  await mkdir(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const slug = String(msg.subject).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
  const to = ([] as unknown[])
    .concat(msg.to)
    .map((x) => (typeof x === "string" ? x : (x as { email: string }).email))
    .join(", ");
  const file = path.join(dir, `${stamp}-${slug}.html`);
  await writeFile(file, `<!-- To: ${to} | Subject: ${msg.subject} -->\n${String(msg.html)}`);
  console.info(`[mail:dev] "${msg.subject}" → ${to} (saved to ${path.relative(process.cwd(), file)})`);
}

/**
 * Sends the two lead emails.
 *
 * Both messages are rendered before any network call, so a template error
 * cannot leave a half-sent submission. The internal notification goes first
 * and is mandatory: if SendGrid rejects it, nothing is sent to the client and
 * the request fails (the visitor can safely retry). The client confirmation is
 * attempted only after the lead is safely delivered; if that second call fails
 * the lead is still captured, so the request succeeds and the failure is logged.
 */
export async function dispatchLeadEmails(
  lead: ContactPayload,
  meta: LeadMeta,
  env: ServerEnv,
  client: MailClient = sgMail as unknown as MailClient,
): Promise<DispatchResult> {
  const internal = buildInternalEmail(lead, meta);
  const confirmation = buildConfirmationEmail(lead, meta);
  const from = { email: env.SENDGRID_FROM_EMAIL, name: env.SENDGRID_FROM_NAME };
  // Company inbox(es) from the Railway variable CONTACT_TO_EMAIL.
  const admins = env.CONTACT_TO_EMAILS;
  const companyTo = admins.length === 1 ? admins[0]! : admins;
  const mailSettings = { sandboxMode: { enable: env.SENDGRID_SANDBOX } };

  const internalMsg: MailDataRequired = {
    to: companyTo,
    from,
    replyTo: { email: lead.email, name: lead.name },
    subject: internal.subject,
    html: internal.html,
    text: internal.text,
    categories: ["clegal-lead", "internal"],
    trackingSettings: trackingOff,
    mailSettings,
  };

  const confirmationMsg: MailDataRequired = {
    to: { email: lead.email, name: lead.name },
    from,
    replyTo: env.CLIENT_REPLY_TO,
    subject: confirmation.subject,
    html: confirmation.html,
    text: confirmation.text,
    categories: ["clegal-lead", "confirmation"],
    trackingSettings: trackingOff,
    mailSettings,
  };

  if (env.mode === "outbox") {
    await writeToOutbox(internalMsg);
    await writeToOutbox(confirmationMsg);
    return { internal: "outbox", confirmation: "outbox" };
  }

  client.setApiKey(env.SENDGRID_API_KEY);
  client.setTimeout?.(15_000);
  if (env.SENDGRID_DATA_RESIDENCY === "eu") client.client?.setDataResidency?.("eu");

  try {
    await client.send(internalMsg);
  } catch (err) {
    throw new DispatchError("internal", err);
  }

  try {
    await client.send(confirmationMsg);
    return { internal: "sent", confirmation: "sent" };
  } catch (err) {
    console.error("[contact] client confirmation failed (lead was delivered internally):", describeError(err));
    return { internal: "sent", confirmation: "failed" };
  }
}
