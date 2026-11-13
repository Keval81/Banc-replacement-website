import {
  buildHomeSearchSubmission,
  fetchPropertySearchResults,
  getPropertySearchFilters,
  type PropertySearchFetch,
} from "./property-search/navigation.ts";
import { createDefaultPropertySearchQuery } from "./property-search/query.ts";
import type { PropertyDepartment } from "./property-search/types.ts";

// Each has homes in both sales and lettings (checked 2026-11-13), so no link
// lands on an empty results page.
export const HOME_POPULAR_AREAS = [
  "Cuffley",
  "Goffs Oak",
  "Cheshunt",
] as const;

export type HomePopularArea = (typeof HOME_POPULAR_AREAS)[number];

export function buildPopularAreaHref(
  department: PropertyDepartment,
  area: HomePopularArea,
): string {
  const defaults = getPropertySearchFilters(
    createDefaultPropertySearchQuery(department),
  );
  return buildHomeSearchSubmission(department, { ...defaults, location: area });
}

export function formatListingCount(
  department: PropertyDepartment,
  total: number | undefined,
): string | null {
  if (!total) return null;
  const noun = total === 1 ? "home" : "homes";
  const purpose = department === "sales" ? "for sale" : "to rent";
  return `${total} ${noun} ${purpose} right now`;
}

// Same unfiltered query the results page runs, so the number on the homepage
// matches the "N properties found" the visitor lands on.
export async function loadListingCount(
  fetcher: PropertySearchFetch,
  department: PropertyDepartment,
  signal?: AbortSignal,
): Promise<number> {
  const result = await fetchPropertySearchResults(
    fetcher,
    { ...createDefaultPropertySearchQuery(department), pageSize: 1 },
    { signal },
  );
  return result.total;
}
