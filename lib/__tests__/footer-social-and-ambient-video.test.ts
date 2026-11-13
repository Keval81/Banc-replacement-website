import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = join(import.meta.dirname, "..", "..");
const footer = readFileSync(join(root, "components", "Footer.tsx"), "utf8");
const ambientVideo = readFileSync(join(root, "components", "AmbientVideo.tsx"), "utf8");
const globals = readFileSync(join(root, "app", "globals.css"), "utf8");

test("footer social links use the brand marks, not grey round buttons", () => {
  for (const brand of ["facebook", "instagram", "youtube"]) {
    assert.match(footer, new RegExp(`/icons/social/${brand}\\.svg`));
    assert.ok(existsSync(join(root, "public", "icons", "social", `${brand}.svg`)));
  }
  assert.doesNotMatch(footer, /rounded-full bg-white\/10/);
});

test("the Digital Inroads credit logo is at least 36px tall and fully opaque", () => {
  const logo = footer.match(/src="\/digital-inroads-logo\.svg"[\s\S]*?className="([^"]*)"/);
  assert.ok(logo);
  assert.match(logo[1], /\bh-9\b/);
  assert.doesNotMatch(logo[1], /opacity-/);
});

test("an ambient film stays invisible until it is actually playing", () => {
  // iOS Low Power Mode refuses autoplay and paints its own play button over a
  // visible <video>. Hidden until `playing`, the still shows instead.
  assert.match(ambientVideo, /onPlaying=\{\(\) => setStarted\(true\)\}/);
  assert.match(ambientVideo, /started \? "opacity-100" : "opacity-0"/);
});

test("the native start-playback button is suppressed site-wide", () => {
  assert.match(globals, /video::-webkit-media-controls-start-playback-button\s*\{[^}]*display:\s*none\s*!important/);
});
