// SanSan, 13 Nov 2026: the bot described a home well but gave no way to open
// it or act on it. Every answer about a home now carries its listing link and,
// while it is available, a viewing button.
import assert from "node:assert/strict";
import test from "node:test";

import { createBancConversationHandler } from "../banc-conversation/handler.ts";
import type { PropertyFacts } from "../property-facts.ts";
import { splitChatLinks } from "../property-chat-page.ts";

const fact = (overrides: Partial<PropertyFacts> = {}): PropertyFacts => ({
  id: "BPGC2055",
  title: "Brookside Crescent, Cuffley",
  address: "Brookside Crescent, Cuffley, Hertfordshire",
  department: "sales",
  status: "for_sale",
  price: 895_000,
  priceDisplay: "£895,000",
  bedrooms: 4,
  bathrooms: 2,
  receptions: 3,
  propertyType: "house",
  tenure: "freehold",
  epc: null,
  sqft: null,
  features: ["garden"],
  summary: "A detached family house.",
  ...overrides,
});

function handlerAnswering(facts: PropertyFacts[]) {
  const ids = facts.map((item) => item.id);
  const state = { resultPropertyIds: ids, focusedPropertyId: ids[0], topic: "property_detail" as const };
  return createBancConversationHandler({
    model: {
      selectPlan: async () => ({
        status: "ok",
        providerCalls: 1,
        plan: { primary: { type: "get_property_facts", propertyIds: ids } },
      }),
      writeResponse: async () => ({ status: "ok", providerCalls: 1, response: "It has a garden." }),
    },
    tools: { execute: async () => ({ status: "property_facts", state, facts }) },
    logger: () => undefined,
  });
}

test("an answer about one available home links to its listing and offers a viewing", async () => {
  const response = await handlerAnswering([fact()])({
    message: "Does it have a garden?",
    history: [],
    context: { resultPropertyIds: ["BPGC2055"], focusedPropertyId: "BPGC2055", topic: "property_detail" },
  });

  assert.equal(response.response, "It has a garden.");
  assert.deepEqual(response.sources, [
    { title: "Brookside Crescent, Cuffley", href: "/sales/properties/BPGC2055" },
  ]);
  assert.deepEqual(response.form, { title: "Book a viewing", href: "/book-viewing/BPGC2055?from=bot" });
});

test("a home under offer still links to its listing but offers a message, not a viewing", async () => {
  const response = await handlerAnswering([fact({ status: "under_offer" })])({
    message: "Is it still available?",
    history: [],
    context: { resultPropertyIds: ["BPGC2055"], focusedPropertyId: "BPGC2055", topic: "property_detail" },
  });
  assert.equal(response.sources?.[0]?.href, "/sales/properties/BPGC2055");
  assert.deepEqual(response.form, { title: "Send Banc a message", href: "/contact?from=bot" });
});

test("a comparison links to each home and to a rental's own listing path", async () => {
  const response = await handlerAnswering([
    fact(),
    fact({ id: "BPGC1561", title: "Hill Rise, Cuffley", department: "lettings", status: "to_let" }),
  ])({
    message: "Compare them",
    history: [],
    context: { resultPropertyIds: ["BPGC2055", "BPGC1561"], topic: "property_detail" },
  });
  assert.deepEqual(response.sources?.map((source) => source.href), [
    "/sales/properties/BPGC2055",
    "/lettings/properties/BPGC1561",
  ]);
  assert.equal(response.form, undefined);
});

test("the widget shows listing links apart from guidance sources, and not for the page you are on", () => {
  const links = [
    { title: "Brookside Crescent, Cuffley", href: "/sales/properties/BPGC2055" },
    { title: "Hill Rise, Cuffley", href: "/lettings/properties/BPGC1561" },
    { title: "Buyers Guide", href: "/buyers-guide" },
  ];
  assert.deepEqual(splitChatLinks(links, "/"), {
    listings: links.slice(0, 2),
    sources: links.slice(2),
  });
  assert.deepEqual(splitChatLinks(links, "/sales/properties/BPGC2055").listings, [links[1]]);
});
