import assert from "node:assert/strict";
import test from "node:test";

import {
  applyPropertySearchFilterPatch,
  getPropertySearchFilters,
} from "../property-search/navigation.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";

test("applies canonical filter patches and resets pagination", () => {
  const query = {
    ...createDefaultPropertySearchQuery("sales"),
    location: "Cuffley",
    propertyTypes: ["house" as const],
    page: 4,
  };

  const updated = applyPropertySearchFilterPatch(query, {
    location: undefined,
    propertyTypes: ["flat"],
    features: ["garden"],
    sort: "price_asc",
  });

  assert.equal(updated.location, undefined);
  assert.deepEqual(updated.propertyTypes, ["flat"]);
  assert.deepEqual(updated.features, ["garden"]);
  assert.equal(updated.sort, "price_asc");
  assert.equal(updated.page, 1);
  assert.equal(updated.pageSize, 24);
});

test("changing the visible minimum bedroom clears a stale exact maximum", () => {
  const updated = applyPropertySearchFilterPatch(
    {
      ...createDefaultPropertySearchQuery("sales"),
      minBedrooms: 3,
      maxBedrooms: 3,
      page: 2,
    },
    { minBedrooms: 4 },
  );

  assert.equal(updated.minBedrooms, 4);
  assert.equal(updated.maxBedrooms, undefined);
  assert.equal(updated.page, 1);
});

test("clearing the visible minimum bedroom removes both bedroom bounds", () => {
  const updated = applyPropertySearchFilterPatch(
    {
      ...createDefaultPropertySearchQuery("sales"),
      minBedrooms: 3,
      maxBedrooms: 3,
      page: 2,
    },
    { minBedrooms: undefined },
  );

  assert.equal(updated.minBedrooms, undefined);
  assert.equal(updated.maxBedrooms, undefined);
  assert.equal(updated.page, 1);
});

test("exposes only canonical editable filters from the full query", () => {
  const query = {
    ...createDefaultPropertySearchQuery("lettings"),
    minBedrooms: 2,
    page: 3,
    pageSize: 12,
  };

  assert.deepEqual(getPropertySearchFilters(query), {
    location: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minBedrooms: 2,
    maxBedrooms: undefined,
    minBathrooms: undefined,
    radius: undefined,
    propertyTypes: [],
    tenures: [],
    features: [],
    sort: "default",
  });
});

test("exposes exact bedroom state to the public filter model", () => {
  const query = {
    ...createDefaultPropertySearchQuery("sales"),
    minBedrooms: 3,
    maxBedrooms: 3,
  };

  assert.deepEqual(getPropertySearchFilters(query), {
    location: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minBedrooms: 3,
    maxBedrooms: 3,
    minBathrooms: undefined,
    radius: undefined,
    propertyTypes: [],
    tenures: [],
    features: [],
    sort: "default",
  });
});
