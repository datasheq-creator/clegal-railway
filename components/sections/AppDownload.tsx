import Image from "next/image";
import appHome from "@/public/images/app-inicio.png";
import appStoreIcon from "@/public/images/app-store.png";
import googlePlayIcon from "@/public/images/google-play.png";
import { ContactTrigger } from "@/components/contact/ContactTrigger";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { storePaths } from "@/lib/site";

/**
 * Same behaviour as the DATASHEQ site: the store icons always point to /app/ios and
 * /app/android, which redirect to the store links set in lib/site.ts (or back to this
 * section while those links are empty). "Solicitar acceso" opens the contact form.
 */
export function AppDownload({ t }: { t: Dictionary["download"] }) {
  const stores = [
    { key: "ios", href: storePaths.ios, icon: appStoreIcon, label: t.appStore },
    { key: "android", href: storePaths.android, icon: googlePlayIcon, label: t.googlePlay },
  ] as const;

  return (
    <section id="descarga" aria-labelledby="descarga-title" className="overflow-hidden bg-surface py-20 md:py-28">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          <h2 id="descarga-title" className="text-[clamp(2rem,1.4rem+2vw,2.9rem)] leading-[1.08] font-extrabold tracking-[-0.02em]">
            {t.title} <span className="text-purple">{t.highlight}</span>
          </h2>
          <p className="mt-5 text-[1.05rem] leading-relaxed text-ink-muted">{t.body}</p>

          <p className="mt-9 font-semibold text-ink">{t.access}</p>
          <div className="mt-4 flex flex-col items-center gap-6 lg:items-start">
            <div>
              <p className="text-sm text-ink-muted">{t.chooseStore}</p>
              <ul className="mt-3 flex items-center justify-center gap-4 lg:justify-start">
                {stores.map((s) => (
                  <li key={s.key}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener"
                      aria-label={s.label}
                      title={s.label}
                      className="flex size-14 items-center justify-center rounded-xl bg-white shadow-card transition-transform hover:-translate-y-0.5"
                    >
                      <Image src={s.icon} alt="" sizes="36px" className="size-9 object-contain" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <ContactTrigger service="consulta" className="btn btn-primary h-13 min-w-52 px-8 text-[1.05rem]">
              {t.requestAccess}
            </ContactTrigger>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[28rem] lg:max-w-[32rem]">
          <Image
            src={appHome}
            alt={t.imageAlt}
            sizes="(min-width: 1024px) 512px, (min-width: 640px) 448px, 90vw"
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
