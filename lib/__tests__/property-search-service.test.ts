import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { expertAgentAdapter } from "../crm/expert-agent-adapter.ts";
import { parseExpertAgentFeed } from "../expert-agent-feed.ts";
import {
  createDefaultPropertySearchQuery,
} from "../property-search/query.ts";
import {
  createPropertySearchService,
  type PropertySearchRepository,
} from "../property-search/service.ts";
import type { PropertySearchQuery } from "../property-search/types.ts";
import type { DbProperty } from "../supabase.ts";

const xml = readFileSync(
  join(import.meta.dirname, "fixtures", "expert-agent-feed.xml"),
  "utf8",
);
const templateWriteRow = expertAgentAdapter.map(
  parseExpertAgentFeed(xml).properties[0],
  { syncedAt: "2026-08-27T09:00:00.000Z" },
);

function canonicalDbProperty(sourceId: string): DbProperty {
  return {
    ...templateWriteRow,
    id: `uuid-${sourceId}`,
    source_id: sourceId,
    expert_agent_id: sourceId,
    created_at: "2026-08-15T00:00:00.000Z",
    updated_at: "2026-08-27T09:00:00.000Z",
  };
}

function validSalesQuery(
  overrides: Partial<PropertySearchQuery> = {},
): PropertySearchQuery {
  return { ...createDefaultPropertySearchQuery("sales"), ...overrides };
}

test("maps repository rows to safe cards with real totals and freshness", async () => {
  const row = {
    ...canonicalDbProperty("EA-1"),
    internal_audit_note: "must not escape",
  } as DbProperty;
  const search = createPropertySearchService({
    async search() {
      return {
        rows: [row],
        total: 27,
        lastSyncedAt: "2026-08-27T09:00:00.000Z",
      };
    },
  });

  const result = await search(validSalesQuery({ page: 2, pageSize: 12 }));

  assert.equal(result.properties[0].id, "EA-1");
  assert.equal(result.total, 27);
  assert.equal(result.totalPages, 3);
  assert.equal(result.page, 2);
  assert.equal(result.pageSize, 12);
  assert.equal(result.lastSyncedAt, "2026-08-27T09:00:00.000Z");
  for (const internalField of [
    "source_id",
    "source_system",
    "expert_agent_id",
    "is_active",
    "search_features",
    "last_synced_at",
    "internal_audit_note",
  ]) {
    assert.equal(internalField in result.properties[0], false, internalField);
  }
});

test("forwards the request abort signal to the property repository", async () => {
  const controller = new AbortController();
  let receivedSignal: AbortSignal | undefined;
  const search = createPropertySearchService({
    async search(_query, signal) {
      receivedSignal = signal;
      return { rows: [], total: 0, lastSyncedAt: null };
    },
  });

  await search(validSalesQuery(), controller.signal);

  assert.equal(receivedSignal, controller.signal);
});

test("validates and canonicalizes programmatic queries before using the repository", async () => {
  const received: PropertySearchQuery[] = [];
  const repository: PropertySearchRepository = {
    async search(query) {
      received.push(query);
      return { rows: [], total: 0, lastSyncedAt: null };
    },
  };
  const search = createPropertySearchService(repository);
  const untrustedQuery = {
    ...validSalesQuery(),
    page: "2",
    pageSize: "12",
    propertyTypes: ["bungalow", "house", "bungalow"],
    features: ["parking", "garden", "parking"],
    statuses: ["under_offer", "for_sale", "under_offer"],
  } as unknown as PropertySearchQuery;

  const result = await search(untrustedQuery);

  assert.deepEqual(received, [
    {
      ...validSalesQuery(),
      page: 2,
      pageSize: 12,
      propertyTypes: ["house", "bungalow"],
      features: ["garden", "parking"],
      statuses: ["for_sale", "under_offer"],
    },
  ]);
  assert.deepEqual(result.query, received[0]);
});

test("rejects invalid programmatic queries before calling the repository", async () => {
  let calls = 0;
  const search = createPropertySearchService({
    async search() {
      calls += 1;
      return { rows: [], total: 0, lastSyncedAt: null };
    },
  });

  await assert.rejects(
    search({
      ...validSalesQuery(),
      department: "other",
    } as unknown as PropertySearchQuery),
  );
  await assert.rejects(
    search({
      ...validSalesQuery(),
      statuses: ["to_let"],
    } as unknown as PropertySearchQuery),
  );
  assert.equal(calls, 0);
});

test("keeps truthful empty and out-of-range pagination metadata", async () => {
  const empty = createPropertySearchService({
    async search() {
      return { rows: [], total: 0, lastSyncedAt: null };
    },
  });
  assert.deepEqual(await empty(validSalesQuery({ page: 1, pageSize: 12 })), {
    query: validSalesQuery({ page: 1, pageSize: 12 }),
    properties: [],
    total: 0,
    page: 1,
    pageSize: 12,
    totalPages: 0,
    lastSyncedAt: null,
  });

  const outOfRange = createPropertySearchService({
    async search() {
      return {
        rows: [],
        total: 27,
        lastSyncedAt: "2026-08-27T09:00:00.000Z",
      };
    },
  });
  const result = await outOfRange(validSalesQuery({ page: 99, pageSize: 12 }));
  assert.equal(result.properties.length, 0);
  assert.equal(result.total, 27);
  assert.equal(result.totalPages, 3);
  assert.equal(result.page, 99);
});
