import {
  propertySearchQuerySchema,
  serializePropertySearchQuery,
} from "./query.ts";
import type {
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

export function getPropertySearchFilters(
  query: PropertySearchQuery,
): PropertySearchFilters {
  return {
    location: query.location,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    minBedrooms: query.minBedrooms,
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

export function buildPropertyApiHref(query: PropertySearchQuery): string {
  const params = serializePropertySearchQuery(query);
  const ordered = new URLSearchParams([["department", query.department]]);
  params.forEach((value, key) => ordered.append(key, value));
  return appendQuery("/api/properties", ordered);
}

function isPropertySearchResult(value: unknown): value is PropertySearchResult {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<PropertySearchResult>;
  return (
    typeof candidate.query === "object" &&
    candidate.query !== null &&
    Array.isArray(candidate.properties) &&
    Number.isSafeInteger(candidate.total) &&
    Number.isSafeInteger(candidate.page) &&
    Number.isSafeInteger(candidate.pageSize) &&
    Number.isSafeInteger(candidate.totalPages) &&
    (typeof candidate.lastSyncedAt === "string" || candidate.lastSyncedAt === null)
  );
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
    if (!isPropertySearchResult(result)) {
      throw new Error(PROPERTY_SEARCH_UNAVAILABLE_MESSAGE);
    }
    return result;
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new Error(PROPERTY_SEARCH_UNAVAILABLE_MESSAGE);
  }
}
