import assert from "node:assert/strict";
import test from "node:test";

import {
  filtersToLegacySearchParams,
  hasActiveLegacyFilters,
  parseLegacySearchParams,
} from "../property-search/legacy-search-query.ts";

test("parses supported legacy filters including balcony", () => {
  const filters = parseLegacySearchParams(new URLSearchParams(
    "location=Cuffley&minBeds=2&balcony=true&garden=true&sortBy=price_asc",
  ));

  assert.deepEqual(filters, {
    location: "Cuffley",
    minBeds: 2,
    features: { garden: true, balcony: true },
    sortBy: "price_asc",
  });
  assert.equal(hasActiveLegacyFilters(filters), true);
});

test("drops unsupported bounds, radius, and invented sorting", () => {
  const filters = parseLegacySearchParams(new URLSearchParams(
    "radius=10&maxBeds=5&maxBaths=3&sortBy=reduced",
  ));

  assert.deepEqual(filters, {});
  assert.equal(hasActiveLegacyFilters(filters), false);
  const serialized = filtersToLegacySearchParams({
    radius: 10,
    maxBeds: 5,
    maxBaths: 3,
    sortBy: "popular",
  });
  assert.equal(serialized.toString(), "");
});

test("whitelists default compatibility and supported price sorts", () => {
  assert.equal(parseLegacySearchParams(new URLSearchParams("sortBy=newest")).sortBy, "newest");
  assert.equal(parseLegacySearchParams(new URLSearchParams("sortBy=default")).sortBy, "default");
  assert.equal(parseLegacySearchParams(new URLSearchParams("sortBy=price_desc")).sortBy, "price_desc");
  assert.equal(parseLegacySearchParams(new URLSearchParams("sortBy=unknown")).sortBy, undefined);
  assert.equal(filtersToLegacySearchParams({ sortBy: "newest" }).get("sortBy"), "newest");
  assert.equal(hasActiveLegacyFilters({ sortBy: "default" }), false);
});
