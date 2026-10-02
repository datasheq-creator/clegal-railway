/**
 * Brand palette — single source of truth (Images Clegal/PALETA-COLORES.png).
 *
 * The web UI consumes these through the CSS custom properties declared in
 * app/globals.css (`@theme`). Email clients do not support CSS variables or
 * color-mix(), so the email templates import the same values from here and
 * derive tints in JS. Do not introduce hex codes anywhere else.
 */
export const palette = {
  ink: "#10102a",
  blue: "#1b33c8",
  purple: "#c200ff",
  green: "#04dd75",
  white: "#ffffff",
} as const;

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** sRGB mix of `a` into `b` (weight = share of `a`, 0–1). Mirrors CSS color-mix(in srgb, a w%, b). */
export function mix(a: string, b: string, weight: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const ch = (x: number, y: number) =>
    Math.round(x * weight + y * (1 - weight))
      .toString(16)
      .padStart(2, "0");
  return `#${ch(r1, r2)}${ch(g1, g2)}${ch(b1, b2)}`;
}

/** Derived tints used by the email templates (same ratios as globals.css). */
export const tints = {
  inkMuted: mix(palette.ink, palette.white, 0.72),
  inkSubtle: mix(palette.ink, palette.white, 0.55),
  line: mix(palette.ink, palette.white, 0.12),
  surface: mix(palette.ink, palette.white, 0.04),
  greenSoft: mix(palette.green, palette.white, 0.12),
  purpleSoft: mix(palette.purple, palette.white, 0.1),
} as const;
