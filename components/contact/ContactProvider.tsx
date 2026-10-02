"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ServiceId } from "@/lib/contact/schema";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { CloseIcon } from "@/components/icons";
import { ContactForm } from "./ContactForm";

type ContactContextValue = { open: (service?: ServiceId) => void };

const ContactContext = createContext<ContactContextValue | null>(null);

export function useContact(): ContactContextValue {
  const ctx = useContext(ContactContext);
  if (!ctx) throw new Error("useContact must be used inside <ContactProvider>");
  return ctx;
}

/** URL hash that opens the modal on load (e.g. links in emails or ads: /#contacto). */
const CONTACT_HASH = "#contacto";

export function ContactProvider({
  dict,
  lang,
  children,
}: {
  dict: Dictionary["contact"];
  lang: Locale;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [preset, setPreset] = useState<{ service: ServiceId | null; nonce: number }>({ service: null, nonce: 0 });

  const open = useCallback((service?: ServiceId) => {
    setPreset((prev) => ({ service: service ?? null, nonce: prev.nonce + 1 }));
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  useEffect(() => {
    const fromHash = () => {
      if (window.location.hash === CONTACT_HASH) {
        open();
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [open]);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <ContactContext.Provider value={value}>
      {children}
      <dialog
        ref={dialogRef}
        aria-labelledby="contact-title"
        aria-describedby="contact-intro"
        className="open:animate-dialog-in fixed inset-0 m-auto h-fit max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-[40rem] overflow-hidden rounded-2xl bg-white p-0 text-ink shadow-card"
        onClick={(e) => {
          // Clicks on the ::backdrop land on the <dialog> element itself.
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-line px-5 pt-5 pb-4 sm:px-7 sm:pt-6">
            <div>
              <h2 id="contact-title" className="text-2xl font-extrabold tracking-tight">
                {dict.title}
              </h2>
              <p id="contact-intro" className="mt-1 text-[0.95rem] text-ink-muted">
                {dict.intro}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              className="-mt-1 -mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface hover:text-ink"
              aria-label={dict.close}
            >
              <CloseIcon size={22} />
            </button>
          </header>
          <div className="overflow-y-auto overscroll-contain px-5 pt-5 pb-6 sm:px-7">
            <ContactForm dict={dict} lang={lang} preset={preset} onDone={close} />
          </div>
        </div>
      </dialog>
    </ContactContext.Provider>
  );
}
