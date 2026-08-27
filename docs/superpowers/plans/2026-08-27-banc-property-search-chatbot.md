# Banc CRM-Backed Property Search and Chatbot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage, sales and lettings results pages, and Banc chatbot search the same real Expert Agent properties through one server-side service while leaving a clean adapter boundary for Streets CRM.

**Architecture:** Expert Agent records are normalized into a CRM-neutral Supabase property model by a source adapter and refreshed by an hourly, failure-safe sync. A validated query contract and server-only search service power the HTTP API, URL-driven listing pages, homepage Buy/Rent search, and deterministic property-search chatbot. Streets-specific actions remain capability-based extension points and are not implemented in this release.

**Tech Stack:** Next.js 16 App Router, React 19, strict TypeScript, Zod 4, Supabase Postgres, Node's built-in test runner, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-08-27-banc-property-search-chatbot-design.md`

## Global Constraints

- Do not add a dependency; Zod and the required runtime libraries are already installed.
- Use test-driven development: failing focused test, minimal implementation, passing focused test, then refactor.
- Keep `expert_agent_id` and current property URLs working throughout the rollout.
- Never show mock properties or invent a fact missing from the canonical CRM record.
- A failed, empty, or structurally invalid feed must leave the last successful public dataset active.
- Only a complete, validated feed may mark absent source records inactive; never delete them.
- Do not implement radius, popularity, price-reduction, Streets booking, lead, offer, or progression features.
- Keep CRM credentials server-side and exclude secret values from logs, API responses, fixtures, and commits.
- Existing Sales and Lettings hero actions remain direct links to their result pages.
- Production deployment requires separate approval. A preview deployment is permitted only after all verification gates pass.
- The cinematic mobile-video recovery is an independent follow-up and is not part of this plan.

---

## File Map

### CRM ingestion and persistence

- Create `lib/crm/property-source.ts`: CRM-neutral source, searchable type, tenure, and feature definitions plus normalization functions.
- Create `lib/crm/expert-agent-adapter.ts`: maps one parsed Expert Agent record to a canonical property write row.
- Create `lib/crm/property-sync.ts`: validates and reconciles a complete source feed through an injected repository.
- Create `lib/crm/supabase-sync-repository.ts`: Supabase implementation of the sync repository.
- Create `supabase/migrations/202608270001_crm_property_search.sql`: canonical metadata, searchable fields, sync-run audit table, indexes, and parameterized search function.
- Modify `lib/expert-agent-feed.ts`: keep XML parsing source-specific and expose data used by the adapter.
- Modify `lib/property-view.ts`: reuse CRM-neutral type normalization rather than owning it in the view layer.
- Modify `lib/supabase.ts`: reflect the canonical database fields and sync-run types.
- Modify `scripts/sync-expert-agent.ts`: call the adapter and reconciliation service; record safe success/failure results.
- Create `.github/workflows/sync-expert-agent.yml`: hourly and manual Expert Agent sync.

### Shared search

- Create `lib/property-search/types.ts`: query, result, repository, and presentation-safe card contracts.
- Create `lib/property-search/query.ts`: Zod validation, URL parsing/serialization, department switching, and activity helpers.
- Create `lib/property-search/service.ts`: server-only search orchestration and row-to-card mapping.
- Create `lib/property-search/supabase-repository.ts`: calls the parameterized Supabase search function.
- Create `lib/property-search/server.ts`: server-only singleton wiring for the Supabase repository and search service.
- Create `lib/property-search/http.ts`: request-to-query conversion and public error payloads.
- Modify `app/api/properties/route.ts`: thin route around the shared HTTP handler.

### Search UI

- Create `lib/property-search/ui-options.ts`: department-aware price and supported filter options.
- Create `lib/property-search/navigation.ts`: canonical result and API URLs.
- Create `hooks/usePropertySearchResults.ts`: debounced fetch state for server-filtered results.
- Modify `hooks/useSearchFilters.ts`: use the shared query utilities and real request loading state.
- Modify `components/property/AdvancedSearch.tsx`: use shared types and remove unsupported controls.
- Modify `components/property/ActiveFilters.tsx`: render only supported canonical filters.
- Modify `components/property/QuickFilters.tsx`: emit canonical filter fields.
- Modify `components/property/MobileFilterDrawer.tsx`: pass department and the same filter contract as desktop.
- Modify `components/property/PropertySearchBar.tsx`: accept department and an explicit submit callback.
- Modify `components/property/index.ts`: export the shared search types and supported options.
- Modify `app/sales/properties/page.tsx` and `app/lettings/properties/page.tsx`: remove client filtering and render paginated API results.
- Modify `app/sections/PropertySearch.tsx`: add Buy/Rent mode and canonical navigation.
- Modify `app/sections/LettingsPropertySearch.tsx` and `app/sales/SalesPageClient.tsx`: remove duplicate URL builders.

### Chatbot

- Create `lib/property-chat.ts`: deterministic intent, clarification, context merge, strict response, and shared-search orchestration.
- Modify `app/api/chat/route.ts`: remove mock/OpenAI fallback paths and call the property-chat handler.
- Modify `components/ai/PropertyChatbot.tsx`: send structured search context and render canonical property cards.

### Tests and operations

- Create focused tests under `lib/__tests__/` for each pure boundary.
- Update `CRM-INTEGRATION-STATUS.md`: canonical architecture, schedule, required secrets, verification, and Streets extension boundary.

---

### Task 1: Canonical CRM Model and Expert Agent Adapter

**Files:**
- Create: `lib/crm/property-source.ts`
- Create: `lib/crm/expert-agent-adapter.ts`
- Create: `lib/__tests__/property-source.test.ts`
- Modify: `lib/expert-agent-feed.ts`
- Modify: `lib/property-view.ts`
- Modify: `lib/supabase.ts`
- Modify: `lib/__tests__/expert-agent-feed.test.ts`
- Modify: `lib/__tests__/property-view.test.ts`

**Interfaces:**
- Produces: `CrmSourceSystem`, `SearchPropertyType`, `SearchTenure`, `SearchFeature`, `PropertySourceAdapter<T>`, `normalizePropertyType()`, `normalizeTenure()`, `deriveSearchFeatures()`, and `expertAgentAdapter`.
- `expertAgentAdapter.map(record, { syncedAt })` returns `CanonicalPropertyWriteRow` with required neutral source and search fields.

- [ ] **Step 1: Write failing normalization and adapter tests**

Create `lib/__tests__/property-source.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { expertAgentAdapter } from "../crm/expert-agent-adapter.ts";
import {
  deriveSearchFeatures,
  normalizePropertyType,
  normalizeTenure,
} from "../crm/property-source.ts";
import { parseExpertAgentFeed } from "../expert-agent-feed.ts";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const xml = readFileSync(
  join(import.meta.dirname, "fixtures", "expert-agent-feed.xml"),
  "utf8",
);

test("normalizes property types and tenure for server filters", () => {
  assert.equal(normalizePropertyType("Detached Bungalow"), "bungalow");
  assert.equal(normalizePropertyType("Upper Floor Flat Apartment"), "flat");
  assert.equal(normalizeTenure("Share of Freehold"), "share_of_freehold");
  assert.equal(normalizeTenure("Not supplied"), "unknown");
});

test("derives only supported features from explicit source wording", () => {
  assert.deepEqual(
    deriveSearchFeatures(
      ["Landscaped garden", "Off-street parking", "No onward chain"],
      "",
    ),
    ["garden", "parking", "chain_free"],
  );
  assert.deepEqual(deriveSearchFeatures(["Spacious family home"], ""), []);
});

test("maps Expert Agent data to CRM-neutral source metadata", () => {
  const record = parseExpertAgentFeed(xml).properties[0];
  const row = expertAgentAdapter.map(record, {
    syncedAt: "2026-08-27T09:00:00.000Z",
  });

  assert.equal(row.source_system, "expert_agent");
  assert.equal(row.source_id, record.reference);
  assert.equal(row.expert_agent_id, record.reference);
  assert.equal(row.is_active, true);
  assert.equal(row.last_synced_at, "2026-08-27T09:00:00.000Z");
  assert.equal(row.search_property_type, "house");
  assert.equal(row.search_tenure, "freehold");
  assert.ok(row.search_features.includes("garden"));
});
```

Update existing fixture objects typed as `DbProperty` to include:

```ts
source_system: "expert_agent",
source_id: "BPGC1479",
source_updated_at: undefined,
last_synced_at: "2026-08-15T00:00:00Z",
is_active: true,
search_property_type: "house",
search_tenure: "freehold",
search_features: ["garage", "virtual_tour"],
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-source.test.ts \
  lib/__tests__/expert-agent-feed.test.ts \
  lib/__tests__/property-view.test.ts
```

Expected: FAIL because `lib/crm/property-source.ts` and `expertAgentAdapter` do not exist.

- [ ] **Step 3: Implement the neutral source contract and adapter**

Create `lib/crm/property-source.ts` with these exact public unions and interface:

```ts
import type { DbProperty } from "../supabase";

export const CRM_SOURCE_SYSTEMS = ["expert_agent", "streets"] as const;
export type CrmSourceSystem = (typeof CRM_SOURCE_SYSTEMS)[number];

export const SEARCH_PROPERTY_TYPES = [
  "house", "flat", "bungalow", "maisonette", "land", "commercial",
] as const;
export type SearchPropertyType = (typeof SEARCH_PROPERTY_TYPES)[number];

export const SEARCH_TENURES = [
  "freehold", "leasehold", "share_of_freehold", "unknown",
] as const;
export type SearchTenure = (typeof SEARCH_TENURES)[number];

export const SEARCH_FEATURES = [
  "garden", "parking", "garage", "balcony", "conservatory", "fireplace",
  "period_features", "new_home", "chain_free", "virtual_tour", "video_tour",
] as const;
export type SearchFeature = (typeof SEARCH_FEATURES)[number];

export type CanonicalPropertyWriteRow = Omit<
  DbProperty,
  "id" | "created_at" | "updated_at"
>;

export interface PropertySourceAdapter<TRecord> {
  readonly sourceSystem: CrmSourceSystem;
  map(
    record: TRecord,
    context: { syncedAt: string },
  ): CanonicalPropertyWriteRow;
}
```

Implement normalization with ordered rules so bungalow and flat are checked before the house fallback, lower-case/trim tenure before matching, and accumulate features in `SEARCH_FEATURES` order. Reuse the current honest regular expressions from `deriveFeatureFlags`; add balcony only for `/balcony/`, and never infer parking from garage alone.

Create `lib/crm/expert-agent-adapter.ts`:

```ts
import { toDbProperty, type FeedProperty } from "../expert-agent-feed";
import {
  deriveSearchFeatures,
  normalizePropertyType,
  normalizeTenure,
  type PropertySourceAdapter,
} from "./property-source";

export const expertAgentAdapter: PropertySourceAdapter<FeedProperty> = {
  sourceSystem: "expert_agent",
  map(record, { syncedAt }) {
    const base = toDbProperty(record);
    return {
      ...base,
      source_system: "expert_agent",
      source_id: record.reference,
      source_updated_at: undefined,
      last_synced_at: syncedAt,
      is_active: true,
      search_property_type: normalizePropertyType(base.property_type),
      search_tenure: normalizeTenure(base.tenure),
      search_features: deriveSearchFeatures(base.features, base.virtual_tour_url),
    };
  },
};
```

Extend `DbProperty` with the required canonical fields, keeping `expert_agent_id?: string` for URLs. Change `toDbProperty()`'s return type so the adapter supplies canonical fields. Make `categorisePropertyType()` delegate to `normalizePropertyType()` and make `deriveFeatureFlags()` build its booleans from `deriveSearchFeatures()` while preserving its existing public shape.

- [ ] **Step 4: Run focused and full property tests**

Run:

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-source.test.ts \
  lib/__tests__/expert-agent-feed.test.ts \
  lib/__tests__/property-view.test.ts
```

Expected: PASS with no inferred parking from a garage-only listing.

- [ ] **Step 5: Commit the canonical model**

```bash
git add lib/crm/property-source.ts lib/crm/expert-agent-adapter.ts \
  lib/expert-agent-feed.ts lib/property-view.ts lib/supabase.ts \
  lib/__tests__/property-source.test.ts lib/__tests__/expert-agent-feed.test.ts \
  lib/__tests__/property-view.test.ts
git commit -m "feat: add CRM-neutral property model"
```

---

### Task 2: Reversible Supabase Migration and Parameterized Search Function

**Files:**
- Create: `supabase/migrations/202608270001_crm_property_search.sql`
- Create: `lib/__tests__/crm-migration.test.ts`

**Interfaces:**
- Produces: canonical property columns, unique `(source_system, source_id)` index, searchable indexes, `crm_sync_runs`, and Postgres RPC `search_properties(...)`.
- Consumed later by: `supabase-sync-repository.ts` and `supabase-repository.ts`.

- [ ] **Step 1: Write a failing migration contract test**

Create `lib/__tests__/crm-migration.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sql = readFileSync(
  join(process.cwd(), "supabase/migrations/202608270001_crm_property_search.sql"),
  "utf8",
);

test("migration creates neutral source fields and sync audit records", () => {
  for (const field of [
    "source_system", "source_id", "source_updated_at", "last_synced_at",
    "is_active", "search_property_type", "search_tenure", "search_features",
  ]) {
    assert.match(sql, new RegExp(`\\b${field}\\b`));
  }
  assert.match(sql, /unique index[\s\S]*source_system[\s\S]*source_id/i);
  assert.match(sql, /create table[\s\S]*crm_sync_runs/i);
});

test("migration exposes a parameterized paginated search function", () => {
  assert.match(sql, /create or replace function public\.search_properties/i);
  assert.match(sql, /p_department text/i);
  assert.match(sql, /p_location text/i);
  assert.match(sql, /p_features text\[\]/i);
  assert.match(sql, /count\(\*\) over\(\)/i);
  assert.match(sql, /p\.is_active = true/i);
});
```

- [ ] **Step 2: Run the migration test and verify failure**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/crm-migration.test.ts
```

Expected: FAIL with `ENOENT` because the migration does not exist.

- [ ] **Step 3: Write the reversible migration**

The migration must:

```sql
alter table public.properties
  add column if not exists source_system text,
  add column if not exists source_id text,
  add column if not exists source_updated_at timestamptz,
  add column if not exists last_synced_at timestamptz,
  add column if not exists is_active boolean not null default true,
  add column if not exists search_property_type text,
  add column if not exists search_tenure text,
  add column if not exists search_features text[] not null default '{}';

update public.properties
set source_system = coalesce(source_system, 'expert_agent'),
    source_id = coalesce(source_id, expert_agent_id, id::text),
    last_synced_at = coalesce(last_synced_at, updated_at, created_at),
    search_tenure = coalesce(search_tenure, 'unknown')
where source_system is null
   or source_id is null
   or last_synced_at is null
   or search_tenure is null;

alter table public.properties
  alter column source_system set not null,
  alter column source_id set not null,
  alter column last_synced_at set not null;

create unique index if not exists properties_source_identity_idx
  on public.properties (source_system, source_id);
create index if not exists properties_public_search_idx
  on public.properties (department, is_active, status, price);
create index if not exists properties_search_features_idx
  on public.properties using gin (search_features);

create table if not exists public.crm_sync_runs (
  id uuid primary key default gen_random_uuid(),
  source_system text not null,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  status text not null check (status in ('success', 'failure')),
  records_read integer not null default 0,
  records_written integer not null default 0,
  records_deactivated integer not null default 0,
  error_summary text,
  created_at timestamptz not null default now()
);
alter table public.crm_sync_runs enable row level security;
```

Add this parameterized search RPC:

```sql
create or replace function public.search_properties(
  p_department text,
  p_location text default null,
  p_min_price numeric default null,
  p_max_price numeric default null,
  p_min_bedrooms integer default null,
  p_min_bathrooms integer default null,
  p_property_types text[] default '{}',
  p_tenures text[] default '{}',
  p_features text[] default '{}',
  p_statuses text[] default '{}',
  p_sort text default 'default',
  p_limit integer default 24,
  p_offset integer default 0
)
returns table(property jsonb, total_count bigint)
language sql
stable
security invoker
as $function$
  select to_jsonb(p), count(*) over()
  from public.properties p
  where p.is_active = true
    and p.department = p_department
    and (cardinality(p_statuses) = 0 or p.status = any(p_statuses))
    and (p_min_price is null or p.price >= p_min_price)
    and (p_max_price is null or p.price <= p_max_price)
    and (p_min_bedrooms is null or p.bedrooms >= p_min_bedrooms)
    and (p_min_bathrooms is null or p.bathrooms >= p_min_bathrooms)
    and (cardinality(p_property_types) = 0 or p.search_property_type = any(p_property_types))
    and (cardinality(p_tenures) = 0 or p.search_tenure = any(p_tenures))
    and (cardinality(p_features) = 0 or p.search_features @> p_features)
    and (
      p_location is null
      or btrim(p_location) = ''
      or lower(concat_ws(' ', p.title, p.address)) like '%' || lower(btrim(p_location)) || '%'
      or replace(lower(coalesce(p.postcode, '')), ' ', '') like
         '%' || replace(lower(btrim(p_location)), ' ', '') || '%'
    )
  order by
    case when p_sort = 'price_asc' then p.price end asc nulls last,
    case when p_sort = 'price_desc' then p.price end desc nulls last,
    coalesce(p.source_updated_at, p.created_at) desc,
    p.source_id asc
  limit least(greatest(p_limit, 1), 48)
  offset greatest(p_offset, 0);
$function$;

grant execute on function public.search_properties(
  text, text, numeric, numeric, integer, integer,
  text[], text[], text[], text[], text, integer, integer
) to anon, authenticated;
```

Do not add a public RLS policy to `crm_sync_runs`; only the service-role sync may write it. Keep existing property read policy unchanged.

- [ ] **Step 4: Run the migration contract test**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/crm-migration.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the migration**

```bash
git add supabase/migrations/202608270001_crm_property_search.sql \
  lib/__tests__/crm-migration.test.ts
git commit -m "feat: add canonical property search schema"
```

---

### Task 3: Failure-Safe Expert Agent Reconciliation

**Files:**
- Create: `lib/crm/property-sync.ts`
- Create: `lib/crm/supabase-sync-repository.ts`
- Create: `lib/__tests__/property-sync.test.ts`
- Modify: `scripts/sync-expert-agent.ts`

**Interfaces:**
- Consumes: `CanonicalPropertyWriteRow`, `CrmSourceSystem`, and `expertAgentAdapter` from Task 1.
- Produces: `PropertySyncRepository`, `reconcileCompleteFeed()`, `SupabaseSyncRepository`, and `SyncSummary`.

- [ ] **Step 1: Write failing reconciliation tests with an in-memory repository**

Create `lib/__tests__/property-sync.test.ts` with a repository fake that records calls, then assert:

```ts
test("rejects an empty feed before writing or deactivating", async () => {
  const repository = createFakeSyncRepository(["EA-OLD"]);
  await assert.rejects(
    reconcileCompleteFeed(repository, {
      sourceSystem: "expert_agent",
      rows: [],
      startedAt: "2026-08-27T09:00:00.000Z",
      finishedAt: "2026-08-27T09:00:05.000Z",
    }),
    /empty or invalid/i,
  );
  assert.equal(repository.upsertCalls.length, 0);
  assert.equal(repository.deactivateCalls.length, 0);
});

test("upserts current rows and deactivates only missing source ids", async () => {
  const repository = createFakeSyncRepository(["EA-1", "EA-OLD"]);
  const summary = await reconcileCompleteFeed(repository, {
    sourceSystem: "expert_agent",
    rows: [canonicalRow("EA-1"), canonicalRow("EA-2")],
    startedAt: "2026-08-27T09:00:00.000Z",
    finishedAt: "2026-08-27T09:00:05.000Z",
  });
  assert.deepEqual(repository.deactivateCalls, [["EA-OLD"]]);
  assert.deepEqual(summary, { recordsRead: 2, recordsWritten: 2, recordsDeactivated: 1 });
});
```

Build the row and repository helpers from the real adapter so the tests stay complete without duplicating every property field:

```ts
const template = expertAgentAdapter.map(
  parseExpertAgentFeed(xml).properties[0],
  { syncedAt: "2026-08-27T09:00:00.000Z" },
);

function canonicalRow(sourceId: string): CanonicalPropertyWriteRow {
  return {
    ...template,
    source_id: sourceId,
    expert_agent_id: sourceId,
  };
}

function createFakeSyncRepository(activeIds: string[]) {
  const upsertCalls: CanonicalPropertyWriteRow[][] = [];
  const deactivateCalls: string[][] = [];
  const repository: PropertySyncRepository & {
    upsertCalls: CanonicalPropertyWriteRow[][];
    deactivateCalls: string[][];
  } = {
    upsertCalls,
    deactivateCalls,
    async listActiveSourceIds() { return [...activeIds]; },
    async upsert(rows) { upsertCalls.push(rows); return rows.length; },
    async deactivate(_source, ids) { deactivateCalls.push(ids); return ids.length; },
    async recordRun() { return; },
  };
  return repository;
}
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/property-sync.test.ts
```

Expected: FAIL because the reconciliation module does not exist.

- [ ] **Step 3: Implement the injected reconciliation boundary**

Create `lib/crm/property-sync.ts`:

```ts
import type {
  CanonicalPropertyWriteRow,
  CrmSourceSystem,
} from "./property-source";

export interface SyncRunRecord {
  sourceSystem: CrmSourceSystem;
  startedAt: string;
  finishedAt: string;
  status: "success" | "failure";
  recordsRead: number;
  recordsWritten: number;
  recordsDeactivated: number;
  errorSummary?: string;
}

export interface PropertySyncRepository {
  listActiveSourceIds(source: CrmSourceSystem): Promise<string[]>;
  upsert(rows: CanonicalPropertyWriteRow[]): Promise<number>;
  deactivate(source: CrmSourceSystem, sourceIds: string[], at: string): Promise<number>;
  recordRun(run: SyncRunRecord): Promise<void>;
}

export interface SyncSummary {
  recordsRead: number;
  recordsWritten: number;
  recordsDeactivated: number;
}
```

`reconcileCompleteFeed()` must reject zero rows and duplicate source IDs before any repository mutation, read active IDs, upsert all incoming rows on `(source_system, source_id)`, and mark only missing IDs inactive. It returns counts but does not record success/failure itself; the script owns the outer run lifecycle so download and parse failures are also audited.

Implement `SupabaseSyncRepository` with the admin client. Batch IDs rather than constructing an unbounded URL, upsert on `source_system,source_id`, and update `is_active=false,last_synced_at=<finishedAt>` only for the missing source IDs. Translate Supabase errors into contextual `Error` messages without secret values.

Refactor the executable body of `scripts/sync-expert-agent.ts` into `async function main(): Promise<void>` followed by `await main()`. Create the repository and outer run lifecycle before FTP download and parsing. Move the current FTP listing, download, unzip, and `xmlPath` resolution statements unchanged inside the `try`, immediately before the parse segment shown below. This allows download and parse errors to be recorded when Supabase itself remains available and lets dry-run return through the existing `finally` cleanup:

```ts
const startedAt = new Date().toISOString();
const { supabaseAdmin } = DRY_RUN
  ? { supabaseAdmin: null }
  : await import("../lib/supabase.ts");
if (!DRY_RUN && !supabaseAdmin) {
  fail("supabaseAdmin not configured (SUPABASE_SERVICE_ROLE_KEY)");
}
const repository = supabaseAdmin
  ? new SupabaseSyncRepository(supabaseAdmin)
  : null;
let recordsRead = 0;
try {
  const feed = parseExpertAgentFeed(readFileSync(xmlPath, "utf8"));
  recordsRead = feed.properties.length;
  const rows = feed.properties.map((record) =>
    expertAgentAdapter.map(record, { syncedAt: startedAt }),
  );
  if (DRY_RUN) {
    printDryRun(rows);
    return;
  }
  if (!repository) throw new Error("Sync repository is unavailable");
  const summary = await reconcileCompleteFeed(repository, {
    sourceSystem: "expert_agent",
    rows,
    startedAt,
    finishedAt: new Date().toISOString(),
  });
  await repository.recordRun({
    sourceSystem: "expert_agent",
    startedAt,
    finishedAt: new Date().toISOString(),
    status: "success",
    ...summary,
  });
} catch (error) {
  if (repository) {
    await repository.recordRun({
      sourceSystem: "expert_agent",
      startedAt,
      finishedAt: new Date().toISOString(),
      status: "failure",
      recordsRead,
      recordsWritten: 0,
      recordsDeactivated: 0,
      errorSummary: error instanceof Error ? error.message.slice(0, 500) : "Unknown sync failure",
    });
  }
  throw error;
}
```

`printDryRun(rows)` is the current dry-run output loop extracted into a named local function; it prints rows and the “nothing written” summary, then returns without creating a repository or sync-run record. Preserve postcode-centroid geocoding, image URL behavior, temporary-directory cleanup, and non-zero exit on failure. Do not log FTP credentials or the service-role key.

- [ ] **Step 4: Run sync and parser tests**

Run:

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-sync.test.ts \
  lib/__tests__/property-source.test.ts \
  lib/__tests__/expert-agent-feed.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the failure-safe sync**

```bash
git add lib/crm/property-sync.ts lib/crm/supabase-sync-repository.ts \
  lib/__tests__/property-sync.test.ts scripts/sync-expert-agent.ts
git commit -m "feat: make Expert Agent sync failure safe"
```

---

### Task 4: Hourly Sync Workflow and Operational Contract

**Files:**
- Create: `.github/workflows/sync-expert-agent.yml`
- Create: `lib/__tests__/crm-workflow.test.ts`
- Modify: `CRM-INTEGRATION-STATUS.md`

**Interfaces:**
- Consumes: `scripts/sync-expert-agent.ts` from Task 3.
- Produces: manual `workflow_dispatch` and hourly cron execution using six named repository secrets.

- [ ] **Step 1: Write a failing workflow contract test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const workflow = readFileSync(
  join(process.cwd(), ".github/workflows/sync-expert-agent.yml"),
  "utf8",
);

test("runs the real Expert Agent sync hourly and manually", () => {
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /cron: ['"]17 \* \* \* \*['"]/);
  assert.match(workflow, /node --experimental-strip-types scripts\/sync-expert-agent\.ts/);
});

test("reads every credential from GitHub secrets", () => {
  for (const name of [
    "EXPERT_AGENT_FTP_URL", "EXPERT_AGENT_FTP_USER", "EXPERT_AGENT_FTP_PASS",
    "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]) {
    assert.match(workflow, new RegExp(`secrets\\.${name}`));
  }
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/crm-workflow.test.ts
```

Expected: FAIL with `ENOENT`.

- [ ] **Step 3: Create the workflow and operations documentation**

Create `.github/workflows/sync-expert-agent.yml`:

```yaml
name: Sync Expert Agent properties

on:
  workflow_dispatch:
  schedule:
    - cron: '17 * * * *'

concurrency:
  group: expert-agent-property-sync
  cancel-in-progress: false

jobs:
  sync:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - name: Sync canonical properties
        run: node --experimental-strip-types scripts/sync-expert-agent.ts
        env:
          EXPERT_AGENT_FTP_URL: ${{ secrets.EXPERT_AGENT_FTP_URL }}
          EXPERT_AGENT_FTP_USER: ${{ secrets.EXPERT_AGENT_FTP_USER }}
          EXPERT_AGENT_FTP_PASS: ${{ secrets.EXPERT_AGENT_FTP_PASS }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

Update `CRM-INTEGRATION-STATUS.md` with the canonical data flow, required secret names, manual dry-run command, manual workflow verification, `crm_sync_runs` checks, hourly schedule, failure behavior, and Streets adapter/capability boundary. Do not paste credential values.

- [ ] **Step 4: Run the workflow test**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/crm-workflow.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the schedule**

```bash
git add .github/workflows/sync-expert-agent.yml \
  lib/__tests__/crm-workflow.test.ts CRM-INTEGRATION-STATUS.md
git commit -m "chore: schedule hourly Expert Agent sync"
```

---

### Task 5: Shared Search Query and URL Contract

**Files:**
- Create: `lib/property-search/types.ts`
- Create: `lib/property-search/query.ts`
- Create: `lib/__tests__/property-search-query.test.ts`

**Interfaces:**
- Consumes: canonical filter unions from `lib/crm/property-source.ts`.
- Produces: `PropertySearchQuery`, `PropertySearchFilters`, `PropertySearchResult`, `propertySearchQuerySchema`, `createDefaultPropertySearchQuery()`, `parsePropertySearchParams()`, `serializePropertySearchQuery()`, `switchSearchDepartment()`, and `hasActivePropertyFilters()`.

- [ ] **Step 1: Write failing query behavior tests**

```ts
test("round-trips supported shareable filters", () => {
  const query = parsePropertySearchParams(
    new URLSearchParams(
      "location=EN6+4EF&minPrice=500000&minBedrooms=3&propertyTypes=house,bungalow&tenures=freehold&features=garden,parking&sort=price_asc&page=2",
    ),
    "sales",
  );
  assert.equal(query.department, "sales");
  assert.equal(query.location, "EN6 4EF");
  assert.deepEqual(query.propertyTypes, ["house", "bungalow"]);
  assert.deepEqual(query.features, ["garden", "parking"]);
  assert.equal(parsePropertySearchParams(serializePropertySearchQuery(query), "sales").page, 2);
});

test("drops unsupported and unsafe values", () => {
  const query = parsePropertySearchParams(
    new URLSearchParams("radius=20&sort=popular&page=-3&pageSize=500&features=garden,hacked"),
    "lettings",
  );
  assert.equal(query.sort, "default");
  assert.equal(query.page, 1);
  assert.equal(query.pageSize, 24);
  assert.deepEqual(query.features, ["garden"]);
});

test("switching department resets incompatible commercial filters", () => {
  const sales = parsePropertySearchParams(
    new URLSearchParams("location=Cuffley&minPrice=500000&tenures=freehold&page=3"),
    "sales",
  );
  const lettings = switchSearchDepartment(sales, "lettings");
  assert.equal(lettings.location, "Cuffley");
  assert.equal(lettings.minPrice, undefined);
  assert.deepEqual(lettings.tenures, []);
  assert.equal(lettings.page, 1);
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/property-search-query.test.ts
```

Expected: FAIL because the query modules do not exist.

- [ ] **Step 3: Implement validated types and URL helpers**

Define the public contract in `types.ts`:

```ts
export type PropertyDepartment = "sales" | "lettings";
export type PublicPropertyStatus = "for_sale" | "under_offer" | "to_let" | "let_agreed";
export type PropertySort = "default" | "price_asc" | "price_desc";

export interface PropertySearchQuery {
  department: PropertyDepartment;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  propertyTypes: SearchPropertyType[];
  tenures: SearchTenure[];
  features: SearchFeature[];
  statuses: PublicPropertyStatus[];
  sort: PropertySort;
  page: number;
  pageSize: number;
}

export type PropertySearchFilters = Omit<
  PropertySearchQuery,
  "department" | "statuses" | "page" | "pageSize"
>;

export interface PropertySearchResult {
  query: PropertySearchQuery;
  properties: PropertyCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  lastSyncedAt: string | null;
}
```

Build a strict Zod schema with coerced non-negative integers, page minimum `1`, page-size minimum `1` and maximum `48`, trimmed location maximum `120`, and enum arrays filtered through safe parsers. Defaults are `sort="default"`, `page=1`, `pageSize=24`, empty type/tenure/feature arrays, and department-specific public statuses.

Export the canonical initializer used by pages and local search panels:

```ts
export function createDefaultPropertySearchQuery(
  department: PropertyDepartment,
): PropertySearchQuery {
  return {
    department,
    propertyTypes: [],
    tenures: [],
    features: [],
    statuses: department === "sales"
      ? ["for_sale", "under_offer"]
      : ["to_let", "let_agreed"],
    sort: "default",
    page: 1,
    pageSize: 24,
  };
}
```

`parsePropertySearchParams()` must accept canonical parameters and the legacy `minBeds`, `minBaths`, `propertyType`, individual `garden=true` style flags, and `sortBy` names. It must emit only canonical fields. `serializePropertySearchQuery()` writes only canonical names, omits defaults, and never writes `department` because the result-page path owns it. `switchSearchDepartment()` resets price, tenure, statuses, and page while preserving location, bedroom/bathroom minimums, property types, features, and supported sort.

- [ ] **Step 4: Run the query test**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/property-search-query.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the shared query contract**

```bash
git add lib/property-search/types.ts lib/property-search/query.ts \
  lib/__tests__/property-search-query.test.ts
git commit -m "feat: add shared property search contract"
```

---

### Task 6: Server Search Service and Public Property API

**Files:**
- Create: `lib/property-search/service.ts`
- Create: `lib/property-search/supabase-repository.ts`
- Create: `lib/property-search/server.ts`
- Create: `lib/property-search/http.ts`
- Create: `lib/__tests__/property-search-service.test.ts`
- Create: `lib/__tests__/property-search-http.test.ts`
- Modify: `app/api/properties/route.ts`

**Interfaces:**
- Consumes: `PropertySearchQuery`, `PropertySearchResult`, `DbProperty`, and SQL RPC `search_properties`.
- Produces: `PropertySearchRepository.search(query)`, `createPropertySearchService(repository)`, singleton `searchProperties(query)`, and `handlePropertySearchRequest(request, search)`.

- [ ] **Step 1: Write failing service and HTTP tests**

Use an injected fake repository:

```ts
test("maps repository rows to safe cards with real totals and freshness", async () => {
  const search = createPropertySearchService({
    async search() {
      return {
        rows: [canonicalDbProperty("EA-1")],
        total: 27,
        lastSyncedAt: "2026-08-27T09:00:00.000Z",
      };
    },
  });
  const result = await search(validSalesQuery({ page: 2, pageSize: 12 }));
  assert.equal(result.properties[0].id, "EA-1");
  assert.equal(result.total, 27);
  assert.equal(result.totalPages, 3);
  assert.equal(result.lastSyncedAt, "2026-08-27T09:00:00.000Z");
  assert.equal("source_id" in result.properties[0], false);
});

test("returns 400 for an invalid department and 503 for search failure", async () => {
  const bad = await handlePropertySearchRequest(
    new Request("https://banc.test/api/properties?department=other"),
    async () => { throw new Error("must not run"); },
  );
  assert.equal(bad.status, 400);

  const unavailable = await handlePropertySearchRequest(
    new Request("https://banc.test/api/properties?department=sales"),
    async () => { throw new Error("database details stay private"); },
  );
  assert.equal(unavailable.status, 503);
  assert.deepEqual(await unavailable.json(), {
    error: "Live listings are temporarily unavailable. Please try again shortly.",
  });
});
```

Define the test helpers from real production mappings:

```ts
const templateWriteRow = expertAgentAdapter.map(
  parseExpertAgentFeed(xml).properties[0],
  { syncedAt: "2026-08-27T09:00:00.000Z" },
);

function canonicalDbProperty(sourceId: string): DbProperty {
  return {
    ...templateWriteRow,
    id: `uuid-${sourceId}`,
    source_id: sourceId,
    expert_agent_id: sourceId,
    created_at: "2026-08-15T00:00:00.000Z",
    updated_at: "2026-08-27T09:00:00.000Z",
  };
}

function validSalesQuery(
  overrides: Partial<PropertySearchQuery> = {},
): PropertySearchQuery {
  return { ...createDefaultPropertySearchQuery("sales"), ...overrides };
}
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-search-service.test.ts \
  lib/__tests__/property-search-http.test.ts
```

Expected: FAIL because the service and handler do not exist.

- [ ] **Step 3: Implement repository, service, and route**

Define the repository boundary in `types.ts` or `service.ts`:

```ts
export interface PropertySearchRepositoryResult {
  rows: DbProperty[];
  total: number;
  lastSyncedAt: string | null;
}

export interface PropertySearchRepository {
  search(query: PropertySearchQuery): Promise<PropertySearchRepositoryResult>;
}
```

`SupabasePropertySearchRepository.search()` receives a Supabase client and calls `client.rpc("search_properties", ...)` with typed values and `(page - 1) * pageSize`. Parse each `{ property, total_count }` row, take total from the first row, and query the latest successful `crm_sync_runs.finished_at` for `lastSyncedAt`. Throw contextual errors when either query fails.

`createPropertySearchService()` validates its input again, calls the repository, maps rows through `dbToCard()`, and computes `totalPages = Math.ceil(total / pageSize)`. Keep this injected factory importable by Node tests. In `server.ts`, add `import "server-only"`, require `supabaseAdmin`, construct `SupabasePropertySearchRepository(supabaseAdmin)`, and export the singleton `searchProperties`. The service-role client remains server-only and can read `crm_sync_runs` without adding a public error-log policy.

`handlePropertySearchRequest()` must require `department`, parse the URL through `parsePropertySearchParams()`, return `{ ...PropertySearchResult }` with status `200`, invalid input with status `400`, and the fixed human-readable status `503` response above. Do not include exception messages.

Replace `app/api/properties/route.ts` with a thin adapter:

```ts
import { handlePropertySearchRequest } from "@/lib/property-search/http";
import { searchProperties } from "@/lib/property-search/server";

export async function GET(request: Request): Promise<Response> {
  const response = await handlePropertySearchRequest(request, searchProperties);
  response.headers.set("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  return response;
}
```

- [ ] **Step 4: Run the service tests and TypeScript check**

Run:

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-search-service.test.ts \
  lib/__tests__/property-search-http.test.ts \
  lib/__tests__/property-view.test.ts
npx --no-install tsc --noEmit
```

Expected: all tests PASS and TypeScript exits `0`.

- [ ] **Step 5: Commit the server search**

```bash
git add lib/property-search/service.ts lib/property-search/supabase-repository.ts \
  lib/property-search/server.ts lib/property-search/http.ts lib/property-search/types.ts \
  lib/__tests__/property-search-service.test.ts \
  lib/__tests__/property-search-http.test.ts app/api/properties/route.ts
git commit -m "feat: serve canonical property search results"
```

---

### Task 7: Supported Search Controls and Department-Aware Options

**Files:**
- Create: `lib/property-search/ui-options.ts`
- Create: `lib/__tests__/property-search-ui-options.test.ts`
- Modify: `components/property/AdvancedSearch.tsx`
- Modify: `components/property/ActiveFilters.tsx`
- Modify: `components/property/QuickFilters.tsx`
- Modify: `components/property/MobileFilterDrawer.tsx`
- Modify: `components/property/PropertySearchBar.tsx`
- Modify: `components/property/index.ts`

**Interfaces:**
- Consumes: `PropertySearchFilters`, `PropertyDepartment`, and canonical feature/type/tenure unions.
- Produces: `getPriceOptions(department)`, supported sort/type/tenure/feature option arrays, and `PropertySearchBarProps.department` plus `onSearch()`.

- [ ] **Step 1: Write failing supported-option tests**

```ts
test("uses sales prices for buying and monthly prices for renting", () => {
  assert.ok(getPriceOptions("sales").some((option) => option.value === 500000));
  assert.ok(getPriceOptions("lettings").some((option) => option.value === 1500));
  assert.equal(getPriceOptions("lettings").some((option) => option.value === 500000), false);
});

test("does not expose unsupported radius or invented sorting", () => {
  assert.deepEqual(SORT_OPTIONS.map((option) => option.value), [
    "default", "price_asc", "price_desc",
  ]);
  assert.equal(UNSUPPORTED_FILTER_KEYS.includes("radius"), true);
  assert.equal(SORT_OPTIONS.some((option) => option.value === "popular"), false);
  assert.equal(SORT_OPTIONS.some((option) => option.value === "reduced"), false);
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/property-search-ui-options.test.ts
```

Expected: FAIL because `ui-options.ts` does not exist.

- [ ] **Step 3: Implement shared options and update every filter surface**

Move price, property type, tenure, supported feature, and sort option data into `ui-options.ts`. Sales prices retain sensible purchase bands; lettings prices use monthly rent bands. Use these exact sort options:

```ts
export const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;
```

Replace the component-local `SearchFilters` interface with `PropertySearchFilters`. Remove radius, maximum bedroom, maximum bathroom, “Newest Listed”, “Reduced Price”, and “Most Popular” controls and chips. Store selected features, types, and tenures as canonical arrays; a toggle adds or removes one enum value. `PropertySearchBar` receives:

```ts
interface PropertySearchBarProps {
  department: PropertyDepartment;
  filters: PropertySearchFilters;
  onFilterChange: (filters: Partial<PropertySearchFilters>) => void;
  onClearFilters: () => void;
  onSearch: () => void;
  hasActiveFilters: boolean;
  isLoading?: boolean;
  resultCount?: number;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  className?: string;
  showMapButton?: boolean;
}
```

The location form and Search button call `onSearch()` after applying the current location input. Pass `department` through the mobile drawer into `AdvancedSearch` so both layouts use identical price options.

- [ ] **Step 4: Run option tests and TypeScript**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/property-search-ui-options.test.ts
npx --no-install tsc --noEmit
```

Expected: PASS and no stale references to `radius`, `popular`, or `reduced` in the property search components.

- [ ] **Step 5: Commit supported controls**

```bash
git add lib/property-search/ui-options.ts \
  lib/__tests__/property-search-ui-options.test.ts \
  components/property/AdvancedSearch.tsx components/property/ActiveFilters.tsx \
  components/property/QuickFilters.tsx components/property/MobileFilterDrawer.tsx \
  components/property/PropertySearchBar.tsx components/property/index.ts
git commit -m "refactor: align property filters with live data"
```

---

### Task 8: URL-Driven Paginated Sales and Lettings Results

**Files:**
- Create: `lib/property-search/navigation.ts`
- Create: `hooks/usePropertySearchResults.ts`
- Create: `lib/__tests__/property-search-navigation.test.ts`
- Modify: `hooks/useSearchFilters.ts`
- Modify: `app/sales/properties/page.tsx`
- Modify: `app/lettings/properties/page.tsx`

**Interfaces:**
- Consumes: query helpers from Task 5 and `/api/properties` result contract from Task 6.
- Produces: `buildPropertyResultsHref()`, `buildPropertyApiHref()`, `fetchPropertySearchResults()`, and `usePropertySearchResults()`.

- [ ] **Step 1: Write failing URL and fetch tests**

```ts
test("builds department-specific result and API URLs from one query", () => {
  const query = validSalesQuery({ location: "Cuffley", page: 2 });
  assert.equal(
    buildPropertyResultsHref(query),
    "/sales/properties?location=Cuffley&page=2",
  );
  assert.equal(
    buildPropertyApiHref(query),
    "/api/properties?department=sales&location=Cuffley&page=2",
  );
});

test("throws a public message when the property API fails", async () => {
  const fetcher = async () => new Response("unavailable", { status: 503 });
  await assert.rejects(
    fetchPropertySearchResults(fetcher, validSalesQuery()),
    /Live listings are temporarily unavailable/i,
  );
});
```

Define the local query helper explicitly:

```ts
function validSalesQuery(
  overrides: Partial<PropertySearchQuery> = {},
): PropertySearchQuery {
  return { ...createDefaultPropertySearchQuery("sales"), ...overrides };
}
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/property-search-navigation.test.ts
```

Expected: FAIL because the navigation module does not exist.

- [ ] **Step 3: Implement real request state and replace client filtering**

`buildPropertyResultsHref()` serializes canonical query fields and selects `/sales/properties` or `/lettings/properties`. `buildPropertyApiHref()` adds the required `department` parameter. `fetchPropertySearchResults()` accepts an injected `fetch` implementation, validates `response.ok`, and returns `PropertySearchResult`.

Refactor `useSearchFilters({ department, debounceMs: 300 })` to parse shared fields, replace the URL after the debounce, reset `page=1` when filters change, and expose the canonical query. Remove the simulated 200 ms loading timer.

`usePropertySearchResults(query)` must:

```ts
const [state, setState] = React.useState<{
  result: PropertySearchResult | null;
  isLoading: boolean;
  error: string | null;
}>({ result: null, isLoading: true, error: null });
```

Fetch whenever the serialized query changes, cancel stale requests with `AbortController`, preserve the current result while a replacement request loads, and expose a retry callback.

In both results pages, delete `useLiveProperties`, `filterProperties`, `sortProperties`, and empty sample arrays. Render `result.properties`, `result.total`, and `result.totalPages`. Map uses only the current page's real cards. Add Previous/Next controls that set canonical `page`; disable at boundaries. Show the fixed temporary-error message with Retry and show the approved broadening guidance for zero matches. Preserve grid/list/map presentation and reduced-motion behavior.

- [ ] **Step 4: Run tests and production type checks**

Run:

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-search-query.test.ts \
  lib/__tests__/property-search-navigation.test.ts
npx --no-install tsc --noEmit
```

Expected: PASS. Searching either department makes one paginated API request; no listing page downloads all properties for client filtering.

- [ ] **Step 5: Commit server-driven results pages**

```bash
git add lib/property-search/navigation.ts hooks/usePropertySearchResults.ts \
  lib/__tests__/property-search-navigation.test.ts hooks/useSearchFilters.ts \
  app/sales/properties/page.tsx app/lettings/properties/page.tsx
git commit -m "feat: use server-filtered property results"
```

---

### Task 9: Homepage Buy/Rent Search and Shared Navigation

**Files:**
- Create: `lib/__tests__/property-search-home.test.ts`
- Modify: `app/sections/PropertySearch.tsx`
- Modify: `app/sections/LettingsPropertySearch.tsx`
- Modify: `app/sales/SalesPageClient.tsx`
- Modify: `lib/__tests__/landing-ui.test.ts`

**Interfaces:**
- Consumes: `buildPropertyResultsHref()`, `switchSearchDepartment()`, `PropertySearchBar`, and existing landing hero actions.
- Produces: one homepage Buy/Rent state and shared submit behavior across homepage, sales, and lettings search panels.

- [ ] **Step 1: Write failing navigation and hero-preservation tests**

Add pure tests for a small exported `buildHomeSearchSubmission(department, filters)` helper:

```ts
test("submits homepage buying and renting searches to the correct result page", () => {
  assert.equal(
    buildHomeSearchSubmission("sales", { location: "Cuffley", sort: "default", propertyTypes: [], tenures: [], features: [] }),
    "/sales/properties?location=Cuffley",
  );
  assert.equal(
    buildHomeSearchSubmission("lettings", { location: "EN6", sort: "default", propertyTypes: [], tenures: [], features: [] }),
    "/lettings/properties?location=EN6",
  );
});
```

Keep the existing landing UI assertion that Sales points to `/sales/properties` and Lettings to `/lettings/properties`.

- [ ] **Step 2: Run the tests and verify failure**

Run:

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-search-home.test.ts \
  lib/__tests__/landing-ui.test.ts
```

Expected: the new home-search test FAILS; the direct hero-action regression test remains green.

- [ ] **Step 3: Add the compact Buy/Rent switch and remove duplicate builders**

In `PropertySearch.tsx`, keep one full local `PropertySearchQuery` initialized for sales. Render two accessible buttons labelled `Buy` and `Rent` with `aria-pressed`. On change, call `switchSearchDepartment()` on that query and update the price choices through the query's `department`. Pass the query to `PropertySearchBar` as its structural `PropertySearchFilters` view. Search calls:

```ts
router.push(buildHomeSearchSubmission(department, filters));
```

Do not navigate merely because the visitor types a location; navigate on explicit Search submission. Retain the existing premium section styling and Sales/Lettings hero buttons elsewhere on the landing page.

Replace the hand-written URL builders in `LettingsPropertySearch.tsx` and `SalesPageClient.tsx` with `buildPropertyResultsHref()`. Pass fixed departments (`lettings`, `sales`) and explicit `onSearch` callbacks into `PropertySearchBar`.

- [ ] **Step 4: Run home tests and TypeScript**

Run:

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-search-home.test.ts \
  lib/__tests__/landing-ui.test.ts
npx --no-install tsc --noEmit
```

Expected: PASS. Buy and Rent preserve compatible filters and use department-appropriate prices.

- [ ] **Step 5: Commit homepage alignment**

```bash
git add app/sections/PropertySearch.tsx app/sections/LettingsPropertySearch.tsx \
  app/sales/SalesPageClient.tsx lib/__tests__/property-search-home.test.ts \
  lib/__tests__/landing-ui.test.ts
git commit -m "feat: align homepage search with property results"
```

---

### Task 10: Real-Property Chatbot with Strict Facts

**Files:**
- Create: `lib/property-chat.ts`
- Create: `lib/__tests__/property-chat.test.ts`
- Modify: `lib/ai/chat.ts`
- Modify: `app/api/chat/route.ts`
- Modify: `components/ai/PropertyChatbot.tsx`

**Interfaces:**
- Consumes: `searchProperties(query)` and `PropertySearchQuery` from shared search.
- Produces: `ChatSearchContext`, `PropertyChatRequest`, `PropertyChatResponse`, `parsePropertyChatPatch()`, and `createPropertyChatHandler(search)`.

- [ ] **Step 1: Write failing chatbot behavior tests**

```ts
test("asks buying or renting before searching when department is unclear", async () => {
  let searches = 0;
  const handle = createPropertyChatHandler(async () => {
    searches += 1;
    return searchResult([]);
  });
  const result = await handle({ message: "Find me a three-bed in Cuffley", history: [] });
  assert.equal(result.response, "Are you looking to buy or rent?");
  assert.equal(result.action, "clarify_department");
  assert.equal(searches, 0);
});

test("searches the shared service and returns at most three real cards", async () => {
  const seen: PropertySearchQuery[] = [];
  const handle = createPropertyChatHandler(async (query) => {
    seen.push(query);
    return searchResult([
      card("EA-1"), card("EA-2"), card("EA-3"), card("EA-4"),
    ]);
  });
  const result = await handle({
    message: "I want to buy a three-bed in Cuffley with parking",
    history: [],
  });
  assert.equal(seen[0].department, "sales");
  assert.equal(seen[0].minBedrooms, 3);
  assert.deepEqual(seen[0].features, ["parking"]);
  assert.equal(seen[0].pageSize, 3);
  assert.equal(result.properties?.length, 3);
  assert.equal(result.properties?.[0].id, "EA-1");
});

test("keeps structured context for follow-up refinements", async () => {
  const seen: PropertySearchQuery[] = [];
  const handle = createPropertyChatHandler(async (query) => {
    seen.push(query);
    return searchResult([]);
  });
  await handle({
    message: "with a garage",
    history: [],
    context: { query: validSalesQuery({ location: "Cuffley", minBedrooms: 3 }) },
  });
  assert.equal(seen[0].location, "Cuffley");
  assert.equal(seen[0].minBedrooms, 3);
  assert.deepEqual(seen[0].features, ["garage"]);
});

test("never substitutes mock data or claims an unspecified fact", async () => {
  const handle = createPropertyChatHandler(async () => searchResult([]));
  const result = await handle({
    message: "Show me homes to rent in Cuffley",
    history: [],
  });
  assert.match(result.response, /couldn't find/i);
  assert.equal(result.properties, undefined);
  assert.doesNotMatch(JSON.stringify(result), /Stunning 4-Bedroom Family Home/);
});
```

Use these complete local fixtures:

```ts
function validSalesQuery(
  overrides: Partial<PropertySearchQuery> = {},
): PropertySearchQuery {
  return { ...createDefaultPropertySearchQuery("sales"), ...overrides };
}

function card(id: string): PropertyCardData {
  return {
    id,
    title: `Property ${id}`,
    address: "Cuffley, Hertfordshire",
    price: "£750,000",
    priceNum: 750000,
    tags: [],
    stats: { beds: 3, baths: 2 },
    images: [`https://images.example.test/${id}.jpg`],
    summary: "A CRM-supplied description.",
    propertyType: "house",
    department: "sales",
    status: "for_sale",
  };
}

function searchResult(properties: PropertyCardData[]): PropertySearchResult {
  return {
    query: validSalesQuery({ pageSize: 3 }),
    properties,
    total: properties.length,
    page: 1,
    pageSize: 3,
    totalPages: properties.length === 0 ? 0 : Math.ceil(properties.length / 3),
    lastSyncedAt: "2026-08-27T09:00:00.000Z",
  };
}
```

- [ ] **Step 2: Run the chatbot test and verify failure**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/property-chat.test.ts
```

Expected: FAIL because the strict property-chat handler does not exist.

- [ ] **Step 3: Implement deterministic intent, context, and shared search**

Define:

```ts
export interface ChatSearchContext {
  query: PropertySearchQuery;
}

export interface PropertyChatRequest {
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  context?: ChatSearchContext;
}

export interface PropertyChatResponse {
  response: string;
  action: "clarify_department" | "search" | "no_results" | "contact_team";
  properties?: PropertyCardData[];
  context?: ChatSearchContext;
}
```

Detect sales from `buy`, `buying`, `purchase`, `for sale`; detect lettings from `rent`, `renting`, `rental`, `to let`, `pcm`. If no department exists in the message or context, return the exact clarification response without searching. Parse locations after `in` or `near`, minimum bedrooms/bathrooms, max price phrases, supported type words, and supported feature words. Merge only explicitly changed fields into prior context; set “cheaper” to `price_asc` rather than inventing a budget. Search with `page=1,pageSize=3`.

Response rules:

- matches: `I found {total} matching {property/properties}. Here are the first results.` and at most three canonical cards;
- zero matches: `I couldn't find an exact match. Try widening the location or removing one filter.`;
- shared service failure: `Live listings are temporarily unavailable. Please try again shortly or call Banc on 01707 877781.`;
- viewing, valuation, or unsupported transaction: direct the visitor to the Banc team; do not claim it was booked or submitted;
- a missing listing fact: `The listing doesn't specify that. The Banc team can confirm it for you.`

Replace the chat route with JSON validation plus `createPropertyChatHandler(searchProperties)`. Remove `mockProperties`, fake fees, fake availability, simulated bookings, fake valuations, and the old Chat Completions fallback. `components/ai/SmartDescription.tsx` still imports `generateSmartDescription`, so retain that one export in `lib/ai/chat.ts`; remove its obsolete chatbot prompt, search parser, and function schemas. The supported chatbot parser lives only in `property-chat.ts`.

In `PropertyChatbot.tsx`, keep `ChatSearchContext` in component state, send it with each request, and store the returned context. Render canonical card price strings, bedrooms, address, first image, and `buildPropertyHref(card.department, card.id)`. Update welcome and quick replies to property search and human-contact actions only.

- [ ] **Step 4: Run chatbot, search, and TypeScript tests**

Run:

```bash
node --experimental-strip-types --test \
  lib/__tests__/property-chat.test.ts \
  lib/__tests__/property-search-service.test.ts \
  lib/__tests__/property-search-query.test.ts
npx --no-install tsc --noEmit
```

Expected: PASS. `rg -n "mockProperties|Stunning 4-Bedroom Family Home|gpt-3.5-turbo" app/api/chat lib components/ai` returns no matches.

- [ ] **Step 5: Commit the real-property chatbot**

```bash
git add lib/property-chat.ts lib/__tests__/property-chat.test.ts \
  lib/ai/chat.ts app/api/chat/route.ts components/ai/PropertyChatbot.tsx
git commit -m "feat: connect Banc chatbot to live properties"
```

---

### Task 11: Full Verification, Preview Readiness, and Handoff

**Files:**
- Modify: `CRM-INTEGRATION-STATUS.md` only if verification changes the documented state.
- Create: no production code.

**Interfaces:**
- Consumes: every prior task.
- Produces: evidence that the branch is safe to preview and a list of external activation prerequisites.

- [ ] **Step 1: Run the complete automated test suite**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/*.test.ts
```

Expected: every test PASS, zero failures, zero cancelled tests.

- [ ] **Step 2: Run static and production build checks**

Run:

```bash
npx --no-install tsc --noEmit
npm run lint
npm run build
```

Expected: all commands exit `0`. If the repository has pre-existing lint warnings, record them separately; do not claim a clean gate if lint exits non-zero.

- [ ] **Step 3: Verify the migration and sync in a safe environment**

After confirming the target is the non-production/preview Supabase project, apply `202608270001_crm_property_search.sql`. Run:

```bash
node --experimental-strip-types scripts/sync-expert-agent.ts --dry-run
node --experimental-strip-types scripts/sync-expert-agent.ts
```

Expected: dry-run writes nothing; real run reports non-zero records, creates a successful `crm_sync_runs` row, backfills neutral fields/search values, and leaves no active Expert Agent row without `source_id`. Do not execute the real run without the correct secrets and an identified target project.

- [ ] **Step 4: Run browser QA against a local or preview build**

Verify at `390x844`, `768x1024`, and `1440x900`:

- homepage Sales and Lettings hero actions still open their direct result pages;
- homepage Buy/Rent switch changes price bands and destination;
- URL refresh, browser back/forward, and copied URLs preserve filters;
- sales and lettings totals, filters, sorting, zero state, loading state, error state, and pagination are truthful;
- mobile drawer and desktop filters produce the same query;
- chatbot asks Buy/Rent when unclear, returns live cards, preserves follow-up filters, links to the correct department, and shows no fake property;
- no horizontal overflow, obscured controls, or duplicated floating actions appear.

Expected: all checks pass with screenshots captured for phone, tablet, and desktop review.

- [ ] **Step 5: Verify the scheduled workflow before enabling it**

Confirm all six GitHub Actions secrets exist, run `Sync Expert Agent properties` manually, and verify one successful `crm_sync_runs` row with correct counts and no secret values in logs. Only then leave the hourly cron enabled. If secrets are unavailable, keep the workflow committed but report activation as outstanding.

- [ ] **Step 6: Review the complete branch before preview deployment**

Use `superpowers:requesting-code-review`. Resolve all High and Medium findings, rerun the affected tests, then rerun the complete suite and build.

- [ ] **Step 7: Commit any verification-only documentation update**

If `CRM-INTEGRATION-STATUS.md` changed:

```bash
git add CRM-INTEGRATION-STATUS.md
git commit -m "docs: record CRM search verification"
```

If it did not change, do not create an empty commit.

- [ ] **Step 8: Prepare preview handoff**

Report:

- branch and final commit;
- automated test, TypeScript, lint, and build evidence;
- preview URL if separately authorized and deployed;
- migration target and sync-run evidence;
- whether the hourly workflow is active;
- any remaining external prerequisite;
- the next queued task: reproduce and fix the cinematic mobile-video resume freeze through its separate bounded workflow.
