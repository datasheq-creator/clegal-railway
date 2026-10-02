import { ContactTrigger } from "@/components/contact/ContactTrigger";
import { ChatIcon, MailIcon, PhoneIcon } from "@/components/icons";
import { Logo } from "@/components/Logo";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { PHONE_DISPLAY, PHONE_TEL_HREF, whatsappHref } from "@/lib/site";

export function Footer({ t, nav, whatsappPrefill }: { t: Dictionary["footer"]; nav: Dictionary["nav"]; whatsappPrefill: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink text-white">
      <div className="container-page grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:py-16">
        <div>
          <Logo variant="inline" />
          <p className="mt-4 max-w-xs text-sm text-ink-faint">{t.tagline}</p>
        </div>

        <nav aria-label={t.navTitle}>
          <h2 className="text-xs font-extrabold tracking-[0.14em] text-green uppercase">{t.navTitle}</h2>
          <ul className="mt-4 space-y-2.5 text-[0.95rem]">
            <li>
              <a href="#inicio" className="text-line hover:text-white">
                {nav.home}
              </a>
            </li>
            <li>
              <a href="#solucion" className="text-line hover:text-white">
                {nav.solution}
              </a>
            </li>
            <li>
              <a href="#planes" className="text-line hover:text-white">
                {nav.plans}
              </a>
            </li>
            <li>
              <a href="#nosotros" className="text-line hover:text-white">
                {nav.about}
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-extrabold tracking-[0.14em] text-green uppercase">{t.contactTitle}</h2>
          <ul className="mt-4 space-y-3 text-[0.95rem]">
            <li>
              <a href={PHONE_TEL_HREF} className="inline-flex items-center gap-2.5 text-line hover:text-white">
                <PhoneIcon size={18} className="text-green" />
                <span>
                  <span className="sr-only">{t.phone}: </span>
                  {PHONE_DISPLAY}
                </span>
              </a>
            </li>
            <li>
              <a
                href={whatsappHref(whatsappPrefill)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-line hover:text-white"
              >
                <ChatIcon size={18} className="text-green" />
                {t.whatsapp}
              </a>
            </li>
            <li>
              <ContactTrigger className="inline-flex cursor-pointer items-center gap-2.5 text-line hover:text-white">
                <MailIcon size={18} className="text-green" />
                {nav.contact}
              </ContactTrigger>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-ink-faint sm:flex-row sm:justify-between">
          <p>
            © {year} C-Legal. {t.rights}
          </p>
          <p>{t.ecosystem}</p>
        </div>
      </div>
    </footer>
  );
}
