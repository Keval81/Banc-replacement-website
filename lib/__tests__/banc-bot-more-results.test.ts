// SanSan, 13 Nov 2026: "there are 5" with 3 shown, then "show me the other 2"
// showed the same 3. The bot now keeps its place in the results.
import assert from "node:assert/strict";
import test from "node:test";

import { parseConversationResponse, propertyConversationStateSchema } from "../banc-conversation/contracts.ts";
import { verifyGroundedResponse } from "../banc-conversation/grounding.ts";
import { createBancConversationHandler, isMoreResultsRequest } from "../banc-conversation/handler.ts";
import { createOpenAIConversationModel } from "../banc-conversation/openai.ts";
import { BANC_INTENT_INSTRUCTIONS, BANC_RESPONSE_INSTRUCTIONS } from "../banc-conversation/prompt.ts";
import { createConversationTools, sanitizeOperationResult } from "../banc-conversation/tools.ts";
import { getPropertyChatQuickReplies } from "../property-chat-submit.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";
import type { PropertyCardData } from "../property-view.ts";

const card = (n: number): PropertyCardData => ({
  id: `H${n}`,
  title: `Home ${n} Road, Cuffley`,
  address: `Home ${n} Road, Cuffley, Hertfordshire`,
  price: `£${300 + n},000`,
  priceNum: (300 + n) * 1000,
  tags: [],
  stats: { beds: 2, baths: 1 },
  images: [],
  summary: `Summary of home ${n}.`,
  propertyType: "house",
  department: "sales",
  status: "for_sale",
});
const five = [1, 2, 3, 4, 5].map(card);
const query = { ...createDefaultPropertySearchQuery("sales"), location: "Cuffley", minBedrooms: 2, maxBedrooms: 2 };

function tools(all: PropertyCardData[] = five) {
  return createConversationTools({
    portfolio: {
      search: async (requested) => ({
        query: requested,
        properties: all,
        total: all.length,
        page: 1,
        pageSize: 24,
        totalPages: 1,
        lastSyncedAt: null,
      }),
      getFacts: async () => [],
    },
    knowledge: { search: async () => [] },
  });
}

const afterFirstThree = {
  query,
  resultPropertyIds: ["H1", "H2", "H3"],
  resultOffset: 0,
  resultTotal: 5,
  topic: "property_search" as const,
};

test("a first search says how many it is showing and remembers the total", async () => {
  const result = await tools().execute({
    intent: { type: "update_property_search", mutation: { location: { operation: "set", value: "Cuffley" }, department: { operation: "set", value: "sales" } } },
    message: "2 bed in Cuffley to buy",
    state: { resultPropertyIds: [], topic: "property_search" },
  });
  assert.equal(result.status, "search_results");
  if (result.status !== "search_results") return;
  assert.deepEqual(result.shown, { from: 1, to: 3 });
  assert.equal(result.state.resultTotal, 5);
  assert.equal(result.state.resultOffset, 0);
});

test("asking for the others shows the next homes, not the same three", async () => {
  const result = await tools().execute({ intent: { type: "show_more_results" }, message: "show me the other 2", state: afterFirstThree });
  assert.equal(result.status, "search_results");
  if (result.status !== "search_results") return;
  assert.deepEqual(result.properties.map((property) => property.id), ["H4", "H5"]);
  assert.deepEqual(result.shown, { from: 4, to: 5 });
  assert.deepEqual(result.state.resultPropertyIds, ["H4", "H5"]);
  assert.equal(result.state.resultOffset, 3);
  assert.equal(result.total, 5);
});

test("once every home has been shown it says so instead of repeating", async () => {
  const result = await tools().execute({
    intent: { type: "show_more_results" },
    message: "any more?",
    state: { ...afterFirstThree, resultPropertyIds: ["H4", "H5"], resultOffset: 3 },
  });
  assert.equal(result.status, "search_results");
  if (result.status !== "search_results") return;
  assert.equal(result.allShown, true);
  assert.deepEqual(result.properties, []);
  assert.deepEqual(result.state.resultPropertyIds, ["H4", "H5"], "the homes on screen stay the active ones");
});

test("with no search yet, asking for more asks what they are looking for", async () => {
  const result = await tools().execute({ intent: { type: "show_more_results" }, message: "show me more", state: { resultPropertyIds: [], topic: "property_search" } });
  assert.equal(result.status, "clarification_required");
});

test("everyday ways of asking for the rest are recognised, and 'more about' is not", () => {
  for (const message of [
    "can you show me the other 2?",
    "show me the rest",
    "Show more homes",
    "what about the others",
    "see the remaining ones",
    "next ones please",
    "any more?",
    "are there any others",
    "show me all 5",
  ]) assert.equal(isMoreResultsRequest(message), true, message);
  for (const message of [
    "tell me more about the first one",
    "show me more about Brookside Crescent",
    "more details on the second",
    "show me homes with a garage",
    "any other areas you cover?",
  ]) assert.equal(isMoreResultsRequest(message), false, message);
});

test("the handler goes straight to the next homes without asking the model what was meant", async () => {
  let asked = 0;
  const handler = createBancConversationHandler({
    model: {
      selectPlan: async () => { asked += 1; return { status: "interpretation_invalid", providerCalls: 1 }; },
      writeResponse: async () => ({ status: "ok", providerCalls: 1, response: "Here are the other 2 of the 5 homes." }),
    },
    tools: tools(),
    logger: () => undefined,
  });
  const response = await handler({ message: "can you show me the other 2?", history: [], context: afterFirstThree });

  assert.equal(asked, 0);
  assert.equal(response.action, "search_results");
  assert.deepEqual(response.properties?.map((property) => property.id), ["H4", "H5"]);
  assert.equal(response.context.resultOffset, 3);
  assert.ok(parseConversationResponse(JSON.parse(JSON.stringify(response))), "survives the wire format");
});

test("the writer is told which homes are on screen and may say so", async () => {
  const trusted = await tools().execute({ intent: { type: "show_more_results" }, message: "the others", state: afterFirstThree });
  const sanitized = [sanitizeOperationResult(trusted)];
  let sent = "";
  const reply = "Here are the other 2 of the 5 homes: Home 4 Road at £304,000 and Home 5 Road at £305,000.";
  const model = createOpenAIConversationModel({
    apiKey: "k",
    model: "m",
    fetch: (async (_url: unknown, init?: RequestInit) => {
      sent = String(init?.body ?? "");
      return Response.json({ id: "r", object: "response", status: "completed", output: [{ id: "m", type: "message", status: "completed", role: "assistant", content: [{ type: "output_text", text: JSON.stringify({ response: reply }), annotations: [] }] }] });
    }) as typeof fetch,
  });
  const written = await model.writeResponse({ message: "the others", history: [], state: afterFirstThree, results: sanitized }, new AbortController().signal);

  assert.match(JSON.parse(sent).input, /homes 4 to 5 of 5/);
  assert.equal(written.status === "ok" ? written.response : "", reply);
  assert.deepEqual(verifyGroundedResponse("These are homes 4 and 5 of the 5.", sanitized), { ok: true });
});

test("the place in the results survives a round trip, and the suggestion only shows when there are more", () => {
  const parsed = propertyConversationStateSchema.parse({ ...afterFirstThree, resultOffset: 3, resultPropertyIds: ["H4", "H5"] });
  assert.equal(parsed.resultOffset, 3);
  assert.equal(parsed.resultTotal, 5);

  assert.ok(getPropertyChatQuickReplies(afterFirstThree).includes("Show more homes"));
  assert.ok(!getPropertyChatQuickReplies({ ...afterFirstThree, resultOffset: 3, resultPropertyIds: ["H4", "H5"] }).includes("Show more homes"));
  assert.match(BANC_INTENT_INSTRUCTIONS, /show_more_results/);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /showing/);
});
