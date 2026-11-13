import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  HOME_POPULAR_AREAS,
  buildPopularAreaHref,
  formatListingCount,
} from "../home-search.ts";

const root = join(import.meta.dirname, "..", "..");
const section = readFileSync(join(root, "app", "sections", "PropertySearch.tsx"), "utf8");
const searchBar = readFileSync(
  join(root, "components", "property", "PropertySearchBarView.tsx"),
  "utf8",
);

test("describes how many homes are listed for the chosen department", () => {
  assert.equal(formatListingCount("sales", 82), "82 homes for sale right now");
  assert.equal(formatListingCount("lettings", 14), "14 homes to rent right now");
  assert.equal(formatListingCount("sales", 1), "1 home for sale right now");
});

test("says nothing when there are no homes to count", () => {
  assert.equal(formatListingCount("sales", 0), null);
  assert.equal(formatListingCount("lettings", undefined), null);
});

test("popular area links open the results page for that area and department", () => {
  assert.ok(HOME_POPULAR_AREAS.includes("Cuffley"));
  const sales = buildPopularAreaHref("sales", "Goffs Oak");
  assert.match(sales, /^\/sales\/properties\?/);
  assert.equal(new URL(sales, "https://x.test").searchParams.get("location"), "Goffs Oak");
  assert.match(buildPopularAreaHref("lettings", "Cuffley"), /^\/lettings\/properties\?/);
});

test("the homepage search is a dark band, not a pale card inside a white section", () => {
  assert.match(section, /<section className="[^"]*bg-banc-dark-deep/);
  assert.doesNotMatch(section, /bg-banc-grey-pale p-6/);
  assert.match(section, /tone="dark"/);
});

test("the location placeholder is short enough to fit a phone-width input", () => {
  assert.match(searchBar, /placeholder="Area, town or postcode"/);
  assert.doesNotMatch(searchBar, /Search by area, town or postcode/);
});

test("the search button spans the row on phones", () => {
  assert.match(searchBar, /<Button type="submit"[^>]*className=\{cn\("h-12 w-full[^"]*lg:w-auto/);
});

test("typed text stays dark on the white input inside the dark band", () => {
  // The band sets text-white; without its own colour the input shows white on white.
  assert.match(searchBar, /dark \? "border-white bg-white text-banc-dark-deep"/);
});
