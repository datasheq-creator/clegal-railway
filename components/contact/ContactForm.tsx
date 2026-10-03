"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  contactSchema,
  HONEYPOT_FIELD,
  LIMITS,
  SERVICE_IDS,
  toFieldErrors,
  type ContactField,
  type FieldErrors,
  type ServiceId,
} from "@/lib/contact/schema";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { PHONE_DISPLAY, PHONE_TEL_HREF, whatsappHref } from "@/lib/site";
import { AlertIcon, ChatIcon, CheckCircleIcon, PhoneIcon, SpinnerIcon } from "@/components/icons";

type Values = Record<ContactField, string>;
type Status = "idle" | "submitting" | "success" | "error";

const EMPTY: Values = { name: "", email: "", phone: "", service: "", message: "" };
const FIELD_ORDER: ContactField[] = ["name", "email", "phone", "service", "message"];
const REQUEST_TIMEOUT_MS = 20_000;

function validate(values: Values, lang: Locale): FieldErrors {
  const result = contactSchema.safeParse({ ...values, lang });
  return result.success ? {} : toFieldErrors(result.error);
}

export function ContactForm({
  dict,
  lang,
  preset,
  onDone,
}: {
  dict: Dictionary["contact"];
  lang: Locale;
  preset: { service: ServiceId | null; nonce: number };
  onDone: () => void;
}) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const statusRef = useRef<Status>(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Each time the modal opens: start fresh after a success, apply the preset service.
  useEffect(() => {
    if (preset.nonce === 0) return;
    const wasSuccess = statusRef.current === "success";
    if (wasSuccess) {
      setTouched({});
      setErrors({});
    }
    if (statusRef.current !== "submitting") setStatus("idle");
    setFormError(null);
    setValues((v) => {
      const base = wasSuccess ? EMPTY : v;
      return preset.service ? { ...base, service: preset.service } : base;
    });
    // Focus the first empty field once the dialog is painted.
    requestAnimationFrame(() => {
      const form = formRef.current;
      if (!form) return;
      const firstEmpty = FIELD_ORDER.map((f) => form.elements.namedItem(f) as HTMLInputElement | null).find(
        (el) => el && !el.value,
      );
      firstEmpty?.focus();
    });
  }, [preset]);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const fieldId = (f: ContactField) => `${uid}-${f}`;
  const errorId = (f: ContactField) => `${uid}-${f}-error`;
  const visibleError = (f: ContactField) => (touched[f] ? errors[f] : undefined);

  function update(field: ContactField, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) setErrors(validate(next, lang));
  }

  function blur(field: ContactField) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(values, lang));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const allTouched = Object.fromEntries(FIELD_ORDER.map((f) => [f, true]));
    setTouched(allTouched);
    const clientErrors = validate(values, lang);
    setErrors(clientErrors);
    const firstInvalid = FIELD_ORDER.find((f) => clientErrors[f]);
    if (firstInvalid) {
      setFormError(dict.errorSummary);
      (formRef.current?.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    setStatus("submitting");
    setFormError(null);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...values, lang, [HONEYPOT_FIELD]: honeypot }),
        signal: controller.signal,
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; fieldErrors?: FieldErrors };

      if (res.ok && data.ok) {
        setStatus("success");
        return;
      }
      if (res.status === 422 && data.fieldErrors) {
        setErrors(data.fieldErrors);
        setFormError(dict.errorSummary);
        const first = FIELD_ORDER.find((f) => data.fieldErrors?.[f]);
        if (first) (formRef.current?.elements.namedItem(first) as HTMLElement | null)?.focus();
        setStatus("error");
        return;
      }
      setFormError(res.status === 429 ? dict.errorRateLimit : dict.errorGeneric);
      setStatus("error");
    } catch {
      setFormError(dict.errorNetwork);
      setStatus("error");
    } finally {
      clearTimeout(timer);
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center py-6 text-center" role="status">
        <span className="flex size-16 items-center justify-center rounded-full bg-purple-soft text-purple">
          <CheckCircleIcon size={34} />
        </span>
        <h3 ref={successRef} tabIndex={-1} className="mt-5 text-xl font-extrabold outline-none">
          {dict.successTitle}
        </h3>
        <p className="mt-2 max-w-sm text-ink-muted">{dict.successText}</p>
        <button type="button" onClick={onDone} className="btn btn-primary mt-7 h-12 min-w-40 px-6">
          {dict.successClose}
        </button>
      </div>
    );
  }

  const submitting = status === "submitting";
  const inputBase =
    "mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-3 text-[0.95rem] text-ink placeholder:text-ink-faint transition-colors focus:outline-none focus-visible:outline-none focus:ring-2";
  const inputState = (f: ContactField) =>
    visibleError(f)
      ? "border-danger focus:border-danger focus:ring-danger-soft"
      : "border-line focus:border-purple focus:ring-purple/15";

  const label = (f: ContactField) => (
    <label htmlFor={fieldId(f)} className="text-sm font-semibold text-ink">
      {dict.fields[f].label}
      <span className="text-purple" aria-hidden="true">
        {" "}
        *
      </span>
      <span className="sr-only"> ({dict.required})</span>
    </label>
  );

  const errorText = (f: ContactField) =>
    visibleError(f) ? (
      <p id={errorId(f)} className="mt-1.5 flex items-center gap-1.5 text-sm text-danger">
        <AlertIcon size={15} className="shrink-0" />
        {dict.errors[visibleError(f)!]}
      </p>
    ) : null;

  const aria = (f: ContactField) => ({
    id: fieldId(f),
    name: f,
    "aria-invalid": visibleError(f) ? true : undefined,
    "aria-describedby": visibleError(f) ? errorId(f) : undefined,
    required: true,
    disabled: submitting,
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={submitting} className="grid gap-4">
      {formError ? (
        <div role="alert" className="flex items-start gap-2.5 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
          <AlertIcon size={18} className="mt-px shrink-0" />
          <span>{formError}</span>
        </div>
      ) : null}

      <div>
        {label("name")}
        <input
          {...aria("name")}
          type="text"
          autoComplete="name"
          maxLength={LIMITS.nameMax}
          placeholder={dict.fields.name.placeholder}
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          onBlur={() => blur("name")}
          className={`${inputBase} ${inputState("name")}`}
        />
        {errorText("name")}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          {label("email")}
          <input
            {...aria("email")}
            type="email"
            autoComplete="email"
            inputMode="email"
            maxLength={LIMITS.emailMax}
            placeholder={dict.fields.email.placeholder}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={() => blur("email")}
            className={`${inputBase} ${inputState("email")}`}
          />
          {errorText("email")}
        </div>
        <div>
          {label("phone")}
          <input
            {...aria("phone")}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            maxLength={LIMITS.phoneMax}
            placeholder={dict.fields.phone.placeholder}
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            onBlur={() => blur("phone")}
            className={`${inputBase} ${inputState("phone")}`}
          />
          {errorText("phone")}
        </div>
      </div>

      <div>
        {label("service")}
        <div className="relative">
          <select
            {...aria("service")}
            value={values.service}
            onChange={(e) => update("service", e.target.value)}
            onBlur={() => blur("service")}
            className={`${inputBase} ${inputState("service")} appearance-none pr-10 ${values.service ? "" : "text-ink-faint"}`}
          >
            <option value="" disabled>
              {dict.fields.service.placeholder}
            </option>
            {SERVICE_IDS.map((id) => (
              <option key={id} value={id} className="text-ink">
                {dict.services[id]}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute top-1/2 right-3.5 mt-0.75 size-4 -translate-y-1/2 text-ink-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {errorText("service")}
      </div>

      <div>
        {label("message")}
        <textarea
          {...aria("message")}
          rows={5}
          maxLength={LIMITS.messageMax}
          placeholder={dict.fields.message.placeholder}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          onBlur={() => blur("message")}
          className={`${inputBase} ${inputState("message")} min-h-32 resize-y`}
        />
        <div className="flex items-start justify-between gap-3">
          {errorText("message") ?? <span />}
          <span className="mt-1.5 shrink-0 text-xs text-ink-subtle tabular-nums" aria-hidden="true">
            {values.message.length}/{LIMITS.messageMax}
          </span>
        </div>
      </div>

      {/* Honeypot: hidden from people and assistive tech, irresistible to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-hp`}>Website</label>
        <input
          id={`${uid}-hp`}
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="mt-1 flex flex-col gap-3">
        <button type="submit" disabled={submitting} className="btn btn-primary h-13 w-full text-base disabled:cursor-wait disabled:opacity-80">
          {submitting ? (
            <>
              <SpinnerIcon size={20} />
              {dict.submitting}
            </>
          ) : (
            dict.submit
          )}
        </button>
        <p className="text-center text-xs text-ink-subtle">{dict.privacy}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-line pt-4 text-sm text-ink-muted">
        <span>{dict.orCall}</span>
        <a href={PHONE_TEL_HREF} className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-purple">
          <PhoneIcon size={16} />
          {PHONE_DISPLAY}
        </a>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-purple"
        >
          <ChatIcon size={16} />
          WhatsApp
        </a>
      </div>
    </form>
  );
}
