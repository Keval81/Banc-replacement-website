# Banc Property — Live-Site Content Parity Audit

**Date:** 2026-08-27
**Baseline:** branch `content-parity-2026-08-27` from `origin/codex/mobile-action-rail` @ `57ba8d5`
**Live site (source of truth for current public info):** https://www.bancproperty.com
**Replacement preview at time of audit:** https://banc-website-h1a7nynls-digital-inroads.vercel.app (Vercel SSO-protected)

**Method:** live pages fetched 2026-08-27 (Cloudflare blocks curl/headless Chrome; fetched via
Claude WebFetch, which passes). Six parallel audit passes: contact/offices/legal, sales/lettings/fees,
team/about/company, premier/land/partner/blog, area guides, homepage/nav. Live lettings fee PDFs,
CMP certificate and complaints-procedure PDF read in full. Companies House and gov.uk/gov.wales/revenue.scot
checked live for legal facts.

**Scope constraints honoured:** design/structure unchanged; no "First day / Moving day" section restored;
landing-page hero untouched; property feed untouched; no invented content added.

---

## Independently verified reference facts (evidence for fixes below)

| Fact | Value | Source |
|---|---|---|
| Legal entity | BANC PROPERTY GROUP LIMITED, company no. **10063586**, active, incorporated **15 Mar 2016** | Companies House search, 2026-08-27 |
| CMP membership | Client Money Protect, membership **CMP005507**, issued 22/07/2025, **expired 21/07/2026** | Live CMP certificate PDF (cdn.webdadi.net/media/d118481a-…) |
| Redress scheme | The Property Ombudsman (TPO): 3 working days ack / 15 working days outcome / 15-day senior review / 8 weeks → TPO / 12-month window; admin@tpos.co.uk, 01722 333 306 | Live complaints-procedure PDF — note: it is the **TPO template with "[COMPANY NAME AND/OR LOGO]" still unfilled** |
| SDLT (England/NI), current | 0% ≤£125k; 2% £125k–250k; 5% £250k–925k; 10% £925k–1.5m; 12% >£1.5m. FTB: 0% ≤£300k, 5% £300–500k, no relief >£500k. Additional-property surcharge **5%** | gov.uk, fetched 2026-08-27 |
| LTT (Wales), current | 0% ≤£225k; 6% £225–400k; 7.5% £400–750k; 10% £750k–1.5m; 12% above. Higher rates banded 5%–17% (from 11 Dec 2024) | gov.wales, fetched 2026-08-27 |
| LBTT (Scotland), current | 0% ≤£145k; 2% £145–250k; 5% £250–325k; 10% £325–750k; 12% above. FTB nil band £175k. **ADS 8%** (from 5 Dec 2024) | revenue.scot, fetched 2026-08-27 |
| Live lettings landlord fees | Tenant Find **8% inc VAT** / Rent Collection **10% inc VAT** / Fully Managed **13% inc VAT**; setup one week's rent inc VAT; amendment £50; renewal £180; checkout £0; inventory from £100 inc VAT | Live landlord fee PDF (linked from /lettings/fees) |

---

## Parity table

Status: Complete / Missing / Outdated / Conflicting / Needs confirmation.
Fixed: **Yes** = corrected this session; **Flagged** = needs client input, deliberately not changed.

### Contact, offices, footer, legal

| Page/section | Live URL | Replacement URL | Status | Difference | Recommended action | Source/evidence | Fixed |
|---|---|---|---|---|---|---|---|
| Contact — Cuffley details | /contact | /contact | Complete | Address, 01707 877781, info@bancproperty.com all match | None | Live /contact | — |
| Contact — Mayfair block | /contact | /contact | Missing | Live lists both offices; ours is Cuffley-only | Add Mayfair block (121 Park Lane, W1K 7AG, 0203 368 8972, info@) | Live /contact + /offices/estate-agents/mayfair | **Yes** |
| Mayfair — address | /offices/estate-agents/mayfair | /offices/mayfair | Outdated | Ours: "Mayfair, London W1" only | Use full live address 121 Park Lane, Mayfair, W1K 7AG; fix map centre | Live office page | **Yes** |
| Mayfair — phone | same | /offices/mayfair | Conflicting→resolved | Live 0203 368 8972 vs ours 01707 877781 (Cuffley number reused, no source) | Adopt live number; client to re-confirm | Live office page | **Yes** |
| Mayfair — email | same | /offices/mayfair | Conflicting→resolved | Live info@ vs ours premier@bancproperty.com (no evidence premier@ exists) | Adopt info@; if client wants premier@, restore after confirmation | Live office page | **Yes** |
| Saturday opening hours | /contact, both office pages | /contact, /offices/* | Conflicting→resolved | Live "Monday to Saturday: 9am to 6pm" everywhere; ours had Sat 9–4 (Cuffley) and "by appointment" (Mayfair) — no source for either | Adopt live hours site-wide; client to confirm | Live pages ×3 | **Yes** |
| Org structured data (JSON-LD) | — | site-wide | Conflicting (critical) | Ours emitted **fabricated** "114 Mayfair, London W1J 5JT" + placeholder "+44 20 7123 4567" to search engines | Replace with real Cuffley head office + 01707 877781 | components/StructuredData.tsx vs live /contact | **Yes** |
| Footer — Land & Development link | — | footer | Broken | `/land-development` and `/new-homes` routes don't exist (page is /land-new-homes) | Point at /land-new-homes | components/Footer.tsx | **Yes** |
| Footer — Modern Slavery link | — | footer | Broken | Links to /modern-slavery which doesn't exist; not on live site either | Remove link | components/Footer.tsx | **Yes** |
| Footer — Facebook URL | / | footer + landing | Conflicting→resolved | Live facebook.com/**BANCpropertygroup**; ours facebook.com/bancproperty | Adopt live handle (Footer.tsx + lib/landing-ui.ts) | Live footer | **Yes** |
| Footer — YouTube | / | footer | Missing | Live links youtube.com/channel/UCuNRAhFmoSsDzyL6sFpOGtQ; ours has none | Add | Live footer | **Yes** |
| Footer — LinkedIn/Twitter | — | footer + JSON-LD | Needs confirmation | Not on live site; our two files even disagree on the LinkedIn slug | Removed from JSON-LD sameAs; footer LinkedIn kept pending confirmation | Footer.tsx vs StructuredData.tsx | **Yes** — JSON-LD sameAs now Facebook/Instagram/YouTube only; footer LinkedIn replaced with YouTube |
| Footer — CMP certificate | / | — | Missing | Live links the CMP PDF; ours doesn't reference it | Host PDF locally + link. **Cert expired 21/07/2026 — client must supply renewal** | Live footer, CMP PDF | Partial — link NOT added: cert expired 21/07/2026; awaiting renewal PDF from client |
| Footer — Complaints Procedure | / | /complaints | Complete (verified) | Our page's timeframes match the official TPO PDF exactly | Also tell client their live PDF still says "[COMPANY NAME AND/OR LOGO]" | Complaints PDF | — |
| Footer — accreditation logos | / | footer | Needs confirmation | Live evidences only Guild + CMP + TPO; our strip shows Rightmove, Zoopla, OnTheMarket, Propertymark file mislabelled "The Property Ombudsman" | Fix alt/file mismatch now; client to confirm portal memberships | Live site + fee PDFs | **Yes** (no change needed — `propertymark.jpg` actually contains the TPO logo; alt text was correct, only the filename is misleading) |
| Privacy policy | /privacy-policy | /privacy | Needs confirmation | Ours is a full UK-GDPR rewrite (better), but asserts ICO registration the live site never claims | Keep ours; client to confirm ICO registration + number; redirect /privacy-policy → /privacy added | Both pages | **Yes** |
| Terms | /terms | /terms | Needs confirmation | Ours is an expanded rewrite; governing law matches live | Client/legal sign-off | Both pages | Flagged |
| Complaints page company name | — | /complaints | Complete (verified) | "Banc Property Group Ltd" confirmed correct | None — verified via Companies House + CMP cert | CMP cert, Companies House | — |
| complaints@bancproperty.com | — | /complaints | Needs confirmation | Inbox existence unverifiable | Client to confirm mailbox exists | — | Flagged |
| Legacy URL redirects | various | — | Missing | Live paths /privacy-policy, /property-valuation, /area-guide/*, /land-and-new-homes, /become-a-partner, /offices/estate-agents/*, /community would 404 on our build | Add permanent redirects | Live sitemap | **Yes** |

### Sales, lettings, fees, calculators

| Page/section | Live URL | Replacement URL | Status | Difference | Recommended action | Source/evidence | Fixed |
|---|---|---|---|---|---|---|---|
| Sales hub cards | /sales | /sales | Missing (partial) | Live links Stamp Duty + Area Guides; ours lacks both cards; valuation CTA pointed at /contact | Add cards; point CTA at /valuation | Live /sales | **Yes** |
| Buyers guide | /sales/buyers-guide | /sales/buyers-guide | Complete | Near-verbatim incl. 10% deposit | Keep; mortgage-services promises ("AIP within 24h", "exclusive rates") are invented — flagged | Live page | Flagged (mortgage box) |
| Sellers guide | /sales/sellers-guide | /sales/sellers-guide | Complete | All 10 steps + tips carried over | "Full copyright transfer included" changed live meaning — reword | Live page | **Yes** |
| Stamp duty calculator | /sales/stamp-duty | /tools/stamp-duty | Outdated (both sites) | Live AND our build carry pre-Apr-2025 bands. Current law: see reference facts | Update calculations to current gov.uk/gov.wales/revenue.scot rates + tests | gov.uk fetched today | **Yes** |
| Lettings hub | /lettings | /lettings | Complete | Same six journeys | Invented stats ("500+ managed", "98%", "15+ yrs") — company is 10 yrs old | Companies House | **Yes** |
| **Lettings fees — landlord schedule** | /lettings/fees | /lettings/fees | Conflicting→resolved | Live PDF: 8%/10%/13% inc VAT + setup/renewal/amendment fees. Ours: £500+VAT/8%+VAT/12%+VAT with invented service bullets | Adopt the published live schedule verbatim (it is the client's current legal disclosure); client to re-confirm | Landlord fee PDF | **Yes** |
| Lettings fees — additional-services price table | — | /lettings/fees | Conflicting (invented) | Gas £90, EPC £90, EICR £180, alarms £75, PAT £100, checkout £150 — exist nowhere on live | Remove; client to supply real prices if wanted | Live PDFs | **Yes** |
| Lettings fees — CMP/deposit scheme | /lettings/fees | /lettings/fees | Conflicting | Ours claimed **Propertymark** membership + **MyDeposits**; live: Client Money Protect + "government-authorised scheme" (no brand) | Name Client Money Protect; drop Propertymark + MyDeposits naming | Fee PDFs, CMP cert | **Yes** |
| Tenant fee table (tenants guide) | /lettings/tenants-guide | /lettings/tenants-guide | Complete | Matches live guide page exactly (1wk holding, 5/6wk deposit, 3% BoE, £15/hr keys, £100 variation) | Add missing "on or after 1 June 2019" qualifier. NOTE: live tenant PDF contradicts live guide page (£50 amendment, £20 keys, £30/hr callout) — client must say which is authoritative | Live page + tenant PDF | **Yes** |
| Holding deposit wording | tenant PDF | /lettings/fees | Conflicting | Ours adds "offset against first month's rent"; PDF says "holds the property for 14 days" | Use live wording | Tenant PDF | **Yes** |
| Landlords guide | /lettings/landlords-guide | /lettings/landlords-guide | Complete | Near-verbatim incl. 30% referencing stat, insurance products | Add explicit TPO mention beside CMP badge | Live page | **Yes** |
| Yield calculator | /lettings/yield-calculator | /tools/yield-calculator | Complete | Ours richer (net/ROI) | Keep | Both | — |
| Valuation form | /property-valuation | /valuation | Complete | Ours richer | Add live's phone/email consent checkbox (GDPR); "within 24 hours" promise unverified — flagged | Live form | **Yes** |
| Instant valuation (AVM) | /instant-valuation | /tools/valuation | Conflicting (product) | Live is lead-capture only; ours publishes AI estimates under Banc's brand | Client decision — flagged, unchanged | Both | Flagged |
| Management cancellation terms | — | /lettings/fees | Needs confirmation | "6 months minimum / 2 months notice" invented | Removed with fee rebuild; client to supply real terms | — | **Yes** |

### Team, company, reviews

| Page/section | Live URL | Replacement URL | Status | Difference | Recommended action | Source/evidence | Fixed |
|---|---|---|---|---|---|---|---|
| Team roster + bios | /the-team | /the-team | Complete | All 4 members verbatim (Nitesh, Andrew, Vicki, Kay) incl. phones/emails | None | Live page | — |
| Team headshots | /the-team | /the-team | Conflicting (critical) | Ours shows **Unsplash strangers as named staff**; live has no headshots | Replace with initials-avatar treatment until client supplies real photos | Live page | **Yes** |
| Careers section + form | — | /the-team | Needs confirmation | Invented section; form has no submit handler (silently does nothing) | Client to confirm wanted; form must be wired or removed before launch | the-team page code | Flagged |
| Why Us content | /why-us | /why-us | Conflicting (critical) | Live's real proposition (10 named sections, foundations line, Mayfair 2000sqft office, 750+ Guild offices, TPO+Guild accreditation) replaced by invented "8 Reasons" grid, invented stats (£400M+, 97%, 15+yrs…), 3 invented testimonials with invented names, invented accreditations (Propertymark/Rightmove Premium/AllAgents) | Rebuild from live verbatim copy; real testimonials from /reviews; drop invented stats/accreditations | Live /why-us (full copy captured) | **Yes** |
| "45 years" vs "60 years" | /why-us | — | Needs confirmation | Live itself uses both ("combined 60 years" heading; "over 45 years combined" in Director led + homepage) | Use both verbatim in context as live does; client to pick one going forward | Live page | **Yes** |
| The Guild page | /the-guild | /the-guild | Needs confirmation | Live page is literally "Awaiting content" placeholder; ALL our copy is unapproved; invented quote was attributed to Banc | Remove fabricated attributed quote + unsourced stats now; page copy needs client sign-off; live nav links externally to guildproperty.co.uk | Live page | **Yes** |
| Guild office count | /why-us | /the-guild, /why-us | Conflicting→resolved | Live "over 750 membered offices"; ours "800+" (unsourced) | Adopt live figure | Live /why-us | **Yes** |
| Reviews — 12 testimonials | /reviews | /reviews | Complete | All 12 verbatim, right order, right attributions | Restore two truncated wordings (headline #10, subtitle) | Live page | **Yes** |
| Reviews — stats + Google CTA | — | /reviews | Conflicting (critical) | Invented "5.0 / 50+ / 100%", invented trust stats, Google CTA links to placeholder g.co/kgs/example | Remove invented numbers + placeholder-link section; client to supply real Google profile link/figures | Live page | **Yes** |
| Homepage testimonial attribution | /reviews | / (Hero, Testimonials, GoogleReviews) | Conflicting | "Iwona K., Potters Bar" — real reviewer, wrong location (live: Chestnut Close, Oakwood), quote altered | Fix attribution + use unaltered quote | Live /reviews | **Yes** |
| Track record page | nav → sold listings | /track-record | Conflicting (critical) | Live has NO track-record page (nav links to sold listings). Ours: fabricated stats, **four fabricated sales with addresses/prices**, fabricated testimonial "James Whittaker" | Strip all fabricated content; keep page as verified-content shell (live line + real testimonial + sold-listings CTA); client to supply real figures if a stats page is wanted | Live nav | **Yes** |
| Company pitch ("Welcome to Banc…") | / | — | Missing | "Born for a desire… over 45 years… two local owners" exists nowhere in our build | Add verbatim to /why-us intro (homepage layout intentionally unchanged) | Live homepage | **Yes** |

### Premier Homes, Land & New Homes, Partner, Community, Blog

| Page/section | Live URL | Replacement URL | Status | Difference | Recommended action | Source/evidence | Fixed |
|---|---|---|---|---|---|---|---|
| Premier Homes concept | nav (filtered £1M+ search) | /premier-homes | Needs confirmation | Live has no content page; our page's service claims are unsourced | Add the one sourced fact (Andrew Crump heads Premier Homes — from live bio/homepage); rest needs sign-off | Live homepage + team bio | **Yes** |
| Land & New Homes | /land-and-new-homes | /land-new-homes | Complete | Copy + contacts near-verbatim | Remove invented stats overlay (200+/98%/15+) | Live page | **Yes** |
| Become a Partner | /become-a-partner | /become-partner | Complete | Proposition verbatim | Remove 2 invented "We Handle" items (Technology & CRM, Brand & compliance) | Live page | **Yes** |
| Community page | /community | — | Missing | Substantive live page (schools, Northaw & Cuffley Tennis Club + Easter Party, football clubs, contacts) absent from our build | Build page from live copy; add to nav + footer | Live /community | **Yes** |
| Blog authors | /blog | /blog | Conflicting (critical) | Our 3 posts credited to **fictional staff** ("James Harrington", "Sarah Mitchell", "David Chen") with fake emails/LinkedIn | Re-attribute to Banc Property Group; delete fictional author profiles | Live team page | **Yes** |
| Blog content | /blog/five-things… | /blog | Conflicting | Live's only post is Lorem Ipsum (2022). Our 3 posts are richer but AI-written; Cuffley post asserts unverified school ratings/price bands | Keep system; client must review post facts before launch (esp. Cuffley guide post) | Live blog | Flagged |
| Blog in navigation | / nav | — | Missing | Our blog is orphaned (no nav/footer link); live nav has Blog/News | Add to About dropdown + footer | Live nav | **Yes** |
| Life Magazine / E-Zine | / | — | Missing | Live links Guild pageturner (works) + E-Zine (**dead host — DNS fails**) | Add Life Magazine link (footer); omit dead E-Zine, tell client | Live homepage; DNS check | **Yes** |

### Area guides

| Page/section | Live URL | Replacement URL | Status | Difference | Recommended action | Source/evidence | Fixed |
|---|---|---|---|---|---|---|---|
| Index page | /area-guide | /area-guides | Complete | Ours richer visually; same 9 areas | Fix "Hertfordshire and Essex" → live never says Essex (its patch is Herts + North London); fix Cheshunt "Riverside community" teaser (no river in live copy) | Live pages | **Yes** |
| **All 9 detail pages** | /area-guide/<slug> | /area-guides/<slug> | Missing (critical) | Every card on our index linked to a route that **does not exist — 9 public 404s** | Build `[slug]` route with the 9 live guides' verbatim copy (captured in full) | Live pages ×9 | **Yes** |
| Crews Hill / Little Heath / West Chesnut | sitemap only | — | Missing on both | Live sitemap lists them but the live pages themselves 404 | Ask client if copy exists; "West Chesnut" likely a typo of West Cheshunt | Live fetches ×2 | Flagged |
| Our sitemap.ts area entries | — | /sitemap.xml | Conflicting | Declares Mayfair/Hertfordshire/Broxbourne guides (don't exist, not Banc areas), omits 6 real ones | Replace with the real 9 slugs | app/sitemap.ts | **Yes** |

### Homepage & navigation

| Page/section | Live URL | Replacement URL | Status | Difference | Recommended action | Source/evidence | Fixed |
|---|---|---|---|---|---|---|---|
| Hero journeys | / | / | Complete | Same 3 journeys (valuation / sales / lettings) | None — layout intentionally simplified, per constraints | Both | — |
| Company pitch | / | — | Missing | See Team/company section — added to /why-us | — | **Yes** |
| Premier teaser named lead | / | /premier-homes | Outdated | Live names Andrew Crump as Premier Homes lead | Add to premier-homes page | Live homepage | **Yes** |
| Desktop nav gaps | / | header | Needs confirmation | Land & New Homes, Premier Homes, Reviews, Become a Partner live only in our mobile drawer; Community + Blog absent everywhere | Community + Blog added to About dropdown + footer; wider desktop-nav changes left as design decision | Live nav | **Yes** |
| "Award-winning" claim | — | metadata/footer | Needs confirmation | Nothing on live substantiates an award | Client to name the award or wording comes out | Live homepage | Flagged |
| WhatsApp number | — | landing rail | Needs confirmation | wa.me/447707877781 — suspiciously the landline digits with leading 0 dropped (07707 mobile vs 01707 landline) | Client to confirm the real WhatsApp number | lib/landing-ui.ts | Flagged |
| Newsletter form | — | footer | Needs confirmation | Fake submit — tells users "Thanks for subscribing!" while storing nothing | Wire to a real endpoint or remove before launch | Footer.tsx code | Flagged |
| Homepage review fallback stats | — | / | Needs confirmation | Hero fallback hard-codes "5.0 ★" + count 51 when the live Google API fails | Softened with reviews-stats fix; client to supply real profile | Hero.tsx | **Yes** |

---

### Additional defects found and fixed during implementation

| What | File | Fix |
|---|---|---|
| Site-wide fake "LIVE" review ticker — invented reviewers ("Sarah Mitchell", "James Thompson", "Emma Wilson", "Michael Brown", "Lisa Chen") with fabricated recency ("2 hours ago") rendered on every page | components/social/LiveReviewFeed.tsx (via app/layout.tsx) | Replaced with 5 real verbatim reviews from /reviews; "Live" indicator and fake timestamps removed; dead google.com/reviews link now points to /reviews |
| Two more invented Google reviewers ("Sarah L.", "Michael T.") in the homepage reviews fallback | app/sections/GoogleReviews.tsx | Removed |
| Footer "Careers" link pointed at non-existent /careers route | components/Footer.tsx | Removed |
| Track-record page buttons ("View All Sold Properties", "Book Your Valuation") had no links at all | app/track-record/page.tsx | Wired to /sold-prices and /valuation |
| Mayfair map iframe used a fabricated Google place id (`0x…5f5f5f5f`) | app/offices/mayfair/page.tsx | Replaced with keyless embed for 121 Park Lane W1K 7AG |
| Wales additional-property tax computed as main bands + flat 4% | lib/calculations.ts | Now uses the actual banded higher rates (11 Dec 2024); covered by new tests |

Still present but out of content-parity scope (flagged, unchanged): inert newsletter form (Footer), inert careers application form (/the-team), demo stakeholder data incl. "sarah@bancproperty.com" in the authenticated /progress portal, "Banc Belgravia" sample-property fallback data in lib/property-data.ts (verify it is dead code before launch), Unsplash placeholder imagery across hero/section backgrounds.

## Items requiring client (Banc/Nitesh) confirmation — do not resolve by assumption

1. **Mayfair office**: still active? Confirm 121 Park Lane W1K 7AG, 0203 368 8972, and whether `premier@bancproperty.com` exists (we reverted to live's info@ / 0203 number).
2. **Saturday hours**: live says Mon–Sat 9am–6pm at both offices; our build previously said Sat 9–4 / by appointment. We adopted the live hours — confirm.
3. **Landlord fees**: we adopted the live PDF schedule (8%/10%/13% inc VAT, one week's rent setup, £180 renewal). Confirm these are still current.
4. **Tenant fees**: live guide page and live tenant PDF contradict each other (variation £100 vs £50; keys £15/hr vs £20 admin + £30/hr callout). We kept the guide-page figures ours already had. Which document is authoritative?
5. **Deposit scheme**: which government-authorised scheme do you actually use (we removed the unsourced "MyDeposits" naming)?
6. **CMP certificate expired 21/07/2026** — supply the renewal PDF. Also: your live complaints PDF is the TPO template with "[COMPANY NAME AND/OR LOGO]" unfilled.
7. **Track record / stats**: every number previously on our track-record, why-us, reviews, lettings and land pages was invented. Supply real, citable figures for any you want back (sales volume, price-achieved %, Google rating, properties managed…).
8. **Team**: confirm Vicki's/Kay's direct emails, whether mobiles should be public, and supply real headshots (we removed the stock stranger photos). Who is "Sharon" named in Mayfair testimonials?
9. **Experience figure**: live uses both "combined 60 years" and "over 45 years combined". We kept both verbatim in their original contexts; pick one for the future.
10. **Accreditations/portals**: confirm current memberships: Client Money Protect ✓ (cert), TPO ✓ (PDF), The Guild ✓; Rightmove/Zoopla/OnTheMarket listing feeds; **Propertymark claim removed** (no evidence). "Award-winning" needs a named award.
11. **Google reviews**: real Business Profile URL + current rating/count (placeholder link and invented "5.0 from 50+" removed).
12. **Premier Homes**: keep our content page (needs sign-off of its service claims) or mirror live's £1M+ listings filter?
13. **The Guild page**: our fully-written page needs sign-off (live's is an empty placeholder); or link externally like live does.
14. **Blog**: our 3 AI-written posts need factual review (especially Cuffley school ratings/price bands); your live blog's only post is Lorem Ipsum from 2022 — decide its fate. Authors now credited "Banc Property Group".
15. **E-Zine**: its host (ezines-v2.propertylogic.net) no longer resolves — your live site links a dead page. Discontinued?
16. **Dead live area guides**: Crews Hill / Little Heath / "West Chesnut" 404 on your own site. Should they exist?
17. **Instant valuation**: our build shows AI-generated price estimates; your live form only captures leads. Approve the AVM or we repoint it.
18. **WhatsApp number** wa.me/447707877781 — typo of the landline? Confirm.
19. **ICO registration** number (our privacy policy asserts registration).
20. **Photography**: nothing usable on the live site (its section backgrounds are generic stock — verified visually); our build still uses Unsplash placeholders in many pages. Supply first-party photography (offices, team, local areas) — see image manifest.

---

## Repo/branch discrepancy noted at baseline

`~/brain/PROJECTS.md` (2026-08-26) records `~/Projects/banc-replacement-website` @ `aker-restyle` as canonical and calls this clone stale. Today's brief names this repo (`~/Projects/banc-website`) and `codex/mobile-action-rail` — which contains the aker-restyle work via merge PR #2 plus newer mobile work, so the brief was followed. Registry updated this session. Local unpushed branch `codex/mobile-audit-20260228-1549` (5 commits) left untouched.

## Handoff

- **Branch:** `content-parity-2026-08-27`, commit `482984a`, pushed to origin.
- **Preview deploy:** https://banc-website-8mmakqwmf-digital-inroads.vercel.app (SSO-protected; 23h share link minted at handoff).
- **Verification:** 92/92 node tests, tsc clean, ESLint clean on changed files, production build green (98 pages incl. 9 area guides + /community), `git diff --check` clean.
- **Visual sweep:** 62 CDP-driven checks across 23 pages at 375/390/768/1440px — zero horizontal overflow, zero broken images, zero missing alt after fixes (review-strip flex shrink, dead track-record hero URL).
- **Smoke test on deployed preview:** 9 key pages 200 with correct titles, 5 legacy-URL redirects verified 308, live fee schedule / Mayfair details / why-us figures confirmed rendering, zero fabricated names or placeholder links on homepage.

*Last updated: 2026-08-27*
