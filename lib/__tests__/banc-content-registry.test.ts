import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("registers one approved contact document for each visible office", () => {
  const contactDocuments = APPROVED_BANC_DOCUMENTS.filter(
    (document) => document.href === "/contact",
  );

  assert.deepEqual(
    contactDocuments.map((document) => document.id),
    ["contact:cuffley-office", "contact:mayfair-office"],
  );
  assert.match(contactDocuments[1]?.text ?? "", /121 Park Lane, Mayfair, W1K 7AG/);
  assert.match(contactDocuments[1]?.text ?? "", /0203 368 8972/);
  assert.match(contactDocuments[1]?.text ?? "", /info@bancproperty\.com/);
});

test("keeps visible office facts out of the contact page component", () => {
  const pageSource = readFileSync(
    new URL("../../app/contact/ContactPageClient.tsx", import.meta.url),
    "utf8",
  );
  const contentSource = readFileSync(
    new URL("../banc-content/contact.ts", import.meta.url),
    "utf8",
  );

  for (const fact of [
    "1 Station Road, Cuffley",
    "121 Park Lane, Mayfair, W1K 7AG",
    "0203 368 8972",
    "tel:02033688972",
    "info@bancproperty.com",
  ]) {
    assert.equal(pageSource.includes(fact), false, `Duplicated UI fact: ${fact}`);
  }

  assert.equal(contentSource.includes("0203 368 8972"), false);
  assert.equal(contentSource.includes("tel:02033688972"), false);
});
