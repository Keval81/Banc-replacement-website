import assert from "node:assert/strict";
import test from "node:test";

import { handlePropertySearchRequest } from "../property-search/http.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";
import type { PropertySearchResult } from "../property-search/types.ts";

function resultForSales(): PropertySearchResult {
  const query = createDefaultPropertySearchQuery("sales");
  return {
    query,
    properties: [],
    total: 0,
    page: 1,
    pageSize: 24,
    totalPages: 0,
    lastSyncedAt: null,
  };
}

test("returns 400 and does not search when department is missing or not exact", async () => {
  let calls = 0;
  const search = async () => {
    calls += 1;
    return resultForSales();
  };

  for (const url of [
    "https://banc.test/api/properties",
    "https://banc.test/api/properties?department=other",
    "https://banc.test/api/properties?department=Sales",
    "https://banc.test/api/properties?department=sales&department=lettings",
  ]) {
    const response = await handlePropertySearchRequest(new Request(url), search);
    assert.equal(response.status, 400, url);
    assert.deepEqual(await response.json(), {
      error: "Choose whether you are buying or renting.",
    });
  }
  assert.equal(calls, 0);
});

test("parses a valid URL, invokes search once, and returns its canonical result", async () => {
  const received: unknown[] = [];
  const expected = {
    ...resultForSales(),
    query: {
      ...createDefaultPropertySearchQuery("sales"),
      location: "Cuffley",
      minBedrooms: 3,
      page: 2,
      pageSize: 12,
    },
    total: 27,
    totalPages: 3,
  };
  const response = await handlePropertySearchRequest(
    new Request(
      "https://banc.test/api/properties?department=sales&location=%20Cuffley%20" +
        "&minBedrooms=3&page=2&pageSize=12",
    ),
    async (query) => {
      received.push(query);
      return expected;
    },
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /application\/json/);
  assert.deepEqual(received, [expected.query]);
  assert.deepEqual(await response.json(), expected);
});

test("returns a fixed 503 response without leaking search exception details", async () => {
  const response = await handlePropertySearchRequest(
    new Request("https://banc.test/api/properties?department=lettings"),
    async () => {
      throw new Error("database host, SQL and credentials stay private");
    },
  );

  assert.equal(response.status, 503);
  const body = await response.json();
  assert.deepEqual(body, {
    error: "Live listings are temporarily unavailable. Please try again shortly.",
  });
  assert.doesNotMatch(JSON.stringify(body), /database|SQL|credentials/i);
});

