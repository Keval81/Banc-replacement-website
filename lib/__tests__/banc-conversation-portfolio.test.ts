import assert from "node:assert/strict";
import test from "node:test";

import { createPropertyPortfolio } from "../banc-conversation/portfolio.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";
import type {
  PropertySearchQuery,
  PropertySearchResult,
} from "../property-search/types.ts";
import type { PropertyFacts } from "../property-facts.ts";

function searchResult(query: PropertySearchQuery): PropertySearchResult {
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

test("adapts canonical property search and fact lookup functions without CRM coupling", async () => {
  const query = createDefaultPropertySearchQuery("sales");
  const expectedSearchResult = searchResult(query);
  const expectedFacts: PropertyFacts[] = [];
  const searchCalls: PropertySearchQuery[] = [];
  const factCalls: Array<readonly string[]> = [];
  const signals: AbortSignal[] = [];
  const portfolio = createPropertyPortfolio({
    search: async (receivedQuery, signal) => {
      searchCalls.push(receivedQuery);
      if (signal !== undefined) signals.push(signal);
      return expectedSearchResult;
    },
    getFacts: async (ids, signal) => {
      factCalls.push(ids);
      if (signal !== undefined) signals.push(signal);
      return expectedFacts;
    },
  });
  const controller = new AbortController();

  assert.equal(await portfolio.search(query, controller.signal), expectedSearchResult);
  assert.equal(await portfolio.getFacts(["EA-1"], controller.signal), expectedFacts);
  assert.deepEqual(searchCalls, [query]);
  assert.deepEqual(factCalls, [["EA-1"]]);
  assert.deepEqual(signals, [controller.signal, controller.signal]);
});
