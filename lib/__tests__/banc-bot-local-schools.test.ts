// Schools were the first thing a real visitor asked on 13 Nov 2026 and the bot dead-ended.
// The answers come from the Department for Education's schools register, never from the model.
import assert from "node:assert/strict";
import test from "node:test";

import { areaGuides } from "../area-guides.ts";
import { APPROVED_BANC_DOCUMENTS } from "../banc-content/approved-content.ts";
import { verifyGroundedResponse } from "../banc-conversation/grounding.ts";
import { createInitialConversationState } from "../banc-conversation/contracts.ts";
import {
  createBancConversationHandler,
  INTERPRETATION_CLARIFICATION,
  SCHOOLS_AREA_CLARIFICATION,
} from "../banc-conversation/handler.ts";
import { createBancKnowledgeSearch } from "../banc-conversation/knowledge.ts";
import { createOpenAIConversationModel } from "../banc-conversation/openai.ts";
import {
  BANC_INTENT_INSTRUCTIONS,
  BANC_RESPONSE_INSTRUCTIONS,
} from "../banc-conversation/prompt.ts";
import {
  KNOWLEDGE_NOT_COVERED_COPY,
  sanitizeOperationResult,
  type SanitizedOperationResult,
} from "../banc-conversation/tools.ts";
import { describeNearestSchools, nearestSchools } from "../local-schools.ts";
import { mapPropertyFacts, type PropertyFacts } from "../property-facts.ts";
import type { DbProperty } from "../supabase.ts";

const BROOKSIDE_CRESCENT = { lat: 51.715634, lng: -0.112294 };

const facts = (overrides: Partial<PropertyFacts> = {}): PropertyFacts => ({
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
  ...overrides,
});

const NEARBY = [
  "Cuffley School (primary, 0.8 miles)",
  "Goffs Oak Primary & Nursery School (primary, 0.8 miles)",
  "Goffs Academy (secondary, 2.4 miles)",
];

const withSchools = (): SanitizedOperationResult[] => [
  { status: "property_facts", facts: [facts({ nearbySchools: NEARBY })] } as SanitizedOperationResult,
];

test("finds the nearest primary and secondary schools to a point, nearest first", () => {
  const schools = nearestSchools(BROOKSIDE_CRESCENT.lat, BROOKSIDE_CRESCENT.lng);

  const primaries = schools.filter((school) => school.phase === "primary");
  const secondaries = schools.filter((school) => school.phase !== "primary");
  assert.equal(primaries.length, 3);
  assert.equal(secondaries.length, 2);
  assert.ok(primaries.some((school) => school.name === "Cuffley School"));
  assert.equal(secondaries[0]?.name, "Goffs Academy");
  assert.deepEqual(
    primaries.map((school) => school.distanceMiles),
    [...primaries.map((school) => school.distanceMiles)].sort((a, b) => a - b),
  );
  assert.ok(primaries.every((school) => school.distanceMiles < 2));
});

test("says nothing about schools for a point outside the area the register copy covers", () => {
  assert.deepEqual(nearestSchools(53.4808, -2.2426), []);
});

test("describes each school as name, phase and distance to one decimal place", () => {
  const [first] = describeNearestSchools(BROOKSIDE_CRESCENT.lat, BROOKSIDE_CRESCENT.lng);
  assert.match(first ?? "", /^.+ \(primary, \d\.\d miles\)$/);
});

test("a listing with map coordinates carries its nearest schools", () => {
  const row = {
    expert_agent_id: "EA-1", is_active: true, search_property_type: "house", search_tenure: "freehold",
    search_features: [], title: "Brookside Crescent, Cuffley", address: "Brookside Crescent, Cuffley",
    price: 895_000, status: "for_sale", department: "sales", bedrooms: 4, bathrooms: 2, receptions: 3,
    description: "A family house.", features: [], latitude: BROOKSIDE_CRESCENT.lat, longitude: BROOKSIDE_CRESCENT.lng,
  } as unknown as DbProperty;

  const mapped = mapPropertyFacts(row);
  assert.equal(mapped.nearbySchools?.length, 5);
  assert.ok(mapped.nearbySchools?.some((school) => school.startsWith("Cuffley School (primary, ")));

  const unlocated = mapPropertyFacts({ ...row, latitude: undefined, longitude: undefined } as DbProperty);
  assert.equal(unlocated.nearbySchools, undefined);
});

test("the nearest schools survive the copy handed to the reply writer", () => {
  const sanitized = sanitizeOperationResult({
    status: "property_facts",
    state: createInitialConversationState(),
    facts: [facts({ nearbySchools: NEARBY })],
  });
  assert.equal(sanitized.status, "property_facts");
  assert.deepEqual(sanitized.status === "property_facts" ? sanitized.facts[0]?.nearbySchools : null, NEARBY);
});

test("a reply naming the listed schools and distances is accepted", () => {
  for (const text of [
    "The nearest primary schools to Brookside Crescent, Cuffley are Cuffley School and Goffs Oak Primary & Nursery School, both about 0.8 miles away. The nearest secondary is Goffs Academy at 2.4 miles. These are straight-line distances, and catchment areas are set by each school and the council, so do check before relying on one.",
    "Cuffley School is the closest primary at 0.8 miles, and Goffs Academy is the nearest secondary at 2.4 miles.",
  ]) {
    assert.deepEqual(verifyGroundedResponse(text, withSchools()), { ok: true }, text);
  }
});

test("a reply inventing a distance or a school for a home with none listed is rejected", () => {
  assert.equal(
    verifyGroundedResponse("Cuffley School is only 0.2 miles from Brookside Crescent, Cuffley.", withSchools()).ok,
    false,
  );
  assert.equal(
    verifyGroundedResponse(
      "Brookside Crescent, Cuffley has an outstanding school nearby.",
      [{ status: "property_facts", facts: [facts()] } as SanitizedOperationResult],
    ).ok,
    false,
  );
});

test("every area Banc covers has a schools answer that names real schools and the catchment caveat", () => {
  for (const guide of areaGuides) {
    const document = APPROVED_BANC_DOCUMENTS.find((candidate) => candidate.id === `schools:${guide.slug}`);
    assert.ok(document, `no schools document for ${guide.name}`);
    assert.equal(document.href, `/area-guides/${guide.slug}`);
    assert.match(document.text, /\(primary, \d\.\d miles\)/);
    assert.match(document.text, /\((?:secondary|all-through), \d\.\d miles\)/);
    assert.match(document.text, /catchment/i);
    assert.ok(document.text.length <= 480, `${guide.name} schools text is ${document.text.length} characters`);
  }
});

test("asking about schools in an area finds that area's schools first", async () => {
  const search = createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS);
  for (const [query, id, school] of [
    ["Cuffley schools", "schools:cuffley", "Cuffley School"],
    ["schools Goffs Oak", "schools:goffs-oak", "Woodside Primary School"],
    ["Potters Bar secondary school", "schools:potters-bar", "Dame Alice Owen's School"],
  ] as const) {
    const [first] = await search.search(query);
    assert.equal(first?.documentId, id, query);
    assert.ok(first?.excerpt.includes(school), `${query}: ${first?.excerpt}`);
  }
});

test("the bot is told to answer school questions from the register and to ask which area when none is named", () => {
  assert.match(BANC_INTENT_INSTRUCTIONS, /schools?/i);
  assert.match(BANC_INTENT_INSTRUCTIONS, /which area/i);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /nearbySchools/);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /catchment/i);
  assert.doesNotMatch(BANC_RESPONSE_INSTRUCTIONS, /size, chain, schools, pets/);
});

test("a question Banc's content does not cover gets a way forward, not a dead end", () => {
  assert.doesNotMatch(KNOWLEDGE_NOT_COVERED_COPY, /approved Banc guidance/);
  assert.match(KNOWLEDGE_NOT_COVERED_COPY, /form below/);
  assert.match(KNOWLEDGE_NOT_COVERED_COPY, /Banc team/);
});

// Two copy steps sit between the listing facts and the reply writer. Both
// silently dropped every optional field, so the writer never saw them.
test("the reply writer is given the listing's schools, bullet points and EPC certificate flag, and may use them", async () => {
  let sent = "";
  const reply = "Cuffley School is the closest primary at 0.8 miles, and Goffs Academy is the nearest secondary at 2.4 miles.";
  const model = createOpenAIConversationModel({
    apiKey: "test-key",
    model: "gpt-test",
    fetch: (async (_url: unknown, init?: RequestInit) => {
      sent = String(init?.body ?? "");
      return Response.json({
        id: "resp_test",
        object: "response",
        status: "completed",
        output: [{
          id: "msg_test",
          type: "message",
          status: "completed",
          role: "assistant",
          content: [{ type: "output_text", text: JSON.stringify({ response: reply }), annotations: [] }],
        }],
      });
    }) as typeof fetch,
  });

  const result = await model.writeResponse(
    {
      message: "What schools are near this home?",
      history: [],
      state: { resultPropertyIds: ["EA-1"], focusedPropertyId: "EA-1", topic: "property_detail" },
      results: [{
        status: "property_facts",
        facts: [facts({
          nearbySchools: NEARBY,
          keyFeatures: ["Principal bedroom with en-suite"],
          epcCertificate: true,
        })],
      } as SanitizedOperationResult],
    },
    new AbortController().signal,
  );

  assert.match(sent, /Cuffley School \(primary, 0\.8 miles\)/);
  assert.match(sent, /Principal bedroom with en-suite/);
  assert.match(sent, /epcCertificate/);
  assert.equal(result.status, "ok");
  assert.equal(result.status === "ok" ? result.response : "", reply);
});

test("a schools question with no area or home asks which area, not whether they want to buy or rent", async () => {
  const state = createInitialConversationState();
  const handler = createBancConversationHandler({
    model: {
      selectPlan: async () => ({
        status: "ok",
        providerCalls: 1,
        plan: { primary: { type: "clarify", question: "Which area?" } },
      }),
      writeResponse: async () => ({ status: "ok", providerCalls: 1, response: "unused" }),
    },
    tools: {
      execute: async () => ({ status: "clarification_required", state, question: "Which area?" }),
    },
    logger: () => undefined,
  });

  const schools = await handler({ message: "What schools are nearby?", history: [] });
  assert.equal(schools.action, "clarify");
  assert.equal(schools.response, SCHOOLS_AREA_CLARIFICATION);
  assert.match(SCHOOLS_AREA_CLARIFICATION, /Cuffley/);
  assert.match(SCHOOLS_AREA_CLARIFICATION, /which area/i);

  const greeting = await handler({ message: "hello", history: [] });
  assert.equal(greeting.response, INTERPRETATION_CLARIFICATION);
});

test("counting the listed schools, or saying a certificate isn't shown, does not throw the answer away", () => {
  const fiveSchools = [{
    status: "property_facts",
    facts: [facts({ nearbySchools: [...NEARBY, "Woodside Primary School (primary, 1.0 miles)", "Wren Academy Enfield (secondary, 2.9 miles)"] })],
  } as SanitizedOperationResult];
  assert.deepEqual(
    verifyGroundedResponse(
      "The listing gives five state-funded schools nearby, with Cuffley School and Goffs Oak Primary & Nursery School both 0.8 miles away in a straight line.",
      fiveSchools,
    ),
    { ok: true },
  );
  assert.deepEqual(
    verifyGroundedResponse(
      "The EPC rating isn't listed for this property, and there is no EPC certificate shown on the listing page.",
      [{ status: "property_facts", facts: [facts()] } as SanitizedOperationResult],
    ),
    { ok: true },
  );
  assert.equal(
    verifyGroundedResponse(
      "There is a swimming pool at Brookside Crescent, Cuffley.",
      [{ status: "property_facts", facts: [facts()] } as SanitizedOperationResult],
    ).ok,
    false,
  );
});
