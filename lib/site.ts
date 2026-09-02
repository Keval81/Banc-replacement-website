// Canonical site origin. Set NEXT_PUBLIC_SITE_URL in the environment to
// override (e.g. preview deployments); defaults to the production domain.
const DEFAULT_SITE_URL = "https://www.bancproperty.com";

function normaliseOrigin(value: string | undefined): string {
  const trimmed = (value ?? "").trim();
  if (trimmed === "") return DEFAULT_SITE_URL;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return DEFAULT_SITE_URL;
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE_URL: string = normaliseOrigin(process.env.NEXT_PUBLIC_SITE_URL);

export const SITE_NAME = "Banc Property Group";

export function absoluteUrl(path: string, origin: string = SITE_URL): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalisedPath = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  return new URL(normalisedPath, origin).toString();
}

// Trims text for meta descriptions (default 160 chars) on a word boundary.
export function truncateDescription(value: string, max = 160): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
