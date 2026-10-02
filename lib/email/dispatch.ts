import "server-only";
import sgMail, { type MailDataRequired } from "@sendgrid/mail";
import type { ContactPayload } from "@/lib/contact/schema";
import type { ServerEnv } from "@/lib/env";
import { buildConfirmationEmail, buildInternalEmail, type LeadMeta } from "./templates";

/** Minimal surface of @sendgrid/mail used here (injectable for tests). */
export interface MailClient {
  setApiKey(key: string): void;
  setTimeout?(ms: number): void;
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

export type DispatchResult = { internal: "sent" | "dry-run"; confirmation: "sent" | "failed" | "dry-run" };

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
  client: MailClient = sgMail,
): Promise<DispatchResult> {
  const internal = buildInternalEmail(lead, meta);
  const confirmation = buildConfirmationEmail(lead, meta);
  const from = { email: env.SENDGRID_SENDER_EMAIL, name: env.SENDGRID_SENDER_NAME };
  // Company inbox(es) from ADMIN_EMAIL / CONTACT_TO_EMAIL (Railway variable).
  const admins = env.ADMIN_EMAILS;
  const companyTo = admins.length === 1 ? admins[0]! : admins;
  const companyReplyTo = admins[0]!;

  const internalMsg: MailDataRequired = {
    to: companyTo,
    from,
    replyTo: { email: lead.email, name: lead.name },
    subject: internal.subject,
    html: internal.html,
    text: internal.text,
    categories: ["clegal-lead", "internal"],
    trackingSettings: trackingOff,
  };

  const confirmationMsg: MailDataRequired = {
    to: { email: lead.email, name: lead.name },
    from,
    replyTo: companyReplyTo,
    subject: confirmation.subject,
    html: confirmation.html,
    text: confirmation.text,
    categories: ["clegal-lead", "confirmation"],
    trackingSettings: trackingOff,
  };

  if (env.SENDGRID_DRY_RUN) {
    console.info("[contact] SENDGRID_DRY_RUN=1 — emails not sent", {
      internal: { to: internalMsg.to, subject: internalMsg.subject },
      confirmation: { to: lead.email, subject: confirmationMsg.subject },
    });
    return { internal: "dry-run", confirmation: "dry-run" };
  }

  client.setApiKey(env.SENDGRID_API_KEY as string);
  client.setTimeout?.(10_000);

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
