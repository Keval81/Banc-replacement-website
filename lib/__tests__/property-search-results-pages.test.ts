import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pages = [
  ["sales", "../../app/sales/properties/page.tsx"],
  ["lettings", "../../app/lettings/properties/page.tsx"],
] as const;

for (const [department, relativePath] of pages) {
  test(`${department} results use the canonical paginated search flow`, () => {
    const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");

    assert.match(source, new RegExp(`department: "${department}"`));
    assert.match(source, /usePropertySearchResults\(query\)/);
    assert.match(source, /result\?\.properties \?\? \[\]/);
    assert.match(source, /result\?\.total/);
    assert.match(source, /onSearch=\{submitSearch\}/);
    assert.match(source, /setPage\(query\.page - 1\)/);
    assert.match(source, /setPage\(query\.page \+ 1\)/);
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

  assert.match(source, /department: "sales" \| "lettings"/);
  assert.match(source, /buildPropertyHref\(p\.department, p\.id\)/);
  assert.doesNotMatch(source, /href=\{`\/sales\/properties/);
});
