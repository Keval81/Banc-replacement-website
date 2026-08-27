import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPropertyApiHref,
  buildPropertyResultsHref,
  fetchPropertySearchResults,
  PROPERTY_SEARCH_UNAVAILABLE_MESSAGE,
} from "../property-search/navigation.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";
import type {
  PropertySearchQuery,
  PropertySearchResult,
} from "../property-search/types.ts";

function validSalesQuery(
  overrides: Partial<PropertySearchQuery> = {},
): PropertySearchQuery {
  return { ...createDefaultPropertySearchQuery("sales"), ...overrides };
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
  const query = validSalesQuery({ location: "Cuffley", page: 2 });

  assert.equal(
    buildPropertyResultsHref(query),
    "/sales/properties?location=Cuffley&page=2",
  );
  assert.equal(
    buildPropertyApiHref(query),
    "/api/properties?department=sales&location=Cuffley&page=2",
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
  const query = validSalesQuery({ minBedrooms: 3, page: 3, pageSize: 12 });
  const expected = { ...emptyResult(query), total: 25, totalPages: 3 };
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
        "/api/properties?department=sales&minBedrooms=3&page=3&pageSize=12",
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

test("preserves abort errors so stale requests can be ignored", async () => {
  const abortError = new DOMException("Aborted", "AbortError");

  await assert.rejects(
    fetchPropertySearchResults(async () => {
      throw abortError;
    }, validSalesQuery()),
    (error: unknown) => error === abortError,
  );
});
