import { getPublicApiBase, normalizeUploadedImageSrc } from "./public-api";

export type PublicPartner = {
  id: number;
  image: string | null;
  link: string;
  title: string;
};

export type PublicPartnersResponse = {
  lang: string | null;
  partners: PublicPartner[];
};

export async function fetchPublicPartners(
  lang: string,
  signal?: AbortSignal,
): Promise<PublicPartnersResponse> {
  const base = getPublicApiBase();
  const url = new URL(`${base}/public/partners`);
  url.searchParams.set("lang", lang);
  const res = await fetch(url.toString(), { signal });
  if (!res.ok) {
    throw new Error(`Partners request failed: ${res.status}`);
  }
  return res.json() as Promise<PublicPartnersResponse>;
}

/** Same-origin path for `next/image` (uploads / westler assets). */
export function partnerLogoSrc(raw: string | null | undefined): string | null {
  return normalizeUploadedImageSrc(raw);
}
