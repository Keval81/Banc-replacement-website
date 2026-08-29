import assert from "node:assert/strict";
import test from "node:test";

import {
  CONTACT_BANC_COPY,
  PROPERTY_ASSISTANT_UNAVAILABLE,
  createPropertyConversationHandler,
  type PropertyConversationModelRunner,
} from "../property-conversation/handler.ts";
import type {
  PropertyConversationContext,
  PropertyConversationRequest,
  PropertyFacts,
} from "../property-conversation/contracts.ts";
import type { OpenAIPropertyConversationRunInput } from "../property-conversation/openai.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";
import type {
  PropertySearch,
  PropertySearchQuery,
  PropertySearchResult,
} from "../property-search/types.ts";
import type { PropertyCardData } from "../property-view.ts";

function card(id: string, overrides: Partial<PropertyCardData> = {}): PropertyCardData {
  return {
    id,
    title: `Canonical ${id}`,
    address: "Cuffley, Hertfordshire",
    price: "£750,000",
    priceNum: 750_000,
    tags: [],
    stats: { beds: 3, baths: 2 },
    images: [`https://images.example.test/${id}.jpg`],
    summary: "A canonical CRM description.",
    propertyType: "house",
    department: "sales",
    status: "for_sale",
    ...overrides,
  };
}

function searchResult(query: PropertySearchQuery, properties: PropertyCardData[]): PropertySearchResult {
  return {
    query,
    properties,
    total: properties.length,
    page: 1,
    pageSize: 3,
    totalPages: properties.length === 0 ? 0 : 1,
    lastSyncedAt: "2026-08-28T12:00:00.000Z",
  };
}

function facts(id: string, overrides: Partial<PropertyFacts> = {}): PropertyFacts {
  return {
    id,
    title: `Canonical ${id}`,
    address: "Cuffley, Hertfordshire",
    department: "sales",
    status: "for_sale",
    price: 750_000,
    priceDisplay: "£750,000",
    bedrooms: 3,
    bathrooms: 2,
    receptions: 1,
    propertyType: "house",
    tenure: "freehold",
    epc: "C",
    sqft: 1_400,
    features: ["garden"],
    summary: "A canonical CRM description.",
    ...overrides,
  };
}

const emptyLookup = async (): Promise<PropertyFacts[]> => [];

function createHandler(options: {
  runModel: PropertyConversationModelRunner;
  search?: PropertySearch;
  lookupFacts?: (ids: readonly string[]) => Promise<PropertyFacts[]>;
  apiKey?: string;
  model?: string;
  onCreateModelRunner?: () => void;
}) {
  return createPropertyConversationHandler({
    apiKey: options.apiKey ?? "test-key",
    model: options.model ?? "test-property-model",
    createModelRunner: () => {
      options.onCreateModelRunner?.();
      return options.runModel;
    },
    search: options.search ?? (async (query) => searchResult(query, [])),
    lookupFacts: options.lookupFacts ?? emptyLookup,
  });
}

function request(message: string, context?: PropertyConversationContext): PropertyConversationRequest {
  return { message, history: [], ...(context === undefined ? {} : { context }) };
}

function resultContext(input: OpenAIPropertyConversationRunInput): PropertyConversationContext {
  return input.request.context ?? { resultPropertyIds: [] };
}

test("plain three-bed intent searches exact bounds and returns only canonical three-bedroom cards", async () => {
  let seenQuery: PropertySearchQuery | undefined;
  const handle = createHandler({
    search: async (query) => {
      seenQuery = query;
      return searchResult(query, [card("EA-1"), card("EA-2")]);
    },
    runModel: async (input) => {
      const toolResult = await input.tools.executeTool(
        "search_properties",
        { department: "sales", location: "Cuffley", bedrooms: { mode: "minimum", value: 3 } },
        { currentMessage: input.request.message, context: resultContext(input) },
      );
      assert.equal(toolResult.ok, true);
      return {
        directive: { response: "I found two matching homes.", action: "search" },
        context: toolResult.ok ? toolResult.context : resultContext(input),
      };
    },
  });

  const response = await handle(request("I want to buy a 3 bed in Cuffley"));

  assert.equal(seenQuery?.minBedrooms, 3);
  assert.equal(seenQuery?.maxBedrooms, 3);
  assert.deepEqual(response.properties?.map((property) => property.stats.beds), [3, 3]);
  assert.deepEqual(response.properties?.map((property) => property.title), ["Canonical EA-1", "Canonical EA-2"]);
});

test("at-least bedroom intent searches with a minimum and no maximum", async () => {
  let seenQuery: PropertySearchQuery | undefined;
  const handle = createHandler({
    search: async (query) => {
      seenQuery = query;
      return searchResult(query, [card("EA-3", { stats: { beds: 4, baths: 2 } })]);
    },
    runModel: async (input) => {
      const toolResult = await input.tools.executeTool(
        "search_properties",
        { department: "sales", bedrooms: { mode: "exact", value: 3 } },
        { currentMessage: input.request.message, context: resultContext(input) },
      );
      assert.equal(toolResult.ok, true);
      return {
        directive: { response: "I found a matching home.", action: "search" },
        context: toolResult.ok ? toolResult.context : resultContext(input),
      };
    },
  });

  const response = await handle(request("I want to buy at least a 3 bed"));

  assert.equal(seenQuery?.minBedrooms, 3);
  assert.equal(seenQuery?.maxBedrooms, undefined);
  assert.equal(response.properties?.[0]?.stats.beds, 4);
});

test("property answers require a successful canonical fact lookup", async () => {
  const originalContext: PropertyConversationContext = {
    resultPropertyIds: ["EA-1"],
    resultFingerprint: "sales:EA-1",
  };
  const handle = createHandler({
    runModel: async (input) => ({
      directive: {
        response: "The home has a south-facing garden and a new roof.",
        action: "answer",
      },
      context: resultContext(input),
    }),
  });

  const response = await handle(request("Does it have a garden?", originalContext));

  assert.deepEqual(response, {
    response: PROPERTY_ASSISTANT_UNAVAILABLE,
    action: "unavailable",
    context: originalContext,
  });
});

test("search and no-results directives require a supporting successful search", async () => {
  for (const action of ["search", "no_results"] as const) {
    const handle = createHandler({
      runModel: async (input) => ({
        directive: { response: "I found some properties.", action },
        context: resultContext(input),
      }),
    });

    const response = await handle(request("Find me a home"));

    assert.deepEqual(response, {
      response: PROPERTY_ASSISTANT_UNAVAILABLE,
      action: "unavailable",
      context: { resultPropertyIds: [] },
    }, action);
  }
});

test("general conversation without active property state remains available without tools", async () => {
  const handle = createHandler({
    runModel: async (input) => ({
      directive: {
        response: "I can help you search Banc's current homes or answer questions about results.",
        action: "answer",
      },
      context: resultContext(input),
    }),
  });

  const response = await handle(request("What can you help with?"));

  assert.equal(response.action, "answer");
  assert.equal(
    response.response,
    "I can help you search Banc's current homes or answer questions about results.",
  );
});

test("an unclear first request returns a natural department clarification without cards", async () => {
  const handle = createHandler({
    runModel: async (input) => ({
      directive: { response: "Would you like to buy or rent your next home?", action: "clarify_department" },
      context: resultContext(input),
    }),
  });

  const response = await handle(request("Find me somewhere in Cuffley"));

  assert.equal(response.action, "clarify_department");
  assert.equal(response.response, "Would you like to buy or rent your next home?");
  assert.equal("properties" in response, false);
});

test("a department clarification remains available without tools when prior context exists", async () => {
  const originalContext: PropertyConversationContext = {
    query: createDefaultPropertySearchQuery("sales"),
    resultPropertyIds: ["EA-1"],
    resultFingerprint: "sales:EA-1",
  };
  const handle = createHandler({
    runModel: async (input) => ({
      directive: {
        response: "Would you like the new search to be for buying or renting?",
        action: "clarify_department",
      },
      context: resultContext(input),
    }),
  });

  const response = await handle(request("Start a new search in Cuffley", originalContext));

  assert.equal(response.action, "clarify_department");
  assert.equal(
    response.response,
    "Would you like the new search to be for buying or renting?",
  );
  assert.deepEqual(response.context, originalContext);
});

test("a first-result detail question re-resolves the canonical id and does not repeat cards", async () => {
  const originalContext: PropertyConversationContext = {
    query: createDefaultPropertySearchQuery("sales"),
    resultPropertyIds: ["EA-1", "EA-2"],
    resultFingerprint: "sales:EA-1|EA-2",
  };
  let lookedUpIds: readonly string[] = [];
  const handle = createHandler({
    lookupFacts: async (ids) => {
      lookedUpIds = ids;
      return [facts("EA-1")];
    },
    runModel: async (input) => {
      const toolResult = await input.tools.executeTool(
        "get_property_facts",
        { propertyIds: ["EA-1"] },
        { currentMessage: input.request.message, context: resultContext(input) },
      );
      assert.equal(toolResult.ok, true);
      return {
        directive: {
          response: "The first home is a three-bedroom house in Cuffley.",
          action: "answer",
          focusedPropertyId: "EA-1",
        },
        context: toolResult.ok ? toolResult.context : resultContext(input),
      };
    },
  });

  const response = await handle(request("Tell me about the first one", originalContext));

  assert.deepEqual(lookedUpIds, ["EA-1"]);
  assert.equal(response.action, "answer");
  assert.deepEqual(response.context, { ...originalContext, focusedPropertyId: "EA-1" });
  assert.equal("properties" in response, false);
});

test("a cheapest comparison receives canonical facts for every current result without cards", async () => {
  const context: PropertyConversationContext = {
    resultPropertyIds: ["EA-1", "EA-2", "EA-3"],
    resultFingerprint: "sales:EA-1|EA-2|EA-3",
  };
  let lookedUpIds: readonly string[] = [];
  const handle = createHandler({
    lookupFacts: async (ids) => {
      lookedUpIds = ids;
      return ids.map((id, index) => facts(id, { price: 700_000 + index * 25_000 }));
    },
    runModel: async (input) => {
      const toolResult = await input.tools.executeTool(
        "get_property_facts",
        { propertyIds: [...context.resultPropertyIds] },
        { currentMessage: input.request.message, context: resultContext(input) },
      );
      assert.equal(toolResult.ok, true);
      return {
        directive: { response: "EA-1 is the cheapest.", action: "answer" },
        context: toolResult.ok ? toolResult.context : resultContext(input),
      };
    },
  });

  const response = await handle(request("Which is cheapest?", context));

  assert.deepEqual(lookedUpIds, context.resultPropertyIds);
  assert.equal(response.response, "EA-1 is the cheapest.");
  assert.equal("properties" in response, false);
});

test("changed searches return new cards while identical fingerprints suppress them", async () => {
  const originalContext: PropertyConversationContext = {
    query: createDefaultPropertySearchQuery("sales"),
    resultPropertyIds: ["EA-1"],
    resultFingerprint: "sales:EA-1",
  };
  const makeHandle = (properties: PropertyCardData[]) => createHandler({
    search: async (query) => searchResult(query, properties),
    runModel: async (input) => {
      const toolResult = await input.tools.executeTool(
        "search_properties",
        { department: "sales", propertyTypes: ["house"] },
        { currentMessage: input.request.message, context: resultContext(input) },
      );
      assert.equal(toolResult.ok, true);
      return {
        directive: { response: "Here are the refined results.", action: "search" },
        context: toolResult.ok ? toolResult.context : resultContext(input),
      };
    },
  });

  const changed = await makeHandle([card("EA-2")])(request("Only houses", originalContext));
  const unchanged = await makeHandle([card("EA-1")])(request("Only houses", originalContext));

  assert.deepEqual(changed.properties?.map((property) => property.id), ["EA-2"]);
  assert.equal("properties" in unchanged, false);
});

test("missing facts remain an answer and never start a property search", async () => {
  let searches = 0;
  const context: PropertyConversationContext = { resultPropertyIds: ["EA-1"] };
  const handle = createHandler({
    search: async (query) => {
      searches += 1;
      return searchResult(query, []);
    },
    lookupFacts: async () => [facts("EA-1", { epc: null })],
    runModel: async (input) => {
      const toolResult = await input.tools.executeTool(
        "get_property_facts",
        { propertyIds: ["EA-1"] },
        { currentMessage: input.request.message, context: resultContext(input) },
      );
      assert.equal(toolResult.ok, true);
      return {
        directive: { response: "The listing does not specify an EPC rating.", action: "answer" },
        context: toolResult.ok ? toolResult.context : resultContext(input),
      };
    },
  });

  const response = await handle(request("What is its EPC rating?", context));

  assert.equal(response.response, "The listing does not specify an EPC rating.");
  assert.equal(searches, 0);
  assert.equal("properties" in response, false);
});

test("reset clears the complete structured property context", async () => {
  const context: PropertyConversationContext = {
    query: createDefaultPropertySearchQuery("sales"),
    resultPropertyIds: ["EA-1"],
    focusedPropertyId: "EA-1",
    resultFingerprint: "sales:EA-1",
  };
  const handle = createHandler({
    runModel: async (input) => {
      const toolResult = await input.tools.executeTool(
        "reset_property_search",
        {},
        { currentMessage: input.request.message, context: resultContext(input) },
      );
      assert.equal(toolResult.ok, true);
      return {
        directive: { response: "I've cleared the property search.", action: "answer" },
        context: toolResult.ok ? toolResult.context : resultContext(input),
      };
    },
  });

  const response = await handle(request("Start again", context));

  assert.deepEqual(response.context, { resultPropertyIds: [] });
});

test("a later reset removes cards from an earlier successful search in the same turn", async () => {
  const handle = createHandler({
    search: async (query) => searchResult(query, [card("EA-1")]),
    runModel: async (input) => {
      const search = await input.tools.executeTool(
        "search_properties",
        { department: "sales", location: "Cuffley" },
        { currentMessage: input.request.message, context: resultContext(input) },
      );
      assert.equal(search.ok, true);
      const reset = await input.tools.executeTool(
        "reset_property_search",
        {},
        {
          currentMessage: input.request.message,
          context: search.ok ? search.context : resultContext(input),
        },
      );
      assert.equal(reset.ok, true);
      return {
        directive: { response: "I've cleared the property search.", action: "answer" },
        context: reset.ok ? reset.context : resultContext(input),
      };
    },
  });

  const response = await handle(request("Find in Cuffley, then start again"));

  assert.equal(response.action, "answer");
  assert.deepEqual(response.context, { resultPropertyIds: [] });
  assert.equal("properties" in response, false);
});

test("a fact answer after a search does not carry the earlier search cards", async () => {
  const handle = createHandler({
    search: async (query) => searchResult(query, [card("EA-1")]),
    lookupFacts: async () => [facts("EA-1")],
    runModel: async (input) => {
      const search = await input.tools.executeTool(
        "search_properties",
        { department: "sales", location: "Cuffley" },
        { currentMessage: input.request.message, context: resultContext(input) },
      );
      assert.equal(search.ok, true);
      const propertyFacts = await input.tools.executeTool(
        "get_property_facts",
        { propertyIds: ["EA-1"] },
        {
          currentMessage: input.request.message,
          context: search.ok ? search.context : resultContext(input),
        },
      );
      assert.equal(propertyFacts.ok, true);
      return {
        directive: { response: "The home has three bedrooms.", action: "answer" },
        context: propertyFacts.ok ? propertyFacts.context : resultContext(input),
      };
    },
  });

  const response = await handle(request("Find a home and tell me about it"));

  assert.equal(response.action, "answer");
  assert.equal(response.response, "The home has three bedrooms.");
  assert.equal("properties" in response, false);
});

test("handoff actions always use the exact server-authored copy", async () => {
  for (const reason of ["viewing", "valuation", "offer", "fees_finance_legal", "human"] as const) {
    const handle = createHandler({
      runModel: async (input) => {
        const toolResult = await input.tools.executeTool(
          "contact_banc",
          { reason },
          { currentMessage: input.request.message, context: resultContext(input) },
        );
        assert.equal(toolResult.ok, true);
        return {
          directive: { response: "MODEL PROSE MUST NOT WIN", action: "contact_team" },
          context: toolResult.ok ? toolResult.context : resultContext(input),
        };
      },
    });

    const response = await handle(request(`Please help with ${reason}`));
    assert.equal(response.response, CONTACT_BANC_COPY[reason]);
    assert.equal(response.action, "contact_team");
  }
});

test("model, directive, fact authorization, and search failures preserve original context", async () => {
  const originalContext: PropertyConversationContext = {
    query: createDefaultPropertySearchQuery("sales"),
    resultPropertyIds: ["EA-1"],
    focusedPropertyId: "EA-1",
    resultFingerprint: "sales:EA-1",
  };
  const cases: Array<readonly [string, PropertyConversationModelRunner, PropertySearch?]> = [
    ["timeout", async () => { throw new Error("model timeout secret=top-secret"); }],
    [
      "malformed directive",
      async (input) => ({
        directive: { response: "Bad", action: "answer", unexpected: true },
        context: resultContext(input),
      }),
    ],
    [
      "unauthorized fact",
      async (input) => {
        const toolResult = await input.tools.executeTool(
          "get_property_facts",
          { propertyIds: ["EA-NOT-ACTIVE"] },
          { currentMessage: input.request.message, context: resultContext(input) },
        );
        assert.deepEqual(toolResult, {
          ok: false,
          name: "get_property_facts",
          code: "unauthorized_property_reference",
        });
        return {
          directive: { response: "The fake title is Fine House.", action: "answer" },
          context: resultContext(input),
        };
      },
    ],
    [
      "search failure",
      async (input) => {
        const toolResult = await input.tools.executeTool(
          "search_properties",
          { department: "sales", location: "Cuffley" },
          { currentMessage: input.request.message, context: resultContext(input) },
        );
        assert.equal(toolResult.ok, false);
        return {
          directive: { response: "raw database error", action: "search" },
          context: resultContext(input),
        };
      },
      async () => { throw new Error("DATABASE_PASSWORD=top-secret raw upstream"); },
    ],
  ];

  for (const [name, runModel, search] of cases) {
    const handle = createHandler({ runModel, ...(search === undefined ? {} : { search }) });
    const response = await handle(request("Continue", originalContext));
    assert.equal(response.response, PROPERTY_ASSISTANT_UNAVAILABLE, name);
    assert.equal(response.action, "unavailable", name);
    assert.deepEqual(response.context, originalContext, name);
    assert.equal("properties" in response, false, name);
    assert.doesNotMatch(JSON.stringify(response), /top-secret|raw upstream|fake title|database_password/i, name);
  }
});

test("model-provided cards, raw calls, secrets, and unexpected keys cannot enter the public response", async () => {
  for (const directive of [
    {
      response: "A fabricated listing",
      action: "search",
      properties: [card("FAKE-1", { title: "Fake title" })],
    },
    {
      response: "The API key is top-secret",
      action: "answer",
      rawToolCall: { name: "search_properties" },
    },
  ]) {
    const handle = createHandler({
      runModel: async (input) => ({ directive, context: resultContext(input) }),
    });

    const response = await handle(request("Show me a home"));
    assert.deepEqual(response, {
      response: PROPERTY_ASSISTANT_UNAVAILABLE,
      action: "unavailable",
      context: { resultPropertyIds: [] },
    });
  }
});

test("blank API key or model returns the fixed unavailable response without creating a model client", async () => {
  for (const [apiKey, model] of [["", "test-model"], ["test-key", "   "]] as const) {
    let modelRunnerCreations = 0;
    const handle = createHandler({
      apiKey,
      model,
      onCreateModelRunner: () => { modelRunnerCreations += 1; },
      runModel: async () => { throw new Error("must not run"); },
    });

    const response = await handle(request("Find a home"));

    assert.equal(modelRunnerCreations, 0);
    assert.deepEqual(response, {
      response: PROPERTY_ASSISTANT_UNAVAILABLE,
      action: "unavailable",
      context: { resultPropertyIds: [] },
    });
  }
});
