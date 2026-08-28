# Task 3 Report: Sanitized Property Facts and Trusted Tools

Date: 2026-08-28
Branch: `codex/expert-agent-search-chat-design`

## Scope

Implemented the Task 3 server-owned property data/tool boundary:

- added sanitized fact mapping and active-ID authorization in `lib/property-conversation/property-facts.ts`
- added trusted tool execution in `lib/property-conversation/tools.ts`
- added server lookup wiring in `lib/property-search/server.ts`
- added focused tests for facts and tool behavior

## Ruling Recorded

Applied the controller ruling for the tool turn contract:

```ts
export interface PropertyConversationTurn {
  currentMessage: string;
  context: PropertyConversationContext;
}
```

No separate ordinal field was added. `get_property_facts` authorizes only the
requested subset from `context.resultPropertyIds`. When exactly one authorized
ID is requested it sets `focusedPropertyId` to that ID. For multi-ID requests it
preserves an existing valid focus and otherwise omits focus.

## TDD Evidence

RED:

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-conversation-facts.test.ts \
  lib/__tests__/property-conversation-tools.test.ts
```

Initial failure was due to the missing `property-facts.ts` and `tools.ts`
modules, which matched the task expectation.

GREEN:

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-conversation-facts.test.ts \
  lib/__tests__/property-conversation-tools.test.ts
npx tsc --noEmit
```

Both completed successfully after implementation.

## Behavior Implemented

- `mapPropertyFacts(row)` returns only canonical public facts and strips raw row
  internals, media arrays, timestamps, rooms, coordinates, and source fields.
- `createPropertyFactLookup(client)` performs one bounded active+marketable
  Supabase query by `expert_agent_id` and returns facts in requested ID order.
- `resolveActivePropertyReferences(activeIds, requestedIds)` fails closed if any
  requested ID is outside the current active result set.
- `createPropertyConversationTools({ search, lookupFacts })` exposes trusted
  search, facts, reset, and handoff execution with strict argument validation.
- Search tool behavior now:
  - reuses current canonical query state when present
  - honors `null` clears only for named fields
  - reapplies `propertySearchQuerySchema.parse()` across query updates
  - forces `page: 1` and `pageSize: 3`
  - applies `parseBedroomIntent(currentMessage)` after validated arguments so
    exact current-message intent overrides broader model arguments
  - computes fingerprints from department plus ordered result IDs
  - suppresses repeated cards when ordered IDs are unchanged
- Contact tool returns fixed Banc copy instead of model-authored handoff text.
- Tool failures are sanitized into closed result codes rather than forwarding raw
  Supabase or tool errors.

## Verification Notes

- Focused tests cover exact/minimum bedroom overrides, filter refinement,
  selective null clears, reset behavior, active-ID fact authorization, focus
  updates, unchanged-card suppression, changed-card emission, invalid
  tool/argument rejection, and fixed handoff copy.
- TypeScript strict typecheck passed with the new modules and tests.

## Concerns

- `lib/property-search/server.ts` still imports `server-only`; Node test runs
  cannot import that module directly in this repo, so the pure lookup factory
  lives in `property-facts.ts` and `server.ts` remains a thin server-only
  wrapper.

## Fix Round 1

### Finding Addressed

`createPropertyFactLookup()` previously collapsed duplicate active marketable
rows that shared the same public `expert_agent_id` and let the last row win.
That could return facts from an ambiguous canonical identity.

### Covering Files

- `lib/__tests__/property-conversation-facts.test.ts`
- `lib/property-conversation/property-facts.ts`

### RED Command

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-conversation-facts.test.ts \
  lib/__tests__/property-conversation-tools.test.ts
```

Observed output:

```text
✖ server lookup fails closed for duplicate active marketable public ids while preserving unique id order
AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
actual: [ 'EA-2', 'EA-1' ]
expected: [ 'EA-2' ]
```

### Minimal Fix

Updated `createPropertyFactLookup()` to treat duplicate active marketable public
IDs as ambiguous by removing the first seen row and marking the public ID
ambiguous, so no row for that ID is returned as authoritative.

### GREEN Commands

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-conversation-facts.test.ts \
  lib/__tests__/property-conversation-tools.test.ts
npx tsc --noEmit
```

Observed output:

```text
14 tests passed, 0 failed
tsc exited 0
```
