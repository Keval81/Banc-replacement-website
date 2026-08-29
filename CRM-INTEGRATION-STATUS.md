# CRM integration and sync operations

**Updated:** 2026-08-29

**Implementation state:** the failure-safe Expert Agent sync and its GitHub
Actions definition exist on this branch. The database migration, repository
secrets, workflow activation, and first write-enabled run remain external
release steps. None of them was performed while creating this contract.

## Local branch verification

Verified on 2026-08-27 against branch
`codex/expert-agent-search-chat-design`:

- The complete Node test suite passed: 219 tests, 0 failures, 0 cancelled.
- `npx --no-install tsc --noEmit` exited successfully.
- `npm run build` exited successfully and generated all 88 static pages.
- The full-repository `npm run lint` gate remains red with 116 errors and 213
  warnings in legacy code outside this branch's changed-file set. Linting the
  branch's current TypeScript changes produced 0 errors and 3 existing
  `no-img-element` warnings. The repository-wide lint debt must still be
  resolved or explicitly baselined before calling the release gate clean.

No `.env.local` was present, so the FTP dry run was not attempted. The
`.env.example` documents the Expert Agent FTP and Supabase variables required
for an operator-provided local setup. No migration, write-enabled sync, GitHub
workflow dispatch, browser QA against live CRM data, or deployment was
performed during local verification.

## Canonical data flow

```text
Expert Agent FTP XML
  -> Expert Agent parser and source adapter
  -> CRM-neutral canonical property rows
  -> service-role-only reconciliation RPC
  -> Supabase properties + crm_sync_runs
  -> shared property search service
  -> homepage, results pages, API, and chatbot
```

`scripts/sync-expert-agent.ts` downloads and parses the feed, geocodes UK
postcodes at centroid level, and maps each listing through the Expert Agent
adapter. The canonical identity is `(source_system, source_id)`. The legacy
`expert_agent_id` remains populated so existing property links continue to
work.

The migration is
`supabase/migrations/202608270001_crm_property_search.sql`. It creates the
canonical search fields, `crm_sync_runs`, the public search function, and the
private reconciliation function.

## Failure-safety contract

The sync protects the current public inventory at two boundaries:

- Every incoming row must have the correct source identity, a unique and
  trimmed source ID, a valid department, non-empty title and address, a
  positive finite price, and supported canonical search values.
- Before the database call, the client reads all active IDs with ordered,
  paginated queries. It rejects a feed that would deactivate more than 50% of
  that source's current active inventory.
- `reconcile_property_source_feed(...)` repeats the greater-than-50% guard
  inside a source-scoped transaction lock. This database check is
  authoritative if inventory changes after the client preflight.
- The RPC upserts incoming rows, marks only absent active rows from the same
  source inactive, records a successful `crm_sync_runs` row, and returns its
  database completion time in one transaction. It never deletes properties.
- Download, parse, validation, and preflight failures leave the last
  successful dataset unchanged. They are best-effort recorded as failed runs
  with a redacted error summary. An audit-write failure cannot replace the
  original sync error.
- After the RPC has been invoked, an ambiguous transport error is not recorded
  as a second speculative failure. Operators must inspect `crm_sync_runs` to
  determine whether the transaction committed.

The reconciliation RPC is revoked from `PUBLIC`, `anon`, and `authenticated`
and granted only to `service_role`. FTP credentials and the service-role key
must remain server-side and must never be pasted into logs, issues, fixtures,
or commits.

## Schedule and required GitHub secrets

`.github/workflows/sync-expert-agent.yml` supports a manual
`workflow_dispatch` and runs hourly at minute 17 UTC. Concurrency is serialized
so an existing sync is allowed to finish instead of being cancelled by the
next one.

Configure these six repository secrets before activating the workflow:

- `EXPERT_AGENT_FTP_URL`
- `EXPERT_AGENT_FTP_USER`
- `EXPERT_AGENT_FTP_PASS`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Only secret references belong in the workflow. Values belong in the approved
GitHub repository's encrypted Actions secrets.

## Local dry run (future external check)

After explicit approval to contact the Expert Agent FTP server, an operator
can load the local environment and run:

```bash
node --env-file=.env.local --experimental-strip-types scripts/sync-expert-agent.ts --dry-run
```

Dry-run mode contacts the FTP server and postcode service, parses and prints
the canonical rows, and then exits without creating a Supabase client,
reconciling properties, or writing `crm_sync_runs`. It was deliberately not
run as part of this documentation task.

## Activation and manual verification (future external steps)

These steps require explicit approval for the exact Supabase project and
GitHub repository:

1. Review and apply the migration to the approved Supabase project.
2. Add all six encrypted repository secrets without exposing their values.
3. Push the workflow, confirm Actions are permitted, and manually dispatch
   **Sync Expert Agent properties** once. Do not rely on the hourly schedule
   until this run succeeds.
4. Check the Actions log for a non-zero parsed record count, a completed
   upsert summary, no credential values, and no unexpected deactivation guard.
5. Inspect the database with the approved SQL console:

```sql
select source_system, started_at, finished_at, status,
       records_read, records_written, records_deactivated, error_summary
from public.crm_sync_runs
where source_system = 'expert_agent'
order by started_at desc
limit 5;

select is_active, count(*)
from public.properties
where source_system = 'expert_agent'
group by is_active
order by is_active desc;

select count(*) as invalid_active_rows
from public.properties
where source_system = 'expert_agent'
  and is_active = true
  and (
    source_id is null or btrim(source_id) = ''
    or last_synced_at is null
    or search_property_type is null
    or search_tenure is null
    or search_features is null
  );
```

The newest audit row must be `success`, its counts must be plausible for the
feed, `invalid_active_rows` must be zero, and existing property URLs must still
resolve. Only then leave the hourly schedule enabled. If any check fails, stop
activation and investigate; do not weaken the validation or removal guards to
force a run through.

## Expert Agent feed notes

- The current feed has used `properties2.xml`; `properties.xml` has previously
  been a stale twin. Confirm the live FTP listing during the approved dry run.
- Image URLs may be absolute Expert Agent CDN URLs. Bare filenames are retained
  as `zip://` markers until a storage-import step is explicitly designed.
- The feed does not provide house-level coordinates or reliable square
  footage. Postcode coordinates are centroids and must not be presented as an
  exact property location.
- EPC data may be supplied through its graph image filename rather than a
  dedicated rating field.

## Streets migration boundary

The website is intentionally not limited to Expert Agent parity. A future
`StreetsAdapter` can map Streets records into the same canonical property store
without changing ordinary search consumers. CRM actions are separate,
capability-checked extensions: Streets may later expose independently approved
features such as real-time updates, viewing availability and booking,
applicant creation, matching, offers, or sales progression.

Those capabilities must be enabled only when Streets documentation,
credentials, permissions, and truthful source data are available. The UI and
chatbot must test for a capability before offering it; no Streets-only action
is simulated against Expert Agent, and future Streets functionality is not
restricted to what the current FTP feed can do.

## Conversational assistant preview preparation

Local configuration documentation and verification were prepared on
2026-08-29 from base commit
`2b687dde69ba73881d62f97dfb2445893e3614fb`. The intended staging target from
the approved task brief is `gaomvwleaonccrmaicxb`, and the only migration in
scope is the tracked artifact
`supabase/migrations/202608280001_exact_bedroom_search.sql`. This worktree has
no `supabase/.temp/project-ref`, so no live project association was inferred.
The migration was inspected locally but was not applied to staging or
production.

The environment variable names required for a future preview are:

- `OPENAI_API_KEY`
- `OPENAI_CHAT_MODEL`

A ChatGPT subscription does not include OpenAI API usage. Preview and
production credentials must be independently scoped. Production enablement
requires explicit approval, an approved API spend budget, and rate-limit
controls. Secret values must never be committed, logged, or returned to a
client.

No Preview `OPENAI_API_KEY` is currently available, and no model identifier
has been selected or configured. Therefore, the conversational preview is not
deployed and must not be described as working. Production was not inspected or
changed during this local preparation.

The complete local preview gate was run on 2026-08-29:

- `node --experimental-strip-types --test lib/__tests__/*.test.ts` exited 0:
  297 tests passed, with 0 failures, 0 cancelled, and 0 skipped.
- `npx tsc --noEmit` exited 0.
- Scoped ESLint for the chat route, chatbot component, property conversation,
  and property search exited 0 with 0 errors and 6 warnings.
- `npm run build` exited 0, compiled successfully, and generated 88 static
  pages. Its existing deprecation, edge-runtime, and metadata warnings remain.
- `git diff --check` exited 0 with no output.

A read-only Vercel Preview listing returned these variable names only:
`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and
`GOOGLE_PLACES_API_KEY`. Neither required OpenAI variable is present in
Preview. Production was not queried.

Remote staging identity and migration history have not yet been verified. The
staging runbook must proceed in this order:

1. With read-only access, confirm that the remote project ref is exactly
   `gaomvwleaonccrmaicxb` and record its human-readable Supabase project and
   organisation names. A matching ref without matching project and
   organisation identity is insufficient.
2. Still read-only, inspect and record the remote migration history and the
   complete pending migration set. Stop if the target identity is ambiguous or
   the history is inconsistent with this repository.
3. Reverify the exact local artifact before requesting mutation approval:

   ```bash
   /usr/bin/shasum -a 256 supabase/migrations/202608280001_exact_bedroom_search.sql
   git log -1 --format='%H %s' -- supabase/migrations/202608280001_exact_bedroom_search.sql
   ```

   The checksum must be
   `4a447a3ab9943e567b6b05586a1ad9427f0a9bf461ecab2010c09036a2d2ca88`,
   and the git-log result must identify the reviewed migration commit.
4. Only after steps 1–3 are recorded, obtain separate mutation approval for a
   method guaranteed to apply only
   `supabase/migrations/202608280001_exact_bedroom_search.sql` inside a
   transaction. A generic migration push is forbidden if any other migration
   file is pending. Production is never an allowed target for this approval.
5. After the approved staging-only mutation, run and record the direct
   exact-bedroom and minimum-bedroom RPC checks before continuing.

Preview configuration and acceptance must then proceed separately. A valid
`OPENAI_API_KEY` must be entered through an approved secret channel and needs
approval to configure it in Preview only. Next, verify a current tool-capable
model identifier from authoritative provider documentation; only after the
exact identifier is recorded may an operator request approval to configure
that exact `OPENAI_CHAT_MODEL` identifier in Preview only. No identifier has
yet been verified or approved.

The deployed missing-key acceptance check must use a separate immutable
no-key Preview/environment created for that check. It must not remove, replace,
or change the configured conversational Preview key, and it must not affect
any other Preview deployment or environment. Creating and deploying that
isolated no-key target requires its own explicit environment/deployment
mutation approval. The normal Preview deployment, live API checks, and browser
checks also require their stated approvals. Production must remain unchanged
unless it receives separate approval.
