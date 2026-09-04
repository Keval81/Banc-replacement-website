# Banc website — actions from the 2 Sep 2026 meeting (Keval / Nitesh)

**Launch deadline:** Saturday 13 September 2026 (old site goes offline).
**Source:** Gemini notes + transcript, "Banc Website - 2026/09/02 16:00 BST".

---

# STATUS — 4 September 2026 · cut over Wed 10 Sep

> **DNS is no longer a blocker (4 Sep).** James at Cove Studios holds
> bancproperty.com in his hosting and has offered to update the records
> himself. We are taking that option rather than transferring the domain.
> **Go-live moves forward to Wednesday 10 September** — three working days
> before the old site retires on the 13th, so the switch has margin either
> side instead of landing on a Saturday.

## Where the build stands

**17 of the 27 pre-launch items are built**, plus a run of substantial work
that was not in the original plan at all (see the last row). Of the 10 open
items, 5 are waiting on an input from Nitesh or Keval and 5 can be built
now.

| Batch | Items | State |
|---|---|---|
| 1 · Quick wins | 1–9 | ✅ done, plus five review revisions |
| 2 · Data correctness | 10 | ✅ done — 251 already-sold houses removed from live stock |
| | 11 | ⛔ **blocked on Keval** — hourly sync live but **14 runs, 14 failures**, no repo secrets set |
| 3 · Search & sort | 12–14 | ✅ done — newest-first, filter panel exit, radius search |
| 4 · Lead capture | 15–17 | ⏸ **needs N2** (or can be built behind a constant now) |
| | 18 | 🔨 **buildable now** — no input needed |
| 5 · Content & pages | 19, 23, 24, 25 | ✅ done — calculators in menus, tools restyle, 3 carousels |
| | 20, 21, 22, 26 | ⏸ **needs N6 / N4 / N5 / footage** |
| | 27 | 🔨 low-priority polish, no input needed |
| 6 · Launch | 28–29 | ⏸ **needs N3** — DNS cut-over + final QA |
| Extra (not in the original plan) | — | ✅ Banc Bot outage fixed, chat continuity, Safari hero cleared, **site-wide contrast pass: 488 AA failures → 0** (the 12 that still register are measurement artifacts, each checked by eye) |

## ⛔ Outstanding WITH KEVAL — nobody else can clear these

| # | Action | Why it matters | Effort |
|---|---|---|---|
| K1 | **Set the 6 GitHub repo secrets** (command below). The `gh secret set` loop is refused by the agent's permission classifier, so it has to be run by hand. | The hourly Expert Agent sync has failed **14/14 runs**. Until this is done, listings only move when the sync is run manually, and the site's "last updated" stamp stays blank. | 1 min |
| K2 | **Push the 6 local commits and cut a preview for Nitesh.** `main` is the production branch and auto-deploys, so this publishes to the client's live site. | Nitesh cannot review any of the last two sessions' work — the contrast pass, the carousels — until it is deployed. | 5 min |
| K3 | **Decide whose OpenAI account carries the Banc Bot key.** | Live traffic bills that account's owner from launch day, at up to three provider calls per visitor turn. Commercial point, not technical. | decision |
| K4 | **Send Nitesh the input chase** (N1–N6 below) and the DNS email draft in §3. | N3 is the only item that can miss the 13 Sep launch. | 10 min |

### K1 — the command, ready to paste

All six values are already in `.env.local`; this reads them straight out of it.

```bash
cd ~/Projects/banc-replacement-website
for k in EXPERT_AGENT_FTP_URL EXPERT_AGENT_FTP_USER EXPERT_AGENT_FTP_PASS \
         NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY; do
  grep -m1 "^$k=" .env.local | cut -d= -f2- | tr -d '"' | gh secret set "$k"
done
gh secret list        # expect six rows
gh run list --workflow=sync-expert-agent.yml --limit 1   # next :17 run should pass
```

## ⏸ Outstanding WITH BANC (Nitesh) — chase these

| # | Input | Blocks | Priority |
|---|---|---|---|
| ⚠ **N3** | **DNS / domain access from the previous developer.** Keval has drafted the email (§3); Nitesh sends it. | Go-live on bancproperty.com | 🔴 **The only input that can miss the launch date.** Needs to be in hand by Mon 8 Sep to leave a safe window. |
| ⚠ N1 | The area phone numbers — Cuffley, Brookmans Park and the third area. Nitesh believes these were already emailed; they have not arrived. | Header phone dropdown | 🟠 Only Cuffley and Mayfair are live. Drops straight into `BANC_PHONE_LINES`, one-line change. |
| ⚠ N2 | Sales and lettings enquiry email addresses. | Viewing requests, valuation leads, contact routing (Batch 4) | 🟠 Everything currently routes to the generic `info@bancproperty.com`. |
| N4 | CMP (Client Money Protection) logo + certificate PDF. | Footer compliance (item 21) | 🟡 Compliance — wants to be right at launch. |
| N5 | Team photos + short bios. | Team page (item 22) | 🟡 |
| N6 | Maintenance WhatsApp number (Nitesh was getting a phone). | Maintenance page + Lettings menu link (item 20) | 🟡 |
| N7 | Exact brand blue, if one exists in the logo files or letterhead. | Logo recolour | 🟢 Optional — the site's own `banc-sky` is in use and looks right. |
| N8 | Verified stats for a ticker (98% of asking price, etc). | — | 🟢 Parked until the move to Street. |
| **N9 · NEW** | **Drone / slow-motion footage for the featured homes slideshow.** Requested at the meeting; the slideshow is built without it and works fine as stills. | Item 25 polish | 🟢 Needs either real footage or a stock budget. |
| **N10 · NEW** | **Lettings has exactly ONE available property.** That is the honest truth of the Expert Agent feed. Is that right, or are properties sitting at "Let STC" in the CRM that are actually available? | A one-property lettings page at launch | 🟠 **CRM answer, not a website change.** Worth resolving before launch. |

## 🔨 Buildable now, with no input from anyone

1. **Item 18** — move the "Stay updated" block up the homepage and pair it with Life Magazine.
2. **Items 15–17** (lead capture) — can be built behind a config constant the way `BANC_PHONE_LINES` already handles N1, so N2's addresses drop in later without a rebuild.
3. **Item 27** — subtle spring animation on property photos (low priority).
4. **Site-wide mobile QA pass** — part of item 29, does not need to wait for launch week.

## Decisions already taken that Nitesh should see on the preview

- **Filled CTAs moved from bright cyan to deep teal** (`banc-focus`), matching the /tools pages. White on cyan was 1.96:1 — below the legal accessibility floor.
- **Cyan CTA bands keep their colour but take dark ink.**
- **The homepage review section shows all 12 real Google reviews** as a carousel, replacing a 7-second rotator that showed 3.
- **`/tools/valuation` was deleted** (permanent redirect to `/valuation`) — it was a second, broken valuation form competing with the real one.

---

## 0. Inputs we need from Nitesh (original list, kept for the record)

| # | Item | Blocks | Status |
|---|------|--------|--------|
| ⚠ N1 | The three area phone numbers (Cuffley, Brookmans Park, + third area) — Nitesh says already emailed | Header phone dropdown | ⏸ still outstanding |
| ⚠ N2 | Sales and lettings enquiry email addresses | Viewing requests, valuation leads, contact routing | ⏸ still outstanding |
| ⚠ N3 | DNS / domain access from the previous developer (Keval drafts the email, Nitesh sends) | Go-live on bancproperty.com | ⏸ still outstanding — **critical path** |
| N4 | CMP (Client Money Protection) logo + certificate PDF | Footer compliance | ⏸ still outstanding |
| N5 | Team photos + bios (for cartoon/animated treatment) | Team page | ⏸ still outstanding |
| N6 | Maintenance WhatsApp number (Nitesh getting a phone this weekend) | Maintenance page / menu link | ⏸ still outstanding |
| N7 | Exact brand blue (hex or a file using it) — otherwise we use the site's `banc-sky` #4AC8E8 | Logo recolour | 🟢 not needed — site blue in use |
| N8 | Any verified stats for a ticker (optional — parked until Street) | — | 🟢 parked |

## 1. Build plan by batch

### Batch 1 — Quick wins, visible immediately (Wed–Thu) — ✅ done
1. **Logo in Banc blue** in the header (test legibility over video; fall back to white on dark frames if needed). Nitesh reviews on site.
2. **Rename CTA** top-right to "Request an instant valuation".
3. **Remove fake ticker** at the bottom of the homepage.
4. **Remove broken "Book free valuation" link** on the homepage.
5. **Rename AI assistant to "Banc Bot"** (launcher label, header, welcome message, aria labels) and swap the avatar image.
6. **Header phone icon** with dropdown of the three areas → `tel:` links (uses N1; placeholder structure now, numbers dropped in when received).
7. **Site tagline** "Local independent property specialists" in a softer font under/near the logo — check desktop and mobile for clutter.
8. **Property cards/detail — privacy:** strip door numbers and postcodes from displayed titles/addresses, breadcrumbs, page `<title>`, OG and JSON-LD; keep street + area. Map resolves to the area only (rounded coordinates / area circle, no exact pin).
9. **Property detail layout:** EPC widget smaller; move "About the property" beneath "At a glance"; confirm the tabs (Photos / Floorplan / Map / EPC) on mobile.

**Status: complete (2026-09-02), one commit per item on `main`.**

| # | Commit | Notes |
|---|--------|-------|
| 1 | `54128fd` | Blue lockup now renders in every header, including the transparent one over the hero film, with a drop shadow for bright frames. The hero still carries the large white lockup — Nitesh to say whether he wants both. |
| 2 | `ce4b26f` | Header CTA and mobile menu both read "Request an instant valuation". |
| 3 | `4890ab7` | `LiveReviewFeed` unmounted from `app/layout.tsx`; it ran under every page, not just the homepage. |
| 4 | `50f2a75` | The homepage's only free-valuation link was the footer's "Free Valuation" → `/tools/valuation`, a second unstyled form with dark-on-dark labels. Retargeted to `/valuation` and renamed, rather than deleted, so the footer keeps a valuation entry. Confirm this is the link Nitesh meant. |
| 5 | `3ec902b` | Every visitor-facing string renamed, plus the response prompt. The avatar is already the robot artwork — no new asset supplied, so it is unchanged. |
| 6 | `b1e0be2` | `BANC_PHONE_LINES` in `lib/banc-contact.ts` drives a header menu and a mobile-drawer list. Only the two confirmed numbers (Cuffley, Mayfair) are listed; a test forbids placeholder numbers. Adding N1's numbers there is the only change needed. |
| 7 | `1a1d5c6` | Tagline set in the serif token at light weight, beside the lockup, from 1280px up — below that the nav collides with it. |
| 8 | `0907c92` | `lib/property-privacy.ts` applied in `dbToCard`/`dbToDetail`, so cards, results, breadcrumbs, page titles, OG, JSON-LD, share text and the chatbot's trusted results all inherit it. Coordinates round to 3dp and the map frames at zoom 14. Verified against a production build: the only full postcode left in the rendered HTML is Banc's own office address in the footer. |
| 9 | `a61cafd` | Overview order is now At a glance → About → Energy performance → Room dimensions; EPC capped at `max-w-md` / 280px. |

**Review pass — answers and revisions (2026-09-02)**

| Question | Answer | Commit |
|---|---|---|
| Blue lockup in the header or the hero? | The hero. The header logo is dropped on the landing page (it stays on every other header); the hero lockup is now brand blue with the tagline under it. | `9cbebc7` |
| Was the footer "Free Valuation" the broken link? | Yes, accepted as fixed. | — |
| Bespoke avatar artwork? | Yes. Four candidates generated; the warm cream character was chosen and shipped as `public/images/ai/banc-bot.png`. | `b9efb42` |
| Strip house names too? | No — numbers and postcodes only. But the review found cards repeating the title and the address, and fixing it exposed a leak: `Bridge House 69 Station Road` published a door number, because the number was not leading. Both fixed; re-audited across all 48 live listings with zero identifiers left. | `c043e62` |
| Add an EPC tab? | No — the certificate stays a body section. | — |

Remaining follow-up: one card (BPGC1116) still prints both lines, because
its address is the only place the street appears. Left as is.

## Banc Bot restored (2026-09-03)

The assistant had been answering "temporarily unavailable" everywhere,
including on Preview and Production, because the stored `OPENAI_API_KEY`
was revoked — the same key sat in both Vercel environments and both were
rejected with `401 invalid_api_key`. No key was ever committed to the repo,
so it was rotated or revoked upstream, not leaked.

A new key is in `.env.local` and in Vercel for Preview and Production. The
configured `OPENAI_CHAT_MODEL` had also stopped resolving and is now
**`gpt-4.1`**, which is a functional requirement rather than a preference:

- The model must support the Responses API with strict `json_schema`
  structured output. Verified working against the live account: gpt-4.1,
  gpt-4.1-mini, gpt-4o-mini, gpt-5, gpt-5-mini.
- **gpt-4.1-mini fails the intent layer's `clear` operation.** Asked for a
  3 bed, then a pool, then "just search for any with pool", it keeps
  bedrooms pinned at 3/3 and returns nothing — reproduced 2/2. gpt-4.1
  handles it 6/6 across phrasings, including accepting the assistant's own
  suggestion ("yes").
- The gpt-5 models work but spend 300-560 reasoning tokens per call and run
  2-4x slower; the handler makes up to three calls per turn, so that is
  12-17s per reply.

So dropping to a cheaper model silently degrades comprehension rather than
just quality. `.env.example` records the constraint.

Still open: the OpenAI account that key belongs to bills for all live
traffic from launch. Decide whether that sits with Digital Inroads or with
Banc before the 13th.

## Safari hero check — CLEARED (2026-09-03)

**The hero is not blank in Safari. This is no longer a launch blocker.**

Verified in real Safari 1440x900 against a production build (`next build`
+ `next start`), not a headless run: the blue BANC lockup, the tagline and
its rule, the Google review card, the journey selector and the header CTA
all render, and the film plays behind them. Every framer-motion `initial`
in the hero hydrates and reveals.

**What the earlier "invisible in WebKit" run actually was.** The CSP in
`next.config.ts` ends with `upgrade-insecure-requests`. Safari, unlike
Chrome, does **not** exempt localhost from that directive, so on
`http://localhost:PORT` it upgrades every subresource to `https://` and
they all fail — stylesheet, images and **all the JavaScript**. The page
renders as unstyled blue-link HTML with a broken logo, and because no
client JS runs, framer-motion never animates and the SSR `opacity: 0`
stays put forever. That is one bug wearing two costumes, and it is a
local-testing artifact only: production and Vercel previews are HTTPS,
where the directive is a no-op.

**So: to test this site in Safari over localhost you must first strip
`upgrade-insecure-requests`.** It is baked into `.next/routes-manifest.json`
at build time, so editing `next.config.ts` alone does nothing to a server
already built — patch the manifest (and restore it afterwards) or rebuild.

The SSR `opacity: 0` inline styles are still there and still confirmed in
the production HTML (`style="opacity:0;transform:translateY(24px)"` on the
lockup). They are fine in any browser that runs the JS; they only strand
content when JS fails entirely. Not worth converting to CSS now.

## Where this stopped (2026-09-03, end of session)

25 commits on `main`, **local only — still nothing pushed or deployed.**
460 tests pass, `tsc --noEmit` clean, ESLint unchanged from baseline.

Since the 2 Sep session: Batch 1's nine items, five revisions from SanSan's
review, the Banc Bot outage (see above), and the chat-continuity fix —
following a listing link out of the chat used to land on a page with no
assistant on it and a destroyed thread; the overlay policy now covers
property pages, `lib/property-chat-session.ts` keeps the thread in
sessionStorage, and the launcher holds a raised offset to lg so it clears
the sticky enquiry bar.

**Pick up here, in order:**

1. ~~Check the hero in real Safari~~ — **done 2026-09-03, cleared.** See the
   Safari section above.
2. Push and cut a preview deploy for Nitesh; book the end-of-week review
   call. Vercel already holds the working OpenAI key and model, so Banc Bot
   will work on the preview. All 26 unpushed commits are authored
   `kevbheda@gmail.com`, so Vercel will not block the build.
3. Chase **N3 (DNS access)** — the only outstanding input that can miss the
   13 Sep launch — then N1 and N2.
4. Start Batch 2.

**Decisions still owed by the client / SanSan**

- Which OpenAI account carries the key: Banc's live traffic bills its owner
  from launch day, three provider calls per turn.
- One property card (BPGC1116) still shows both a title and an address
  line, because its address is the only place the street appears.

## Where this stopped (2026-09-02, earlier session)

Batch 1 and the review pass are complete on `main`, **local only — nothing
pushed or deployed.** 453 tests pass, `tsc --noEmit` clean, ESLint unchanged
from baseline, production build compiles.

**Pick up here, in order:**

1. ⚠ **Check the hero in real Safari.** The hero lockup and the Google review
   card use framer-motion's `initial`, which is written into the
   server-rendered inline style as `opacity: 0`. In a WebKit run where no
   client JS executed, both stayed invisible indefinitely — the tagline had
   the same fault and is now fixed in CSS (`8bf16dd`). Unknown whether real
   Safari reproduces it; that run also failed to load the stylesheet, so it
   may be an artifact of the headless build. **If Safari shows a blank hero
   this is a launch blocker, not polish** — the fix is the same pattern used
   for the tagline: `.banc-tagline-reveal` / `.banc-rule-draw` in
   `app/globals.css`.
2. Push and cut a preview deploy for Nitesh; book the end-of-week review call.
3. Chase the blocking inputs — **N3 (DNS access) is the one that can miss the
   13 Sep launch**, then N1 (three area phone numbers, which drop straight
   into `BANC_PHONE_LINES`) and N2 (sales/lettings enquiry inboxes, which
   Batch 4 needs).
4. Start Batch 2.

### Batch 2 — Data correctness (Thu) — item 10 ✅ done, item 11 ⛔ blocked on Keval
10. ~~**Exclude withdrawn / historic listings** from the Expert Agent import~~ — **done 2026-09-03 (`946e948`).** See below.
11. **Schedule the Expert Agent sync** — the workflow already exists and is already running; it has never once succeeded. See below.

**10 — what was actually wrong (2026-09-03).** Not withdrawn listings: the
feed contains none. The feed's real shape, read live off the FTP:

| department | feed priority | count | mapped to | published? |
|---|---|---|---|---|
| Sales | On Market | 43 | for_sale | yes |
| Sales | Under Offer | 17 | under_offer | yes |
| Sales | **Sold STC** | **237** | under_offer | **yes** |
| Lettings | Available to Let | 1 | to_let | yes |
| Lettings | **Let STC** | **59** | let_agreed | **yes** |

Expert Agent never advances a completed sale past "Sold STC", so the
priority accumulates. Those 237 Sold STC carry `instructedDate` values back
to **2017**, and the 59 Let STC back to 2020 — a nine-year archive, not live
stock. Mapping them onto under_offer/let_agreed meant **251 of the 294
sales listings on the site were houses that had already sold**, each with a
live "Under Offer" badge, a detail page, JSON-LD and a place in Banc Bot's
trusted results.

Sold STC and Let STC now map to sold/let, which sit outside
`MARKETABLE_PROPERTY_STATUSES`; `SALES_STATUSES`/`LETTINGS_STATUSES` already
excluded those, so search, detail pages and the chatbot all drop them with
no second filter. The rows stay in the table for any future "recently sold"
work. Re-synced against the live feed and verified through the real
`search_properties` RPC with the anon key:

- **sales: 60** (43 for sale + 17 under offer), was 294
- **lettings: 1**, was 60
- 296 rows archived as sold/let; 2 rows absent from the feed correctly
  deactivated by the reconcile step

**⚠ Client question this raises — lettings has exactly one available
property.** That is the truth of the feed, and it is a thin lettings page
for a launch. Ask Nitesh whether Banc genuinely has one property available
to let right now, or whether their Expert Agent statuses need cleaning up
(properties still sitting at "Let STC" that are actually available). This
is a CRM-side answer, not a website change.

**11 — the sync is already scheduled and has never worked.**
`.github/workflows/sync-expert-agent.yml` runs hourly at :17 on `main` and
is live on GitHub now. Every run fails, 8 for 8 since 1 Sep, because **none
of the repository secrets were ever set** — the log shows every env var
empty and the script exiting on `supabaseAdmin not configured
(SUPABASE_SERVICE_ROLE_KEY)`. `gh secret list` returns nothing. So no
launchd job is needed; what is needed is six repo secrets:
`EXPERT_AGENT_FTP_URL`, `EXPERT_AGENT_FTP_USER`, `EXPERT_AGENT_FTP_PASS`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` — all present in `.env.local`. Until they are
set, listings only move when the sync is run by hand, and the site's "last
updated" freshness stamp stays blank (`crm_sync_runs` was empty until the
manual run on 3 Sep).

### Batch 3 — Search & sort (Fri) — ✅ done
12. ~~**Sort options**~~ — **done 2026-09-03 (`a0d14e3`).**
13. ~~**Filter UX**~~ — **done 2026-09-03 (`cfdc018`).**

**12 — newest first could not have worked.** The two price sorts were
already wired end to end, but the adapter wrote `source_updated_at` as
`undefined`, so the canonical ordering fell through to `created_at` — the
row's insertion time, identical across a bulk sync and unrelated to when a
property was listed. The feed's `instructedDate`, the actual listing date,
was parsed nowhere. It is now read day-first (a month-first reader turns
13/02 into an invalid date) and carried to `source_updated_at`, so the
canonical order genuinely runs newest-listed first and is labelled for what
it does rather than sitting beside a duplicate "newest" option. Verified
against the live RPC: 29 Aug, 27 Aug, 25 Aug, 22 Aug, 18 Aug. The sort
control moved to the results header beside the count; the mobile drawer
already carried it.

**13 — the desktop filter panel had no way out.** It was rendered without
`onClose` or `onSearch`, and both the close button and the footer were
gated on `isMobile`, so neither existed on desktop: the only way to dismiss
it was to find the Filters toggle again, and its header scrolled out of
reach inside the 600px scroll box, taking Clear all with it. Filters apply
live (`useSearchFilters` debounces at 300ms), so the panel needed an exit
rather than an apply — it now has the drawer's sticky header, close control
and apply-and-close footer. Its own Sort by drops on desktop, where the
results header carries it, and stays in the drawer, which has no results
header. Driven in Chrome to confirm: close button present, footer reads
"Show 60 results", no duplicate sort, and the panel closes.
14. ~~**Radius search**~~ — **done 2026-09-03 (`15a0b86`).**

**14 — radius search, without a Google key.** The plan assumed Google
Geocoding for place names; this project holds no Google Maps key at all
(the same gap behind the `gm_authFailure` map fallback). postcodes.io covers
every case on its own and needs no key: `/postcodes/{pc}` for full
postcodes, `/outcodes/{outcode}` for a bare outcode, and `/places?q=` for
place names. Checked live against Cuffley, Brookmans Park, Goffs Oak,
Mayfair, both postcode spellings, and a nonsense string.

Design points worth keeping:

- **A live centre replaces the text match rather than narrowing it.** Asking
  for three miles around Cuffley should return streets near Cuffley whose
  address never says Cuffley. Live, that is the difference between 34
  results and 37.
- **A failed geocode widens rather than empties.** If the lookup fails the
  search falls back to text matching; it never returns a blank page because
  a third party was down. A radius with no location is dropped on parse.
- **Distance is haversine in miles** (`7917.5226 * asin(sqrt(...))`), not
  PostGIS, which this project does not enable. At Hertfordshire scale the
  error is metres. Properties with no coordinates drop out of a radius
  search rather than into it.
- **Resolving the centre lives in the repository**, so the `(query, signal)`
  interface every caller uses — the chatbot's portfolio search included —
  stayed untouched.
- `radius` also left `UNSUPPORTED_FILTER_KEYS`, the tripwire that stopped
  the UI advertising filters the backend could not honour.

Migration `202609030001_radius_search.sql`, applied to the live project.
Verified against live data: no centre 60 (unchanged), then 24 / 37 / 57 / 60
at ½ / 1 / 3 / 5 miles of Cuffley, and 0 within 3 miles of Mayfair.

**One bug this surfaced, of the kind types cannot catch.**
`getPropertySearchFilters` hand-copies each field into the UI's filter
state, and it did not copy `radius`. Every field is optional, so omitting
one type-checks perfectly: the URL said `radius=1`, the search honoured it
and returned 37, while the control silently read "This area only" and no
chip appeared. Caught by driving the real page in Chrome, not by the suite.
Now covered by a regression test.

### Batch 4 — Lead capture (Fri–Mon) — ⏸ not started

15–17 need N2, but can be built now behind a config constant the way
`BANC_PHONE_LINES` already handles N1, so the addresses drop in later
without a rebuild. **18 needs nothing and is the next thing to build.**
15. **Viewing request:** preferred date + time fields; email to the sales or lettings inbox (N2) with name, contact details, property and preferred slot. Calendar sync deferred to Street.
16. **Unified instant valuation flow:** postcode → address dropdown → property details (type, beds, timeframe) → name, address, phone, email → show estimate range + "someone will be in touch" → email the team the full lead. Remove the separate "Request a valuation" form and fix the "can't get back to the homepage" bug.
17. **Subscribe to alerts:** rename Sign in / Register to "Subscribe to alerts" capturing criteria (area, type, beds, budget) and contact details; email the team for now, automate on Street.
18. **Life Magazine + alerts prominence:** move the "Stay updated" block up the homepage and pair it with the magazine.

### Batch 5 — Content & new pages (Mon–Tue) — 19, 23, 24, 25 ✅ done; 20, 21, 22, 26 ⏸ waiting on inputs
19. ~~**Stamp Duty calculator** under Sales; **Rental Yield calculator** under Lettings~~ — **done 2026-09-03 (`6bdbc39`, `19627fd`).**

**19 — both calculators already existed** (`app/tools/stamp-duty`,
`app/tools/yield-calculator`, backed by `calculateStampDuty` /
`calculateYield`). They were only ever linked from the footer; they now sit
in the Sales and Lettings menus.

**A broken duplicate went with it.** `/tools/valuation` was a second
valuation form competing with `/valuation` for the same intent, and barely
readable: 13 elements below AA against its dark panel, the worst being the
"Property Address" label at **1.23:1**, near-black on near-black. It was
still carded on the tools hub and still in the sitemap, so it would have
been indexed against the real page. Now a permanent redirect to
`/valuation`.

**The tools section was a dark island in a light site.** Every tool page
wrapped its content in a full-height `bg-banc-dark-deep`, inherited from an
earlier design, plus a full-page photo wash, gradient hover overlays and a
different accent colour per tool (green, blue, purple, pink). Fine while
they were footer-only; not once they are in the main nav. Restyled per
DESIGN.md — light canvas, white cards on hairlines, no gradients (the hero
scrim over photography stays, which the contract allows), and one accent at
a time, with the four rainbow pills becoming the museum-label eyebrow.

Two things the move exposed, both worth remembering:

- **`banc-sky` #4AC8E8 is the dark-background accent.** On the light canvas
  it reads at **1.8:1**. Accent text and filled buttons now take
  `banc-focus` #0B6F89 (**5.2:1**) — the token the rest of the site already
  uses for exactly this. The tools' filled buttons had been white on cyan,
  1.96:1.
- **The hub's photo wash covered the whole page**, not just the hero, so
  once the ink went dark the entire page sat on muddy grey. An automated
  contrast pass *missed this* — it resolves the nearest opaque ancestor and
  never sees a composited photo overlay. Only the screenshot caught it.

Also listed the catchment checker on the hub; it was in the footer and the
sitemap but missing from the tools page itself.

Mechanical parts ran through `scripts/codemod-tools-light.mjs`, which
guards class strings on filled buttons so their white ink survives.
Verified in Chrome on production across all six pages.

**Worth knowing: the cyan-on-light problem is site-wide.** Measured the
same way, untouched pages carry 20-25 elements below AA (`/lettings` "Our
Services" at 1.96:1, `/why-us` "What Sets Us Apart" at 2.92:1) against 2 on
the restyled tools pages. Not fixed here — flagging it as its own pass.

**23, 24, 25 — done 2026-09-03 (`b1e75bd`).** All three sit on one shared
primitive, `components/Carousel.tsx`: a scroll-snapping track with prev/next
controls that disable at the ends, arrow-key support and a carousel
role/label. It does **not** autoplay — the rotating review ticker was removed
in Batch 1, and content that moves out from under a reader is the classic
carousel accessibility failure. The track is a real scroll container, so
touch and trackpad work regardless of the buttons.

- **23** — the ten `/why-us` differentiators were a static four-column grid.
  They are now colour-backed cards drawing from `lib/carousel-surfaces.ts`,
  which pairs each background with the ink that belongs on it. **A card
  cannot be given a colour without readable text**, which is how the site
  accumulated 488 AA failures in the first place. The test asserts the
  *composited* value: `text-banc-dark-deep/80` on cyan is 4.10:1 if you guess
  the hex, 5.96:1 once you actually blend it — the first draft failed.
- **24** — the homepage showed 3 of the 12 real Google reviews, rotating on a
  7-second timer. All 12 are now cards with the requested hover-lift,
  expressed as movement plus a hairline rather than the drop shadow DESIGN.md
  forbids. Reviews moved to `lib/reviews.ts`; they had been inlined in
  `app/reviews/page.tsx`, so the carousel would have needed a hand-maintained
  second copy.
- **25** — featured homes are a slideshow, each slide carrying the price on a
  scrim over the photograph plus an Enquire CTA. Loading, empty and error
  states untouched. **The `#enquire` anchor did not exist** — the enquiry
  panel now has that id, and a test ties the link to a target that answers
  it. **Drone-style footage is NOT included: it needs assets that don't
  exist yet (an input to chase with Nitesh).**

Verified by driving each carousel in Chrome, not by photographing it: all
three advance, prev disabled at start and enabled after. Contrast
re-measured on `/`, `/why-us`, `/reviews`, `/track-record` — zero failures.
Mobile checked at 390px, no horizontal page overflow.

20. ⏸ **NEEDS N6.** **Maintenance reporting page** (how to report, hours, WhatsApp number N6, acknowledgement copy) + "Report a maintenance issue" link in the Lettings menu — mock-up first for Nitesh to review.
21. ⏸ **NEEDS N4.** **CMP logo + certificate** in the footer.
22. ⏸ **NEEDS N5.** **Team page** with cartoon/animated headshots + bios and an office group photo (N5).
23. **About / Track record carousels** — colour-backed carousel cards (Bespoke, Marketing, Open all hours…) instead of plain text blocks.
24. **Google reviews carousel** with a subtle hover-lift on each card.
25. **Homepage featured slideshow:** price tag + "Enquire" button on each slide; drone-style slow motion where footage exists; refresh cadence.
26. ⏸ **NEEDS ASSETS (N9).** **Replace hero clips featuring real people** with generic footage (needs replacement assets or stock).
27. 🔨 **Buildable now.** **Explore subtle spring animation** on property photos (low priority).

### Batch 6 — Launch (Wed 10 – Sat 13 Sep) — ⏸ 28 gated on N3
28. ⚠ **GATED ON N3 — the critical path.** DNS cut-over: add bancproperty.com + www to the Vercel project, set A/CNAME records at the registrar (N3), verify SSL, set `NEXT_PUBLIC_SITE_URL`, submit sitemap to Search Console, 301s from old URLs.
29. Final QA pass on mobile and desktop; review call with Nitesh.

### Parked until the move to Street
- Stats ticker (98% of asking price, sold value, Google rating) — needs verified data.
- Viewing calendar sync, client document upload/login, automated welcome packs and criteria-matched alerts, Orca/voice-agent lead qualification.

## 2. Non-build actions
- **Email to previous developer/host requesting DNS access** — draft below, Nitesh to send tomorrow.
- **Email to Nitesh** listing the inputs above (N1–N8) — draft below.
- Advise Nitesh to ask Street for a data import template / bridging call rather than manual entry.
- Book the end-of-week review call.

## 3. DNS cut-over — RESOLVED 4 Sep, records confirmed

**Cove Studios (James) holds the domain and will edit the records.** We are
not transferring it: the domain carries Banc's live email, a transfer can
take up to five days, and option 3 changes the smallest possible surface.

**Measured live on 4 Sep, so we know exactly what is there:**

**Confirmed against Cove's own control panel (screenshots, 4 Sep).** The
panel numbers the rows, so the change is row 1 and row 6 and nothing else:

| Row | Host | Type | Current value | Action |
|---|---|---|---|---|
| 1 | *(blank = apex)* | `A` | `35.246.9.164` — Google Cloud, **does not respond; the bare domain is dead today** | **change to `76.76.21.21`** |
| 2 | `autoconfig` | `CNAME` | `autoconfig.hosts.co.uk` | **leave — mail client auto-setup** |
| 3 | `ftp` | `CNAME` | `cd1973.ftp.tb-hosting.com` | leave — FTP at the old host; dead weight after migration but harmless |
| 4 | `imap` | `CNAME` | `imap.namesco.net` | **leave — incoming mail** |
| 5 | `pop3` | `CNAME` | `pop3.namesco.net` | **leave — incoming mail** |
| 6 | `www` | `CNAME` | `live.webdadi.net` — Webdadi, behind Cloudflare | **change Type to `A`, value `76.76.21.21`** — a name cannot hold a CNAME and an A |
| 7 | *(blank)* | `TXT` | `192.168.1.73` | leave — a private RFC1918 address, meaningless publicly. Junk, but not ours to remove |
| 8 | *(blank)* | `TXT` | `v=spf1 include:spf.hosts.co.uk ~all` | **leave — SPF, breaks outbound mail if touched** |
| 9 | — | `A` | *(empty)* | the panel's blank "add" row, not a record |

Held elsewhere in the panel and confirmed by `dig`, so out of the blast radius:

| Record | Value | Action |
|---|---|---|
| `MX` | `hermes.hosts.co.uk`, `athena.hosts.co.uk` (both priority 30) | **do not touch** |
| `CAA` | none present | nothing to do — SSL will issue |
| `NS` | `ns0/ns1/ns2.phase8.net` | **unchanged** — we are not moving nameservers |

**The email side is wider than MX and SPF.** Rows 2, 4 and 5 are mail
infrastructure too (`autoconfig`, `imap`, `pop3` → Namesco/hosts.co.uk).
The sent email covered them only as "any other subdomains"; the follow-up
below names them, because that is how a well-meant tidy-up gets avoided.

### ⚠ Registrant record is effectively empty

Cove's panel shows **no registrant name, company, email, telephone or
mobile** — only an address, `56 Northfield Road, Waltham Cross EN8 7RF`,
which is **not** either Banc office (`1 Station Road, Cuffley EN6 4HU` /
`121 Park Lane, Mayfair W1K 7AG` per `lib/schema-org.ts`). James assumed it
was Banc's; it is not the business address. Nitesh should confirm what it
actually is.

**Confirmed by WHOIS (4 Sep):** registrar is Register SPA (register.it,
Namesco's parent), created 2016-02-13, **expires 2027-02-13 — about five
months away**. The domain also carries `clientTransferProhibited`,
`clientUpdateProhibited` and `clientDeleteProhibited`, so it is locked
against both transfer and registrant edits until Cove/Namesco lift them.
That makes the transfer option James offered slower than it sounded, and is
further reason the two-record edit was the right call.

**The renewal is the live risk, and it is closer than it looks.** With no
registrant email on record, the February 2027 renewal notice goes to
whoever Namesco holds on the account — James — not to Nitesh. That is fine
while the relationship is good and is exactly how domains lapse when one
ends. Raise it with Nitesh alongside the launch rather than parking it:
confirm auto-renew is on and who is billed, then either move the domain to
a Banc-owned account or at minimum get Nitesh's email onto the registrant
record. Both need Cove to lift the locks first.

The address itself is explained: `56 Northfield Road` is Nitesh's previous
home address, so the domain is genuinely his — the record is stale, not
disputed.

This is an ownership-of-your-own-domain problem, not a launch problem — it
has presumably been like this for years and nothing about the 10th changes
it. **Deliberately not fixing it before launch:** editing registrant
details on a `.com` can trigger ICANN's 60-day transfer lock, which would
block the post-launch move into a Banc-owned account. Correct sequence is
transfer first, then fix the details in the new account. October job.

`76.76.21.21` is the value Vercel returned for this project after both
domains were added to it (`vercel domains inspect`), not a value copied from
documentation — the docs list several and only the project knows which
applies.

**Both domains are now added to the Vercel project `banc-website`.** One
dashboard step remains: set `bancproperty.com` as the primary domain so
`www` redirects to it, matching the canonical origin in `lib/site.ts`.

**Old-site URL inventory captured 4 Sep** —
`docs/audits/2026-09-04-old-site-url-inventory.json`, 372 URLs recovered
from the Wayback index because Cloudflare 403s both curl and headless
Chrome on the live site. 53 are real pages needing 301s; 308 are individual
`/property/...` listings that can fold into the search page. **This could
not have been recovered after the old site went offline.**

### Draft — Nitesh's reply to James at Cove Studios

Subject: bancproperty.com — DNS records for the new site (go-live Wed 10 Sep)

Hi James,

Thanks, that's really helpful — and yes, option 3 please. Given the email is attached to the domain we'd rather not move it, so if you're happy to update the records at your end that's the simplest and safest route for everyone.

Here is exactly what needs to change. It is two records, and nothing else should be touched.

CHANGE — the A record for the domain itself
    Name:     @  (bancproperty.com)
    Current:  35.246.9.164
    New:      76.76.21.21

REPLACE — the www record
    Name:     www
    Current:  CNAME  ->  live.webdadi.net
    New:      A record  ->  76.76.21.21
    (The CNAME needs removing, as one name can't hold both.)

PLEASE LEAVE EXACTLY AS THEY ARE — everything else on the domain, in particular:
    MX:   hermes.hosts.co.uk and athena.hosts.co.uk (both priority 30)
    TXT:  v=spf1 include:spf.hosts.co.uk ~all
    ...along with any other TXT records or subdomains.

Email must be completely unaffected by this — that's the one thing we really don't want to disturb.

Two small asks:

1. Could you drop the TTL on those two records to 300 seconds the day before, on Tuesday 9th? It means the change takes effect in minutes rather than hours, and can be put back just as quickly if anything looks wrong.

2. Could you send over the full current record list? Our developer would like to check nothing else is pointing at the existing site before we switch.

We'd like to make the change on the morning of Wednesday 10 September, if that suits you. That's deliberately a few days ahead of the 13th so there are working days either side if anything needs adjusting, rather than doing it on a Saturday.

One thing worth flagging while you're in there: bancproperty.com without the www doesn't currently resolve to anything — it times out, and only the www version works. After this change both will work properly.

Thanks again for making this straightforward.

Nitesh
Banc Property Group

## 4. Draft — email from Keval to Nitesh (inputs and next steps)

Subject: Banc website — what I need from you before the 13th

Hi Nitesh,

Great session today. I've broken everything down into a build plan and I'm starting on the quick wins now. To keep it moving, here's what I need from you:

1. The three area phone numbers for the header dropdown (Cuffley, Brookmans Park and the third area) — I can't see the email; could you resend?
2. The email addresses for sales enquiries and lettings enquiries (viewing requests and valuation leads will route to these).
3. The DNS email — draft attached below; please send it to the previous developer/host tomorrow. This is the one thing that could hold up the launch.
4. CMP logo and certificate for the footer.
5. Team photos and short bios for the team page.
6. The WhatsApp number for maintenance issues once you have the phone.
7. If you have an exact brand blue (from your logo files or letterhead), send it — otherwise I'll use the blue already on the site.

I'll have the first batch (logo, Banc Bot, privacy changes to addresses, tabs, EPC size, ticker and broken link removed, renamed valuation button) up for you to look at by Thursday, and I'll put a call in for the end of the week.

Cheers,
Keval

*Last updated: 2026-09-04*
