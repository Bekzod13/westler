/**
 * Optional public origin for absolute URLs in JSON (e.g. https://api.example.com).
 * If unset, APIs keep relative paths like `/uploads/file.webp`.
 */
export function getPublicBaseUrl(): string | undefined {
  const raw = process.env.PUBLIC_BASE_URL?.trim();
  if (!raw) return undefined;
  return raw.replace(/\/$/, '');
}

/** Turn `/uploads/x.webp` into `https://host/uploads/x.webp` when PUBLIC_BASE_URL is set. */
export function absolutizeUploadPath(
  path: string | null | undefined,
): string | null {
  if (path == null || path === '') return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = getPublicBaseUrl();
  if (!base) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
