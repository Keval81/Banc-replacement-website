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
  const selectedPatch = canonicalFiltersToLegacyPatch({ features: ["balcony", "new_home"] });
  assert.equal(selectedPatch.features?.balcony, true);
  assert.equal(selectedPatch.features?.newBuild, true);
  assert.equal(selectedPatch.features?.garden, false);
});

test("legacy feature patches clear deselected values in merge-based parents", () => {
  const mergeParent = (
    current: Record<string, boolean>,
    patch: ReturnType<typeof canonicalFiltersToLegacyPatch>,
  ) => ({ ...current, ...patch.features });

  const initial = { garden: true, parking: true };
  const afterOneRemoval = mergeParent(
    initial,
    canonicalFiltersToLegacyPatch({ features: ["garden"] }),
  );
  assert.equal(afterOneRemoval.garden, true);
  assert.equal(afterOneRemoval.parking, false);

  const afterFinalRemoval = mergeParent(
    afterOneRemoval,
    canonicalFiltersToLegacyPatch({ features: [] }),
  );
  assert.equal(afterFinalRemoval.garden, false);
  assert.equal(afterFinalRemoval.parking, false);
  assert.equal(canonicalFiltersToLegacyPatch({ features: undefined }).features, undefined);
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
  assert.match(source, /const onSearchRef = React\.useRef\(onSearch\)/);
  assert.match(source, /onSearchRef\.current = onSearch/);
  assert.ok(commit.indexOf("flushSync") < commit.indexOf("onSearchRef.current()"));
  assert.match(source, /disabled=\{isLoading\}/);
  assert.match(source, /resultCount !== undefined/);
});

test("mobile controls cannot submit accidentally and preserve modal keyboard behavior", () => {
  const componentDirectory = join(import.meta.dirname, "..", "..", "components", "property");
  const drawer = readFileSync(join(componentDirectory, "MobileFilterDrawer.tsx"), "utf8");
  const advanced = readFileSync(join(componentDirectory, "AdvancedSearchView.tsx"), "utf8");

  assert.match(drawer, /export function MobileFilterButton[\s\S]*?<button[\s\S]*?type="button"/);
  assert.match(drawer, /drawerRef/);
  assert.match(drawer, /previouslyFocused/);
  assert.match(drawer, /onCloseRef\.current\(\)/);
  assert.match(drawer, /}, \[isOpen\]\);/);
  assert.match(drawer, /event\.key !== "Tab"/);
  assert.match(drawer, /<motion\.div[\s\S]*?ref=\{drawerRef\}[\s\S]*?role="dialog"/);
  assert.match(drawer, /\.focus\(\)/);
  assert.match(drawer, /previouslyFocused\.current\?\.focus\(\)/);
  assert.match(advanced, /onSearch\?\.\(\)[\s\S]*?onClose\?\.\(\)/);
});

test("the compatibility graph uses canonical filters without callback-shape guessing", () => {
  const root = join(import.meta.dirname, "..", "..");
  const componentDirectory = join(root, "components", "property");
  const compat = readFileSync(join(componentDirectory, "PropertySearchBarCompat.tsx"), "utf8");
  const barrel = readFileSync(join(componentDirectory, "index.ts"), "utf8");
  const landingSources = [
    "app/sections/PropertySearch.tsx",
    "app/sections/LettingsPropertySearch.tsx",
    "app/sales/SalesPageClient.tsx",
  ].map((file) => readFileSync(join(root, file), "utf8")).join("\n");

  assert.match(compat, /isCanonicalPropertySearchBarProps/);
  assert.match(compat, /Array\.isArray\(props\.filters\.propertyTypes\)/);
  assert.doesNotMatch(compat, /"onSearch" in props/);
  assert.match(compat, /onSearch=\{props\.onSearch \?\? \(\(\) => undefined\)\}/);
  assert.equal((landingSources.match(/onSearch=\{handleSearch\}/g) ?? []).length, 4);
  assert.match(barrel, /AdvancedSearchView/);
  assert.match(barrel, /ActiveFiltersView/);
  assert.match(barrel, /QuickFiltersView/);
  assert.match(barrel, /PropertySearchBarCompat/);
});

test("active Task 7 controls use the accessible neutral text color", () => {
  const componentDirectory = join(import.meta.dirname, "..", "..", "components", "property");
  const source = [
    "AdvancedSearchView.tsx",
    "ActiveFiltersView.tsx",
    "QuickFiltersView.tsx",
    "MobileFilterDrawer.tsx",
    "PropertySearchBarView.tsx",
  ].map((file) => readFileSync(join(componentDirectory, file), "utf8")).join("\n");

  assert.doesNotMatch(source, /#8A8880|#9CA3AF/);
  assert.match(source, /#5F5D57/);
});
