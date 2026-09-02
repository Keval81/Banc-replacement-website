import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// The route's page.tsx is a thin server wrapper exporting metadata; the
// results UI lives in the *PageClient component beside it.
const pages = [
  ["sales", "../../app/sales/properties/SalesPropertiesPageClient.tsx"],
  ["lettings", "../../app/lettings/properties/LettingsPropertiesPageClient.tsx"],
] as const;

for (const [department, relativePath] of pages) {
  test(`${department} results use the canonical paginated search flow`, () => {
    const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");

    assert.match(source, new RegExp(`department: "${department}"`));
    assert.match(source, /usePropertySearchResults\(query, \{/);
    assert.match(source, /onOutOfRangePage: recoverOutOfRangePage/);
    assert.match(source, /result\?\.properties \?\? \[\]/);
    assert.match(source, /result\?\.total/);
    assert.match(source, /onSearch=\{submitSearch\}/);
    assert.match(source, /setPage\(result\.page - 1\)/);
    assert.match(source, /setPage\(result\.page \+ 1\)/);
    assert.match(source, /Page \{result\.page\} of \{result\.totalPages\}/);
    assert.match(source, /Live listings are temporarily unavailable/);
    assert.match(source, /widening the location or removing one filter/i);
    assert.match(source, /<PropertyMap properties=\{properties\}/);
    assert.match(source, /useReducedMotion/);

    assert.doesNotMatch(source, /useLiveProperties/);
    assert.doesNotMatch(source, /filterProperties/);
    assert.doesNotMatch(source, /sortProperties/);
    assert.doesNotMatch(source, /all(?:Lettings)?Properties/);
    assert.doesNotMatch(source, /fetch\("\/api\/properties/);
  });
}

test("map cards keep each canonical result's department in its detail link", () => {
  const source = readFileSync(
    new URL("../../components/PropertyMap.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /"department"/);
  assert.match(source, /buildPropertyHref\(p\.department, p\.id\)/);
  assert.doesNotMatch(source, /href=\{`\/sales\/properties/);
});

test("results maps use only canonical coordinates and label them approximate", () => {
  const source = readFileSync(
    new URL("../../components/PropertyMap.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /getPropertyMapPoints\(properties\)/);
  assert.match(source, /Map locations are approximate/);
  assert.doesNotMatch(source, /TOWN_COORDS|coordsFor|Deterministic small offset/);
});
