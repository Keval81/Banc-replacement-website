import assert from "node:assert/strict";
import test from "node:test";

import {
  createPropertyFactLookup,
  mapPropertyFacts,
  resolveActivePropertyReferences,
} from "../property-conversation/property-facts.ts";
import type { DbProperty } from "../supabase.ts";

function dbProperty(
  overrides: Partial<DbProperty> = {},
): DbProperty {
  return {
    id: "uuid-1",
    expert_agent_id: "EA-1",
    source_system: "expert_agent",
    source_id: "EA-1",
    source_updated_at: "2026-08-27T09:00:00.000Z",
    last_synced_at: "2026-08-28T09:00:00.000Z",
    is_active: true,
    search_property_type: "house",
    search_tenure: "freehold",
    search_features: ["garden", "parking"],
    title: "Three Bedroom House",
    address: "1 High Street, Cuffley",
    postcode: "EN6 4EF",
    price: 725000,
    price_qualifier: "Guide Price",
    status: "for_sale",
    department: "sales",
    property_type: "Detached House",
    bedrooms: 3,
    bathrooms: 2,
    receptions: 1,
    sqft: 1400,
    description: "Verified listing description.\n\nMore internal detail.",
    features: ["Garden", "Parking"],
    images: ["https://images.example.test/one.jpg"],
    epc_rating: "C",
    epc_image_url: "https://images.example.test/epc.png",
    tenure: "Freehold",
    brochure_url: "https://brochures.example.test/one.pdf",
    virtual_tour_url: "https://tours.example.test/one",
    rooms: [{ name: "Lounge", measurement: "12x12", description: "Large" }],
    floorplans: ["https://images.example.test/floorplan.jpg"],
    latitude: 51.7,
    longitude: -0.1,
    created_at: "2026-08-01T09:00:00.000Z",
    updated_at: "2026-08-28T09:00:00.000Z",
    ...overrides,
  };
}

test("maps a canonical property row to sanitized property facts only", () => {
  const facts = mapPropertyFacts(dbProperty());

  assert.deepEqual(facts, {
    id: "EA-1",
    title: "Three Bedroom House",
    address: "1 High Street, Cuffley",
    department: "sales",
    status: "for_sale",
    price: 725000,
    priceDisplay: "£725,000",
    bedrooms: 3,
    bathrooms: 2,
    receptions: 1,
    propertyType: "house",
    tenure: "freehold",
    epc: "C",
    sqft: 1400,
    features: ["garden", "parking"],
    summary: "Verified listing description.",
  });

  for (const internalField of [
    "source_id",
    "source_system",
    "expert_agent_id",
    "images",
    "rooms",
    "floorplans",
    "brochure_url",
    "virtual_tour_url",
    "created_at",
    "updated_at",
    "last_synced_at",
    "postcode",
    "latitude",
    "longitude",
  ]) {
    assert.equal(internalField in facts, false, internalField);
  }
});

test("authorizes only the requested active result ids and preserves requested order", () => {
  assert.deepEqual(
    resolveActivePropertyReferences(["EA-1", "EA-2", "EA-3"], ["EA-3", "EA-1"]),
    ["EA-3", "EA-1"],
  );

  assert.equal(
    resolveActivePropertyReferences(["EA-1", "EA-2"], ["EA-4"]),
    null,
  );

  assert.equal(
    resolveActivePropertyReferences(["EA-1", "EA-2"], ["EA-2", "EA-4"]),
    null,
  );
});

function createFakeLookupClient(rows: DbProperty[]) {
  const calls: Array<[string, ...unknown[]]> = [];

  const builder = {
    select(...args: unknown[]) {
      calls.push(["select", ...args]);
      return this;
    },
    eq(...args: unknown[]) {
      calls.push(["eq", ...args]);
      return this;
    },
    in(...args: unknown[]) {
      calls.push(["in", ...args]);
      return this;
    },
    then(
      resolve: (value: { data: DbProperty[]; error: null }) => unknown,
    ) {
      return Promise.resolve(resolve({ data: rows, error: null }));
    },
  };

  return {
    client: {
      from(table: string) {
        calls.push(["from", table]);
        return builder;
      },
    },
    calls,
  };
}

test("server lookup returns only active marketable rows in requested id order", async () => {
  const active = dbProperty({ id: "uuid-1", expert_agent_id: "EA-1" });
  const alsoActive = dbProperty({
    id: "uuid-2",
    expert_agent_id: "EA-2",
    title: "Another House",
    search_features: ["parking"],
    features: ["Parking"],
  });
  const sold = dbProperty({
    id: "uuid-3",
    expert_agent_id: "EA-3",
    status: "sold",
  });
  const withdrawn = dbProperty({
    id: "uuid-4",
    expert_agent_id: "EA-4",
    status: "withdrawn",
  });
  const letRow = dbProperty({
    id: "uuid-5",
    expert_agent_id: "EA-5",
    department: "lettings",
    status: "let",
  });
  const inactive = dbProperty({
    id: "uuid-6",
    expert_agent_id: "EA-6",
    is_active: false,
  });
  const fake = createFakeLookupClient([
    sold,
    alsoActive,
    inactive,
    withdrawn,
    letRow,
    active,
  ]);
  const lookupFacts = createPropertyFactLookup(fake.client as never);

  const facts = await lookupFacts([
    "EA-2",
    "EA-6",
    "EA-5",
    "EA-4",
    "EA-1",
    "EA-404",
    "EA-3",
  ]);

  assert.deepEqual(
    facts.map((fact) => fact.id),
    ["EA-2", "EA-1"],
  );
  assert.deepEqual(fake.calls, [
    ["from", "properties"],
    ["select", "*"],
    ["eq", "is_active", true],
    ["in", "status", ["for_sale", "under_offer", "to_let", "let_agreed"]],
    ["in", "expert_agent_id", [
      "EA-2",
      "EA-6",
      "EA-5",
      "EA-4",
      "EA-1",
      "EA-404",
      "EA-3",
    ]],
  ]);
});
