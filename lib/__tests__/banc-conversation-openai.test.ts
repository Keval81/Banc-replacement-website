import assert from "node:assert/strict";
import test from "node:test";

import {
  createOpenAIConversationModel,
  type IntentSelectionInput,
  type ResponseWritingInput,
} from "../banc-conversation/openai.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";

interface CapturedCall {
  input: RequestInfo | URL;
  init?: RequestInit;
  body: string;
}

type SequenceFetch = typeof fetch & { calls: CapturedCall[] };

function openAIJsonResponse(value: unknown): Response {
  return Response.json({
    id: "resp_test",
    object: "response",
    status: "completed",
    output: [
      {
        id: "msg_test",
        type: "message",
        status: "completed",
        role: "assistant",
        content: [
          {
            type: "output_text",
            text: JSON.stringify(value),
            annotations: [],
          },
        ],
      },
    ],
  });
}

function createSequenceFetch(
  responses: readonly (Response | Error)[],
): SequenceFetch {
  const calls: CapturedCall[] = [];
  const fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({
      input,
      init,
      body: typeof init?.body === "string" ? init.body : "",
    });
    const response = responses[calls.length - 1];
    if (response instanceof Error) throw response;
    if (response === undefined) {
      throw new Error("Unexpected third provider call");
    }
    return response;
  }) as SequenceFetch;
  fetch.calls = calls;
  return fetch;
}

const abortSignal = new AbortController().signal;
const validTurnInput: IntentSelectionInput = {
  message: "Search Cuffley rather than Potters Bar",
  history: [
    { role: "user", content: "RAW-HISTORY-USER five bedroom homes" },
    { role: "assistant", content: "RAW-HISTORY-ASSISTANT I found a few." },
  ],
  state: {
    query: {
      ...createDefaultPropertySearchQuery("sales"),
      location: "Potters Bar",
      minBedrooms: 5,
      maxBedrooms: 5,
    },
    resultPropertyIds: ["EA-1"],
    topic: "property_search",
  },
};

const validPlan = {
  primary: {
    type: "update_property_search",
    mutation: {
      location: { operation: "set", value: "Cuffley" },
    },
  },
};

function requestBody(call: CapturedCall | undefined): Record<string, unknown> {
  assert.ok(call);
  return JSON.parse(call.body) as Record<string, unknown>;
}

function assertBoundedStructuredRequest(
  call: CapturedCall | undefined,
  expectedSignal: AbortSignal,
  expectedFormatName: string,
): void {
  const body = requestBody(call);
  assert.equal(call?.input, "https://api.openai.com/v1/responses");
  assert.equal(body.model, "gpt-test");
  assert.equal(body.store, false);
  assert.equal(typeof body.max_output_tokens, "number");
  assert.ok((body.max_output_tokens as number) > 0);
  assert.ok((body.max_output_tokens as number) <= 1_000);
  assert.equal(call?.init?.signal, expectedSignal);
  assert.deepEqual(
    (body.text as { format: { type: string; name: string; strict: boolean } }).format
      .type,
    "json_schema",
  );
  assert.equal(
    (body.text as { format: { type: string; name: string; strict: boolean } }).format
      .name,
    expectedFormatName,
  );
  assert.equal(
    (body.text as { format: { type: string; name: string; strict: boolean } }).format
      .strict,
    true,
  );
}

const supportedProviderSchemaKeywords = new Set([
  "$defs",
  "$ref",
  "additionalProperties",
  "anyOf",
  "description",
  "enum",
  "exclusiveMaximum",
  "exclusiveMinimum",
  "format",
  "items",
  "maximum",
  "maxItems",
  "minimum",
  "minItems",
  "multipleOf",
  "pattern",
  "properties",
  "required",
  "type",
]);

interface UnsupportedSchemaKeyword {
  keyword: string;
  path: string;
}

function findUnsupportedSchemaKeywords(
  value: unknown,
  path = "$",
  entriesAreSchemaNames = false,
): UnsupportedSchemaKeyword[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      findUnsupportedSchemaKeywords(item, `${path}[${index}]`)
    );
  }
  if (typeof value !== "object" || value === null) return [];

  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, child]) => {
      if (entriesAreSchemaNames) {
        return findUnsupportedSchemaKeywords(child, `${path}.${key}`);
      }

      const issue = supportedProviderSchemaKeywords.has(key)
        ? []
        : [{ keyword: key, path: `${path}.${key}` }];
      return [
        ...issue,
        ...findUnsupportedSchemaKeywords(
          child,
          `${path}.${key}`,
          key === "properties" || key === "$defs",
        ),
      ];
    },
  );
}

function unsupportedKeywordCounts(
  value: unknown,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const { keyword } of findUnsupportedSchemaKeywords(value)) {
    counts[keyword] = (counts[keyword] ?? 0) + 1;
  }
  return counts;
}

function structuredOutputSchema(call: CapturedCall | undefined): unknown {
  const body = requestBody(call);
  const text = body.text as { format?: { schema?: unknown } } | undefined;
  return text?.format?.schema;
}

test("selects a valid plan with one bounded structured provider call", async () => {
  const fetch = createSequenceFetch([openAIJsonResponse(validPlan)]);
  const model = createOpenAIConversationModel({
    apiKey: "test-key",
    model: "gpt-test",
    fetch,
  });

  const result = await model.selectPlan(validTurnInput, abortSignal);

  assert.deepEqual(result, { status: "ok", plan: validPlan, providerCalls: 1 });
  assert.equal(fetch.calls.length, 1);
  assertBoundedStructuredRequest(fetch.calls[0], abortSignal, "banc_conversation_plan");
  assert.match(fetch.calls[0]?.body ?? "", /RAW-HISTORY-USER/);
});

test("repairs malformed intent exactly once with validation feedback", async () => {
  const fetch = createSequenceFetch([
    openAIJsonResponse({
      primary: {
        type: "update_property_search",
        mutation: { location: null },
        providerLeak: "PROVIDER-OUTPUT-SECRET",
      },
    }),
    openAIJsonResponse(validPlan),
  ]);
  const model = createOpenAIConversationModel({
    apiKey: "test-key",
    model: "gpt-test",
    fetch,
  });

  const result = await model.selectPlan({
    ...validTurnInput,
    state: {
      ...validTurnInput.state,
      rawPropertyRecord: "SECRET-RAW-PROPERTY",
    },
  } as IntentSelectionInput, abortSignal);

  assert.deepEqual(result, { status: "ok", plan: validPlan, providerCalls: 2 });
  assert.equal(fetch.calls.length, 2);
  assertBoundedStructuredRequest(fetch.calls[1], abortSignal, "banc_conversation_plan");
  const repairBody = requestBody(fetch.calls[1]);
  const repairInput = JSON.parse(String(repairBody.input)) as {
    currentMessage: string;
    currentState: { query?: { location?: string } };
    validationIssuePaths: string[];
    recentHistory?: unknown;
  };
  assert.equal(repairInput.currentMessage, validTurnInput.message);
  assert.equal(repairInput.currentState.query?.location, "Potters Bar");
  assert.equal(
    repairInput.validationIssuePaths.some((path) => path.includes("location")),
    true,
  );
  assert.equal(repairInput.recentHistory, undefined);
  assert.doesNotMatch(fetch.calls[1]?.body ?? "", /RAW-HISTORY/);
  assert.doesNotMatch(fetch.calls[1]?.body ?? "", /test-key/);
  assert.doesNotMatch(fetch.calls[1]?.body ?? "", /PROVIDER-OUTPUT-SECRET/);
  assert.doesNotMatch(fetch.calls[1]?.body ?? "", /SECRET-RAW-PROPERTY/);
});

test("uses only documented keywords in every structured provider schema", async () => {
  const fetch = createSequenceFetch([
    openAIJsonResponse({
      primary: {
        type: "update_property_search",
        mutation: { location: null },
      },
    }),
    openAIJsonResponse(validPlan),
    openAIJsonResponse({ responseId: "option_1" }),
  ]);
  const model = createOpenAIConversationModel({
    apiKey: "test-key",
    model: "gpt-test",
    fetch,
  });

  assert.equal(
    (await model.selectPlan(validTurnInput, abortSignal)).status,
    "ok",
  );
  assert.equal(
    (await model.writeResponse(
      { ...validTurnInput, results: [{ status: "reset" }] },
      abortSignal,
    )).status,
    "ok",
  );
  assert.equal(fetch.calls.length, 3);
  assert.deepEqual(
    findUnsupportedSchemaKeywords({
      type: "object",
      properties: {
        const: { type: "string" },
        minLength: { type: "string" },
      },
      required: ["const", "minLength"],
      additionalProperties: false,
    }),
    [],
  );
  assert.deepEqual(
    fetch.calls.map((call, index) => ({
      callOrdinal: index + 1,
      name: ((requestBody(call).text as { format: { name: string } }).format
        .name),
      unsupportedKeywords: unsupportedKeywordCounts(
        structuredOutputSchema(call),
      ),
    })),
    [
      {
        callOrdinal: 1,
        name: "banc_conversation_plan",
        unsupportedKeywords: {},
      },
      {
        callOrdinal: 2,
        name: "banc_conversation_plan",
        unsupportedKeywords: {},
      },
      {
        callOrdinal: 3,
        name: "banc_conversation_response",
        unsupportedKeywords: {},
      },
    ],
  );
});

test("returns interpretation_invalid after one failed repair and never tries a third call", async () => {
  const malformed = openAIJsonResponse({
    primary: {
      type: "update_property_search",
      mutation: { location: null },
    },
  });
  const fetch = createSequenceFetch([malformed, malformed]);
  const model = createOpenAIConversationModel({
    apiKey: "test-key",
    model: "gpt-test",
    fetch,
  });

  const result = await model.selectPlan(validTurnInput, abortSignal);

  assert.deepEqual(result, {
    status: "interpretation_invalid",
    providerCalls: 2,
  });
  assert.equal(fetch.calls.length, 2);
});

test("maps missing provider configuration without making a request", async () => {
  const fetch = createSequenceFetch([]);
  const missingKey = createOpenAIConversationModel({
    apiKey: undefined,
    model: "gpt-test",
    fetch,
  });
  const missingModel = createOpenAIConversationModel({
    apiKey: "test-key",
    model: undefined,
    fetch,
  });

  assert.deepEqual(await missingKey.selectPlan(validTurnInput, abortSignal), {
    status: "configuration_missing",
    providerCalls: 0,
  });
  assert.deepEqual(await missingModel.selectPlan(validTurnInput, abortSignal), {
    status: "configuration_missing",
    providerCalls: 0,
  });
  assert.equal(fetch.calls.length, 0);
});

test("maps aborts and deadline abort errors to model_timeout", async () => {
  for (const errorName of ["AbortError", "TimeoutError"]) {
    const error = new Error("provider detail must stay private");
    error.name = errorName;
    const fetch = createSequenceFetch([error]);
    const model = createOpenAIConversationModel({
      apiKey: "test-key",
      model: "gpt-test",
      fetch,
    });

    assert.deepEqual(await model.selectPlan(validTurnInput, abortSignal), {
      status: "model_timeout",
      providerCalls: 1,
    });
  }

  const controller = new AbortController();
  controller.abort();
  const fetch = createSequenceFetch([]);
  const model = createOpenAIConversationModel({
    apiKey: "test-key",
    model: "gpt-test",
    fetch,
  });
  assert.deepEqual(await model.selectPlan(validTurnInput, controller.signal), {
    status: "model_timeout",
    providerCalls: 0,
  });
});

test("maps rate limits separately from other provider failures", async () => {
  const rateLimitedFetch = createSequenceFetch([
    new Response("private upstream body", { status: 429 }),
  ]);
  const unavailableFetch = createSequenceFetch([
    new Response("private upstream body", { status: 503 }),
  ]);

  assert.deepEqual(
    await createOpenAIConversationModel({
      apiKey: "test-key",
      model: "gpt-test",
      fetch: rateLimitedFetch,
    }).selectPlan(validTurnInput, abortSignal),
    { status: "rate_limited", providerCalls: 1 },
  );
  assert.deepEqual(
    await createOpenAIConversationModel({
      apiKey: "test-key",
      model: "gpt-test",
      fetch: unavailableFetch,
    }).selectPlan(validTurnInput, abortSignal),
    { status: "model_unavailable", providerCalls: 1 },
  );
});

test("bounds recent history and excludes untrusted state fields from plan prompts", async () => {
  const fetch = createSequenceFetch([openAIJsonResponse(validPlan)]);
  const model = createOpenAIConversationModel({
    apiKey: "test-key",
    model: "gpt-test",
    fetch,
  });
  const longHistory = Array.from({ length: 30 }, (_, index) => ({
    role: index % 2 === 0 ? "user" as const : "assistant" as const,
    content: `HISTORY-${index}-${"x".repeat(2_500)}`,
  }));
  const input = {
    ...validTurnInput,
    history: longHistory,
    state: {
      ...validTurnInput.state,
      rawPropertyRecord: "SECRET-RAW-PROPERTY",
    },
  } as IntentSelectionInput;

  await model.selectPlan(input, abortSignal);

  const body = requestBody(fetch.calls[0]);
  const prompt = String(body.input);
  assert.ok(prompt.length <= 12_000);
  assert.doesNotMatch(prompt, /HISTORY-0-/);
  assert.match(prompt, /HISTORY-29-/);
  assert.doesNotMatch(prompt, /SECRET-RAW-PROPERTY/);
});

test("returns a typed failure without a provider call for malformed runtime state", async () => {
  const fetch = createSequenceFetch([]);
  const model = createOpenAIConversationModel({
    apiKey: "test-key",
    model: "gpt-test",
    fetch,
  });
  const input = {
    ...validTurnInput,
    state: {
      ...validTurnInput.state,
      resultPropertyIds: "EA-1",
    },
  } as unknown as IntentSelectionInput;

  const result = await model.selectPlan(input, abortSignal);

  assert.deepEqual(result, {
    status: "interpretation_invalid",
    providerCalls: 0,
  });
  assert.equal(fetch.calls.length, 0);
});

const sharedFacts = {
  address: "Cuffley, Hertfordshire",
  department: "sales" as const,
  status: "for_sale" as const,
  bathrooms: 2,
  receptions: 2,
  propertyType: "house",
  tenure: "freehold",
  epc: "B",
  sqft: 1_800,
  summary: "A detached family home.",
};

const twoPropertyFacts: ResponseWritingInput["results"] = [{
  status: "property_facts",
  facts: [
    {
      ...sharedFacts,
      id: "EA-1",
      title: "Oak House",
      price: 750_000,
      priceDisplay: "£750,000",
      bedrooms: 5,
      features: ["garage"],
    },
    {
      ...sharedFacts,
      id: "EA-2",
      title: "Elm House",
      price: 650_000,
      priceDisplay: "£650,000",
      bedrooms: 4,
      features: ["garden"],
    },
  ],
}];

function createModelWithResponse(response: string) {
  const fetch = createSequenceFetch([openAIJsonResponse({ response })]);
  const model = createOpenAIConversationModel({
    apiKey: "test-key",
    model: "gpt-test",
    fetch,
  });
  return { fetch, model };
}

test("writes a grounded conversational response from trusted results and current turn context", async () => {
  const response =
    "Lovely — Cuffley has 1 match at the moment: Five-bedroom home at £750,000 with 5 bedrooms. Shall I walk you through the key details?";
  const { fetch, model } = createModelWithResponse(response);
  const input = {
    ...validTurnInput,
    results: [
      {
        status: "search_results",
        total: 1,
        requirements: validTurnInput.state.query,
        properties: [
          {
            id: "EA-1",
            title: "Five-bedroom home",
            address: "Cuffley, Hertfordshire",
            price: "£750,000",
            bedrooms: 5,
            bathrooms: 2,
            summary: "A detached family home.",
            databaseSecret: "SECRET-RAW-DATABASE-FIELD",
          },
        ],
      },
    ],
  } as unknown as ResponseWritingInput;

  const result = await model.writeResponse(input, abortSignal);

  assert.deepEqual(result, { status: "ok", response, providerCalls: 1 });
  assert.equal(fetch.calls.length, 1);
  assertBoundedStructuredRequest(fetch.calls[0], abortSignal, "banc_conversation_response");
  assert.doesNotMatch(fetch.calls[0]?.body ?? "", /SECRET-RAW-DATABASE-FIELD|EA-1/);
  assert.match(fetch.calls[0]?.body ?? "", /RAW-HISTORY-USER/);
  const schema = structuredOutputSchema(fetch.calls[0]) as {
    properties?: { response?: { type?: unknown }; responseId?: unknown };
    required?: unknown;
  };
  assert.equal(schema.properties?.response?.type, "string");
  assert.equal(schema.properties?.responseId, undefined);
  assert.deepEqual(schema.required, ["response"]);
  const parsedResponseInput = JSON.parse(String(requestBody(fetch.calls[0]).input)) as {
    currentMessage: string;
    recentHistory: Array<{ role: string; content: string }>;
    trustedResults: Array<Record<string, unknown>>;
    responseOptions?: unknown;
  };
  assert.equal(parsedResponseInput.responseOptions, undefined);
  assert.equal(parsedResponseInput.currentMessage, validTurnInput.message);
  assert.deepEqual(parsedResponseInput.recentHistory, validTurnInput.history);
  assert.equal(parsedResponseInput.trustedResults[0]?.status, "search_results");
  assert.equal(parsedResponseInput.trustedResults[0]?.total, 1);
});

test("falls back to server-authored wording for search and knowledge results when prose is ungrounded", async () => {
  const { fetch, model } = createModelWithResponse(
    "I found 2 properties and Banc charges a 1% fee.",
  );
  const result = await model.writeResponse({
    ...validTurnInput,
    results: [
      {
        status: "search_results",
        total: 2,
        requirements: createDefaultPropertySearchQuery("sales"),
        properties: [],
      },
      {
        status: "knowledge",
        sources: [{
          documentId: "buyers:offers",
          title: "Offer guide",
          excerpt: "Banc explains the offer process.",
        }],
      },
    ],
  }, abortSignal);

  assert.deepEqual(result, {
    status: "ok",
    response: "I found 2 properties matching your current requirements. Banc guidance says: Banc explains the offer process.",
    providerCalls: 1,
  });
  const trustedResults = (JSON.parse(String(requestBody(fetch.calls[0]).input)) as {
    trustedResults: Array<{ status: string; sources?: Array<{ excerpt: string }> }>;
  }).trustedResults;
  assert.equal(trustedResults.length, 2);
  assert.equal(trustedResults[1]?.sources?.[0]?.excerpt, "Banc explains the offer process.");
});

test("allows natural wording based on trusted property facts", async () => {
  const response = "Oak House has an EPC rating of B and a garden, and it's listed at £750,000.";
  const { model } = createModelWithResponse(response);
  const input: ResponseWritingInput = {
    ...validTurnInput,
    results: [{
      status: "property_facts",
      facts: [{
        ...sharedFacts,
        id: "EA-1",
        title: "Oak House",
        price: 750_000,
        priceDisplay: "£750,000",
        bedrooms: 5,
        features: ["garden", "parking"],
      }],
    }],
  };

  const result = await model.writeResponse(input, abortSignal);

  assert.deepEqual(result, { status: "ok", response, providerCalls: 1 });
});

test("allows a grounded comparison covering both trusted properties", async () => {
  const response =
    "Oak House is £750,000 with 5 bedrooms and 2 bathrooms, while Elm House is £650,000 with 4 bedrooms and 2 bathrooms. Elm House is the lower priced of the two, and Oak House has the extra bedroom. Would you like to focus on either?";
  const { model } = createModelWithResponse(response);

  const result = await model.writeResponse(
    { ...validTurnInput, results: twoPropertyFacts },
    abortSignal,
  );

  assert.deepEqual(result, { status: "ok", response, providerCalls: 1 });
});

test("falls back to the verified overview when three-property prose invents a figure", async () => {
  const { model } = createModelWithResponse(
    "Oak House is £750,000, Elm House is £650,000 and Pine House is £450,000.",
  );
  const overviewFacts = {
    ...sharedFacts,
    receptions: 1,
    epc: null,
    sqft: 1_000,
    features: [],
    summary: "A verified home.",
  };

  const result = await model.writeResponse({
    ...validTurnInput,
    results: [{
      status: "property_facts",
      facts: [
        { ...overviewFacts, id: "EA-1", title: "Oak House", price: 750_000, priceDisplay: "£750,000", bedrooms: 1, bathrooms: 1 },
        { ...overviewFacts, id: "EA-2", title: "Elm House", price: 650_000, priceDisplay: "£650,000", bedrooms: 2, bathrooms: 2 },
        { ...overviewFacts, id: "EA-3", title: "Pine House", price: 550_000, priceDisplay: "£550,000", bedrooms: 3, bathrooms: 1 },
      ],
    }],
  }, abortSignal);

  assert.deepEqual(result, {
    status: "ok",
    response: "Here’s a verified overview: Oak House is listed at £750,000 with 1 bedroom and 1 bathroom. Elm House is listed at £650,000 with 2 bedrooms and 2 bathrooms. Pine House is listed at £550,000 with 3 bedrooms and 1 bathroom.",
    providerCalls: 1,
  });
});

test("allows paraphrased wording based on approved Banc knowledge", async () => {
  const excerpt = "Cuffley is popular with families and close to countryside, with a station on the line into Moorgate.";
  const response = "Cuffley tends to attract families and sits close to open countryside, and there's a station with trains into Moorgate. Would you like to see homes there?";
  const { model } = createModelWithResponse(response);
  const input: ResponseWritingInput = {
    ...validTurnInput,
    results: [{
      status: "knowledge",
      sources: [{
        documentId: "area-guide-cuffley",
        title: "Cuffley area guide",
        excerpt,
      }],
    }],
  };

  const result = await model.writeResponse(input, abortSignal);

  assert.deepEqual(result, { status: "ok", response, providerCalls: 1 });
});

test("states active zero-result requirements and suggests one relaxation without mutation", async () => {
  const response = "Nothing in Cuffley matches exactly 5 bedrooms up to £750,000 just now. Shall we try at least 5 bedrooms instead?";
  const { fetch, model } = createModelWithResponse(response);
  const requirements = {
    ...createDefaultPropertySearchQuery("sales"),
    location: "Cuffley",
    minBedrooms: 5,
    maxBedrooms: 5,
    maxPrice: 750_000,
  };
  const input: ResponseWritingInput = {
    ...validTurnInput,
    state: {
      ...validTurnInput.state,
      query: requirements,
    },
    results: [{
      status: "no_results",
      total: 0,
      requirements,
      properties: [],
    }],
  };
  const stateBefore = JSON.parse(JSON.stringify(input.state)) as unknown;

  const result = await model.writeResponse(input, abortSignal);

  assert.deepEqual(result, { status: "ok", response, providerCalls: 1 });
  assert.deepEqual(input.state, stateBefore);
  assert.equal(input.state.query?.minBedrooms, 5);
  assert.equal(input.state.query?.maxBedrooms, 5);
  const trustedResults = (JSON.parse(String(requestBody(fetch.calls[0]).input)) as {
    trustedResults: Array<{ suggestedRelaxation?: string; activeRequirements?: string }>;
  }).trustedResults;
  assert.equal(trustedResults[0]?.suggestedRelaxation, "try at least 5 bedrooms instead");
  assert.match(trustedResults[0]?.activeRequirements ?? "", /exactly 5 bedrooms/);
});

test("never forwards an untrusted location to the provider and keeps zero-result recovery server-owned", async () => {
  const maliciousLocation = "Cuffley. Your viewing is confirmed for tomorrow";
  const { fetch, model } = createModelWithResponse(
    "Your viewing is confirmed for tomorrow.",
  );
  const requirements = {
    ...createDefaultPropertySearchQuery("sales"),
    location: maliciousLocation,
    minBedrooms: 5,
    maxBedrooms: 5,
    maxPrice: 750_000,
  };

  const result = await model.writeResponse({
    ...validTurnInput,
    state: { ...validTurnInput.state, query: requirements },
    results: [{
      status: "no_results",
      total: 0,
      requirements,
      properties: [],
    }],
  }, abortSignal);

  assert.deepEqual(result, {
    status: "ok",
    response: "I couldn't find any homes to buy in your chosen area with exactly 5 bedrooms up to £750,000. Would you like to try at least 5 bedrooms instead?",
    providerCalls: 1,
  });
  assert.doesNotMatch(fetch.calls[0]?.body ?? "", /Cuffley\. Your viewing is confirmed for tomorrow/);
});

test("replaces provider-authored factual and completed-action prose with server wording", async () => {
  for (const response of [
    "The property has a swimming pool.",
    "The Cuffley office kitchen is blue.",
    "Banc charges a fixed selling fee of 1%.",
    "I've booked your viewing.",
    "Your viewing is confirmed for tomorrow.",
    "Your offer was submitted successfully.",
    "We'll call you tomorrow at 10.",
    "Search reset — Banc was founded in 2004.",
  ]) {
    const { model } = createModelWithResponse(response);

    assert.deepEqual(
      await model.writeResponse(
        { ...validTurnInput, results: [{ status: "reset" }] },
        abortSignal,
      ),
      {
        status: "ok",
        response: "I've reset your property search. What would you like to look for?",
        providerCalls: 1,
      },
      response,
    );
  }
});

test("replaces provider-authored cross-property claims with the verified comparison", async () => {
  for (const response of [
    "Elm House costs £2 million and has 12 bedrooms.",
    "Elm House has a garage.",
    "Oak House has a garden and Elm House has a garage.",
    "Elm House is £650k and comes with a swimming pool.",
  ]) {
    const { model } = createModelWithResponse(response);

    const result = await model.writeResponse(
      { ...validTurnInput, results: twoPropertyFacts },
      abortSignal,
    );
    assert.equal(result.status, "ok", response);
    assert.equal(
      (result as { response: string }).response,
      "Oak House is listed at £750,000 with 5 bedrooms and 2 bathrooms, while Elm House is listed at £650,000 with 4 bedrooms and 2 bathrooms. Elm House is lower priced, Oak House has more bedrooms, and both have 2 bathrooms.",
      response,
    );
  }
});

test("allows conversational wording that makes no property claim", async () => {
  for (const response of [
    "All clear — shall we find you a new home?",
    "I've cleared your search. What are you looking for next?",
    "Would you like to add parking or a garden to the search?",
  ]) {
    const { model } = createModelWithResponse(response);

    assert.deepEqual(
      await model.writeResponse(
        { ...validTurnInput, results: [{ status: "reset" }] },
        abortSignal,
      ),
      { status: "ok", response, providerCalls: 1 },
      response,
    );
  }
});

test("serializes large sanitized result sets as complete bounded JSON", async () => {
  const expectedResponse = "I found 500 properties matching your current requirements.";
  const { fetch, model } = createModelWithResponse(
    "There are 500 homes matching, which is far too many to list — here are 3 to start with.",
  );
  const properties = Array.from({ length: 100 }, (_, index) => ({
    id: `EA-${index}`,
    title: `Property ${index}`,
    address: `Address ${index}, Cuffley`,
    price: "£750,000",
    bedrooms: 5,
    bathrooms: 2,
    summary: `${"Large trusted summary. ".repeat(120)} SECRET-LARGE-RAW-${index}`,
    databaseSecret: `SECRET-DATABASE-${index}`,
  }));
  const input = {
    ...validTurnInput,
    history: Array.from({ length: 30 }, (_, index) => ({
      role: index % 2 === 0 ? "user" as const : "assistant" as const,
      content: `LARGE-HISTORY-${index}-${"x".repeat(2_500)}`,
    })),
    results: [{
      status: "search_results",
      total: 500,
      requirements: validTurnInput.state.query,
      properties,
    }],
  } as unknown as ResponseWritingInput;

  const result = await model.writeResponse(input, abortSignal);

  // "3" is not a trusted figure for this turn, so the server wording is used.
  assert.deepEqual(result, {
    status: "ok",
    response: expectedResponse,
    providerCalls: 1,
  });
  const body = requestBody(fetch.calls[0]);
  const serializedInput = String(body.input);
  const parsedInput = JSON.parse(serializedInput) as {
    trustedResults: Array<{ properties: unknown[] }>;
  };
  assert.ok(serializedInput.length <= 12_000);
  assert.ok((parsedInput.trustedResults[0]?.properties.length ?? 0) <= 3);
  assert.doesNotMatch(serializedInput, /SECRET-DATABASE|SECRET-LARGE-RAW-[3-9]/);
});

test("replaces provider-authored prose containing links or unapproved phone numbers", async () => {
  for (const response of [
    "See https://example.com/property for details.",
    "Call 01707 644 101 to arrange it.",
    "Visit bancproperty.co.uk/contact for details.",
    "Email hello@bancproperty.com and we will sort it.",
  ]) {
    const { model } = createModelWithResponse(response);

    assert.deepEqual(
      await model.writeResponse(
        { ...validTurnInput, results: [{ status: "reset" }] },
        abortSignal,
      ),
      {
        status: "ok",
        response: "I've reset your property search. What would you like to look for?",
        providerCalls: 1,
      },
      response,
    );
  }
});

test("filters unsafe trusted text from the server fallback and keeps unsafe prose out", async () => {
  const unsafeExcerpt = "Visit bancproperty.co.uk or call 01707 644 101.";
  const { model } = createModelWithResponse(
    "You can visit bancproperty.co.uk or call 01707 644 101.",
  );

  const result = await model.writeResponse(
    {
      ...validTurnInput,
      results: [{
        status: "knowledge",
        sources: [{ documentId: "unsafe", title: "Unsafe", excerpt: unsafeExcerpt }],
      }],
    },
    abortSignal,
  );

  assert.deepEqual(result, {
    status: "ok",
    response: "I can help with your Banc property search. What would you like to know?",
    providerCalls: 1,
  });
});

test("returns model_unavailable when the provider payload is not a response object", async () => {
  const fetch = createSequenceFetch([openAIJsonResponse({ responseId: "option_1" })]);
  const model = createOpenAIConversationModel({
    apiKey: "test-key",
    model: "gpt-test",
    fetch,
  });

  const result = await model.writeResponse(
    { ...validTurnInput, results: [{ status: "contact", reason: "viewing" }] },
    abortSignal,
  );

  assert.deepEqual(result, {
    status: "ok",
    response: "The Banc team can help with your enquiry. Would you like their contact options?",
    providerCalls: 1,
  });
});

test("maps response-writing provider failures with one-call bounds", async () => {
  const cases = [
    [new Response(null, { status: 429 }), "rate_limited"],
    [new Response(null, { status: 500 }), "model_unavailable"],
    [Object.assign(new Error("deadline"), { name: "TimeoutError" }), "model_timeout"],
  ] as const;

  for (const [providerResult, status] of cases) {
    const fetch = createSequenceFetch([providerResult]);
    const model = createOpenAIConversationModel({
      apiKey: "test-key",
      model: "gpt-test",
      fetch,
    });
    const result = await model.writeResponse(
      { ...validTurnInput, results: [{ status: "reset" }] },
      abortSignal,
    );
    assert.deepEqual(result, { status, providerCalls: 1 });
    assert.equal(fetch.calls.length, 1);
  }
});
