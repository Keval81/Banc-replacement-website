export type PropertyMediaTabId = "floorplan" | "map";

export interface PropertyMediaAvailability {
  floorplans: ReadonlyArray<unknown>;
  latitude?: number;
  longitude?: number;
}

export type PropertyMediaMode = "photos" | PropertyMediaTabId;

// https only. The Expert Agent feed still emits plain-http media URLs, so
// getSafePropertyImageUrl upgrades those to https for the allowlisted hosts
// rather than dropping them (the CSP's upgrade-insecure-requests would do the
// same in the browser; next/image needs the https pattern server-side).
export const PROPERTY_IMAGE_REMOTE_PATTERNS = [
  { protocol: "https", hostname: "**.expertagent.co.uk", pathname: "/**" },
] as const;

function matchesRemoteHostname(hostname: string, pattern: string): boolean {
  if (!pattern.startsWith("**.")) return hostname === pattern;
  const suffix = pattern.slice(2);
  return hostname.length > suffix.length && hostname.endsWith(suffix);
}

export type PropertyMediaNavigationKey = "ArrowLeft" | "ArrowRight" | "Home" | "End";

export interface PropertyMediaStageAvailability extends PropertyMediaAvailability {
  images: ReadonlyArray<unknown>;
}

export interface PropertyResultsBackLink {
  href: "/sales/properties" | "/lettings/properties";
  label: "Back to properties";
}

export interface PropertyPhotoPresentation<T> {
  items: ReadonlyArray<T>;
  emptyMessage: "No photos available" | null;
}

const EMPTY_FACTS = new Set(["", "unknown", "n/a", "not known", "-"]);

function normaliseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function cleanDescriptionParagraphs(value: string): string[] {
  const seen = new Set<string>();

  return value
    .split(/\n\s*\n/)
    .map(normaliseWhitespace)
    .filter((paragraph) => {
      const key = paragraph.toLocaleLowerCase("en-GB");
      if (EMPTY_FACTS.has(key) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function getDisplayFact(value: string | null | undefined): string | null {
  const normalised = normaliseWhitespace(value ?? "");
  return EMPTY_FACTS.has(normalised.toLocaleLowerCase("en-GB")) ? null : normalised;
}

export function getDisplayCount(value: number): number | null {
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function getSafeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function getSafePropertyImageUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol === "http:") url.protocol = "https:";
    const hostname = url.hostname.toLocaleLowerCase("en-GB");
    const matchesConfiguredPattern = PROPERTY_IMAGE_REMOTE_PATTERNS.some(
      (pattern) =>
        url.protocol === `${pattern.protocol}:` &&
        matchesRemoteHostname(hostname, pattern.hostname),
    );
    if (
      !matchesConfiguredPattern ||
      url.port !== "" ||
      url.username !== "" ||
      url.password !== ""
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function getAvailablePropertyMedia({
  floorplans,
  latitude,
  longitude,
}: PropertyMediaAvailability): PropertyMediaTabId[] {
  const tabs: PropertyMediaTabId[] = [];
  if (floorplans.length > 0) tabs.push("floorplan");
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) tabs.push("map");
  return tabs;
}

export function getAvailablePropertyMediaModes({
  images,
  ...supportingMedia
}: PropertyMediaStageAvailability): PropertyMediaMode[] {
  const modes: PropertyMediaMode[] = [];
  if (images.length > 0) modes.push("photos");
  modes.push(...getAvailablePropertyMedia(supportingMedia));
  return modes;
}

export function getNextPropertyMediaMode(
  modes: ReadonlyArray<PropertyMediaMode>,
  current: PropertyMediaMode,
  key: PropertyMediaNavigationKey
): PropertyMediaMode {
  if (modes.length === 0) return current;
  if (key === "Home") return modes[0];
  if (key === "End") return modes[modes.length - 1];
  const currentIndex = Math.max(0, modes.indexOf(current));
  const delta = key === "ArrowRight" ? 1 : -1;
  return modes[(currentIndex + delta + modes.length) % modes.length];
}

export function getPropertyResultsBackLink(
  department: "sales" | "lettings"
): PropertyResultsBackLink {
  return {
    href: `/${department}/properties`,
    label: "Back to properties",
  };
}

export function isPropertyDetailPath(pathname: string): boolean {
  return /^\/(sales|lettings)\/properties\/[^/]+\/?$/.test(pathname);
}

export function getWrappedGalleryIndex(
  current: number,
  delta: -1 | 1,
  count: number
): number {
  if (count <= 0) return 0;
  return (current + delta + count) % count;
}

export function getPropertyPhotoPresentation<T>(
  images: ReadonlyArray<T>
): PropertyPhotoPresentation<T> {
  return images.length > 0
    ? { items: images, emptyMessage: null }
    : { items: [], emptyMessage: "No photos available" };
}
