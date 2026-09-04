import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = join(import.meta.dirname, "..", "..");
const source = readFileSync(join(root, "lib", "api", "landRegistry.ts"), "utf8");

// The Land Registry query was pointed at the wrong endpoint, so it failed on
// every request — and each failure fell through to a generator that invented
// addresses and Math.random() prices. The site published those on /sold-prices
// as HM Land Registry data, which meant the same postcode showed different
// "sold prices" on every page load.
//
// An estate agent publishing invented sold prices is not a cosmetic bug. This
// keeps the module honest: no sold price may be shown unless it came from the
// upstream register.
test("no sold price is ever invented", () => {
  assert.doesNotMatch(
    source,
    /Math\.random\(\)/,
    "sold prices must come from the register, never from a random number",
  );
  assert.doesNotMatch(
    source,
    /getMock(SoldPrices|PriceStats|AreaStatistics)/,
    "the mock generators must not exist in the request path",
  );
});

test("a failed lookup surfaces as a failure, not as data", () => {
  // Every catch in this module used to swallow the error and return
  // fabricated records, so a total outage looked exactly like a good result.
  const catchBlocks = [...source.matchAll(/catch\s*\([^)]*\)\s*\{([\s\S]*?)\n  \}/g)].map(
    (match) => match[1],
  );
  assert.ok(catchBlocks.length > 0, "expected the module to handle upstream failure");
  for (const block of catchBlocks) {
    assert.doesNotMatch(
      block,
      /return \[?\s*\{/,
      "a catch block must not answer with fabricated records",
    );
  }
});

test("the register is queried at an endpoint that answers", () => {
  // https://landregistry.data.gov.uk/data/ppi/sparql returns 400 for every
  // request, which is why the fallback ran every time.
  // Match a quoted URL on one line, not prose. The comment explaining the old
  // endpoint names it, and an unbounded pattern spans from the import's quote
  // straight past the comment to the next one — flagging the explanation.
  assert.doesNotMatch(source, /['"`][^'"`\n]*data\/ppi\/sparql[^'"`\n]*['"`]/);
  assert.match(source, /landregistry\.data\.gov\.uk\/landregistry\/query/);
});
