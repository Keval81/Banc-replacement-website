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

test("writes one grounded response using only sanitized results", async () => {
  const fetch = createSequenceFetch([
    openAIJsonResponse({
      response: "I found 1 property matching your current requirements.",
    }),
  ]);
  const model = createOpenAIConversationModel({
    apiKey: "test-key",
    model: "gpt-test",
    fetch,
  });
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

  assert.deepEqual(result, {
    status: "ok",
    response: "I found 1 property matching your current requirements.",
    providerCalls: 1,
  });
  assert.equal(fetch.calls.length, 1);
  assertBoundedStructuredRequest(fetch.calls[0], abortSignal, "banc_conversation_response");
  assert.doesNotMatch(fetch.calls[0]?.body ?? "", /SECRET-RAW-DATABASE-FIELD/);
  assert.match(fetch.calls[0]?.body ?? "", /RAW-HISTORY-USER/);
});

test("rejects unsupported facts and action claims absent from trusted results", async () => {
  for (const response of [
    "The property has a swimming pool.",
    "I've booked your viewing.",
  ]) {
    const fetch = createSequenceFetch([openAIJsonResponse({ response })]);
    const model = createOpenAIConversationModel({
      apiKey: "test-key",
      model: "gpt-test",
      fetch,
    });

    assert.deepEqual(
      await model.writeResponse(
        { ...validTurnInput, results: [{ status: "reset" }] },
        abortSignal,
      ),
      { status: "model_unavailable", providerCalls: 1 },
    );
  }
});

test("serializes large sanitized result sets as complete bounded JSON", async () => {
  const expectedResponse = "I found 500 properties matching your current requirements.";
  const fetch = createSequenceFetch([
    openAIJsonResponse({ response: expectedResponse }),
  ]);
  const model = createOpenAIConversationModel({
    apiKey: "test-key",
    model: "gpt-test",
    fetch,
  });
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
  assert.doesNotMatch(serializedInput, /SECRET-DATABASE/);
  assert.doesNotMatch(serializedInput, /SECRET-LARGE-RAW/);
});

test("rejects response prose containing URLs or phone numbers", async () => {
  for (const response of [
    "See https://example.com/property for details.",
    "Call 01707 644 101 to arrange it.",
  ]) {
    const fetch = createSequenceFetch([openAIJsonResponse({ response })]);
    const model = createOpenAIConversationModel({
      apiKey: "test-key",
      model: "gpt-test",
      fetch,
    });

    assert.deepEqual(
      await model.writeResponse(
        { ...validTurnInput, results: [{ status: "reset" }] },
        abortSignal,
      ),
      { status: "model_unavailable", providerCalls: 1 },
    );
  }
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
