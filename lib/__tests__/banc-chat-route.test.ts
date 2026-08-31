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
