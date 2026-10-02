import Image from "next/image";
import appHome from "@/public/images/app-inicio.png";
import appStoreIcon from "@/public/images/app-store.png";
import googlePlayIcon from "@/public/images/google-play.png";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { storePaths } from "@/lib/site";

/**
 * Same behaviour as the DATASHEQ site: the store icons and the QR codes always point to
 * /app/ios and /app/android, which redirect to the store links set in lib/site.ts
 * (or back to this section while those links are empty).
 */
export function AppDownload({ t }: { t: Dictionary["download"] }) {
  const stores = [
    { key: "ios", href: storePaths.ios, qr: "/qr/ios.svg", icon: appStoreIcon, label: t.appStore, qrLabel: t.qrAppStore },
    { key: "android", href: storePaths.android, qr: "/qr/android.svg", icon: googlePlayIcon, label: t.googlePlay, qrLabel: t.qrGooglePlay },
  ] as const;

  return (
    <section id="descarga" aria-labelledby="descarga-title" className="overflow-hidden bg-surface py-20 md:py-28">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="max-w-xl">
          <h2 id="descarga-title" className="text-[clamp(2rem,1.4rem+2vw,2.9rem)] leading-[1.08] font-extrabold tracking-[-0.02em]">
            {t.title} <span className="text-purple">{t.highlight}</span>
          </h2>
          <p className="mt-5 text-[1.05rem] leading-relaxed text-ink-muted">{t.body}</p>

          <p className="mt-9 font-semibold text-ink">{t.access}</p>
          <div className="mt-4 flex flex-wrap items-start gap-x-14 gap-y-8">
            <div>
              <p className="text-sm text-ink-muted">{t.chooseStore}</p>
              <ul className="mt-3 flex items-center gap-4">
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

            <div>
              <p className="text-sm text-ink-muted">{t.scan}</p>
              <ul className="mt-3 flex gap-5">
                {stores.map((s) => (
                  <li key={s.key} className="rounded-xl bg-white p-3 shadow-card">
                    {/* eslint-disable-next-line @next/next/no-img-element -- runtime SVG from /qr/*.svg */}
                    <img src={s.qr} alt={s.qrLabel} width={96} height={96} className="size-24" loading="lazy" />
                  </li>
                ))}
              </ul>
            </div>
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
