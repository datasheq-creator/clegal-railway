import { describe, expect, it } from "vitest";
import { palette } from "@/lib/brand";
import type { ContactPayload } from "@/lib/contact/schema";
import { buildConfirmationEmail, buildInternalEmail, CONFIRMATION_NOTICE, escapeHtml } from "@/lib/email/templates";

const lead: ContactPayload = {
  name: "Camila Rojas",
  email: "camila@empresa.cl",
  phone: "+56 9 1234 5678",
  service: "plan-basico",
  message: 'Hola <script>alert("x")</script>\nSegunda línea',
  lang: "es",
};
const meta = {
  receivedAt: new Date("2026-10-01T15:30:00Z"),
  ip: "203.0.113.7",
  userAgent: "Mozilla/5.0 <test>",
  siteUrl: "https://clegal.example",
};

describe("escapeHtml", () => {
  it("escapes all HTML-significant characters", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  });
});

describe("buildConfirmationEmail", () => {
  const email = buildConfirmationEmail(lead, meta);

  it("leads with the required notice banner", () => {
    expect(email.html).toContain(escapeHtml(CONFIRMATION_NOTICE));
    expect(email.text.split("\n")[0]).toBe(CONFIRMATION_NOTICE);
  });

  it("includes the brand overview and direct contact channels", () => {
    for (const s of ["Gestión Legal Inteligente", "Repositorio legal", "Dashboards", "Prevención", "Planes"]) {
      expect(email.html).toContain(s);
    }
    expect(email.html).toContain('href="tel:+56958961796"');
    expect(email.html).toContain("https://wa.me/56958961796");
    expect(email.text).toContain("+56958961796");
  });

  it("never echoes the free-text message back to the recipient", () => {
    expect(email.html).not.toContain("Segunda línea");
    expect(email.text).not.toContain("Segunda línea");
  });

  it("uses inline styles with palette colours only", () => {
    const hexes = new Set(email.html.match(/#[0-9a-f]{6}\b/gi)?.map((h) => h.toLowerCase()));
    for (const brand of [palette.ink, palette.green, palette.white]) expect(hexes.has(brand)).toBe(true);
    expect(email.html).toContain("https://clegal.example/brand/clegal-mark-email.png");
  });
});

describe("buildInternalEmail", () => {
  const email = buildInternalEmail(lead, meta);

  it("contains the full lead payload with a Santiago timestamp", () => {
    expect(email.subject).toBe("[C-Legal] Nuevo lead: Plan Básico — Camila Rojas");
    for (const s of ["Camila Rojas", "camila@empresa.cl", "+56 9 1234 5678", "Plan Básico", "2026-10-01T15:30:00.000Z"]) {
      expect(email.html).toContain(s);
    }
    expect(email.html).toMatch(/2026/);
    expect(email.text).toContain("Segunda línea");
  });

  it("escapes user input", () => {
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.html).toContain("Mozilla/5.0 &lt;test&gt;");
  });
});
