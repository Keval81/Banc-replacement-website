# Banc conversational estate agent — Preview acceptance audit

Date: 2026-09-01

Deployed commit: `9f6cb1697464eb40265b3800422891c69ae0ffdb`

Outcome: **FAIL / not approved for stakeholder acceptance**

## Final retry deployment identity

| Field | Observed value |
| --- | --- |
| Vercel project | `digital-inroads/banc-website` (`prj_3jBlCs3Gq3TF4SFRr5e3Ev4SXD6E`) |
| Environment | Preview |
| Immutable URL | `https://banc-website-hr1uyv0yw-digital-inroads.vercel.app` |
| Deployment ID | `dpl_8yNi8wuhPsN5KRkBpoxx7ybsPjwN` |
| Ready state | Ready |
| Created / ready observation | 2026-09-01 13:17:33 BST; `vercel inspect` reported Ready after deployment |

This independently reviewed final-retry phase created exactly one external deployment with `vercel deploy --yes`. The CLI inspection reported `target preview`. No `--prod` command was run and no Production environment variable, alias, traffic, deployment protection, or sharing setting was changed.

The Vercel build completed successfully. Its install output also reported 21 existing package-audit findings (1 low, 2 moderate, 15 high, and 3 critical); this audit did not change dependencies or run an automatic remediation.

## Preview variable presence

The final `vercel env ls preview` result exposed names, targets, and encrypted state only. No value was printed or copied.

| Variable | Preview state |
| --- | --- |
| `OPENAI_API_KEY` | Present (`Encrypted`) |
| `OPENAI_CHAT_MODEL` | Present (`Encrypted`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Present (`Encrypted`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Present (`Encrypted`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Present (`Encrypted`) |

`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and the all-environment `GOOGLE_PLACES_API_KEY` were also present, but were not required to authorize this conversational Preview deployment.

## Previous Preview acceptance evidence (superseded by the final retry below)

The immutable Preview loaded in signed-in Chrome with the title `Banc Property Group | Independent Estate Agents`. A fresh chat session showed the expected welcome copy, quick replies, input, and send control.

The required sequential acceptance conversation failed at its first two turns:

| Turn | Prompt | Observed result | Property IDs | Result |
| --- | --- | --- | --- | --- |
| 1 | “Any five-bedroom homes in Potters Bar?” | “The conversational service is temporarily unavailable. Please try again shortly.” | None | FAIL |
| 2 | “Search Cuffley rather than Potters Bar.” | The same temporary-unavailable response | None | FAIL |

The response text is the codebase's fixed `model_unavailable` recovery copy. This was repeatable after the reviewed `uniqueItems` removal, while all required Preview variable names were present. Read-only Vercel logs correlated every exercised `POST /api/chat` with safe `model_unavailable` diagnostics in the `under_1s` duration bucket. Temporary upstream provider instrumentation had already been removed, so this deployment does not expose a new upstream status or error parameter. No secret or model value was inspected or copied.

The same read-only deployment log query also showed Auth.js `MissingSecret` errors for Preview session/favorites requests. They did not prevent the public landing page or chatbot shell from loading, but authenticated account behavior was not accepted in this task. No environment change was made in response.

Because the ordered scenario could not get beyond turn 2, these dependent checks were not executable and are **blocked, not passed**:

- cheaper, parking, bedroom, and sales-to-lettings context refinements;
- first-property facts and two-property comparison;
- grounded Cuffley, buying, renting, and Banc-services answers;
- unsupported-local-fact non-invention behavior;
- assistant-specific Call and WhatsApp viewing controls;
- `Start again` after a successful property conversation;
- returned card IDs, sales/lettings detail routes, Banc source links, page titles, and repeated-card suppression.

No chat property cards, source links, or assistant handoff controls were returned, so there were no returned property IDs or card/source destinations to open. The required Cuffley state (`department=sales`, `minBedrooms=5`, `maxBedrooms=5`) was not established and the required no-generic-error condition failed.

## Previous independent browser checks

The following checks did not depend on a successful model response:

| Check | Observation | Result |
| --- | --- | --- |
| Desktop close and reopen | Closing hid the dialog; reopening retained the current in-memory conversation | PASS |
| Escape | Escape dismissed the chat and restored focus to `Open help options` | PASS |
| Reload | Reloading cleared the previous conversation and restored the welcome-only session | PASS |
| Loading and single-flight guard | Immediately after submission, the user turn appeared once and `Send message` was disabled until the fixed failure returned; the input then recovered | PASS |
| Quick replies | All three initial quick replies were visible; the first populated the input and was submitted once | PASS |
| Mobile viewport | At 390×844, the dialog, scrollable conversation, quick replies, input, and send control remained visible and reachable; an upward scroll revealed earlier turns | PASS for viewport reachability and scrolling |
| Mobile software keyboard | Desktop Chrome viewport emulation cannot raise a real mobile software keyboard | NOT VERIFIED |
| Trusted site contact links | The visible site call control exposed `tel:01707877781`; clicking the help-menu WhatsApp link opened a new tab at the approved `447707877781` destination | PASS (supplementary; not the blocked assistant viewing handoff) |

No personal data was entered or copied.

## Previous safe recovery evidence

- Local injected handler tests cover model timeout/unavailability, missing configuration, rate limiting, property-search failure, knowledge failure, ambiguity, zero matches, context preservation, and fixed trusted handoffs.
- The Preview submit control became disabled during the in-flight turn and recovered afterward, preventing a second UI submission while busy.
- Preview ambiguity (`I need a home.`) and zero-match (`Show me homes on Mars.`) probes both returned the same provider-unavailable copy before trusted operations could execute. Their category-specific behavior is **blocked, not passed**.
- No variable was removed, no property source was disrupted, and no destructive failure was injected.

## Previous offline provider-schema inventory

The deployed provider request schemas were inspected offline without using or exposing the Preview key or model value. The comparison source was the official OpenAI Structured Outputs supported-subset guide: <https://developers.openai.com/api/docs/guides/structured-outputs>.

The initial `selectPlan` request and its bounded repair request both use the same plan schema. Its documented-supported keywords and shapes are: an object root; `type`, `properties`, `required`, and `additionalProperties: false`; `$defs` / `$ref`; nested `anyOf`; `enum`; array `items`, `minItems`, and `maxItems`; and numeric `minimum` / `maximum`. The nullable `anyOf` shape and definitions/references also appear in official examples.

The remaining unsupported or uncertain inventory is confined to that shared plan schema and therefore reaches both the initial and repair provider calls:

| Keyword | Count / locations | Classification |
| --- | --- | --- |
| `const` | 24: operation literals across preserve/set/clear mutation definitions (18), plus six intent discriminator `type` literals | Not listed in the official supported subset and not used in its raw-schema examples; likely unsupported, but the current deployment no longer logs the provider's exact rejected path |
| `minLength` / `maxLength` | Five pairs: location value, property-facts ID items, Banc-knowledge query, contact property ID, and clarification question | Not listed among supported string properties; the guide explicitly calls them unsupported for fine-tuned models, so compatibility for the undisclosed deployed model remains uncertain |

The `writeResponse` schema uses only an object root, `additionalProperties: false`, `properties`, a string `enum`, and `required`; no unsupported or uncertain keyword from the inventory appears there. The repeated live failure plus the prior diagnostic `invalid_json_schema` evidence shows that removing `uniqueItems` was insufficient, but this offline comparison alone does not prove which remaining keyword the current provider rejects.

## Previous repository gate

| Gate | Result |
| --- | --- |
| `node --experimental-strip-types --test lib/__tests__/*.test.ts` | PASS — 357 tests, 357 passed, 0 failed |
| `npx tsc --noEmit` | PASS |
| Scoped ESLint command from Task 9 | PASS |
| `npm run build` | PASS |
| `git diff --check` | PASS |
| Tracked worktree before audit creation | Clean |
| Legacy `property-conversation` / `property-chat.ts` production code or import scan | None found |
| Transcript persistence / public-web tool / arbitrary-URL tool / CRM-write scan | None found in the active chatbot/conversation route |
| Dependency manifest diff | None |

The local build emitted existing warnings for the deprecated Next.js `middleware` convention, edge-runtime static generation, missing `metadataBase`, and Node module registration; none failed the build.

## Previous access and sharing

An unauthenticated HTTP header request to the immutable URL returned HTTP 302 to Vercel SSO. The Preview is protected. The signed-in Chrome session could access it, but accessibility to Nitesh was not established.

No viewer invitation, deployment-specific share link, bypass token, or project-wide protection change was made. Sharing requires a separate user decision and the necessary stakeholder identity or an explicitly authorized deployment-specific sharing action.

## Previous release decision

Do not treat this Preview as accepted or share-ready. Before rerunning acceptance, resolve the remaining provider-schema compatibility failure without changing Production, then repeat the complete 12-turn fresh-session conversation, all returned card/source links on desktop and mobile, the assistant viewing handoff controls, ambiguity and zero-result recovery, a real mobile-keyboard check, and the unauthenticated/stakeholder access check.

## Final retry live acceptance

The final retry loaded in the existing signed-in Chrome session and started from a fresh welcome-only conversation. No personal data was entered or copied.

| Turn | Action / state observation | Property IDs | Result |
| --- | --- | --- | --- |
| 1 | Exact five-bedroom sales search in Potters Bar returned a truthful zero-result response and suggested broadening to at least five bedrooms; no outage copy | None | PASS |
| 2 | Replaced only the location with Cuffley; sales and exact five bedrooms were preserved; three trusted server cards were rendered | `BPGC1036`, `BPGC1218`, `BPGC1240` | PASS |
| 3 | “Make it cheaper.” produced the focused clarification “Which location, price range, bedroom requirement or property would you like help with?” instead of applying the deterministic cheaper refinement | None added | FAIL |
| 4 | Added parking while retaining Cuffley, sales, and exact five bedrooms | `BPGC1036`, `BPGC1218`, `BPGC1297` | PASS |
| 5 | Changed to at least four bedrooms and cleared the exact maximum | `BPGC1036`, `BPGC1086`, `BPGC1089` | PASS |
| 6 | Switched to rent while retaining Cuffley, parking, and minimum four bedrooms | `BPGC1387`, `BPGC1469`, `BPGC994` | PASS |
| 7 | First-property facts returned server-grounded price, bedroom, and bathroom facts for `BPGC1387`; no cards were repeated | `BPGC1387` | PASS |
| 8 | Comparison used `BPGC1387` and `BPGC1469` and correctly compared price, bedrooms, and bathrooms; no cards were repeated | `BPGC1387`, `BPGC1469` | PASS |
| 9 | Combined Cuffley, buying, renting, and Banc-services question returned the fixed temporary-unavailable copy; no approved Banc source links were produced | None | FAIL |
| 10 | Unsupported current local-fact question returned the same temporary-unavailable copy, so non-invention/refusal behavior could not be accepted | None | BLOCKED |
| 11 | Viewing request produced trusted `Call Banc` and `WhatsApp Banc` controls | `BPGC1387` in active state | PASS |
| 12 | “Start again” returned the reset confirmation and cleared property-search state | None | PASS |

The trusted Call destination was `tel:01707877781`. Clicking WhatsApp opened a new tab at the approved `447707877781` destination. Repeating an unchanged exact-five-bedroom Cuffley search added no new links/cards, and fact/comparison turns also added no cards, so unchanged-card suppression passed.

## Property-card/detail-route failure and diagnosis

Every distinct card returned by turns 2, 4, 5, and 6 was opened in signed-in Chrome. The route path and property ID were preserved, but all nine hydrated pages rendered “This property is no longer available”: `BPGC1036`, `BPGC1218`, `BPGC1240`, `BPGC1297`, `BPGC1086`, `BPGC1089`, `BPGC1387`, `BPGC1469`, and `BPGC994`. Therefore the live-card and correct-detail-page requirement failed.

Read-only tracing established the shared failure boundary:

1. Canonical search maps the server row through `dbToCard`, which exposes its public `expert_agent_id`; `buildPropertyHref` correctly produced `/sales/properties/BPGC1036`.
2. The dynamic detail page correctly parsed `BPGC1036` and requested `/api/properties/BPGC1036`.
3. A fresh exact-five-bedroom Cuffley search followed by first-property facts successfully resolved and authorized `BPGC1036` through the service-role marketable-facts path, proving that the canonical row and public ID were live.
4. The detail API uses the anon Supabase client. Safe deployment logs showed HTTP 500 with `property api: Invalid API key` for `BPGC1036` and the other eight accepted IDs. The client detail loader catches that failure and renders the unavailable page.

Root-cause hypothesis, supported by the shared error across all nine routes: the encrypted Preview `NEXT_PUBLIC_SUPABASE_ANON_KEY` is invalid or does not belong to the configured Preview `NEXT_PUBLIC_SUPABASE_URL`. Its value was never printed, copied, decrypted, or changed. The service-role key remained functional for server-only search and facts. This task did not change either variable or implement a code fallback.

## Knowledge-turn diagnosis

Safe Vercel logs correlated exactly two failed `/api/chat` requests with `model_unavailable`, HTTP 200, and duration bucket `1_to_5s`. No `knowledge_unavailable` event appeared. Thus turns 9 and 10 failed in the bounded model path, not as a Banc content-search failure. With temporary provider instrumentation removed, the evidence does not distinguish intent selection from response writing; no unsupported provider response or visitor text was logged.

## Final retry independent interaction and recovery checks

| Check | Observation | Result |
| --- | --- | --- |
| Desktop layout | Long transcript scrolled inside the dialog; quick reply, input, and send remained reachable | PASS |
| 390×844 viewport | Exact viewport metrics were confirmed; conversation overflow scrolled; quick replies, input, and send remained visible and reachable | PASS |
| Mobile loading | Send was disabled during the in-flight turn and recovered with an empty, usable input | PASS |
| Real mobile software keyboard | The Chrome responsive viewport does not raise a physical mobile software keyboard | NOT VERIFIED |
| Quick replies | The initial buying reply populated the input without accidental submission | PASS |
| Close/reopen | Close removed the dialog; reopening retained the in-memory conversation | PASS |
| Escape/focus | Escape removed the dialog and restored focus to `Open help options` | PASS |
| Reload | Reload cleared the conversation and restored welcome-only state | PASS |
| Ambiguity | “I need somewhere nice.” returned a focused clarification rather than an outage | PASS |
| Zero results | An explicit twelve-bedroom sales search returned truthful zero-result guidance rather than an outage | PASS |
| Rapid duplicate | Two immediate Enter presses produced one logical user turn and one response | PASS |
| Loading/input recovery | The send control was disabled while busy and the input recovered afterward | PASS |

The viewport override was reset after the responsive check. No service failure was manufactured, no variable was removed, and no data source was disrupted.

## Final repository gate and safety scans

| Gate | Result |
| --- | --- |
| `node --experimental-strip-types --test lib/__tests__/*.test.ts` | PASS — 359 tests, 359 passed, 0 failed |
| `npx tsc --noEmit` | PASS |
| Scoped ESLint command from Task 9 | PASS |
| `npm run build` | PASS |
| `git diff --check` and tracked status before audit update | PASS / clean |
| Legacy conversation import, persistence, unsafe-tool, dependency-manifest, unsupported-provider-keyword, and temporary-diagnostics scans | PASS / none found |

The local build retained non-failing existing warnings for the deprecated Next.js middleware convention, edge-runtime static generation, missing `metadataBase`, and Node module registration. The Vercel install retained the previously observed package-audit findings; no dependency or remediation action was taken.

## Final access, Production, and release decision

An unauthenticated request to the final immutable URL returned HTTP 302 to Vercel SSO. Nitesh access remains unestablished. No invite, share link, bypass token, protection change, alias change, or Production change was made.

Final outcome remains **FAIL / not approved for stakeholder acceptance** because the cheaper refinement failed, the knowledge and unsupported-fact turns were unavailable, every returned detail route failed through the invalid Preview anon credential, source links could not be verified, a real mobile keyboard was not verified, and stakeholder access is not established. Production aliases, variables, traffic, and deployment remained unchanged.
