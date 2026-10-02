import { notFound } from "next/navigation";
import { ContactProvider } from "@/components/contact/ContactProvider";
import { Header } from "@/components/Header";
import { About } from "@/components/sections/About";
import { AppDownload } from "@/components/sections/AppDownload";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Plans } from "@/components/sections/Plans";
import { Solution } from "@/components/sections/Solution";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getDictionary, isLocale, localePath } from "@/lib/i18n/dictionaries";
import { links, PHONE_E164, SITE_URL, whatsappHref } from "@/lib/site";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "C-Legal",
    url: `${SITE_URL}${localePath(lang) === "/" ? "" : localePath(lang)}`,
    logo: `${SITE_URL}/icon.png`,
    description: t.meta.description,
    telephone: PHONE_E164,
    parentOrganization: { "@type": "Organization", name: "Datasheq" },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: PHONE_E164,
        contactType: "sales",
        areaServed: "CL",
        availableLanguage: ["es", "en"],
        url: whatsappHref(),
      },
    ],
  };

  return (
    <ContactProvider dict={t.contact} lang={lang}>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        {t.skipToContent}
      </a>
      <Header nav={t.nav} whatsappPrefill={t.whatsapp.prefill} lang={lang} loginUrl={links.login} />
      <main id="contenido" tabIndex={-1} className="outline-none">
        <Hero t={t.hero} />
        <Solution t={t.solution} />
        <Plans t={t.plans} />
        <AppDownload t={t.download} />
        <About t={t.about} />
        <FinalCta t={t.finalCta} />
      </main>
      <Footer t={t.footer} nav={t.nav} whatsappPrefill={t.whatsapp.prefill} />
      <WhatsAppButton label={t.whatsapp.fab} prefill={t.whatsapp.prefill} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </ContactProvider>
  );
}
