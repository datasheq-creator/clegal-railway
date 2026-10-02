/**
 * Site-wide constants. The primary phone number is hardcoded by requirement.
 * Optional public URLs come from NEXT_PUBLIC_* env vars (inlined at build time);
 * UI that depends on them only renders when they are set.
 */

export const PHONE_E164 = "+56958961796";
export const PHONE_DISPLAY = "+56 9 5896 1796";
export const PHONE_TEL_HREF = `tel:${PHONE_E164}`;
export const WHATSAPP_NUMBER = PHONE_E164.replace(/^\+/, "");

export function whatsappHref(text?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

function optionalUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString().replace(/\/$/, "") : null;
  } catch {
    return null;
  }
}

export const SITE_URL = optionalUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000";

export const links = {
  login: optionalUrl(process.env.NEXT_PUBLIC_LOGIN_URL),
  appStore: optionalUrl(process.env.NEXT_PUBLIC_APP_STORE_URL),
  playStore: optionalUrl(process.env.NEXT_PUBLIC_PLAY_STORE_URL),
  datasheq: optionalUrl(process.env.NEXT_PUBLIC_DATASHEQ_URL),
} as const;

export const BRAND_NAME = "C-Legal";
