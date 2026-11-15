import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = join(import.meta.dirname, "..", "..");

test("the landing film ends on the terrace and kitchen shots, on desktop and phone", () => {
  const landing = readFileSync(join(root, "lib", "landing-ui.ts"), "utf8");
  assert.match(landing, /src: "\/videos\/hero-properties-life\.mp4"/);
  assert.match(landing, /src: "\/videos\/hero-properties-life-mobile\.mp4"/);
  for (const file of ["hero-properties-life.mp4", "hero-properties-life-mobile.mp4", "hero-properties-life-poster.jpg"]) {
    assert.ok(existsSync(join(root, "public", "videos", file)), file);
  }
  // Phones download this on first load: keep it close to the film it replaces (3.7MB).
  assert.ok(statSync(join(root, "public", "videos", "hero-properties-life-mobile.mp4")).size < 5 * 1024 * 1024);
});

test("Premier Homes opens on its photograph, not a film", () => {
  // SanSan, 15 Nov 2026: the two-second terrace loop read as jittery on a page opener.
  const page = readFileSync(join(root, "app", "premier-homes", "page.tsx"), "utf8");
  assert.doesNotMatch(page, /film=/);
  assert.match(page, /image=\{\{ src: "\/hertfordshire-home-4\.png"/);
});
