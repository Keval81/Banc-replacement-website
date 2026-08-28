import { z } from "zod";
import { SEARCH_PROPERTY_TYPES } from "../crm/property-source.ts";
import {
  createDefaultPropertySearchQuery,
  propertySearchQuerySchema,
  serializePropertySearchQuery,
} from "./query.ts";
import type {
  PropertyDepartment,
  PropertySearchFilters,
  PropertySearchQuery,
  PropertySearchResult,
} from "./types.ts";

export const PROPERTY_SEARCH_UNAVAILABLE_MESSAGE =
  "Live listings are temporarily unavailable. Please try again shortly.";

export type PropertySearchFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

const propertyCardSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    address: z.string(),
    price: z.string(),
    priceNum: z.number().finite().nonnegative(),
    tags: z.array(z.string()),
    stats: z
      .object({
        beds: z.number().int().nonnegative(),
        baths: z.number().int().nonnegative(),
        sqft: z.number().finite().positive().optional(),
        epc: z.string().optional(),
      })
      .strict(),
    images: z.array(z.string()),
    summary: z.string(),
    propertyType: z.enum(SEARCH_PROPERTY_TYPES),
    department: z.enum(["sales", "lettings"]),
    status: z.enum(["for_sale", "under_offer", "to_let", "let_agreed"]),
    coordinates: z
      .object({
        latitude: z.number().finite().min(-90).max(90),
        longitude: z.number().finite().min(-180).max(180),
      })
      .strict()
      .optional(),
  })
  .strict();

const propertySearchResultSchema = z
  .object({
    query: propertySearchQuerySchema,
    properties: z.array(propertyCardSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
    lastSyncedAt: z.string().datetime({ offset: true }).nullable(),
  })
  .strict();

export function getPropertySearchFilters(
  query: PropertySearchQuery,
): PropertySearchFilters {
  return {
    location: query.location,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    minBedrooms: query.minBedrooms,
    maxBedrooms: query.maxBedrooms,
    minBathrooms: query.minBathrooms,
    propertyTypes: query.propertyTypes,
    tenures: query.tenures,
    features: query.features,
    sort: query.sort,
  };
}

export function applyPropertySearchFilterPatch(
  query: PropertySearchQuery,
  patch: Partial<PropertySearchFilters>,
): PropertySearchQuery {
  return propertySearchQuerySchema.parse({
    ...query,
    ...patch,
    page: 1,
  });
}

function appendQuery(pathname: string, params: URLSearchParams): string {
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function buildPropertyResultsHref(query: PropertySearchQuery): string {
  return appendQuery(
    `/${query.department}/properties`,
    serializePropertySearchQuery(query),
  );
}

export function buildHomeSearchSubmission(
  department: PropertyDepartment,
  filters: PropertySearchFilters,
): string {
  const query = propertySearchQuerySchema.parse({
    ...createDefaultPropertySearchQuery(department),
    ...filters,
  });
  return buildPropertyResultsHref(query);
}

export function buildPropertyApiHref(query: PropertySearchQuery): string {
  const params = serializePropertySearchQuery(query);
  const ordered = new URLSearchParams([["department", query.department]]);
  params.forEach((value, key) => ordered.append(key, value));
  return appendQuery("/api/properties", ordered);
}

function parsePropertySearchResult(
  value: unknown,
  requestedQuery: PropertySearchQuery,
): PropertySearchResult {
  const result = propertySearchResultSchema.parse(value);
  if (buildPropertyApiHref(result.query) !== buildPropertyApiHref(requestedQuery)) {
    throw new Error(PROPERTY_SEARCH_UNAVAILABLE_MESSAGE);
  }
  if (result.page !== result.query.page || result.pageSize !== result.query.pageSize) {
    throw new Error(PROPERTY_SEARCH_UNAVAILABLE_MESSAGE);
  }

  const expectedTotalPages =
    result.total === 0 ? 0 : Math.ceil(result.total / result.pageSize);
  if (result.totalPages !== expectedTotalPages) {
    throw new Error(PROPERTY_SEARCH_UNAVAILABLE_MESSAGE);
  }

  const expectedProperties =
    result.page > result.totalPages
      ? 0
      : Math.min(
          result.pageSize,
          result.total - (result.page - 1) * result.pageSize,
        );
  if (result.properties.length !== expectedProperties) {
    throw new Error(PROPERTY_SEARCH_UNAVAILABLE_MESSAGE);
  }

  for (const property of result.properties) {
    if (
      property.department !== result.query.department ||
      !result.query.statuses.some((status) => status === property.status)
    ) {
      throw new Error(PROPERTY_SEARCH_UNAVAILABLE_MESSAGE);
    }
  }

  return result;
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.name === "AbortError"
  );
}

export async function fetchPropertySearchResults(
  fetcher: PropertySearchFetch,
  query: PropertySearchQuery,
  init: Pick<RequestInit, "signal"> = {},
): Promise<PropertySearchResult> {
  try {
    const response = await fetcher(buildPropertyApiHref(query), {
      signal: init.signal,
    });
    if (!response.ok) throw new Error(PROPERTY_SEARCH_UNAVAILABLE_MESSAGE);

    const result: unknown = await response.json();
    return parsePropertySearchResult(result, query);
  } catch (error) {
    if (init.signal?.aborted && isAbortError(error)) throw error;
    throw new Error(PROPERTY_SEARCH_UNAVAILABLE_MESSAGE);
  }
}

export function getLastValidPropertyPage(
  requestedQuery: PropertySearchQuery,
  result: PropertySearchResult,
): number | null {
  if (
    result.total > 0 &&
    result.totalPages > 0 &&
    requestedQuery.page > result.totalPages
  ) {
    return result.totalPages;
  }
  return null;
}
