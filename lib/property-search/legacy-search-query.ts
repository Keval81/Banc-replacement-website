import type { LegacySearchFeatureFlags, LegacySearchFilters } from "./ui-options.ts";
import {
  SEARCH_PROPERTY_TYPES,
  SEARCH_TENURES,
} from "../crm/property-source.ts";

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
const MAX_LOCATION_LENGTH = 120;
const MAX_RPC_INTEGER = 2_147_483_647;

function optionalInteger(value: string | null, maximum: number): number | undefined {
  const normalized = value?.trim();
  if (!normalized || !/^\d+$/.test(normalized)) return undefined;
  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) && parsed <= maximum ? parsed : undefined;
}

function validInteger(value: number | undefined, maximum: number): value is number {
  return value !== undefined &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= maximum;
}

function canonicalValues<TValue extends string>(
  rawValues: readonly string[],
  canonicalOrder: readonly TValue[],
): TValue[] {
  const requested = new Set(rawValues.map((value) => value.trim()));
  return canonicalOrder.filter((value) => requested.has(value));
}

export function parseLegacySearchParams(searchParams: URLSearchParams): LegacySearchFilters {
  const filters: LegacySearchFilters = {};
  const location = searchParams.get("location")?.trim();
  if (location && location.length <= MAX_LOCATION_LENGTH) filters.location = location;

  const numericFields = [
    ["minPrice", "minPrice", Number.MAX_SAFE_INTEGER],
    ["maxPrice", "maxPrice", Number.MAX_SAFE_INTEGER],
    ["minBeds", "minBeds", MAX_RPC_INTEGER],
    ["minBaths", "minBaths", MAX_RPC_INTEGER],
  ] as const;
  for (const [parameter, field, maximum] of numericFields) {
    const value = optionalInteger(searchParams.get(parameter), maximum);
    if (value !== undefined) filters[field] = value;
  }

  const propertyType = searchParams.get("propertyType");
  if (propertyType) {
    const values = canonicalValues(propertyType.split(","), SEARCH_PROPERTY_TYPES);
    if (values.length > 0) filters.propertyType = values;
  }
  const tenure = searchParams.get("tenure");
  if (tenure) {
    const values = canonicalValues(tenure.split(","), SEARCH_TENURES);
    if (values.length > 0) filters.tenure = values;
  }

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
  const location = filters.location?.trim();
  if (location && location.length <= MAX_LOCATION_LENGTH) params.set("location", location);
  if (validInteger(filters.minPrice, Number.MAX_SAFE_INTEGER)) params.set("minPrice", String(filters.minPrice));
  if (validInteger(filters.maxPrice, Number.MAX_SAFE_INTEGER)) params.set("maxPrice", String(filters.maxPrice));
  if (validInteger(filters.minBeds, MAX_RPC_INTEGER)) params.set("minBeds", String(filters.minBeds));
  if (validInteger(filters.minBaths, MAX_RPC_INTEGER)) params.set("minBaths", String(filters.minBaths));
  const propertyTypes = canonicalValues(filters.propertyType ?? [], SEARCH_PROPERTY_TYPES);
  if (propertyTypes.length > 0) params.set("propertyType", propertyTypes.join(","));
  const tenures = canonicalValues(filters.tenure ?? [], SEARCH_TENURES);
  if (tenures.length > 0) params.set("tenure", tenures.join(","));
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
