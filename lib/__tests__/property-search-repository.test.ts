import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { expertAgentAdapter } from "../crm/expert-agent-adapter.ts";
import { parseExpertAgentFeed } from "../expert-agent-feed.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";
import { SupabasePropertySearchRepository } from "../property-search/supabase-repository.ts";
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

function fullQuery(): PropertySearchQuery {
  return {
    ...createDefaultPropertySearchQuery("sales"),
    location: "EN6 4EF",
    minPrice: 500_000,
    maxPrice: 900_000,
    minBedrooms: 3,
    minBathrooms: 2,
    propertyTypes: ["house", "bungalow"],
    tenures: ["freehold"],
    features: ["garden", "parking"],
    statuses: ["under_offer"],
    sort: "price_asc",
    page: 2,
    pageSize: 12,
  };
}

interface FakeOptions {
  rpcData?: unknown;
  rpcError?: unknown;
  freshnessData?: unknown;
  freshnessError?: unknown;
}

function createFakeClient(options: FakeOptions = {}) {
  const rpcCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const freshnessCalls: Array<[string, ...unknown[]]> = [];
  const freshnessResult = {
    data:
      "freshnessData" in options
        ? options.freshnessData
        : { finished_at: "2026-08-27T09:00:00.000Z" },
    error: options.freshnessError ?? null,
  };
  const freshnessBuilder = {
    select(...args: unknown[]) {
      freshnessCalls.push(["select", ...args]);
      return this;
    },
    eq(...args: unknown[]) {
      freshnessCalls.push(["eq", ...args]);
      return this;
    },
    order(...args: unknown[]) {
      freshnessCalls.push(["order", ...args]);
      return this;
    },
    limit(...args: unknown[]) {
      freshnessCalls.push(["limit", ...args]);
      return this;
    },
    async maybeSingle() {
      freshnessCalls.push(["maybeSingle"]);
      return freshnessResult;
    },
  };
  return {
    client: {
      async rpc(name: string, args: Record<string, unknown>) {
        rpcCalls.push({ name, args });
        return {
          data: "rpcData" in options ? options.rpcData : [],
          error: options.rpcError ?? null,
        };
      },
      from(table: string) {
        freshnessCalls.push(["from", table]);
        return freshnessBuilder;
      },
    },
    rpcCalls,
    freshnessCalls,
  };
}

test("maps every validated query field to the search RPC and reads dataset freshness", async () => {
  const row = canonicalDbProperty("EA-1");
  const fake = createFakeClient({
    rpcData: [{ property: row, total_count: "27" }],
  });
  const repository = new SupabasePropertySearchRepository(fake.client as never);

  const result = await repository.search(fullQuery());

  assert.deepEqual(fake.rpcCalls, [
    {
      name: "search_properties",
      args: {
        p_department: "sales",
        p_location: "EN6 4EF",
        p_min_price: 500_000,
        p_max_price: 900_000,
        p_min_bedrooms: 3,
        p_min_bathrooms: 2,
        p_property_types: ["house", "bungalow"],
        p_tenures: ["freehold"],
        p_features: ["garden", "parking"],
        p_statuses: ["under_offer"],
        p_sort: "price_asc",
        p_limit: 12,
        p_offset: 12,
      },
    },
  ]);
  assert.deepEqual(result, {
    rows: [row],
    total: 27,
    lastSyncedAt: "2026-08-27T09:00:00.000Z",
  });
  assert.deepEqual(fake.freshnessCalls, [
    ["from", "crm_sync_runs"],
    ["select", "finished_at"],
    ["eq", "source_system", "expert_agent"],
    ["eq", "status", "success"],
    ["order", "finished_at", { ascending: false }],
    ["limit", 1],
    ["maybeSingle"],
  ]);
});

test("passes explicit nulls and zero offset for omitted optional filters", async () => {
  const fake = createFakeClient();
  const repository = new SupabasePropertySearchRepository(fake.client as never);

  await repository.search(createDefaultPropertySearchQuery("lettings"));

  assert.deepEqual(fake.rpcCalls[0].args, {
    p_department: "lettings",
    p_location: null,
    p_min_price: null,
    p_max_price: null,
    p_min_bedrooms: null,
    p_min_bathrooms: null,
    p_property_types: [],
    p_tenures: [],
    p_features: [],
    p_statuses: ["to_let", "let_agreed"],
    p_sort: "default",
    p_limit: 24,
    p_offset: 0,
  });
});

test("rejects an unbounded direct repository offset before calling Supabase", async () => {
  const fake = createFakeClient();
  const repository = new SupabasePropertySearchRepository(fake.client as never);

  await assert.rejects(
    repository.search({
      ...fullQuery(),
      page: Number.MAX_SAFE_INTEGER,
      pageSize: 48,
    }),
    new Error("Property search query is outside supported pagination bounds"),
  );
  assert.equal(fake.rpcCalls.length, 0);
});

test("preserves the total from an out-of-range total-only row while skipping null property", async () => {
  const fake = createFakeClient({
    rpcData: [{ property: null, total_count: 27 }],
  });
  const repository = new SupabasePropertySearchRepository(fake.client as never);

  const result = await repository.search(fullQuery());

  assert.deepEqual(result.rows, []);
  assert.equal(result.total, 27);
});

test("returns truthful zero totals and null freshness when no records or sync run exist", async () => {
  const fake = createFakeClient({
    rpcData: [{ property: null, total_count: 0 }],
    freshnessData: null,
  });
  const repository = new SupabasePropertySearchRepository(fake.client as never);

  const result = await repository.search(fullQuery());

  assert.deepEqual(result, { rows: [], total: 0, lastSyncedAt: null });
});

test("rejects invalid or inconsistent RPC totals instead of publishing misleading counts", async () => {
  for (const rpcData of [
    [{ property: null, total_count: -1 }],
    [{ property: null, total_count: 1.5 }],
    [{ property: null, total_count: "not-a-number" }],
    [{ property: null, total_count: "9007199254740992" }],
    [
      { property: canonicalDbProperty("EA-1"), total_count: 2 },
      { property: canonicalDbProperty("EA-2"), total_count: 3 },
    ],
    [{ property: canonicalDbProperty("EA-1"), total_count: 12 }],
  ]) {
    const fake = createFakeClient({ rpcData });
    const repository = new SupabasePropertySearchRepository(fake.client as never);
    await assert.rejects(
      repository.search(fullQuery()),
      new Error("Property search returned an invalid result"),
    );
  }
});

test("wraps raw Supabase search and freshness errors without leaking details", async () => {
  const rpcFailure = createFakeClient({
    rpcError: { message: "postgres secret detail", code: "XX000" },
  });
  await assert.rejects(
    new SupabasePropertySearchRepository(rpcFailure.client as never).search(fullQuery()),
    new Error("Property search query failed"),
  );

  const freshnessFailure = createFakeClient({
    rpcData: [{ property: null, total_count: 0 }],
    freshnessError: { message: "service role policy detail", code: "42501" },
  });
  await assert.rejects(
    new SupabasePropertySearchRepository(freshnessFailure.client as never).search(fullQuery()),
    new Error("Property search freshness lookup failed"),
  );
});
