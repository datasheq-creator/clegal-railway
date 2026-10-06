# C-Legal — web

Landing page for **C-Legal · Gestión Legal Inteligente** (Datasheq ecosystem), built from
`CLEGAL-PARA-REVISION.pdf` and the assets in `Images Clegal/`, with a "Contáctanos" lead
form that dispatches two SendGrid emails.

- **Stack:** Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS 4 · Zod 4 · `@sendgrid/mail` 8
- **Runtime:** single Node 22 process, Railway-ready (Dockerfile + `railway.toml`), binds `$PORT`
- **Languages:** Spanish at `/` (default), English at `/en`

## Quick start

```bash
cp .env.example .env          # optional: without SendGrid values, emails are saved to ./.mail-outbox
npm install
npm run dev                   # http://localhost:3000
```

| Script              | What it does                                                    |
| ------------------- | --------------------------------------------------------------- |
| `npm run dev`       | Dev server with hot reload                                      |
| `npm run build`     | Production build (type-checks, prerenders `/` and `/en`)        |
| `npm start`         | Production server on `$PORT` (default 3000), host `0.0.0.0`      |
| `npm test`          | Vitest: schema, email templates, `/api/contact` (SendGrid mocked) |
| `npm run typecheck` | `tsc --noEmit`                                                  |

## Environment variables

**Same variables as the DATASHEQ site** — both Railway services are configured the same way.
Links are not variables: login, App Store / Google Play and the Datasheq site are set in
`lib/site.ts` (edit and redeploy to change them).

| Variable | Required | Purpose |
|---|---|---|
| `SENDGRID_API_KEY` | yes | API key with **Mail Send** permission |
| `SENDGRID_FROM_EMAIL` | yes | Sender address — must be verified in SendGrid |
| `SENDGRID_FROM_NAME` | no | Sender name (default `C-Legal`) |
| `CONTACT_TO_EMAIL` | yes | Company inbox(es) that receive each request, comma-separated |
| `CLIENT_REPLY_TO` | no | Reply-To on the client email (default: first `CONTACT_TO_EMAIL`) |
| `PUBLIC_BASE_URL` | no | e.g. `https://clegal.datasheq.com`. Used for the logo/links in emails and SEO tags. Defaults to Railway's public domain |
| `SENDGRID_SANDBOX` | no | `true` = SendGrid validates but doesn't deliver (testing) |
| `SENDGRID_DATA_RESIDENCY` | no | `eu` only for EU-residency SendGrid subusers |
| `CONTACT_RATE_LIMIT` | no | Successful submissions per IP per 10 min (default 5) |

Railway sets `PORT` and `RAILWAY_PUBLIC_DOMAIN` itself. The previous names `SENDGRID_SENDER_EMAIL`,
`SENDGRID_SENDER_NAME` and `ADMIN_EMAIL` still work as fallbacks.

Without SendGrid configured, development saves both emails to `./.mail-outbox` (open them in a
browser); in production the form returns an error instead. `GET /healthz` (also `/api/health`)
returns `{ status, version, mail: { configured, sandbox } }` without exposing values.

### Links (`lib/site.ts`)

| Setting | Value | Used by |
|---|---|---|
| `loginUrl` | `https://app.datasheq.com` | "Inicio de sesión" button |
| `datasheqUrl` | `https://web.datasheq.com` | "Conoce nuestras soluciones" |
| `app.appStoreUrl` / `app.googlePlayUrl` | empty (fill in when published) | Store icons, via `/app/ios` and `/app/android` (they open the "Descarga" section while empty) |

## Deploying to Railway

1. Push this folder to a Git repository and create a Railway service from it
   (or run `railway up` from this folder with the Railway CLI).
2. Railway reads `railway.toml`: Dockerfile build, health check on `/healthz`, restart on failure.
3. In **Variables**, add `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `CONTACT_TO_EMAIL`
   (and any optional ones) — the same as the DATASHEQ service. Railway sets `PORT` itself.
4. Generate a domain (or attach a custom one). Optionally set `PUBLIC_BASE_URL` to it; otherwise
   the Railway domain is used.
5. In SendGrid: verify the sender (Settings → Sender Authentication). Domain authentication
   (SPF/DKIM) is strongly recommended so confirmations don't land in spam.

Without Docker, any Node 22 host works with `npm ci && npm run build && npm start`.

The rate limiter is in-memory, which is correct for the single instance this targets. If the
service is ever scaled to several replicas, move it to Redis.

## Contact flow

`POST /api/contact` (JSON) → `app/api/contact/route.ts`

1. Content-type, 16 KB body cap, JSON shape.
2. Honeypot field (`company_website`): bots get a fake `200`, nothing is sent.
3. Zod validation with the **same schema the modal uses** (`lib/contact/schema.ts`).
   Errors return `422` with per-field codes that the UI localizes.
4. Rate limit: `CONTACT_RATE_LIMIT` (default 5) accepted submissions per IP per 10 minutes → `429`.
5. Dispatch (`lib/email/dispatch.ts`):
   - both emails are rendered before any network call;
   - **internal notification** → `CONTACT_TO_EMAIL`, Reply-To = the lead (reply goes straight to them);
     if SendGrid rejects it the request fails with `502`, nothing goes to the client, and the
     visitor can safely retry;
   - **client confirmation** → the visitor, Reply-To = `CLIENT_REPLY_TO` (or the first `CONTACT_TO_EMAIL`); sent only after the lead is
     delivered. If this second call fails the lead is already captured, so the API returns `200`
     with `confirmation: "failed"` and logs the error.

   SendGrid cannot send two different messages in one transaction, so this ordering is the
   closest practical equivalent to an atomic dispatch: no confirmation is ever sent for a lead the
   team didn't receive.

Emails (`lib/email/templates.ts`) are table-based with inline styles, a mobile `<style>`
fallback and plain-text parts. The confirmation never echoes the visitor's free-text message, and
names are restricted to letters, so the form can't be used to relay spam from your domain.
Click/open tracking is disabled so `tel:` and WhatsApp links stay intact.

## Design system

- Palette from `PALETA-COLORES.png`: ink `#10102a`, blue `#1b33c8`, purple `#c200ff`,
  green `#04dd75` (+ white). Declared once in `app/globals.css` (`@theme`) and mirrored in
  `lib/brand.ts` for emails. Tailwind's default colours are disabled (`--color-*: initial`), so
  only tokens exist as utilities; neutrals and tints are `color-mix()` of these tokens.
- Typography: Inter variable, self-hosted (`app/fonts`, OFL), loaded with `next/font/local`.
- The design puts white text on the green buttons, which is below WCAG AA contrast. It's kept for
  fidelity; switch `--color-on-green` to `var(--color-ink)` to fix it everywhere.

## Assets

Processed copies of `Images Clegal/` live in `public/`; Next's image optimizer serves AVIF/WebP
with responsive `srcset`.

| Source file                         | Used as                                   | Processing                                       |
| ----------------------------------- | ----------------------------------------- | ------------------------------------------------ |
| `CLEGAL-HOME-img1.png`              | Hero phone (`images/hero-phone.png`)      | Cleared hidden pixels, trimmed, 1200 px wide     |
| `CLEGAL-HOME-img2.png`              | Solution card 01 laptop                   | Cleared hidden pixels, trimmed                   |
| `CLEGAL-HOME-img3.png`              | Solution card 02 phones                   | Cleared hidden pixels, trimmed                   |
| `CLEGAL-HOME.png`                   | "Descarga nuestra app" section            | Trimmed, 1000 px wide                            |
| `1.png`, `2.png`                    | App Store / Google Play badges            | Resized                                          |
| `DATASHEQ-HOME-icono-descarga.png`  | Header download icon                      | Trimmed                                          |
| `LOGO-C-LEGAL.jpg`                  | Logo mark, favicons, email logo           | Black background removed (colour-to-alpha)       |
| `CLEGAL-NOSOTROS.jpg`               | "Nosotros" layout, team portraits, wordmark | Portraits cropped; "C-LEGAL" wordmark vectorised to SVG |
| `favicon.png`                       | `app/favicon.ico`                         | Converted                                        |

`public/og-image.jpg` (1200×630) is composed from the hero image and logo.

## Project layout

```
app/
  [lang]/layout.tsx, page.tsx   root layout + landing (es, en prerendered)
  api/contact/route.ts          lead endpoint
  api/health/route.ts           Railway health check
  global-not-found.tsx          404 for unmatched URLs
  globals.css                   design tokens + base styles
components/
  Header, Logo, WhatsAppButton, icons
  contact/                      ContactProvider (dialog), ContactForm, ContactTrigger
  sections/                     Hero, Solution, Plans, AppDownload, About, FinalCta, Footer
lib/
  brand.ts  site.ts  env.ts  rate-limit.ts
  contact/schema.ts             shared Zod schema
  email/templates.ts, dispatch.ts
  i18n/dictionaries.ts          all copy (es/en)
proxy.ts                        serves Spanish at "/" (rewrite to /es), /es → / redirect
tests/                          Vitest suites
```

Deep link: any URL ending in `#contacto` opens the contact modal on load.
