import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SITE_URL } from "@/lib/site";

const inter = localFont({
  src: "./fonts/InterVariable-latin.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-inter",
});

const t = getDictionary("es").notFound;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `404 — ${t.title} | C-Legal`,
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="es-CL" className={inter.variable}>
      <body className="flex min-h-dvh items-center justify-center bg-white px-6 font-sans text-ink">
        <main className="max-w-md text-center">
          <p className="text-sm font-extrabold tracking-[0.18em] text-green uppercase">404</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{t.title}</h1>
          <p className="mt-3 text-ink-muted">{t.text}</p>
          <a href="/" className="btn btn-primary mt-8 h-12 px-6">
            {t.back}
          </a>
        </main>
      </body>
    </html>
  );
}
