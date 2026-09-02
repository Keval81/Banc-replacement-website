import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { BANC_PHONE_LINES } from "../banc-contact.ts";

test("publishes one callable line per area, with no placeholder numbers", () => {
  assert.ok(BANC_PHONE_LINES.length > 0, "at least one area line must be listed");

  const areas = new Set<string>();
  for (const line of BANC_PHONE_LINES) {
    assert.ok(line.area.trim().length > 0, "every line needs an area name");
    assert.match(
      line.displayPhone,
      /^0\d[\d ]{8,}$/,
      `${line.area} must carry a real UK number, not a placeholder`,
    );
    assert.equal(
      line.callHref,
      `tel:${line.displayPhone.replace(/\s/g, "")}`,
      `${line.area} tel: link must match its displayed number`,
    );
    assert.ok(!areas.has(line.area), `${line.area} is listed twice`);
    areas.add(line.area);
  }
});

test("offers the area lines from the header phone control", () => {
  const headerSource = readFileSync(
    join(import.meta.dirname, "..", "..", "components", "Header.tsx"),
    "utf8",
  );

  assert.match(headerSource, /BANC_PHONE_LINES/);
  // The desktop control is a disclosure, not a bare tel: link, so a visitor
  // picks their area before dialling.
  assert.match(headerSource, /aria-haspopup="menu"/);
  assert.match(headerSource, /role="menuitem"/);
});
