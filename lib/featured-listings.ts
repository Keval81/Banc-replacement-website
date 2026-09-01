import {
  fetchPropertySearchResults,
  type PropertySearchFetch,
} from "./property-search/navigation.ts";
import { createDefaultPropertySearchQuery } from "./property-search/query.ts";
import type { PropertySearchQuery } from "./property-search/types.ts";
import type { PropertyCardData } from "./property-view.ts";

export const FEATURED_LISTINGS_QUERY = {
  ...createDefaultPropertySearchQuery("sales"),
  statuses: ["for_sale"],
  sort: "price_desc",
  pageSize: 3,
} satisfies PropertySearchQuery;

export type FeaturedListingsState =
  | { status: "loading"; listings: [] }
  | { status: "ready"; listings: PropertyCardData[] }
  | { status: "error"; listings: [] };

export const INITIAL_FEATURED_LISTINGS_STATE: FeaturedListingsState = {
  status: "loading",
  listings: [],
};

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export async function loadFeaturedListings(
  fetcher: PropertySearchFetch,
  signal: AbortSignal,
): Promise<Exclude<FeaturedListingsState, { status: "loading" }>> {
  try {
    const result = await fetchPropertySearchResults(
      fetcher,
      FEATURED_LISTINGS_QUERY,
      { signal },
    );
    return { status: "ready", listings: result.properties };
  } catch (error) {
    if (signal.aborted && isAbortError(error)) throw error;
    return { status: "error", listings: [] };
  }
}
