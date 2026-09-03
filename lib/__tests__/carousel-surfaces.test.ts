import assert from "node:assert/strict";
import test from "node:test";

import { getContrastRatio } from "../accessibility-colors.ts";
import { CAROUSEL_SURFACES, surfaceFor } from "../carousel-surfaces.ts";

test("every colour-backed card surface carries ink that reaches AA", () => {
  for (const surface of CAROUSEL_SURFACES) {
    const { background, ink, mutedInk } = surface.hex;
    assert.ok(
      getContrastRatio(ink, background) >= 4.5,
      `${surface.background}: ink ${ink} on ${background} is ${getContrastRatio(ink, background).toFixed(2)}:1`,
    );
    assert.ok(
      getContrastRatio(mutedInk, background) >= 4.5,
      `${surface.background}: muted ${mutedInk} on ${background} is ${getContrastRatio(mutedInk, background).toFixed(2)}:1`,
    );
  }
});

test("the palette stays inside DESIGN.md: solid fills, no gradients, no shadows", () => {
  for (const surface of CAROUSEL_SURFACES) {
    assert.doesNotMatch(surface.background, /gradient/);
    assert.doesNotMatch(surface.border, /shadow/);
    assert.match(surface.background, /^bg-banc-/);
  }
});

test("surfaces cycle so a track of any length keeps its rhythm", () => {
  assert.equal(surfaceFor(0), CAROUSEL_SURFACES[0]);
  assert.equal(surfaceFor(CAROUSEL_SURFACES.length), CAROUSEL_SURFACES[0]);
  assert.equal(surfaceFor(CAROUSEL_SURFACES.length + 2), CAROUSEL_SURFACES[2]);
});
