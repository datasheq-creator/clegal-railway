# C-Legal — web

Landing page for **C-Legal · Gestión Legal Inteligente** (Datasheq ecosystem), built from
`CLEGAL-PARA-REVISION.pdf` and the assets in `Images Clegal/`, with a "Contáctanos" lead
form that dispatches two SendGrid emails.

- **Stack:** Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS 4 · Zod 4 · `@sendgrid/mail` 8
- **Runtime:** single Node 22 process, Railway-ready (Dockerfile + `railway.toml`), binds `$PORT`
- **Languages:** Spanish at `/` (default), English at `/en`

## Quick start

```bash
cp .env.example .env          # fill in SendGrid values, or set SENDGRID_DRY_RUN=1
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

| Variable                     | Required | Notes                                                                                   |
| ---------------------------- | -------- | --------------------------------------------------------------------------------------- |
| `PORT`                       | yes\*    | Injected by Railway. Defaults to 3000 locally.                                          |
| `SENDGRID_API_KEY`           | yes      | API key with **Mail Send** permission.                                                  |
| `SENDGRID_SENDER_EMAIL`      | yes      | Must be a verified Single Sender or on an authenticated domain in SendGrid. Alias: `SENDGRID_FROM_EMAIL`. |
| `ADMIN_EMAIL`                | yes      | Company inbox that receives every lead (comma-separate several). Alias: `CONTACT_TO_EMAIL`. |
| `SENDGRID_SENDER_NAME`       | no       | "From" display name. Default `C-Legal`. Alias: `SENDGRID_FROM_NAME`.                    |
| `SENDGRID_DRY_RUN`           | no       | `1` logs emails instead of sending (local/staging). API key not required in this mode.  |
| `NEXT_PUBLIC_SITE_URL`       | no       | Public origin. Used for canonical/OG URLs and the logo image in emails. **Build-time.**  |
| `NEXT_PUBLIC_LOGIN_URL`      | no       | Shows the purple "Inicio de sesión" button when set. **Build-time.**                    |
| `NEXT_PUBLIC_APP_STORE_URL`  | no       | Makes the App Store badge a link and renders its QR code. **Build-time.**               |
| `NEXT_PUBLIC_PLAY_STORE_URL` | no       | Same for Google Play. **Build-time.**                                                   |
| `NEXT_PUBLIC_DATASHEQ_URL`   | no       | Target of "Conoce nuestras soluciones". Without it the button opens the contact modal.  |

The aliases are the variable names used by the DATASHEQ site, so both services can share the same
set of Railway variables (for example via a shared variable group).

Secrets are only read server-side and validated lazily (`lib/env.ts`), so `next build` does not
need them. `GET /api/health` reports `email: configured | dry-run | misconfigured` without
exposing values.

## Deploying to Railway

1. Push this folder to a Git repository and create a Railway service from it
   (or run `railway up` from this folder with the Railway CLI).
2. Railway reads `railway.toml`: Dockerfile build, health check on `/api/health`, restart on failure.
3. In **Variables**, add `SENDGRID_API_KEY`, `SENDGRID_SENDER_EMAIL`, `ADMIN_EMAIL`
   (and any optional ones). Railway sets `PORT` itself.
4. Generate a domain (or attach a custom one), set `NEXT_PUBLIC_SITE_URL` to it, and **redeploy** —
   `NEXT_PUBLIC_*` values are compiled into the build (the Dockerfile declares them as `ARG`,
   which is how Railway passes variables to Docker builds).
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
4. Rate limit: 5 accepted submissions per IP per 10 minutes → `429`.
5. Dispatch (`lib/email/dispatch.ts`):
   - both emails are rendered before any network call;
   - **internal notification** → `ADMIN_EMAIL`, Reply-To = the lead (reply goes straight to them);
     if SendGrid rejects it the request fails with `502`, nothing goes to the client, and the
     visitor can safely retry;
   - **client confirmation** → the visitor, Reply-To = `ADMIN_EMAIL`; sent only after the lead is
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
