# Conversational estate agent — review and improvements

**Date:** 2026-09-01 · **Branch:** `fable-review` (from `codex/fable-chatbot-integration` @ `ffdd3fa`)

## What was reviewed

`lib/banc-conversation/*`, `app/api/chat/route.ts`, `components/ai/PropertyChatbot.tsx`,
`lib/property-chat-submit.ts`, the 2026-08-31 design spec and its preview audit.

## Findings

1. **The reply writer had drifted from the spec.** The spec asks the model for
   "a short plain-text response" grounded in sanitized results and describes a
   warm negotiator voice. The build instead asked the model to *pick one of up
   to six server-authored sentences* (`responseId`). Every reply therefore read
   as "I found 4 properties matching your current requirements." — safe, but
   robotic, never naming a property or answering the question that was asked.
2. **A rejected reply lost the turn.** When the response writer failed, the
   handler returned a knowledge fallback or an outage message even though the
   search had succeeded, so visitors saw "temporarily unavailable" after a
   perfectly good search.
3. **`/api/chat` had no abuse ceiling.** Each turn costs up to three paid
   provider calls and it was reachable unauthenticated with no per-visitor limit
   and no body-size check. A handler exception also surfaced as an unhandled
   500.
4. **Intent selection was under-specified.** The instructions were eight lines
   with no description of Banc, the covered towns, mutation semantics, or how to
   map "the second one" to an id. The model only ever saw property ids, so a
   follow-up naming a property could not be resolved.
5. **Client UX papers.** Quick replies only filled the input; a 429 read as a
   generic connection error; there was no way to start over without reloading.

## Changes

- `grounding.ts` (new) — `verifyGroundedResponse` checks model prose against
  the trusted results: every number (including £750k / 1.5m / 8pm forms and
  number words), percentage, and property-descriptive claim word (garage,
  garden, pool, EPC, fee, station, …) must trace to an in-scope trusted entity,
  attributed per clause so "Oak House has a garden and Elm House has a garage"
  is rejected when the facts are the other way round. Links, e-mails,
  non-approved phone numbers, markup and completed-action claims are rejected.
- `openai.ts` — `writeResponse` now asks for free text (`{ response }`) with the
  sanitized results in the input, verifies it, and **falls back to the
  server-authored sentence** when verification fails. Intent input gains
  `activeProperties` (position, id, title) so follow-ups resolve to trusted ids.
- `prompt.ts` — full intent and response instructions (Banc context, covered
  towns, mutation semantics, keyword-style knowledge queries, voice rules).
- `handler.ts` — optional `portfolio` dependency looks up active-result titles
  (2.5 s sub-budget, failure-tolerant) before intent selection.
- `rate-limit.ts` (new) + `chat-route.ts` — sliding-window limiter (12/min,
  120/hour per forwarded IP, in-memory per instance), 64 KB body ceiling
  (413), handler exceptions → 503 with a request-id-only diagnostic,
  `Cache-Control: no-store`.
- `PropertyChatbot.tsx` / `property-chat-submit.ts` — quick replies send
  immediately; 429 copy is shown verbatim; "start a new conversation" control
  in the header; Enter no longer bubbles.

## Verification

- `node --experimental-strip-types --test lib/__tests__/*.test.ts` — 408 pass.
- `tsc --noEmit` — no new errors (pre-existing Prisma `UserRole`/`PropertyType`
  drift in `app/api/auth/register/route.ts` is unchanged).
- `eslint` clean on touched files.

## Follow-ups worth doing

- Run the 2026-08-31 preview test matrix against a deployment with
  `OPENAI_API_KEY` set and record acceptance in this file.
- Move the limiter to a shared store (Vercel KV / Upstash) when traffic spans
  more than one instance.
- Consider streaming the final reply once the response writer is trusted.
