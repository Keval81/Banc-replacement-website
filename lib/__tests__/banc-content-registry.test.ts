import assert from "node:assert/strict";
import test from "node:test";

import { areaGuides } from "../area-guides.ts";
import { APPROVED_BANC_DOCUMENTS } from "../banc-content/approved-content.ts";

const STATIC_APPROVED_ROUTES = new Set([
  "/contact",
  "/lettings/landlords-guide",
  "/lettings/tenants-guide",
  "/sales/buyers-guide",
  "/sales/sellers-guide",
]);

test("registers only unique approved local documents", () => {
  const ids = APPROVED_BANC_DOCUMENTS.map((document) => document.id);

  assert.equal(new Set(ids).size, ids.length);
  assert.equal(
    APPROVED_BANC_DOCUMENTS.every(
      (document) =>
        document.href.startsWith("/") && !document.href.startsWith("//"),
    ),
    true,
  );
});

test("covers every registered href with an existing static or area-guide route", () => {
  const areaGuideRoutes = new Set(
    areaGuides.map((guide) => `/area-guides/${guide.slug}`),
  );

  for (const document of APPROVED_BANC_DOCUMENTS) {
    assert.equal(
      STATIC_APPROVED_ROUTES.has(document.href) ||
        areaGuideRoutes.has(document.href),
      true,
      `Unrecognized approved route: ${document.href}`,
    );
  }
});

test("builds area-guide documents from the canonical area guide content", () => {
  const cuffley = APPROVED_BANC_DOCUMENTS.find(
    (document) => document.id === "area-guide:cuffley",
  );

  assert.equal(cuffley?.title, "Cuffley area guide");
  assert.equal(cuffley?.href, "/area-guides/cuffley");
  assert.equal(cuffley?.text, areaGuides[0]?.paragraphs.join("\n\n"));
});
