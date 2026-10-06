import Image from "next/image";
import heroPhone from "@/public/images/hero-phone.png";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Hero({ t }: { t: Dictionary["hero"] }) {
  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative overflow-hidden">
      <div className="container-page grid items-center gap-y-10 pt-12 md:pt-16 lg:min-h-[calc(100svh-6rem)] lg:max-h-[52rem] lg:grid-cols-[1.05fr_1fr] lg:gap-x-6 lg:pt-0">
        <div className="mx-auto max-w-[38rem] text-center lg:mx-0 lg:pb-12 lg:text-left">
          <h1 id="hero-title" className="text-[clamp(2.25rem,1.2rem+2.4vw,2.75rem)] leading-[1.05] font-extrabold tracking-[-0.02em]">
            <span className="block text-ink">{t.title}</span>
            <span className="block text-purple xl:whitespace-nowrap">{t.highlight}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[34rem] lg:mx-0 text-[clamp(1.125rem,1rem+0.5vw,1.4rem)] leading-snug font-medium text-ink-muted">
            {t.subtitle}
          </p>
          <div className="mt-9 flex flex-col gap-3 xs:flex-row xs:justify-center xs:gap-6 lg:justify-start">
            <a href="#solucion" className="btn btn-primary h-14 px-8 text-[1.05rem] xs:min-w-52">
              {t.primaryCta}
            </a>
            <a href="#planes" className="btn btn-outline h-14 px-8 text-[1.05rem] text-ink xs:min-w-52">
              {t.secondaryCta}
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[26rem] self-end sm:max-w-[30rem] lg:mx-0 lg:max-w-none lg:pt-8">
          <Image
            src={heroPhone}
            alt={t.imageAlt}
            priority
            fetchPriority="high"
            placeholder="empty"
            sizes="(min-width: 1248px) 600px, (min-width: 1024px) 48vw, (min-width: 640px) 480px, 90vw"
            className="mx-auto h-auto w-full max-w-[37.5rem] lg:ml-auto lg:max-h-[calc(100svh-8rem)] lg:w-auto"
          />
        </div>
      </div>
    </section>
  );
}
