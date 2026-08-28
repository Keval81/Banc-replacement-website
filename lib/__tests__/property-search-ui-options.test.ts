import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  FEATURE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  SORT_OPTIONS,
  TENURE_OPTIONS,
  UNSUPPORTED_FILTER_KEYS,
  getPriceOptions,
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
  assert.match(source, /department: PropertyDepartment/);
  assert.match(source, /onSearch: \(\) => void/);
  assert.match(source, /submitPropertyLocation\(\{/);
  assert.match(source, /locationInputRef\.current = event\.target\.value/);
  assert.match(source, /getLocationInput: \(\) => locationInputRef\.current/);
  assert.match(source, /locationInputRef\.current = filters\.location \?\? ""/);
  assert.match(source, /locationInputRef\.current = ""/);
  assert.match(source, /<form onSubmit=/);
  assert.match(source, /<Button type="submit"/);
  assert.match(source, /disabled=\{isLoading\}/);
  assert.match(source, /resultCount !== undefined/);
});

test("mobile controls cannot submit accidentally and preserve modal keyboard behavior", () => {
  const componentDirectory = join(import.meta.dirname, "..", "..", "components", "property");
  const drawer = readFileSync(join(componentDirectory, "MobileFilterDrawer.tsx"), "utf8");
  const advanced = readFileSync(join(componentDirectory, "AdvancedSearchView.tsx"), "utf8");

  assert.match(drawer, /export function MobileFilterButton[\s\S]*?<button[\s\S]*?type="button"/);
  assert.match(drawer, /startModalFocusLifecycle\(\{/);
  assert.match(drawer, /MODAL_FOCUSABLE_SELECTOR/);
  assert.match(drawer, /<motion\.div[\s\S]*?ref=\{drawerRef\}[\s\S]*?role="dialog"/);
  assert.equal((drawer.match(/lg:hidden/g) ?? []).length, 2);
  assert.doesNotMatch(drawer, /md:hidden/);
  assert.match(advanced, /searchThenClose\(onSearch, onClose\)/);
});

test("the active property search graph has no temporary compatibility layer", () => {
  const root = join(import.meta.dirname, "..", "..");
  const componentDirectory = join(root, "components", "property");
  const activeSources = [
    "components/property/index.ts",
    "components/property/PropertySearchBarView.tsx",
    "lib/property-search/ui-options.ts",
    "app/sections/PropertySearch.tsx",
    "app/sections/LettingsPropertySearch.tsx",
    "app/sales/SalesPageClient.tsx",
    "app/sales/properties/page.tsx",
    "app/lettings/properties/page.tsx",
  ].map((file) => readFileSync(join(root, file), "utf8")).join("\n");

  for (const temporaryName of [
    "PropertySearchBarCompat",
    "LegacySearchFilters",
    "legacyFiltersToCanonical",
    "canonicalFiltersToLegacyPatch",
    "legacy-search-query",
    "type SearchFilters",
  ]) {
    assert.equal(
      activeSources.includes(temporaryName),
      false,
      `${temporaryName} should be absent from the active graph`,
    );
  }

  for (const retiredFile of [
    "PropertySearchBarCompat.tsx",
    "PropertySearchBar.tsx",
    "AdvancedSearch.tsx",
    "ActiveFilters.tsx",
    "QuickFilters.tsx",
  ]) {
    assert.equal(existsSync(join(componentDirectory, retiredFile)), false);
  }
  assert.equal(
    existsSync(join(root, "lib", "property-search", "legacy-search-query.ts")),
    false,
  );
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

test("active Task 7 controls reserve cyan for decorative pale fills", () => {
  const componentDirectory = join(import.meta.dirname, "..", "..", "components", "property");
  const sharedComponentDirectory = join(componentDirectory, "..");
  const source = [
    "AdvancedSearchView.tsx",
    "ActiveFiltersView.tsx",
    "QuickFiltersView.tsx",
    "MobileFilterDrawer.tsx",
    "PropertySearchBarView.tsx",
  ].map((file) => readFileSync(join(componentDirectory, file), "utf8")).join("\n");

  assert.doesNotMatch(source, /text-\[#4AC8E8\]|border-\[#4AC8E8\]|ring-\[#4AC8E8\]|bg-\[#4AC8E8\](?!\/)/);
  assert.match(source, /#0B6F89/);
  assert.match(source, /hover:bg-\[#075E75\]/);
  const buttonSnippets = [...source.matchAll(/<Button[\s\S]*?<\/Button>/g)].map((match) => match[0]);
  assert.equal(buttonSnippets.length, 3);
  assert.equal(buttonSnippets.every((button) => button.includes("focus-visible:ring-[#0B6F89]")), true);
  const checkboxSnippet = source.match(/<Checkbox[\s\S]*?\/>/)?.[0] ?? "";
  assert.equal(checkboxSnippet.includes("focus-visible:ring-[#0B6F89]"), true);
  assert.equal(checkboxSnippet.includes("border-[#0B6F89]"), true);

  const sharedCheckbox = readFileSync(join(sharedComponentDirectory, "ui", "checkbox.tsx"), "utf8");
  const sharedButton = readFileSync(join(sharedComponentDirectory, "ui", "button.tsx"), "utf8");
  assert.match(sharedCheckbox, /border-primary/);
  assert.match(sharedButton, /hover:border-banc-sky/);

  const outlineButton = buttonSnippets.find((button) => button.includes('variant="outline"')) ?? "";
  assert.equal(outlineButton.includes("border-[#5F5D57]"), true);
  assert.equal(outlineButton.includes("text-[#1A1917]"), true);
  assert.equal(outlineButton.includes("hover:border-[#0B6F89]"), true);
});
