"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { useContactModal } from "@/components/westler/contact-modal";
import { useLocale } from "@/components/westler/locale-provider";
import { useResolvedHeader } from "@/components/westler/ui-strings-provider";
import { headerNav } from "@/lib/nav-config";
import type { NavKey } from "@/lib/site-types";
import { isLocale } from "@/lib/locale";
import type { PublicLanguage } from "@/lib/public-api";
import { fetchPublicLanguages } from "@/lib/public-api";

const navKeys: NavKey[] = [
  "about",
  "capabilities",
  "engineering",
  "contact",
];

function MenuIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
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

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function LanguageSelect({
  className,
  languages,
  languageAria,
}: {
  className?: string;
  languages: PublicLanguage[];
  languageAria: string;
}) {
  const { locale, setLocale } = useLocale();
  const codes = languages.map((l) => l.code);
  const hasCurrent = codes.includes(locale);
  const value = hasCurrent ? locale : (languages[0]?.code ?? locale);

  return (
    <div className={`relative ${className ?? ""}`}>
      <select
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (isLocale(v)) setLocale(v);
        }}
        aria-label={languageAria}
        className="h-9 w-full min-w-[8.75rem] cursor-pointer appearance-none rounded border border-white/20 bg-white/10 py-1.5 pl-3 pr-9 font-[family-name:var(--font-inter)] text-sm text-white outline-none ring-[#2e739e] focus:ring-2"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-[#0e1d2a] text-white">
            {lang.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-white/70" />
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [publicLanguages, setPublicLanguages] = useState<PublicLanguage[] | null>(
    null,
  );
  const panelId = useId();
  const { open: openContact } = useContactModal();
  const header = useResolvedHeader();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const ac = new AbortController();
    void fetchPublicLanguages(ac.signal)
      .then(setPublicLanguages)
      .catch(() => setPublicLanguages([]));
    return () => ac.abort();
  }, []);

  const showLanguageSelect =
    publicLanguages !== null && publicLanguages.length > 1;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-white/5 backdrop-blur-md"
      style={{ backgroundColor: "rgba(14, 29, 42, 0.95)" }}
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-10">
        <Link
          href="/"
          className="font-[family-name:var(--font-montserrat)] text-xl font-bold tracking-[0.15em] text-white sm:text-2xl"
          onClick={close}
        >
          {header.brand}
        </Link>

        <nav
          className="hidden items-center gap-4 lg:gap-6 md:flex"
          aria-label="Main"
        >
          {navKeys.map((key) => (
            <Link
              key={key}
              href={headerNav[key].href}
              className="font-[family-name:var(--font-inter)] text-sm font-medium uppercase tracking-wide text-white/80 transition hover:text-white"
            >
              {header.nav[key]}
            </Link>
          ))}
          {showLanguageSelect ? (
            <LanguageSelect
              className="shrink-0"
              languages={publicLanguages}
              languageAria={header.languageAria}
            />
          ) : null}
          <button
            type="button"
            onClick={openContact}
            className="rounded bg-[#2e739e] px-5 py-2.5 font-[family-name:var(--font-montserrat)] text-xs font-semibold uppercase tracking-wide text-white transition hover:opacity-90 lg:px-6 lg:py-3"
          >
            {header.discuss}
          </button>
        </nav>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded text-white transition hover:bg-white/10 md:hidden"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? header.menuClose : header.menuOpen}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <div
        id={panelId}
        inert={!open}
        className={`md:hidden ${
          open
            ? "pointer-events-auto max-h-[min(100vh,28rem)] border-t border-white/10 opacity-100"
            : "pointer-events-none max-h-0 border-transparent opacity-0"
        } overflow-hidden transition-[max-height,opacity] duration-300 ease-out`}
        style={{ backgroundColor: "rgba(14, 29, 42, 0.98)" }}
      >
        <nav
          className="flex flex-col gap-1 px-4 py-4 sm:px-6"
          aria-label="Mobile"
        >
          {navKeys.map((key) => (
            <Link
              key={key}
              href={headerNav[key].href}
              className="rounded px-3 py-3 font-[family-name:var(--font-inter)] text-sm font-medium uppercase tracking-wide text-white/90 transition hover:bg-white/10 active:bg-white/15"
              onClick={close}
            >
              {header.nav[key]}
            </Link>
          ))}
          {showLanguageSelect ? (
            <div className="px-3 py-2">
              <LanguageSelect
                languages={publicLanguages}
                languageAria={header.languageAria}
              />
            </div>
          ) : null}
          <button
            type="button"
            className="mt-2 w-full rounded bg-[#2e739e] px-4 py-3.5 text-center font-[family-name:var(--font-montserrat)] text-xs font-semibold uppercase tracking-wide text-white transition hover:opacity-90"
            onClick={() => {
              close();
              openContact();
            }}
          >
            {header.discuss}
          </button>
        </nav>
      </div>

    </header>
  );
}
