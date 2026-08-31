import assert from "node:assert/strict";
import test from "node:test";

import { APPROVED_BANC_DOCUMENTS } from "../banc-content/approved-content.ts";
import type { ApprovedBancDocument } from "../banc-content/types.ts";
import { createBancKnowledgeSearch } from "../banc-conversation/knowledge.ts";

test("finds the approved Cuffley area guide with its canonical path", async () => {
  const knowledge = createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS);
  const results = await knowledge.search("What is Cuffley like for families?");

  assert.equal(results[0]?.title, "Cuffley area guide");
  assert.equal(results[0]?.href, "/area-guides/cuffley");
  assert.match(results[0]?.excerpt ?? "", /family|school|countryside/i);
});

test("grounds buying, selling, tenant, landlord, and contact questions", async () => {
  const knowledge = createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS);
  const cases = [
    ["How do I make an offer when buying?", "/sales/buyers-guide"],
    ["How does Banc market a home for sellers?", "/sales/sellers-guide"],
    ["What documents do tenants need to apply?", "/lettings/tenants-guide"],
    ["How does Banc reference tenants for landlords?", "/lettings/landlords-guide"],
    ["When is the Cuffley office open?", "/contact"],
  ] as const;

  for (const [query, href] of cases) {
    const results = await knowledge.search(query);
    assert.equal(results[0]?.href, href, query);
    assert.ok(results[0]?.excerpt.length, query);
  }
});

test("finds the approved Mayfair office contact details", async () => {
  const knowledge = createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS);
  const results = await knowledge.search(
    "What is the phone number for the Mayfair office?",
  );

  assert.equal(results[0]?.documentId, "contact:mayfair-office");
  assert.equal(results[0]?.href, "/contact");
  assert.match(results[0]?.excerpt ?? "", /0203 368 8972/);
});

test("ranks exact titles and aliases above body-only token matches", async () => {
  const documents = [
    {
      id: "body-match",
      title: "General guide",
      sectionTitle: "Moving",
      href: "/general",
      text: "Buying guide help appears in this body.",
      aliases: [],
    },
    {
      id: "alias-match",
      title: "Home purchase",
      sectionTitle: "Overview",
      href: "/buying",
      text: "Start here.",
      aliases: ["buying guide"],
    },
  ] satisfies ApprovedBancDocument[];

  const results = await createBancKnowledgeSearch(documents).search(
    "buying guide",
  );

  assert.equal(results[0]?.documentId, "alias-match");
});

test("does not treat a substring as an exact title or alias phrase", async () => {
  const documents = [
    {
      id: "rent",
      title: "Rent",
      sectionTitle: "Overview",
      href: "/rent",
      text: "Approved rental information.",
      aliases: ["rent"],
    },
  ] satisfies ApprovedBancDocument[];

  const results = await createBancKnowledgeSearch(documents).search(
    "current affairs",
  );

  assert.deepEqual(results, []);
});

test("uses document IDs as a stable ranking tie-break", async () => {
  const documents = [
    {
      id: "second",
      title: "Second",
      sectionTitle: "Overview",
      href: "/second",
      text: "orchard",
      aliases: [],
    },
    {
      id: "first",
      title: "First",
      sectionTitle: "Overview",
      href: "/first",
      text: "orchard",
      aliases: [],
    },
  ] satisfies ApprovedBancDocument[];

  const forward = await createBancKnowledgeSearch(documents).search("orchard");
  const reversed = await createBancKnowledgeSearch(
    documents.toReversed(),
  ).search("orchard");

  assert.deepEqual(
    forward.map((result) => result.documentId),
    ["first", "second"],
  );
  assert.deepEqual(reversed, forward);
});

test("returns at most three results with excerpts capped at 480 characters", async () => {
  const documents = Array.from({ length: 5 }, (_, index) => ({
    id: `document-${index}`,
    title: `Document ${index}`,
    sectionTitle: "Gardens",
    href: `/document-${index}` as const,
    text: `garden ${"x".repeat(700)}`,
    aliases: [],
  })) satisfies ApprovedBancDocument[];

  const results = await createBancKnowledgeSearch(documents).search("garden");

  assert.equal(results.length, 3);
  assert.equal(results.every((result) => result.excerpt.length <= 480), true);
});

test("returns no approved source for unsupported facts", async () => {
  const knowledge = createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS);

  assert.deepEqual(
    await knowledge.search("Does Banc provide cryptocurrency mortgages in Scotland?"),
    [],
  );
  assert.deepEqual(await knowledge.search("the and what is"), []);
});

test("rejects external, protocol-relative, and non-root-relative sources", () => {
  for (const href of [
    "https://example.com/guide",
    "//example.com/guide",
    "contact",
  ]) {
    const documents = [
      {
        id: "unsafe",
        title: "Unsafe",
        sectionTitle: "Unsafe",
        href,
        text: "Unsafe source",
        aliases: [],
      },
    ] as ApprovedBancDocument[];

    assert.throws(
      () => createBancKnowledgeSearch(documents),
      /single-slash local path/i,
    );
  }
});
