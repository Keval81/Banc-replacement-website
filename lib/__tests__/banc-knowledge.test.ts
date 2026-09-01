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

test("uses approved page copy without exposing search metadata in the excerpt", async () => {
  const documents = [
    {
      id: "buyers:offer",
      title: "Buyers Guide",
      sectionTitle: "Make An Offer",
      href: "/sales/buyers-guide",
      text:
        "It can be hard when deciding how much to offer, but always make sure the offer is viable.",
      aliases: ["make an offer", "buying offer", "qualified buyer"],
    },
  ] satisfies ApprovedBancDocument[];

  const results = await createBancKnowledgeSearch(documents).search(
    "make an offer",
  );

  assert.equal(
    results[0]?.excerpt,
    "It can be hard when deciding how much to offer, but always make sure the offer is viable.",
  );
  assert.doesNotMatch(
    results[0]?.excerpt ?? "",
    /Buyers Guide|Make An Offer|\/sales\/buyers-guide|buying offer|qualified buyer/,
  );
});

test("keeps late matching passage evidence visible in the returned excerpt", async () => {
  const documents = [
    {
      id: "late-match",
      title: "General guide",
      sectionTitle: "Overview",
      href: "/general",
      text: `${"x".repeat(600)} parking is available nearby`,
      aliases: [],
    },
  ] satisfies ApprovedBancDocument[];

  const results = await createBancKnowledgeSearch(documents).search("parking");

  assert.match(results[0]?.excerpt ?? "", /parking/i);
  assert.ok((results[0]?.excerpt.length ?? 0) <= 480);
});

test("centres mixed metadata and body matches on the body evidence", async () => {
  const documents = [
    {
      id: "cuffley-parking",
      title: "Cuffley guide",
      sectionTitle: "Overview",
      href: "/area-guides/cuffley",
      text: `${"x".repeat(600)} parking is available nearby`,
      aliases: [],
    },
  ] satisfies ApprovedBancDocument[];

  const results = await createBancKnowledgeSearch(documents).search(
    "Cuffley parking",
  );

  assert.match(results[0]?.excerpt ?? "", /parking is available nearby/i);
  assert.doesNotMatch(
    results[0]?.excerpt ?? "",
    /Cuffley guide|\/area-guides\/cuffley/,
  );
});

test("rejects body evidence that cannot fit in one bounded excerpt", async () => {
  const documents = [
    {
      id: "separated-evidence",
      title: "General guide",
      sectionTitle: "Overview",
      href: "/general",
      text: `garden ${"x".repeat(600)} parking`,
      aliases: [],
    },
  ] satisfies ApprovedBancDocument[];

  const results = await createBancKnowledgeSearch(documents).search(
    "garden parking",
  );

  assert.deepEqual(results, []);
});

test("continues to a later passage when earlier evidence cannot fit", async () => {
  const documents = [
    {
      id: "later-concise-evidence",
      title: "General guide",
      sectionTitle: "Overview",
      href: "/general",
      text: `garden ${"x".repeat(600)} parking\n\nNearby garden parking is available.`,
      aliases: [],
    },
  ] satisfies ApprovedBancDocument[];

  const results = await createBancKnowledgeSearch(documents).search(
    "garden parking",
  );

  assert.match(
    results[0]?.excerpt ?? "",
    /Nearby garden parking is available\./,
  );
});

test("keeps exact curated alias matches when body terms cannot share one excerpt", async () => {
  const documents = [
    {
      id: "curated-alias",
      title: "General guide",
      sectionTitle: "Overview",
      href: "/general",
      text: `Approved outdoor-space guidance. garden ${"x".repeat(600)} parking`,
      aliases: ["garden parking"],
    },
  ] satisfies ApprovedBancDocument[];

  const results = await createBancKnowledgeSearch(documents).search(
    "garden parking",
  );

  assert.equal(results.length, 1);
  assert.match(results[0]?.excerpt ?? "", /Approved outdoor-space guidance\./);
  assert.doesNotMatch(results[0]?.excerpt ?? "", /garden parking|\/general/);
});

test("returns no approved source for unsupported facts", async () => {
  const knowledge = createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS);
  const unsupportedQueries = [
    "What colour is the Cuffley office kitchen?",
    "Kitchen at Cuffley office",
    "Cuffley office kitchen",
    "Wallpaper in Cuffley office",
    "Kitchen at Mayfair office",
    "news",
    "Cuffley office news",
    "News about Cuffley office",
    "new Cuffley office",
    "Does Cuffley office have parking?",
    "Is parking available at Cuffley office?",
  ] as const;

  for (const query of unsupportedQueries) {
    assert.deepEqual(await knowledge.search(query), [], query);
  }
  assert.deepEqual(
    await knowledge.search("Does Banc provide cryptocurrency mortgages in Scotland?"),
    [],
  );
  assert.deepEqual(await knowledge.search("the and what is"), []);
});

test("grounds natural guide and fee wording without suffix-derived matches", async () => {
  const knowledge = createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS);
  const cases = [
    ["buying process", "/sales/buyers-guide"],
    ["home buying process", "/sales/buyers-guide"],
    ["selling process", "/sales/sellers-guide"],
    ["renting process", "/lettings/tenants-guide"],
    ["lettings fees", "/lettings/tenants-guide"],
    ["letting fees", "/lettings/tenants-guide"],
  ] as const;

  for (const [query, href] of cases) {
    const results = await knowledge.search(query);
    assert.equal(results[0]?.href, href, query);
    assert.equal(
      results.every((result) => result.href === href),
      true,
      `${query} returned a weak trailing source`,
    );
  }

  assert.ok((await knowledge.search("viewing process")).length > 0);
});

test("ignores conversational framing without discarding factual qualifiers", async () => {
  const knowledge = createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS);
  const cases = [
    ["Where is the Cuffley office?", "/contact"],
    ["Where can I find the Cuffley office?", "/contact"],
    ["Can you explain the buying process?", "/sales/buyers-guide"],
    ["I want help buying a home", "/sales/buyers-guide"],
    ["What services are available for landlords?", "/lettings/landlords-guide"],
    ["Which documents are needed to rent?", "/lettings/tenants-guide"],
    ["How do valuations work?", "/sales/sellers-guide"],
    ["Is there a Cuffley office?", "/contact"],
  ] as const;

  for (const [query, href] of cases) {
    const results = await knowledge.search(query);
    assert.equal(results[0]?.href, href, query);
  }
});

test("treats ordinary singular and plural knowledge terms equivalently", async () => {
  const knowledge = createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS);
  const pairs = [
    ["mortgage fees", "mortgages fees"],
    ["tenancy", "tenancies"],
    ["deposit", "deposits"],
    ["office", "offices"],
    ["I want help buying a home", "I want help buying homes"],
    ["purchase process", "purchases process"],
    ["rental fees", "rentals fees"],
    ["opening hours", "openings hours"],
  ] as const;

  for (const [singularQuery, pluralQuery] of pairs) {
    const singularResults = await knowledge.search(singularQuery);
    const pluralResults = await knowledge.search(pluralQuery);
    assert.ok(singularResults.length > 0, singularQuery);
    assert.equal(pluralResults[0]?.href, singularResults[0]?.href, pluralQuery);
  }
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
