import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// iOS Safari paints its status-bar and toolbar areas with theme-color. The
// header is dark on every page, so an off-white theme-color shows as a white
// strip above and below a dark hero on an iPhone.
test("Safari's toolbar tint matches the dark site header", () => {
  const layout = readFileSync(join(import.meta.dirname, "..", "..", "app", "layout.tsx"), "utf8");
  const match = layout.match(/themeColor:\s*"(#[0-9A-Fa-f]{6})"/);
  assert.ok(match, "layout declares a themeColor");
  assert.equal(match[1].toUpperCase(), "#1A1917");
});
