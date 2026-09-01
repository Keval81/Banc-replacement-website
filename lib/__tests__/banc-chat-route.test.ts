import assert from "node:assert/strict";
import test from "node:test";

import type {
  ConversationRequest,
  ConversationResponse,
} from "../banc-conversation/contracts.ts";
import { createBancChatPost } from "../banc-conversation/chat-route.ts";

const validRequest: ConversationRequest = {
  message: "Find me a home",
  history: [],
};

const validResponse: ConversationResponse = {
  response: "Which location would you like to search?",
  action: "clarify",
  context: { resultPropertyIds: [], topic: "property_search" },
};

function jsonRequest(value: unknown): Request {
  return new Request("https://banc.test/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
}

test("POST returns 400 for malformed JSON and invalid conversation requests", async () => {
  let handlerCalls = 0;
  const POST = createBancChatPost({
    createConversationHandler: () => async () => {
      handlerCalls += 1;
      return validResponse;
    },
    createRequestId: () => "c5e8db87-4694-4446-84bb-e386845cbf33",
  });
  const malformed = new Request("https://banc.test/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });

  const malformedResponse = await POST(malformed);
  const invalidResponse = await POST(jsonRequest({}));

  assert.equal(malformedResponse.status, 400);
  assert.deepEqual(await malformedResponse.json(), { error: "Invalid chat request." });
  assert.equal(invalidResponse.status, 400);
  assert.deepEqual(await invalidResponse.json(), { error: "Invalid chat request." });
  assert.equal(handlerCalls, 0);
});

test("POST gives each valid request a fresh UUID and returns only validated responses", async () => {
  const requestIds = [
    "c5e8db87-4694-4446-84bb-e386845cbf33",
    "58b067aa-3936-485f-b11c-90a1f2a1ebf3",
  ];
  const receivedIds: string[] = [];
  const receivedRequests: ConversationRequest[] = [];
  let dependencyConstructions = 0;
  const POST = createBancChatPost({
    createConversationHandler: () => {
      dependencyConstructions += 1;
      return async (request, requestId) => {
        receivedRequests.push(request);
        receivedIds.push(requestId);
        return validResponse;
      };
    },
    createRequestId: () => requestIds.shift() ?? "unexpected-id",
  });

  const first = await POST(jsonRequest(validRequest));
  const second = await POST(jsonRequest(validRequest));

  assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), validResponse);
  assert.equal(second.status, 200);
  assert.deepEqual(await second.json(), validResponse);
  assert.deepEqual(receivedIds, [
    "c5e8db87-4694-4446-84bb-e386845cbf33",
    "58b067aa-3936-485f-b11c-90a1f2a1ebf3",
  ]);
  assert.deepEqual(receivedRequests, [validRequest, validRequest]);
  assert.equal(dependencyConstructions, 1);
});

test("POST rejects an invalid handler payload instead of publishing it", async () => {
  const POST = createBancChatPost({
    createConversationHandler: () => async () => ({
      ...validResponse,
      response: "See https://unsafe.example/SECRET",
    }),
    createRequestId: () => "c5e8db87-4694-4446-84bb-e386845cbf33",
  });

  const response = await POST(jsonRequest(validRequest));

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: "Conversation service unavailable.",
  });
});

test("POST throttles a busy visitor with 429 and Retry-After before calling the handler", async () => {
  let handlerCalls = 0;
  const decisions = [
    { allowed: true, retryAfterSeconds: 0 },
    { allowed: false, retryAfterSeconds: 42 },
  ];
  const keys: string[] = [];
  const POST = createBancChatPost({
    createConversationHandler: () => async () => {
      handlerCalls += 1;
      return validResponse;
    },
    createRequestId: () => "c5e8db87-4694-4446-84bb-e386845cbf33",
    rateLimiter: {
      check: (key) => {
        keys.push(key);
        return decisions.shift() ?? { allowed: false, retryAfterSeconds: 1 };
      },
    },
  });
  const request = () =>
    new Request("https://banc.test/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "203.0.113.9, 10.0.0.1",
      },
      body: JSON.stringify(validRequest),
    });

  const first = await POST(request());
  const second = await POST(request());

  assert.equal(first.status, 200);
  assert.equal(first.headers.get("cache-control"), "no-store");
  assert.equal(second.status, 429);
  assert.equal(second.headers.get("retry-after"), "42");
  assert.deepEqual(await second.json(), {
    error: "You're sending messages quickly. Please wait a moment and try again.",
  });
  assert.deepEqual(keys, ["ip:203.0.113.9", "ip:203.0.113.9"]);
  assert.equal(handlerCalls, 1);
});

test("POST rejects oversized bodies and converts handler exceptions into 503 without leaking details", async () => {
  const logged: unknown[] = [];
  const POST = createBancChatPost({
    createConversationHandler: () => async () => {
      throw new Error("SECRET DATABASE URL");
    },
    createRequestId: () => "c5e8db87-4694-4446-84bb-e386845cbf33",
    rateLimiter: { check: () => ({ allowed: true, retryAfterSeconds: 0 }) },
    logger: (event) => logged.push(event),
  });

  const oversized = new Request("https://banc.test/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...validRequest, message: "x".repeat(70_000) }),
  });
  const oversizedResponse = await POST(oversized);
  assert.equal(oversizedResponse.status, 413);

  const failing = await POST(jsonRequest(validRequest));
  assert.equal(failing.status, 503);
  const payload = await failing.text();
  assert.doesNotMatch(payload, /SECRET/);
  assert.deepEqual(JSON.parse(payload), { error: "Conversation service unavailable." });
  assert.deepEqual(logged, [{
    category: "handler_error",
    requestId: "c5e8db87-4694-4446-84bb-e386845cbf33",
  }]);
});
