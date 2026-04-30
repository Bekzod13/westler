"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SiteLoadingShell } from "@/components/westler/site-loading-shell";
import { fetchPublicSite } from "@/lib/public-api";
import type { SitePayload } from "@/lib/site-types";

export const SITE_FALLBACK_EN: SitePayload = {
  meta: {
    title: "WESTLER — Industrial Solutions",
    description:
      "Integrated equipment supply, heavy logistics, and engineering solutions for complex industrial projects.",
  },
  brand: "WESTLER ENGINEERING",
  header: {
    nav: {
      about: "About",
      capabilities: "Capabilities",
      engineering: "Engineering",
      contact: "Contact",
    },
    discuss: "Discuss Your Project",
    languageAria: "Language",
    menuOpen: "Open menu",
    menuClose: "Close menu",
  },
  heroSlider: {
    loading: "Loading…",
    prevAria: "Previous slide",
    nextAria: "Next slide",
    slideAria: "Slide",
    emptyCta: "Start Your Project",
  },
  about: {
    headingLine1: "Industrial Solutions",
    headingLine2: "Without Limits",
    p1:
      "We deliver integrated industrial solutions where precision, scale, and accountability define every stage of execution.",
    p2:
      "Operating across international markets with a strong focus on Central Asia.",
    imageAlt: "Industrial machinery inspection",
  },
  stats: [
    { value: "15+", label: "Years Experience" },
    { value: "10+", label: "Countries Served" },
    { value: "40+", label: "Completed Projects" },
    { value: "10+", label: "Strategic Partners" },
  ],
  capabilitiesSectionTitle: "Our Capabilities",
  capabilities: [],
  sectorsSectionTitle: "Industry Sectors We Serve",
  sectors: [],
  engineering: {
    headingLine1: "Where Engineering",
    headingLine2: "Meets Execution",
    points: [],
    cta: "Request Technical Consultation",
    imageAlt: "Engineering CAD review",
  },
  whyUsSectionTitle: "Why Choose Us",
  whyUs: [],
  partnersSectionTitle: "Our Strategic Partners",
  partnerLogos: [],
  globalPresence: {
    title: "Global Presence",
    body:
      "Delivering industrial excellence across global markets with a strong presence in Central Asia.",
    mapAlt: "World map showing WESTLER global presence",
  },
  closingCta: {
    headingLine1: "Let's turn complexity into",
    headingLine2: "performance.",
    buttonLabel:
      "Our specialists are ready to review your technical requirements and provide structured guidance.",
  },
  footer: {
    columns: [
      {
        title: "About",
        links: [
          { label: "Our Story", href: "#" },
          { label: "Leadership", href: "#" },
          { label: "Careers", href: "#" },
          { label: "News", href: "#" },
        ],
      },
      {
        title: "Capabilities",
        links: [
          { label: "Equipment Supply", href: "#capabilities" },
          { label: "Global Logistics", href: "#capabilities" },
          { label: "Project Execution", href: "#capabilities" },
          { label: "Engineering", href: "#capabilities" },
        ],
      },
      {
        title: "Engineering",
        links: [
          { label: "Technical Audits", href: "#engineering" },
          { label: "CAD Review", href: "#engineering" },
          { label: "Risk Analysis", href: "#engineering" },
          { label: "Compliance", href: "#engineering" },
        ],
      },
      {
        title: "Contact",
        links: [
          { label: "info@westler.com", href: "mailto:info@westler.com" },
          { label: "+44 20 7946 0958", href: "tel:+442079460958" },
          { label: "London, UK", href: "#contact" },
        ],
      },
    ],
    copyright: "WESTLER ENGINEERING LIMITED",
  },
  contactModal: {
    title: "Discuss Your Project",
    closeDialogAria: "Close dialog",
    closeButtonAria: "Close",
    fullName: "Full Name",
    companyName: "Company Name",
    phone: "Phone Number",
    phonePlaceholder: "Phone number",
    phoneError: "Enter a valid phone number.",
    email: "Email",
    message: "Message",
    submit: "Send Message",
  },
};

type SiteContentContextValue = {
  locales: Partial<Record<string, SitePayload>>;
  loading: boolean;
  error: boolean;
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [locales, setLocales] = useState<Partial<Record<string, SitePayload>>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPublicSite()
      .then((data) => {
        if (cancelled) return;
        const next: Partial<Record<string, SitePayload>> = {};
        for (const [code, raw] of Object.entries(data.locales ?? {})) {
          next[code] = raw as SitePayload;
        }
        setLocales(next);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ locales, loading, error }),
    [locales, loading, error],
  );

  return (
    <SiteContentContext.Provider value={value}>
      {loading ? <SiteLoadingShell /> : children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }
  return ctx;
}

export function useSite(locale: string): SitePayload {
  const { locales } = useSiteContent();
  return useMemo(
    () =>
      (locales[locale] ??
        locales.en ??
        SITE_FALLBACK_EN) as SitePayload,
    [locales, locale],
  );
}
