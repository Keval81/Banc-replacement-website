import assert from "node:assert/strict";
import test from "node:test";

import {
  FEATURED_LISTINGS_QUERY,
  INITIAL_FEATURED_LISTINGS_STATE,
  loadFeaturedListings,
} from "../featured-listings.ts";
import type { PropertyCardData } from "../property-view.ts";
import type { PropertySearchResult } from "../property-search/types.ts";

function propertyCard(id: string): PropertyCardData {
  return {
    id,
    title: `Home ${id}`,
    address: `${id} High Street, Cuffley`,
    price: "£750,000",
    priceNum: 750_000,
    tags: [],
    stats: { beds: 3, baths: 2 },
    images: [`https://example.test/${id}.jpg`],
    summary: "A verified property summary.",
    propertyType: "house",
    department: "sales",
    status: "for_sale",
  };
}

function result(properties: PropertyCardData[]): PropertySearchResult {
  return {
    query: FEATURED_LISTINGS_QUERY,
    properties,
    total: properties.length,
    page: 1,
    pageSize: 3,
    totalPages: properties.length === 0 ? 0 : 1,
    lastSyncedAt: null,
  };
}

test("starts the Featured Listings section in a visible loading state", () => {
  assert.deepEqual(INITIAL_FEATURED_LISTINGS_STATE, {
    status: "loading",
    listings: [],
  });
});

test("requests exactly three for-sale listings through the canonical property API", async () => {
  const properties = [propertyCard("1"), propertyCard("2"), propertyCard("3")];
  const requests: Array<{ input: string; signal?: AbortSignal | null }> = [];
  const controller = new AbortController();

  const state = await loadFeaturedListings(
    async (input, init) => {
      requests.push({ input: String(input), signal: init?.signal });
      return Response.json(result(properties));
    },
    controller.signal,
  );

  assert.deepEqual(state, { status: "ready", listings: properties });
  assert.deepEqual(requests, [
    {
      input:
        "/api/properties?department=sales&statuses=for_sale&sort=price_desc&pageSize=3",
      signal: controller.signal,
    },
  ]);
});

test("keeps a truthful empty Featured Listings response visible", async () => {
  const state = await loadFeaturedListings(
    async () => Response.json(result([])),
    new AbortController().signal,
  );

  assert.deepEqual(state, { status: "ready", listings: [] });
});

test("turns failed and malformed Featured Listings responses into an error state", async () => {
  const fetchers = [
    async () => new Response("unavailable", { status: 503 }),
    async () => Response.json({ ...result([propertyCard("1")]), properties: [null] }),
  ];

  for (const fetcher of fetchers) {
    const state = await loadFeaturedListings(
      fetcher,
      new AbortController().signal,
    );

    assert.deepEqual(state, { status: "error", listings: [] });
  }
});

test("preserves aborts so an unmounted Featured Listings section cannot update state", async () => {
  const controller = new AbortController();
  const abortError = new DOMException("Aborted", "AbortError");
  controller.abort();

  await assert.rejects(
    loadFeaturedListings(async () => {
      throw abortError;
    }, controller.signal),
    (error: unknown) => error === abortError,
  );
});
