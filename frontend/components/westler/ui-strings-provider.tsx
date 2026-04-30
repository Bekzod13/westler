"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "@/components/westler/locale-provider";
import {
  fetchPublicGroups,
  type PublicGroupsResponse,
} from "@/lib/public-api";
import type { NavKey, SiteIconVariant, SitePayload } from "@/lib/site-types";

type HeaderCopy = {
  brand: string;
  nav: Record<NavKey, string>;
  discuss: string;
  languageAria: string;
  menuOpen: string;
  menuClose: string;
};

type UiStringsContextValue = {
  data: PublicGroupsResponse | null;
  loading: boolean;
  error: boolean;
};

const UiStringsContext = createContext<UiStringsContextValue | null>(null);

export function UiStringsProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const [data, setData] = useState<PublicGroupsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchPublicGroups(locale)
      .then((r) => {
        if (!cancelled) {
          setData(r);
          setError(false);
        }
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
  }, [locale]);

  const value = useMemo(
    () => ({ data, loading, error }),
    [data, loading, error],
  );

  return (
    <UiStringsContext.Provider value={value}>
      {children}
    </UiStringsContext.Provider>
  );
}

export function useUiStrings() {
  const ctx = useContext(UiStringsContext);
  if (!ctx) {
    throw new Error("useUiStrings must be used within UiStringsProvider");
  }
  return ctx;
}

/** Single string from a CMS group `slug` and `field` key; falls back to `fallback`. */
export function useGroupString(
  slug: string,
  key: string,
  fallback: string,
): string {
  const { data } = useUiStrings();
  const v = data?.groups[slug]?.strings[key];
  if (v != null && v.trim() !== "") return v;
  return fallback;
}

function parseFooterColumnsJson(
  raw: string | undefined,
  fallback: SitePayload["footer"]["columns"],
): SitePayload["footer"]["columns"] {
  if (raw == null || raw.trim() === "") return fallback;
  try {
    const p = JSON.parse(raw) as unknown;
    if (!Array.isArray(p)) return fallback;
    const out: SitePayload["footer"]["columns"] = [];
    for (const c of p) {
      if (c == null || typeof c !== "object" || Array.isArray(c)) continue;
      const o = c as Record<string, unknown>;
      const title = typeof o.title === "string" ? o.title : "";
      const linksRaw = o.links;
      const links: { label: string; href: string }[] = [];
      if (Array.isArray(linksRaw)) {
        for (const l of linksRaw) {
          if (l != null && typeof l === "object" && !Array.isArray(l)) {
            const l0 = l as Record<string, unknown>;
            links.push({
              label: typeof l0.label === "string" ? l0.label : "",
              href: typeof l0.href === "string" ? l0.href : "#",
            });
          }
        }
      }
      out.push({ title, links });
    }
    return out.length > 0 ? out : fallback;
  } catch {
    return fallback;
  }
}

type IconTitleBodyCard = {
  title: string;
  body: string;
  iconVariant: SiteIconVariant;
};

/** `{ title, body, iconVariant }[]` — why-us and industry sectors cards. */
function parseIconVariantCardsJson(
  raw: string | undefined,
  fallback: IconTitleBodyCard[],
): IconTitleBodyCard[] {
  if (raw == null || raw.trim() === "") return fallback;
  try {
    const p = JSON.parse(raw) as unknown;
    if (!Array.isArray(p)) return fallback;
    const out: IconTitleBodyCard[] = [];
    for (const item of p) {
      if (item == null || typeof item !== "object" || Array.isArray(item)) {
        continue;
      }
      const o = item as Record<string, unknown>;
      const title = typeof o.title === "string" ? o.title : "";
      const body = typeof o.body === "string" ? o.body : "";
      const iv =
        typeof o.iconVariant === "string" ? o.iconVariant : "21";
      out.push({
        title,
        body,
        iconVariant: iv as SiteIconVariant,
      });
    }
    return out.length > 0 ? out : fallback;
  } catch {
    return fallback;
  }
}

function parseClosingCtaJson(
  raw: string | undefined,
  fallback: SitePayload["closingCta"],
): SitePayload["closingCta"] {
  if (raw == null || raw.trim() === "") return fallback;
  try {
    const p = JSON.parse(raw) as unknown;
    if (p == null || typeof p !== "object" || Array.isArray(p)) return fallback;
    const o = p as Record<string, unknown>;
    return {
      headingLine1:
        typeof o.headingLine1 === "string"
          ? o.headingLine1
          : fallback.headingLine1,
      headingLine2:
        typeof o.headingLine2 === "string"
          ? o.headingLine2
          : fallback.headingLine2,
      buttonLabel:
        typeof o.buttonLabel === "string"
          ? o.buttonLabel
          : fallback.buttonLabel,
    };
  } catch {
    return fallback;
  }
}

/**
 * Footer columns, closing CTA, and copyright from CMS group `footer`
 * (`columnsJson`, `closingCtaJson`, `copyright`) with Site payload fallback.
 */
export function useFooterContent(site: SitePayload): {
  columns: SitePayload["footer"]["columns"];
  closingCta: SitePayload["closingCta"];
  copyright: string;
} {
  const { data } = useUiStrings();
  return useMemo(() => {
    const g = data?.groups?.footer?.strings;
    const columns = parseFooterColumnsJson(g?.columnsJson, site.footer.columns);
    const closingCta = parseClosingCtaJson(g?.closingCtaJson, site.closingCta);
    const c = g?.copyright?.trim();
    const copyright =
      c != null && c !== "" ? c : site.footer.copyright;
    return { columns, closingCta, copyright };
  }, [data, site]);
}

/** Global presence block — CMS group `global-presence` (`title`, `body`, `mapAlt`). */
export function useGlobalPresenceContent(site: SitePayload): SitePayload["globalPresence"] {
  const { data } = useUiStrings();
  return useMemo(() => {
    const g = data?.groups?.["global-presence"]?.strings;
    const fb = site.globalPresence;
    const title =
      g?.title?.trim() !== "" && g?.title != null ? g.title : fb.title;
    const body =
      g?.body?.trim() !== "" && g?.body != null ? g.body : fb.body;
    const mapAlt =
      g?.mapAlt?.trim() !== "" && g?.mapAlt != null ? g.mapAlt : fb.mapAlt;
    return { title, body, mapAlt };
  }, [data, site]);
}

/** Why us section — CMS group `why-us` (`sectionTitle`, `cardsJson`). */
export function useWhyUsContent(site: SitePayload): {
  sectionTitle: string;
  whyUs: SitePayload["whyUs"];
} {
  const { data } = useUiStrings();
  return useMemo(() => {
    const g = data?.groups?.["why-us"]?.strings;
    const sectionTitle =
      g?.sectionTitle?.trim() !== "" && g?.sectionTitle != null
        ? g.sectionTitle
        : site.whyUsSectionTitle;
    const whyUs = parseIconVariantCardsJson(g?.cardsJson, site.whyUs);
    return { sectionTitle, whyUs };
  }, [data, site]);
}

/** Industry sectors section — CMS group `sectors` (`sectionTitle`, `cardsJson`). */
export function useSectorsContent(site: SitePayload): {
  sectionTitle: string;
  sectors: SitePayload["sectors"];
} {
  const { data } = useUiStrings();
  return useMemo(() => {
    const g = data?.groups?.sectors?.strings;
    const sectionTitle =
      g?.sectionTitle?.trim() !== "" && g?.sectionTitle != null
        ? g.sectionTitle
        : site.sectorsSectionTitle;
    const sectors = parseIconVariantCardsJson(
      g?.cardsJson,
      site.sectors,
    ) as SitePayload["sectors"];
    return { sectionTitle, sectors };
  }, [data, site]);
}

/** `{ label, variant }[]` — engineering section points. */
function parseEngineeringPointsJson(
  raw: string | undefined,
  fallback: SitePayload["engineering"]["points"],
): SitePayload["engineering"]["points"] {
  if (raw == null || raw.trim() === "") return fallback;
  try {
    const p = JSON.parse(raw) as unknown;
    if (!Array.isArray(p)) return fallback;
    const out: SitePayload["engineering"]["points"] = [];
    for (const item of p) {
      if (item == null || typeof item !== "object" || Array.isArray(item)) {
        continue;
      }
      const o = item as Record<string, unknown>;
      const label = typeof o.label === "string" ? o.label : "";
      const variant =
        typeof o.variant === "string" ? o.variant : "15";
      out.push({
        label,
        variant: variant as SiteIconVariant,
      });
    }
    return out.length > 0 ? out : fallback;
  } catch {
    return fallback;
  }
}

/** Engineering section — CMS group `engineering` (`headingLine1`, `headingLine2`, `cta`, `imageAlt`, `pointsJson`). */
export function useEngineeringContent(site: SitePayload): SitePayload["engineering"] {
  const { data } = useUiStrings();
  return useMemo(() => {
    const g = data?.groups?.engineering?.strings;
    const fb = site.engineering;
    const headingLine1 =
      g?.headingLine1?.trim() !== "" && g?.headingLine1 != null ? g.headingLine1 : fb.headingLine1;
    const headingLine2 =
      g?.headingLine2?.trim() !== "" && g?.headingLine2 != null ? g.headingLine2 : fb.headingLine2;
    const cta =
      g?.cta?.trim() !== "" && g?.cta != null ? g.cta : fb.cta;
    const imageAlt =
      g?.imageAlt?.trim() !== "" && g?.imageAlt != null ? g.imageAlt : fb.imageAlt;
    const points = parseEngineeringPointsJson(g?.pointsJson, fb.points);
    return { headingLine1, headingLine2, cta, imageAlt, points };
  }, [data, site]);
}

/** Header copy from Site payload, overridden by CMS group `header` when present. */
export function useResolvedHeader(): HeaderCopy {
  const { header } = useLocale();
  const { data } = useUiStrings();
  return useMemo(() => {
    const g = data?.groups?.header?.strings;
    if (!g || Object.keys(g).length === 0) return header;
    return {
      brand: g["brand"] ?? header.brand,
      nav: {
        about: g["nav.about"] ?? header.nav.about,
        capabilities: g["nav.capabilities"] ?? header.nav.capabilities,
        engineering: g["nav.engineering"] ?? header.nav.engineering,
        contact: g["nav.contact"] ?? header.nav.contact,
      },
      discuss: g["discuss"] ?? header.discuss,
      languageAria: g["languageAria"] ?? header.languageAria,
      menuOpen: g["menuOpen"] ?? header.menuOpen,
      menuClose: g["menuClose"] ?? header.menuClose,
    };
  }, [header, data]);
}
