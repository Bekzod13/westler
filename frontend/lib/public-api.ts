/** Base URL of the Nest API (no trailing slash). */
export function getPublicApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";
}

/**
 * Banner/upload images: use same-origin `/uploads/...` for `next/image` so the
 * optimizer uses `/_next/image?url=%2Fuploads%2F...` (this app) and `next.config`
 * rewrites `/uploads/*` to the API. Full API URLs on the same origin are reduced to a path.
 *
 * `/westler/...` paths (seed / hero static assets) live under this app’s `public/westler`.
 * If the API absolutizes them with `PUBLIC_BASE_URL`, strip back to a path so `next/image`
 * does not need a remote host for localhost.
 */
export function normalizeUploadedImageSrc(
  raw: string | null | undefined,
): string | null {
  if (raw == null || raw === "") return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  const apiBase = getPublicApiBase();
  let apiOrigin: string;
  try {
    apiOrigin = new URL(apiBase).origin;
  } catch {
    return null;
  }
  try {
    const u = new URL(trimmed, apiBase);
    if (u.origin === apiOrigin) {
      if (u.pathname.startsWith("/uploads")) {
        return `${u.pathname}${u.search}${u.hash}`;
      }
      if (u.pathname.startsWith("/westler")) {
        return `${u.pathname}${u.search}${u.hash}`;
      }
    }
    return trimmed;
  } catch {
    return null;
  }
}

export type PublicBanner = {
  id: number;
  image: string | null;
  video: string | null;
  title: string;
  subtitle: string;
  button: string;
};

export type PublicBannersResponse = {
  lang: string | null;
  banners: PublicBanner[];
};

export async function fetchPublicBanners(
  lang: string,
  signal?: AbortSignal,
): Promise<PublicBannersResponse> {
  const base = getPublicApiBase();
  const url = new URL(`${base}/public/banners`);
  url.searchParams.set("lang", lang);
  const res = await fetch(url.toString(), { signal });
  if (!res.ok) {
    throw new Error(`Banners request failed: ${res.status}`);
  }
  return res.json() as Promise<PublicBannersResponse>;
}

export type CreatePublicOrderInput = {
  fullName: string;
  companyName?: string;
  phone: string;
  email?: string;
  message?: string;
};

/** POST /public/orders — contact form submission (no auth). */
export async function submitPublicOrder(
  input: CreatePublicOrderInput,
  signal?: AbortSignal,
): Promise<{ id: number }> {
  const base = getPublicApiBase();
  const res = await fetch(`${base}/public/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const msg =
      data?.message != null
        ? Array.isArray(data.message)
          ? data.message.join(" ")
          : String(data.message)
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return res.json() as Promise<{ id: number }>;
}

export type PublicSiteResponse = {
  locales: Record<string, Record<string, unknown>>;
};

export async function fetchPublicSite(
  signal?: AbortSignal,
): Promise<PublicSiteResponse> {
  const base = getPublicApiBase();
  const res = await fetch(`${base}/public/site`, {
    signal,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Site request failed: ${res.status}`);
  }
  return res.json() as Promise<PublicSiteResponse>;
}

export type PublicLanguage = {
  code: string;
  name: string;
  isDefault: boolean;
};

export async function fetchPublicLanguages(
  signal?: AbortSignal,
): Promise<PublicLanguage[]> {
  const base = getPublicApiBase();
  const res = await fetch(`${base}/public/languages`, { signal });
  if (!res.ok) {
    throw new Error(`Languages request failed: ${res.status}`);
  }
  return res.json() as Promise<PublicLanguage[]>;
}

export type PublicCompany = {
  id: number;
  image: string | null;
  title: string;
  subtitle: string;
  openedYear: number | null;
  /** `label` = large figure, `value` = caption (matches site stats layout). */
  elements: { sections: Array<{ label: string; value: string }> };
};

export type PublicCompanyResponse = {
  lang: string | null;
  company: PublicCompany | null;
};

export async function fetchPublicCompany(
  lang: string,
  signal?: AbortSignal,
): Promise<PublicCompanyResponse> {
  const base = getPublicApiBase();
  const url = new URL(`${base}/public/companies`);
  url.searchParams.set("lang", lang);
  const res = await fetch(url.toString(), { signal });
  if (!res.ok) {
    throw new Error(`Company request failed: ${res.status}`);
  }
  return res.json() as Promise<PublicCompanyResponse>;
}

export type PublicService = {
  id: number;
  image: string | null;
  title: string;
  subtitle: string;
};

export type PublicServicesResponse = {
  lang: string | null;
  services: PublicService[];
};

export async function fetchPublicServices(
  lang: string,
  signal?: AbortSignal,
): Promise<PublicServicesResponse> {
  const base = getPublicApiBase();
  const url = new URL(`${base}/public/services`);
  url.searchParams.set("lang", lang);
  const res = await fetch(url.toString(), { signal });
  if (!res.ok) {
    throw new Error(`Services request failed: ${res.status}`);
  }
  return res.json() as Promise<PublicServicesResponse>;
}

/** CMS group: flat `strings` by field key + ordered `items` (title/subtitle rows). */
export type PublicGroupPayload = {
  strings: Record<string, string>;
  items: Array<{
    id: number;
    sortOrder: number;
    title: string;
    subtitle: string;
  }>;
};

export type PublicGroupsResponse = {
  lang: string | null;
  groups: Record<string, PublicGroupPayload>;
};

export async function fetchPublicGroups(
  lang: string,
  signal?: AbortSignal,
): Promise<PublicGroupsResponse> {
  const base = getPublicApiBase();
  const url = new URL(`${base}/public/groups`);
  url.searchParams.set("lang", lang);
  const res = await fetch(url.toString(), { signal });
  if (!res.ok) {
    throw new Error(`Groups request failed: ${res.status}`);
  }
  return res.json() as Promise<PublicGroupsResponse>;
}
