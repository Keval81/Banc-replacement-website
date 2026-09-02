import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const overviewSource = readFileSync(
  join(
    import.meta.dirname,
    "..",
    "..",
    "components",
    "property-detail",
    "PropertyOverview.tsx",
  ),
  "utf8",
);

test("reads the property before its energy certificate", () => {
  const order = ["at-a-glance", "about-property", "energy-performance", "room-dimensions"]
    .map((id) => overviewSource.indexOf(`id="${id}-heading"`));

  assert.ok(
    order.every((index) => index > 0),
    "every overview section must still be rendered",
  );
  assert.deepEqual(
    [...order].sort((a, b) => a - b),
    order,
    "sections must run: at a glance, about, energy performance, room dimensions",
  );
});

test("keeps the EPC certificate to a supporting size", () => {
  const viewerSource = readFileSync(
    join(
      import.meta.dirname,
      "..",
      "..",
      "components",
      "property-detail",
      "PropertyEpcViewer.tsx",
    ),
    "utf8",
  );

  const inlineHeight = viewerSource.match(/max-h-\[(\d+)px\]/);
  assert.ok(inlineHeight, "the inline certificate must cap its height");
  assert.ok(
    Number(inlineHeight[1]) <= 360,
    `the inline certificate is ${inlineHeight[1]}px tall; it should read as a supporting panel`,
  );
  assert.match(viewerSource, /max-w-(?:sm|md|lg)/);
});
