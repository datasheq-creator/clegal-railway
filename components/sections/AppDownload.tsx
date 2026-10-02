import Image from "next/image";
import QRCode from "qrcode";
import appHome from "@/public/images/app-inicio.png";
import appStoreIcon from "@/public/images/app-store.png";
import googlePlayIcon from "@/public/images/google-play.png";
import { ContactTrigger } from "@/components/contact/ContactTrigger";
import { palette } from "@/lib/brand";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { links } from "@/lib/site";

async function qrSvg(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: palette.ink, light: palette.white },
  });
}

export async function AppDownload({ t }: { t: Dictionary["download"] }) {
  const stores = [
    { key: "appStore", url: links.appStore, icon: appStoreIcon, label: t.appStore, qrLabel: t.qrAppStore },
    { key: "playStore", url: links.playStore, icon: googlePlayIcon, label: t.googlePlay, qrLabel: t.qrGooglePlay },
  ] as const;
  const withUrl = stores.filter((s) => s.url);
  const qrs = await Promise.all(withUrl.map(async (s) => ({ ...s, svg: await qrSvg(s.url as string) })));

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
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        title={s.label}
                        className="flex size-14 items-center justify-center rounded-xl bg-white shadow-card transition-transform hover:-translate-y-0.5"
                      >
                        <Image src={s.icon} alt="" sizes="36px" className="size-9 object-contain" />
                      </a>
                    ) : (
                      <span title={s.label} className="flex size-14 items-center justify-center rounded-xl bg-white shadow-card">
                        <Image src={s.icon} alt={s.label} sizes="36px" className="size-9 object-contain" />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {qrs.length > 0 ? (
              <div className="hidden sm:block">
                <p className="text-sm text-ink-muted">{t.scan}</p>
                <ul className="mt-3 flex gap-5">
                  {qrs.map((q) => (
                    <li key={q.key} className="rounded-xl bg-white p-3 shadow-card">
                      <div role="img" aria-label={q.qrLabel} className="size-24 [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: q.svg }} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          {qrs.length === 0 ? (
            <ContactTrigger service="plan-libre" className="btn btn-purple mt-8 h-12 px-6">
              {t.requestAccess}
            </ContactTrigger>
          ) : null}
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
