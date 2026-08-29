import {
  type SearchFeature,
  type SearchPropertyType,
  type SearchTenure,
} from "../crm/property-source.ts";
import type {
  PropertyDepartment,
  PropertySort,
} from "./types.ts";

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
  { value: "swimming_pool", label: "Swimming pool" },
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

function formatSalesPrice(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `£${Number.isInteger(millions) ? millions : millions.toFixed(2)}m`;
  }
  return `£${Math.round(value / 1_000)}k`;
}
