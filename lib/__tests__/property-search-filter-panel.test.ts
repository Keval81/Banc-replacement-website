import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const panel = readFileSync(
  new URL("../../components/property/AdvancedSearchView.tsx", import.meta.url),
  "utf8",
);
const searchBar = readFileSync(
  new URL("../../components/property/PropertySearchBarView.tsx", import.meta.url),
  "utf8",
);

test("the desktop filter panel can be closed from inside it", () => {
  // Filters apply live (useSearchFilters debounces at 300ms), so the panel
  // needs an exit, not an apply. Previously onClose was passed only to the
  // mobile drawer, leaving the desktop panel dismissable only by hunting
  // back to the Filters toggle.
  assert.match(
    searchBar,
    /showAdvancedDesktop &&[\s\S]*?onClose=\{\(\) => setShowAdvancedDesktop\(false\)\}/,
  );
  assert.doesNotMatch(panel, /\{isMobile && onClose &&/);
  assert.match(panel, /\{onClose && <button type="button" onClick=\{onClose\}/);
});

test("the panel header stays reachable while the filter list scrolls", () => {
  // The desktop panel is a 600px scroll box; a non-sticky header takes the
  // close button and Clear all out of reach as soon as the visitor scrolls.
  assert.match(panel, /<header className="sticky top-0 z-10/);
  assert.doesNotMatch(panel, /isMobile && "sticky top-0/);
});

test("both the panel and the drawer end in the same apply-and-close footer", () => {
  assert.doesNotMatch(panel, /\{isMobile && <footer/);
  assert.match(panel, /<footer[\s\S]*?searchThenClose\(onSearch, onClose\)/);
});

test("sort is not offered twice on desktop", () => {
  // The results header carries it now; the panel keeps it for the mobile
  // drawer, where no results header is visible.
  assert.match(panel, /isMobile && \([\s\S]*?htmlFor="property-sort"/);
});
