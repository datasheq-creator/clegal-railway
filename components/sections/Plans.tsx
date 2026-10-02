import { ContactTrigger } from "@/components/contact/ContactTrigger";
import { CheckIcon, MinusIcon } from "@/components/icons";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Plans({ t }: { t: Dictionary["plans"] }) {
  return (
    <section id="planes" aria-labelledby="planes-title" className="bg-white pt-8 pb-24 md:pb-32">
      <div className="container-page">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-extrabold tracking-[0.18em] text-green uppercase">{t.eyebrow}</p>
          <h2 id="planes-title" className="mt-4 text-[clamp(1.75rem,1.3rem+1.6vw,2.4rem)] leading-[1.12] font-extrabold tracking-[-0.015em]">
            {t.titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="mt-5 text-[0.95rem] text-ink-muted">{t.subtitle}</p>
        </header>

        <ul className="mx-auto mt-14 grid max-w-md gap-6 md:max-w-3xl md:grid-cols-2 md:gap-x-5 md:gap-y-8 lg:mt-16 xl:max-w-none xl:grid-cols-4 xl:gap-5">
          {t.items.map((plan) => {
            const recommended = plan.highlight === "recommended";
            const outlined = plan.highlight === "outlined";
            return (
              <li
                key={plan.id}
                aria-labelledby={`plan-${plan.id}`}
                className={`relative flex flex-col rounded-xl bg-white px-6 pt-8 pb-6 ${
                  recommended
                    ? "border border-line shadow-glow"
                    : outlined
                      ? "border-[1.5px] border-green shadow-card"
                      : "border border-line shadow-card"
                } ${recommended ? "mt-4 md:mt-0" : ""}`}
              >
                {recommended ? (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-green px-5 py-1.5 text-xs font-semibold whitespace-nowrap text-on-green">
                    {t.recommended}
                  </span>
                ) : null}

                <h3 id={`plan-${plan.id}`} className="text-[0.95rem] font-bold text-ink">
                  {plan.name}
                </h3>

                <div className="mt-4 flex min-h-11 items-baseline gap-2">
                  {plan.price ? (
                    <>
                      <span className="text-[1.65rem] leading-none font-extrabold tracking-[-0.02em] whitespace-nowrap text-ink xl:text-[1.4rem] 2xl:text-[1.6rem]">
                        {plan.price}
                      </span>
                      {plan.period ? <span className="text-sm text-ink-muted">{plan.period}</span> : null}
                    </>
                  ) : (
                    <span className="flex items-center gap-3 self-center text-sm text-ink-muted">
                      <span className="h-[3px] w-5 rounded-full bg-ink" aria-hidden="true" />
                      {t.comingSoon}
                    </span>
                  )}
                </div>

                <ul className="mt-4 mb-8 text-[0.875rem]">
                  {plan.features.map((f) => (
                    <li
                      key={f.label}
                      className={`flex items-center gap-3 border-b border-dashed border-line py-2.5 ${
                        f.included ? "text-ink" : "text-ink-faint"
                      }`}
                    >
                      {f.included ? (
                        <CheckIcon size={16} strokeWidth={3} className="shrink-0 text-green" />
                      ) : (
                        <MinusIcon size={16} strokeWidth={2} className="shrink-0 text-ink-faint" />
                      )}
                      <span>
                        {f.label}
                        {!f.included ? <span className="sr-only"> — {t.notIncluded}</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>

                <ContactTrigger
                  service={plan.service}
                  className={`btn mt-auto h-13 w-full text-[1.05rem] ${
                    plan.ctaVariant === "primary" ? "btn-primary" : "btn-outline text-ink"
                  }`}
                >
                  {plan.cta}
                  <span className="sr-only"> — {plan.name}</span>
                </ContactTrigger>
              </li>
            );
          })}
        </ul>
        <p className="mt-8 text-center text-xs text-ink-subtle">{t.currencyNote}</p>
      </div>
    </section>
  );
}
