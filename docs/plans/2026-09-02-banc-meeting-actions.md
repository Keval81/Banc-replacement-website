# Banc website — actions from the 2 Sep 2026 meeting (Keval / Nitesh)

**Launch deadline:** Saturday 13 September 2026 (old site goes offline). Review call: end of this week.
**Source:** Gemini notes + transcript, "Banc Website - 2026/09/02 16:00 BST".

## 0. Inputs we need from Nitesh (blocking items marked ⚠)

| # | Item | Blocks |
|---|------|--------|
| ⚠ N1 | The three area phone numbers (Cuffley, Brookmans Park, + third area) — Nitesh says already emailed | Header phone dropdown |
| ⚠ N2 | Sales and lettings enquiry email addresses | Viewing requests, valuation leads, contact routing |
| ⚠ N3 | DNS / domain access from the previous developer (Keval drafts the email, Nitesh sends) | Go-live on bancproperty.com |
| N4 | CMP (Client Money Protection) logo + certificate PDF | Footer compliance |
| N5 | Team photos + bios (for cartoon/animated treatment) | Team page |
| N6 | Maintenance WhatsApp number (Nitesh getting a phone this weekend) | Maintenance page / menu link |
| N7 | Exact brand blue (hex or a file using it) — otherwise we use the site's `banc-sky` #4AC8E8 | Logo recolour |
| N8 | Any verified stats for a ticker (optional — parked until Street) | — |

## 1. Build plan by batch

### Batch 1 — Quick wins, visible immediately (Wed–Thu)
1. **Logo in Banc blue** in the header (test legibility over video; fall back to white on dark frames if needed). Nitesh reviews on site.
2. **Rename CTA** top-right to "Request an instant valuation".
3. **Remove fake ticker** at the bottom of the homepage.
4. **Remove broken "Book free valuation" link** on the homepage.
5. **Rename AI assistant to "Banc Bot"** (launcher label, header, welcome message, aria labels) and swap the avatar image.
6. **Header phone icon** with dropdown of the three areas → `tel:` links (uses N1; placeholder structure now, numbers dropped in when received).
7. **Site tagline** "Local independent property specialists" in a softer font under/near the logo — check desktop and mobile for clutter.
8. **Property cards/detail — privacy:** strip door numbers and postcodes from displayed titles/addresses, breadcrumbs, page `<title>`, OG and JSON-LD; keep street + area. Map resolves to the area only (rounded coordinates / area circle, no exact pin).
9. **Property detail layout:** EPC widget smaller; move "About the property" beneath "At a glance"; confirm the tabs (Photos / Floorplan / Map / EPC) on mobile.

### Batch 2 — Data correctness (Thu)
10. **Exclude withdrawn / historic listings** from the Expert Agent import: filter on the feed's status/withdrawn fields so only live for sale / to let (+ recent under offer / let agreed) show. Audit the current 353 rows and archive the rest.
11. **Schedule the Expert Agent sync** (launchd on the Mac mini) so listings and search columns stay fresh automatically.

### Batch 3 — Search & sort (Fri)
12. **Sort options:** price low→high, high→low, newest first (surface in the results header and mobile drawer).
13. **Filter UX:** clear close/apply/clear-all behaviour on the filter panel and drawer.
14. **Radius search:** "This area only / 0.5 / 1 / 3 / 5 miles" — geocode the typed location (postcodes.io for postcodes, Google Geocoding for place names), then distance filter in the search RPC.

### Batch 4 — Lead capture (Fri–Mon)
15. **Viewing request:** preferred date + time fields; email to the sales or lettings inbox (N2) with name, contact details, property and preferred slot. Calendar sync deferred to Street.
16. **Unified instant valuation flow:** postcode → address dropdown → property details (type, beds, timeframe) → name, address, phone, email → show estimate range + "someone will be in touch" → email the team the full lead. Remove the separate "Request a valuation" form and fix the "can't get back to the homepage" bug.
17. **Subscribe to alerts:** rename Sign in / Register to "Subscribe to alerts" capturing criteria (area, type, beds, budget) and contact details; email the team for now, automate on Street.
18. **Life Magazine + alerts prominence:** move the "Stay updated" block up the homepage and pair it with the magazine.

### Batch 5 — Content & new pages (Mon–Tue)
19. **Stamp Duty calculator** page under Sales menu; **Rental Yield calculator** under Lettings menu.
20. **Maintenance reporting page** (how to report, hours, WhatsApp number N6, acknowledgement copy) + "Report a maintenance issue" link in the Lettings menu — mock-up first for Nitesh to review.
21. **CMP logo + certificate** in the footer (N4).
22. **Team page** with cartoon/animated headshots + bios and an office group photo (N5).
23. **About / Track record carousels** — colour-backed carousel cards (Bespoke, Marketing, Open all hours…) instead of plain text blocks.
24. **Google reviews carousel** with a subtle hover-lift on each card.
25. **Homepage featured slideshow:** price tag + "Enquire" button on each slide; drone-style slow motion where footage exists; refresh cadence.
26. **Replace hero clips featuring real people** with generic footage (needs replacement assets or stock).
27. **Explore subtle spring animation** on property photos (low priority).

### Batch 6 — Launch (Wed 10 – Sat 13 Sep)
28. DNS cut-over: add bancproperty.com + www to the Vercel project, set A/CNAME records at the registrar (N3), verify SSL, set `NEXT_PUBLIC_SITE_URL`, submit sitemap to Search Console, 301s from old URLs.
29. Final QA pass on mobile and desktop; review call with Nitesh.

### Parked until the move to Street
- Stats ticker (98% of asking price, sold value, Google rating) — needs verified data.
- Viewing calendar sync, client document upload/login, automated welcome packs and criteria-matched alerts, Orca/voice-agent lead qualification.

## 2. Non-build actions
- **Email to previous developer/host requesting DNS access** — draft below, Nitesh to send tomorrow.
- **Email to Nitesh** listing the inputs above (N1–N8) — draft below.
- Advise Nitesh to ask Street for a data import template / bridging call rather than manual entry.
- Book the end-of-week review call.

## 3. Draft — email for Nitesh to send to the previous web developer / domain host

Subject: bancproperty.com — DNS access needed before 13 September

Hi [name],

We're launching a new Banc Property Group website on 13 September, the day our current site goes offline, and we need to point the bancproperty.com domain at the new hosting before then.

Could you help with the following?

1. Confirm where the domain bancproperty.com is registered (e.g. GoDaddy, 123-reg, Namecheap) and who holds the account.
2. Either transfer the registrar account / domain into our own account (Nitesh, nitesh@bancproperty.com), or give us access to manage the DNS records for bancproperty.com.
3. If you'd prefer to make the changes yourself, please set the following records on the day we confirm (we will send the exact values): an A record for bancproperty.com and a CNAME for www pointing to our new host (Vercel). Existing MX / email records must be left unchanged.
4. Confirm whether the current hosting / email is tied to the domain in any way we should know about before switching.

Ideally we'd like access by Monday 8 September so the switch itself can be done in an afternoon with a fallback if anything needs reverting.

Many thanks,
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
