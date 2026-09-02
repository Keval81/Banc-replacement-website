import {
  fetchPropertySearchResults,
  type PropertySearchFetch,
} from "./property-search/navigation.ts";
import { createDefaultPropertySearchQuery } from "./property-search/query.ts";
import type { PropertySearchQuery } from "./property-search/types.ts";
import type { PropertyCardData } from "./property-view.ts";

// The homepage carousel shows at most 8 homes on desktop and 6 on mobile.
export const FEATURED_LISTINGS_LIMIT = 8;
export const FEATURED_LISTINGS_MOBILE_LIMIT = 6;

// Available homes are requested first; under-offer homes only fill the
// remaining slots so the section never reads as "everything is gone".
export const FEATURED_LISTINGS_QUERY = {
  ...createDefaultPropertySearchQuery("sales"),
  statuses: ["for_sale"],
  sort: "price_desc",
  pageSize: FEATURED_LISTINGS_LIMIT,
} satisfies PropertySearchQuery;

export const FEATURED_UNDER_OFFER_QUERY = {
  ...FEATURED_LISTINGS_QUERY,
  statuses: ["under_offer"],
} satisfies PropertySearchQuery;

export type FeaturedListingsState =
  | { status: "loading"; listings: [] }
  | { status: "ready"; listings: PropertyCardData[] }
  | { status: "error"; listings: [] };

export const INITIAL_FEATURED_LISTINGS_STATE: FeaturedListingsState = {
  status: "loading",
  listings: [],
};

const AVAILABLE_STATUSES: ReadonlySet<PropertyCardData["status"]> = new Set([
  "for_sale",
  "to_let",
]);

export function isAvailableListing(listing: PropertyCardData): boolean {
  return AVAILABLE_STATUSES.has(listing.status);
}

// Stable partition: available listings keep their order and come first,
// followed by everything else, de-duplicated by id and capped at `limit`.
export function orderFeaturedListings(
  listings: PropertyCardData[],
  limit: number = FEATURED_LISTINGS_LIMIT,
): PropertyCardData[] {
  const seen = new Set<string>();
  const available: PropertyCardData[] = [];
  const rest: PropertyCardData[] = [];
  for (const listing of listings) {
    if (seen.has(listing.id)) continue;
    seen.add(listing.id);
    (isAvailableListing(listing) ? available : rest).push(listing);
  }
  return [...available, ...rest].slice(0, Math.max(0, limit));
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export async function loadFeaturedListings(
  fetcher: PropertySearchFetch,
  signal: AbortSignal,
): Promise<Exclude<FeaturedListingsState, { status: "loading" }>> {
  try {
    const available = await fetchPropertySearchResults(
      fetcher,
      FEATURED_LISTINGS_QUERY,
      { signal },
    );
    let listings = available.properties;

    if (listings.length < FEATURED_LISTINGS_LIMIT) {
      const underOffer = await fetchPropertySearchResults(
        fetcher,
        FEATURED_UNDER_OFFER_QUERY,
        { signal },
      );
      listings = [...listings, ...underOffer.properties];
    }

    return { status: "ready", listings: orderFeaturedListings(listings) };
  } catch (error) {
    if (signal.aborted && isAbortError(error)) throw error;
    return { status: "error", listings: [] };
  }
}
