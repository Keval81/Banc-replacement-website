import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// The checker falls back to placeholder schools when the real lookup fails,
// so it stays hidden until that lookup is fixed.
const root = join(import.meta.dirname, "..", "..");
const read = (...p: string[]) => readFileSync(join(root, ...p), "utf8");

test("the tools page no longer lists the catchment checker", () => {
  assert.doesNotMatch(read("app", "tools", "page.tsx"), /\/tools\/catchment-checker/);
});

test("the footer no longer links to the catchment checker", () => {
  assert.doesNotMatch(read("components", "Footer.tsx"), /\/tools\/catchment-checker/);
});

test("the sitemap no longer includes the catchment checker", () => {
  assert.doesNotMatch(read("lib", "site-routes.ts"), /\/tools\/catchment-checker/);
});

test("the catchment checker's address redirects to the tools page, temporarily", () => {
  const config = read("next.config.ts");
  const rule = config.match(/\{[^{}]*source:\s*"\/tools\/catchment-checker"[^{}]*\}/);
  assert.ok(rule, "a redirect for /tools/catchment-checker exists");
  assert.match(rule[0], /destination:\s*"\/tools"/);
  assert.match(rule[0], /permanent:\s*false/);
});
