import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  FEATURE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  SORT_OPTIONS,
  TENURE_OPTIONS,
  UNSUPPORTED_FILTER_KEYS,
  canonicalFiltersToLegacyPatch,
  getPriceOptions,
  legacyFiltersToCanonical,
  toggleCanonicalOption,
} from "../property-search/ui-options.ts";
import {
  SEARCH_FEATURES,
  SEARCH_PROPERTY_TYPES,
  SEARCH_TENURES,
} from "../crm/property-source.ts";

test("uses sales prices for buying and monthly prices for renting", () => {
  assert.ok(getPriceOptions("sales").some((option) => option.value === 500_000));
  assert.ok(getPriceOptions("lettings").some((option) => option.value === 1_500));
  assert.equal(
    getPriceOptions("lettings").some((option) => option.value === 500_000),
    false,
  );
});

test("exposes only the supported sort options", () => {
  assert.deepEqual(
    SORT_OPTIONS.map((option) => option.value),
    ["default", "price_asc", "price_desc"],
  );
  assert.equal(UNSUPPORTED_FILTER_KEYS.includes("radius"), true);
  const sortValues = SORT_OPTIONS.map((option) => String(option.value));
  assert.equal(sortValues.includes("popular"), false);
  assert.equal(sortValues.includes("reduced"), false);
});

test("keeps property, tenure, and feature choices in canonical order", () => {
  assert.deepEqual(
    PROPERTY_TYPE_OPTIONS.map((option) => option.value),
    SEARCH_PROPERTY_TYPES,
  );
  assert.deepEqual(
    TENURE_OPTIONS.map((option) => option.value),
    SEARCH_TENURES,
  );
  assert.deepEqual(
    FEATURE_OPTIONS.map((option) => option.value),
    SEARCH_FEATURES,
  );
});

test("toggles canonical array values without duplicates", () => {
  assert.deepEqual(toggleCanonicalOption(["garden"], "parking", SEARCH_FEATURES), [
    "garden",
    "parking",
  ]);
  assert.deepEqual(
    toggleCanonicalOption(["parking", "garden", "parking"], "parking", SEARCH_FEATURES),
    ["garden"],
  );
});

test("temporarily adapts legacy filters without carrying unsupported fields", () => {
  const canonical = legacyFiltersToCanonical({
    location: "Cuffley",
    radius: 5,
    minBeds: 3,
    maxBeds: 5,
    propertyType: ["flat", "made_up"],
    features: { garden: true, chainFree: true },
    sortBy: "popular",
  });

  assert.deepEqual(canonical, {
    location: "Cuffley",
    minBedrooms: 3,
    propertyTypes: ["flat"],
    tenures: [],
    features: ["garden", "chain_free"],
    sort: "default",
  });
  assert.deepEqual(canonicalFiltersToLegacyPatch({ features: ["balcony", "new_home"] }), {
    features: { balcony: true, newBuild: true },
  });
});

test("scoped property controls do not render unsupported controls", () => {
  const componentDirectory = join(import.meta.dirname, "..", "..", "components", "property");
  const source = [
    "AdvancedSearchView.tsx",
    "ActiveFiltersView.tsx",
    "QuickFiltersView.tsx",
    "MobileFilterDrawer.tsx",
    "PropertySearchBarView.tsx",
  ]
    .map((file) => readFileSync(join(componentDirectory, file), "utf8"))
    .join("\n");

  for (const unsupported of [
    "Search radius",
    "Maximum bedrooms",
    "Maximum bathrooms",
    "Newest Listed",
    "Reduced Price",
    "Most Popular",
  ]) {
    assert.equal(source.includes(unsupported), false, `${unsupported} should be absent`);
  }
});

test("the search bar commits the visible location before explicit search", () => {
  const source = readFileSync(
    join(import.meta.dirname, "..", "..", "components", "property", "PropertySearchBarView.tsx"),
    "utf8",
  );
  const commitStart = source.indexOf("const commitLocationAndSearch");
  const commit = source.slice(commitStart, source.indexOf("return (", commitStart));

  assert.match(source, /department: PropertyDepartment/);
  assert.match(source, /onSearch: \(\) => void/);
  assert.ok(commit.indexOf("flushSync") < commit.indexOf("onSearch()"));
  assert.match(source, /disabled=\{isLoading\}/);
  assert.match(source, /resultCount !== undefined/);
});
