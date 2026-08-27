import {
  SEARCH_FEATURES,
  SEARCH_PROPERTY_TYPES,
  SEARCH_TENURES,
  type SearchFeature,
  type SearchPropertyType,
  type SearchTenure,
} from "../crm/property-source.ts";
import type {
  PropertyDepartment,
  PropertySearchFilters,
  PropertySort,
} from "./types.ts";

export interface LegacySearchFeatureFlags {
  garden?: boolean;
  parking?: boolean;
  garage?: boolean;
  balcony?: boolean;
  conservatory?: boolean;
  fireplace?: boolean;
  periodFeatures?: boolean;
  newBuild?: boolean;
  chainFree?: boolean;
  virtualTour?: boolean;
  videoTour?: boolean;
}

/** @deprecated Task 8/9 compatibility only. Use PropertySearchFilters. */
export interface LegacySearchFilters {
  location?: string;
  radius?: number;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  propertyType?: string[];
  tenure?: string[];
  features?: LegacySearchFeatureFlags;
  sortBy?: "default" | "price_asc" | "price_desc" | "newest" | "reduced" | "popular";
}

interface SearchOption<TValue extends string | number> {
  value: TValue;
  label: string;
}

const SALES_PRICE_OPTIONS = [
  100_000,
  150_000,
  200_000,
  250_000,
  300_000,
  400_000,
  500_000,
  600_000,
  750_000,
  1_000_000,
  1_250_000,
  1_500_000,
  2_000_000,
  3_000_000,
  5_000_000,
].map((value) => ({ value, label: formatSalesPrice(value) }));

const LETTINGS_PRICE_OPTIONS = [
  500,
  750,
  1_000,
  1_250,
  1_500,
  1_750,
  2_000,
  2_500,
  3_000,
  3_500,
  4_000,
  5_000,
  7_500,
  10_000,
].map((value) => ({ value, label: `£${value.toLocaleString("en-GB")} pcm` }));

export const PROPERTY_TYPE_OPTIONS: readonly SearchOption<SearchPropertyType>[] = [
  { value: "house", label: "House" },
  { value: "flat", label: "Flat" },
  { value: "bungalow", label: "Bungalow" },
  { value: "maisonette", label: "Maisonette" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
] as const;

export const TENURE_OPTIONS: readonly SearchOption<SearchTenure>[] = [
  { value: "freehold", label: "Freehold" },
  { value: "leasehold", label: "Leasehold" },
  { value: "share_of_freehold", label: "Share of Freehold" },
  { value: "unknown", label: "Tenure not specified" },
] as const;

export const FEATURE_OPTIONS: readonly SearchOption<SearchFeature>[] = [
  { value: "garden", label: "Garden / outside space" },
  { value: "parking", label: "Parking" },
  { value: "garage", label: "Garage" },
  { value: "balcony", label: "Balcony" },
  { value: "conservatory", label: "Conservatory" },
  { value: "fireplace", label: "Fireplace" },
  { value: "period_features", label: "Period features" },
  { value: "new_home", label: "New home" },
  { value: "chain_free", label: "Chain free" },
  { value: "virtual_tour", label: "Virtual tour" },
  { value: "video_tour", label: "Video tour" },
] as const;

export const SORT_OPTIONS: readonly SearchOption<PropertySort>[] = [
  { value: "default", label: "Default" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

export const BEDROOM_OPTIONS = [0, 1, 2, 3, 4, 5, 6].map((value) => ({
  value,
  label: value === 0 ? "Studio+" : `${value}+`,
}));

export const BATHROOM_OPTIONS = [1, 2, 3, 4, 5].map((value) => ({
  value,
  label: `${value}+`,
}));

export const UNSUPPORTED_FILTER_KEYS = [
  "radius",
  "maxBedrooms",
  "maxBathrooms",
  "popular",
  "reduced",
  "newest",
] as const;

export function getPriceOptions(
  department: PropertyDepartment,
): readonly SearchOption<number>[] {
  return department === "sales" ? SALES_PRICE_OPTIONS : LETTINGS_PRICE_OPTIONS;
}

export function toggleCanonicalOption<TValue extends string>(
  selected: readonly TValue[],
  value: TValue,
  canonicalOrder: readonly TValue[],
): TValue[] {
  const selectedSet = new Set(selected);
  if (selectedSet.has(value)) {
    selectedSet.delete(value);
  } else {
    selectedSet.add(value);
  }
  return canonicalOrder.filter((option) => selectedSet.has(option));
}

export function formatSearchPrice(value: number, department: PropertyDepartment): string {
  return department === "lettings"
    ? `£${value.toLocaleString("en-GB")} pcm`
    : formatSalesPrice(value);
}

const LEGACY_FEATURE_MAP = [
  ["garden", "garden"],
  ["parking", "parking"],
  ["garage", "garage"],
  ["balcony", "balcony"],
  ["conservatory", "conservatory"],
  ["fireplace", "fireplace"],
  ["periodFeatures", "period_features"],
  ["newBuild", "new_home"],
  ["chainFree", "chain_free"],
  ["virtualTour", "virtual_tour"],
  ["videoTour", "video_tour"],
] as const satisfies ReadonlyArray<readonly [keyof LegacySearchFeatureFlags, SearchFeature]>;

export function legacyFiltersToCanonical(
  legacy: LegacySearchFilters,
): PropertySearchFilters {
  const requestedPropertyTypes = new Set(legacy.propertyType ?? []);
  const requestedTenures = new Set(legacy.tenure ?? []);
  const requestedFeatures = new Set(
    LEGACY_FEATURE_MAP.filter(([key]) => legacy.features?.[key]).map(([, feature]) => feature),
  );

  return {
    ...(legacy.location ? { location: legacy.location } : {}),
    ...(legacy.minPrice !== undefined ? { minPrice: legacy.minPrice } : {}),
    ...(legacy.maxPrice !== undefined ? { maxPrice: legacy.maxPrice } : {}),
    ...(legacy.minBeds !== undefined ? { minBedrooms: legacy.minBeds } : {}),
    ...(legacy.minBaths !== undefined ? { minBathrooms: legacy.minBaths } : {}),
    propertyTypes: SEARCH_PROPERTY_TYPES.filter((value) => requestedPropertyTypes.has(value)),
    tenures: SEARCH_TENURES.filter((value) => requestedTenures.has(value)),
    features: SEARCH_FEATURES.filter((value) => requestedFeatures.has(value)),
    sort:
      legacy.sortBy === "price_asc" || legacy.sortBy === "price_desc"
        ? legacy.sortBy
        : "default",
  };
}

export function canonicalFiltersToLegacyPatch(
  filters: Partial<PropertySearchFilters>,
): Partial<LegacySearchFilters> {
  const patch: Partial<LegacySearchFilters> = {};
  if ("location" in filters) patch.location = filters.location;
  if ("minPrice" in filters) patch.minPrice = filters.minPrice;
  if ("maxPrice" in filters) patch.maxPrice = filters.maxPrice;
  if ("minBedrooms" in filters) patch.minBeds = filters.minBedrooms;
  if ("minBathrooms" in filters) patch.minBaths = filters.minBathrooms;
  if ("propertyTypes" in filters) patch.propertyType = filters.propertyTypes;
  if ("tenures" in filters) patch.tenure = filters.tenures;
  if ("sort" in filters) {
    patch.sortBy = filters.sort === "default" ? undefined : filters.sort;
  }
  if ("features" in filters) {
    if (filters.features === undefined) {
      patch.features = undefined;
    } else {
      const selected = new Set(filters.features);
      patch.features = Object.fromEntries(
        LEGACY_FEATURE_MAP.map(([key, feature]) => [key, selected.has(feature)]),
      ) as LegacySearchFeatureFlags;
    }
  }
  return patch;
}

function formatSalesPrice(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `£${Number.isInteger(millions) ? millions : millions.toFixed(2)}m`;
  }
  return `£${Math.round(value / 1_000)}k`;
}
