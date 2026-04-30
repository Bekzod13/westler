"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import PhoneInput, {
  isValidPhoneNumber,
  type Value as PhoneValue,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useLocale } from "@/components/westler/locale-provider";
import { useSite } from "@/components/westler/site-content-provider";
import { submitPublicOrder } from "@/lib/public-api";

type ContactModalContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const ContactModalContext = createContext<ContactModalContextValue | null>(
  null,
);

export function useContactModal() {
  const ctx = useContext(ContactModalContext);
  if (!ctx) {
    throw new Error("useContactModal must be used within ContactModalProvider");
  }
  return ctx;
}

export function ContactCtaButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { open } = useContactModal();
  return (
    <button type="button" className={className} onClick={open}>
      {children}
    </button>
  );
}

function CloseGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ContactModalDialog() {
  const { isOpen, close } = useContactModal();
  const { locale } = useLocale();
  const site = useSite(locale);
  const c = site.contactModal;
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [phone, setPhone] = useState<PhoneValue | undefined>();
  const [phoneError, setPhoneError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Portal target only exists on the client; avoid SSR/CSR markup mismatch for `document.body`.
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      queueMicrotask(() => {
        setPhone(undefined);
        setPhoneError("");
        setSubmitError(null);
        setSubmitting(false);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    if (!phone || !isValidPhoneNumber(phone)) {
      setPhoneError(c.phoneError);
      return;
    }
    setPhoneError("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const fullName = String(fd.get("fullName") ?? "").trim();
    const companyName = String(fd.get("company") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    setSubmitting(true);
    try {
      await submitPublicOrder({
        fullName,
        companyName,
        phone,
        email,
        message,
      });
      form.reset();
      setPhone(undefined);
      close();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200]">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label={c.closeDialogAria}
        onClick={close}
      />
      <div className="relative z-10 flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="flex w-full max-w-[520px] flex-col overflow-visible rounded border border-[#dae0e7] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
        >
        <div className="flex items-center justify-between border-b border-[#dae0e7] px-6 pb-[25px] pt-6">
          <h2
            id={titleId}
            className="font-[family-name:var(--font-montserrat)] text-xl font-bold tracking-tight text-[#1a1a1a]"
          >
            {c.title}
          </h2>
          <button
            type="button"
            onClick={close}
            className="rounded p-1 text-[#1a1a1a] transition hover:bg-[#f5f7fa]"
            aria-label={c.closeButtonAria}
          >
            <CloseGlyph />
          </button>
        </div>
        <form
          className="flex flex-col gap-4 p-6"
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
        >
          <Field
            id="contact-full-name"
            label={c.fullName}
            requiredMark
            name="fullName"
            autoComplete="name"
          />
          <Field
            id="contact-company"
            label={c.companyName}
            name="company"
            autoComplete="organization"
          />
          <div className="flex flex-col gap-1">
            <label
              htmlFor="contact-phone"
              className="text-sm font-medium text-[#1a1a1a]"
            >
              {c.phone} <span className="text-[#ef4444]">*</span>
            </label>
            <div className="contact-modal-phone">
              <PhoneInput
                international
                defaultCountry="GB"
                value={phone}
                onChange={(value) => {
                  setPhone(value);
                  setPhoneError("");
                }}
                placeholder={c.phonePlaceholder}
                countryCallingCodeEditable={false}
                numberInputProps={{
                  id: "contact-phone",
                  autoComplete: "tel",
                  "aria-invalid": phoneError ? true : undefined,
                  "aria-describedby": phoneError ? "contact-phone-error" : undefined,
                  className:
                    "min-w-0 h-[46px] w-full rounded border border-[#dae0e7] bg-[#f5f7fa] px-3 text-sm text-[#1a1a1a] outline-none ring-[#2e739e] focus:ring-2",
                }}
              />
            </div>
            <input type="hidden" name="phone" value={phone ?? ""} readOnly />
            {phoneError ? (
              <p
                id="contact-phone-error"
                className="text-sm text-[#ef4444]"
                role="alert"
              >
                {phoneError}
              </p>
            ) : null}
          </div>
          <Field
            id="contact-email"
            label={c.email}
            name="email"
            type="email"
            autoComplete="email"
          />
          <div className="flex flex-col gap-1">
            <label
              htmlFor="contact-message"
              className="text-sm font-medium text-[#1a1a1a]"
            >
              {c.message}
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={4}
              className="min-h-[106px] w-full resize-y rounded border border-[#dae0e7] bg-[#f5f7fa] px-3 py-2.5 text-sm text-[#1a1a1a] outline-none ring-[#2e739e] focus:ring-2"
            />
          </div>
          {submitError ? (
            <p className="text-sm text-[#ef4444]" role="alert">
              {submitError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded bg-[#2e739e] px-8 py-4 font-[family-name:var(--font-montserrat)] text-sm font-semibold uppercase tracking-wide text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "…" : c.submit}
          </button>
        </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Field({
  id,
  label,
  requiredMark,
  name,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  requiredMark?: boolean;
  name: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-[#1a1a1a]">
        {label}{" "}
        {requiredMark ? <span className="text-[#ef4444]">*</span> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={Boolean(requiredMark)}
        autoComplete={autoComplete}
        className="h-[46px] w-full rounded border border-[#dae0e7] bg-[#f5f7fa] px-3 text-sm text-[#1a1a1a] outline-none ring-[#2e739e] focus:ring-2"
      />
    </div>
  );
}

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <ContactModalContext.Provider value={{ open, close, isOpen }}>
      {children}
      <ContactModalDialog />
    </ContactModalContext.Provider>
  );
}
