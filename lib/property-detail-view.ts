export type PropertyMediaTabId = "floorplan" | "epc" | "map";

export interface PropertyMediaAvailability {
  floorplans: ReadonlyArray<unknown>;
  epcImageUrl: string;
  latitude?: number;
  longitude?: number;
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

export function getAvailablePropertyMedia({
  floorplans,
  epcImageUrl,
  latitude,
  longitude,
}: PropertyMediaAvailability): PropertyMediaTabId[] {
  const tabs: PropertyMediaTabId[] = [];
  if (floorplans.length > 0) tabs.push("floorplan");
  if (getSafeExternalUrl(epcImageUrl)) tabs.push("epc");
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) tabs.push("map");
  return tabs;
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
