import assert from "node:assert/strict";
import test from "node:test";

import { readFileSync } from "node:fs";

import { getPropertySearchFilters } from "../property-search/navigation.ts";
import { RADIUS_OPTIONS } from "../property-search/ui-options.ts";
import {
  SEARCH_RADII,
  serializePropertySearchQuery,
  parsePropertySearchParams,
  propertySearchQuerySchema,
} from "../property-search/query.ts";

function parse(search: string) {
  return parsePropertySearchParams(new URLSearchParams(search), "sales");
}

test("offers the meeting's radius set and nothing else", () => {
  assert.deepEqual([...SEARCH_RADII], [0.5, 1, 3, 5]);
});

test("reads a supported radius off the URL and drops anything else", () => {
  const at = (radius: string) => parse(`location=Cuffley&radius=${radius}`).radius;
  assert.equal(at("1"), 1);
  assert.equal(at("0.5"), 0.5);
  assert.equal(at("2"), undefined);
  assert.equal(at("abc"), undefined);
  assert.equal(at("-1"), undefined);
  assert.equal(parse("location=Cuffley").radius, undefined);
});

test("a radius without a location is dropped — there is nothing to centre on", () => {
  assert.equal(parse("radius=3").radius, undefined);
  assert.equal(parse("location=Cuffley&radius=3").radius, 3);
});

test("round-trips the radius through the URL, and omits it by default", () => {
  const query = propertySearchQuerySchema.parse({
    ...parse("location=Cuffley&radius=3"),
  });
  assert.equal(serializePropertySearchQuery(query).get("radius"), "3");

  const areaOnly = propertySearchQuerySchema.parse({ ...parse("location=Cuffley") });
  assert.equal(serializePropertySearchQuery(areaOnly).get("radius"), null);
});

test("offers this-area-only alongside each radius", () => {
  assert.deepEqual(
    RADIUS_OPTIONS.map((option) => option.value),
    ["", 0.5, 1, 3, 5],
  );
  assert.equal(RADIUS_OPTIONS[0].label, "This area only");
  assert.equal(RADIUS_OPTIONS[1].label, "Within ½ mile");
  assert.equal(RADIUS_OPTIONS[4].label, "Within 5 miles");
});

test("the radius control sits with the location and needs one to be usable", () => {
  const panel = readFileSync(
    new URL("../../components/property/AdvancedSearchView.tsx", import.meta.url),
    "utf8",
  );
  assert.match(panel, /RADIUS_OPTIONS\.map/);
  assert.match(panel, /id="search-radius"/);
  // Nothing to centre on without a location, so the control is disabled.
  assert.match(panel, /disabled=\{!filters\.location\}/);
});

test("the radius survives the trip from query to filter state", () => {
  // getPropertySearchFilters hand-copies each field, and radius is optional,
  // so leaving it out type-checks cleanly while the control silently resets
  // to "This area only" on every render.
  const query = propertySearchQuerySchema.parse({
    ...parse("location=Cuffley&radius=1"),
  });
  assert.equal(getPropertySearchFilters(query).radius, 1);
});
