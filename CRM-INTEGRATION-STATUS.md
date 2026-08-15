# Expert Agent CRM Integration — status (2026-08-15)

Live end-to-end: FTP feed → parser → Supabase → site. Written as a handoff
for the next session (any agent).

## Working, deployed (branch `claude-build`)

- **Sync**: `scripts/sync-expert-agent.ts` (`--dry-run` supported). curl FTP →
  parse XML → geocode postcodes (postcodes.io bulk, free) → upsert Supabase on
  `expert_agent_id`. Creds in `.env.local` (FTP trio + Supabase trio) — NOT in
  git; also in Vercel env (public pair only).
- **Parser**: `lib/expert-agent-feed.ts`, spec v1.3 + two undocumented live
  realities: `<epc>` graph image (band letter derivable from
  `EPC_CCPPccpp` / `PEA_CCPP` filenames; first pair = current SAP score) and
  district=town duplication. Tests: `node --test lib/__tests__/*.test.ts`
  (27, all TDD).
- **Data**: Supabase `banc-property` (eu-west-2, ref aogtwibafvlvcchygool,
  $10/mo). 353 rows: 43 for_sale / 251 under_offer / 57 let_agreed / 2 to_let.
  353 geocoded (postcode centroid), 301 EPC images, 105 parsed bands.
- **Site**: `/api/properties` + `/api/properties/[id]` (anon key, RLS public
  read). Homepage Featured, sales + lettings grids, detail pages (gallery,
  features, rooms-when-present, floorplans, EPC band+graph, OSM postcode map,
  brochure/tour, real branch panel), similar properties. Search filters
  verified against live rows (feature flags derived from bullet wording in
  `lib/property-view.ts`).

## Known gotchas

- Feed list endpoint on FTP: `properties2.xml` is current; `properties.xml`
  stale twin. Images are absolute `med05.expertagent.co.uk` URLs (hotlinked;
  next/image hosts allowlisted).
- Feed has NO house-level coords, NO sqft; EPC only via the image filename.
- Deploys: every Vercel deploy invalidates `_vercel_share` tokens; NEXT_PUBLIC
  env inlines at build time (rebuild after env changes); occasional transient
  Google Fonts build failure — empty-commit retry fixes.
- The old `lib/expert-agent.ts` is a DEPRECATED wrong-guess JSON stub kept only
  so `/api/cron/sync-properties` no-ops. Retire both together.

## Open items (in rough priority)

1. **Sync schedule** — decide launchd (mac mini) vs GitHub Action; script is
   ready, needs env + `node scripts/sync-expert-agent.ts`.
2. Lettings detail URL semantics — lettings cards link via
   `/sales/properties/[id]` (works, department-aware; cosmetic).
3. `aker-restyle` branch — hero-film/logo landing design (SanSan direction B);
   gets all CRM work via merge from claude-build when design is chosen.
4. Optional honest add-ons: transport links from postcode coords (TfL/rail
   APIs); mirror feed images to Supabase storage instead of hotlinking.
5. Promote decision: claude-build → production + DNS (standing P0 path).
