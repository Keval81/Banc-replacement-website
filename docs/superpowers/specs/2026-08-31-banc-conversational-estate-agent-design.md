# Banc Conversational Estate Agent Design

**Status:** Approved 2026-08-31

**Project:** Banc Property replacement website

**Replaces:** The conversation architecture in `2026-08-28-banc-conversational-property-assistant-design.md`

**Retains:** The canonical property-search model, exact-bedroom semantics, trusted property facts, safe cards and CRM-neutral property boundary

## Purpose

Build the product Banc originally intended: a natural conversational estate
agent that searches Banc's real portfolio, remembers and refines a visitor's
requirements, discusses returned properties, answers broader questions from
approved Banc content, and moves suitable enquiries to Call or WhatsApp.

The current assistant is factually cautious but too brittle. A valid follow-up
such as “Search Cuffley rather than Potters Bar” can be rejected at the model
tool boundary and converted into a generic outage message. Adding phrase-level
patches would continue that cycle. This design replaces the brittle
conversation boundary while preserving the trusted property-data foundation.

## Product Scope

The first release supports:

- natural multi-turn sales and lettings searches;
- search refinements that preserve unspecified requirements;
- questions and comparisons about active Banc listings;
- questions answered from approved Banc website content;
- warm, concise estate-agent conversation;
- session-only memory while the current page session remains open;
- Call and WhatsApp handoff buttons;
- Expert Agent data today and a replaceable Streets adapter later.

The assistant must not:

- browse the public web or answer local facts from general model memory;
- invent a listing, fact, availability claim or Banc policy;
- give personalised mortgage, legal, tax, investment or valuation advice;
- book a viewing, submit an offer or claim that an action was completed;
- collect names, phone numbers or other lead details inside chat in this release;
- retain conversations across page sessions or store identifiable transcripts;
- depend on Expert Agent-specific behavior outside the current source adapter.

## Experience and Voice

The assistant sounds like a warm, knowledgeable Banc negotiator. It is
conversational and concise, asks one useful question at a time, avoids robotic
lists unless the visitor requests them, and does not pressure the visitor.

Examples of required behavior:

1. Visitor: “Any five-bedroom homes in Potters Bar?”
2. Assistant: explains truthfully that there are no matches and offers a useful
   next step.
3. Visitor: “Search Cuffley rather than Potters Bar.”
4. Assistant: replaces only the location, preserves sales and exactly five
   bedrooms, searches again, and responds from the new results.

Other required refinements include “make it cheaper,” “keep everything else
the same,” “with parking,” “at least four bedrooms,” “actually I want to rent,”
and “start again.” Ambiguity produces a focused clarification rather than a
generic technical failure.

Property cards appear only when a search creates a changed result set. A
question about current results receives an answer without repeating cards.
Property and Banc-page links are built by trusted server code, never by model
prose.

## Architecture

### Core principle

The model understands and communicates; the server owns state, facts, search
semantics, links, actions and safety.

The model never constructs a complete canonical property query. It proposes a
small typed intent or state mutation. The server validates that proposal,
applies it to the trusted current state, executes the relevant trusted service,
and supplies the verified result back to the model for natural wording.

### Turn flow

Each visitor turn follows this sequence:

1. Validate the message, recent history and untrusted browser context.
2. Ask the model to select one primary approved intent, optionally with one
   supporting operation, and propose any required small typed state mutation.
3. Validate the intent. If it is malformed, make one bounded repair attempt
   using only validation feedback, never secrets or raw internal records.
4. Apply the valid mutation through the deterministic conversation-state
   reducer. Unmentioned fields mean keep; set and clear are mutually exclusive
   by schema.
5. Execute the corresponding trusted property, knowledge or handoff service.
6. Give the model only sanitized results and ask it for a short plain-text
   response with a validated action.
7. Return server-built cards, links, context and handoff controls separately
   from model prose.
8. If interpretation still fails, preserve state and ask one server-owned
   clarification question based on the active search.

The total route budget is 20 seconds. Every provider request is abortable and
must respect the remaining route budget. A repair attempt runs only when time
remains; it cannot extend the total budget.

### Conversation state

The browser retains state only in the active React page session. Reloading or
closing the page starts a new conversation. Nothing is written to local
storage or a transcript database.

The public state contains:

```ts
interface PropertyConversationState {
  query?: PropertySearchQuery;
  resultPropertyIds: string[];
  focusedPropertyId?: string;
  resultFingerprint?: string;
  topic: "property_search" | "property_detail" | "banc_knowledge" | "handoff";
}
```

The browser state is always treated as untrusted. Active property identifiers
are re-authorized against marketable canonical records before facts or cards
are returned. History remains capped at 20 messages and 2,000 characters per
message.

### Typed search mutations

The existing model-facing search tool requires a full set of fields plus a
separate clear list. That permits contradictory outputs such as setting and
clearing a location together. It is replaced by a patch contract where each
field has exactly one operation:

```ts
type FieldMutation<T> =
  | { operation: "set"; value: T }
  | { operation: "clear" };

interface PropertySearchMutation {
  department?: { operation: "set"; value: "sales" | "lettings" };
  location?: FieldMutation<string>;
  minPrice?: FieldMutation<number>;
  maxPrice?: FieldMutation<number>;
  bedrooms?: FieldMutation<{ mode: "exact" | "minimum"; value: number }>;
  minBathrooms?: FieldMutation<number>;
  propertyTypes?: FieldMutation<PropertyType[]>;
  tenures?: FieldMutation<Tenure[]>;
  features?: FieldMutation<SearchFeature[]>;
  sort?: FieldMutation<PropertySort>;
}
```

An omitted field always means preserve the active value. The reducer applies
mutations deterministically, resets pagination, and preserves exact-bedroom
rules. Explicit current-message numeric bedroom language remains
deterministically authoritative over model interpretation.

“Cuffley rather than Potters Bar” yields only
`location: { operation: "set", value: "Cuffley" }`. The active department and
five-bedroom constraint remain unchanged.

### Approved intents and tools

The model may select only these bounded operations:

1. `update_property_search`
   - Applies a typed mutation to the current search and queries live listings.
2. `get_property_facts`
   - Reads sanitized facts for one to three authorized active properties.
3. `search_banc_knowledge`
   - Searches approved Banc website content and returns source-labelled
     excerpts and canonical Banc page paths.
4. `reset_conversation_search`
   - Clears property-search state only when the visitor clearly requests it.
5. `contact_banc`
   - Selects a fixed handoff category and returns Call or WhatsApp controls.
6. `clarify`
   - Asks one focused question without calling a data service or changing state.

There is no browser, arbitrary URL, email, calendar, CRM-write, database-query
or transaction tool.

One turn may use at most two trusted tool operations and three provider calls,
including any repair call. If a compound request needs more work, the
assistant completes the primary request and offers the remaining step next.

## Trusted Service Boundaries

### Property portfolio

The conversation layer depends on a CRM-neutral interface:

```ts
interface PropertyPortfolio {
  search(query: PropertySearchQuery): Promise<PropertySearchResult>;
  getFacts(ids: string[]): Promise<PropertyFacts[]>;
}
```

The current implementation continues to use the canonical Supabase property
store populated from Expert Agent. Streets will later implement or feed the
same interface. Streets-only capabilities are added as separate explicit tools
after credentials, API behavior and product scope are known.

### Banc knowledge

The knowledge service uses only approved content already maintained in the
Banc website:

- area guides;
- buying, selling and renting guides;
- landlord and tenant information;
- Banc services, branches and contact information;
- other explicitly approved website pages.

At build time, a source registry produces small structured documents containing
page title, section title, canonical path, approved text and search aliases.
A server-only knowledge search ranks those documents and returns only the most
relevant excerpts. The initial corpus is small enough that this requires no new
database, vector store or dependency.

The registry and visible pages share canonical structured content modules; the
knowledge index does not maintain a second copy of facts. Existing hard-coded
approved content is extracted into a shared module only where needed. Build
tests verify that every registered source path exists and that no unregistered
page enters the index.

The model receives excerpts only after calling `search_banc_knowledge`. It may
paraphrase those excerpts but cannot add unsupported local facts. If no source
answers the question, it says the information is not available in Banc's
content and offers Call or WhatsApp. The service remains replaceable by a CMS
adapter later.

### Handoff

The first release does not collect personal data in chat. Viewing, valuation,
offer, availability, personalised finance/legal and explicit human-help intents
return fixed Banc wording plus:

- a Call button using Banc's approved phone number;
- a WhatsApp button using Banc's approved destination;
- a relevant property identifier when the handoff concerns an active listing.

No model-generated phone number, WhatsApp destination or action claim is
rendered.

## Response Contract and UI

The public response continues to separate prose from trusted UI data:

```ts
interface ConversationResponse {
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
```

Model prose is plain text. Cards, Banc content links and handoff buttons are
rendered only from separately validated server fields. Search cards are capped
at three and returned only when the result fingerprint changes.

The existing chatbot window remains. Its message layout gains optional Banc
source links and Call/WhatsApp actions. Loading remains single-flight, the
input stays reachable on mobile, focus remains trapped while open, and Escape
restores focus to the launcher.

## Safety and Recovery

The system distinguishes failure categories instead of converting everything
to one generic response:

- `interpretation_invalid`: one repair attempt, then a focused clarification;
- `model_timeout` or `model_unavailable`: preserve state and explain that the
  conversational service is temporarily unavailable;
- `property_search_unavailable`: preserve requirements and explain that live
  listings cannot currently be checked;
- `knowledge_unavailable`: preserve the conversation and offer the relevant
  Banc page or human contact where available;
- `configuration_missing`: disable conversation cleanly in that environment;
- `rate_limited`: ask the visitor to pause before trying again.

Public responses never include those internal codes. Server logs contain only
the safe category, route request ID, duration bucket and tool name. They do not
contain visitor text, model output, property payloads, credentials or secrets.

Zero matches are not failures. The assistant describes the active requirements
and suggests one sensible relaxation, but never silently broadens the search.

Before Production rollout, Vercel rate limiting must cap repeated `/api/chat`
requests per client. The application separately retains its message, history,
tool-round, output-token, result-count and total-duration limits.

## Testing

All implementation work follows test-driven development.

### Deterministic tests

- field mutations preserve omitted filters and make set/clear exclusive;
- “Cuffley rather than Potters Bar” preserves sales and exactly five bedrooms;
- “make it cheaper,” “keep everything else the same,” “with parking,” “at
  least four bedrooms,” “actually I want to rent,” and “start again” produce
  the required state transitions;
- explicit current-message bedroom language overrides a conflicting model
  proposal;
- property identifiers, cards, links, Banc sources and handoffs remain
  server-authorized;
- malformed output receives one repair attempt and then clarification without
  losing state;
- timeout and service failures return category-specific user copy;
- unchanged result fingerprints do not repeat cards.

### Knowledge tests

- only registered Banc content is indexed;
- relevant area/service/guide queries return the expected approved source;
- missing information produces an honest no-source response;
- no public-web URL or unregistered source can enter the response;
- source links use canonical Banc paths.

### Live Preview acceptance

A new immutable Preview must pass scripted multi-turn conversations including:

1. no five-bedroom Potters Bar results, followed by “Search Cuffley rather
   than Potters Bar”;
2. exact and minimum bedroom searches;
3. price, location, department, feature and property-type refinements;
4. first/second-property facts and comparisons without repeated cards;
5. Banc area, buying, renting and service questions grounded in approved pages;
6. missing facts and unsupported requests;
7. Call and WhatsApp handoffs;
8. model, property and knowledge failure recovery with context preserved.

Mobile and desktop checks cover scrolling, input reachability, loading,
keyboard focus, links, cards and actions. The full test suite, strict
TypeScript, scoped lint, production build and diff checks must pass before the
Preview is shared for acceptance.

## Rollout

1. Keep the current canonical property model, exact-bedroom behavior and
   Expert Agent/Supabase ingestion unchanged.
2. Replace the model-facing full-query contract with typed state mutations and
   a deterministic reducer.
3. Add the approved Banc content registry and server-only knowledge service.
4. Replace generic fail-closed turns with bounded repair and category-specific
   recovery.
5. Extend the UI for Banc source links and Call/WhatsApp buttons.
6. Deploy only to a new immutable Preview with Preview-scoped OpenAI and
   Supabase configuration.
7. Complete automated and live multi-turn acceptance on mobile and desktop.
8. Share the stable Preview with Nitesh and the Banc reviewers.
9. Keep Production unchanged until the Preview passes, API cost/rate limiting
   is configured, and the user explicitly approves Production deployment.

## Acceptance Criteria

- The assistant behaves as a conversation, not a search form in a chat window.
- It remembers active requirements throughout the page session.
- Natural replacements and refinements preserve every unspecified filter.
- The Potters Bar-to-Cuffley five-bedroom conversation completes without a
  generic error and uses only live Banc results.
- Property answers and comparisons use authorized canonical facts.
- Broader answers use only approved Banc content and expose trusted Banc links.
- No-result, ambiguous and transient-failure turns preserve context and provide
  a useful next step.
- Call and WhatsApp handoffs use fixed trusted destinations and collect no
  personal data in chat.
- Cards and links never come from model prose.
- No demonstration inventory, unsupported fact, raw model payload, visitor
  transcript, credential or secret reaches the browser or logs.
- The conversation layer depends on CRM-neutral property and knowledge
  interfaces so Streets can replace Expert Agent without another chatbot
  rewrite.
- Production is not changed until the new Preview is explicitly approved.
