/**
 * ─────────────────────────────────────────────────────────────
 *  C-LEGAL — site settings (links and contact data)
 *  Same model as the DATASHEQ site: links live here, in the code,
 *  not in Railway variables. Edit and redeploy to change them.
 *  Everything marked "EDITAR" is a placeholder to confirm.
 * ─────────────────────────────────────────────────────────────
 */

export const settings = {
  // "Inicio de sesión" button (header + mobile menu)
  loginUrl: "https://app.datasheq.com",

  // "Conoce nuestras soluciones" (C-Legal is part of the Datasheq ecosystem)
  datasheqUrl: "https://web.datasheq.com",

  contact: {
    phoneE164: "+56958961796",
    phoneDisplay: "+56 9 5896 1796",
  },

  app: {
    // EDITAR: store links once the app is published. The store icons and the QR codes point to
    // /app/ios and /app/android, which redirect here; while empty they open the "Descarga" section.
    appStoreUrl: "",
    googlePlayUrl: "",
  },
} as const;

export const PHONE_E164 = settings.contact.phoneE164;
export const PHONE_DISPLAY = settings.contact.phoneDisplay;
export const PHONE_TEL_HREF = `tel:${PHONE_E164}`;
export const WHATSAPP_NUMBER = PHONE_E164.replace(/^\+/, "");

export function whatsappHref(text?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export const links = {
  login: settings.loginUrl || null,
  datasheq: settings.datasheqUrl || null,
  appStore: settings.app.appStoreUrl || null,
  playStore: settings.app.googlePlayUrl || null,
} as const;

/** Paths used by the store icons and QR codes (see app/app/ios, app/app/android). */
export const storePaths = { ios: "/app/ios", android: "/app/android" } as const;

const stripSlash = (s: string) => s.replace(/\/+$/, "");

/**
 * Public origin of the site — same rule as the DATASHEQ site:
 *   1. PUBLIC_BASE_URL (Railway variable, e.g. https://clegal.datasheq.com)
 *   2. https://$RAILWAY_PUBLIC_DOMAIN (set automatically by Railway)
 *   3. the request's own origin (when available), else http://localhost:3000
 */
export function baseUrl(requestOrigin?: string | null): string {
  const explicit = process.env.PUBLIC_BASE_URL?.trim();
  if (explicit) return stripSlash(explicit);
  const railway = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railway) return `https://${stripSlash(railway)}`;
  if (requestOrigin) return stripSlash(requestOrigin);
  return "http://localhost:3000";
}

/**
 * Origin used in prerendered pages (canonical/OG URLs). Evaluated when the
 * pages are built; the Dockerfile passes PUBLIC_BASE_URL / RAILWAY_PUBLIC_DOMAIN to the build.
 */
export const SITE_URL = baseUrl();

export const BRAND_NAME = "C-Legal";
