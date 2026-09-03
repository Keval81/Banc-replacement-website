import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const header = readFileSync(
  new URL("../../components/Header.tsx", import.meta.url),
  "utf8",
);
const toolsHub = readFileSync(
  new URL("../../app/tools/page.tsx", import.meta.url),
  "utf8",
);
const nextConfig = readFileSync(
  new URL("../../next.config.ts", import.meta.url),
  "utf8",
);
const siteRoutes = readFileSync(
  new URL("../property-search/../site-routes.ts", import.meta.url),
  "utf8",
);

test("the calculators are reachable from the menus they belong to", () => {
  // Nitesh asked for stamp duty under Sales and rental yield under Lettings;
  // both existed but were only ever linked from the footer.
  const sales = header.slice(header.indexOf("Sales: ["), header.indexOf("Lettings: ["));
  const lettings = header.slice(header.indexOf("Lettings: ["), header.indexOf("About: ["));
  assert.match(sales, /href: "\/tools\/stamp-duty"/);
  assert.match(lettings, /href: "\/tools\/yield-calculator"/);
});

test("the duplicate valuation tool is gone, not merely unlinked", () => {
  // /tools/valuation is a second valuation form with 13 elements below AA
  // (worst 1.23:1, near-black on near-black). /valuation is the real one.
  assert.doesNotMatch(toolsHub, /href: "\/tools\/valuation"/);
  assert.doesNotMatch(siteRoutes, /\/tools\/valuation/);
  assert.match(nextConfig, /source: "\/tools\/valuation"[\s\S]{0,80}destination: "\/valuation"/);
});
