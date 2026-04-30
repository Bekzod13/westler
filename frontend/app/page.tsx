import type { Metadata } from "next";
import { LandingPage } from "@/components/westler/landing-page";
import { getPublicApiBase } from "@/lib/public-api";
import type { PublicGroupsResponse } from "@/lib/public-api";

/** CMS `seo` group uses flat keys: `seo.title`, `seo.des`, `seo.keywords` (see PublicGroupPayload). */
function metadataFromSeoStrings(
  strings: Record<string, string> | undefined,
): { title: string; description: string; keywords?: string } | null {
  if (!strings) return null;
  const title = strings["seo.title"] ?? strings.title;
  const description =
    strings["seo.des"] ??
    strings["seo.description"] ??
    strings.description;
  if (!title?.trim() || !description?.trim()) return null;
  const keywordsRaw = strings["seo.keywords"] ?? strings.keywords;
  const kw = keywordsRaw?.trim();
  return {
    title: title.trim(),
    description: description.trim(),
    ...(kw ? { keywords: kw } : {}),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const base = getPublicApiBase();

  /* 1. Try the CMS "seo" group first */
  try {
    const url = new URL(`${base}/public/groups`);
    url.searchParams.set("lang", "en");
    const res = await fetch(url.toString(), { next: { revalidate: 120 } });
    if (res.ok) {
      const data = (await res.json()) as PublicGroupsResponse;
      const seo = metadataFromSeoStrings(data.groups?.seo?.strings);
      if (seo) {
        return {
          title: seo.title,
          description: seo.description,
          ...(seo.keywords ? { keywords: seo.keywords } : {}),
          other: { title: seo.title },
        };
      }
    }
  } catch {
    /* fall through */
  }

  /* 2. Fallback to site payload */
  try {
    const res = await fetch(`${base}/public/site`, {
      next: { revalidate: 120 },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        locales?: { en?: { meta?: { title?: string; description?: string } } };
      };
      const m = data.locales?.en?.meta;
      if (m?.title && m?.description) {
        return {
          title: m.title,
          description: m.description,
          other: { title: m.title },
        };
      }
    }
  } catch {
    /* fall through */
  }

  /* 3. Static fallback */
  const fallbackTitle = "WESTLER — Industrial Solutions";
  return {
    title: fallbackTitle,
    description:
      "Integrated equipment supply, heavy logistics, and engineering solutions for complex industrial projects.",
    other: { title: fallbackTitle },
  };
}

export default function Home() {
  return <LandingPage />;
}
