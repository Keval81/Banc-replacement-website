import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPropertyApiHref,
  buildPropertyResultsHref,
  fetchPropertySearchResults,
  getLastValidPropertyPage,
  PROPERTY_SEARCH_UNAVAILABLE_MESSAGE,
} from "../property-search/navigation.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";
import type { PropertyCardData } from "../property-view.ts";
import type {
  PropertySearchQuery,
  PropertySearchResult,
} from "../property-search/types.ts";

function validSalesQuery(
  overrides: Partial<PropertySearchQuery> = {},
): PropertySearchQuery {
  return { ...createDefaultPropertySearchQuery("sales"), ...overrides };
}

function propertyCard(department: "sales" | "lettings"): PropertyCardData {
  return {
    id: `${department}-1`,
    title: "Oak House",
    address: "1 High Street, Cuffley",
    price: department === "sales" ? "£750,000" : "£2,400 pcm",
    priceNum: department === "sales" ? 750_000 : 2_400,
    tags: [],
    stats: { beds: 3, baths: 2 },
    images: ["https://example.test/oak-house.jpg"],
    summary: "A verified property summary.",
    propertyType: "house",
    department,
    status: department === "sales" ? "for_sale" : "to_let",
  };
}

function emptyResult(query: PropertySearchQuery): PropertySearchResult {
  return {
    query,
    properties: [],
    total: 0,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: 0,
    lastSyncedAt: null,
  };
}

test("builds department-specific result and API URLs from one query", () => {
  const query = validSalesQuery({ location: "Cuffley", minBedrooms: 3, maxBedrooms: 3, page: 2 });

  assert.equal(
    buildPropertyResultsHref(query),
    "/sales/properties?location=Cuffley&minBedrooms=3&maxBedrooms=3&page=2",
  );
  assert.equal(
    buildPropertyApiHref(query),
    "/api/properties?department=sales&location=Cuffley&minBedrooms=3&maxBedrooms=3&page=2",
  );

  const lettings = {
    ...createDefaultPropertySearchQuery("lettings"),
    location: "EN6 4EF",
  };
  assert.equal(
    buildPropertyResultsHref(lettings),
    "/lettings/properties?location=EN6+4EF",
  );
});

test("fetches exactly the canonical paginated API URL and returns its result", async () => {
  const query = validSalesQuery({ minBedrooms: 3, maxBedrooms: 3, page: 3, pageSize: 12 });
  const expected = {
    ...emptyResult(query),
    properties: [
      {
        ...propertyCard("sales"),
        coordinates: { latitude: 51.7101, longitude: -0.1124 },
      },
    ],
    total: 25,
    totalPages: 3,
    lastSyncedAt: "2026-08-27T09:00:00+00:00",
  };
  const requests: Array<{ input: string; signal?: AbortSignal | null }> = [];
  const controller = new AbortController();

  const result = await fetchPropertySearchResults(
    async (input, init) => {
      requests.push({
        input: String(input),
        signal: init?.signal,
      });
      return Response.json(expected);
    },
    query,
    { signal: controller.signal },
  );

  assert.deepEqual(result, expected);
  assert.deepEqual(requests, [
    {
      input:
        "/api/properties?department=sales&minBedrooms=3&maxBedrooms=3&page=3&pageSize=12",
      signal: controller.signal,
    },
  ]);
});

test("throws a public message when the property API fails", async () => {
  const fetcher = async () => new Response("unavailable", { status: 503 });

  await assert.rejects(
    fetchPropertySearchResults(fetcher, validSalesQuery()),
    new RegExp(PROPERTY_SEARCH_UNAVAILABLE_MESSAGE, "i"),
  );
});

test("does not expose network or malformed-response details", async () => {
  await assert.rejects(
    fetchPropertySearchResults(async () => {
      throw new Error("private upstream hostname");
    }, validSalesQuery()),
    (error: unknown) => {
      assert.equal(error instanceof Error ? error.message : "", PROPERTY_SEARCH_UNAVAILABLE_MESSAGE);
      return true;
    },
  );

  await assert.rejects(
    fetchPropertySearchResults(
      async () => Response.json({ properties: "not-an-array" }),
      validSalesQuery(),
    ),
    new RegExp(PROPERTY_SEARCH_UNAVAILABLE_MESSAGE, "i"),
  );
});

test("rejects malformed nested cards, mismatched queries and impossible pagination", async () => {
  const query = validSalesQuery();
  const valid = {
    ...emptyResult(query),
    properties: [propertyCard("sales")],
    total: 1,
    totalPages: 1,
  };
  const malformedResults: unknown[] = [
    { ...valid, properties: [null] },
    {
      ...valid,
      properties: [{ ...propertyCard("sales"), stats: { beds: "3", baths: 2 } }],
    },
    { ...valid, query: { ...query, location: "Potters Bar" } },
    { ...valid, properties: [propertyCard("lettings")] },
    { ...valid, total: -1 },
    { ...valid, totalPages: 2 },
    { ...valid, properties: [] },
  ];

  for (const malformed of malformedResults) {
    await assert.rejects(
      fetchPropertySearchResults(
        async () => Response.json(malformed),
        query,
      ),
      new RegExp(PROPERTY_SEARCH_UNAVAILABLE_MESSAGE, "i"),
    );
  }
});

test("recovers both departments from a truthful page beyond the final page", () => {
  for (const department of ["sales", "lettings"] as const) {
    const query = {
      ...createDefaultPropertySearchQuery(department),
      page: 4,
      pageSize: 12,
    };
    const fallback: PropertySearchResult = {
      query,
      properties: [],
      total: 24,
      page: 4,
      pageSize: 12,
      totalPages: 2,
      lastSyncedAt: null,
    };

    assert.equal(getLastValidPropertyPage(query, fallback), 2);
    assert.equal(
      getLastValidPropertyPage(
        { ...query, page: 2 },
        {
          ...fallback,
          query: { ...query, page: 2 },
          properties: [propertyCard(department)],
          total: 13,
          page: 2,
        },
      ),
      null,
    );
  }
});

test("preserves abort errors only when the supplied request signal is aborted", async () => {
  const abortError = new DOMException("Aborted", "AbortError");
  const aborted = new AbortController();
  aborted.abort();

  await assert.rejects(
    fetchPropertySearchResults(async () => {
      throw abortError;
    }, validSalesQuery(), { signal: aborted.signal }),
    (error: unknown) => error === abortError,
  );

  const live = new AbortController();
  await assert.rejects(
    fetchPropertySearchResults(async () => {
      throw abortError;
    }, validSalesQuery(), { signal: live.signal }),
    (error: unknown) => {
      assert.equal(
        error instanceof Error ? error.message : "",
        PROPERTY_SEARCH_UNAVAILABLE_MESSAGE,
      );
      return true;
    },
  );
});
