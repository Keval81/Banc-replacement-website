import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = join(import.meta.dirname, "..", "..");
const heroSource = readFileSync(join(root, "app", "sections", "Hero.tsx"), "utf8");
const cssSource = readFileSync(join(root, "app", "globals.css"), "utf8");

// The hero tagline is brand copy over the film. It must never depend on
// client JavaScript to become readable: framer-motion writes its `initial`
// values into the server-rendered inline style, so a page that does not
// hydrate — reproduced in WebKit — leaves the text at opacity 0 forever.
test("reveals the hero tagline from CSS, not from an inline initial state", () => {
  const at = heroSource.indexOf("banc-tagline-reveal");
  assert.ok(at > 0, "the hero must render the tagline reveal");
  const tagline = heroSource.slice(Math.max(0, at - 1200), at + 500);

  assert.doesNotMatch(
    tagline,
    /motion\.p/,
    "the tagline must not be a motion element: its initial state would be inlined into the SSR markup",
  );
  assert.doesNotMatch(
    tagline,
    /initial=\{\{[^}]*opacity: 0/,
    "no inline opacity:0 initial state on the tagline or its rule",
  );
  assert.match(tagline, /banc-tagline-reveal/);
  assert.match(tagline, /banc-rule-draw/);
});

test("defines the reveal so its resting state is the readable one", () => {
  assert.match(cssSource, /@keyframes banc-tagline-reveal/);
  assert.match(cssSource, /@keyframes banc-rule-draw/);

  // `backwards` holds the from-state only during the delay; with animations
  // unavailable the element simply renders its normal, readable styles.
  const reveal = cssSource.slice(cssSource.indexOf(".banc-tagline-reveal {"));
  assert.match(reveal, /animation-fill-mode:\s*backwards/);

  // Reduced motion drops the animation entirely rather than freezing it.
  const reduced = cssSource.slice(cssSource.indexOf("prefers-reduced-motion"));
  assert.match(reduced, /\.banc-tagline-reveal[\s\S]{0,200}animation:\s*none/);
});
