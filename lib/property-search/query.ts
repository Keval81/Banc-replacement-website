import { z } from "zod";
import {
  SEARCH_FEATURES,
  SEARCH_PROPERTY_TYPES,
  SEARCH_TENURES,
  type SearchFeature,
} from "../crm/property-source.ts";
import type {
  PropertyDepartment,
  PropertySearchQuery,
  PropertySort,
  PublicPropertyStatus,
} from "./types";

const SALES_STATUSES = ["for_sale", "under_offer"] as const;
const LETTINGS_STATUSES = ["to_let", "let_agreed"] as const;
const PROPERTY_SORTS = ["default", "price_asc", "price_desc"] as const;

export const POSTGRES_SIGNED_INTEGER_MAX = 2_147_483_647;
export const MAX_PROPERTY_SEARCH_PRICE = Number.MAX_SAFE_INTEGER;
export const MAX_PROPERTY_SEARCH_PAGE_SIZE = 48;
export const MAX_PROPERTY_SEARCH_PAGE =
  Math.floor(POSTGRES_SIGNED_INTEGER_MAX / MAX_PROPERTY_SEARCH_PAGE_SIZE) + 1;

const LEGACY_FEATURE_FLAGS: ReadonlyArray<readonly [string, SearchFeature]> = [
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
];

function coerceOptionalNumber(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : Number(trimmed);
}

function boundedIntegerSchema(minimum: number, maximum: number) {
  return z
    .number()
    .finite()
    .min(minimum)
    .max(maximum)
    .refine((value) => Number.isSafeInteger(value), "Expected a safe integer");
}

function optionalBoundedIntegerSchema(maximum: number) {
  return z.preprocess(
    coerceOptionalNumber,
    boundedIntegerSchema(0, maximum).optional(),
  );
}

const locationSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  },
  z.string().max(120).optional(),
);

const propertyTypesSchema = z
  .array(z.enum(SEARCH_PROPERTY_TYPES))
  .transform((selected) => {
    const selectedSet = new Set(selected);
    return SEARCH_PROPERTY_TYPES.filter((value) => selectedSet.has(value));
  })
  .default([]);

const tenuresSchema = z
  .array(z.enum(SEARCH_TENURES))
  .transform((selected) => {
    const selectedSet = new Set(selected);
    return SEARCH_TENURES.filter((value) => selectedSet.has(value));
  })
  .default([]);

const featuresSchema = z
  .array(z.enum(SEARCH_FEATURES))
  .transform((selected) => {
    const selectedSet = new Set(selected);
    return SEARCH_FEATURES.filter((value) => selectedSet.has(value));
  })
  .default([]);

const salesStatusesSchema = z
  .array(z.enum(SALES_STATUSES))
  .min(1)
  .transform((selected) => {
    const selectedSet = new Set(selected);
    return SALES_STATUSES.filter((value) => selectedSet.has(value));
  })
  .default([...SALES_STATUSES]);

const lettingsStatusesSchema = z
  .array(z.enum(LETTINGS_STATUSES))
  .min(1)
  .transform((selected) => {
    const selectedSet = new Set(selected);
    return LETTINGS_STATUSES.filter((value) => selectedSet.has(value));
  })
  .default([...LETTINGS_STATUSES]);

const commonQueryShape = {
  location: locationSchema,
  minPrice: optionalBoundedIntegerSchema(MAX_PROPERTY_SEARCH_PRICE),
  maxPrice: optionalBoundedIntegerSchema(MAX_PROPERTY_SEARCH_PRICE),
  minBedrooms: optionalBoundedIntegerSchema(POSTGRES_SIGNED_INTEGER_MAX),
  minBathrooms: optionalBoundedIntegerSchema(POSTGRES_SIGNED_INTEGER_MAX),
  propertyTypes: propertyTypesSchema,
  tenures: tenuresSchema,
  features: featuresSchema,
  sort: z.enum(PROPERTY_SORTS).default("default"),
  page: z.preprocess(
    coerceOptionalNumber,
    boundedIntegerSchema(1, MAX_PROPERTY_SEARCH_PAGE).default(1),
  ),
  pageSize: z.preprocess(
    coerceOptionalNumber,
    boundedIntegerSchema(1, MAX_PROPERTY_SEARCH_PAGE_SIZE).default(24),
  ),
};

const salesQuerySchema = z
  .object({
    ...commonQueryShape,
    department: z.literal("sales"),
    statuses: salesStatusesSchema,
  })
  .strict();

const lettingsQuerySchema = z
  .object({
    ...commonQueryShape,
    department: z.literal("lettings"),
    statuses: lettingsStatusesSchema,
  })
  .strict();

export const propertySearchQuerySchema = z.discriminatedUnion("department", [
  salesQuerySchema,
  lettingsQuerySchema,
]);

function defaultStatuses(department: PropertyDepartment): PublicPropertyStatus[] {
  return department === "sales" ? [...SALES_STATUSES] : [...LETTINGS_STATUSES];
}

export function createDefaultPropertySearchQuery(
  department: PropertyDepartment,
): PropertySearchQuery {
  return {
    department,
    propertyTypes: [],
    tenures: [],
    features: [],
    statuses: defaultStatuses(department),
    sort: "default",
    page: 1,
    pageSize: 24,
  };
}

function selectedParam(
  params: URLSearchParams,
  canonicalName: string,
  legacyNames: readonly string[] = [],
): string | null {
  if (params.has(canonicalName)) return params.get(canonicalName);
  const legacyName = legacyNames.find((name) => params.has(name));
  return legacyName ? params.get(legacyName) : null;
}

function parseInteger(
  raw: string | null,
  options: { min: number; max: number },
): number | undefined {
  if (raw === null || raw.trim() === "") return undefined;
  const value = Number(raw);
  if (!Number.isSafeInteger(value)) return undefined;
  if (value < options.min || value > options.max) {
    return undefined;
  }
  return value;
}

function parseAllowedList<T extends string>(
  raw: string | null,
  allowed: readonly T[],
): T[] {
  if (raw === null) return [];
  const requested = new Set(raw.split(",").map((value) => value.trim()));
  return allowed.filter((value) => requested.has(value));
}

function parseLocation(raw: string | null): string | undefined {
  if (raw === null) return undefined;
  const location = raw.trim();
  return location.length > 0 && location.length <= 120 ? location : undefined;
}

function parseSort(params: URLSearchParams): PropertySort {
  if (params.has("sort")) {
    const sort = params.get("sort");
    return PROPERTY_SORTS.find((value) => value === sort) ?? "default";
  }

  const legacySort = params.get("sortBy");
  if (legacySort === "newest") return "default";
  return PROPERTY_SORTS.find((value) => value === legacySort) ?? "default";
}

function parseFeatures(params: URLSearchParams): SearchFeature[] {
  const selected = new Set(
    parseAllowedList(params.get("features"), SEARCH_FEATURES),
  );
  for (const [parameter, feature] of LEGACY_FEATURE_FLAGS) {
    if (params.get(parameter) === "true") selected.add(feature);
  }
  return SEARCH_FEATURES.filter((feature) => selected.has(feature));
}

export function parsePropertySearchParams(
  params: URLSearchParams,
  department: PropertyDepartment,
): PropertySearchQuery {
  const defaults = createDefaultPropertySearchQuery(department);
  const allowedStatuses = department === "sales" ? SALES_STATUSES : LETTINGS_STATUSES;
  const statuses = parseAllowedList(params.get("statuses"), allowedStatuses);
  const location = parseLocation(params.get("location"));
  const minPrice = parseInteger(params.get("minPrice"), {
    min: 0,
    max: MAX_PROPERTY_SEARCH_PRICE,
  });
  const maxPrice = parseInteger(params.get("maxPrice"), {
    min: 0,
    max: MAX_PROPERTY_SEARCH_PRICE,
  });
  const minBedrooms = parseInteger(
    selectedParam(params, "minBedrooms", ["minBeds"]),
    { min: 0, max: POSTGRES_SIGNED_INTEGER_MAX },
  );
  const minBathrooms = parseInteger(
    selectedParam(params, "minBathrooms", ["minBaths"]),
    { min: 0, max: POSTGRES_SIGNED_INTEGER_MAX },
  );
  const page =
    parseInteger(params.get("page"), { min: 1, max: MAX_PROPERTY_SEARCH_PAGE }) ??
    defaults.page;
  const pageSize =
    parseInteger(params.get("pageSize"), {
      min: 1,
      max: MAX_PROPERTY_SEARCH_PAGE_SIZE,
    }) ?? defaults.pageSize;

  return propertySearchQuerySchema.parse({
    ...defaults,
    ...(location !== undefined ? { location } : {}),
    ...(minPrice !== undefined ? { minPrice } : {}),
    ...(maxPrice !== undefined ? { maxPrice } : {}),
    ...(minBedrooms !== undefined ? { minBedrooms } : {}),
    ...(minBathrooms !== undefined ? { minBathrooms } : {}),
    propertyTypes: parseAllowedList(
      selectedParam(params, "propertyTypes", ["propertyType"]),
      SEARCH_PROPERTY_TYPES,
    ),
    tenures: parseAllowedList(
      selectedParam(params, "tenures", ["tenure"]),
      SEARCH_TENURES,
    ),
    features: parseFeatures(params),
    statuses: statuses.length > 0 ? statuses : defaults.statuses,
    sort: parseSort(params),
    page,
    pageSize,
  });
}

function setList<T extends string>(
  params: URLSearchParams,
  name: string,
  values: readonly T[],
  canonicalOrder: readonly T[],
): void {
  const selected = new Set(values);
  const ordered = canonicalOrder.filter((value) => selected.has(value));
  if (ordered.length > 0) params.set(name, ordered.join(","));
}

function statusesEqualDefaults(query: PropertySearchQuery): boolean {
  const defaults = defaultStatuses(query.department);
  return (
    query.statuses.length === defaults.length &&
    query.statuses.every((status, index) => status === defaults[index])
  );
}

export function serializePropertySearchQuery(query: PropertySearchQuery): URLSearchParams {
  const validated = propertySearchQuerySchema.parse(query);
  const params = new URLSearchParams();

  if (validated.location !== undefined) params.set("location", validated.location);
  if (validated.minPrice !== undefined) params.set("minPrice", String(validated.minPrice));
  if (validated.maxPrice !== undefined) params.set("maxPrice", String(validated.maxPrice));
  if (validated.minBedrooms !== undefined) {
    params.set("minBedrooms", String(validated.minBedrooms));
  }
  if (validated.minBathrooms !== undefined) {
    params.set("minBathrooms", String(validated.minBathrooms));
  }
  setList(params, "propertyTypes", validated.propertyTypes, SEARCH_PROPERTY_TYPES);
  setList(params, "tenures", validated.tenures, SEARCH_TENURES);
  setList(params, "features", validated.features, SEARCH_FEATURES);
  if (!statusesEqualDefaults(validated)) {
    const statusOrder = validated.department === "sales" ? SALES_STATUSES : LETTINGS_STATUSES;
    setList(params, "statuses", validated.statuses, statusOrder);
  }
  if (validated.sort !== "default") params.set("sort", validated.sort);
  if (validated.page !== 1) params.set("page", String(validated.page));
  if (validated.pageSize !== 24) params.set("pageSize", String(validated.pageSize));

  return params;
}

export function switchSearchDepartment(
  query: PropertySearchQuery,
  department: PropertyDepartment,
): PropertySearchQuery {
  const current = propertySearchQuerySchema.parse(query);
  if (current.department === department) return current;
  const defaults = createDefaultPropertySearchQuery(department);
  return propertySearchQuerySchema.parse({
    ...defaults,
    ...(current.location !== undefined ? { location: current.location } : {}),
    ...(current.minBedrooms !== undefined ? { minBedrooms: current.minBedrooms } : {}),
    ...(current.minBathrooms !== undefined ? { minBathrooms: current.minBathrooms } : {}),
    propertyTypes: current.propertyTypes,
    features: current.features,
    sort: current.sort,
    pageSize: current.pageSize,
  });
}

export function hasActivePropertyFilters(query: PropertySearchQuery): boolean {
  const validated = propertySearchQuerySchema.parse(query);
  return (
    validated.location !== undefined ||
    validated.minPrice !== undefined ||
    validated.maxPrice !== undefined ||
    validated.minBedrooms !== undefined ||
    validated.minBathrooms !== undefined ||
    validated.propertyTypes.length > 0 ||
    validated.tenures.length > 0 ||
    validated.features.length > 0 ||
    !statusesEqualDefaults(validated)
  );
}
