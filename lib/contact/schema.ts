import { z } from "zod";

/**
 * Shared client/server schema for the "Contáctanos" form.
 * Error messages are stable codes; the UI maps them to localized strings
 * (see lib/i18n/dictionaries.ts → contact.errors).
 */

export const SERVICE_IDS = [
  "demo",
  "plan-libre",
  "plan-basico",
  "plan-profesional",
  "plan-empresa",
  "datasheq",
  "consulta",
] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export const LOCALES = ["es", "en"] as const;

export const LIMITS = {
  nameMin: 2,
  nameMax: 100,
  emailMax: 254,
  phoneMax: 25,
  phoneDigitsMin: 8,
  phoneDigitsMax: 15,
  messageMin: 10,
  messageMax: 2000,
} as const;

// Letters (any script), combining marks, spaces, apostrophes, dots and hyphens.
// Blocks digits, URLs and control characters so the name cannot carry spam
// into the confirmation email or inject headers into the subject line.
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}' .\-]*$/u;
const PHONE_CHARS_RE = /^\+?[0-9 ().\-]+$/;

export const contactSchema = z.object({
  name: z
    .string({ error: "name_min" })
    .trim()
    .min(LIMITS.nameMin, { error: "name_min" })
    .max(LIMITS.nameMax, { error: "name_max" })
    .regex(NAME_RE, { error: "name_invalid" }),
  email: z
    .string({ error: "email_invalid" })
    .trim()
    .toLowerCase()
    .max(LIMITS.emailMax, { error: "email_invalid" })
    .pipe(z.email({ error: "email_invalid" })),
  phone: z
    .string({ error: "phone_invalid" })
    .trim()
    .max(LIMITS.phoneMax, { error: "phone_invalid" })
    .regex(PHONE_CHARS_RE, { error: "phone_invalid" })
    .refine(
      (v) => {
        const digits = v.replace(/\D/g, "").length;
        return digits >= LIMITS.phoneDigitsMin && digits <= LIMITS.phoneDigitsMax;
      },
      { error: "phone_invalid" },
    ),
  service: z.enum(SERVICE_IDS, { error: "service_invalid" }),
  message: z
    .string({ error: "message_min" })
    .trim()
    .min(LIMITS.messageMin, { error: "message_min" })
    .max(LIMITS.messageMax, { error: "message_max" }),
  lang: z.enum(LOCALES).catch("es"),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactPayload = z.output<typeof contactSchema>;
export type ContactField = "name" | "email" | "phone" | "service" | "message";
export type ContactErrorCode =
  | "name_min"
  | "name_max"
  | "name_invalid"
  | "email_invalid"
  | "phone_invalid"
  | "service_invalid"
  | "message_min"
  | "message_max";

export type FieldErrors = Partial<Record<ContactField, ContactErrorCode>>;

const FIELDS: ContactField[] = ["name", "email", "phone", "service", "message"];

/** First error code per field, in a shape that is safe to send to the client. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const flat = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  const out: FieldErrors = {};
  for (const field of FIELDS) {
    const code = flat[field]?.[0];
    if (code) out[field] = code as ContactErrorCode;
  }
  return out;
}

/** Name of the honeypot input. Real users never see or fill it. */
export const HONEYPOT_FIELD = "company_website";
