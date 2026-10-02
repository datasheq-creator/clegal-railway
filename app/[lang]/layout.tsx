import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import "../globals.css";
import { getDictionary, isLocale, locales, localePath } from "@/lib/i18n/dictionaries";
import { palette } from "@/lib/brand";
import { PHONE_E164, SITE_URL } from "@/lib/site";

const inter = localFont({
  src: "../fonts/InterVariable-latin.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: palette.white,
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  const ogImage = { url: "/og-image.jpg", width: 1200, height: 630, alt: t.meta.ogAlt, type: "image/jpeg" };
  return {
    metadataBase: new URL(SITE_URL),
    title: t.meta.title,
    description: t.meta.description,
    applicationName: "C-Legal",
    alternates: {
      canonical: localePath(lang),
      languages: { "es-CL": "/", en: "/en", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      siteName: "C-Legal",
      title: t.meta.title,
      description: t.meta.description,
      locale: lang === "es" ? "es_CL" : "en_US",
      alternateLocale: lang === "es" ? ["en_US"] : ["es_CL"],
      url: localePath(lang),
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description, images: [ogImage] },
    formatDetection: { telephone: true },
    other: { "contact:phone_number": PHONE_E164 },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang === "es" ? "es-CL" : "en"} className={inter.variable}>
      <body className="min-h-dvh bg-white font-sans text-ink">{children}</body>
    </html>
  );
}
