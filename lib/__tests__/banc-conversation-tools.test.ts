import assert from "node:assert/strict";
import test from "node:test";

import { BANC_CONTACT } from "../banc-contact.ts";
import type {
  ConversationIntent,
  PropertyConversationState,
} from "../banc-conversation/contracts.ts";
import type {
  BancKnowledge,
  BancKnowledgeResult,
} from "../banc-conversation/knowledge.ts";
import type { PropertyPortfolio } from "../banc-conversation/portfolio.ts";
import {
  createConversationTools,
  sanitizeOperationResult,
} from "../banc-conversation/tools.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";
import type {
  PropertySearchQuery,
  PropertySearchResult,
} from "../property-search/types.ts";
import type { PropertyFacts } from "../property-facts.ts";
import type { PropertyCardData } from "../property-view.ts";

function card(id: string): PropertyCardData {
  return {
    id,
    title: `Property ${id}`,
    address: "Cuffley, Hertfordshire",
    price: "£750,000",
    priceNum: 750_000,
    tags: ["Chain Free"],
    stats: { beds: 5, baths: 2, sqft: 1_800 },
    images: ["/images/properties/placeholder-house.svg"],
    summary: `Summary for ${id}.`,
    propertyType: "house",
    department: "sales",
    status: "for_sale",
  };
}

function facts(id: string): PropertyFacts {
  return {
    id,
    title: `Property ${id}`,
    address: "Cuffley, Hertfordshire",
    department: "sales",
    status: "for_sale",
    price: 750_000,
    priceDisplay: "£750,000",
    bedrooms: 5,
    bathrooms: 2,
    receptions: 2,
    propertyType: "house",
    tenure: "freehold",
    epc: "C",
    sqft: 1_800,
    features: ["garden"],
    summary: `Summary for ${id}.`,
  };
}

function searchResult(
  query: PropertySearchQuery,
  properties: PropertyCardData[],
  total = properties.length,
): PropertySearchResult {
  return {
    query,
    properties,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
    lastSyncedAt: "2026-08-31T09:00:00.000Z",
  };
}

class FakePortfolio implements PropertyPortfolio {
  readonly searchCalls: PropertySearchQuery[] = [];
  readonly factCalls: string[][] = [];
  properties: PropertyCardData[] = [];
  total = 0;
  factsById = new Map<string, PropertyFacts>();

  async search(query: PropertySearchQuery): Promise<PropertySearchResult> {
    this.searchCalls.push(query);
    return searchResult(query, this.properties, this.total);
  }

  async getFacts(ids: string[]): Promise<PropertyFacts[]> {
    this.factCalls.push([...ids]);
    return ids.flatMap((id) => {
      const value = this.factsById.get(id);
      return value === undefined ? [] : [value];
    });
  }
}

class FakeKnowledge implements BancKnowledge {
  readonly calls: string[] = [];
  results: BancKnowledgeResult[] = [];

  async search(query: string): Promise<BancKnowledgeResult[]> {
    this.calls.push(query);
    return this.results;
  }
}

function fiveBedroomPottersBarState(): PropertyConversationState {
  return {
    query: {
      ...createDefaultPropertySearchQuery("sales"),
      location: "Potters Bar",
      minBedrooms: 5,
      maxBedrooms: 5,
    },
    resultPropertyIds: ["old-result"],
    focusedPropertyId: "old-result",
    resultFingerprint: "old-fingerprint",
    topic: "property_detail",
  };
}

function stateWithResults(ids: string[]): PropertyConversationState {
  return {
    query: createDefaultPropertySearchQuery("sales"),
    resultPropertyIds: [...ids],
    focusedPropertyId: ids.length === 1 ? ids[0] : undefined,
    topic: "property_search",
  };
}

function setup() {
  const portfolio = new FakePortfolio();
  const knowledge = new FakeKnowledge();
  return {
    portfolio,
    knowledge,
    tools: createConversationTools({ portfolio, knowledge }),
  };
}

test("searches the canonical portfolio after applying a location-only mutation", async () => {
  const { portfolio, tools } = setup();

  await tools.execute({
    intent: {
      type: "update_property_search",
      mutation: { location: { operation: "set", value: "Cuffley" } },
    },
    message: "Search Cuffley rather than Potters Bar",
    state: fiveBedroomPottersBarState(),
  });

  assert.equal(portfolio.searchCalls[0]?.location, "Cuffley");
  assert.equal(portfolio.searchCalls[0]?.minBedrooms, 5);
  assert.equal(portfolio.searchCalls[0]?.maxBedrooms, 5);
});

test("asks whether the customer is buying or renting before a first unscoped search", async () => {
  const { portfolio, tools } = setup();

  const result = await tools.execute({
    intent: {
      type: "update_property_search",
      mutation: { location: { operation: "set", value: "Cuffley" } },
    },
    message: "Show me homes in Cuffley",
    state: { resultPropertyIds: [], topic: "property_search" },
  });

  assert.equal(result.status, "clarification_required");
  if (result.status === "clarification_required") {
    assert.equal(result.question, "Are you looking to buy or rent?");
  }
  assert.equal(portfolio.searchCalls.length, 0);
});

test("fingerprints every ordered result and total before capping public cards and ids", async () => {
  const { portfolio, tools } = setup();
  portfolio.properties = [card("EA-2"), card("EA-1"), card("EA-3"), card("EA-4")];
  portfolio.total = 9;

  const result = await tools.execute({
    intent: {
      type: "update_property_search",
      mutation: { department: { operation: "set", value: "sales" } },
    },
    message: "I want to buy",
    state: { resultPropertyIds: [], topic: "property_search" },
  });

  assert.equal(result.status, "search_results");
  if (result.status === "search_results") {
    assert.deepEqual(result.properties.map(({ id }) => id), ["EA-2", "EA-1", "EA-3"]);
    assert.deepEqual(result.state.resultPropertyIds, ["EA-2", "EA-1", "EA-3"]);
    assert.equal(
      result.state.resultFingerprint,
      '{"ids":["EA-2","EA-1","EA-3","EA-4"],"total":9}',
    );
  }
});

test("suppresses cards when every ordered result id and total repeats", async () => {
  const { portfolio, tools } = setup();
  portfolio.properties = [card("EA-1"), card("EA-2"), card("EA-3"), card("EA-4")];
  portfolio.total = 4;
  const state = stateWithResults(["EA-1", "EA-2", "EA-3"]);
  state.resultFingerprint = '{"ids":["EA-1","EA-2","EA-3","EA-4"],"total":4}';

  const result = await tools.execute({
    intent: { type: "update_property_search", mutation: {} },
    message: "Show those again",
    state,
  });

  assert.equal(result.status, "search_results");
  if (result.status === "search_results") {
    assert.deepEqual(result.properties, []);
    assert.deepEqual(result.state.resultPropertyIds, ["EA-1", "EA-2", "EA-3"]);
  }
});

test("returns no_results rather than a failure for an empty canonical search", async () => {
  const { tools } = setup();

  const result = await tools.execute({
    intent: { type: "update_property_search", mutation: {} },
    message: "Keep looking",
    state: stateWithResults(["EA-1"]),
  });

  assert.equal(result.status, "no_results");
  if (result.status === "no_results") {
    assert.equal(result.total, 0);
    assert.deepEqual(result.state.resultPropertyIds, []);
    assert.equal(result.state.resultFingerprint, '{"ids":[],"total":0}');
  }
});

test("refuses facts for a property outside the active authorized result set", async () => {
  const { portfolio, tools } = setup();

  const result = await tools.execute({
    intent: { type: "get_property_facts", propertyIds: ["not-active"] },
    message: "Tell me about that one",
    state: stateWithResults(["active-1"]),
  });

  assert.equal(result.status, "clarification_required");
  assert.equal(portfolio.factCalls.length, 0);
});

test("re-authorizes active browser ids through the portfolio and rejects missing live facts", async () => {
  const { portfolio, tools } = setup();
  const state = stateWithResults(["EA-1"]);

  const missing = await tools.execute({
    intent: { type: "get_property_facts", propertyIds: ["EA-1"] },
    message: "Tell me about it",
    state,
  });
  assert.equal(missing.status, "clarification_required");
  assert.deepEqual(portfolio.factCalls, [["EA-1"]]);

  portfolio.factsById.set("EA-1", facts("EA-1"));
  const found = await tools.execute({
    intent: { type: "get_property_facts", propertyIds: ["EA-1"] },
    message: "Tell me about it",
    state,
  });
  assert.equal(found.status, "property_facts");
  if (found.status === "property_facts") {
    assert.deepEqual(found.facts.map(({ id }) => id), ["EA-1"]);
    assert.equal(found.state.focusedPropertyId, "EA-1");
    assert.equal(found.state.topic, "property_detail");
  }
});

test("returns fresh whitelisted knowledge excerpts and keeps trusted source links separate", async () => {
  const { knowledge, tools } = setup();
  const registered = {
    documentId: "buyers-guide",
    title: "Buyers Guide",
    href: "/buyers-guide",
    excerpt: "Approved buying guidance.",
    provider: "internal-registry",
  } as BancKnowledgeResult & { provider: string };
  knowledge.results = [registered];

  const result = await tools.execute({
    intent: { type: "search_banc_knowledge", query: "buying process" },
    message: "How does buying work?",
    state: stateWithResults(["EA-1"]),
  });

  assert.equal(result.status, "knowledge");
  if (result.status === "knowledge") {
    assert.deepEqual(result.sources, [{
      documentId: "buyers-guide",
      title: "Buyers Guide",
      href: "/buyers-guide",
      excerpt: "Approved buying guidance.",
    }]);
    assert.notEqual(result.sources, knowledge.results);
    assert.equal(result.state.topic, "banc_knowledge");
    const sanitized = sanitizeOperationResult(result);
    assert.deepEqual(sanitized, {
      status: "knowledge",
      sources: [{
        documentId: "buyers-guide",
        title: "Buyers Guide",
        excerpt: "Approved buying guidance.",
      }],
    });
  }
});

test("reset clears property state and returns a fresh default property-search topic", async () => {
  const { tools } = setup();
  const state = fiveBedroomPottersBarState();

  const result = await tools.execute({
    intent: { type: "reset_conversation_search" },
    message: "Start again",
    state,
  });

  assert.equal(result.status, "reset");
  if (result.status === "reset") {
    assert.deepEqual(result.state, { resultPropertyIds: [], topic: "property_search" });
    assert.notEqual(result.state, state);
    assert.notEqual(result.state.resultPropertyIds, state.resultPropertyIds);
  }
});

test("contact uses fixed Banc destinations and retains only an authorized active property id", async () => {
  const { portfolio, tools } = setup();
  const state = stateWithResults(["EA-1"]);
  portfolio.factsById.set("EA-1", facts("EA-1"));

  const authorized = await tools.execute({
    intent: { type: "contact_banc", reason: "viewing", propertyId: "EA-1" },
    message: "Can I book a viewing?",
    state,
  });
  assert.equal(authorized.status, "contact");
  if (authorized.status === "contact") {
    assert.deepEqual(authorized.handoff, {
      callHref: BANC_CONTACT.callHref,
      whatsappHref: BANC_CONTACT.whatsappHref,
      propertyId: "EA-1",
    });
    assert.deepEqual(sanitizeOperationResult(authorized), {
      status: "contact",
      reason: "viewing",
    });
  }

  portfolio.factsById.clear();
  const noLongerActive = await tools.execute({
    intent: { type: "contact_banc", reason: "availability", propertyId: "EA-1" },
    message: "Is it still available?",
    state,
  });
  assert.equal(noLongerActive.status, "contact");
  if (noLongerActive.status === "contact") {
    assert.deepEqual(noLongerActive.handoff, {
      callHref: BANC_CONTACT.callHref,
      whatsappHref: BANC_CONTACT.whatsappHref,
    });
  }

  const unauthorized = await tools.execute({
    intent: { type: "contact_banc", reason: "offer", propertyId: "not-active" },
    message: "I want to make an offer",
    state,
  });
  assert.equal(unauthorized.status, "contact");
  if (unauthorized.status === "contact") {
    assert.deepEqual(unauthorized.handoff, {
      callHref: BANC_CONTACT.callHref,
      whatsappHref: BANC_CONTACT.whatsappHref,
    });
  }
});

test("sanitizes operation data into fresh model-safe property and fact values", async () => {
  const { portfolio, tools } = setup();
  portfolio.properties = [card("EA-1")];
  portfolio.total = 1;
  const search = await tools.execute({
    intent: {
      type: "update_property_search",
      mutation: { department: { operation: "set", value: "sales" } },
    },
    message: "I want to buy",
    state: { resultPropertyIds: [], topic: "property_search" },
  });
  const sanitizedSearch = sanitizeOperationResult(search);
  assert.equal(sanitizedSearch.status, "search_results");
  if (sanitizedSearch.status === "search_results") {
    assert.deepEqual(sanitizedSearch.properties, [{
      id: "EA-1",
      title: "Property EA-1",
      address: "Cuffley, Hertfordshire",
      price: "£750,000",
      bedrooms: 5,
      bathrooms: 2,
      summary: "Summary for EA-1.",
    }]);
    assert.equal("images" in sanitizedSearch.properties[0], false);
    assert.notEqual(sanitizedSearch.requirements, search.state.query);
  }

  const rawFacts = {
    ...facts("EA-1"),
    sourceRow: { internalId: 42 },
  } as PropertyFacts & { sourceRow: { internalId: number } };
  portfolio.factsById.set("EA-1", rawFacts);
  const factResult = await tools.execute({
    intent: { type: "get_property_facts", propertyIds: ["EA-1"] },
    message: "Tell me about it",
    state: stateWithResults(["EA-1"]),
  });
  const sanitizedFacts = sanitizeOperationResult(factResult);
  assert.equal(sanitizedFacts.status, "property_facts");
  if (sanitizedFacts.status === "property_facts") {
    assert.equal("sourceRow" in sanitizedFacts.facts[0], false);
    assert.notEqual(sanitizedFacts.facts[0], rawFacts);
    assert.notEqual(sanitizedFacts.facts[0].features, rawFacts.features);
  }
});

test("does not execute arbitrary URLs, database queries, calendar actions, or CRM writes", async () => {
  const { portfolio, knowledge, tools } = setup();
  const unapprovedIntents = [
    { type: "open_url", url: "https://attacker.example" },
    { type: "raw_database_query", query: "delete from properties" },
    { type: "book_calendar", start: "tomorrow" },
    { type: "write_crm", lead: { email: "person@example.com" } },
  ];

  for (const intent of unapprovedIntents) {
    const result = await tools.execute({
      intent: intent as unknown as ConversationIntent,
      message: "Do it",
      state: stateWithResults(["EA-1"]),
    });
    assert.equal(result.status, "clarification_required");
  }
  assert.equal(portfolio.searchCalls.length, 0);
  assert.equal(portfolio.factCalls.length, 0);
  assert.equal(knowledge.calls.length, 0);
});
