// A rejected draft used to be swapped for a canned line. The writer now gets
// one chance to correct it, told exactly what was wrong.
import assert from "node:assert/strict";
import test from "node:test";

import { createOpenAIConversationModel } from "../banc-conversation/openai.ts";
import type { SanitizedOperationResult } from "../banc-conversation/tools.ts";

const results = [{
  status: "property_facts",
  facts: [{
    id: "EA-1",
    title: "Brookside Crescent, Cuffley",
    address: "Brookside Crescent, Cuffley, Hertfordshire",
    department: "sales",
    status: "for_sale",
    price: 895_000,
    priceDisplay: "£895,000",
    bedrooms: 4,
    bathrooms: 2,
    receptions: 3,
    propertyType: "house",
    tenure: "freehold",
    epc: null,
    sqft: null,
    features: ["garden", "parking"],
    summary: "A detached family house in a cul-de-sac.",
  }],
}] as SanitizedOperationResult[];

function modelSaying(drafts: string[]) {
  const bodies: string[] = [];
  const model = createOpenAIConversationModel({
    apiKey: "test-key",
    model: "gpt-test",
    fetch: (async (_url: unknown, init?: RequestInit) => {
      bodies.push(String(init?.body ?? ""));
      const text = drafts[Math.min(bodies.length - 1, drafts.length - 1)];
      return Response.json({
        id: "resp_test",
        object: "response",
        status: "completed",
        output: [{
          id: "msg_test",
          type: "message",
          status: "completed",
          role: "assistant",
          content: [{ type: "output_text", text: JSON.stringify({ response: text }), annotations: [] }],
        }],
      });
    }) as typeof fetch,
  });
  const write = () => model.writeResponse(
    {
      message: "Tell me more about it",
      history: [],
      state: { resultPropertyIds: ["EA-1"], focusedPropertyId: "EA-1", topic: "property_detail" },
      results,
    },
    new AbortController().signal,
  );
  return { bodies, write };
}

const BAD = "Brookside Crescent, Cuffley is a detached family house with a swimming pool and 6 bedrooms.";
const GOOD = "Brookside Crescent, Cuffley is a detached family house in a cul-de-sac with 4 bedrooms, a garden and parking, for sale at £895,000.";

test("a rejected draft is rewritten once, with the reason, and the corrected reply is used", async () => {
  const { bodies, write } = modelSaying([BAD, GOOD]);
  const result = await write();

  assert.equal(result.status, "ok");
  assert.equal(result.status === "ok" ? result.response : "", GOOD);
  assert.equal(result.providerCalls, 2);
  assert.equal(bodies.length, 2);
  assert.equal(JSON.parse(JSON.parse(bodies[0]!).input).rejectedDraft, undefined);
  const retry = JSON.parse(JSON.parse(bodies[1]!).input);
  assert.equal(retry.rejectedDraft, BAD);
  assert.match(retry.rejectionReason, /swimming|pool|6/);
});

test("a first draft that passes costs one call", async () => {
  const { bodies, write } = modelSaying([GOOD]);
  const result = await write();
  assert.equal(result.providerCalls, 1);
  assert.equal(bodies.length, 1);
});

test("if the rewrite is rejected too, the server's own wording is used and no third call is made", async () => {
  const { bodies, write } = modelSaying([BAD, BAD, GOOD]);
  const result = await write();

  assert.equal(result.status, "ok");
  assert.equal(result.providerCalls, 2);
  assert.equal(bodies.length, 2);
  assert.doesNotMatch(result.status === "ok" ? result.response : "", /swimming pool/);
  assert.match(result.status === "ok" ? result.response : "", /Brookside Crescent, Cuffley/);
});

// Both of these were correct answers the fact check threw away, so the visitor
// got "I found 3 properties matching your current requirements."
const searchResults = [{
  status: "search_results",
  total: 3,
  requirements: {
    department: "sales", location: "Goffs Oak", features: ["garage"], propertyTypes: ["house"], tenures: [],
  },
  properties: [
    { id: "A", title: "Bacons Drive, Cuffley", address: "Bacons Drive, Cuffley", price: "£625,000", bedrooms: 3, bathrooms: 1, summary: "An extended semi-detached home with a garage." },
    { id: "B", title: "Highfields, Cuffley", address: "Highfields, Cuffley", price: "£649,995", bedrooms: 3, bathrooms: 2, summary: "A family home with a garage." },
    { id: "C", title: "St. James Road, Goffs Oak", address: "St. James Road, Goffs Oak", price: "£1,500,000", bedrooms: 5, bathrooms: 4, summary: "A detached house with a garage and garden." },
  ],
}] as unknown as SanitizedOperationResult[];

test("a home named by its street alone keeps its own price", async () => {
  const { verifyGroundedResponse } = await import("../banc-conversation/grounding.ts");
  assert.deepEqual(
    verifyGroundedResponse(
      "There are 3 homes matching your search. These include Bacons Drive at £625,000 and Highfields at £649,995, both featuring a garage.",
      searchResults,
    ),
    { ok: true },
  );
  assert.equal(
    verifyGroundedResponse("Highfields is on at £625,000.", searchResults).ok,
    false,
    "a street name must not borrow another home's price",
  );
});

test("'St.' in a road name does not end the sentence", async () => {
  const { verifyGroundedResponse } = await import("../banc-conversation/grounding.ts");
  assert.deepEqual(
    verifyGroundedResponse(
      "There are 3 homes with a garage. These include Bacons Drive at £625,000, Highfields at £649,995, and a 5-bedroom detached house on St. James Road for £1,500,000.",
      searchResults,
    ),
    { ok: true },
  );
});

test("a figure from the listing's own summary may be repeated for that home only", async () => {
  const { verifyGroundedResponse } = await import("../banc-conversation/grounding.ts");
  const results = [{
    ...searchResults[0],
    properties: [
      { id: "C", title: "St. James Road, Goffs Oak", address: "St. James Road, Goffs Oak", price: "£1,500,000", bedrooms: 4, bathrooms: 4, summary: "An impressive 4/5 bedroom detached home." },
      { id: "D", title: "Pembroke Drive, Goffs Oak", address: "Pembroke Drive, Goffs Oak", price: "£634,995", bedrooms: 3, bathrooms: 1, summary: "A three bedroom home." },
    ],
  }] as unknown as SanitizedOperationResult[];
  assert.deepEqual(
    verifyGroundedResponse("St. James Road is an impressive 4/5 bedroom detached home at £1,500,000.", results),
    { ok: true },
  );
  assert.equal(verifyGroundedResponse("Pembroke Drive is a 5 bedroom home.", results).ok, false);
});
