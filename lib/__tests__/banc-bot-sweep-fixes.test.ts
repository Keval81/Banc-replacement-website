// Behaviours pinned by the 13 Nov 2026 Banc Bot sweep (docs: ~/brain/output/audits/banc-bot-sweep-2026-11-13.md).
import assert from "node:assert/strict";
import test from "node:test";

import { APPROVED_BANC_DOCUMENTS } from "../banc-content/approved-content.ts";
import { createInitialConversationState } from "../banc-conversation/contracts.ts";
import { verifyGroundedResponse } from "../banc-conversation/grounding.ts";
import {
  createBancConversationHandler,
  INTERPRETATION_CLARIFICATION,
} from "../banc-conversation/handler.ts";
import { createBancKnowledgeSearch } from "../banc-conversation/knowledge.ts";
import { createOpenAIConversationModel } from "../banc-conversation/openai.ts";
import {
  BANC_INTENT_INSTRUCTIONS,
  BANC_RESPONSE_INSTRUCTIONS,
} from "../banc-conversation/prompt.ts";
import {
  createConversationTools,
  type SanitizedOperationResult,
} from "../banc-conversation/tools.ts";
import {
  focusStateOnPageProperty,
  pagePropertyIdFromPath,
} from "../property-chat-page.ts";
import { getPropertyChatQuickReplies } from "../property-chat-submit.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";

const home = (overrides: Record<string, unknown> = {}): SanitizedOperationResult[] => [{
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
    features: ["garden", "parking", "garage"],
    summary: "A detached family house in a cul-de-sac.",
    ...overrides,
  }],
} as SanitizedOperationResult];

test("an honest 'the listing doesn't say' answer is allowed, even for EPC, chain and schools", () => {
  for (const text of [
    "The EPC rating and council tax band aren't listed for Brookside Crescent, Cuffley.",
    "The listing doesn't say whether it is chain free, and nearby schools aren't mentioned.",
    "Brookside Crescent, Cuffley is freehold. The exact size isn't stated on the listing.",
  ]) {
    assert.deepEqual(verifyGroundedResponse(text, home()), { ok: true }, text);
  }
});

test("a 'not listed' sentence cannot smuggle in a feature the listing does not have", () => {
  const verdict = verifyGroundedResponse(
    "Brookside Crescent, Cuffley has a swimming pool, but the EPC rating isn't listed.",
    home(),
  );
  assert.equal(verdict.ok, false);
});

test("the bot may point to the EPC certificate when the listing page shows one", () => {
  const text = "The EPC rating isn't given as a figure, but the EPC certificate is shown on the listing page for Brookside Crescent, Cuffley.";
  assert.deepEqual(verifyGroundedResponse(text, home({ epcCertificate: true })), { ok: true });
  assert.equal(
    verifyGroundedResponse("Brookside Crescent, Cuffley has its EPC certificate on the listing page.", home()).ok,
    false,
  );
});

test("the listing's own key features can be quoted", () => {
  const withBullets = home({ keyFeatures: ["Principal bedroom with en-suite", "Fitted kitchen with separate utility room"] });
  assert.deepEqual(
    verifyGroundedResponse("Brookside Crescent, Cuffley has a principal bedroom with en-suite and a utility room.", withBullets),
    { ok: true },
  );
  assert.equal(
    verifyGroundedResponse("Brookside Crescent, Cuffley has a principal bedroom with en-suite.", home()).ok,
    false,
  );
});

test("the page a visitor is on names the home in focus", () => {
  assert.equal(pagePropertyIdFromPath("/sales/properties/BPGC2055"), "BPGC2055");
  assert.equal(pagePropertyIdFromPath("/lettings/properties/BPGC2052/"), "BPGC2052");
  assert.equal(pagePropertyIdFromPath("/book-viewing/BPGC2055"), "BPGC2055");
  assert.equal(pagePropertyIdFromPath("/make-offer/BPGC2055"), "BPGC2055");
  for (const path of ["/", "/sales/properties", "/contact", "/sales/properties/a/b", "/sales/properties/<script>"]) {
    assert.equal(pagePropertyIdFromPath(path), null, path);
  }
});

test("opening the bot on a listing puts that home first and in focus, keeping the visitor's search", () => {
  const fresh = focusStateOnPageProperty(createInitialConversationState(), "BPGC2055");
  assert.deepEqual(fresh, { resultPropertyIds: ["BPGC2055"], focusedPropertyId: "BPGC2055", topic: "property_detail" });

  const query = createDefaultPropertySearchQuery("sales");
  const searching = { query, resultPropertyIds: ["A1", "A2", "A3"], resultFingerprint: "v1:x", topic: "property_search" as const };
  const focused = focusStateOnPageProperty(searching, "BPGC2055");
  assert.deepEqual(focused.resultPropertyIds, ["BPGC2055", "A1", "A2"]);
  assert.equal(focused.focusedPropertyId, "BPGC2055");
  assert.deepEqual(focused.query, query);

  const again = focusStateOnPageProperty(focused, "BPGC2055");
  assert.equal(again, focused, "already in focus: unchanged, so the widget does not re-render in a loop");
});

test("on a listing the starter chips are about that home", () => {
  const replies = getPropertyChatQuickReplies(focusStateOnPageProperty(createInitialConversationState(), "BPGC2055"));
  assert.ok(replies.some((reply) => /this home/i.test(reply)));
  assert.ok(replies.some((reply) => /view/i.test(reply)));
});

test("a two-topic question searches each topic on its own terms", async () => {
  const tools = createConversationTools({
    portfolio: { search: async () => ({ properties: [], total: 0 }), getFacts: async () => [] } as never,
    knowledge: createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS),
  });
  const result = await tools.execute({
    intent: { type: "search_banc_knowledge", query: "areas covered | opening hours" },
    message: "What areas do you cover and what are your opening hours?",
    state: createInitialConversationState(),
  });
  assert.equal(result.status, "knowledge");
  if (result.status !== "knowledge") return;
  assert.ok(result.sources.some((r) => /9am to 5:30pm/.test(r.excerpt)), "opening hours");
  assert.ok(result.sources.some((r) => /Potters Bar/.test(r.excerpt) && /Cheshunt/.test(r.excerpt)), "areas covered");
});

test("one topic with a qualifier nothing covers still finds nothing", async () => {
  const search = createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS);
  assert.deepEqual(await search.search("Cuffley office parking"), []);
  assert.deepEqual(await search.search("mortgage advice"), []);
});

test("'what areas do you cover' has an answer", async () => {
  const results = await createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS).search("areas covered");
  assert.ok(results.length > 0);
  assert.match(results[0]!.excerpt, /Cuffley/);
  assert.match(results[0]!.excerpt, /Brookmans Park/);
});

test("landlord fees returns the sentence, not just its heading", async () => {
  const results = await createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS).search("landlord fees");
  assert.match(results[0]!.excerpt, /no hidden charges/i);
});

test("a search that also asked an uncovered question shows the homes, not 'I couldn't find guidance'", async () => {
  const state = { query: createDefaultPropertySearchQuery("sales"), resultPropertyIds: [], topic: "property_search" as const };
  const handler = createBancConversationHandler({
    model: {
      selectPlan: async () => ({
        status: "ok",
        providerCalls: 1,
        plan: {
          primary: { type: "update_property_search", mutation: { department: { operation: "set", value: "sales" } } },
          supporting: { type: "search_banc_knowledge", query: "family station" },
        },
      }),
      writeResponse: async (input) => {
        assert.equal(input.results.length, 1, "the empty knowledge lookup is not handed to the writer");
        return { status: "ok", providerCalls: 1, response: "There are 3 homes for sale that match." };
      },
    },
    tools: {
      execute: async ({ intent }) => intent.type === "search_banc_knowledge"
        ? { status: "knowledge", state: { ...state, topic: "banc_knowledge" }, sources: [] }
        : { status: "search_results", state, properties: [], total: 3 },
    },
    logger: () => undefined,
  });
  const response = await handler({ message: "something for a family near a station, up to 800k", history: [] });
  assert.equal(response.response, "There are 3 homes for sale that match.");
  assert.equal(response.action, "search_results");
  assert.equal(response.form, undefined);
});

test("the bot's fallback question is friendly and offers real choices", () => {
  assert.match(INTERPRETATION_CLARIFICATION, /buy|rent/i);
  assert.match(INTERPRETATION_CLARIFICATION, /sell|valuation/i);
  assert.doesNotMatch(INTERPRETATION_CLARIFICATION, /bedroom requirement/);
});

test("the instructions cover the home in focus, missing facts, greetings and area guides", () => {
  assert.match(BANC_INTENT_INSTRUCTIONS, /focusedPropertyId/);
  assert.match(BANC_INTENT_INSTRUCTIONS, /this one|this home/);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /does not state|isn't listed|not listed/i);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /epcCertificate/);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /area guide/i);
});

test("'where is your office' returns the address itself, however it is phrased", async () => {
  const search = createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS);
  for (const query of ["office address", "office location", "where is your office", "Cuffley office address", "contact details", "phone number", "contact number", "email address"]) {
    const results = await search.search(query);
    assert.ok(results.some((r) => /1 Station Road/.test(r.excerpt) && /EN6 4HU/.test(r.excerpt)), query);
  }
  const hours = await search.search("opening hours");
  assert.match(hours[0]!.excerpt, /Monday to Saturday: 9am to 5:30pm/);
});

test("availability of the home in focus is answered from its status, not sent to a form", () => {
  assert.match(BANC_INTENT_INSTRUCTIONS, /still available[^.]*\s+get_property_facts/i);
  assert.doesNotMatch(BANC_INTENT_INSTRUCTIONS, /making an\s+offer, checking availability/);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /status/);
});

function streetTools(totals: { sales: number; lettings: number }) {
  const searched: string[] = [];
  const tools = createConversationTools({
    portfolio: {
      search: async (query: { department: "sales" | "lettings"; location?: string }) => {
        searched.push(`${query.department}:${query.location}`);
        return { properties: [], total: totals[query.department], page: 1, pageSize: 12, totalPages: 1 };
      },
      getFacts: async () => [],
    } as never,
    knowledge: createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS),
  });
  const run = () => tools.execute({
    intent: { type: "update_property_search", mutation: { location: { operation: "set", value: "Brookside Crescent" } } },
    message: "Is Brookside Crescent in Cuffley still available?",
    state: createInitialConversationState(),
  });
  return { run, searched };
}

test("a named street is looked up without first asking buy or rent, when only one side lists it", async () => {
  const sale = await streetTools({ sales: 3, lettings: 0 }).run();
  assert.equal(sale.status, "search_results");
  assert.equal(sale.state.query?.department, "sales");
  assert.equal(sale.state.query?.location, "Brookside Crescent");

  const let_ = await streetTools({ sales: 0, lettings: 1 }).run();
  assert.equal(let_.state.query?.department, "lettings");
});

test("a named street listed on both sides, or on neither, still asks buy or rent", async () => {
  for (const totals of [{ sales: 2, lettings: 1 }, { sales: 0, lettings: 0 }]) {
    const result = await streetTools(totals).run();
    assert.equal(result.status, "clarification_required");
    assert.equal(result.state.query, undefined);
  }
});

test("a search with no place named still asks buy or rent without searching", async () => {
  const { searched } = streetTools({ sales: 3, lettings: 0 });
  const tools = createConversationTools({
    portfolio: { search: async () => { searched.push("x"); return { properties: [], total: 3 }; }, getFacts: async () => [] } as never,
    knowledge: createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS),
  });
  const result = await tools.execute({
    intent: { type: "update_property_search", mutation: { maxPrice: { operation: "set", value: 500_000 } } },
    message: "something under 500k",
    state: createInitialConversationState(),
  });
  assert.equal(result.status, "clarification_required");
  assert.deepEqual(searched, []);
});

test("office answers may use the word office, and a phone request is steered to the contact page", async () => {
  const results = await createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS).search("office address");
  const sanitized: SanitizedOperationResult[] = [{
    status: "knowledge",
    sources: results.map(({ documentId, title, excerpt }) => ({ documentId, title, excerpt })),
  }];
  assert.deepEqual(
    verifyGroundedResponse("Our Cuffley office is at 1 Station Road, Cuffley, EN6 4HU.", sanitized),
    { ok: true },
  );
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /phone number or email[^.]*Contact/i);
});

test("an offer to find out more may name the fact without that counting as a claim", () => {
  for (const text of [
    "Brookside Crescent, Cuffley is currently available for sale. The EPC rating isn't listed for this property. If you would like more details or need to discuss EPC information, the Banc team can assist you using the contact form below.",
    "The council tax band isn't listed. The Banc team can confirm the EPC rating and nearby schools if you use the form below.",
    "For details on the EPC or the chain, please use the contact form below.",
  ]) {
    assert.deepEqual(verifyGroundedResponse(text, home()), { ok: true }, text);
  }
  assert.equal(
    verifyGroundedResponse("If you like, Brookside Crescent, Cuffley has a swimming pool and a cinema.", home()).ok,
    false,
    "an offer-shaped sentence cannot assert a feature",
  );
});

function modelSaying(text: string) {
  return createOpenAIConversationModel({
    apiKey: "test-key",
    model: "gpt-test",
    fetch: (async () => Response.json({
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
    })) as typeof fetch,
  });
}

test("when the model's wording is rejected, the stand-in still answers like an agent would", async () => {
  const result = await modelSaying("It has a swimming pool and a cinema room.").writeResponse(
    {
      message: "What is the EPC rating?",
      history: [],
      state: { resultPropertyIds: ["EA-1"], focusedPropertyId: "EA-1", topic: "property_detail" },
      results: home(),
    },
    new AbortController().signal,
  );
  assert.equal(result.status, "ok");
  if (result.status !== "ok") return;
  assert.doesNotMatch(result.response, /features a garden/);
  assert.match(result.response, /Brookside Crescent, Cuffley/);
  assert.match(result.response, /for sale/);
  assert.match(result.response, /£895,000/);
  assert.match(result.response, /Banc team/);
});

function factsThenGuides(guides: Array<{ documentId: string; title: string }>) {
  const state = { resultPropertyIds: ["EA-1"], focusedPropertyId: "EA-1", topic: "property_detail" as const };
  const seen: number[] = [];
  const titles: string[][] = [];
  const handler = createBancConversationHandler({
    model: {
      selectPlan: async () => ({
        status: "ok",
        providerCalls: 1,
        plan: {
          primary: { type: "get_property_facts", propertyIds: ["EA-1"] },
          supporting: { type: "search_banc_knowledge", query: "schools" },
        },
      }),
      writeResponse: async (input) => {
        seen.push(input.results.length);
        titles.push(input.results.flatMap((r) => r.status === "knowledge" ? r.sources.map((s) => s.title) : []));
        return { status: "ok", providerCalls: 1, response: "The listing does not mention schools." };
      },
    },
    tools: {
      execute: async ({ intent }) => intent.type === "search_banc_knowledge"
        ? {
            status: "knowledge",
            state: { ...state, topic: "banc_knowledge" },
            sources: guides.map((guide) => ({ ...guide, href: "/area-guides/x", excerpt: "A popular primary school." })),
          }
        : { status: "property_facts", state, facts: (home()[0] as unknown as { facts: never[] }).facts },
    },
    logger: () => undefined,
  });
  return { handler, seen, titles };
}

test("a neighbouring area's guide is not used to answer about a home somewhere else", async () => {
  const elsewhere = factsThenGuides([
    { documentId: "area-guide:newgate-street-village", title: "Newgate Street Village area guide" },
    { documentId: "area-guide:northaw", title: "Northaw area guide" },
  ]);
  const response = await elsewhere.handler({ message: "Which schools are nearby?", history: [], context: { resultPropertyIds: ["EA-1"], focusedPropertyId: "EA-1", topic: "property_detail" } });
  assert.deepEqual(elsewhere.seen, [1], "only the home's own facts reach the writer");
  assert.equal(response.sources, undefined);

  const mixed = factsThenGuides([
    { documentId: "area-guide:northaw", title: "Northaw area guide" },
    { documentId: "area-guide:cuffley", title: "Cuffley area guide" },
    { documentId: "sales:buyers-guide:costs", title: "Buyers Guide" },
  ]);
  await mixed.handler({ message: "Which schools are nearby?", history: [], context: { resultPropertyIds: ["EA-1"], focusedPropertyId: "EA-1", topic: "property_detail" } });
  assert.deepEqual(mixed.titles, [["Cuffley area guide", "Buyers Guide"]]);
});
