import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { BANC_ACCESSIBLE_COLORS, getContrastRatio } from "../accessibility-colors.ts";

const root = join(import.meta.dirname, "..", "..");
const cssSource = readFileSync(join(root, "app", "globals.css"), "utf8");
const buttonSource = readFileSync(join(root, "components", "ui", "button.tsx"), "utf8");

// The tokens as the browser actually resolves them, read from globals.css so
// this test cannot drift away from what ships.
const tokens = new Map<string, string>();
for (const [, name, value] of cssSource.matchAll(/--(banc-[\w-]+):\s*(#[\da-fA-F]{6})/g)) {
  tokens.set(name, value.toUpperCase());
}

function token(name: string): string {
  const value = tokens.get(name);
  assert.ok(value, `globals.css must define --${name}`);
  return value;
}

function variantClasses(variant: string): string {
  const match = new RegExp(`\\b${variant}:\\s*\\n?\\s*"([^"]+)"`).exec(buttonSource);
  assert.ok(match, `button.tsx must define the ${variant} variant`);
  return match[1];
}

const LIGHT_GROUNDS = ["banc-grey-pale", "white"] as const;
const groundValue = (name: string) => (name === "white" ? "#FFFFFF" : token(name));

test("the accessible-colour constants match the tokens the site actually renders", () => {
  // A constant that has drifted from globals.css tests a colour nobody sees.
  assert.equal(BANC_ACCESSIBLE_COLORS.focus, token("banc-focus"));
  assert.equal(BANC_ACCESSIBLE_COLORS.sky, token("banc-sky"));
  assert.equal(BANC_ACCESSIBLE_COLORS.muted, token("banc-muted-readable"));
  assert.equal(BANC_ACCESSIBLE_COLORS.pale, token("banc-grey-pale"));
});

test("every filled button keeps its label readable, at rest and on hover", () => {
  for (const variant of ["default", "secondary"]) {
    const classes = variantClasses(variant);

    const fill = /(?:^|\s)bg-(banc-[\w-]+)/.exec(classes);
    assert.ok(fill, `the ${variant} button must be filled with a banc token`);
    assert.ok(
      /(?:^|\s)text-white\b/.test(classes),
      `the ${variant} button is expected to carry white ink`,
    );
    assert.ok(
      getContrastRatio("#FFFFFF", token(fill[1])) >= 4.5,
      `white on ${fill[1]} (${token(fill[1])}) is ${getContrastRatio("#FFFFFF", token(fill[1])).toFixed(2)}:1, below AA`,
    );

    const hover = /hover:bg-(banc-[\w-]+)/.exec(classes);
    if (hover) {
      assert.ok(
        getContrastRatio("#FFFFFF", token(hover[1])) >= 4.5,
        `white on hover fill ${hover[1]} (${token(hover[1])}) is ${getContrastRatio("#FFFFFF", token(hover[1])).toFixed(2)}:1, below AA`,
      );
    }
  }
});

test("text-only buttons stay readable on the light canvas", () => {
  // banc-sky is the DARK-surface accent: on the light canvas it reads at
  // 1.96:1. Anything inking text on the canvas has to use banc-focus.
  for (const variant of ["link", "ghost", "outline"]) {
    const classes = variantClasses(variant);
    for (const [, ink] of classes.matchAll(/(?:^|\s)(?:hover:)?text-(banc-[\w-]+)/g)) {
      for (const ground of LIGHT_GROUNDS) {
        const ratio = getContrastRatio(token(ink), groundValue(ground));
        assert.ok(
          ratio >= 4.5,
          `${variant}: text-${ink} on ${ground} is ${ratio.toFixed(2)}:1, below AA`,
        );
      }
    }
  }
});

test("banc-sky is never used as ink on the light canvas", () => {
  const sky = token("banc-sky");
  for (const ground of LIGHT_GROUNDS) {
    assert.ok(
      getContrastRatio(sky, groundValue(ground)) < 4.5,
      "this test only means anything while banc-sky genuinely fails on light",
    );
  }
  assert.doesNotMatch(
    buttonSource,
    /(?:^|\s)(?:hover:)?text-banc-sky\b/m,
    "button.tsx must not ink text in banc-sky; use banc-focus on the light canvas",
  );
});
