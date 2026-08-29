import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  parsePropertyConversationRequest,
  parsePropertyConversationResponse,
  type PropertyConversationContext,
} from "../property-conversation/index.ts";
import { createSingleFlightRunner } from "../property-chat-submit.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";
import type { PropertyCardData } from "../property-view.ts";

const chatbotSource = readFileSync(
  new URL("../../components/ai/PropertyChatbot.tsx", import.meta.url),
  "utf8",
);

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

test("the public route contract accepts the latest structured context and only plain capped history", () => {
  const context: PropertyConversationContext = {
    query: {
      ...createDefaultPropertySearchQuery("sales"),
      location: "Cuffley",
    },
    resultPropertyIds: ["EA-1"],
    focusedPropertyId: "EA-1",
    resultFingerprint: "sales:EA-1",
  };
  const history = Array.from({ length: 20 }, (_, index) => ({
    role: index % 2 === 0 ? "user" as const : "assistant" as const,
    content: `Message ${index + 1}`,
  }));
  const request = { message: "Tell me about the first one", history, context };

  assert.deepEqual(parsePropertyConversationRequest(request), request);
  assert.equal(
    parsePropertyConversationRequest({
      ...request,
      history: [...history, { role: "user", content: "Message 21" }],
    }),
    null,
  );
  assert.equal(
    parsePropertyConversationRequest({
      ...request,
      history: [{ role: "user", content: "Hello", properties: [card("EA-1")] }],
    }),
    null,
  );
});

test("the public response contract supports answer-only replies and context replacement without a query", () => {
  const response = parsePropertyConversationResponse({
    response: "The first home has three bedrooms.",
    action: "answer",
    context: { resultPropertyIds: ["EA-1"], focusedPropertyId: "EA-1" },
  });

  assert.deepEqual(response, {
    response: "The first home has three bedrooms.",
    action: "answer",
    context: { resultPropertyIds: ["EA-1"], focusedPropertyId: "EA-1" },
  });
  assert.equal(response !== null && "properties" in response, false);
});

test("the public response contract rejects unvalidated cards", () => {
  assert.equal(
    parsePropertyConversationResponse({
      response: "Here is a result.",
      action: "search",
      properties: [{ id: "EA-1", title: "Incomplete card" }],
      context: { resultPropertyIds: ["EA-1"] },
    }),
    null,
  );
  assert.deepEqual(
    parsePropertyConversationResponse({
      response: "Here is a result.",
      action: "search",
      properties: [card("EA-1")],
      context: { resultPropertyIds: ["EA-1"] },
    })?.properties,
    [card("EA-1")],
  );
});

test("single-flight submission creates one request and one user message for a same-tick duplicate", async () => {
  const runSingleFlight = createSingleFlightRunner();
  let finishFirst: (() => void) | undefined;
  let requests = 0;
  let userMessages = 0;
  const submit = () => runSingleFlight(async () => {
    userMessages += 1;
    requests += 1;
    await new Promise<void>((resolve) => { finishFirst = resolve; });
  });

  const enterSubmission = submit();
  const clickSubmission = submit();

  assert.equal(await clickSubmission, false);
  assert.equal(requests, 1);
  assert.equal(userMessages, 1);
  finishFirst?.();
  assert.equal(await enterSubmission, true);
});

test("the chatbot uses the conversational contract and always sends replaceable context", () => {
  assert.match(chatbotSource, /PropertyConversationContext/);
  assert.match(chatbotSource, /PropertyConversationResponse/);
  assert.match(chatbotSource, /parsePropertyConversationResponse/);
  assert.doesNotMatch(chatbotSource, /ChatSearchContext|PropertyChatResponse/);
  assert.match(
    chatbotSource,
    /useState<PropertyConversationContext>\(\{ resultPropertyIds: \[\] \}\)/,
  );
  assert.match(chatbotSource, /history:\s*messages\s*\.slice\(-20\)\s*\.map/);
  assert.match(chatbotSource, /context:\s*conversationContext/);
  assert.doesNotMatch(chatbotSource, /searchContext === undefined/);
  assert.match(
    chatbotSource,
    /parsePropertyConversationResponse\(await response\.json\(\)\)/,
  );
  assert.match(chatbotSource, /setConversationContext\(data\.context\)/);
  assert.doesNotMatch(chatbotSource, /data\.context !== undefined/);
});

test("the chatbot renders cards only from validated response properties", () => {
  assert.match(chatbotSource, /properties:\s*data\.properties/);
  assert.match(chatbotSource, /message\.properties\.map\(\(property\)/);
  assert.doesNotMatch(
    chatbotSource,
    /resultPropertyIds\.(?:map|forEach)|conversationContext\.(?:query|focusedPropertyId)[\s\S]*properties/,
  );
  assert.match(
    chatbotSource,
    /href=\{buildPropertyHref\(\s*property\.department,\s*property\.id,?\s*\)\}/,
  );
  assert.match(
    chatbotSource,
    /getSafePropertyImageUrl\(\s*property\.images\?\.\[0\] \?\? "",?\s*\)/,
  );
  assert.doesNotMatch(chatbotSource, /getSafeExternalUrl/);
});

test("the chatbot keeps the Banc contact action and readable unavailable fallback", () => {
  assert.match(chatbotSource, /message\.action === "contact_team"/);
  assert.match(chatbotSource, /href="\/contact"/);
  assert.match(chatbotSource, /Contact the Banc team/);
  assert.match(
    chatbotSource,
    /I'm having trouble connecting\. Please try again or call us at 01707 877781\./,
  );
});

test("the chatbot invites searches and listing questions with result-aware quick replies", () => {
  assert.match(chatbotSource, /search our current homes/i);
  assert.match(chatbotSource, /questions? about (?:a|the) listing/i);
  assert.match(chatbotSource, /I want to buy a 3-bed in Cuffley/);
  assert.match(chatbotSource, /I need to speak to the Banc team/);
  assert.match(chatbotSource, /conversationContext\.resultPropertyIds\.length > 0/);
  assert.match(chatbotSource, /Compare the properties|Tell me about the first property/);
});

test("the chatbot preserves modal, focus, loading and input accessibility", () => {
  assert.match(chatbotSource, /startModalFocusLifecycle/);
  assert.match(chatbotSource, /role="dialog"/);
  assert.match(chatbotSource, /aria-modal="true"/);
  assert.match(chatbotSource, /aria-labelledby="property-chat-title"/);
  assert.match(chatbotSource, /role="log"/);
  assert.match(chatbotSource, /aria-live="polite"/);
  assert.match(chatbotSource, /aria-busy=\{isLoading\}/);
  assert.match(chatbotSource, /htmlFor="property-chat-input"/);
  assert.match(chatbotSource, /id="property-chat-input"/);
  assert.match(chatbotSource, /getInitialFocusElement: \(\) => inputRef\.current/);
  assert.match(chatbotSource, /restoreFocus: \(\) => helpTriggerRef\.current\?\.focus\(\)/);
  assert.match(chatbotSource, /disabled=\{isLoading \|\| !input\.trim\(\)\}/);
});

test("the chatbot keeps monotonically increasing message ids", () => {
  assert.match(chatbotSource, /messageIdRef\.current \+= 1/);
  assert.match(chatbotSource, /`property-chat-\$\{messageIdRef\.current\}`/);
  assert.equal(
    [...chatbotSource.matchAll(/id:\s*nextMessageId\(\)/g)].length,
    3,
  );
});
