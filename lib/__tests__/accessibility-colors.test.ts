import assert from "node:assert/strict";
import { test } from "node:test";

import {
  BANC_ACCESSIBLE_COLORS,
  getContrastRatio,
} from "../accessibility-colors.ts";

test("calculates WCAG contrast ratios from sRGB colours", () => {
  assert.equal(getContrastRatio("#000000", "#FFFFFF"), 21);
  assert.equal(getContrastRatio("#4AC8E8", "#4AC8E8"), 1);
});

test("uses AA text colours for the new property card and detail surfaces", () => {
  assert.ok(
    getContrastRatio(BANC_ACCESSIBLE_COLORS.dark, BANC_ACCESSIBLE_COLORS.sky) >= 4.5
  );
  assert.ok(
    getContrastRatio(BANC_ACCESSIBLE_COLORS.muted, BANC_ACCESSIBLE_COLORS.white) >= 4.5
  );
  assert.ok(
    getContrastRatio(BANC_ACCESSIBLE_COLORS.muted, BANC_ACCESSIBLE_COLORS.pale) >= 4.5
  );
});

test("uses a focus colour with at least 3 to 1 contrast on property surfaces", () => {
  for (const background of [
    BANC_ACCESSIBLE_COLORS.white,
    BANC_ACCESSIBLE_COLORS.pale,
    BANC_ACCESSIBLE_COLORS.sky,
  ]) {
    assert.ok(getContrastRatio(BANC_ACCESSIBLE_COLORS.focus, background) >= 3);
  }
});
