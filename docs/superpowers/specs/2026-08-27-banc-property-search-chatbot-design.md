# Banc Property Search and CRM Chatbot Design

**Date:** 2026-08-27
**Status:** Approved design; awaiting written-spec review

## Goal

Give visitors one accurate property-search experience across the Banc homepage, sales and lettings results pages, and chatbot. All three surfaces must search the real Expert Agent feed through the same server-side service. The design must also allow Banc to replace Expert Agent with Streets CRM later without rebuilding the website around a second CRM.

## Success Criteria

- The homepage lets the visitor choose Buy or Rent and sends every selected filter to the correct results page.
- The existing Sales and Lettings hero buttons remain as direct shortcuts.
- Homepage, results pages, and chatbot return the same properties for the same filters.
- Results use real server-side filtering, totals, sorting, and pagination rather than downloading every property and filtering in the browser.
- The chatbot asks whether the visitor is buying or renting when that intent is unclear.
- Every property fact shown or stated by the chatbot comes from the canonical property record. Missing facts are described as unspecified, never guessed.
- Expert Agent data is refreshed hourly. A failed refresh leaves the last successful dataset live.
- CRM-specific code is isolated behind adapters so Streets can be introduced incrementally.
- Unsupported controls such as non-functional radius, invented popularity, and unverified price reductions are removed or hidden.

## Current State

The site already has a real Expert Agent FTP XML parser and a sync script that imports properties into Supabase. The property API and detail pages read those rows, but the user-facing search experiences are disconnected:

- The homepage search always routes to sales.
- Sales and lettings pages download broad result sets and duplicate filtering and sorting in the browser.
- URL parsing and serialization are duplicated.
- Some advanced controls imply capabilities the current data does not support.
- The chatbot searches four hard-coded demonstration properties rather than the Supabase dataset.
- The old JSON Expert Agent API integration and cron endpoint are deprecated guesses and do not perform the real FTP sync.
- No dependable hourly schedule currently runs the real sync script.

## Chosen Architecture

Use Supabase as the canonical property store and introduce one server-only property search service:

```text
Expert Agent FTP
      |
      v
ExpertAgentAdapter -- hourly import --> Canonical Supabase properties
                                               |
                                               v
                                  PropertySearchService
                                    /        |        \
                                   /         |         \
                          Homepage search  Results API  Chatbot tool

Later: StreetsAdapter -------> same canonical store
       Streets capabilities -> optional chatbot/action tools
```

This keeps the website independent of one CRM while avoiding a premature generic framework. Expert Agent remains the only active source in this release. Streets support begins only when its documentation, credentials, and permitted capabilities are available.

## Component Boundaries

### CRM source adapters

A `PropertySourceAdapter` converts a CRM record into the canonical property shape. The Expert Agent adapter will wrap the existing XML parser. A future Streets adapter will implement the same mapping without changing the search UI, API, or ordinary chatbot property search.

The adapter is responsible for:

- source identifiers and timestamps;
- department and public marketing status;
- address and location fields;
- price, bedrooms, bathrooms, property type, and tenure;
- description, raw feature text, images, and floorplans;
- normalized searchable features derived only from explicit source data.

### Canonical property store

The properties table will gain neutral source metadata:

- `source_system`: initially `expert_agent`, later `streets`;
- `source_id`: the identifier assigned by that source;
- `source_updated_at`: the source timestamp when provided;
- `last_synced_at`: the most recent successful observation of the record;
- `is_active`: whether the record was present in the latest complete source feed;
- `search_property_type`: the normalized public type used by filters;
- `search_tenure`: the normalized tenure used by filters;
- `search_features`: a normalized text array for verified filters such as `garden`, `parking`, `garage`, `balcony`, `chain_free`, and `new_home`.

`(source_system, source_id)` is the durable unique key. The existing `expert_agent_id` remains temporarily for current property URLs and backwards compatibility. It can be retired only in a separately approved URL migration.

Raw features and descriptions remain available for display. Normalized `search_features` exist solely to make truthful server filtering and pagination possible. An indexed array permits new Streets-provided features to be added without a schema column for every capability.

### Shared query contract

One validated `PropertySearchQuery` is shared by URL helpers, the property API, and chatbot tooling:

- `department`: `sales` or `lettings`, required;
- `location`: free-text town, area, street, or postcode search;
- `minPrice` and `maxPrice`;
- `minBedrooms` and `minBathrooms`;
- `propertyTypes`: zero or more canonical types;
- `tenures`: zero or more canonical tenure values;
- `features`: zero or more verified normalized features;
- `statuses`: optional public marketing statuses appropriate to the department;
- `sort`: `default`, `price_asc`, or `price_desc`;
- `page` and `pageSize`, with safe server limits.

When no status is supplied, sales includes `for_sale` and `under_offer`; lettings includes `to_let` and `let_agreed`. The default order is source update time descending, then source ID ascending as a stable tie-breaker. If a source update time is absent, the canonical record creation time is the fallback; routine hourly syncs do not rewrite it.

Location matching is case-insensitive across the public address, street, town, county, and postcode fields. Postcode comparison ignores spaces. The service searches these structured fields; it does not infer an unverified geographic radius.

The first release intentionally omits radius search. It must not return until the service can calculate distance from trustworthy coordinates. “Popular” and “Reduced” sorting are also omitted because the current feed does not establish genuine popularity or price history.

`PropertySearchResult` returns the validated query, property cards, total matching count, current page, page size, total pages, and the canonical timestamp of the last successful CRM sync.

### Property search service

`searchProperties(query)` is a server-only module that validates the query and applies all filters, public-status rules, stable ordering, totals, and pagination in Supabase. It returns presentation-safe property cards and does not expose CRM credentials or internal rows.

The existing `/api/properties` route becomes a thin HTTP boundary around this service. The chatbot calls the service directly on the server rather than making an HTTP request back into its own application. The homepage and results pages use the same query serializer so URLs are shareable and refresh-safe.

### CRM capabilities

CRM actions beyond property search use explicit capabilities rather than assumptions about every provider. The core capability is property search and detail retrieval. Streets may later add independently approved tools such as real-time updates, viewing availability, viewing booking, applicant creation, matching, offers, or sales progression.

The UI and chatbot must check whether a capability exists before offering it. No Streets-only feature is simulated against Expert Agent, and no future Streets feature is constrained to the functionality of the current feed.

## User Experience

### Homepage

- Retain the existing Sales and Lettings hero buttons as prominent direct routes.
- Add a compact Buy/Rent switch inside the search panel.
- Switching mode updates appropriate price choices and destination copy.
- Search submits to `/sales/properties` or `/lettings/properties` with the selected filters in the URL.
- Show only filters supported by the shared service.

### Results pages

- The URL is the source of truth for the current search.
- Desktop inline filters and the mobile filter drawer use the same query model.
- Filter changes are debounced, provide a visible loading state, and update the real result count.
- The server returns one page at a time with genuine pagination.
- Changing between Sales and Lettings preserves only compatible filters.
- Publicly marketable statuses may remain visible with clear labels such as Under Offer or Let Agreed; withdrawn or private records never appear.
- Empty results explain that nothing matched and suggest removing a restrictive filter or widening the location.

### Chatbot

- If the conversation does not establish buying or renting, ask that question before searching.
- Translate the visitor's request into the same validated search query used by the pages.
- Return at most three real property cards per response, with working detail links.
- Carry explicit filters into follow-up requests such as “cheaper,” “three bedrooms,” or “with parking.”
- State only values present in the canonical record.
- If a requested detail is missing, say the listing does not specify it and offer contact with the Banc team.
- If there are no matches, say so and suggest a specific filter to relax. Never substitute demonstration data.

The first release keeps the chatbot focused on finding properties. Booking, lead submission, valuation flows, and other transactional tools are separate capabilities for later approval.

## Data Flow

### Hourly import

1. A scheduled GitHub Actions workflow runs the existing Expert Agent sync script hourly.
2. Credentials are read from repository secrets, never committed or sent to the browser.
3. The Expert Agent adapter parses and validates the FTP XML feed.
4. Valid records are mapped into canonical properties and upserted by `(source_system, source_id)`.
5. Search features are derived only from explicit feed wording.
6. After a complete feed has parsed successfully, previously active Expert Agent records absent from that feed are marked inactive rather than deleted. An empty or structurally invalid feed fails before this reconciliation step.
7. The job records its outcome in a `crm_sync_runs` table: source, start and finish times, success or failure, records read, records written, records deactivated, and a safe error summary.
8. A successful run updates the last-success timestamp exposed by search results.

The import does not delete or hide the existing live dataset merely because the feed cannot be downloaded or parsed. Deactivation occurs only after a complete, non-empty feed passes validation, and the retained rows make the change auditable. Feed failure is never interpreted as “zero properties.”

GitHub Actions is preferred because the sync is an external scheduled job rather than a visitor request and can securely run the existing script. If the required repository secrets are unavailable during implementation, the workflow and setup documentation will be completed, but activation remains an explicit deployment prerequisite.

### Visitor search

1. The homepage, results UI, or chatbot creates a shared query.
2. The server validates and normalizes it.
3. The search service queries the canonical Supabase store.
4. The service returns safe cards, totals, pagination, and data freshness.
5. The calling surface renders the same underlying results in its appropriate format.

## Error Handling and Safety

- Invalid URL values are ignored or replaced with documented safe defaults; they never become raw database expressions.
- Database or API failure produces a human-readable temporary-error state while preserving the visitor's selected filters.
- The chatbot reports that live listings are temporarily unavailable; it never falls back to fake properties.
- An import failure records the error and leaves the previous successful records available.
- Import logs and API responses exclude FTP and Supabase credentials.
- Server-only modules enforce that service credentials cannot enter client bundles.
- Page size and chatbot result count are capped to prevent expensive or abusive queries.
- Location search is escaped and parameterized through the Supabase client.

## Testing Strategy

Implementation follows test-driven development.

### Unit tests

- parse, validate, normalize, serialize, and deserialize every search field;
- map Expert Agent records to the canonical model;
- derive normalized features only from supported source wording;
- preserve compatible filters when changing department;
- ask Buy/Rent when chat intent is absent;
- refine an existing chatbot query without dropping prior explicit filters;
- refuse to invent missing facts;
- handle zero results and service errors without demonstration data.

### Integration tests

- verify the property API and chatbot call the same search service and return matching records;
- verify server filtering, totals, stable ordering, and page boundaries against fixtures;
- verify failed imports retain the last successful dataset;
- verify only a complete, valid feed can mark absent source records inactive;
- verify the composite source key supports Expert Agent now and a Streets fixture later;
- verify credentials and internal fields are absent from public responses.

### UI and release checks

- test homepage Buy/Rent submission and Sales/Lettings shortcuts;
- test refresh, back/forward navigation, shareable URLs, and mobile filter drawer parity;
- test chatbot cards and property links with real-shaped fixtures;
- run focused tests, TypeScript checks, production build, and browser QA at representative mobile, tablet, and desktop widths;
- verify the scheduled job in a non-production run before enabling the hourly schedule.

## Rollout

1. Add the canonical metadata, normalized feature field, indexes, and sync-run records through a reversible Supabase migration.
2. Backfill existing Expert Agent rows without changing public property URLs.
3. Introduce and test the shared query contract and server search service.
4. Move the property API and results pages onto the service.
5. Align the homepage Buy/Rent search and existing direct shortcuts.
6. Replace chatbot demonstration data with the shared search tool and strict factual responses.
7. Add, test, and activate the hourly Expert Agent workflow.
8. Deploy a preview, complete mobile and desktop QA, then seek separate production approval.

Each stage must keep the existing site usable. The demonstration chatbot data must be removed as part of the chatbot cutover, not retained as a fallback.

## Out of Scope

- Implementing Streets before its API documentation and credentials are available
- Streets-only bookings, lead creation, applicant matching, offers, or progression tools
- Radius search or a new geocoding system
- Saved searches, alerts, accounts, or favourites
- General website content parity work currently delegated to Claude
- Broader visual redesign unrelated to the property-search flow
- Production deployment without separate approval

## Sequenced Follow-up: Cinematic Mobile Video Recovery

After this integration is planned and completed, investigate the landing-page cinematic video freezing when a mobile browser is left inactive and later resumed. Treat it as a separate bounded bugfix: reproduce the page lifecycle behaviour, add recovery for visibility/page-show/playback state changes, respect reduced-motion and autoplay rules, and verify on mobile Safari-style suspension as well as Chromium. It is intentionally not mixed into the CRM implementation so each change remains testable and shippable.
