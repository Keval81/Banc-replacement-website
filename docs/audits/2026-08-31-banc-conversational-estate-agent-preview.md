# Banc conversational estate agent — Preview acceptance audit

Date: 2026-08-31

Deployed commit: `8a41ba4194d4a47ceaaf7c7ac6837bec11242fc0`

Outcome: **FAIL / not approved for stakeholder acceptance**

## Deployment identity

| Field | Observed value |
| --- | --- |
| Vercel project | `digital-inroads/banc-website` (`prj_3jBlCs3Gq3TF4SFRr5e3Ev4SXD6E`) |
| Environment | Preview |
| Immutable URL | `https://banc-website-4c26tokvi-digital-inroads.vercel.app` |
| Deployment ID | `dpl_52HFaosB96gBA9hK9Vb8DBcqAQrX` |
| Ready state | Ready |
| Created / ready observation | 2026-08-31 21:17:22 BST; `vercel inspect` reported Ready after deployment |

Exactly one external deployment was created with `vercel deploy --yes`. The CLI inspection reported `target preview`. No `--prod` command was run and no Production environment variable, alias, traffic, deployment protection, or sharing setting was changed.

The Vercel build completed successfully. Its install output also reported 21 existing package-audit findings (1 low, 2 moderate, 15 high, and 3 critical); this audit did not change dependencies or run an automatic remediation.

## Preview variable presence

The final `vercel env ls preview --format json` result was filtered to names, targets, and types only. No value was printed or copied.

| Variable | Preview state |
| --- | --- |
| `OPENAI_API_KEY` | Present (`sensitive`) |
| `OPENAI_CHAT_MODEL` | Present (`sensitive`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Present (`sensitive`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Present (`sensitive`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Present (`sensitive`) |

`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and the all-environment `GOOGLE_PLACES_API_KEY` were also present, but were not required to authorize this conversational Preview deployment.

## Live acceptance evidence

The immutable Preview loaded in signed-in Chrome with the title `Banc Property Group | Independent Estate Agents`. A fresh chat session showed the expected welcome copy, quick replies, input, and send control.

The required sequential acceptance conversation failed at its first two turns:

| Turn | Prompt | Observed result | Property IDs | Result |
| --- | --- | --- | --- | --- |
| 1 | “Any five-bedroom homes in Potters Bar?” | “The conversational service is temporarily unavailable. Please try again shortly.” | None | FAIL |
| 2 | “Search Cuffley rather than Potters Bar.” | The same temporary-unavailable response | None | FAIL |

The response text is the codebase's fixed `model_unavailable` recovery copy. This was repeatable, while all required Preview variable names were present. The evidence therefore establishes a provider/model runtime failure, but does not establish whether the credential, model entitlement, provider availability, or another provider response is the root cause. No secret was inspected and no Vercel or provider log was copied.

Because the ordered scenario could not get beyond turn 2, these dependent checks were not executable and are **blocked, not passed**:

- cheaper, parking, bedroom, and sales-to-lettings context refinements;
- first-property facts and two-property comparison;
- grounded Cuffley, buying, renting, and Banc-services answers;
- unsupported-local-fact non-invention behavior;
- assistant-specific Call and WhatsApp viewing controls;
- `Start again` after a successful property conversation;
- returned card IDs, sales/lettings detail routes, Banc source links, page titles, and repeated-card suppression.

No chat property cards, source links, or assistant handoff controls were returned, so there were no returned property IDs or card/source destinations to open. The required Cuffley state (`department=sales`, `minBedrooms=5`, `maxBedrooms=5`) was not established and the required no-generic-error condition failed.

## Independent browser checks

The following checks did not depend on a successful model response:

| Check | Observation | Result |
| --- | --- | --- |
| Desktop close and reopen | Closing restored focus to the `Open help options` button; reopening retained the current in-memory conversation | PASS |
| Escape | Escape dismissed the chat and restored focus to `Open help options` | PASS |
| Reload | Reloading cleared the previous conversation and restored the welcome-only session | PASS |
| Rapid duplicate submit | Two near-simultaneous Enter submissions for `Any homes near Cuffley?` produced one user message | PASS |
| Quick replies | All three initial quick replies were visible | PASS |
| Mobile viewport | At 390×844, the dialog remained within x=16–374 and y=256.5–828; the input remained visible at x=29–309 and y=771–815; the conversation log used `overflow-y: auto` | PASS for viewport reachability |
| Mobile software keyboard | Desktop Chrome viewport emulation cannot raise a real mobile software keyboard | NOT VERIFIED |
| Trusted site contact links | Visible site controls used `tel:01707877781` and `https://wa.me/447707877781?...`; WhatsApp used `target=_blank` | PASS (supplementary; not the blocked assistant viewing handoff) |

No personal data was entered or copied.

## Safe recovery evidence

- Local injected handler tests cover model timeout/unavailability, missing configuration, rate limiting, property-search failure, knowledge failure, ambiguity, zero matches, context preservation, and fixed trusted handoffs.
- The Preview rapid-duplicate check remained single-flight.
- Preview ambiguity and zero-match behavior were not independently verifiable because the model failed before trusted operations could execute.
- No variable was removed, no property source was disrupted, and no destructive failure was injected.

## Repository gate against the deployed commit

| Gate | Result |
| --- | --- |
| `node --experimental-strip-types --test lib/__tests__/*.test.ts` | PASS — 355 tests, 355 passed, 0 failed |
| `npx tsc --noEmit` | PASS |
| Scoped ESLint command from Task 9 | PASS |
| `npm run build` | PASS |
| `git diff --check` | PASS |
| Tracked worktree before audit creation | Clean |
| Legacy `property-conversation` / `property-chat.ts` production code or import scan | None found |
| Transcript persistence / public-web tool / arbitrary-URL tool / CRM-write scan | None found in the active chatbot/conversation route |
| Dependency manifest diff | None |

The local build emitted existing warnings for the deprecated Next.js `middleware` convention, edge-runtime static generation, missing `metadataBase`, and Node module registration; none failed the build.

## Access and sharing

An unauthenticated HTTP request to the immutable URL followed two redirects to Vercel login. The Preview is protected. The signed-in Chrome session could access it, but accessibility to Nitesh was not established.

No viewer invitation, deployment-specific share link, bypass token, or project-wide protection change was made. Sharing requires a separate user decision and the necessary stakeholder identity or an explicitly authorized deployment-specific sharing action.

## Release decision

Do not treat this Preview as accepted or share-ready. Before rerunning acceptance, restore provider/model operation in the Preview environment without changing Production, then repeat the complete 12-turn fresh-session conversation, all returned card/source links on desktop and mobile, the assistant viewing handoff controls, ambiguity and zero-result recovery, and the unauthenticated/stakeholder access check.
