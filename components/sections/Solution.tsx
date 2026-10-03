import Image from "next/image";
import laptop from "@/public/images/solucion-laptop.png";
import apps from "@/public/images/solucion-apps.png";
import { BoltIcon, ChartIcon, CheckIcon, RobotIcon, ShieldCheckIcon } from "@/components/icons";
import { Rich } from "@/components/Rich";
import type { Dictionary, ValueIcon } from "@/lib/i18n/dictionaries";

const VALUE_ICONS: Record<ValueIcon, typeof RobotIcon> = {
  robot: RobotIcon,
  chart: ChartIcon,
  bolt: BoltIcon,
  shield: ShieldCheckIcon,
};

function CardHeading({ number, title, id }: { number: string; title: string; id: string }) {
  return (
    <>
      <p className="text-lg font-extrabold text-purple" aria-hidden="true">
        {number}
      </p>
      <h3 id={id} className="mt-3 text-[1.35rem] leading-[1.15] font-extrabold tracking-[-0.01em] text-ink">
        {title}
      </h3>
    </>
  );
}

const card = "relative flex flex-col rounded-[1.25rem] border-[1.5px] border-purple bg-white px-7 pt-9 sm:px-9";

export function Solution({ t }: { t: Dictionary["solution"] }) {
  const { problem, platform, value } = t;
  return (
    <section id="solucion" aria-labelledby="solucion-title" className="pt-20 pb-24 md:pt-28 lg:pb-36">
      <h2 id="solucion-title" className="sr-only">
        {t.srTitle}
      </h2>
      <div className="container-page grid gap-8 md:grid-cols-2 lg:max-w-[72rem] lg:grid-cols-3 lg:gap-7 xl:gap-9">
        {/* 01 — the problem */}
        <article aria-labelledby="sol-1" className={`${card} pb-0`}>
          <CardHeading number={problem.number} title={problem.title} id="sol-1" />
          <ul className="mt-8 space-y-3 text-[0.95rem] text-ink-muted">
            {problem.items.map((item) => (
              <li key={item} className="flex gap-2.5">
                <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-green" aria-hidden="true" />
                <span>
                  <Rich text={item} strongClassName="font-semibold text-ink-muted" />
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-10">
            <Image
              src={laptop}
              alt={problem.imageAlt}
              sizes="(min-width: 1280px) 470px, (min-width: 1024px) 38vw, (min-width: 768px) 46vw, 92vw"
              className="relative -mb-6 h-auto w-[118%] max-w-none -translate-x-[16%] sm:-mb-8 lg:w-[140%] lg:-translate-x-[30%]"
            />
          </div>
        </article>

        {/* 02 — the platform */}
        <article aria-labelledby="sol-2" className={`${card} pb-0`}>
          <CardHeading number={platform.number} title={platform.title} id="sol-2" />
          <ul className="mt-8 space-y-3.5 text-[0.95rem] text-ink-muted">
            {platform.items.map((item) => (
              <li key={item} className="flex items-center gap-4">
                <CheckIcon size={26} strokeWidth={3.25} className="shrink-0 text-purple" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-10">
            <Image
              src={apps}
              alt={platform.imageAlt}
              sizes="(min-width: 1280px) 380px, (min-width: 1024px) 30vw, (min-width: 768px) 46vw, 92vw"
              className="relative mx-auto -mb-10 h-auto w-[108%] max-w-none -translate-x-[4%] sm:-mb-14"
            />
          </div>
        </article>

        {/* 03 — the value */}
        <article aria-labelledby="sol-3" className={`${card} pb-10 md:col-span-2 lg:col-span-1`}>
          <CardHeading number={value.number} title={value.title} id="sol-3" />
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {value.items.map(({ icon, title, text }) => {
              const Icon = VALUE_ICONS[icon];
              return (
                <li key={title} className="flex gap-5">
                  <Icon size={42} strokeWidth={1.6} className="shrink-0 text-purple" />
                  <div className="text-[0.95rem] leading-relaxed">
                    <p className="font-semibold text-ink">{title}</p>
                    <p className="text-ink-muted">{text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </article>
      </div>
    </section>
  );
}
