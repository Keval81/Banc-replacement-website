// A schools or features answer used to arrive as one dense paragraph. The
// server now sends the items as a list for the panel to lay out, and the
// writer is told so it only writes a short lead-in.
import assert from "node:assert/strict";
import test from "node:test";

import { parseConversationResponse } from "../banc-conversation/contracts.ts";
import { detailsFor } from "../banc-conversation/details.ts";
import { createBancConversationHandler } from "../banc-conversation/handler.ts";
import { BANC_RESPONSE_INSTRUCTIONS } from "../banc-conversation/prompt.ts";
import type { TrustedOperationResult } from "../banc-conversation/tools.ts";
import {
  getPropertyChatMessageView,
  getPropertyChatQuickReplies,
  runPropertyChatTurn,
  type PropertyChatMessage,
} from "../property-chat-submit.ts";
import {
  loadPropertyChatSession,
  savePropertyChatSession,
} from "../property-chat-session.ts";
import type { PropertyFacts } from "../property-facts.ts";

const state = { resultPropertyIds: ["BPGC2055"], focusedPropertyId: "BPGC2055", topic: "property_detail" as const };
const fact: PropertyFacts = {
  id: "BPGC2055",
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
  features: ["garden"],
  keyFeatures: ["Four bedrooms", "Principal bedroom with en-suite", "Driveway and garage"],
  nearbySchools: ["Cuffley School (primary, 0.8 miles)", "Goffs Academy (secondary, 2.4 miles)"],
  summary: "A detached family house.",
};
const home: TrustedOperationResult[] = [{ status: "property_facts", state, facts: [fact] }];

const SCHOOLS = {
  title: "Nearest schools",
  items: [
    { label: "Cuffley School", note: "Primary · 0.8 miles" },
    { label: "Goffs Academy", note: "Secondary · 2.4 miles" },
  ],
};

test("a schools question about a home gets its schools as a list", () => {
  assert.deepEqual(detailsFor("What schools are near this home?", home), SCHOOLS);
});

test("asking to hear more about a home gets its key features as a list", () => {
  assert.deepEqual(detailsFor("Tell me more about this home", home), {
    title: "Key features",
    items: [
      { label: "Four bedrooms" },
      { label: "Principal bedroom with en-suite" },
      { label: "Driveway and garage" },
    ],
  });
});

test("features typed in capitals are shown in title case, acronyms kept", () => {
  const shouty: TrustedOperationResult[] = [{
    status: "property_facts",
    state,
    facts: [{ ...fact, keyFeatures: ["GROUND FLOOR WC", "DRIVEWAY AND GARAGE PROVIDING AMPLE PARKING", "FOUR WELL-PROPORTIONED BEDROOMS"] }],
  }];
  assert.deepEqual(detailsFor("What are the key features?", shouty)?.items, [
    { label: "Ground Floor WC" },
    { label: "Driveway and Garage Providing Ample Parking" },
    { label: "Four Well-Proportioned Bedrooms" },
  ]);
});

test("a plain fact question gets no list", () => {
  assert.equal(detailsFor("Is it still available?", home), undefined);
  assert.equal(detailsFor("What schools are nearby?", [{ status: "reset", state }] as TrustedOperationResult[]), undefined);
});

test("a schools question about an area gets that area's schools as a list", () => {
  const details = detailsFor("What are the schools like in Cuffley?", [{
    status: "knowledge",
    state: { ...state, topic: "banc_knowledge" },
    sources: [{ documentId: "schools:cuffley", title: "Schools near Cuffley", href: "/area-guides/cuffley", excerpt: "..." }],
  }]);
  assert.equal(details?.title, "Schools near Cuffley");
  assert.deepEqual(details?.items[0], { label: "Cuffley School", note: "Primary · 0.3 miles" });
  assert.equal(details?.items.length, 5);
});

test("the list reaches the visitor and the writer is told the panel shows it", async () => {
  let toldWriter: unknown;
  const handler = createBancConversationHandler({
    model: {
      selectPlan: async () => ({
        status: "ok",
        providerCalls: 1,
        plan: { primary: { type: "get_property_facts", propertyIds: ["BPGC2055"] } },
      }),
      writeResponse: async (input) => {
        toldWriter = input.shownList;
        return { status: "ok", providerCalls: 1, response: "Here are the nearest schools." };
      },
    },
    tools: { execute: async () => home[0]! },
    logger: () => undefined,
  });
  const response = await handler({ message: "What schools are near it?", history: [], context: state });

  assert.deepEqual(response.details, SCHOOLS);
  assert.deepEqual(toldWriter, { title: "Nearest schools", count: 2 });
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /interfaceShows/);
  assert.ok(parseConversationResponse(JSON.parse(JSON.stringify(response)))?.details, "survives the wire format");
});

test("the list survives the chat panel's own copies and a page change", async () => {
  const received: PropertyChatMessage[] = [];
  await runPropertyChatTurn({
    content: "schools?",
    messages: [],
    context: state,
    nextMessageId: () => `property-chat-${received.length + 1}`,
    request: async () => ({ response: "Here they are.", action: "answer", details: SCHOOLS, context: state }),
    onUserMessage: () => undefined,
    onAssistantMessage: (message) => received.push(message),
    onContextChange: () => undefined,
    onLoadingChange: () => undefined,
  });
  assert.deepEqual(received[0]?.details, SCHOOLS);
  assert.deepEqual(getPropertyChatMessageView(received[0]!).details, SCHOOLS);

  const store = new Map<string, string>();
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  };
  savePropertyChatSession(storage, { messages: received, state });
  assert.deepEqual(loadPropertyChatSession(storage)?.messages[0]?.details, SCHOOLS);
});

test("suggested next steps fit where the visitor is", () => {
  const onHome = getPropertyChatQuickReplies(state);
  assert.ok(onHome.includes("Schools nearby"));
  assert.ok(onHome.length <= 4);
  assert.ok(onHome.some((reply) => /view/i.test(reply)));

  const afterSearch = getPropertyChatQuickReplies({ resultPropertyIds: ["A", "B"], topic: "property_search" });
  assert.ok(afterSearch.length >= 3);
  assert.ok(afterSearch.includes("Compare the first two"));

  const fresh = getPropertyChatQuickReplies({ resultPropertyIds: [], topic: "property_search" });
  assert.ok(fresh.length >= 3);
  for (const reply of [...onHome, ...afterSearch, ...fresh]) assert.ok(reply.length <= 34, reply);
});
