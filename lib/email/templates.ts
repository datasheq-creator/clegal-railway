import { palette, tints } from "@/lib/brand";
import type { ContactPayload } from "@/lib/contact/schema";
import { serviceLabelsEs } from "@/lib/i18n/dictionaries";
import { PHONE_DISPLAY, PHONE_E164, PHONE_TEL_HREF, whatsappHref } from "@/lib/site";

/**
 * Transactional email templates. Table-based layout with inline styles for
 * broad client support (Gmail, Outlook, Apple Mail); a small <style> block
 * adds mobile stacking where supported. All user input is HTML-escaped.
 */

export type LeadMeta = {
  receivedAt: Date;
  ip: string;
  userAgent: string;
  siteUrl: string | null;
};

export type RenderedEmail = { subject: string; html: string; text: string };

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export function formatSantiago(date: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "full",
    timeStyle: "long",
    timeZone: "America/Santiago",
  }).format(date);
}

function siteHost(siteUrl: string | null): string | null {
  if (!siteUrl) return null;
  try {
    return new URL(siteUrl).host;
  } catch {
    return null;
  }
}

/** Only reference hosted images when the site URL is a public https origin. */
function logoUrl(siteUrl: string | null): string | null {
  if (!siteUrl || !siteUrl.startsWith("https://")) return null;
  return `${siteUrl}/brand/clegal-mark-email.png`;
}

function layout({ preheader, body, lang = "es" }: { preheader: string; body: string; lang?: string }): string {
  return `<!DOCTYPE html>
<html lang="${lang}" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>C-Legal</title>
<style>
  @media only screen and (max-width: 620px) {
    .container { width: 100% !important; }
    .px { padding-left: 20px !important; padding-right: 20px !important; }
    .col { display: block !important; width: 100% !important; box-sizing: border-box; }
    .col-gap { padding-left: 0 !important; padding-right: 0 !important; }
    .h1 { font-size: 22px !important; line-height: 28px !important; }
    .banner { font-size: 17px !important; line-height: 24px !important; }
  }
  a { color: ${palette.blue}; }
</style>
</head>
<body style="margin:0;padding:0;background-color:${tints.surface};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${tints.surface};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:${palette.white};border-radius:14px;overflow:hidden;border:1px solid ${tints.line};">
${body}
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function brandHeader(siteUrl: string | null): string {
  const logo = logoUrl(siteUrl);
  const mark = logo
    ? `<img src="${logo}" width="40" height="35" alt="" style="display:inline-block;vertical-align:middle;border:0;outline:none;width:40px;height:auto;margin-right:10px;">`
    : `<span style="display:inline-block;vertical-align:middle;width:12px;height:12px;border-radius:6px;background-color:${palette.green};margin-right:10px;"></span>`;
  return `<tr>
  <td class="px" style="padding:24px 32px 18px 32px;font-family:${FONT};">
    ${mark}<span style="display:inline-block;vertical-align:middle;font-size:22px;line-height:24px;font-weight:800;letter-spacing:0.5px;color:${palette.ink};">C-LEGAL</span>
  </td>
</tr>`;
}

// ───────────────────────────── Client confirmation ─────────────────────────────

const MODULES = ["Repositorio legal", "Verificación", "Matrices", "Planes de acción", "Reportes", "Dashboards"];
const PILLARS: Array<[string, string]> = [
  ["Inteligencia", "IA aplicada a la gestión del cumplimiento."],
  ["Visibilidad", "Indicadores y analítica para conocer tu nivel de cumplimiento."],
  ["Eficiencia", "Automatiza tareas y reduce el trabajo operativo."],
  ["Prevención", "Identifica brechas y actúa antes de que se conviertan en problemas."],
];
const PLANS: Array<[string, string]> = [
  ["Libre", "$0 / 30 días"],
  ["Básico", "$29.990 – $39.990"],
  ["Profesional", "Próximamente"],
  ["Empresa", "Próximamente"],
];

export const CONFIRMATION_NOTICE =
  "Hemos recibido tu mensaje con éxito. Nos pondremos en contacto contigo a la brevedad.";

export function buildConfirmationEmail(lead: ContactPayload, meta: LeadMeta): RenderedEmail {
  const name = escapeHtml(firstName(lead.name));
  const service = escapeHtml(serviceLabelsEs[lead.service]);
  const host = siteHost(meta.siteUrl);
  const wa = whatsappHref("Hola, acabo de enviar un mensaje desde el sitio de C-Legal.");

  const moduleRows: string[] = [];
  for (let i = 0; i < MODULES.length; i += 2) {
    const cell = (label: string | undefined) =>
      label
        ? `<td class="col" width="50%" style="width:50%;padding:6px 0;font-family:${FONT};font-size:14px;line-height:20px;color:${palette.ink};"><span style="color:${palette.green};font-weight:800;">&#10003;</span>&nbsp;&nbsp;${escapeHtml(label)}</td>`
        : `<td class="col" width="50%" style="width:50%;"></td>`;
    moduleRows.push(`<tr>${cell(MODULES[i])}${cell(MODULES[i + 1])}</tr>`);
  }

  const pillarRows: string[] = [];
  for (let i = 0; i < PILLARS.length; i += 2) {
    const cell = (item: [string, string] | undefined, side: "l" | "r") =>
      item
        ? `<td class="col col-gap" width="50%" valign="top" style="width:50%;padding:0 ${side === "l" ? "8px" : "0"} 12px ${side === "r" ? "8px" : "0"};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${tints.surface};border-radius:10px;">
              <tr><td style="padding:14px 16px;font-family:${FONT};">
                <div style="font-size:14px;line-height:20px;font-weight:700;color:${palette.ink};"><span style="display:inline-block;width:8px;height:8px;border-radius:4px;background-color:${palette.green};margin-right:8px;vertical-align:middle;"></span>${escapeHtml(item[0])}</div>
                <div style="font-size:13px;line-height:19px;color:${tints.inkMuted};padding-top:4px;">${escapeHtml(item[1])}</div>
              </td></tr>
            </table>
          </td>`
        : `<td class="col" width="50%"></td>`;
    pillarRows.push(`<tr>${cell(PILLARS[i], "l")}${cell(PILLARS[i + 1], "r")}</tr>`);
  }

  const planCells = PLANS.map(
    ([plan, price]) =>
      `<td class="col" width="25%" valign="top" style="width:25%;padding:10px 8px;border-top:1px solid ${tints.line};font-family:${FONT};">
        <div style="font-size:13px;line-height:18px;font-weight:700;color:${palette.ink};">${escapeHtml(plan)}</div>
        <div style="font-size:13px;line-height:18px;color:${tints.inkMuted};">${escapeHtml(price)}</div>
      </td>`,
  ).join("");

  const body = `${brandHeader(meta.siteUrl)}
<tr>
  <td class="px" style="padding:0 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${palette.green};border-radius:12px;">
      <tr>
        <td style="padding:20px 22px;font-family:${FONT};">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td valign="top" style="padding-right:14px;">
              <div style="width:34px;height:34px;border-radius:17px;background-color:${palette.white};text-align:center;font-size:20px;line-height:34px;font-weight:800;color:${palette.green};">&#10003;</div>
            </td>
            <td valign="middle" class="banner" style="font-size:19px;line-height:26px;font-weight:800;color:${palette.ink};">${escapeHtml(CONFIRMATION_NOTICE)}</td>
          </tr></table>
        </td>
      </tr>
    </table>
  </td>
</tr>
<tr>
  <td class="px" style="padding:26px 32px 4px 32px;font-family:${FONT};font-size:15px;line-height:24px;color:${palette.ink};">
    <p style="margin:0 0 12px 0;">Hola ${name},</p>
    <p style="margin:0;color:${tints.inkMuted};">Gracias por escribirnos. Recibimos tu solicitud sobre <strong style="color:${palette.ink};">${service}</strong> y un integrante de nuestro equipo te responderá pronto.</p>
  </td>
</tr>
<tr>
  <td class="px" style="padding:28px 32px 0 32px;font-family:${FONT};">
    <div style="font-size:11px;line-height:16px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:${palette.green};">Sobre C-Legal</div>
    <div class="h1" style="font-size:24px;line-height:30px;font-weight:800;color:${palette.ink};padding-top:6px;">Gestión Legal Inteligente</div>
    <p style="margin:8px 0 0 0;font-size:15px;line-height:23px;color:${tints.inkMuted};">Gestiona y controla el cumplimiento legal con IA, automatización y analítica avanzada. Parte del ecosistema Datasheq de digitalización HSEQ.</p>
  </td>
</tr>
<tr>
  <td class="px" style="padding:22px 32px 0 32px;font-family:${FONT};">
    <div style="font-size:15px;line-height:22px;font-weight:700;color:${palette.ink};padding-bottom:6px;">Todo tu Compliance Legal, en un solo lugar</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${moduleRows.join("")}</table>
  </td>
</tr>
<tr>
  <td class="px" style="padding:22px 32px 0 32px;font-family:${FONT};">
    <div style="font-size:15px;line-height:22px;font-weight:700;color:${palette.ink};padding-bottom:10px;">Convierte la información legal en decisiones</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${pillarRows.join("")}</table>
  </td>
</tr>
<tr>
  <td class="px" style="padding:10px 32px 0 32px;font-family:${FONT};">
    <div style="font-size:15px;line-height:22px;font-weight:700;color:${palette.ink};padding-bottom:8px;">Planes</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${planCells}</tr></table>
  </td>
</tr>
<tr>
  <td class="px" style="padding:28px 32px 8px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${palette.ink};border-radius:12px;">
      <tr>
        <td style="padding:24px 24px 26px 24px;font-family:${FONT};">
          <div style="font-size:17px;line-height:24px;font-weight:800;color:${palette.white};">¿Necesitas hablar con nosotros?</div>
          <p style="margin:6px 0 16px 0;font-size:14px;line-height:21px;color:${tints.line};">Estamos disponibles por teléfono y WhatsApp. También puedes responder directamente a este correo.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="padding:4px 0;font-size:14px;line-height:21px;color:${tints.line};">Teléfono:&nbsp; <a href="${PHONE_TEL_HREF}" style="color:${palette.white};font-weight:700;text-decoration:none;">${PHONE_DISPLAY}</a></td>
            </tr>
            <tr>
              <td style="padding:4px 0 18px 0;font-size:14px;line-height:21px;color:${tints.line};">WhatsApp:&nbsp; <a href="${wa}" style="color:${palette.white};font-weight:700;text-decoration:none;">${PHONE_E164}</a></td>
            </tr>
            <tr>
              <td>
                <a href="${wa}" style="display:inline-block;background-color:${palette.green};color:${palette.ink};font-size:15px;line-height:20px;font-weight:800;text-decoration:none;padding:12px 22px;border-radius:8px;">Escríbenos por WhatsApp</a>
                <a href="${PHONE_TEL_HREF}" style="display:inline-block;color:${palette.white};font-size:15px;line-height:20px;font-weight:700;text-decoration:none;padding:12px 16px;">Llamar al ${PHONE_DISPLAY}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>
<tr>
  <td class="px" style="padding:18px 32px 28px 32px;font-family:${FONT};font-size:12px;line-height:18px;color:${tints.inkSubtle};">
    C-Legal es parte del ecosistema Datasheq.<br>
    Recibiste este correo porque completaste el formulario de contacto${host ? ` en ${escapeHtml(host)}` : " de C-Legal"}. Si no fuiste tú, puedes ignorar este mensaje.
  </td>
</tr>`;

  const text = [
    CONFIRMATION_NOTICE,
    "",
    `Hola ${firstName(lead.name)},`,
    `Gracias por escribirnos. Recibimos tu solicitud sobre "${serviceLabelsEs[lead.service]}" y un integrante de nuestro equipo te responderá pronto.`,
    "",
    "SOBRE C-LEGAL — Gestión Legal Inteligente",
    "Gestiona y controla el cumplimiento legal con IA, automatización y analítica avanzada.",
    "",
    "Todo tu Compliance Legal, en un solo lugar:",
    ...MODULES.map((m) => `  ✓ ${m}`),
    "",
    "Convierte la información legal en decisiones:",
    ...PILLARS.map(([t, d]) => `  • ${t}: ${d}`),
    "",
    "Planes: " + PLANS.map(([p, v]) => `${p} (${v})`).join(" · "),
    "",
    "CONTACTO DIRECTO",
    `Teléfono: ${PHONE_DISPLAY} (${PHONE_E164})`,
    `WhatsApp: ${whatsappHref()}`,
    "También puedes responder directamente a este correo.",
    "",
    "C-Legal es parte del ecosistema Datasheq.",
  ].join("\n");

  return {
    subject: "Hemos recibido tu mensaje — C-Legal",
    html: layout({ preheader: CONFIRMATION_NOTICE, body }),
    text,
  };
}

// ───────────────────────────── Internal notification ─────────────────────────────

export function buildInternalEmail(lead: ContactPayload, meta: LeadMeta): RenderedEmail {
  const serviceLabel = serviceLabelsEs[lead.service];
  const santiago = formatSantiago(meta.receivedAt);
  const iso = meta.receivedAt.toISOString();
  const phoneDigits = lead.phone.replace(/[^\d+]/g, "");
  const waLead = `https://wa.me/${phoneDigits.replace(/^\+/, "")}`;

  const row = (label: string, valueHtml: string) => `<tr>
  <td class="col" width="150" valign="top" style="width:150px;padding:10px 12px 10px 0;border-bottom:1px solid ${tints.line};font-family:${FONT};font-size:13px;line-height:20px;font-weight:700;color:${tints.inkMuted};">${label}</td>
  <td class="col" valign="top" style="padding:10px 0;border-bottom:1px solid ${tints.line};font-family:${FONT};font-size:14px;line-height:21px;color:${palette.ink};">${valueHtml}</td>
</tr>`;

  const body = `${brandHeader(meta.siteUrl)}
<tr>
  <td class="px" style="padding:0 32px 4px 32px;font-family:${FONT};">
    <div style="display:inline-block;background-color:${tints.purpleSoft};color:${palette.purple};font-size:11px;line-height:16px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;padding:4px 10px;border-radius:999px;">Nuevo lead</div>
    <div class="h1" style="font-size:22px;line-height:29px;font-weight:800;color:${palette.ink};padding-top:10px;">${escapeHtml(lead.name)} — ${escapeHtml(serviceLabel)}</div>
  </td>
</tr>
<tr>
  <td class="px" style="padding:12px 32px 8px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${row("Recibido", `${escapeHtml(santiago)}<br><span style="color:${tints.inkSubtle};font-size:12px;">${iso} (UTC)</span>`)}
      ${row("Nombre", escapeHtml(lead.name))}
      ${row("Email", `<a href="mailto:${escapeHtml(lead.email)}" style="color:${palette.blue};">${escapeHtml(lead.email)}</a>`)}
      ${row("Teléfono", `<a href="tel:${escapeHtml(phoneDigits)}" style="color:${palette.blue};">${escapeHtml(lead.phone)}</a> &nbsp;·&nbsp; <a href="${escapeHtml(waLead)}" style="color:${palette.blue};">WhatsApp</a>`)}
      ${row("Asunto / Servicio", escapeHtml(serviceLabel))}
      ${row("Idioma del sitio", lead.lang === "en" ? "Inglés" : "Español")}
    </table>
  </td>
</tr>
<tr>
  <td class="px" style="padding:16px 32px 0 32px;font-family:${FONT};">
    <div style="font-size:13px;line-height:20px;font-weight:700;color:${tints.inkMuted};padding-bottom:6px;">Mensaje</div>
    <div style="background-color:${tints.surface};border-left:3px solid ${palette.green};border-radius:6px;padding:14px 16px;font-size:14px;line-height:22px;color:${palette.ink};white-space:pre-wrap;word-break:break-word;">${escapeHtml(lead.message)}</div>
  </td>
</tr>
<tr>
  <td class="px" style="padding:22px 32px 6px 32px;font-family:${FONT};">
    <a href="mailto:${escapeHtml(lead.email)}?subject=${encodeURIComponent("Re: tu consulta a C-Legal")}" style="display:inline-block;background-color:${palette.ink};color:${palette.white};font-size:14px;line-height:20px;font-weight:700;text-decoration:none;padding:11px 18px;border-radius:8px;">Responder a ${escapeHtml(firstName(lead.name))}</a>
  </td>
</tr>
<tr>
  <td class="px" style="padding:16px 32px 26px 32px;font-family:${FONT};font-size:12px;line-height:18px;color:${tints.inkSubtle};">
    IP: ${escapeHtml(meta.ip)}<br>
    User-Agent: ${escapeHtml(meta.userAgent.slice(0, 240))}<br>
    Al responder este correo, la respuesta va directo al cliente (Reply-To).
  </td>
</tr>`;

  const text = [
    `NUEVO LEAD — ${serviceLabel}`,
    "",
    `Recibido: ${santiago} (${iso} UTC)`,
    `Nombre: ${lead.name}`,
    `Email: ${lead.email}`,
    `Teléfono: ${lead.phone}`,
    `Asunto / Servicio: ${serviceLabel}`,
    `Idioma del sitio: ${lead.lang === "en" ? "Inglés" : "Español"}`,
    "",
    "Mensaje:",
    lead.message,
    "",
    `IP: ${meta.ip}`,
    `User-Agent: ${meta.userAgent.slice(0, 240)}`,
  ].join("\n");

  return {
    subject: `[C-Legal] Nuevo lead: ${serviceLabel} — ${lead.name}`,
    html: layout({ preheader: `${lead.name} · ${lead.email} · ${lead.phone}`, body }),
    text,
  };
}
