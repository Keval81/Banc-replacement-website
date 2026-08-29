import type { DbProperty } from "../supabase";

export const CRM_SOURCE_SYSTEMS = ["expert_agent", "streets"] as const;
export type CrmSourceSystem = (typeof CRM_SOURCE_SYSTEMS)[number];

export const SEARCH_PROPERTY_TYPES = [
  "house", "flat", "bungalow", "maisonette", "land", "commercial",
] as const;
export type SearchPropertyType = (typeof SEARCH_PROPERTY_TYPES)[number];

export const SEARCH_TENURES = [
  "freehold", "leasehold", "share_of_freehold", "unknown",
] as const;
export type SearchTenure = (typeof SEARCH_TENURES)[number];

export const SEARCH_FEATURES = [
  "garden", "parking", "garage", "swimming_pool", "balcony", "conservatory", "fireplace",
  "period_features", "new_home", "chain_free", "virtual_tour", "video_tour",
] as const;
export type SearchFeature = (typeof SEARCH_FEATURES)[number];

export type CanonicalPropertyWriteRow = Omit<
  DbProperty,
  "id" | "created_at" | "updated_at"
>;

export interface PropertySourceAdapter<TRecord> {
  readonly sourceSystem: CrmSourceSystem;
  map(
    record: TRecord,
    context: { syncedAt: string },
  ): CanonicalPropertyWriteRow;
}

export function normalizePropertyType(raw: string): SearchPropertyType {
  const value = raw.trim().toLowerCase();
  if (/maisonette/.test(value)) return "maisonette";
  if (/bungalow/.test(value)) return "bungalow";
  if (/flat|apartment|studio/.test(value)) return "flat";
  if (/plot|\bland\b/.test(value)) return "land";
  if (/commercial|office|retail|shop|hotel/.test(value)) return "commercial";
  return "house";
}

export function normalizeTenure(raw: string): SearchTenure {
  const value = raw.trim().toLowerCase();
  if (/share of freehold/.test(value)) return "share_of_freehold";
  if (/leasehold/.test(value)) return "leasehold";
  if (/freehold/.test(value)) return "freehold";
  return "unknown";
}

export function deriveSearchFeatures(
  features: string[],
  virtualTourUrl: string,
): SearchFeature[] {
  const text = features.join(" | ").toLowerCase();
  const matches: Record<SearchFeature, boolean> = {
    garden: /garden|outside space|patio|terrace/.test(text),
    parking: /parking|driveway|off street|off-street/.test(text),
    garage: /garage/.test(text),
    swimming_pool: /swimming pool|indoor pool|outdoor pool|private pool/.test(text),
    balcony: /balcony/.test(text),
    conservatory: /conservator/.test(text),
    fireplace: /fireplace|log burner|wood burner/.test(text),
    period_features: /period|character|listed/.test(text),
    new_home: /new build|newly built|new home/.test(text),
    chain_free: /chain free|no chain|no onward chain/.test(text),
    virtual_tour: virtualTourUrl.trim() !== "",
    video_tour: /video tour/.test(text),
  };

  return SEARCH_FEATURES.filter((feature) => matches[feature]);
}
