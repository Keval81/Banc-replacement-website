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

test("canonicalizes legacy enum arrays and rejects crafted numeric filters", () => {
  const filters = parseLegacySearchParams(new URLSearchParams(
    "propertyType=flat,hacked,house,flat&tenure=unknown,drop-table,freehold,unknown" +
      "&minBeds=9007199254740991&minBaths=2147483648&minPrice=1e3&maxPrice=1.5",
  ));

  assert.deepEqual(filters, {
    propertyType: ["house", "flat"],
    tenure: ["freehold", "unknown"],
  });
  assert.equal(filtersToLegacySearchParams({
    propertyType: ["hacked"],
    tenure: ["drop-table"],
    minBeds: 9_007_199_254_740_991,
  }).toString(), "");
});

test("round-trips supported legacy boundaries in canonical order", () => {
  const location = `  ${"x".repeat(120)}  `;
  const serialized = filtersToLegacySearchParams({
    location,
    minPrice: Number.MAX_SAFE_INTEGER,
    maxPrice: 0,
    minBeds: 2_147_483_647,
    minBaths: 0,
    propertyType: ["flat", "house", "flat"],
    tenure: ["unknown", "freehold", "unknown"],
    features: { balcony: true, garden: true },
    sortBy: "price_desc",
  });

  assert.equal(serialized.toString(),
    `location=${"x".repeat(120)}&minPrice=9007199254740991&maxPrice=0&minBeds=2147483647&minBaths=0` +
      "&propertyType=house%2Cflat&tenure=freehold%2Cunknown&garden=true&balcony=true&sortBy=price_desc",
  );
  assert.deepEqual(parseLegacySearchParams(serialized), {
    location: "x".repeat(120),
    minPrice: Number.MAX_SAFE_INTEGER,
    maxPrice: 0,
    minBeds: 2_147_483_647,
    minBaths: 0,
    propertyType: ["house", "flat"],
    tenure: ["freehold", "unknown"],
    features: { garden: true, balcony: true },
    sortBy: "price_desc",
  });
});

test("omits oversized locations and invalid serialized numeric state", () => {
  assert.deepEqual(parseLegacySearchParams(new URLSearchParams(
    `location=${"x".repeat(121)}&minPrice=-1&maxPrice=2.5&minBeds=1e3&minBaths=`
  )), {});

  assert.equal(filtersToLegacySearchParams({
    location: ` ${"x".repeat(121)} `,
    minPrice: -1,
    maxPrice: 2.5,
    minBeds: Number.MAX_SAFE_INTEGER,
    minBaths: Number.NaN,
  }).toString(), "");
});
