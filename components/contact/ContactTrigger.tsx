"use client";

import type { ComponentPropsWithoutRef } from "react";
import type { ServiceId } from "@/lib/contact/schema";
import { useContact } from "./ContactProvider";

type Props = Omit<ComponentPropsWithoutRef<"button">, "type" | "onClick"> & {
  /** Pre-selects the "Asunto / Servicio" field. */
  service?: ServiceId;
  onOpen?: () => void;
};

/** Any "Contáctanos"-style CTA. Opens the shared contact modal. */
export function ContactTrigger({ service, onOpen, children, ...rest }: Props) {
  const { open } = useContact();
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => {
        onOpen?.();
        open(service);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
