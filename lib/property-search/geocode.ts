export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface GeocodeOptions {
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
}

// postcodes.io covers every case we need without a key: full postcodes,
// bare outcodes, and place names. Google Geocoding would need a server key
// this project does not hold.
const POSTCODES_IO = "https://api.postcodes.io";
const FULL_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/;
const OUTCODE = /^[A-Z]{1,2}\d[A-Z\d]?$/;

function toPoint(value: unknown): GeoPoint | null {
  if (typeof value !== "object" || value === null) return null;
  const { latitude, longitude } = value as Record<string, unknown>;
  if (typeof latitude !== "number" || !Number.isFinite(latitude)) return null;
  if (typeof longitude !== "number" || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

function lookupUrl(location: string): string {
  const compact = location.replace(/\s+/g, " ").toUpperCase();
  if (FULL_POSTCODE.test(compact)) {
    return `${POSTCODES_IO}/postcodes/${encodeURIComponent(compact)}`;
  }
  if (OUTCODE.test(compact)) {
    return `${POSTCODES_IO}/outcodes/${encodeURIComponent(compact)}`;
  }
  return `${POSTCODES_IO}/places?q=${encodeURIComponent(location)}&limit=1`;
}

/**
 * Resolve a typed search location to a point. Returns null for anything that
 * cannot be resolved, so a radius search degrades to plain text matching
 * rather than failing the whole search.
 */
export async function geocodeSearchLocation(
  location: string,
  { fetchImpl = fetch, signal }: GeocodeOptions = {},
): Promise<GeoPoint | null> {
  const trimmed = location.trim();
  if (trimmed === "") return null;

  try {
    const response = await fetchImpl(lookupUrl(trimmed), { signal });
    if (!response.ok) return null;
    const body = (await response.json()) as { result?: unknown };
    const result = Array.isArray(body.result) ? body.result[0] : body.result;
    return toPoint(result);
  } catch {
    return null;
  }
}
