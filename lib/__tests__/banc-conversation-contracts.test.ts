import assert from "node:assert/strict";
import test from "node:test";

import { BANC_CONTACT } from "../banc-contact.ts";
import {
  createInitialConversationState,
  parseConversationPlan,
  parseConversationRequest,
  parseConversationResponse,
  parsePropertySearchMutation,
  propertyConversationStateSchema,
  propertySearchMutationSchema,
} from "../banc-conversation/contracts.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";

function validResponse(overrides: Record<string, unknown> = {}) {
  return {
    response: "I found three homes that match.",
    action: "search_results",
    context: createInitialConversationState(),
    ...overrides,
  };
}

function propertyCard(images: string[]) {
  return {
    id: "EA-1",
    title: "Oak House",
    address: "Cuffley",
    price: "£1,000,000",
    priceNum: 1_000_000,
    tags: [],
    stats: { beds: 4, baths: 2 },
    images,
    summary: "A family home.",
    propertyType: "house",
    department: "sales",
    status: "for_sale",
  };
}

test("creates a fresh initial property-search conversation state", () => {
  const first = createInitialConversationState();
  const second = createInitialConversationState();

  assert.deepEqual(first, {
    resultPropertyIds: [],
    topic: "property_search",
  });
  assert.notEqual(first, second);
  assert.notEqual(first.resultPropertyIds, second.resultPropertyIds);
});

test("parses exclusive field mutations and clones canonical enum arrays", () => {
  const features = ["parking", "garden"];
  const mutation = parsePropertySearchMutation({
    location: { operation: "set", value: "  Cuffley  " },
    bedrooms: { operation: "set", value: { mode: "exact", value: 4 } },
    features: { operation: "set", value: features },
    maxPrice: { operation: "clear" },
  });

  assert.deepEqual(mutation, {
    location: { operation: "set", value: "Cuffley" },
    bedrooms: { operation: "set", value: { mode: "exact", value: 4 } },
    features: { operation: "set", value: ["garden", "parking"] },
    maxPrice: { operation: "clear" },
  });
  assert.notEqual(mutation?.features?.operation === "set"
    ? mutation.features.value
    : undefined, features);
});

test("rejects contradictory field operations, unknown keys, and reset-like mutations", () => {
  for (const value of [
    { location: { operation: "clear", value: "Cuffley" } },
    { location: { operation: "set" } },
    { department: { operation: "clear" } },
    { reset: true },
    { location: { operation: "set", value: "Cuffley", extra: true } },
  ]) {
    assert.equal(parsePropertySearchMutation(value), null);
  }
});

test("rejects unsafe integers, invalid enums, and duplicate enum arrays", () => {
  for (const value of [
    { maxPrice: { operation: "set", value: Number.MAX_SAFE_INTEGER + 1 } },
    { bedrooms: { operation: "set", value: { mode: "exact", value: 2_147_483_648 } } },
    { minBathrooms: { operation: "set", value: 1.5 } },
    { sort: { operation: "set", value: "newest" } },
    { propertyTypes: { operation: "set", value: ["house", "castle"] } },
    { tenures: { operation: "set", value: ["freehold", "freehold"] } },
    { features: { operation: "set", value: ["parking", "parking"] } },
  ]) {
    assert.equal(propertySearchMutationSchema.safeParse(value).success, false);
  }
});

test("parses one primary intent and one distinct allowed supporting operation", () => {
  assert.deepEqual(parseConversationPlan({
    primary: {
      type: "update_property_search",
      mutation: { location: { operation: "set", value: "Cuffley" } },
    },
    supporting: {
      type: "search_banc_knowledge",
      query: "buying guide",
    },
  }), {
    primary: {
      type: "update_property_search",
      mutation: { location: { operation: "set", value: "Cuffley" } },
    },
    supporting: {
      type: "search_banc_knowledge",
      query: "buying guide",
    },
  });

  assert.deepEqual(parseConversationPlan({
    primary: { type: "reset_conversation_search" },
  }), {
    primary: { type: "reset_conversation_search" },
  });
});

test("rejects more than two operations, disallowed support, and duplicate operation types", () => {
  for (const value of [
    {
      primary: { type: "clarify", question: "Are you buying or renting?" },
      supporting: { type: "clarify", question: "Which location?" },
    },
    {
      primary: { type: "get_property_facts", propertyIds: ["EA-1"] },
      supporting: { type: "get_property_facts", propertyIds: ["EA-2"] },
    },
    {
      primary: { type: "search_banc_knowledge", query: "fees" },
      supporting: { type: "search_banc_knowledge", query: "finance" },
    },
    {
      primary: { type: "reset_conversation_search" },
      supporting: {
        type: "update_property_search",
        mutation: { department: { operation: "set", value: "sales" } },
      },
    },
    {
      primary: { type: "contact_banc", reason: "viewing" },
      supporting: { type: "search_banc_knowledge", query: "viewings" },
      third: { type: "get_property_facts", propertyIds: ["EA-1"] },
    },
  ]) {
    assert.equal(parseConversationPlan(value), null);
  }
});

test("requires unique bounded property ids and valid handoff categories in plans", () => {
  assert.equal(parseConversationPlan({
    primary: {
      type: "get_property_facts",
      propertyIds: ["EA-1", "EA-1"],
    },
  }), null);

  assert.equal(parseConversationPlan({
    primary: { type: "contact_banc", reason: "email" },
  }), null);

  assert.deepEqual(parseConversationPlan({
    primary: {
      type: "contact_banc",
      reason: "availability",
      propertyId: "EA-1",
    },
  }), {
    primary: {
      type: "contact_banc",
      reason: "availability",
      propertyId: "EA-1",
    },
  });
});

test("request parsing authorizes focused ids and clones untrusted context arrays", () => {
  const resultPropertyIds = ["EA-1", "EA-2"];
  const request = parseConversationRequest({
    message: "Tell me about the first one",
    history: [{ role: "user", content: "Show me homes in Cuffley" }],
    context: {
      query: createDefaultPropertySearchQuery("sales"),
      resultPropertyIds,
      focusedPropertyId: "EA-1",
      topic: "property_detail",
    },
  });

  assert.ok(request?.context);
  assert.deepEqual(request.context.resultPropertyIds, resultPropertyIds);
  assert.notEqual(request.context.resultPropertyIds, resultPropertyIds);
  assert.notEqual(request.history[0], undefined);
});

test("rejects invalid focused ids, unknown keys, overlong history, and raw links in model prose", () => {
  assert.equal(propertyConversationStateSchema.safeParse({
    resultPropertyIds: ["EA-1"],
    focusedPropertyId: "EA-2",
    topic: "property_detail",
  }).success, false);

  assert.equal(parseConversationRequest({
    message: "Tell me about it",
    history: [],
    unexpected: true,
  }), null);

  assert.equal(parseConversationRequest({
    message: "Tell me about it",
    history: Array.from({ length: 21 }, () => ({ role: "user", content: "Hello" })),
  }), null);

  assert.equal(parseConversationRequest({
    message: "Tell me about it",
    history: [{ role: "assistant", content: "See https://example.com" }],
  }), null);

  assert.equal(parseConversationPlan({
    primary: { type: "clarify", question: "See www.example.com" },
  }), null);
});

test("accepts only trimmed local Banc source paths", () => {
  const parsed = parseConversationResponse(validResponse({
    action: "answer",
    sources: [{ title: "Buyers guide", href: "  /sales/buyers-guide  " }],
  }));
  assert.deepEqual(parsed?.sources, [
    { title: "Buyers guide", href: "/sales/buyers-guide" },
  ]);

  for (const href of [
    "https://bancproperty.com/sales",
    "//bancproperty.com/sales",
    "/sales?department=sales",
    "/sales#results",
    "/sales\\results",
    "sales/results",
  ]) {
    assert.equal(parseConversationResponse(validResponse({
      action: "answer",
      sources: [{ title: "Source", href }],
    })), null);
  }
});

test("accepts only the fixed Banc handoff destinations", () => {
  assert.deepEqual(parseConversationResponse(validResponse({
    action: "contact_team",
    handoff: {
      callHref: BANC_CONTACT.callHref,
      whatsappHref: BANC_CONTACT.whatsappHref,
    },
  }))?.handoff, {
    callHref: BANC_CONTACT.callHref,
    whatsappHref: BANC_CONTACT.whatsappHref,
  });

  assert.equal(parseConversationResponse(validResponse({
    action: "contact_team",
    handoff: {
      callHref: "tel:00000000000",
      whatsappHref: BANC_CONTACT.whatsappHref,
    },
  })), null);
});

test("property card images follow the configured image allowlist", () => {
  const approved = parseConversationResponse(validResponse({
    properties: [propertyCard([
      " http://med05.expertagent.co.uk/a/photo.jpg ",
    ])],
  }));
  assert.deepEqual(approved?.properties?.[0]?.images, [
    "http://med05.expertagent.co.uk/a/photo.jpg",
  ]);

  for (const image of [
    "javascript:alert(1)",
    "data:image/png;base64,AA==",
    "ftp://media.expertagent.co.uk/photo.jpg",
    "https://unapproved.example/photo.jpg",
  ]) {
    assert.equal(parseConversationResponse(validResponse({
      properties: [propertyCard([image])],
    })), null, image);
  }
});

test("response parsing rejects raw links, unknown keys, and more than three cards", () => {
  assert.equal(parseConversationResponse(validResponse({
    response: "See https://example.com for details",
  })), null);

  assert.equal(parseConversationResponse(validResponse({ extra: true })), null);

  const property = propertyCard([
    "https://media.expertagent.co.uk/oak-house.jpg",
  ]);
  assert.equal(parseConversationResponse(validResponse({
    properties: [property, { ...property, id: "EA-2" }, { ...property, id: "EA-3" }, {
      ...property,
      id: "EA-4",
    }],
  })), null);
});
