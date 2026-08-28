# Banc Conversational Property Assistant Design

**Status:** Approved 2026-08-28  
**Project:** Banc Property replacement website  
**Builds on:** `docs/superpowers/specs/2026-08-27-banc-property-search-chatbot-design.md`

## Purpose

Turn the existing deterministic property-search chatbot into a genuinely
conversational assistant without weakening the factual guarantees of the live
Expert Agent integration. The assistant should answer natural follow-up
questions, remember which returned properties are under discussion, and avoid
repeating property links when the user has only asked a question.

This release also corrects bedroom intent. In ordinary estate-agent language,
“a 3 bed” means exactly three bedrooms. “3+ beds”, “at least 3 bedrooms”, and
“minimum 3 bedrooms” mean three or more.

## Problem

The deployed chatbot currently behaves like a search form inside a chat panel:

- every valid message is reduced to a deterministic filter patch;
- a plain bedroom count is mapped to `minBedrooms`;
- the service returns the first three matching cards after each search;
- listing questions normally receive a fixed missing-fact handoff;
- the bot cannot reliably understand “the first one”, compare results, or
  answer a question from a returned listing description.

The result is accurate but not conversational. A request for a three-bedroom
home can return four-bedroom homes, and follow-up questions can cause the same
links to be shown repeatedly.

## Goals

- Make the assistant feel conversational across multi-turn property searches.
- Keep all property claims grounded in canonical CRM records.
- Treat plain bedroom counts as exact and explicit minimum wording as minimum.
- Let visitors refine, compare, and ask about the current results.
- Return property cards only when a new or changed search result makes them
  useful.
- Preserve the CRM-neutral boundary so Streets can replace Expert Agent and add
  capabilities without rewriting the conversation layer.
- Keep the public property search pages and their minimum-bedroom control
  working as they do today.
- Bound model cost, tool use, history, and failure behavior.

## Non-goals

- Booking viewings, submitting offers, creating valuations, registering buyers,
  or checking real-time staff calendars.
- Giving mortgage, legal, tax, survey, or investment advice.
- Inventing local-area facts that are absent from approved data sources.
- Adding a general web-browsing tool to the public chatbot.
- Building Streets-only tools before Banc has Streets credentials and an agreed
  capability scope.
- Persisting identifiable chat transcripts or building an admin transcript UI.

## Visitor Experience

### Starting a search

If department intent is missing, the assistant asks whether the visitor is
buying or renting before searching. Once the department is known, it can search
from natural wording such as:

- “Find me a 3 bed in Cuffley” → `minBedrooms: 3`, `maxBedrooms: 3`.
- “Show me at least 3 beds in Cuffley” → `minBedrooms: 3`, no maximum.
- “I want to rent a flat near Potters Bar under £2,000 pcm” → lettings,
  location, property type, and maximum monthly price.

The response briefly describes how many matches were found and may mention a
useful verified distinction. It shows no more than three canonical property
cards.

### Refining a search

Short follow-ups such as “only detached ones”, “cheaper”, “with parking”, or
“make that four bedrooms” refine the structured active query. A new concrete
location or department starts the corresponding new search. “Start again” or
“clear that” resets conversational search state.

Whenever a refinement changes the result set, the assistant may return the new
cards. Rephrasing the current request without changing the result set must not
repeat them.

### Discussing returned properties

The conversation state records the latest returned property identifiers and an
optional focused property identifier. This lets the visitor say:

- “Tell me about the first one.”
- “Which is cheapest?”
- “Compare the first two.”
- “Does that bungalow have a garden?”
- “What is the EPC rating?”

The assistant answers from sanitized canonical property facts supplied by the
server. It can use the listing summary, price, status, bedrooms, bathrooms,
property type, tenure, EPC, features, address, and other explicitly mapped CRM
fields. It must distinguish a fact from a reasonable comparison: for example,
“The first is cheaper” is permitted when both canonical prices are present.

If a requested field is missing, it says that the listing does not specify it
and offers the Banc team as the next step. It does not turn that response into
another property search and does not repeat the property card.

### Handoffs

Viewing, availability, offer, valuation, fee, finance, legal, and explicit
human-contact requests use fixed truthful Banc handoffs. The model may choose a
handoff category, but the server owns the final approved wording and contact
link. The assistant never claims that an action was completed.

## Architecture

### Separation of responsibilities

The OpenAI model handles language understanding, response composition, and
selection of a small approved tool set. It never receives database credentials
and never calls Supabase or a CRM directly.

The server owns:

- request and conversation-state validation;
- deterministic bedroom-language normalization;
- tool argument validation;
- canonical property search and detail retrieval;
- authorization of property identifiers available to the conversation;
- output validation and safe card construction;
- fixed handoff and failure copy;
- tool-round, history, token, timeout, and response limits.

The server calls the OpenAI Responses API with native `fetch`; no OpenAI SDK is
added. Function tools follow OpenAI's documented tool-calling flow. Model name
and API key are server-only environment variables so the model can be changed
without altering the property or UI contracts.

### Modules

The current `lib/property-chat.ts` has accumulated parsing, validation,
orchestration, result safety, and fixed-copy responsibilities. The new design
keeps focused files:

- `lib/property-conversation/contracts.ts` — strict request, response, state,
  model-output, and tool-argument schemas.
- `lib/property-conversation/bedroom-intent.ts` — deterministic exact versus
  minimum bedroom semantics and malformed-count rejection.
- `lib/property-conversation/property-facts.ts` — sanitized property facts and
  reference resolution for the current result set.
- `lib/property-conversation/tools.ts` — trusted search, property-detail, reset,
  and handoff tool execution.
- `lib/property-conversation/openai.ts` — bounded Responses API client and
  function-call loop.
- `lib/property-conversation/prompt.ts` — the Banc assistant policy and tool
  instructions.
- `lib/property-conversation/handler.ts` — validated orchestration and safe
  fallback behavior.
- `lib/property-conversation/index.ts` — the deliberately small public surface
  used by `app/api/chat/route.ts`.

The existing deterministic code can remain available only as a temporary
failure-safe helper during migration. It must not silently return broad or fake
results when the AI service is unavailable.

### Conversation contract

The browser sends a strict, size-limited request:

```ts
interface PropertyConversationRequest {
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  context?: PropertyConversationContext;
}

interface PropertyConversationContext {
  query?: PropertySearchQuery;
  resultPropertyIds: string[];
  focusedPropertyId?: string;
  resultFingerprint?: string;
}
```

`resultPropertyIds` is capped at three. `focusedPropertyId`, when supplied, must
be one of those identifiers. The browser cannot use context to authorize access
to arbitrary or inactive records; the server re-resolves identifiers against
canonical marketable property data.

The response is similarly strict:

```ts
interface PropertyConversationResponse {
  response: string;
  action:
    | "clarify_department"
    | "search"
    | "answer"
    | "no_results"
    | "contact_team"
    | "unavailable";
  properties?: PropertyCardData[];
  context: PropertyConversationContext;
}
```

`properties` is present only for a changed successful search. The UI renders
cards from this separate validated field; it never parses links or property
data from model-generated prose.

### Approved tools

The initial model tool surface is intentionally small:

1. `search_properties`
   - Applies a complete or refined canonical query.
   - Accepts exact or minimum bedroom intent.
   - Returns total, up to three sanitized property summaries, and structured
     query state.
2. `get_property_facts`
   - Accepts one to three identifiers from the active result set.
   - Returns only mapped canonical facts required to answer or compare.
3. `reset_property_search`
   - Clears query, results, focus, and fingerprint.
4. `contact_banc`
   - Selects one approved handoff category; server copy remains authoritative.

One user turn may execute at most three model/tool rounds. The assistant cannot
call a transaction, browser, email, calendar, CRM-write, or arbitrary database
tool.

## Exact Bedroom Search

`PropertySearchQuery` gains optional `maxBedrooms`. It is validated, parsed,
serialized, preserved across department changes, included in active-filter
detection, and sent to the repository. The Supabase `search_properties`
function gains `p_max_bedrooms` and enforces
`p.bedrooms <= p_max_bedrooms` when present.

The website's filter UI continues to set only `minBedrooms`; it does not expose
a maximum-bedroom control in this release. The chatbot normalizer applies:

- plain “3 bed”, “three bedroom”, or “make it 3 bedrooms” → min 3, max 3;
- “3+”, “at least 3”, “minimum 3”, “3 or more” → min 3, no max;
- malformed, negative, decimal, unsafe, or out-of-range bedroom counts → reject
  the turn before any property search;
- an explicit later bedroom refinement replaces both prior bedroom bounds.

Model arguments cannot broaden a deterministic exact bedroom interpretation.

## Grounding and Safety

- The model receives only sanitized property facts, never raw database rows,
  credentials, internal errors, or unbounded listing payloads.
- Every model tool argument and every final structured response is validated.
- Property IDs returned in context are treated as untrusted and rechecked.
- The prompt explicitly forbids unsupported facts, completed transactions, and
  claims about current availability beyond canonical status.
- Handoff and outage responses are server-authored fixed strings.
- Model prose is plain text; the UI does not render model HTML.
- Existing safe property image and canonical property-link builders remain the
  only card media/link path.
- History is capped at the most recent validated turns and each message retains
  the current 2,000-character ceiling.
- The route caps output tokens, tool rounds, property facts, and total request
  duration. Public deployment also requires an operational usage budget and
  rate-limit control appropriate to the Vercel plan before production cutover.

## Failure Behavior

- Missing `OPENAI_API_KEY` or model configuration: return the fixed unavailable
  response and no cards.
- OpenAI timeout, non-2xx response, malformed output, extra tool, excessive tool
  rounds, or validation failure: return the fixed unavailable response and
  preserve the last valid context.
- Supabase search/detail failure: return the existing live-listings unavailable
  handoff and preserve safe context.
- Zero matches: explain that no exact match was found and suggest one grounded
  widening action; do not silently remove a filter.
- No model or property failure may fall back to demonstration inventory.

## Configuration

The preview and later production environments require:

- `OPENAI_API_KEY` — server-only secret.
- `OPENAI_CHAT_MODEL` — server-only model identifier selected for low-latency,
  tool-capable conversation.

Neither value may use a `NEXT_PUBLIC_` prefix. `.env.example` documents names
only. The implementation must not read, log, return, or commit secret values.

## Testing

All behavior is implemented test-first. Tests cover:

- exact versus minimum bedroom wording and safe numeric boundaries;
- canonical query parsing, serialization, navigation, repository RPC arguments,
  and SQL migration shape for `maxBedrooms`;
- strict request, response, context, model output, and tool schemas;
- search/refinement/reset state transitions;
- first/second/cheapest/property-type reference resolution;
- factual detail answers and explicit missing-fact behavior;
- comparisons without repeated cards;
- handoffs and unsupported tool rejection;
- injected, malformed, mismatched, and excessive model output;
- OpenAI timeout, status, malformed-response, and tool-round failures;
- UI behavior for answer-only messages, changed-result cards, loading,
  accessibility, retry, and context continuity;
- exact live preview request returning only three-bedroom cards.

The full TypeScript test suite, strict typecheck, scoped lint, production build,
SQL checks, and deployed preview smoke tests must pass before completion.

## Rollout

1. Add the exact-bedroom canonical search capability and apply its migration to
   the isolated staging Supabase project.
2. Add the grounded conversation contracts, tools, OpenAI client, and handler
   behind the existing `/api/chat` boundary.
3. Update the chat UI for answer-only messages and structured state.
4. Configure preview-only OpenAI environment variables and deploy a new preview.
5. Verify exact bedroom results, multi-turn comparisons, missing facts,
   handoffs, repeated-card suppression, and outage behavior on mobile and
   desktop.
6. Keep production unchanged until the preview is explicitly approved and an
   operational budget/rate-limit decision is recorded.

## Acceptance Criteria

- “I want to buy a 3 bed in Cuffley” never returns a four-bedroom property.
- “I want to buy at least a 3 bed in Cuffley” may return properties with more
  than three bedrooms.
- The assistant answers a question about a returned property from canonical
  facts without repeating its card.
- The assistant can compare the current results and understand ordinal and
  simple descriptive references.
- Changed searches may display up to three current CRM cards with canonical
  links; unchanged conversations do not repeat them.
- Missing facts, unavailable services, and unsupported actions are described
  truthfully.
- No demonstration property, guessed fact, database credential, model secret,
  raw model tool call, or internal error reaches the browser.
- Existing homepage and results-page property search behavior remains green.
- The conversation layer depends on CRM-neutral services and does not encode an
  Expert Agent-only action that would constrain the later Streets integration.
