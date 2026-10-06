import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/dictionaries";

function Block({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return (
    <div>
      <h3 className="text-[clamp(1.6rem,1.3rem+1vw,2.1rem)] font-extrabold tracking-[-0.015em] text-ink">{title}</h3>
      <div className="mt-4 space-y-4 text-[1.02rem] leading-relaxed text-ink-muted">
        {paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </div>
  );
}

type Member = Dictionary["about"]["team"]["members"][number];

function TeamMember({ m }: { m: Member }) {
  return (
    <li className="flex flex-col items-center text-center">
      <Image
        src={m.photo}
        alt={m.name}
        width={278}
        height={278}
        sizes="(min-width: 1280px) 184px, (min-width: 640px) 168px, 152px"
        className="aspect-square w-full max-w-[9.5rem] rounded-full bg-surface object-cover sm:max-w-[11.5rem]"
      />
      <p className="mt-4 text-[1.02rem] leading-tight font-bold text-ink">{m.name}</p>
      <p className="mt-1 text-[0.95rem] text-ink-muted">{m.role}</p>
    </li>
  );
}

export function About({ t }: { t: Dictionary["about"] }) {
  return (
    <section id="nosotros" aria-labelledby="nosotros-title" className="py-20 md:py-28">
      <div className="container-page grid items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-12 xl:gap-16">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <h2 id="nosotros-title" className="text-xs font-extrabold tracking-[0.14em] text-purple uppercase">
            {t.eyebrow}
          </h2>
          <div className="mt-4 space-y-12">
            <Block {...t.mission} />
            <Block {...t.vision} />
            <Block {...t.team} />
          </div>
        </div>

        <ul className="mx-auto grid w-full max-w-[38rem] grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5">
          {t.team.members.map((m) => (
            <TeamMember key={m.name} m={m} />
          ))}
        </ul>
      </div>
    </section>
  );
}
