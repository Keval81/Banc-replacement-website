import assert from "node:assert/strict";
import test from "node:test";

import {
  FEATURED_LISTINGS_LIMIT,
  FEATURED_LISTINGS_QUERY,
  FEATURED_UNDER_OFFER_QUERY,
  INITIAL_FEATURED_LISTINGS_STATE,
  loadFeaturedListings,
  orderFeaturedListings,
} from "../featured-listings.ts";
import type { PropertyCardData } from "../property-view.ts";
import type {
  PropertySearchQuery,
  PropertySearchResult,
} from "../property-search/types.ts";

function propertyCard(
  id: string,
  status: PropertyCardData["status"] = "for_sale",
): PropertyCardData {
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
    status,
  };
}

function result(
  properties: PropertyCardData[],
  query: PropertySearchQuery = FEATURED_LISTINGS_QUERY,
): PropertySearchResult {
  return {
    query,
    properties,
    total: properties.length,
    page: 1,
    pageSize: FEATURED_LISTINGS_LIMIT,
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

test("requests up to eight for-sale listings and stops when the page is full", async () => {
  const properties = Array.from({ length: FEATURED_LISTINGS_LIMIT }, (_, i) =>
    propertyCard(String(i + 1)),
  );
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
        "/api/properties?department=sales&statuses=for_sale&sort=price_desc&pageSize=8",
      signal: controller.signal,
    },
  ]);
});

test("fills remaining featured slots with under-offer homes after the available ones", async () => {
  const available = [propertyCard("a1"), propertyCard("a2")];
  const underOffer = Array.from({ length: 8 }, (_, i) =>
    propertyCard(`u${i + 1}`, "under_offer"),
  );
  const requests: string[] = [];

  const state = await loadFeaturedListings(async (input) => {
    const href = String(input);
    requests.push(href);
    return Response.json(
      href.includes("statuses=under_offer")
        ? result(underOffer, FEATURED_UNDER_OFFER_QUERY)
        : result(available),
    );
  }, new AbortController().signal);

  assert.deepEqual(requests, [
    "/api/properties?department=sales&statuses=for_sale&sort=price_desc&pageSize=8",
    "/api/properties?department=sales&statuses=under_offer&sort=price_desc&pageSize=8",
  ]);
  assert.equal(state.status, "ready");
  assert.equal(state.listings.length, FEATURED_LISTINGS_LIMIT);
  assert.deepEqual(
    state.listings.map((listing) => listing.id),
    ["a1", "a2", "u1", "u2", "u3", "u4", "u5", "u6"],
  );
});

test("orders available homes before under-offer ones, de-duplicates and caps", () => {
  const ordered = orderFeaturedListings(
    [
      propertyCard("u1", "under_offer"),
      propertyCard("a1"),
      propertyCard("u1", "under_offer"),
      propertyCard("a2", "to_let"),
      propertyCard("u2", "under_offer"),
    ],
    3,
  );

  assert.deepEqual(
    ordered.map((listing) => `${listing.id}:${listing.status}`),
    ["a1:for_sale", "a2:to_let", "u1:under_offer"],
  );
});

test("keeps a truthful empty Featured Listings response visible", async () => {
  const state = await loadFeaturedListings(
    async (input) =>
      Response.json(
        String(input).includes("statuses=under_offer")
          ? result([], FEATURED_UNDER_OFFER_QUERY)
          : result([]),
      ),
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
