import assert from "node:assert/strict";
import test from "node:test";

import { BANC_CONTACT } from "../banc-contact.ts";
import type {
  ConversationPlan,
  ConversationRequest,
  PropertyConversationState,
} from "../banc-conversation/contracts.ts";
import {
  createBancConversationHandler,
  type ConversationDiagnosticEvent,
} from "../banc-conversation/handler.ts";
import type {
  BancKnowledge,
  BancKnowledgeResult,
} from "../banc-conversation/knowledge.ts";
import type {
  ConversationModel,
  IntentSelectionInput,
  ModelPlanResult,
  ModelResponseResult,
  ResponseWritingInput,
} from "../banc-conversation/openai.ts";
import type { PropertyPortfolio } from "../banc-conversation/portfolio.ts";
import { createConversationTools } from "../banc-conversation/tools.ts";
import { createResultFingerprint } from "../banc-conversation/state-reducer.ts";
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
    images: [`https://media.expertagent.co.uk/${id}.jpg`],
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
): PropertySearchResult {
  return {
    query,
    properties,
    total: properties.length,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: properties.length === 0 ? 0 : 1,
    lastSyncedAt: "2026-08-31T09:00:00.000Z",
  };
}

class FakePortfolio implements PropertyPortfolio {
  readonly searches: PropertySearchQuery[] = [];
  readonly factLookups: string[][] = [];
  failSearch = false;
  failFacts = false;

  async search(query: PropertySearchQuery): Promise<PropertySearchResult> {
    this.searches.push(query);
    if (this.failSearch) throw new Error("SECRET DATABASE URL");
    const properties = query.location === "Cuffley" ? [card("EA-1"), card("EA-2")] : [];
    return searchResult(query, properties);
  }

  async getFacts(ids: string[]): Promise<PropertyFacts[]> {
    this.factLookups.push([...ids]);
    if (this.failFacts) throw new Error("SECRET PROPERTY PAYLOAD");
    return ids.filter((id) => id !== "MISSING").map(facts);
  }
}

class FakeKnowledge implements BancKnowledge {
  readonly searches: string[] = [];
  results: BancKnowledgeResult[] = [];
  fail = false;

  async search(query: string): Promise<BancKnowledgeResult[]> {
    this.searches.push(query);
    if (this.fail) throw new Error("SECRET KNOWLEDGE URL");
    return this.results;
  }
}

class FakeModel implements ConversationModel {
  readonly planInputs: IntentSelectionInput[] = [];
  readonly responseInputs: ResponseWritingInput[] = [];
  planResults: ModelPlanResult[] = [];
  responseResults: ModelResponseResult[] = [];

  async selectPlan(input: IntentSelectionInput): Promise<ModelPlanResult> {
    this.planInputs.push(input);
    return this.planResults.shift() ?? {
      status: "interpretation_invalid",
      providerCalls: 1,
    };
  }

  async writeResponse(input: ResponseWritingInput): Promise<ModelResponseResult> {
    this.responseInputs.push(input);
    return this.responseResults.shift() ?? {
      status: "ok",
      response: "A grounded Banc response.",
      providerCalls: 1,
    };
  }
}

function requestFor(
  message: string,
  context?: PropertyConversationState,
): ConversationRequest {
  return {
    message,
    history: [],
    ...(context === undefined ? {} : { context }),
  };
}

function plan(primary: ConversationPlan["primary"]): ModelPlanResult {
  return { status: "ok", plan: { primary }, providerCalls: 1 };
}

function activeState(ids = ["EA-1", "EA-2"]): PropertyConversationState {
  return {
    query: {
      ...createDefaultPropertySearchQuery("sales"),
      location: "Cuffley",
      minBedrooms: 5,
      maxBedrooms: 5,
    },
    resultPropertyIds: [...ids],
    topic: "property_search",
  };
}

function setup() {
  const model = new FakeModel();
  const portfolio = new FakePortfolio();
  const knowledge = new FakeKnowledge();
  const diagnostics: ConversationDiagnosticEvent[] = [];
  const handler = createBancConversationHandler({
    model,
    tools: createConversationTools({ portfolio, knowledge }),
    logger: (event) => diagnostics.push(event),
  });
  return { handler, model, portfolio, knowledge, diagnostics };
}

function assertSafeDiagnostic(event: ConversationDiagnosticEvent): void {
  assert.deepEqual(
    Object.keys(event).sort(),
    event.tool === undefined
      ? ["category", "durationBucket", "requestId"]
      : ["category", "durationBucket", "requestId", "tool"],
  );
  const fields = event as unknown as Record<string, unknown>;
  for (const forbidden of [
    "message",
    "history",
    "response",
    "payload",
    "property",
    "apiKey",
    "url",
    "phone",
    "secret",
  ]) {
    assert.equal(Object.hasOwn(fields, forbidden), false, forbidden);
  }
  assert.doesNotMatch(String(fields.requestId), /secret|url|phone|key/i);
}

test("handles Potters Bar to Cuffley as a successful location replacement", async () => {
  const { handler, model } = setup();
  model.planResults.push(
    plan({
      type: "update_property_search",
      mutation: {
        department: { operation: "set", value: "sales" },
        location: { operation: "set", value: "Potters Bar" },
        bedrooms: { operation: "set", value: { mode: "exact", value: 5 } },
      },
    }),
    plan({
      type: "update_property_search",
      mutation: { location: { operation: "set", value: "Cuffley" } },
    }),
  );

  const first = await handler(requestFor("Any five-bedroom homes in Potters Bar?"));
  assert.equal(first.action, "no_results");
  assert.equal(first.context.query?.minBedrooms, 5);
  assert.equal(first.context.query?.maxBedrooms, 5);

  const second = await handler(
    requestFor("Search Cuffley rather than Potters Bar", first.context),
  );
  assert.equal(second.action, "search_results");
  assert.equal(second.context.query?.location, "Cuffley");
  assert.equal(second.context.query?.minBedrooms, 5);
  assert.equal(second.context.query?.maxBedrooms, 5);
  assert.deepEqual(second.properties?.map(({ id }) => id), ["EA-1", "EA-2"]);
});

test("preserves exact and minimum bedrooms across price, location, department, feature and type refinements", async () => {
  const cases: Array<{
    message: string;
    primary: ConversationPlan["primary"];
    state: PropertyConversationState;
    check(query: PropertySearchQuery): void;
  }> = [
    {
      message: "Make it cheaper",
      primary: {
        type: "update_property_search",
        mutation: { maxPrice: { operation: "set", value: 700_000 } },
      },
      state: activeState(),
      check: (query) => {
        assert.equal(query.maxPrice, 700_000);
        assert.equal(query.minBedrooms, 5);
        assert.equal(query.maxBedrooms, 5);
      },
    },
    {
      message: "At least four bedrooms",
      primary: {
        type: "update_property_search",
        mutation: { bedrooms: { operation: "set", value: { mode: "exact", value: 4 } } },
      },
      state: activeState(),
      check: (query) => {
        assert.equal(query.minBedrooms, 4);
        assert.equal(query.maxBedrooms, undefined);
      },
    },
    {
      message: "Actually rent flats in Potters Bar with parking",
      primary: {
        type: "update_property_search",
        mutation: {
          department: { operation: "set", value: "lettings" },
          location: { operation: "set", value: "Potters Bar" },
          propertyTypes: { operation: "set", value: ["flat"] },
          features: { operation: "set", value: ["parking"] },
        },
      },
      state: activeState(),
      check: (query) => {
        assert.equal(query.department, "lettings");
        assert.equal(query.location, "Potters Bar");
        assert.deepEqual(query.propertyTypes, ["flat"]);
        assert.deepEqual(query.features, ["parking"]);
      },
    },
  ];

  for (const scenario of cases) {
    const { handler, model, portfolio } = setup();
    model.planResults.push(plan(scenario.primary));
    await handler(requestFor(scenario.message, scenario.state));
    const query = portfolio.searches[0];
    assert.ok(query, scenario.message);
    scenario.check(query);
  }
});

test("answers facts for first and second properties and keeps comparisons in requested order", async () => {
  const { handler, model, portfolio } = setup();
  model.planResults.push(
    plan({ type: "get_property_facts", propertyIds: ["EA-1"] }),
    plan({ type: "get_property_facts", propertyIds: ["EA-2"] }),
    plan({ type: "get_property_facts", propertyIds: ["EA-2", "EA-1"] }),
  );

  for (const message of ["Tell me about the first", "What about the second?", "Compare them"] ) {
    const response = await handler(requestFor(message, activeState()));
    assert.equal(response.action, "answer");
    assert.equal(response.properties, undefined);
  }

  assert.deepEqual(portfolio.factLookups, [["EA-1"], ["EA-2"], ["EA-2", "EA-1"]]);
  assert.deepEqual(
    model.responseInputs[2]?.results[0]?.status === "property_facts"
      ? model.responseInputs[2].results[0].facts.map(({ id }) => id)
      : [],
    ["EA-2", "EA-1"],
  );
});

test("suppresses unchanged cards while retaining a successful search response", async () => {
  const { handler, model } = setup();
  const state = activeState();
  state.resultFingerprint = createResultFingerprint(["EA-1", "EA-2"], 2);
  model.planResults.push(plan({ type: "update_property_search", mutation: {} }));

  const response = await handler(requestFor("Show those again", state));

  assert.equal(response.action, "search_results");
  assert.deepEqual(response.properties, []);
});

test("answers Banc content questions with only trusted sources", async () => {
  const { handler, model, knowledge } = setup();
  knowledge.results = [{
    documentId: "buyers:offers",
    title: "Buyers guide",
    href: "/buyers",
    excerpt: "Banc explains the offer process.",
  }];
  model.planResults.push(plan({ type: "search_banc_knowledge", query: "offer process" }));

  const response = await handler(requestFor("How do offers work?"));

  assert.equal(response.action, "answer");
  assert.deepEqual(response.sources, [{ title: "Buyers guide", href: "/buyers" }]);
});

test("asks for a valid active property when facts are unsupported", async () => {
  const { handler, model } = setup();
  model.planResults.push(plan({ type: "get_property_facts", propertyIds: ["MISSING"] }));

  const response = await handler(requestFor("Does another home have a new roof?", activeState()));

  assert.equal(response.action, "clarify");
  assert.match(response.response, /choose a property/i);
  assert.deepEqual(response.context, activeState());
  assert.equal(model.responseInputs.length, 0);
});

test("resets search state and returns trusted Call and WhatsApp handoffs", async () => {
  const resetSetup = setup();
  resetSetup.model.planResults.push(plan({ type: "reset_conversation_search" }));
  const reset = await resetSetup.handler(requestFor("Start again", activeState()));
  assert.equal(reset.action, "answer");
  assert.deepEqual(reset.context, { resultPropertyIds: [], topic: "property_search" });

  const contactSetup = setup();
  contactSetup.model.planResults.push(plan({
    type: "contact_banc",
    reason: "viewing",
    propertyId: "EA-1",
  }));
  const contact = await contactSetup.handler(requestFor("Book a viewing", activeState()));
  assert.equal(contact.action, "contact_team");
  assert.deepEqual(contact.handoff, {
    callHref: BANC_CONTACT.callHref,
    whatsappHref: BANC_CONTACT.whatsappHref,
  });
});

test("keeps zero results as a normal outcome even when response writing fails", async () => {
  const { handler, model } = setup();
  model.planResults.push(plan({
    type: "update_property_search",
    mutation: {
      department: { operation: "set", value: "sales" },
      location: { operation: "set", value: "Potters Bar" },
    },
  }));
  model.responseResults.push({ status: "model_unavailable", providerCalls: 1 });

  const response = await handler(requestFor("Homes in Potters Bar"), "c5e8db87-4694-4446-84bb-e386845cbf33");

  assert.equal(response.action, "no_results");
  assert.equal(response.context.query?.location, "Potters Bar");
  assert.match(response.response, /couldn't find|no matching/i);
});

test("preserves state and asks a focused question after failed repair", async () => {
  const { handler, model } = setup();
  model.planResults.push({ status: "interpretation_invalid", providerCalls: 2 });
  const request = requestFor("SECRET VISITOR MESSAGE", activeState());

  const response = await handler(request, "c5e8db87-4694-4446-84bb-e386845cbf33");

  assert.equal(response.action, "clarify");
  assert.deepEqual(response.context, request.context);
  assert.match(response.response, /location|price|bedroom|property/i);
});

test("replaces a model-authored clarification with focused server copy", async () => {
  const { handler, model } = setup();
  model.planResults.push(plan({
    type: "clarify",
    question: "SECRET unsupported model claim",
  }));

  const response = await handler(requestFor("Help me choose", activeState()));

  assert.equal(response.action, "clarify");
  assert.match(response.response, /location|price|bedroom|property/i);
  assert.doesNotMatch(response.response, /secret|unsupported|claim/i);
});

test("never echoes an unsafe location in server-owned zero-result recovery", async () => {
  const { handler, model } = setup();
  model.planResults.push(plan({
    type: "update_property_search",
    mutation: {
      department: { operation: "set", value: "sales" },
      location: { operation: "set", value: "https://unsafe.example/SECRET" },
    },
  }));
  model.responseResults.push({ status: "model_unavailable", providerCalls: 1 });

  const response = await handler(requestFor("Search this location"));

  assert.equal(response.action, "no_results");
  assert.doesNotMatch(response.response, /https|unsafe|secret/i);
});

test("maps model timeout, provider outage, missing configuration and rate limiting without losing state", async () => {
  const categories = [
    "model_timeout",
    "model_unavailable",
    "configuration_missing",
    "rate_limited",
  ] as const;

  for (const category of categories) {
    const { handler, model, diagnostics } = setup();
    model.planResults.push({ status: category, providerCalls: category === "configuration_missing" ? 0 : 1 });
    const state = activeState();
    const response = await handler(
      requestFor("SECRET VISITOR MESSAGE", state),
      "c5e8db87-4694-4446-84bb-e386845cbf33",
    );
    assert.equal(response.action, "service_unavailable", category);
    assert.deepEqual(response.context, state, category);
    assert.equal(diagnostics[0]?.category, category);
    assertSafeDiagnostic(diagnostics[0] as ConversationDiagnosticEvent);
  }
});

test("distinguishes property and knowledge failures and emits only approved diagnostics", async () => {
  for (const kind of ["property", "knowledge"] as const) {
    const { handler, model, portfolio, knowledge, diagnostics } = setup();
    if (kind === "property") {
      portfolio.failSearch = true;
      model.planResults.push(plan({
        type: "update_property_search",
        mutation: { department: { operation: "set", value: "sales" } },
      }));
    } else {
      knowledge.fail = true;
      model.planResults.push(plan({ type: "search_banc_knowledge", query: "SECRET QUERY" }));
    }

    const state = activeState();
    const response = await handler(
      requestFor("SECRET VISITOR MESSAGE", state),
      "malicious-key-SECRET-url-phone",
    );

    assert.equal(response.action, "service_unavailable");
    assert.deepEqual(response.context, state);
    assert.equal(
      diagnostics[0]?.category,
      kind === "property" ? "property_search_unavailable" : "knowledge_unavailable",
    );
    assertSafeDiagnostic(diagnostics[0] as ConversationDiagnosticEvent);
  }
});

test("runs at most two trusted operations and skips supporting facts invalidated by the primary result", async () => {
  const valid = setup();
  valid.model.planResults.push({
    status: "ok",
    providerCalls: 1,
    plan: {
      primary: {
        type: "update_property_search",
        mutation: {
          department: { operation: "set", value: "sales" },
          location: { operation: "set", value: "Cuffley" },
        },
      },
      supporting: { type: "get_property_facts", propertyIds: ["EA-1"] },
    },
  });
  await valid.handler(requestFor("Find Cuffley and tell me about the first"));
  assert.equal(valid.portfolio.searches.length, 1);
  assert.deepEqual(valid.portfolio.factLookups, [["EA-1"]]);
  assert.equal(valid.model.responseInputs[0]?.results.length, 2);

  const invalid = setup();
  invalid.model.planResults.push({
    status: "ok",
    providerCalls: 1,
    plan: {
      primary: {
        type: "update_property_search",
        mutation: {
          department: { operation: "set", value: "sales" },
          location: { operation: "set", value: "Potters Bar" },
        },
      },
      supporting: { type: "get_property_facts", propertyIds: ["EA-1"] },
    },
  });
  await invalid.handler(requestFor("Find Potters Bar and tell me about the first", activeState()));
  assert.equal(invalid.portfolio.searches.length, 1);
  assert.equal(invalid.portfolio.factLookups.length, 0);
});

test("never exceeds three provider calls including repair and response writing", async () => {
  const { handler, model } = setup();
  model.planResults.push({
    status: "ok",
    providerCalls: 2,
    plan: { primary: { type: "search_banc_knowledge", query: "buying" } },
  });

  await handler(requestFor("How does buying work?"));

  assert.equal(model.planInputs.length, 1);
  assert.equal(model.responseInputs.length, 1);
});

test("does not start trusted work after the shared twenty-second deadline", async () => {
  const model = new FakeModel();
  const portfolio = new FakePortfolio();
  const knowledge = new FakeKnowledge();
  const diagnostics: ConversationDiagnosticEvent[] = [];
  const times = [0, 0, 20_001, 20_001, 20_001];
  model.planResults.push(plan({
    type: "update_property_search",
    mutation: { department: { operation: "set", value: "sales" } },
  }));
  const handler = createBancConversationHandler({
    model,
    tools: createConversationTools({ portfolio, knowledge }),
    now: () => times.shift() ?? 20_001,
    logger: (event) => diagnostics.push(event),
  });

  const response = await handler(requestFor("Find a home"), "c5e8db87-4694-4446-84bb-e386845cbf33");

  assert.equal(response.action, "service_unavailable");
  assert.equal(portfolio.searches.length, 0);
  assert.equal(diagnostics[0]?.category, "model_timeout");
});
