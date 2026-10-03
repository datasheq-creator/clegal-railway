"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import downloadIcon from "@/public/brand/icono-descarga.png";
import { ContactTrigger } from "@/components/contact/ContactTrigger";
import { ChatIcon, CloseIcon, LoginIcon, MenuIcon, PhoneIcon } from "@/components/icons";
import { Logo } from "@/components/Logo";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";
import { PHONE_DISPLAY, PHONE_TEL_HREF, whatsappHref } from "@/lib/site";

type Props = {
  nav: Dictionary["nav"];
  whatsappPrefill: string;
  lang: Locale;
  loginUrl: string | null;
};

function LangSwitch({ lang, label }: { lang: Locale; label: string }) {
  const item = (code: Locale) => {
    const active = code === lang;
    return (
      <Link
        href={localePath(code)}
        hrefLang={code}
        lang={code}
        aria-current={active ? "true" : undefined}
        className={`flex h-8 min-w-10 items-center justify-center rounded-md px-2.5 text-[0.8rem] font-bold transition-colors ${
          active ? "bg-ink text-white" : "text-ink hover:bg-surface"
        }`}
      >
        {code.toUpperCase()}
      </Link>
    );
  };
  return (
    <nav aria-label={label} className="flex items-center rounded-lg border border-line bg-white p-0.5 shadow-header">
      {item("es")}
      {item("en")}
    </nav>
  );
}

export function Header({ nav, whatsappPrefill, lang, loginUrl }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const panelId = useId();

  const links = [
    { href: "#inicio", label: nav.home },
    { href: "#solucion", label: nav.solution },
    { href: "#planes", label: nav.plans },
    { href: "#nosotros", label: nav.about },
  ];

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    const mq = window.matchMedia("(min-width: 64rem)");
    const onMq = () => mq.matches && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 shadow-header backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-20 max-w-[90rem] items-center justify-between gap-4 px-5 md:px-8 lg:h-24 xl:px-10">
        <Link href={`${localePath(lang)}#inicio`} aria-label={nav.homeLink} className="shrink-0 text-ink" onClick={close}>
          <Logo priority />
        </Link>

        <nav aria-label={nav.primary} className="hidden lg:block">
          <ul className="flex items-center gap-7 xl:gap-9">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-[0.95rem] font-medium text-ink transition-colors hover:text-purple">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-4 lg:flex xl:gap-6">
          <LangSwitch lang={lang} label={nav.language} />
          {loginUrl ? (
            <a href={loginUrl} className="btn btn-purple h-11 px-4 text-[0.9rem]">
              <LoginIcon size={18} />
              {nav.login}
            </a>
          ) : null}
          <ContactTrigger className="btn btn-outline h-11 min-w-40 px-5 text-[0.95rem] font-medium">{nav.contact}</ContactTrigger>
          <a
            href="#descarga"
            className="flex size-11 items-center justify-center rounded-lg transition-transform hover:-translate-y-0.5"
            aria-label={nav.download}
            title={nav.download}
          >
            <Image src={downloadIcon} alt="" className="h-8 w-auto" sizes="32px" />
          </a>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <a href="#descarga" className="flex size-11 items-center justify-center" aria-label={nav.download}>
            <Image src={downloadIcon} alt="" className="h-7 w-auto" sizes="28px" />
          </a>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-lg text-ink hover:bg-surface"
            aria-expanded={menuOpen}
            aria-controls={panelId}
            aria-label={menuOpen ? nav.closeMenu : nav.openMenu}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <CloseIcon size={26} /> : <MenuIcon size={26} />}
          </button>
        </div>
      </div>

      <div
        id={panelId}
        hidden={!menuOpen}
        className="animate-fade-in absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-line bg-white shadow-card lg:hidden"
      >
        <nav aria-label={nav.primary} className="px-5 py-4 md:px-8">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={close} className="block border-b border-line py-3.5 text-lg font-semibold text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-3">
            <ContactTrigger onOpen={close} className="btn btn-outline h-12 w-full text-base">
              {nav.contact}
            </ContactTrigger>
            {loginUrl ? (
              <a href={loginUrl} className="btn btn-purple h-12 w-full text-base">
                <LoginIcon size={18} />
                {nav.login}
              </a>
            ) : null}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <LangSwitch lang={lang} label={nav.language} />
            <div className="flex items-center gap-4 text-sm font-semibold text-ink">
              <a href={PHONE_TEL_HREF} className="inline-flex items-center gap-1.5">
                <PhoneIcon size={16} />
                {PHONE_DISPLAY}
              </a>
              <a href={whatsappHref(whatsappPrefill)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
                <ChatIcon size={16} />
                WhatsApp
              </a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
