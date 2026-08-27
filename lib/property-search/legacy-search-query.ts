import type { LegacySearchFeatureFlags, LegacySearchFilters } from "./ui-options.ts";

const FEATURE_PARAMETERS = [
  "garden",
  "parking",
  "garage",
  "balcony",
  "conservatory",
  "fireplace",
  "periodFeatures",
  "newBuild",
  "chainFree",
  "virtualTour",
  "videoTour",
] as const satisfies readonly (keyof LegacySearchFeatureFlags)[];

const LEGACY_SORTS = ["default", "newest", "price_asc", "price_desc"] as const;

function optionalInteger(value: string | null): number | undefined {
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

export function parseLegacySearchParams(searchParams: URLSearchParams): LegacySearchFilters {
  const filters: LegacySearchFilters = {};
  const location = searchParams.get("location")?.trim();
  if (location) filters.location = location;

  const numericFields = [
    ["minPrice", "minPrice"],
    ["maxPrice", "maxPrice"],
    ["minBeds", "minBeds"],
    ["minBaths", "minBaths"],
  ] as const;
  for (const [parameter, field] of numericFields) {
    const value = optionalInteger(searchParams.get(parameter));
    if (value !== undefined) filters[field] = value;
  }

  const propertyType = searchParams.get("propertyType");
  if (propertyType) filters.propertyType = propertyType.split(",").filter(Boolean);
  const tenure = searchParams.get("tenure");
  if (tenure) filters.tenure = tenure.split(",").filter(Boolean);

  const features: LegacySearchFeatureFlags = {};
  for (const parameter of FEATURE_PARAMETERS) {
    if (searchParams.get(parameter) === "true") features[parameter] = true;
  }
  if (Object.keys(features).length > 0) filters.features = features;

  const sortBy = searchParams.get("sortBy");
  if (LEGACY_SORTS.some((sort) => sort === sortBy)) {
    filters.sortBy = sortBy as (typeof LEGACY_SORTS)[number];
  }
  return filters;
}

export function filtersToLegacySearchParams(filters: LegacySearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.location) params.set("location", filters.location);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.minBeds !== undefined) params.set("minBeds", String(filters.minBeds));
  if (filters.minBaths !== undefined) params.set("minBaths", String(filters.minBaths));
  if (filters.propertyType?.length) params.set("propertyType", filters.propertyType.join(","));
  if (filters.tenure?.length) params.set("tenure", filters.tenure.join(","));
  for (const parameter of FEATURE_PARAMETERS) {
    if (filters.features?.[parameter]) params.set(parameter, "true");
  }
  if (filters.sortBy && LEGACY_SORTS.some((sort) => sort === filters.sortBy)) {
    params.set("sortBy", filters.sortBy);
  }
  return params;
}

export function hasActiveLegacyFilters(filters: LegacySearchFilters): boolean {
  return Boolean(
    filters.location !== undefined ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.minBeds !== undefined ||
    filters.minBaths !== undefined ||
    (filters.propertyType?.length ?? 0) > 0 ||
    (filters.tenure?.length ?? 0) > 0 ||
    FEATURE_PARAMETERS.some((feature) => filters.features?.[feature]) ||
    (filters.sortBy !== undefined &&
      LEGACY_SORTS.some((sort) => sort === filters.sortBy) &&
      filters.sortBy !== "default" &&
      filters.sortBy !== "newest")
  );
}
