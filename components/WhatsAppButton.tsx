import { ChatIcon } from "@/components/icons";
import { whatsappHref } from "@/lib/site";

/** Floating direct-to-WhatsApp hook (+56958961796). */
export function WhatsAppButton({ label, prefill }: { label: string; prefill: string }) {
  return (
    <a
      href={whatsappHref(prefill)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="group fixed right-4 bottom-4 z-30 flex h-14 items-center gap-2 rounded-full bg-green pr-4 pl-3.5 text-on-green shadow-card transition-transform hover:-translate-y-0.5 sm:right-6 sm:bottom-6"
    >
      <ChatIcon size={28} strokeWidth={2} />
      <span className="hidden text-sm font-bold md:inline">WhatsApp</span>
    </a>
  );
}
