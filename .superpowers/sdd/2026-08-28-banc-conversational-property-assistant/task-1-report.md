# Task 1 Report: Exact Bedroom Bounds in Canonical Search

Date: 2026-08-28
Branch: `codex/expert-agent-search-chat-design`
Commit: `7ff49f0 feat: support exact bedroom searches`
Status: DONE

## Scope Delivered

- Added `maxBedrooms?: number` to the canonical `PropertySearchQuery`.
- Parsed and serialized canonical `maxBedrooms` URL state immediately after `minBedrooms`.
- Preserved `maxBedrooms` across department switches and exposed it through editable filter state.
- Passed `p_max_bedrooms` through the Supabase repository RPC call.
- Added `supabase/migrations/202608280001_exact_bedroom_search.sql` to replace the old `search_properties` signature with a new one that accepts `p_max_bedrooms`, enforces `p.bedrooms <= p_max_bedrooms`, preserves the existing filter/order/fallback-row behavior, and revokes `PUBLIC` execute before granting the new signature to `anon, authenticated`.
- Kept the website search UI minimum-bedroom-only. No public bedroom control was expanded.

## TDD Evidence

### RED

Ran:

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-search-query.test.ts \
  lib/__tests__/property-search-navigation.test.ts \
  lib/__tests__/property-search-repository.test.ts \
  lib/__tests__/crm-migration.test.ts
```

Observed failures for the intended missing behavior:

- schema rejected `maxBedrooms` as an unrecognized key;
- canonical query parsing/serialization omitted `maxBedrooms`;
- repository RPC args omitted `p_max_bedrooms`;
- `202608280001_exact_bedroom_search.sql` did not exist yet.

### GREEN

Re-ran the same focused command after implementation and all 39 focused tests passed.

## Regression Verification

Ran:

```bash
node --experimental-strip-types --test lib/__tests__/property-search-*.test.ts
npx tsc --noEmit
```

Results:

- all 75 `property-search-*` tests passed;
- strict TypeScript completed with exit code 0.

## Self-Review

- Initial implementation recreated `search_properties` and granted the new signature, but self-review caught that Postgres function recreation can leave default `PUBLIC` execute exposed.
- Added a migration assertion first, watched it fail, then updated the migration to explicitly revoke execute from `PUBLIC` before granting `anon, authenticated`.
- Re-ran migration, search regression, and TypeScript verification after that fix.

## Files Changed

- `lib/property-search/types.ts`
- `lib/property-search/query.ts`
- `lib/property-search/navigation.ts`
- `lib/property-search/supabase-repository.ts`
- `lib/__tests__/property-search-query.test.ts`
- `lib/__tests__/property-search-navigation.test.ts`
- `lib/__tests__/property-search-repository.test.ts`
- `lib/__tests__/property-search-filter-state.test.ts`
- `lib/__tests__/crm-migration.test.ts`
- `supabase/migrations/202608280001_exact_bedroom_search.sql`

## Concerns

- None for this task.
- The migration was created only; it was not applied to any database, per scope.

## Fix Round 1

### Summary

- Kept the public bedroom UI minimum-only while making exact `minBedrooms=maxBedrooms` state visible as an exact chip label.
- Clearing the visible bedroom chip now removes both bounds.
- Changing the visible minimum bedroom now clears any stale hidden maximum unless the user is preserving the same exact bedroom selection.

### Covering test files

- `lib/__tests__/property-search-filter-state.test.ts`
- `lib/__tests__/property-search-bedroom-ui.test.ts`

### RED command

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-search-filter-state.test.ts \
  lib/__tests__/property-search-bedroom-ui.test.ts
```

Output:

```text
✖ active filters render exact bedroom chips and clear both bedroom bounds
✖ advanced search routes visible bedroom changes through the minimum-only bedroom reconciler
✖ changing the visible minimum bedroom clears a stale exact maximum
✖ clearing the visible minimum bedroom removes both bedroom bounds
ℹ pass 3
ℹ fail 4
```

### GREEN command

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-search-filter-state.test.ts \
  lib/__tests__/property-search-bedroom-ui.test.ts
```

Output:

```text
✔ active filters render exact bedroom chips and clear both bedroom bounds
✔ advanced search routes visible bedroom changes through the minimum-only bedroom reconciler
✔ applies canonical filter patches and resets pagination
✔ changing the visible minimum bedroom clears a stale exact maximum
✔ clearing the visible minimum bedroom removes both bedroom bounds
✔ exposes only canonical editable filters from the full query
✔ exposes exact bedroom state to the public filter model
ℹ pass 7
ℹ fail 0
```

### TypeScript command

```bash
npx tsc --noEmit
```

Output:

```text
exit 0
```
