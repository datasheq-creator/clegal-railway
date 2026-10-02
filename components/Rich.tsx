import { Fragment } from "react";

/** Renders **emphasis** markers from dictionary strings as <strong>. */
export function Rich({ text, strongClassName = "font-semibold text-ink" }: { text: string; strongClassName?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className={strongClassName}>
            {part.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function stripRich(text: string): string {
  return text.replace(/\*\*/g, "");
}
