import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getSafePropertyImageUrl } from "../property-detail-view.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";
import {
  createPropertyChatRequest,
  createSingleFlightRunner,
  getPropertyChatMessageView,
  getPropertyChatQuickReplies,
  runPropertyChatTurn,
  type PropertyChatMessage,
} from "../property-chat-submit.ts";
import { buildPropertyHref, type PropertyCardData } from "../property-view.ts";
import { parsePropertyChatPatch } from "../property-chat.ts";
import type {
  PropertyConversationContext,
  PropertyConversationRequest,
} from "../property-conversation/index.ts";

const chatbotSource = readFileSync(
  new URL("../../components/ai/PropertyChatbot.tsx", import.meta.url),
  "utf8",
);

test("legacy parser treats the exact pool question as a feature without a fake location", () => {
  assert.deepEqual(
    parsePropertyChatPatch("Any properties with swimming pools in general?"),
    { features: ["swimming_pool"] },
  );
});

function card(id: string): PropertyCardData {
  return {
    id,
    title: `Property ${id}`,
    address: "Cuffley, Hertfordshire",
    price: "£750,000",
    priceNum: 750000,
    tags: [],
    stats: { beds: 3, baths: 2 },
    images: [`https://med05.expertagent.co.uk/${id}.jpg`],
    summary: "A CRM-supplied description.",
    propertyType: "house",
    department: "sales",
    status: "for_sale",
  };
}

function response(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    response: "I found a matching property.",
    action: "search",
    properties: [card("EA-1")],
    context: { resultPropertyIds: ["EA-1"] },
    ...overrides,
  };
}

function createTurnHarness(
  queuedResponses: Array<unknown | Error>,
  initialContext: PropertyConversationContext = { resultPropertyIds: [] },
) {
  const messages: PropertyChatMessage[] = [];
  const requests: PropertyConversationRequest[] = [];
  const loading: boolean[] = [];
  let context = initialContext;
  let messageId = 0;

  return {
    get context() { return context; },
    loading,
    messages,
    requests,
    async submit(content: string) {
      await runPropertyChatTurn({
        content,
        messages: [...messages],
        context,
        nextMessageId: () => {
          messageId += 1;
          return `message-${messageId}`;
        },
        now: () => new Date("2026-08-29T10:00:00.000Z"),
        request: async (requestBody) => {
          requests.push(requestBody);
          const nextResponse = queuedResponses.shift();
          if (nextResponse instanceof Error) throw nextResponse;
          return nextResponse;
        },
        onUserMessage: (message) => { messages.push(message); },
        onAssistantMessage: (message) => { messages.push(message); },
        onContextChange: (nextContext) => { context = nextContext; },
        onLoadingChange: (nextLoading) => { loading.push(nextLoading); },
      });
    },
  };
}

test("serializes the latest 20 plain history items and always includes structured context", () => {
  const context: PropertyConversationContext = {
    query: {
      ...createDefaultPropertySearchQuery("sales"),
      location: "Cuffley",
    },
    resultPropertyIds: ["EA-1"],
    focusedPropertyId: "EA-1",
  };
  const messages = Array.from({ length: 25 }, (_, index): PropertyChatMessage => ({
    id: `message-${index + 1}`,
    role: index % 2 === 0 ? "user" : "assistant",
    content: `Message ${index + 1}`,
    properties: [card("EA-1")],
    action: "search",
    timestamp: new Date("2026-08-29T10:00:00.000Z"),
  }));

  const request = createPropertyChatRequest("  Tell me more  ", messages, context);

  assert.equal(request.message, "Tell me more");
  assert.equal(request.history.length, 20);
  assert.deepEqual(request.history[0], { role: "assistant", content: "Message 6" });
  assert.deepEqual(request.history[19], { role: "user", content: "Message 25" });
  assert.ok(request.history.every((message) =>
    Object.keys(message).sort().join(",") === "content,role"));
  assert.deepEqual(request.context, context);
});

test("carries response context into the next request and replaces it with a query-less context", async () => {
  const searchedContext = {
    query: {
      ...createDefaultPropertySearchQuery("sales"),
      location: "Cuffley",
    },
    resultPropertyIds: ["EA-1"],
    focusedPropertyId: "EA-1",
  };
  const harness = createTurnHarness([
    response({ context: searchedContext }),
    response({
      response: "I have cleared the search.",
      action: "answer",
      properties: undefined,
      context: { resultPropertyIds: [] },
    }),
  ]);

  await harness.submit("Find homes in Cuffley");
  await harness.submit("Clear that search");

  assert.deepEqual(harness.requests[0]?.context, { resultPropertyIds: [] });
  assert.deepEqual(harness.requests[1]?.context, searchedContext);
  assert.deepEqual(harness.context, { resultPropertyIds: [] });
  assert.deepEqual(harness.requests[1]?.history, [
    { role: "user", content: "Find homes in Cuffley" },
    { role: "assistant", content: "I found a matching property." },
  ]);
});

test("an answer-only response appends text without cards even when context contains result ids", async () => {
  const harness = createTurnHarness([
    response({
      response: "The first home has three bedrooms.",
      action: "answer",
      properties: undefined,
      context: { resultPropertyIds: ["EA-1"], focusedPropertyId: "EA-1" },
    }),
  ]);

  await harness.submit("How many bedrooms does the first one have?");

  const assistantMessage = harness.messages[1];
  assert.equal(assistantMessage?.content, "The first home has three bedrooms.");
  assert.equal(assistantMessage?.properties, undefined);
});

test("cards enter the view only through validated response properties", async () => {
  const validHarness = createTurnHarness([response()]);
  await validHarness.submit("Find me a home");
  assert.deepEqual(
    getPropertyChatMessageView(validHarness.messages[1] as PropertyChatMessage).properties,
    [card("EA-1")],
  );

  const invalidHarness = createTurnHarness([
    response({ properties: [{ id: "EA-2", title: "Incomplete" }] }),
  ], { resultPropertyIds: ["EA-9"] });
  await invalidHarness.submit("Show me another home");

  const invalidMessage = invalidHarness.messages[1] as PropertyChatMessage;
  assert.deepEqual(getPropertyChatMessageView(invalidMessage).properties, []);
  assert.deepEqual(invalidHarness.context, { resultPropertyIds: ["EA-9"] });
  assert.match(invalidMessage.content, /trouble connecting/i);
});

test("contact and unavailable replies produce the correct view decisions", async () => {
  const unavailableCopy =
    "I'm having trouble with the property assistant right now. Please try again shortly or call Banc on 01707 877781.";
  const harness = createTurnHarness([
    response({
      response: "Please contact the Banc team.",
      action: "contact_team",
      properties: undefined,
      context: { resultPropertyIds: [] },
    }),
    response({
      response: unavailableCopy,
      action: "unavailable",
      properties: undefined,
      context: { resultPropertyIds: [] },
    }),
  ]);

  await harness.submit("I need a person");
  await harness.submit("Try again");

  assert.equal(
    getPropertyChatMessageView(harness.messages[1] as PropertyChatMessage).showContactAction,
    true,
  );
  assert.deepEqual(getPropertyChatMessageView(harness.messages[1] as PropertyChatMessage).properties, []);
  assert.equal(
    getPropertyChatMessageView(harness.messages[3] as PropertyChatMessage).showContactAction,
    false,
  );
  assert.equal(harness.messages[3]?.content, unavailableCopy);
});

test("quick replies switch from search and contact choices to one result detail prompt", () => {
  assert.deepEqual(getPropertyChatQuickReplies({ resultPropertyIds: [] }), [
    "I want to buy a 3-bed in Cuffley",
    "I'm looking to rent",
    "I need to speak to the Banc team",
  ]);
  assert.deepEqual(getPropertyChatQuickReplies({ resultPropertyIds: ["EA-1"] }), [
    "Tell me about the first property",
  ]);
});

test("same-tick submissions execute one real UI turn and expose loading transitions", async () => {
  const runSingleFlight = createSingleFlightRunner();
  const userMessages: PropertyChatMessage[] = [];
  const assistantMessages: PropertyChatMessage[] = [];
  const loading: boolean[] = [];
  let releaseRequest: (() => void) | undefined;
  let requests = 0;
  let messageId = 0;
  const submit = () => runSingleFlight(() => runPropertyChatTurn({
    content: "Find a home",
    messages: [],
    context: { resultPropertyIds: [] },
    nextMessageId: () => {
      messageId += 1;
      return `message-${messageId}`;
    },
    request: async () => {
      requests += 1;
      await new Promise<void>((resolve) => { releaseRequest = resolve; });
      return response();
    },
    onUserMessage: (message) => { userMessages.push(message); },
    onAssistantMessage: (message) => { assistantMessages.push(message); },
    onContextChange: () => undefined,
    onLoadingChange: (isLoading) => { loading.push(isLoading); },
  }));

  const enterSubmission = submit();
  const clickSubmission = submit();

  assert.equal(await clickSubmission, false);
  assert.equal(requests, 1);
  assert.equal(userMessages.length, 1);
  assert.deepEqual(loading, [true]);
  releaseRequest?.();
  assert.equal(await enterSubmission, true);
  assert.equal(assistantMessages.length, 1);
  assert.deepEqual(loading, [true, false]);
});

test("a failed request releases loading and allows a successful retry", async () => {
  const harness = createTurnHarness([
    new Error("network failed"),
    response({ response: "The retry worked." }),
  ]);
  const runSingleFlight = createSingleFlightRunner();

  assert.equal(await runSingleFlight(() => harness.submit("Find a home")), true);
  assert.equal(await runSingleFlight(() => harness.submit("Try again")), true);

  assert.equal(harness.requests.length, 2);
  assert.deepEqual(harness.loading, [true, false, true, false]);
  assert.match(harness.messages[1]?.content ?? "", /trouble connecting/i);
  assert.equal(harness.messages[3]?.content, "The retry worked.");
});

test("the single-flight runner releases its lock after an action rejects", async () => {
  const runSingleFlight = createSingleFlightRunner();
  let completed = 0;

  await assert.rejects(
    runSingleFlight(async () => { throw new Error("request failed"); }),
    /request failed/,
  );
  assert.equal(await runSingleFlight(async () => { completed += 1; }), true);
  assert.equal(completed, 1);
});

test("production property links and images stay canonical and safe", () => {
  assert.equal(buildPropertyHref("sales", "EA/1"), "/sales/properties/EA%2F1");
  assert.equal(
    getSafePropertyImageUrl(" https://med05.expertagent.co.uk/photo.jpg "),
    "https://med05.expertagent.co.uk/photo.jpg",
  );
  assert.equal(getSafePropertyImageUrl("javascript:alert(1)"), null);
});

test("the React component wires the executable UI logic and accessible dialog primitives", () => {
  assert.match(chatbotSource, /runPropertyChatTurn/);
  assert.match(chatbotSource, /getPropertyChatMessageView/);
  assert.match(chatbotSource, /getPropertyChatQuickReplies/);
  assert.match(chatbotSource, /createSingleFlightRunner/);
  assert.match(chatbotSource, /startModalFocusLifecycle/);
  assert.match(chatbotSource, /buildPropertyHref/);
  assert.match(chatbotSource, /getSafePropertyImageUrl/);
  assert.match(chatbotSource, /role="dialog"/);
  assert.match(chatbotSource, /aria-modal="true"/);
  assert.match(chatbotSource, /aria-labelledby="property-chat-title"/);
  assert.match(chatbotSource, /role="log"/);
  assert.match(chatbotSource, /aria-live="polite"/);
  assert.match(chatbotSource, /aria-busy=\{isLoading\}/);
  assert.match(chatbotSource, /htmlFor="property-chat-input"/);
  assert.match(chatbotSource, /id="property-chat-input"/);
});
