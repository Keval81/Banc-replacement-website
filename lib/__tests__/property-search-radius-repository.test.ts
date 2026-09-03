import assert from "node:assert/strict";
import test from "node:test";

import { SupabasePropertySearchRepository } from "../property-search/supabase-repository.ts";
import { propertySearchQuerySchema } from "../property-search/query.ts";
import type { PropertySearchQuery } from "../property-search/types.ts";

function query(overrides: Partial<PropertySearchQuery> = {}): PropertySearchQuery {
  return propertySearchQuerySchema.parse({
    department: "sales",
    propertyTypes: [],
    tenures: [],
    features: [],
    statuses: ["for_sale"],
    sort: "default",
    page: 1,
    pageSize: 24,
    ...overrides,
  });
}

function stubClient(captured: Record<string, unknown>[]) {
  return {
    rpc(_name: string, args: Record<string, unknown>) {
      captured.push(args);
      return Promise.resolve({ data: [{ property: null, total_count: 0 }], error: null });
    },
    from() {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              order: () => ({
                limit: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
              }),
            }),
          }),
        }),
      };
    },
  } as never;
}

test("sends the geocoded centre when a radius is asked for", async () => {
  const captured: Record<string, unknown>[] = [];
  const repository = new SupabasePropertySearchRepository(stubClient(captured), "expert_agent", {
    geocode: async (location) => {
      assert.equal(location, "Cuffley");
      return { latitude: 51.7079, longitude: -0.1139 };
    },
  });

  await repository.search(query({ location: "Cuffley", radius: 3 }));

  assert.equal(captured[0].p_centre_lat, 51.7079);
  assert.equal(captured[0].p_centre_lng, -0.1139);
  assert.equal(captured[0].p_radius_miles, 3);
});

test("never geocodes when no radius was asked for", async () => {
  const captured: Record<string, unknown>[] = [];
  let geocoded = 0;
  const repository = new SupabasePropertySearchRepository(stubClient(captured), "expert_agent", {
    geocode: async () => { geocoded += 1; return { latitude: 1, longitude: 2 }; },
  });

  await repository.search(query({ location: "Cuffley" }));

  assert.equal(geocoded, 0);
  assert.equal(captured[0].p_centre_lat, null);
  assert.equal(captured[0].p_radius_miles, null);
});

test("falls back to the text match when the location cannot be geocoded", async () => {
  // Losing the centre must widen to text matching, not return an empty page.
  const captured: Record<string, unknown>[] = [];
  const repository = new SupabasePropertySearchRepository(stubClient(captured), "expert_agent", {
    geocode: async () => null,
  });

  await repository.search(query({ location: "Nowhere", radius: 5 }));

  assert.equal(captured[0].p_centre_lat, null);
  assert.equal(captured[0].p_radius_miles, null);
  assert.equal(captured[0].p_location, "Nowhere");
});
