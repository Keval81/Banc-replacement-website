import assert from "node:assert/strict";
import test from "node:test";

import {
  applyPropertySearchMutation,
  createResultFingerprint,
} from "../banc-conversation/state-reducer.ts";
import {
  propertyConversationStateSchema,
  type PropertyConversationState,
} from "../banc-conversation/contracts.ts";
import {
  createDefaultPropertySearchQuery,
} from "../property-search/query.ts";
import type { PropertySearchQuery } from "../property-search/types.ts";

function stateWithQuery(
  overrides: Partial<PropertySearchQuery> = {},
): PropertyConversationState {
  const department = overrides.department ?? "sales";
  return {
    query: {
      ...createDefaultPropertySearchQuery(department),
      ...overrides,
    },
    resultPropertyIds: ["EA-1"],
    focusedPropertyId: "EA-1",
    resultFingerprint: "old-fingerprint",
    topic: "property_detail",
  };
}

test("replaces only location and preserves exact bedrooms and department", () => {
  const current = stateWithQuery({
    department: "sales",
    location: "Potters Bar",
    minBedrooms: 5,
    maxBedrooms: 5,
  });

  const next = applyPropertySearchMutation(
    current,
    { location: { operation: "set", value: "Cuffley" } },
    "Search Cuffley rather than Potters Bar",
  );

  assert.ok(next);
  assert.equal(next.query?.department, "sales");
  assert.equal(next.query?.location, "Cuffley");
  assert.equal(next.query?.minBedrooms, 5);
  assert.equal(next.query?.maxBedrooms, 5);
  assert.equal(next.query?.page, 1);
  assert.deepEqual(next.resultPropertyIds, []);
  assert.equal(next.focusedPropertyId, undefined);
  assert.equal(next.resultFingerprint, undefined);
  assert.equal(next.topic, "property_search");
});

test("explicit bedroom language overrides a conflicting model mutation", () => {
  const next = applyPropertySearchMutation(
    stateWithQuery({ department: "sales" }),
    { bedrooms: { operation: "set", value: { mode: "minimum", value: 2 } } },
    "Actually I need exactly 4 bedrooms",
  );

  assert.ok(next);
  assert.equal(next.query?.minBedrooms, 4);
  assert.equal(next.query?.maxBedrooms, 4);
});

test("omitted fields preserve current values and clear removes only its field", () => {
  const current = stateWithQuery({
    location: "Cuffley",
    minPrice: 500_000,
    maxPrice: 1_500_000,
    minBedrooms: 3,
    propertyTypes: ["house"],
    features: ["garden"],
  });
  const next = applyPropertySearchMutation(
    current,
    { minPrice: { operation: "clear" } },
    "Remove the minimum price",
  );

  assert.ok(next?.query);
  assert.equal(next.query.minPrice, undefined);
  assert.equal(next.query.maxPrice, 1_500_000);
  assert.equal(next.query.location, "Cuffley");
  assert.equal(next.query.minBedrooms, 3);
  assert.deepEqual(next.query.propertyTypes, ["house"]);
  assert.deepEqual(next.query.features, ["garden"]);
});

test("make it cheaper lowers max price without clearing location", () => {
  const next = applyPropertySearchMutation(
    stateWithQuery({ location: "Potters Bar", maxPrice: 2_000_000 }),
    { maxPrice: { operation: "set", value: 1_500_000 } },
    "Make it cheaper",
  );

  assert.equal(next?.query?.maxPrice, 1_500_000);
  assert.equal(next?.query?.location, "Potters Bar");
});

test("with parking sets the canonical parking feature", () => {
  const next = applyPropertySearchMutation(
    stateWithQuery({ location: "Cuffley" }),
    { features: { operation: "set", value: ["parking"] } },
    "With parking",
  );

  assert.deepEqual(next?.query?.features, ["parking"]);
});

test("setting tenure preserves the active location and bedroom refinement", () => {
  const next = applyPropertySearchMutation(
    stateWithQuery({
      location: "Cuffley",
      minBedrooms: 4,
      maxBedrooms: 4,
      tenures: [],
    }),
    { tenures: { operation: "set", value: ["freehold"] } },
    "Freehold only",
  );

  assert.equal(next?.query?.location, "Cuffley");
  assert.equal(next?.query?.minBedrooms, 4);
  assert.equal(next?.query?.maxBedrooms, 4);
  assert.deepEqual(next?.query?.tenures, ["freehold"]);
});

test("at least four bedrooms sets a minimum and clears an exact maximum", () => {
  const next = applyPropertySearchMutation(
    stateWithQuery({ minBedrooms: 2, maxBedrooms: 2 }),
    { bedrooms: { operation: "set", value: { mode: "exact", value: 2 } } },
    "At least four bedrooms",
  );

  assert.equal(next?.query?.minBedrooms, 4);
  assert.equal(next?.query?.maxBedrooms, undefined);
});

test("switching to lettings derives valid statuses and resets price semantics", () => {
  const next = applyPropertySearchMutation(
    stateWithQuery({
      department: "sales",
      location: "Cuffley",
      minPrice: 500_000,
      maxPrice: 1_500_000,
      tenures: ["freehold"],
    }),
    { department: { operation: "set", value: "lettings" } },
    "Actually I want to rent",
  );

  assert.ok(next?.query);
  assert.equal(next.query.department, "lettings");
  assert.deepEqual(next.query.statuses, ["to_let", "let_agreed"]);
  assert.equal(next.query.location, "Cuffley");
  assert.equal(next.query.minPrice, undefined);
  assert.equal(next.query.maxPrice, undefined);
  assert.deepEqual(next.query.tenures, []);
});

test("an empty refinement preserves results while still returning fresh state and arrays", () => {
  const current = stateWithQuery({
    location: "Cuffley",
    page: 3,
    features: ["garden"],
  });
  const next = applyPropertySearchMutation(
    current,
    {},
    "Keep everything else the same",
  );

  assert.ok(next?.query);
  assert.deepEqual(next, current);
  assert.notEqual(next, current);
  assert.notEqual(next.query, current.query);
  assert.notEqual(next.query.features, current.query?.features);
  assert.notEqual(next.resultPropertyIds, current.resultPropertyIds);
});

test("a first mutation without an explicit department returns null", () => {
  const next = applyPropertySearchMutation(
    { resultPropertyIds: [], topic: "property_search" },
    { location: { operation: "set", value: "Cuffley" } },
    "Show me homes in Cuffley",
  );

  assert.equal(next, null);
});

test("a first mutation with an explicit department creates canonical defaults", () => {
  const next = applyPropertySearchMutation(
    { resultPropertyIds: [], topic: "property_search" },
    {
      department: { operation: "set", value: "lettings" },
      location: { operation: "set", value: "Cuffley" },
    },
    "I want to rent in Cuffley",
  );

  assert.ok(next?.query);
  assert.equal(next.query.department, "lettings");
  assert.equal(next.query.location, "Cuffley");
  assert.deepEqual(next.query.statuses, ["to_let", "let_agreed"]);
  assert.equal(next.query.pageSize, 24);
});

test("clear operations use canonical empty and default values", () => {
  const next = applyPropertySearchMutation(
    stateWithQuery({
      minBedrooms: 4,
      maxBedrooms: 4,
      propertyTypes: ["house"],
      tenures: ["freehold"],
      features: ["garden"],
      sort: "price_desc",
    }),
    {
      bedrooms: { operation: "clear" },
      propertyTypes: { operation: "clear" },
      tenures: { operation: "clear" },
      features: { operation: "clear" },
      sort: { operation: "clear" },
    },
    "Clear those filters",
  );

  assert.ok(next?.query);
  assert.equal(next.query.minBedrooms, undefined);
  assert.equal(next.query.maxBedrooms, undefined);
  assert.deepEqual(next.query.propertyTypes, []);
  assert.deepEqual(next.query.tenures, []);
  assert.deepEqual(next.query.features, []);
  assert.equal(next.query.sort, "default");
});

test("material refinements retain page size and return fresh canonical arrays", () => {
  const current = stateWithQuery({
    page: 4,
    pageSize: 48,
    propertyTypes: ["house"],
    features: ["garden"],
  });
  const next = applyPropertySearchMutation(
    current,
    { maxPrice: { operation: "set", value: 900_000 } },
    "Under nine hundred thousand",
  );

  assert.ok(next?.query);
  assert.equal(next.query.page, 1);
  assert.equal(next.query.pageSize, 48);
  assert.notEqual(next.query.propertyTypes, current.query?.propertyTypes);
  assert.notEqual(next.query.features, current.query?.features);
});

test("fingerprints ordered authorized ids and total deterministically", () => {
  const fingerprint = createResultFingerprint(["EA-2", "EA-1"], 14);

  assert.equal(
    createResultFingerprint(["EA-2", "EA-1"], 14),
    fingerprint,
  );
  assert.notEqual(
    createResultFingerprint(["EA-1", "EA-2"], 14),
    createResultFingerprint(["EA-2", "EA-1"], 14),
  );
});

test("bounds fingerprints for the canonical maximum ids without losing result identity", () => {
  const ids = Array.from(
    { length: 48 },
    (_, index) => `${String(index).padStart(2, "0")}${"x".repeat(62)}`,
  );
  const fingerprint = createResultFingerprint(ids, 48);
  const changedOrder = [...ids];
  [changedOrder[0], changedOrder[1]] = [changedOrder[1], changedOrder[0]];

  assert.ok(fingerprint.length <= 240);
  assert.equal(propertyConversationStateSchema.safeParse({
    resultPropertyIds: ids.slice(0, 3),
    resultFingerprint: fingerprint,
    topic: "property_search",
  }).success, true);
  assert.notEqual(createResultFingerprint(changedOrder, 48), fingerprint);
  for (const [index] of ids.entries()) {
    const changedId = [...ids];
    changedId[index] = `${String(index).padStart(2, "0")}${"y".repeat(62)}`;
    assert.notEqual(createResultFingerprint(changedId, 48), fingerprint);
  }
  assert.notEqual(createResultFingerprint(ids, 49), fingerprint);
  assert.notEqual(createResultFingerprint(ids.slice(0, -1), 48), fingerprint);
});
