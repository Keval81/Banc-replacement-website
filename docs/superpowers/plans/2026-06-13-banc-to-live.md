# Banc Property — Roadmap to Live — Implementation Plan

> **For agentic workers (Codex / Claude Code):** Implement task-by-task, in order, on branch `claude-build` (the canonical clone is `~/Documents/Banc-replacement-website`). Each task lists exact files, the change, and acceptance criteria. Commit after each. `- [ ]` checkboxes track progress. TDD the pure-logic helpers (CRM→listing mapping) where a runner exists; verify UI in the browser. Do NOT promote to production until Phase B5.

**Goal:** Take the Banc site from an advanced preview build to a **public, launchable estate-agency site** for a Cuffley agency — real listings driven by the new CRM, correct Cuffley-led positioning, working maps + lead capture, a configured chatbot, and (as a fast-follow) a functional vendor portal.

**Architecture:** Next.js 16 App Router. **User data** (auth, favourites, alerts, enquiries) lives in **Prisma/Postgres**; **property listings** are designed to come from the **CRM → a sync job → Supabase → the site**. Today the listings are hardcoded mock arrays; this plan wires them to the real source. The full marketing site, valuation tool, calculators, maps, chatbot UI, and portal UI already exist.

**Tech stack:** Next.js 16, React 19, TypeScript, Tailwind, Prisma (NextAuth), Supabase (listings), `@react-google-maps/api`, Resend (email).

**Env prerequisites (set in the Banc Vercel project):** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (maps render), `RESEND_API_KEY` (forms email), Supabase keys, and the **new CRM** API credentials (Task B2). `GOOGLE_PLACES_API_KEY` optional (homepage reviews).

---

## What already exists — do NOT rebuild
- ~60 routes: homepage, sales + lettings search (filters/sort/grid/list/**map** — map added 2026-06-13), property detail, valuation multi-step tool, 6 calculators, blog, accounts/auth (NextAuth + Google), content pages.
- **Maps:** `components/PropertyMap.tsx` on `app/sales/properties/page.tsx` + `app/lettings/properties/page.tsx` (markers, info windows). Needs the env key to render.
- **Integration scaffolding (degrades gracefully w/o creds):** `lib/expert-agent.ts` (CRM client), `lib/supabase.ts`, `lib/rightmove-blm.ts`, `lib/resend.ts`, `lib/email.ts`, `app/api/cron/sync-properties/route.ts`.
- **Chatbot:** `components/ai/PropertyChatbot.tsx` + `app/api/chat/route.ts` (+ `lib/ai/`).
- **Portal UI:** `components/portal/*` (PortalLayout, PortalNav, ActivityFeed, DocumentVault, MilestoneTracker, NotificationSystem) + `app/portal/{vendor,applicant,landlord}/page.tsx`.
- **Rich API routes:** contact, valuation, valuation/avm, favorites, alerts, google-reviews, newsletter, whatsapp, transport, epc, land-registry, schools, matches/recommended.

## Gaps this plan closes
1. Listings are hardcoded mock arrays (`lib/property-data.ts`, `app/sales/properties/page.tsx` `allProperties`, `app/lettings/properties/page.tsx` `allLettingsProperties`, `app/sections/FeaturedListings.tsx`) — Belgravia/Mayfair mansions, off-brand for Cuffley, with ~310 Unsplash images.
2. Positioning frames Cuffley **and** Mayfair as equals; Banc is Cuffley-based (Mayfair is only a mailing address).
3. No live data: no Property model; the CRM target has changed (new 12-month contract) so `lib/expert-agent.ts` must be re-pointed.
4. `app/portal/page.tsx` is a stub (`// TODO: auth check`) and the portals run on mock data.
5. `app/api/google-reviews/route.ts` returns **500** when its key is absent (should degrade).
6. Chatbot is wired but not configured/grounded in real listings.
7. Repo sprawl: a stale 2nd clone (`~/Projects/banc-website` @ codex branch) + the build isn't promoted to production.

---

## File structure (key created / modified)

| File | Responsibility |
|---|---|
| `app/portal/page.tsx` | **MODIFY** → real role-based redirect (or hide portal for launch) |
| `app/api/google-reviews/route.ts` | **MODIFY** → return 200 + empty when key absent |
| `lib/listings.ts` | **CREATE** → single source of truth: `getListings(filters)`, `getListingById(id)` reading Supabase (falls back to seed when empty) |
| `lib/crm/` (rename/replace `lib/expert-agent.ts`) | **MODIFY** → client for the NEW CRM; `syncListings()` → Supabase |
| `supabase` `listings` table | **CREATE** → migration for the property listings store |
| `app/sales/properties/page.tsx`, `app/lettings/properties/page.tsx`, `app/sections/FeaturedListings.tsx`, `app/sales/properties/[id]/page.tsx`, `lib/property-data.ts` | **MODIFY** → read from `lib/listings.ts` instead of mock arrays |
| `app/api/chat/route.ts`, `components/ai/PropertyChatbot.tsx` | **MODIFY** → configure provider + system prompt grounded in live listings |
| `components/portal/*`, `app/portal/{vendor,landlord}/page.tsx` | **MODIFY** → wire to real data behind auth (Phase B4) |
| Positioning: homepage, metadata, `app/offices/*`, `app/premier-homes/page.tsx` | **MODIFY** → Cuffley-led, de-emphasise Mayfair |

---

## Phase B0 — Unblock & consolidate · ~1 day

### Task B0.1: Set the maps key (SanSan / ops)
- [ ] Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in the Banc Vercel project (and local `.env.local`). **Acceptance:** the map toggle on `/sales/properties` renders markers in a deploy.

### Task B0.2: Consolidate to one canonical source
- [ ] Fold `claude-build` → `main` (fast-forward or merge), make `main` the deploy branch. Retire the stale clone `~/Projects/banc-website` and its `codex/mobile-audit-*` + `mobile-audit-*` branches. **Acceptance:** one repo, one branch, no divergence; `npm run build` clean.

### Task B0.3: Fix the two quick P0s
- [ ] **`app/api/google-reviews/route.ts`:** when `GOOGLE_PLACES_API_KEY` is missing, return `NextResponse.json({ place: null, reviews: [] })` (status 200) instead of 500. **Acceptance:** no 5xx in the network tab on the homepage without the key; the Hero falls back cleanly.
- [ ] **`app/portal/page.tsx`:** replace the hardcoded `redirect("/portal/vendor")` TODO with a real check — read the NextAuth session, route by role (vendor/applicant/landlord), redirect unauthenticated users to `/login`. *If portal work is deferred past launch (recommended), instead hide portal entry points from the public nav and leave a "coming soon" page.* **Acceptance:** signed-in users reach the right portal; signed-out users hit login (or portal is hidden for launch).
- [ ] Commit each fix.

---

## Phase B1 — Brand truth: Cuffley positioning + real photography · ~2–4 days · *content gated on Nitesh*

### Task B1.1: Cuffley-led positioning rework
- [ ] Rework copy + metadata so **Cuffley is the flagship** and Mayfair reads as a mailing address only (not a luxury market): homepage hero + intro, `<metadata>` titles/descriptions, `app/offices/*` (keep Cuffley primary; reframe/great-reduce Mayfair), `app/premier-homes/page.tsx` (decide: keep as a premium tier or fold in). Remove off-brand mansion framing. **Acceptance:** no page positions Banc as a Mayfair/Belgravia luxury agency; Cuffley/Hertfordshire leads throughout.

### Task B1.2: Real photography swap
- [ ] Replace the ~310 Unsplash URLs (property cards, featured listings, office/team pages) with Nitesh's real Banc photos once supplied; optimise via `next/image`; add a real `/public/placeholder-property.*` (the fallback is currently a missing file). **Acceptance:** no stock Unsplash imagery on key pages; images served optimised; no broken/placeholder 404s.

---

## Phase B2 — Real listings via the new CRM · ~3–5 days · *gated on CRM access* · **the "images → real properties" piece**

### Task B2.1: Listings store + single data accessor
- [ ] Add a Supabase `listings` table (fields the UI needs: id, ref, status [sale/let], title, address, postcode, price, priceQualifier, beds, baths, receptions, sqft, propertyType, description, features[], images[], lat, lng, addedDate, …). Create `lib/listings.ts` exposing `getListings(filters)` and `getListingById(id)` that read Supabase, with an in-repo seed fallback (a handful of REAL Cuffley listings from Nitesh) so the site is never empty pre-CRM. TDD the filter/sort mapping.
- [ ] **Acceptance:** `getListings`/`getListingById` return typed listings from Supabase (or seed); unit tests pass.

### Task B2.2: Re-point mock pages to the accessor
- [ ] Replace the hardcoded arrays in `app/sales/properties/page.tsx`, `app/lettings/properties/page.tsx`, `app/sections/FeaturedListings.tsx`, and the `[id]` detail page (`lib/property-data.ts` `sampleProperty`) with calls to `lib/listings.ts`. The detail page must look up **by id** (fixes the "every detail page shows one property" bug). The map (`PropertyMap`) takes real `lat/lng` from listings (retire the town-approx coords helper once real coords arrive).
- [ ] **Acceptance:** search, featured, and detail pages render real listings; each detail page shows the correct property; markers sit at real coordinates.

### Task B2.3: Wire the new CRM sync
- [ ] Get the new CRM's name + API/feed from Nitesh. Replace/re-point `lib/expert-agent.ts` (→ `lib/crm/<name>.ts`) to fetch listings from the new CRM and `syncListings()` → upsert into the Supabase `listings` table. Schedule via the existing `app/api/cron/sync-properties/route.ts` (Vercel Cron). **Confirm whether the CRM syndicates to Rightmove/Zoopla itself — if so, drop `lib/rightmove-blm.ts` from scope.**
- [ ] **Acceptance:** a sync run pulls live listings (with their images) into Supabase and they appear on the site; stale listings are deactivated.

---

## Phase B3 — Chatbot configuration · ~1 day

### Task B3.1: Configure + ground the chatbot
- [ ] Inspect `app/api/chat/route.ts` to confirm the LLM provider/SDK already used; set its API key in env. Write a Banc system prompt (tone: local Cuffley agency, helpful, books valuations/viewings) and **ground it in live data** by passing relevant `getListings()` results / FAQ context so it can answer "what 3-beds do you have in Cuffley?". Keep `components/ai/PropertyChatbot.tsx` UI; ensure graceful behaviour when the key is absent (hide or "chat unavailable"). *(Model choice is a decision — default to a current, cost-appropriate model; confirm the provider already wired before changing it.)*
- [ ] **Acceptance:** the chatbot answers Banc-specific questions grounded in real listings; no crash without the key.

---

## Phase B4 — Functional vendor portal · ~1–2 weeks · *can be post-launch (this is estimate add-on WP-02)*

### Task B4.1: Real data behind auth
- [ ] Define the portal data model (vendor's property, viewings, offers, documents, activity, performance) — in Supabase or Prisma per the existing pattern. Wire `components/portal/*` (ActivityFeed, DocumentVault, MilestoneTracker, NotificationSystem) to real queries for the signed-in vendor, replacing the `mockUser`/`mockPerformance`/`mockActivities`/`mockDocuments` in `app/portal/vendor/page.tsx` (and landlord/applicant). DocumentVault uploads → Supabase Storage.
- [ ] **Acceptance:** a signed-in vendor sees only their real property data; documents upload/download; no mock data remains in the portal.

> **Sequencing note:** the portal is the one genuinely unbuilt feature (it's a UI prototype today). Recommend launching B0–B3 + B5 first and delivering B4 as a fast-follow, so go-live isn't blocked on it.

---

## Phase B5 — Launch · ~1–2 days

### Task B5.1: Lead capture wired
- [ ] Ensure valuation/contact/enquiry forms (`app/api/contact`, `app/api/valuation`) send via Resend (`RESEND_API_KEY`) and route leads to the CRM/Nitesh's inbox. **Acceptance:** a test enquiry arrives by email + is captured.

### Task B5.2: SEO + go-live
- [ ] Sitemap, per-page metadata, property structured data (JSON-LD) for listings, analytics. Connect Banc's real domain, promote `main` to **production**, lift Vercel deployment protection. Final QA: mobile, cross-browser, forms, no console errors, `npm run build` clean, Lighthouse > 90.
- [ ] **Acceptance — Banc "live":** public on Banc's domain, real Cuffley listings, working maps + valuation/contact capture, correct positioning, mobile-clean. (Portal optional per B4 note.)

---

## Self-review notes
- Every roadmap milestone (unblock, positioning, photos, real listings/CRM, chatbot, portal, launch) maps to a phase above; his explicit asks (images→real properties = B2, vendor portal = B4, chatbot config = B3) are covered.
- External gates flagged: maps key (B0.1), Nitesh's photos (B1.2), CRM access (B2.3), domain (B5.2).
- Names consistent: `getListings`/`getListingById`/`syncListings`/`listings` table.

*Plan written 2026-06-13.*
