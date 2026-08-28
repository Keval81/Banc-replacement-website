import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const componentDirectory = join(
  import.meta.dirname,
  "..",
  "..",
  "components",
  "property",
);

test("active filters render exact bedroom chips and clear both bedroom bounds", () => {
  const source = readFileSync(
    join(componentDirectory, "ActiveFiltersView.tsx"),
    "utf8",
  );

  assert.match(
    source,
    /filters\.minBedrooms === filters\.maxBedrooms[\s\S]*?filters\.minBedrooms === 0 \? "Studio" : `\$\{filters\.minBedrooms\} beds`/,
  );
  assert.match(
    source,
    /onFilterChange\(\{ minBedrooms: undefined, maxBedrooms: undefined \}\)/,
  );
});

test("advanced search routes visible bedroom changes through the minimum-only bedroom reconciler", () => {
  const source = readFileSync(
    join(componentDirectory, "AdvancedSearchView.tsx"),
    "utf8",
  );

  assert.match(source, /getMinimumOnlyBedroomPatch/);
  assert.match(
    source,
    /onChange=\{\(minBedrooms\) => onFilterChange\(getMinimumOnlyBedroomPatch\(filters, minBedrooms\)\)\}/,
  );
});
