# Banc conversational estate agent: behavior-to-test matrix

This matrix records the replacement regression coverage retained when the
superseded scripted property-chat orchestration is removed.

| Acceptance behavior | Replacement proof |
| --- | --- |
| Exact and minimum bedrooms, including current-message bedroom language overriding a conflicting plan | `explicit bedroom language overrides a conflicting model mutation` and `at least four bedrooms sets a minimum and clears an exact maximum` — `lib/__tests__/banc-conversation-state-reducer.test.ts` |
| Potters Bar to Cuffley field preservation | `handles Potters Bar to Cuffley as a successful location replacement` — `lib/__tests__/banc-conversation-handler.test.ts` |
| Price, feature, type, and department refinements | `preserves exact and minimum bedrooms across price, location, department, feature and type refinements` — `lib/__tests__/banc-conversation-handler.test.ts` |
| Tenure refinement sets the requested tenure without clearing active filters | `setting tenure preserves the active location and bedroom refinement` — `lib/__tests__/banc-conversation-state-reducer.test.ts` |
| Reset and unchanged-state refinements | `resets search state and returns trusted Call and WhatsApp handoffs` — `lib/__tests__/banc-conversation-handler.test.ts`; `an empty refinement preserves results while still returning fresh state and arrays` — `lib/__tests__/banc-conversation-state-reducer.test.ts` |
| Active-property authorization accepts live active IDs | `re-authorizes active browser ids through the portfolio and rejects missing live facts` — `lib/__tests__/banc-conversation-tools.test.ts` |
| Active-property authorization rejects out-of-context IDs | `refuses facts for a property outside the active authorized result set` — `lib/__tests__/banc-conversation-tools.test.ts` |
| Server-grounded fact comparisons | `returns one server-grounded comparison covering both authorized properties` — `lib/__tests__/banc-conversation-handler.test.ts` |
| Canonical property-card/detail URLs | `builds department-aware property detail links` — `lib/__tests__/property-view.test.ts` (asserts generated sales and lettings URLs, including encoded IDs); `does not derive links from model prose and preserves trusted property card navigation` — `lib/__tests__/property-chat-ui.test.ts` (wires the public card to that helper) |
| Unchanged-card suppression | `suppresses unchanged cards while retaining a successful search response` — `lib/__tests__/banc-conversation-handler.test.ts` |
| Approved Banc content is a real canonical registry | `registers only unique approved local documents`, `covers every registered href with an existing static or area-guide route`, and `builds area-guide documents from the canonical area guide content` — `lib/__tests__/banc-content-registry.test.ts` |
| Missing approved source | `returns no approved source for unsupported facts` — `lib/__tests__/banc-knowledge.test.ts` |
| Trusted Call and WhatsApp handoffs | `resets search state and returns trusted Call and WhatsApp handoffs` — `lib/__tests__/banc-conversation-handler.test.ts`; `renders Call and WhatsApp controls only from a trusted handoff` — `lib/__tests__/property-chat-ui.test.ts` |
| Malformed-intent repair and exhausted-repair recovery | `repairs malformed intent exactly once with validation feedback` and `returns interpretation_invalid after one failed repair and never tries a third call` — `lib/__tests__/banc-conversation-openai.test.ts`; `preserves state and asks a focused question after failed repair` — `lib/__tests__/banc-conversation-handler.test.ts` |
| Timeout, service failure, missing configuration, and rate-limit recovery | `maps model timeout, provider outage, missing configuration and rate limiting without losing state` — `lib/__tests__/banc-conversation-handler.test.ts`; `maps aborts and deadline abort errors to model_timeout`, `maps rate limits separately from other provider failures`, and `maps missing provider configuration without making a request` — `lib/__tests__/banc-conversation-openai.test.ts` |
| Request and response validation | `POST returns 400 for malformed JSON and invalid conversation requests` and `POST rejects an invalid handler payload instead of publishing it` — `lib/__tests__/banc-chat-route.test.ts`; `response parsing rejects raw links, unknown keys, and more than three cards` — `lib/__tests__/banc-conversation-contracts.test.ts` |
| Bounded UI history | `serializes the latest 20 prose messages with the current in-memory context` — `lib/__tests__/property-chat-submit.test.ts` |
| Single-flight UI turn | `same-tick chat submissions make one request and publish one logical turn` — `lib/__tests__/property-chat-submit.test.ts` (one request, one user/assistant pair, and `[true, false]` loading lifecycle) |
| Modal focus lifecycle and safe diagnostics | `traps modal focus and restores the opener and environment on cleanup` — `lib/__tests__/modal-focus-lifecycle.test.ts`; `distinguishes property and knowledge failures and emits only approved diagnostics` — `lib/__tests__/banc-conversation-handler.test.ts` |
