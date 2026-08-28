import assert from "node:assert/strict";
import test from "node:test";

import {
  contactBancArgumentsSchema,
  getPropertyFactsArgumentsSchema,
  modelDirectiveSchema,
  parsePropertyConversationRequest,
  parsePropertyConversationResponse,
  propertyConversationContextSchema,
  propertyConversationRequestSchema,
  propertyConversationResponseSchema,
  resetPropertySearchArgumentsSchema,
  searchPropertiesArgumentsSchema,
} from "../property-conversation/contracts.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";

test("request schema requires focused property ids to belong to active results", () => {
  assert.equal(propertyConversationRequestSchema.safeParse({
    message: "Tell me about the first one",
    history: [],
    context: {
      resultPropertyIds: ["EA-1"],
      focusedPropertyId: "EA-2",
    },
  }).success, false);

  assert.equal(propertyConversationRequestSchema.safeParse({
    message: "Tell me about the first one",
    history: [],
    context: { resultPropertyIds: ["EA-1", "EA-2"] },
  }).success, true);
});

test("request schema rejects duplicate or oversized active result ids", () => {
  assert.equal(propertyConversationRequestSchema.safeParse({
    message: "Tell me about the first one",
    history: [],
    context: { resultPropertyIds: ["EA-1", "EA-1"] },
  }).success, false);

  assert.equal(propertyConversationRequestSchema.safeParse({
    message: "Tell me about the first one",
    history: [],
    context: { resultPropertyIds: ["EA-1", "EA-2", "EA-3", "EA-4"] },
  }).success, false);
});

test("request schema rejects unknown keys, long histories, and oversized assistant messages", () => {
  assert.equal(propertyConversationRequestSchema.safeParse({
    message: "Tell me about the first one",
    history: [],
    extra: true,
  }).success, false);

  assert.equal(propertyConversationRequestSchema.safeParse({
    message: "Tell me about the first one",
    history: Array.from({ length: 21 }, () => ({
      role: "user" as const,
      content: "hello",
    })),
  }).success, false);

  assert.equal(propertyConversationRequestSchema.safeParse({
    message: "Tell me about the first one",
    history: [{
      role: "assistant" as const,
      content: "x".repeat(2_001),
    }],
  }).success, false);
});

test("context parsing returns fresh arrays and nulls invalid public input", () => {
  const resultPropertyIds = ["EA-1", "EA-2"];
  const parsed = propertyConversationContextSchema.parse({
    query: createDefaultPropertySearchQuery("sales"),
    resultPropertyIds,
    focusedPropertyId: "EA-1",
  });

  assert.notEqual(parsed.resultPropertyIds, resultPropertyIds);
  assert.deepEqual(parsed.resultPropertyIds, resultPropertyIds);

  const request = parsePropertyConversationRequest({
    message: "Tell me about the first one",
    history: [],
    context: { resultPropertyIds: ["EA-1"], focusedPropertyId: "EA-2" },
  });
  assert.equal(request, null);
});

test("response parsing returns null for invalid public payloads", () => {
  assert.equal(parsePropertyConversationResponse({
    response: "Here are some listings: https://example.com",
    action: "search",
    context: { resultPropertyIds: [] },
  }), null);
});

test("search tool arguments support exact and minimum bedrooms with null clears", () => {
  const parsed = searchPropertiesArgumentsSchema.parse({
    location: "Cuffley",
    bedrooms: { mode: "exact", value: 3 },
    minPrice: null,
    maxPrice: undefined,
  });

  assert.deepEqual(parsed.bedrooms, { mode: "exact", value: 3 });
  assert.equal(parsed.minPrice, null);
  assert.equal(parsed.maxPrice, undefined);

  assert.equal(searchPropertiesArgumentsSchema.safeParse({
    bedrooms: { mode: "minimum", value: 3, extra: true },
  }).success, false);
});

test("property fact tool arguments only allow one to three unique result ids", () => {
  assert.deepEqual(
    getPropertyFactsArgumentsSchema.parse({ propertyIds: ["EA-1", "EA-2"] }),
    { propertyIds: ["EA-1", "EA-2"] },
  );

  assert.equal(getPropertyFactsArgumentsSchema.safeParse({
    propertyIds: ["EA-1", "EA-1"],
  }).success, false);

  assert.equal(getPropertyFactsArgumentsSchema.safeParse({
    propertyIds: ["EA-1", "EA-2", "EA-3", "EA-4"],
  }).success, false);
});

test("reset and contact tool arguments stay strict", () => {
  assert.deepEqual(resetPropertySearchArgumentsSchema.parse({}), {});

  assert.equal(resetPropertySearchArgumentsSchema.safeParse({
    extra: true,
  }).success, false);

  assert.deepEqual(contactBancArgumentsSchema.parse({
    reason: "viewing",
  }), { reason: "viewing" });
});

test("model directives and responses cannot contain cards or links", () => {
  assert.equal(modelDirectiveSchema.safeParse({
    response: "Here are three homes to review.",
    action: "search",
    focusedPropertyId: "EA-1",
    cards: [],
  }).success, false);

  assert.equal(modelDirectiveSchema.safeParse({
    response: "See https://example.com for the listing",
    action: "answer",
  }).success, false);

  const response = propertyConversationResponseSchema.parse({
    response: "I found three options that match.",
    action: "search",
    context: { resultPropertyIds: ["EA-1", "EA-2"] },
  });
  assert.deepEqual(response.context.resultPropertyIds, ["EA-1", "EA-2"]);
});
