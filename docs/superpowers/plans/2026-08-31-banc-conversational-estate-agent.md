# Banc Conversational Estate Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the brittle Banc property chatbot with a session-based conversational estate agent that searches live Banc listings, answers from approved Banc website content, preserves natural refinements, and offers trusted Call or WhatsApp handoffs.

**Architecture:** Keep the canonical property-search and Supabase/Expert Agent boundary unchanged, but place a CRM-neutral `PropertyPortfolio` adapter behind a new `banc-conversation` package. The model emits bounded intents and per-field mutations; deterministic server code validates and applies them, runs trusted search/fact/knowledge services, and returns prose separately from server-built cards, source links, and handoff links.

**Tech Stack:** Next.js App Router, React, TypeScript strict mode, Zod, OpenAI Responses API, Node's built-in test runner, Supabase-backed property search, Vercel Preview deployments.

**Spec:** `docs/superpowers/specs/2026-08-31-banc-conversational-estate-agent-design.md`

## Global Constraints

- Use strict TDD: add a failing behavioral test, confirm the intended failure, implement the smallest change, rerun the focused test, then commit.
- Add no dependency, vector store, transcript store, local-storage persistence, CRM write, browser tool, or public-web search.
- Keep canonical property search, Expert Agent/Supabase ingestion, exact-bedroom behavior, property detail routes, and the CRM-neutral source boundary unchanged.
- Treat request history and browser context as untrusted; cap history at 20 messages and each message at 2,000 characters.
- Retain conversation state only in the active React session; reload or close starts a new conversation.
- Model output may propose only approved intents and typed field mutations. The server owns state, facts, links, cards, actions, contact destinations, and safety copy.
- A turn may perform at most two trusted operations and three provider calls, including one bounded repair attempt, within one 20-second total route budget.
- Return at most three property cards, only when the trusted result fingerprint changes.
- Use only registered Banc website content for non-listing answers. If it is absent, say so and offer Call or WhatsApp.
- Log only safe category, correlation/request ID, duration bucket, and tool name. Never log visitor text, history, model output, property payloads, credentials, or secrets.
- Deploy only to a new immutable Vercel Preview with Preview-scoped OpenAI and Supabase variables. Keep Production unchanged until explicit Production approval and rate limiting are in place.

## File Structure

### Retained domain primitives

- Create `lib/property-facts.ts`: shared `PropertyFacts` schema/type, marketable-property authorization, and canonical fact mapping, independent of conversation orchestration.
- Create `lib/property-search/bedroom-intent.ts`: deterministic parsing of explicit current-message bedroom language.
- Modify `lib/property-search/server.ts`: expose the existing search and fact lookup through the new CRM-neutral portfolio adapter.
- Keep `lib/property-search/types.ts`, query parsing, repository, Supabase source, and property-view mapping authoritative.

### New conversation package

- Create `lib/banc-conversation/contracts.ts`: public request/response schemas, state schema, intent schema, field-mutation schema, safe source/handoff schemas, and inferred types.
- Create `lib/banc-conversation/state-reducer.ts`: deterministic mutation application, bedroom override, pagination reset, and fingerprint helpers.
- Create `lib/banc-conversation/portfolio.ts`: `PropertyPortfolio` interface and adapter around canonical property search/facts.
- Create `lib/banc-conversation/knowledge.ts`: `BancKnowledge` interface and deterministic registry search.
- Create `lib/banc-conversation/tools.ts`: approved trusted operation executor and authorization checks.
- Create `lib/banc-conversation/prompt.ts`: intent-selection and response-writing instructions grounded in tool contracts.
- Create `lib/banc-conversation/openai.ts`: abortable Responses API client, structured intent parsing, response parsing, and one bounded repair call.
- Create `lib/banc-conversation/handler.ts`: total-budget turn orchestration, category-specific recovery, state preservation, and safe diagnostics.
- Create `lib/banc-conversation/index.ts`: public exports only.
- Create `lib/banc-contact.ts`: one immutable source for the approved telephone and WhatsApp destinations used by landing controls and chat handoffs.

### Approved Banc content

- Create `lib/banc-content/types.ts`: canonical page-section and registry document types.
- Create `lib/banc-content/approved-content.ts`: build-time registry assembled only from explicitly imported Banc content.
- Create `lib/banc-content/buyers-guide.ts`, `sellers-guide.ts`, `landlords-guide.ts`, `tenants-guide.ts`, and `contact.ts`: structured copy shared by pages and knowledge search.
- Modify the corresponding pages to render those shared structures rather than private inline duplicates.
- Reuse `lib/area-guides.ts` as an approved source without copying its facts.

### Route and UI

- Modify `app/api/chat/route.ts`: validate through the new contract and call the new handler with a per-request correlation ID.
- Modify `lib/property-chat-submit.ts`: carry trusted `sources` and `handoff` fields into assistant messages while preserving single-flight behavior.
- Modify `components/ai/PropertyChatbot.tsx`: render trusted Banc source links and fixed Call/WhatsApp actions; preserve modal focus, scrolling, mobile input reachability, and launcher focus restoration.
- Retire `lib/property-conversation/*` and `lib/property-chat.ts` only after all live imports and replacement regression tests are green.

---

### Task 1: Extract Conversation-Neutral Property Primitives

**Files:**
- Create: `lib/property-facts.ts`
- Create: `lib/property-search/bedroom-intent.ts`
- Modify: `lib/property-search/server.ts`
- Modify: `lib/property-conversation/property-facts.ts`
- Modify: `lib/property-conversation/bedroom-intent.ts`
- Test: `lib/__tests__/property-facts.test.ts`
- Test: `lib/__tests__/property-search-bedroom-intent.test.ts`

**Interfaces:**
- Consumes: `DbProperty`, `PropertySearchQuery`, and the existing canonical `searchProperties` implementation.
- Produces: `PropertyFacts`, `propertyFactsSchema`, `isMarketableProperty(row: DbProperty): boolean`, `mapPropertyFacts(row: DbProperty): PropertyFacts`, `createPropertyFactLookup(client: SupabaseClient): PropertyFactLookup`, and `parseBedroomIntent(message: string): BedroomIntent` from conversation-neutral paths.

- [ ] **Step 1: Write failing import-boundary tests**

Add tests that import the retained primitives only from their new paths:

```ts
import assert from "node:assert/strict";
import test from "node:test";

import {
  createPropertyFactLookup,
  isMarketableProperty,
  mapPropertyFacts,
} from "../property-facts.ts";
import { parseBedroomIntent } from "../property-search/bedroom-intent.ts";

test("parses an explicit exact bedroom requirement independently of chat orchestration", () => {
  assert.deepEqual(parseBedroomIntent("I need exactly five bedrooms"), {
    mode: "exact",
    value: 5,
  });
});

test("rejects a non-marketable property before exposing facts", () => {
  assert.equal(isMarketableProperty({ status: "withdrawn" } as never), false);
});
```

Retain the existing detailed row-mapping and active-ID authorization assertions from the current property-facts tests.

- [ ] **Step 2: Run the focused tests and confirm RED**

Run:

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-facts.test.ts \
  lib/__tests__/property-search-bedroom-intent.test.ts
```

Expected: FAIL because `lib/property-facts.ts` and `lib/property-search/bedroom-intent.ts` do not exist.

- [ ] **Step 3: Move the implementations without changing behavior**

Move `PropertyFacts`, `propertyFactsSchema`, and the existing fact implementations into `lib/property-facts.ts`. This prevents retained fact code from importing the package that Task 8 removes. Move bedroom parsing into `lib/property-search/bedroom-intent.ts`. During the transition, keep old paths as compatibility re-exports:

```ts
export interface PropertyFacts {
  id: string;
  title: string;
  address: string;
  department: "sales" | "lettings";
  status: "for_sale" | "under_offer" | "to_let" | "let_agreed";
  price: number;
  priceDisplay: string;
  bedrooms: number;
  bathrooms: number;
  receptions: number;
  propertyType: string;
  tenure: string | null;
  epc: string | null;
  sqft: number | null;
  features: string[];
  summary: string;
}
```

Move the existing strict `propertyFactsSchema` unchanged beside that interface and continue parsing every mapped row through it.

```ts
// lib/property-conversation/property-facts.ts
export * from "../property-facts.ts";
```

```ts
// lib/property-conversation/bedroom-intent.ts
export * from "../property-search/bedroom-intent.ts";
```

Update `lib/property-search/server.ts` to import fact helpers from `../property-facts.ts`; do not alter repository queries, status filtering, card mapping, or result totals.

- [ ] **Step 4: Run focused and existing property tests**

Run:

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-facts.test.ts \
  lib/__tests__/property-search-bedroom-intent.test.ts \
  lib/__tests__/property-search*.test.ts
npx tsc --noEmit
```

Expected: all tests PASS and TypeScript exits 0.

- [ ] **Step 5: Commit the extraction**

```bash
git add lib/property-facts.ts lib/property-search/bedroom-intent.ts \
  lib/property-search/server.ts lib/property-conversation/property-facts.ts \
  lib/property-conversation/bedroom-intent.ts \
  lib/__tests__/property-facts.test.ts \
  lib/__tests__/property-search-bedroom-intent.test.ts
git commit -m "refactor: extract trusted property primitives"
```

### Task 2: Define Typed Conversation Contracts and Deterministic State Reduction

**Files:**
- Create: `lib/banc-contact.ts`
- Create: `lib/banc-conversation/contracts.ts`
- Create: `lib/banc-conversation/state-reducer.ts`
- Create: `lib/banc-conversation/index.ts`
- Test: `lib/__tests__/banc-conversation-contracts.test.ts`
- Test: `lib/__tests__/banc-conversation-state-reducer.test.ts`

**Interfaces:**
- Consumes: `PropertySearchQuery`, `PropertyCardData`, `PropertyFacts`, `SearchPropertyType`, `SearchTenure`, `SearchFeature`, `PropertySort`, and `parseBedroomIntent(message)`.
- Produces: `BANC_CONTACT`, `PropertyConversationState`, `createInitialConversationState()`, `ConversationRequest`, `ConversationResponse`, `ConversationAction`, `ConversationIntent`, `ConversationPlan`, `PropertySearchMutation`, parsing functions, `applyPropertySearchMutation(state, mutation, message): PropertyConversationState | null`, and `createResultFingerprint(ids, total)`.

- [ ] **Step 1: Write failing schema and reducer tests**

Cover strict parsing, exclusive field operations, context authorization, and exact refinement behavior:

```ts
test("replaces only location and preserves exact bedrooms and department", () => {
  const current = stateWithQuery({
    department: "sales",
    location: "Potters Bar",
    minBedrooms: 5,
    maxBedrooms: 5,
  });

  const next = applyPropertySearchMutation(
    current,
    { location: { operation: "set", value: "Cuffley" } },
    "Search Cuffley rather than Potters Bar",
  );

  assert.ok(next);
  assert.equal(next.query?.department, "sales");
  assert.equal(next.query?.location, "Cuffley");
  assert.equal(next.query?.minBedrooms, 5);
  assert.equal(next.query?.maxBedrooms, 5);
  assert.equal(next.query?.page, 1);
});

test("explicit bedroom language overrides a conflicting model mutation", () => {
  const next = applyPropertySearchMutation(
    stateWithQuery({ department: "sales" }),
    { bedrooms: { operation: "set", value: { mode: "minimum", value: 2 } } },
    "Actually I need exactly 4 bedrooms",
  );

  assert.ok(next);
  assert.equal(next.query?.minBedrooms, 4);
  assert.equal(next.query?.maxBedrooms, 4);
});
```

Also assert:

- omitted fields preserve current values;
- `{ operation: "clear" }` removes only its field;
- `make it cheaper` can lower `maxPrice` without clearing the location;
- `with parking` adds the canonical parking feature;
- `at least four bedrooms` sets minimum 4 and clears maximum;
- `actually I want to rent` switches to lettings and derives valid statuses;
- `keep everything else the same` makes no state change;
- `start again` is represented by the separate reset intent, not a mutation;
- a mutation with no current query and no explicit department returns `null`, allowing the tool layer to ask whether the visitor is buying or renting instead of silently assuming sales;
- unknown keys, unsafe integers, invalid enums, duplicate arrays, invalid focused IDs, raw links in prose, and overlong history fail parsing.

- [ ] **Step 2: Run the focused tests and confirm RED**

Run:

```bash
node --experimental-strip-types --test \
  lib/__tests__/banc-conversation-contracts.test.ts \
  lib/__tests__/banc-conversation-state-reducer.test.ts
```

Expected: FAIL because the new package does not exist.

- [ ] **Step 3: Implement the strict contracts**

Define the central types exactly once:

```ts
export type FieldMutation<T> =
  | { operation: "set"; value: T }
  | { operation: "clear" };

export interface PropertySearchMutation {
  department?: { operation: "set"; value: "sales" | "lettings" };
  location?: FieldMutation<string>;
  minPrice?: FieldMutation<number>;
  maxPrice?: FieldMutation<number>;
  bedrooms?: FieldMutation<{ mode: "exact" | "minimum"; value: number }>;
  minBathrooms?: FieldMutation<number>;
  propertyTypes?: FieldMutation<SearchPropertyType[]>;
  tenures?: FieldMutation<SearchTenure[]>;
  features?: FieldMutation<SearchFeature[]>;
  sort?: FieldMutation<PropertySort>;
}

export interface PropertyConversationState {
  query?: PropertySearchQuery;
  resultPropertyIds: string[];
  focusedPropertyId?: string;
  resultFingerprint?: string;
  topic: "property_search" | "property_detail" | "banc_knowledge" | "handoff";
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ConversationRequest {
  message: string;
  history: ConversationMessage[];
  context?: PropertyConversationState;
}

export function createInitialConversationState(): PropertyConversationState {
  return {
    resultPropertyIds: [],
    topic: "property_search",
  };
}
```

Define `ConversationIntent` as a strict discriminated union with these variants:

```ts
type ConversationIntent =
  | { type: "update_property_search"; mutation: PropertySearchMutation }
  | { type: "get_property_facts"; propertyIds: string[] }
  | { type: "search_banc_knowledge"; query: string }
  | { type: "reset_conversation_search" }
  | { type: "contact_banc"; reason: HandoffCategory; propertyId?: string }
  | { type: "clarify"; question: string };
```

Define the plan returned by interpretation. The supporting operation is optional, but a strict refinement rejects a second `clarify`, reset, or search mutation and rejects duplicate operation types:

```ts
export interface ConversationPlan {
  primary: ConversationIntent;
  supporting?:
    | Extract<ConversationIntent, { type: "get_property_facts" }>
    | Extract<ConversationIntent, { type: "search_banc_knowledge" }>
    | Extract<ConversationIntent, { type: "contact_banc" }>;
}
```

Export `parseConversationPlan(value: unknown): ConversationPlan | null` and test that it admits at most two operations.

The response schema must match the approved public contract:

```ts
export interface ConversationResponse {
  response: string;
  action:
    | "clarify"
    | "search_results"
    | "no_results"
    | "answer"
    | "contact_team"
    | "service_unavailable";
  properties?: PropertyCardData[];
  sources?: Array<{ title: string; href: string }>;
  handoff?: { callHref: string; whatsappHref: string };
  context: PropertyConversationState;
}

export type ConversationAction = ConversationResponse["action"];

export type HandoffCategory =
  | "viewing"
  | "valuation"
  | "offer"
  | "availability"
  | "fees_finance_legal"
  | "human";

export interface TrustedHandoff {
  callHref: `tel:${string}`;
  whatsappHref: `https://wa.me/${string}`;
  propertyId?: string;
}
```

Use Zod `.strict()` objects, cloned arrays, canonical enum arrays from `lib/crm/property-source.ts`, integer/price maxima from `lib/property-search/query.ts`, and the existing no-link rule for model prose.

Create the contact constant:

```ts
export const BANC_CONTACT = {
  displayPhone: "01707 877781",
  callHref: "tel:01707877781",
  whatsappHref:
    "https://wa.me/447707877781?text=Hi%2C%20I'm%20interested%20in%20a%20property%20I%20saw%20on%20your%20website.",
} as const;
```

Make the public handoff schema require `z.literal(BANC_CONTACT.callHref)` and `z.literal(BANC_CONTACT.whatsappHref)`. Make each source `href` a trimmed local path matching `^/(?!/)[A-Za-z0-9/_-]+$`; reject protocols, query strings, fragments, backslashes, and protocol-relative paths.

- [ ] **Step 4: Implement deterministic reduction**

Implement `applyPropertySearchMutation` with these rules:

1. Start from the current query or `createDefaultPropertySearchQuery` with the mutation's explicit department. Return `null` when neither exists so the trusted tool can ask “Are you looking to buy or rent?”; never default silently to sales.
2. Apply only present field operations.
3. Use `switchSearchDepartment` when department changes so statuses and price semantics remain canonical.
4. Apply explicit current-message bedroom intent after the model mutation.
5. Set page to 1; retain page size; clear result IDs, focus, and fingerprint after a material query change.
6. Return fresh arrays and a fresh state object.

Implement fingerprinting as stable server-owned JSON over ordered authorized IDs and total:

```ts
export function createResultFingerprint(
  ids: readonly string[],
  total: number,
): string {
  return JSON.stringify({ ids, total });
}
```

- [ ] **Step 5: Run the focused tests, TypeScript, and diff check**

```bash
node --experimental-strip-types --test \
  lib/__tests__/banc-conversation-contracts.test.ts \
  lib/__tests__/banc-conversation-state-reducer.test.ts
npx tsc --noEmit
git diff --check
```

Expected: all tests PASS; TypeScript and diff check exit 0.

- [ ] **Step 6: Commit contracts and reducer**

```bash
git add lib/banc-contact.ts lib/banc-conversation/contracts.ts \
  lib/banc-conversation/state-reducer.ts lib/banc-conversation/index.ts \
  lib/__tests__/banc-conversation-contracts.test.ts \
  lib/__tests__/banc-conversation-state-reducer.test.ts
git commit -m "feat: add deterministic conversation state"
```

### Task 3: Build the Approved Banc Content Registry and Knowledge Search

**Files:**
- Create: `lib/banc-content/types.ts`
- Create: `lib/banc-content/approved-content.ts`
- Create: `lib/banc-content/buyers-guide.ts`
- Create: `lib/banc-content/sellers-guide.ts`
- Create: `lib/banc-content/landlords-guide.ts`
- Create: `lib/banc-content/tenants-guide.ts`
- Create: `lib/banc-content/contact.ts`
- Create: `lib/banc-conversation/knowledge.ts`
- Modify: `app/sales/buyers-guide/page.tsx`
- Modify: `app/sales/sellers-guide/page.tsx`
- Modify: `app/lettings/landlords-guide/page.tsx`
- Modify: `app/lettings/tenants-guide/TenantsGuideClient.tsx`
- Modify: `app/contact/ContactPageClient.tsx`
- Test: `lib/__tests__/banc-knowledge.test.ts`
- Test: `lib/__tests__/banc-content-registry.test.ts`

**Interfaces:**
- Consumes: existing visible page copy and `areaGuides` from `lib/area-guides.ts`.
- Produces: `ApprovedBancSection`, `ApprovedBancDocument`, `APPROVED_BANC_DOCUMENTS`, `BancKnowledge`, and `createBancKnowledgeSearch(documents)`.

- [ ] **Step 1: Write failing registry and search tests**

Use representative assertions that prove grounding and source safety:

```ts
test("finds the approved Cuffley area guide with its canonical path", async () => {
  const knowledge = createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS);
  const results = await knowledge.search("What is Cuffley like for families?");

  assert.equal(results[0]?.title, "Cuffley area guide");
  assert.equal(results[0]?.href, "/area-guides/cuffley");
  assert.match(results[0]?.excerpt ?? "", /family|school|countryside/i);
});

test("does not admit external or unregistered sources", () => {
  assert.equal(
    APPROVED_BANC_DOCUMENTS.every(
      (document) => document.href.startsWith("/") && !document.href.startsWith("//"),
    ),
    true,
  );
});
```

Also assert buying, selling, tenant, landlord, and contact queries; stable ranking; maximum excerpt/result lengths; no result for unsupported facts; unique IDs; and a route-existence allowlist covering every registered `href`.

- [ ] **Step 2: Run focused tests and confirm RED**

```bash
node --experimental-strip-types --test \
  lib/__tests__/banc-content-registry.test.ts \
  lib/__tests__/banc-knowledge.test.ts
```

Expected: FAIL because the content modules and knowledge service do not exist.

- [ ] **Step 3: Extract page copy into shared typed modules**

Use structures that pages can render directly:

```ts
export interface ApprovedBancSection {
  id: string;
  title: string;
  body: readonly string[];
  aliases: readonly string[];
}

export interface ApprovedBancPage {
  title: string;
  href: `/${string}`;
  sections: readonly ApprovedBancSection[];
}

export interface ApprovedBancDocument {
  id: string;
  title: string;
  sectionTitle: string;
  href: `/${string}`;
  text: string;
  aliases: readonly string[];
}
```

Move the existing literal copy into these modules without rewriting facts. Update each visible page to import the same arrays. Convert each `areaGuides` item into approved documents during registry assembly rather than copying paragraphs.

- [ ] **Step 4: Implement deterministic local knowledge search**

Define the replaceable boundary and sanitized result:

```ts
export interface BancKnowledgeResult {
  documentId: string;
  title: string;
  href: `/${string}`;
  excerpt: string;
}

export interface BancKnowledge {
  search(query: string): Promise<BancKnowledgeResult[]>;
}
```

Normalize lowercase alphanumeric tokens, remove a small fixed stop-word set, score exact title/alias matches above section/body token matches, sort by score then document ID, return at most three results, and cap excerpts at 480 characters. Return `[]` when no approved token matches. Reject documents whose `href` is not a single-slash local path.

- [ ] **Step 5: Run knowledge, page, and type checks**

```bash
node --experimental-strip-types --test \
  lib/__tests__/banc-content-registry.test.ts \
  lib/__tests__/banc-knowledge.test.ts
npx tsc --noEmit
npx eslint lib/banc-content lib/banc-conversation/knowledge.ts \
  app/sales/buyers-guide/page.tsx app/sales/sellers-guide/page.tsx \
  app/lettings/landlords-guide/page.tsx \
  app/lettings/tenants-guide/TenantsGuideClient.tsx \
  app/contact/ContactPageClient.tsx
```

Expected: focused tests PASS; type check and scoped lint exit 0.

- [ ] **Step 6: Commit the approved content boundary**

```bash
git add lib/banc-content lib/banc-conversation/knowledge.ts \
  app/sales/buyers-guide/page.tsx app/sales/sellers-guide/page.tsx \
  app/lettings/landlords-guide/page.tsx \
  app/lettings/tenants-guide/TenantsGuideClient.tsx \
  app/contact/ContactPageClient.tsx \
  lib/__tests__/banc-content-registry.test.ts \
  lib/__tests__/banc-knowledge.test.ts
git commit -m "feat: ground chat in approved Banc content"
```

### Task 4: Implement CRM-Neutral Portfolio and Trusted Operations

**Files:**
- Create: `lib/banc-conversation/portfolio.ts`
- Create: `lib/banc-conversation/tools.ts`
- Modify: `lib/landing-ui.ts`
- Modify: `lib/banc-conversation/index.ts`
- Test: `lib/__tests__/banc-conversation-portfolio.test.ts`
- Test: `lib/__tests__/banc-conversation-tools.test.ts`

**Interfaces:**
- Consumes: `searchProperties`, `lookupPropertyFacts`, `BancKnowledge`, `ConversationIntent`, `PropertyConversationState`, and deterministic state reduction.
- Produces: `PropertyPortfolio`, `createPropertyPortfolio`, `TrustedOperationResult`, `SanitizedOperationResult`, `sanitizeOperationResult(result)`, and `createConversationTools({ portfolio, knowledge })` while adopting the existing `BANC_CONTACT` constant in landing UI.

- [ ] **Step 1: Write failing portfolio and operation tests**

Cover all approved operation boundaries with injected fakes:

```ts
test("searches the canonical portfolio after applying a location-only mutation", async () => {
  const tools = createConversationTools({ portfolio, knowledge });
  const result = await tools.execute({
    intent: {
      type: "update_property_search",
      mutation: { location: { operation: "set", value: "Cuffley" } },
    },
    message: "Search Cuffley rather than Potters Bar",
    state: fiveBedroomPottersBarState,
  });

  assert.equal(portfolio.searchCalls[0]?.location, "Cuffley");
  assert.equal(portfolio.searchCalls[0]?.minBedrooms, 5);
  assert.equal(portfolio.searchCalls[0]?.maxBedrooms, 5);
});

test("refuses facts for a property outside the active authorized result set", async () => {
  const result = await tools.execute({
    intent: { type: "get_property_facts", propertyIds: ["not-active"] },
    message: "Tell me about that one",
    state: stateWithResults(["active-1"]),
  });

  assert.equal(result.status, "clarification_required");
  assert.equal(portfolio.factCalls.length, 0);
});
```

Also assert:

- a first property-search mutation without a department returns “Are you looking to buy or rent?” and does not call the portfolio;
- search results use canonical server cards, calculate the fingerprint from every ordered result ID plus total before capping, and keep only the first three IDs/cards in public state/UI;
- facts are re-authorized through the portfolio rather than trusted from browser context;
- knowledge returns only sanitized registered excerpts;
- reset clears only property state and returns a new default topic;
- contact uses fixed Banc telephone and WhatsApp destinations;
- property handoffs retain only an authorized active property ID;
- a repeated fingerprint returns no cards;
- zero results return `no_results`, not a failure;
- no operation accepts an arbitrary URL, raw database query, calendar action, or CRM write.

- [ ] **Step 2: Run focused tests and confirm RED**

```bash
node --experimental-strip-types --test \
  lib/__tests__/banc-conversation-portfolio.test.ts \
  lib/__tests__/banc-conversation-tools.test.ts
```

Expected: FAIL because `portfolio.ts` and `tools.ts` do not exist.

- [ ] **Step 3: Implement the CRM-neutral portfolio adapter**

Define the stable interface:

```ts
export interface PropertyPortfolio {
  search(query: PropertySearchQuery): Promise<PropertySearchResult>;
  getFacts(ids: string[]): Promise<PropertyFacts[]>;
}

export function createPropertyPortfolio(dependencies: {
  search: PropertySearch;
  getFacts: PropertyFactLookup;
}): PropertyPortfolio {
  return {
    search: dependencies.search,
    getFacts: dependencies.getFacts,
  };
}
```

Do not expose Supabase or Expert Agent types from this module. Streets can later satisfy the same two methods.

- [ ] **Step 4: Implement the trusted operation executor**

Use a discriminated result union so the handler never guesses whether an operation succeeded:

```ts
export type TrustedOperationResult =
  | { status: "search_results"; state: PropertyConversationState; properties: PropertyCardData[]; total: number }
  | { status: "no_results"; state: PropertyConversationState; total: 0 }
  | { status: "property_facts"; state: PropertyConversationState; facts: PropertyFacts[] }
  | { status: "knowledge"; state: PropertyConversationState; sources: BancKnowledgeResult[] }
  | { status: "reset"; state: PropertyConversationState }
  | { status: "contact"; state: PropertyConversationState; handoff: TrustedHandoff }
  | { status: "clarification_required"; state: PropertyConversationState; question: string };
```

Define the only operation data that response writing may receive:

```ts
export type SanitizedOperationResult =
  | {
      status: "search_results" | "no_results";
      total: number;
      requirements: PropertySearchQuery;
      properties: Array<{
        id: string;
        title: string;
        address: string;
        price: string;
        bedrooms: number;
        bathrooms: number;
        summary: string;
      }>;
    }
  | { status: "property_facts"; facts: PropertyFacts[] }
  | { status: "knowledge"; sources: BancKnowledgeResult[] }
  | { status: "reset" }
  | { status: "contact"; reason: HandoffCategory }
  | { status: "clarification_required"; question: string };
```

`sanitizeOperationResult` must create fresh values and omit internal errors, database fields, source-provider data, contact destinations, and card links. The handler returns cards, sources, and handoff destinations separately from model prose.

Extract the approved Banc values already present in `lib/landing-ui.ts` into one shared constant and consume it from both landing UI and conversation tools:

```ts
export const BANC_CONTACT = {
  displayPhone: "01707 877781",
  callHref: "tel:01707877781",
  whatsappHref:
    "https://wa.me/447707877781?text=Hi%2C%20I'm%20interested%20in%20a%20property%20I%20saw%20on%20your%20website.",
} as const;
```

Do not duplicate those strings elsewhere. `contact_banc` may attach an authorized active property ID to trusted server metadata, but must not alter the fixed destinations or claim the team was contacted.

- [ ] **Step 5: Run all focused trusted-boundary checks**

```bash
node --experimental-strip-types --test \
  lib/__tests__/banc-conversation-contracts.test.ts \
  lib/__tests__/banc-conversation-state-reducer.test.ts \
  lib/__tests__/banc-conversation-portfolio.test.ts \
  lib/__tests__/banc-conversation-tools.test.ts
npx tsc --noEmit
git diff --check
```

Expected: all tests PASS and both checks exit 0.

- [ ] **Step 6: Commit trusted operations**

```bash
git add lib/banc-conversation/portfolio.ts \
  lib/banc-conversation/tools.ts lib/banc-conversation/index.ts \
  lib/landing-ui.ts lib/__tests__/banc-conversation-portfolio.test.ts \
  lib/__tests__/banc-conversation-tools.test.ts
git commit -m "feat: add trusted Banc conversation tools"
```

### Task 5: Add Abortable OpenAI Intent and Response Clients

**Files:**
- Create: `lib/banc-conversation/prompt.ts`
- Create: `lib/banc-conversation/openai.ts`
- Test: `lib/__tests__/banc-conversation-openai.test.ts`
- Test: `lib/__tests__/banc-conversation-prompt.test.ts`

**Interfaces:**
- Consumes: strict conversation-plan and response schemas from `contracts.ts`, sanitized recent history, untrusted current state, and sanitized trusted operation results.
- Produces: `ConversationModel`, `createOpenAIConversationModel(options)`, `selectPlan(input)`, the internal bounded repair call, and `writeResponse(input)`.

- [ ] **Step 1: Write failing provider-boundary tests**

Inject a fake `fetch` and assert request/response behavior without calling OpenAI:

```ts
test("repairs malformed intent exactly once with validation feedback", async () => {
  const fetch = createSequenceFetch([
    openAIJsonResponse({ type: "update_property_search", mutation: { location: null } }),
    openAIJsonResponse({
      type: "update_property_search",
      mutation: { location: { operation: "set", value: "Cuffley" } },
    }),
  ]);
  const model = createOpenAIConversationModel({ apiKey: "test-key", fetch });

  const result = await model.selectPlan(validTurnInput, abortSignal);

  assert.equal(result.status, "ok");
  assert.equal(fetch.calls.length, 2);
  assert.equal(fetch.calls[1]?.body.includes("location"), true);
  assert.equal(fetch.calls[1]?.body.includes("test-key"), false);
});
```

Also assert:

- valid intent requires one provider call;
- third provider call is never attempted;
- malformed intent after repair returns `interpretation_invalid`;
- abort and deadline failures map to `model_timeout`;
- 429 maps to `rate_limited`; missing key maps to `configuration_missing`; other provider failures map to `model_unavailable`;
- response prose cannot include URLs or untrusted property facts;
- raw history is sent only to intent selection and response writing as bounded text, never logged or placed in repair validation feedback;
- output-token limits, model name, structured schema, and signal are included in every request.

- [ ] **Step 2: Run the focused tests and confirm RED**

```bash
node --experimental-strip-types --test \
  lib/__tests__/banc-conversation-openai.test.ts \
  lib/__tests__/banc-conversation-prompt.test.ts
```

Expected: FAIL because the client and prompt do not exist.

- [ ] **Step 3: Implement prompt constants for two bounded model jobs**

Create separate instruction strings:

```ts
export const BANC_INTENT_INSTRUCTIONS = `
You are the intent layer for Banc Property's conversational estate agent.
Return one primary approved intent and at most one allowed supporting intent.
Omitted search fields mean preserve them.
Never invent a property, fact, URL, policy, local fact, or completed action.
Use search_banc_knowledge for Banc area, buying, selling, renting, landlord,
tenant, service, branch, or contact questions. Use clarify when the request
cannot be represented safely. Current-message bedroom language is authoritative.
`.trim();

export const BANC_RESPONSE_INSTRUCTIONS = `
Write a warm, concise Banc estate-agent reply using only the sanitized trusted
result supplied by the server. Ask at most one useful question. Do not include
URLs, phone numbers, markdown links, unsupported facts, or action claims.
Zero results are normal: state the active requirements and suggest one sensible
relaxation without silently changing the search.
`.trim();
```

Include the approved intent JSON schema and a compact state summary. Never put credentials or raw property records in prompts.

- [ ] **Step 4: Implement the abortable Responses API client and repair**

Define the provider-independent interface:

```ts
export interface IntentSelectionInput {
  message: string;
  history: readonly ConversationMessage[];
  state: PropertyConversationState;
}

export interface ResponseWritingInput extends IntentSelectionInput {
  results: readonly SanitizedOperationResult[];
}

export type ModelFailureCategory =
  | "interpretation_invalid"
  | "model_timeout"
  | "model_unavailable"
  | "configuration_missing"
  | "rate_limited";

export type ModelPlanResult =
  | { status: "ok"; plan: ConversationPlan; providerCalls: 1 | 2 }
  | { status: ModelFailureCategory; providerCalls: 0 | 1 | 2 };

export type ModelResponseResult =
  | { status: "ok"; response: string; providerCalls: 1 }
  | { status: Exclude<ModelFailureCategory, "interpretation_invalid">; providerCalls: 0 | 1 };

export interface ConversationModel {
  selectPlan(
    input: IntentSelectionInput,
    signal: AbortSignal,
  ): Promise<ModelPlanResult>;
  writeResponse(
    input: ResponseWritingInput,
    signal: AbortSignal,
  ): Promise<ModelResponseResult>;
}
```

`selectPlan` performs one normal call, validates through `parseConversationPlan`, and performs one repair call only on schema failure. The returned plan contains one primary operation and at most one allowed supporting operation. `writeResponse` validates a strict `{ response: string }` schema. Use the configured `OPENAI_CHAT_MODEL`, a bounded output-token count, `store: false`, the passed abort signal, and no provider-side conversation persistence.

- [ ] **Step 5: Run focused tests, type check, and scoped lint**

```bash
node --experimental-strip-types --test \
  lib/__tests__/banc-conversation-openai.test.ts \
  lib/__tests__/banc-conversation-prompt.test.ts
npx tsc --noEmit
npx eslint lib/banc-conversation/openai.ts lib/banc-conversation/prompt.ts \
  lib/__tests__/banc-conversation-openai.test.ts \
  lib/__tests__/banc-conversation-prompt.test.ts
```

Expected: all tests PASS; type check and lint exit 0.

- [ ] **Step 6: Commit the model boundary**

```bash
git add lib/banc-conversation/openai.ts lib/banc-conversation/prompt.ts \
  lib/__tests__/banc-conversation-openai.test.ts \
  lib/__tests__/banc-conversation-prompt.test.ts
git commit -m "feat: add bounded conversation model client"
```

### Task 6: Orchestrate Turns and Cut Over the Chat API

**Files:**
- Create: `lib/banc-conversation/handler.ts`
- Modify: `lib/banc-conversation/index.ts`
- Modify: `app/api/chat/route.ts`
- Test: `lib/__tests__/banc-conversation-handler.test.ts`
- Test: `lib/__tests__/banc-chat-route.test.ts`

**Interfaces:**
- Consumes: `ConversationModel`, `ConversationTools`, request/response parsers, safe correlation ID, and injected monotonic clock.
- Produces: `createBancConversationHandler(dependencies)`, category-specific server copy, and the live `POST /api/chat` implementation.

- [ ] **Step 1: Write failing end-to-end handler tests**

Use fake model and trusted services to cover multi-turn behavior:

```ts
test("handles Potters Bar to Cuffley as a successful location replacement", async () => {
  const first = await handler(requestFor("Any five-bedroom homes in Potters Bar?"));
  assert.equal(first.action, "no_results");
  assert.equal(first.context.query?.minBedrooms, 5);
  assert.equal(first.context.query?.maxBedrooms, 5);

  const second = await handler(
    requestFor("Search Cuffley rather than Potters Bar", first.context),
  );
  assert.equal(second.action, "search_results");
  assert.equal(second.context.query?.location, "Cuffley");
  assert.equal(second.context.query?.minBedrooms, 5);
  assert.equal(second.context.query?.maxBedrooms, 5);
});

test("preserves state and asks a focused question after failed repair", async () => {
  const response = await invalidIntentHandler(requestWithActiveSearch);
  assert.equal(response.action, "clarify");
  assert.deepEqual(response.context, requestWithActiveSearch.context);
  assert.match(response.response, /location|price|bedroom|property/i);
});
```

Add regression cases for exact/minimum bedrooms, price, location, department, feature and type refinements, facts for first/second properties, comparisons, unchanged-card suppression, Banc content answers with sources, unsupported facts, reset, Call/WhatsApp, zero results, model timeout, provider unavailable, property unavailable, knowledge unavailable, missing configuration, rate limiting, and the two-operation/three-provider-call limits.

- [ ] **Step 2: Run handler and route tests and confirm RED**

```bash
node --experimental-strip-types --test \
  lib/__tests__/banc-conversation-handler.test.ts \
  lib/__tests__/banc-chat-route.test.ts
```

Expected: FAIL because the new handler is not connected to `/api/chat`.

- [ ] **Step 3: Implement the 20-second orchestration budget**

Use a single deadline and per-call abort controller:

```ts
const TURN_BUDGET_MS = 20_000;
const MAX_TRUSTED_OPERATIONS = 2;
const MAX_PROVIDER_CALLS = 3;

function remainingMs(deadline: number, now: () => number): number {
  return Math.max(0, deadline - now());
}
```

Flow:

1. Parse request and normalize state.
2. Select/repair one plan containing one primary and at most one supporting intent.
3. Execute the primary operation, then execute the allowed supporting operation only when the first succeeded, the supporting operation remains valid against the updated state, and operation budget remains.
4. For tool-backed success, write one grounded response if provider-call budget and time remain.
5. Return server-owned clarification or category-specific recovery copy otherwise.
6. Validate the final public response before returning it.

Use fixed public messages per failure category. Preserve incoming trusted state for failures. Do not convert zero results to `service_unavailable`.

- [ ] **Step 4: Implement safe diagnostics**

Inject a logger whose event contains only:

```ts
export type ApprovedToolName = ConversationIntent["type"];

export type ConversationFailureCategory =
  | ModelFailureCategory
  | "property_search_unavailable"
  | "knowledge_unavailable";

export interface ConversationDiagnosticEvent {
  category: ConversationFailureCategory;
  requestId: string;
  durationBucket: "under_1s" | "1_to_5s" | "5_to_20s" | "over_20s";
  tool?: ApprovedToolName;
}
```

The default logger may use `console.warn` with that object. Tests must inspect every logged object and assert it has no message, history, response, payload, property, API key, URL, phone, or secret field.

- [ ] **Step 5: Cut `/api/chat` over to the new package**

Construct dependencies once at module scope:

```ts
const portfolio = createPropertyPortfolio({
  search: searchProperties,
  getFacts: lookupPropertyFacts,
});
const knowledge = createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS);
const tools = createConversationTools({ portfolio, knowledge });
const model = createOpenAIConversationModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_CHAT_MODEL,
});
const handleConversation = createBancConversationHandler({ model, tools });
```

Generate `requestId` with `crypto.randomUUID()`, return 400 for malformed JSON or invalid request, and return only a validated `ConversationResponse`. Do not change route URL or environment variable names.

- [ ] **Step 6: Run handler, route, type, and lint gates**

```bash
node --experimental-strip-types --test \
  lib/__tests__/banc-conversation-handler.test.ts \
  lib/__tests__/banc-chat-route.test.ts
npx tsc --noEmit
npx eslint app/api/chat/route.ts lib/banc-conversation
git diff --check
```

Expected: all tests PASS; TypeScript, scoped lint, and diff check exit 0.

- [ ] **Step 7: Commit the API cutover**

```bash
git add lib/banc-conversation/handler.ts lib/banc-conversation/index.ts \
  app/api/chat/route.ts lib/__tests__/banc-conversation-handler.test.ts \
  lib/__tests__/banc-chat-route.test.ts
git commit -m "feat: cut chat API over to conversational agent"
```

### Task 7: Render Sources and Trusted Call or WhatsApp Handoffs

**Files:**
- Modify: `lib/property-chat-submit.ts`
- Modify: `components/ai/PropertyChatbot.tsx`
- Create: `lib/__tests__/property-chat-submit.test.ts`
- Create: `lib/__tests__/property-chat-ui.test.ts`

**Interfaces:**
- Consumes: `ConversationRequest`, `ConversationResponse`, `PropertyConversationState`, trusted source links, trusted handoff links, and existing modal-focus helpers.
- Produces: UI message fields `sources` and `handoff`, source-link rendering, and Call/WhatsApp controls.

- [ ] **Step 1: Write failing submit and UI tests**

Extend message behavior tests:

```ts
test("carries only parsed trusted sources and handoff links into the assistant message", async () => {
  await runPropertyChatTurn({
    ...options,
    request: async () => ({
      response: "The Banc guide explains the next steps.",
      action: "answer",
      sources: [{ title: "Buyers guide", href: "/sales/buyers-guide" }],
      handoff: {
        callHref: BANC_CONTACT.callHref,
        whatsappHref: BANC_CONTACT.whatsappHref,
      },
      context: emptyConversationState,
    }),
  });

  assert.deepEqual(assistantMessage.sources, [
    { title: "Buyers guide", href: "/sales/buyers-guide" },
  ]);
  assert.equal(assistantMessage.handoff?.callHref, BANC_CONTACT.callHref);
});
```

Add source-level UI assertions that:

- source links use Next `Link` and their validated relative paths;
- Call renders `href={message.handoff.callHref}`;
- WhatsApp renders `target="_blank"` and `rel="noopener noreferrer"`;
- model prose is never parsed for links;
- a contact action without a valid handoff renders no button;
- assistant cards still use `buildPropertyHref` and trusted property IDs;
- single-flight submission, error recovery, quick replies, loading state, Escape close, focus trap, launcher focus restoration, and message scrolling remain intact.

- [ ] **Step 2: Run the focused tests and confirm RED**

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-chat-submit.test.ts \
  lib/__tests__/property-chat-ui.test.ts
```

Expected: FAIL because assistant messages do not yet carry sources or handoffs.

- [ ] **Step 3: Extend the UI message model and request flow**

Update `PropertyChatMessage`:

```ts
export interface PropertyChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  properties?: PropertyCardData[];
  sources?: Array<{ title: string; href: string }>;
  handoff?: { callHref: string; whatsappHref: string };
  action?: ConversationAction;
  timestamp: Date;
}
```

Update the view helper to return cloned trusted fields and no derived generic contact flag:

```ts
export interface PropertyChatMessageView {
  properties: PropertyCardData[];
  sources: Array<{ title: string; href: string }>;
  handoff?: { callHref: string; whatsappHref: string };
}
```

Build the request from the latest 20 prose messages and current in-memory context. Parse the public response before changing context or rendering structured fields. Keep the current fixed connection-error copy for transport or invalid-response failures.

Initialize `conversationContext` with `createInitialConversationState()` inside `useState`; do not read or write local storage, cookies, Supabase, or any transcript endpoint.

- [ ] **Step 4: Render sources and handoff controls**

Under assistant prose, render sources only when present:

```tsx
{view.sources.map((source) => (
  <Link key={source.href} href={source.href} className="...">
    {source.title}
  </Link>
))}
```

Render handoff actions as two clear buttons:

```tsx
<a href={view.handoff.callHref} className="...">
  <Phone aria-hidden="true" /> Call Banc
</a>
<a
  href={view.handoff.whatsappHref}
  target="_blank"
  rel="noopener noreferrer"
  className="..."
>
  <MessageCircle aria-hidden="true" /> WhatsApp Banc
</a>
```

Use the existing Banc palette, minimum 44px touch targets, visible focus rings, and a stacked mobile layout. Do not add another floating contact control or another robot icon.

- [ ] **Step 5: Run focused UI, accessibility, type, and lint checks**

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-chat-submit.test.ts \
  lib/__tests__/property-chat-ui.test.ts \
  lib/__tests__/property-chat.test.ts \
  lib/__tests__/modal-focus-lifecycle.test.ts
npx tsc --noEmit
npx eslint lib/property-chat-submit.ts components/ai/PropertyChatbot.tsx
git diff --check
```

Expected: all focused tests PASS; type check, lint, and diff check exit 0.

- [ ] **Step 6: Commit the trusted UI fields**

```bash
git add lib/property-chat-submit.ts components/ai/PropertyChatbot.tsx \
  lib/__tests__/property-chat-submit.test.ts \
  lib/__tests__/property-chat-ui.test.ts
git commit -m "feat: show grounded sources and contact actions"
```

### Task 8: Retire Superseded Conversation Orchestration

**Files:**
- Delete: `lib/property-conversation/contracts.ts`
- Delete: `lib/property-conversation/handler.ts`
- Delete: `lib/property-conversation/index.ts`
- Delete: `lib/property-conversation/openai.ts`
- Delete: `lib/property-conversation/prompt.ts`
- Delete: `lib/property-conversation/property-facts.ts`
- Delete: `lib/property-conversation/tools.ts`
- Delete: `lib/property-conversation/bedroom-intent.ts`
- Delete: `lib/property-chat.ts`
- Delete: `lib/__tests__/property-conversation-bedroom.test.ts`
- Delete: `lib/__tests__/property-conversation-contracts.test.ts`
- Delete: `lib/__tests__/property-conversation-facts.test.ts`
- Delete: `lib/__tests__/property-conversation-handler.test.ts`
- Delete: `lib/__tests__/property-conversation-openai.test.ts`
- Delete: `lib/__tests__/property-conversation-tools.test.ts`
- Delete: `lib/__tests__/property-chat.test.ts`
- Create: `docs/audits/2026-08-31-banc-conversational-estate-agent-test-matrix.md`

**Interfaces:**
- Consumes: the complete replacement package and retained UI submit helper.
- Produces: one live conversation implementation, no production imports from the old package, and a permanent behavior-to-test matrix.

- [ ] **Step 1: Prove the replacement suite already covers retained behavior**

Create the audit matrix with one row per acceptance behavior and the exact test name/file that proves it. It must include:

- exact/minimum bedrooms and current-message override;
- Potters Bar to Cuffley field preservation;
- price, feature, type, tenure, department, reset, and unchanged-state refinements;
- active-property authorization, fact comparison, canonical card/detail links, and unchanged-card suppression;
- approved Banc content, missing source, Call, and WhatsApp;
- malformed intent repair, timeout, service failure, configuration, and rate-limit recovery;
- request/response validation, history bounds, single-flight UI, modal focus, and safe logs.

Run the named tests from the matrix before deleting anything:

```bash
node --experimental-strip-types --test \
  lib/__tests__/banc-conversation*.test.ts \
  lib/__tests__/banc-content-registry.test.ts \
  lib/__tests__/banc-knowledge.test.ts \
  lib/__tests__/banc-chat-route.test.ts \
  lib/__tests__/property-chat-submit.test.ts \
  lib/__tests__/property-chat-ui.test.ts
```

Expected: every replacement regression test PASS.

- [ ] **Step 2: Scan importers before deletion**

Run:

```bash
rg -n "property-conversation|from ['\"]\.?\.?/.*property-chat['\"]|from ['\"]@/lib/property-chat['\"]" \
  app components lib --glob '!lib/property-conversation/**'
```

Expected: no production importer of the old package or `lib/property-chat.ts`. Matches may remain only in the seven legacy test files explicitly listed for deletion in this task; Task 7 and the audit matrix must already contain their retained behavioral assertions.

- [ ] **Step 3: Delete the superseded implementation and reduce legacy tests**

Delete only the files listed in this task, including `property-chat.test.ts` after Task 7 has moved its request, response, single-flight, canonical-link, image-safety, and accessible-dialog assertions into the focused replacement tests. Keep `lib/property-chat-submit.ts`, `lib/property-facts.ts`, and `lib/property-search/bedroom-intent.ts`.

- [ ] **Step 4: Prove no old implementation remains**

```bash
test ! -e lib/property-conversation
test ! -e lib/property-chat.ts
! rg -n "property-conversation|from ['\"]\.?\.?/.*property-chat['\"]|from ['\"]@/lib/property-chat['\"]" \
  app components lib
```

Expected: all three commands exit 0 and produce no matches.

- [ ] **Step 5: Run the complete local quality gate**

```bash
node --experimental-strip-types --test lib/__tests__/*.test.ts
npx tsc --noEmit
npx eslint app/api/chat/route.ts components/ai/PropertyChatbot.tsx \
  lib/banc-conversation lib/banc-content lib/property-chat-submit.ts \
  lib/property-facts.ts lib/property-search/bedroom-intent.ts
npm run build
git diff --check
```

Expected: full test suite PASS, strict TypeScript exit 0, scoped lint exit 0, production build exit 0, and diff check clean.

- [ ] **Step 6: Commit the clean cutover**

```bash
git add -u lib/property-conversation lib/property-chat.ts lib/__tests__
git add docs/audits/2026-08-31-banc-conversational-estate-agent-test-matrix.md
git commit -m "refactor: retire scripted property chatbot"
```

### Task 9: Deploy and Verify an Immutable Preview

**Files:**
- Create: `docs/audits/2026-08-31-banc-conversational-estate-agent-preview.md`

**Interfaces:**
- Consumes: the locally verified build, existing linked Vercel project, Preview-scoped `OPENAI_API_KEY`, `OPENAI_CHAT_MODEL`, and Supabase variables.
- Produces: one immutable Preview URL, automated/live acceptance evidence, and an approved sharing route for Nitesh.

**Deployment scope:** Create one Preview deployment only. Do not modify any Production environment variable, Production alias, or Production traffic.

- [ ] **Step 1: Verify the deployment scope before creating external state**

Run read-only checks:

```bash
git status --short --untracked-files=no
git log -1 --oneline
vercel project inspect
vercel env ls preview
```

Expected: tracked worktree clean; correct Banc Vercel project; Preview has the OpenAI model/key and required Supabase variables. Do not print secret values. If any variable is absent, stop before deployment and have the user add it in Vercel Preview settings.

- [ ] **Step 2: Deploy Preview only**

Run:

```bash
vercel deploy --yes
```

Expected: command returns a unique `https://...vercel.app` Preview URL. Do not use `--prod`, do not assign the Production domain, and do not modify Production environment variables.

- [ ] **Step 3: Record deployment identity before testing**

Write the Preview audit with:

- Git commit SHA;
- immutable Preview URL;
- deployment ID and ready timestamp from `vercel inspect <preview-url>`;
- confirmation that environment is Preview, not Production;
- a redacted variable-presence table containing names and present/missing state only.

- [ ] **Step 4: Run the scripted multi-turn acceptance conversation**

In the signed-in browser, test one fresh session and record exact observed actions, returned property IDs, and pass/fail without copying personal data:

1. “Any five-bedroom homes in Potters Bar?”
2. “Search Cuffley rather than Potters Bar.”
3. “Make it cheaper.”
4. “Keep everything else the same but add parking.”
5. “At least four bedrooms.”
6. “Actually I want to rent.”
7. “Tell me about the first property.”
8. “How does it compare with the second?”
9. Ask a question about Cuffley, buying, renting, and Banc services.
10. Ask for an unsupported local fact and confirm the assistant does not invent it.
11. Ask to arrange a viewing and confirm trusted Call and WhatsApp controls appear.
12. “Start again” and confirm search state clears.

For step 2, require location `Cuffley`, department `sales`, `minBedrooms=5`, `maxBedrooms=5`, no generic error, and only live Banc cards.

- [ ] **Step 5: Verify links and responsive interaction**

On desktop and a mobile viewport:

- open every returned property card and confirm it reaches the correct sales/lettings property detail route;
- open each Banc source link and confirm its page title matches;
- check chat scrolling, loading, input reachability above the mobile keyboard, quick replies, close/reopen state, Escape, focus restoration, and no repeated cards for fact-only questions;
- click Call and inspect the trusted `tel:` destination;
- click WhatsApp and confirm the approved Banc destination in a new tab;
- reload and confirm the session conversation is cleared.

- [ ] **Step 6: Exercise category-specific recovery safely**

Use injected local handler tests as the evidence for model, property, knowledge, configuration, and rate-limit failures. On Preview, perform only non-destructive checks: an ambiguous request must clarify, zero matches must not show an outage, and rapid duplicate submit must remain single-flight. Do not remove Preview variables or disrupt the live property source to manufacture failures.

- [ ] **Step 7: Re-run the final repository gate against the deployed commit**

```bash
node --experimental-strip-types --test lib/__tests__/*.test.ts
npx tsc --noEmit
npx eslint app/api/chat/route.ts components/ai/PropertyChatbot.tsx \
  lib/banc-conversation lib/banc-content lib/property-chat-submit.ts \
  lib/property-facts.ts lib/property-search/bedroom-intent.ts
npm run build
git diff --check
git status --short --untracked-files=no
```

Expected: tests/build/checks PASS and tracked worktree clean.

- [ ] **Step 8: Commit the Preview acceptance record**

```bash
git add docs/audits/2026-08-31-banc-conversational-estate-agent-preview.md
git commit -m "docs: record conversational agent preview acceptance"
```

- [ ] **Step 9: Share safely with Nitesh**

If the Preview is protected, use one of these separately authorized paths:

1. invite Nitesh as a Vercel project viewer; or
2. create a deployment-specific share link for this Preview only.

Do not disable project-wide deployment protection and do not create a reusable protection-bypass token. Record which path was used in the audit. Keep the Production alias unchanged.

## Final Verification Checklist

- [ ] The complete Node test suite passes.
- [ ] `npx tsc --noEmit` passes under strict TypeScript.
- [ ] Scoped ESLint passes with no new suppressions.
- [ ] `npm run build` completes successfully.
- [ ] `git diff --check` is clean and the tracked worktree is clean.
- [ ] No old `property-conversation` or `property-chat.ts` production code/import remains.
- [ ] No transcript, local-storage persistence, public-web tool, arbitrary URL tool, CRM write, or new dependency exists.
- [ ] The Potters Bar to Cuffley conversation preserves exact five bedrooms and succeeds without a generic error.
- [ ] Cards, property links, Banc sources, phone, and WhatsApp are built from trusted server fields only.
- [ ] Zero results, ambiguity, provider failure, property failure, knowledge failure, configuration failure, and rate limiting each preserve context and produce the intended public behavior.
- [ ] Mobile and desktop Preview interaction checks pass.
- [ ] The shared URL is the immutable Preview and is accessible to Nitesh through an approved narrow sharing method.
- [ ] Production deployment, Production aliases, Production environment variables, and Production traffic remain unchanged.
