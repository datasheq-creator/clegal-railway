import { ContactTrigger } from "@/components/contact/ContactTrigger";
import { ArrowRightIcon } from "@/components/icons";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { links } from "@/lib/site";

export function FinalCta({ t }: { t: Dictionary["finalCta"] }) {
  const ecosystemClass =
    "inline-flex h-11 items-center rounded-lg border-[1.5px] border-ink px-4 text-[1.05rem] font-semibold text-ink-muted transition-colors hover:bg-surface hover:text-ink sm:text-[1.15rem]";

  return (
    <section aria-labelledby="cta-title" className="py-24 md:py-36">
      <div className="container-page flex flex-col items-center text-center">
        <h2 id="cta-title" className="text-[clamp(1.75rem,1.2rem+2.4vw,3rem)] leading-[1.08] font-extrabold tracking-[-0.02em]">
          <span className="block text-ink">{t.title}</span>
          <span className="block text-purple">{t.highlight}</span>
        </h2>
        <p className="mt-6 max-w-2xl text-[clamp(1.05rem,0.95rem+0.4vw,1.3rem)] leading-snug font-semibold text-ink-muted">
          {t.subtitleLines.map((line) => (
            <span key={line} className="sm:block">
              {line}{" "}
            </span>
          ))}
        </p>
        <ContactTrigger service="demo" className="btn btn-primary mt-9 h-14 min-w-60 px-10 text-[1.1rem]">
          {t.button}
        </ContactTrigger>

        <div className="mt-10 flex flex-col items-center gap-3 text-[1.05rem] text-ink-muted sm:flex-row sm:text-[1.15rem]">
          <span className="inline-flex items-center gap-2">
            {t.ecosystem}
            <ArrowRightIcon size={20} strokeWidth={2.5} className="hidden text-purple sm:block" />
          </span>
          {links.datasheq ? (
            <a href={links.datasheq} target="_blank" rel="noopener" className={ecosystemClass}>
              {t.ecosystemCta}
            </a>
          ) : (
            <ContactTrigger service="datasheq" className={ecosystemClass}>
              {t.ecosystemCta}
            </ContactTrigger>
          )}
        </div>
      </div>
    </section>
  );
}
