import assert from "node:assert/strict";
import test from "node:test";

import { BANC_CONTACT } from "../banc-contact.ts";
import {
  createInitialConversationState,
  type ConversationRequest,
  type PropertyConversationState,
} from "../banc-conversation/index.ts";
import {
  createSingleFlightRunner,
  createPropertyChatRequest,
  getPropertyChatMessageView,
  runPropertyChatTurn,
  type PropertyChatMessage,
} from "../property-chat-submit.ts";

const emptyConversationState = createInitialConversationState();

function createTurnHarness(
  response: unknown,
  initialContext: PropertyConversationState = emptyConversationState,
) {
  const messages: PropertyChatMessage[] = [];
  const requests: ConversationRequest[] = [];
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
        now: () => new Date("2026-08-31T10:00:00.000Z"),
        request: async (requestBody) => {
          requests.push(requestBody);
          return response;
        },
        onUserMessage: (message) => { messages.push(message); },
        onAssistantMessage: (message) => { messages.push(message); },
        onContextChange: (nextContext) => { context = nextContext; },
        onLoadingChange: (isLoading) => { loading.push(isLoading); },
      });
    },
  };
}

test("carries only parsed trusted sources and handoff links into the assistant message", async () => {
  const harness = createTurnHarness({
    response: "The Banc guide explains the next steps.",
    action: "answer",
    sources: [{ title: "Buyers guide", href: "/sales/buyers-guide" }],
    handoff: {
      callHref: BANC_CONTACT.callHref,
      whatsappHref: BANC_CONTACT.whatsappHref,
    },
    context: emptyConversationState,
  });

  await harness.submit("What happens after my offer?");

  const assistantMessage = harness.messages[1];
  assert.deepEqual(assistantMessage?.sources, [
    { title: "Buyers guide", href: "/sales/buyers-guide" },
  ]);
  assert.equal(assistantMessage?.handoff?.callHref, BANC_CONTACT.callHref);
  assert.equal(assistantMessage?.handoff?.whatsappHref, BANC_CONTACT.whatsappHref);
});

test("keeps context and structured fields unchanged when the public response is invalid", async () => {
  const context = createInitialConversationState();
  const harness = createTurnHarness({
    response: "Call https://untrusted.example.com.",
    action: "answer",
    sources: [{ title: "Untrusted", href: "https://untrusted.example.com" }],
    handoff: {
      callHref: BANC_CONTACT.callHref,
      whatsappHref: BANC_CONTACT.whatsappHref,
    },
    context: { ...context, topic: "handoff" },
  }, context);

  await harness.submit("Can I speak to someone?");

  assert.deepEqual(harness.context, context);
  assert.equal(harness.messages[1]?.sources, undefined);
  assert.equal(harness.messages[1]?.handoff, undefined);
  assert.match(harness.messages[1]?.content ?? "", /trouble connecting/i);
  assert.deepEqual(harness.loading, [true, false]);
});

test("serializes the latest 20 prose messages with the current in-memory context", () => {
  const context = {
    ...createInitialConversationState(),
    topic: "banc_knowledge" as const,
  };
  const messages = Array.from({ length: 25 }, (_, index): PropertyChatMessage => ({
    id: `message-${index + 1}`,
    role: index % 2 === 0 ? "user" : "assistant",
    content: `Message ${index + 1}`,
    timestamp: new Date("2026-08-31T10:00:00.000Z"),
  }));

  const request = createPropertyChatRequest("  Tell me more  ", messages, context);

  assert.equal(request.message, "Tell me more");
  assert.equal(request.history.length, 20);
  assert.deepEqual(request.history[0], { role: "assistant", content: "Message 6" });
  assert.deepEqual(request.history[19], { role: "user", content: "Message 25" });
  assert.deepEqual(request.context, context);
});

test("same-tick submissions run one chat turn while a request is in flight", async () => {
  const runSingleFlight = createSingleFlightRunner();
  let release: (() => void) | undefined;
  let turns = 0;

  const first = runSingleFlight(async () => {
    turns += 1;
    await new Promise<void>((resolve) => { release = resolve; });
  });
  const second = await runSingleFlight(async () => { turns += 1; });

  assert.equal(second, false);
  assert.equal(turns, 1);
  release?.();
  assert.equal(await first, true);
});

test("same-tick chat submissions make one request and publish one logical turn", async () => {
  const runSingleFlight = createSingleFlightRunner();
  const messages: PropertyChatMessage[] = [];
  const loading: boolean[] = [];
  let releaseRequest: (() => void) | undefined;
  let messageId = 0;
  let requests = 0;
  let context = createInitialConversationState();

  const submit = () => runSingleFlight(() => runPropertyChatTurn({
    content: "Find a home",
    messages: [],
    context,
    nextMessageId: () => {
      messageId += 1;
      return `message-${messageId}`;
    },
    request: async () => {
      requests += 1;
      await new Promise<void>((resolve) => { releaseRequest = resolve; });
      return {
        response: "I found a suitable home.",
        action: "answer",
        context: createInitialConversationState(),
      };
    },
    onUserMessage: (message) => { messages.push(message); },
    onAssistantMessage: (message) => { messages.push(message); },
    onContextChange: (nextContext) => { context = nextContext; },
    onLoadingChange: (isLoading) => { loading.push(isLoading); },
  }));

  const first = submit();
  const duplicate = submit();

  assert.equal(await duplicate, false);
  assert.equal(requests, 1);
  assert.deepEqual(messages.map(({ role }) => role), ["user"]);
  assert.deepEqual(loading, [true]);

  assert.ok(releaseRequest);
  releaseRequest();

  assert.equal(await first, true);
  assert.equal(requests, 1);
  assert.deepEqual(messages.map(({ role }) => role), ["user", "assistant"]);
  assert.deepEqual(loading, [true, false]);
});

test("the single-flight runner releases its lock after a rejected chat turn", async () => {
  const runSingleFlight = createSingleFlightRunner();
  let retriedTurns = 0;

  await assert.rejects(
    runSingleFlight(async () => { throw new Error("request failed"); }),
    /request failed/,
  );
  assert.equal(await runSingleFlight(async () => { retriedTurns += 1; }), true);
  assert.equal(retriedTurns, 1);
});

test("returns cloned trusted view fields without deriving a generic contact action", () => {
  const view = getPropertyChatMessageView({
    id: "assistant-1",
    role: "assistant",
    content: "Here are the next steps.",
    action: "contact_team",
    sources: [{ title: "Buyers guide", href: "/sales/buyers-guide" }],
    handoff: {
      callHref: BANC_CONTACT.callHref,
      whatsappHref: BANC_CONTACT.whatsappHref,
    },
    timestamp: new Date("2026-08-31T10:00:00.000Z"),
  });

  assert.deepEqual(view.sources, [{ title: "Buyers guide", href: "/sales/buyers-guide" }]);
  assert.deepEqual(view.handoff, {
    callHref: BANC_CONTACT.callHref,
    whatsappHref: BANC_CONTACT.whatsappHref,
  });
  assert.equal("showContactAction" in view, false);
});

test("shows the server's rate-limit copy instead of the generic connection error", async () => {
  const { PropertyChatRequestError, runPropertyChatTurn, createInitialConversationState } =
    await import("../property-chat-submit.ts").then(async (module) => ({
      ...module,
      ...(await import("../banc-conversation/contracts.ts")),
    }));
  const assistant: string[] = [];

  await runPropertyChatTurn({
    content: "hello",
    messages: [],
    context: createInitialConversationState(),
    nextMessageId: () => "id",
    request: async () => {
      throw new PropertyChatRequestError("You're sending messages quickly. Please wait a moment and try again.");
    },
    onUserMessage: () => {},
    onAssistantMessage: (message) => assistant.push(message.content),
    onContextChange: () => {},
    onLoadingChange: () => {},
  });

  assert.deepEqual(assistant, ["You're sending messages quickly. Please wait a moment and try again."]);

  assistant.length = 0;
  await runPropertyChatTurn({
    content: "hello",
    messages: [],
    context: createInitialConversationState(),
    nextMessageId: () => "id",
    request: async () => {
      throw new Error("SECRET STACK");
    },
    onUserMessage: () => {},
    onAssistantMessage: (message) => assistant.push(message.content),
    onContextChange: () => {},
    onLoadingChange: () => {},
  });
  assert.match(assistant[0] ?? "", /trouble connecting/);
  assert.doesNotMatch(assistant[0] ?? "", /SECRET/);
});
