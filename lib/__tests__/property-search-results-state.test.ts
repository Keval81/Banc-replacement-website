import assert from "node:assert/strict";
import test from "node:test";

import { startPropertySearchRequest } from "../../hooks/usePropertySearchResults.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";
import type { PropertySearchResult } from "../property-search/types.ts";

function salesResult(): PropertySearchResult {
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

test("cancels a stale property request and ignores its eventual result", async () => {
  let resolveResponse: ((response: Response) => void) | undefined;
  let receivedSignal: AbortSignal | null | undefined;
  const results: PropertySearchResult[] = [];
  const errors: string[] = [];
  const pendingResponse = new Promise<Response>((resolve) => {
    resolveResponse = resolve;
  });

  const cancel = startPropertySearchRequest({
    query: salesResult().query,
    fetcher: async (_input, init) => {
      receivedSignal = init?.signal;
      return pendingResponse;
    },
    onResult: (result) => results.push(result),
    onError: (message) => errors.push(message),
  });

  cancel();
  resolveResponse?.(Response.json(salesResult()));
  await pendingResponse;
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(receivedSignal?.aborted, true);
  assert.deepEqual(results, []);
  assert.deepEqual(errors, []);
});

test("reports the fixed public error for an active failed request", async () => {
  const errors: string[] = [];

  startPropertySearchRequest({
    query: salesResult().query,
    fetcher: async () => new Response("no", { status: 503 }),
    onResult: () => assert.fail("failed requests must not publish a result"),
    onError: (message) => errors.push(message),
  });

  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(errors, [
    "Live listings are temporarily unavailable. Please try again shortly.",
  ]);
});

test("recovers an out-of-range page before publishing it as an empty result", async () => {
  for (const department of ["sales", "lettings"] as const) {
    const query = {
      ...createDefaultPropertySearchQuery(department),
      page: 4,
      pageSize: 12,
    };
    const result: PropertySearchResult = {
      query,
      properties: [],
      total: 24,
      page: 4,
      pageSize: 12,
      totalPages: 2,
      lastSyncedAt: null,
    };
    const recoveries: Array<{
      requestedQuery: PropertySearchResult["query"];
      page: number;
    }> = [];

    startPropertySearchRequest({
      query,
      fetcher: async () => Response.json(result),
      onResult: () => assert.fail("fallback pages must not publish as empty"),
      onError: (message) => assert.fail(message),
      onOutOfRangePage: (requestedQuery, page) => {
        recoveries.push({ requestedQuery, page });
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.deepEqual(recoveries, [{ requestedQuery: query, page: 2 }]);
  }
});
