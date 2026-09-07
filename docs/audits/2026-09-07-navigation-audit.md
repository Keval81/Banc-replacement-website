# Navigation audit — every link, every CTA, both viewports

*7 September 2026, 21:30 — the night before go-live.*

**What this is.** A crawl of the deployed build (`cb75bef` + tonight's
changes) that recorded every link and button on 64 routes at iPhone and
desktop widths, then checked where each one goes. 106 unique internal
destinations were fetched; 13 in-page anchors were checked for a matching id.
Then a read of the result for the two things Keval asked for: does each
action take the visitor where the label promises, and does the set feel like
one considered system.

## 1. Fixed tonight (wrong destination, one-line each)

| Where | Label | Was | Now |
|---|---|---|---|
| `/sales` | Book Your Valuation | `/contact` | `/valuation` |
| `/sales/sellers-guide` | View Sold Properties | `/sales/properties` (current listings) | `/sold-prices` |
| `/lettings` | Yield Calculator | `/lettings/yield-calculator` (a 308 hop) | `/tools/yield-calculator` |
| `/faq` | Visit Us · Find Our Office | `/contact` | `/offices` |

Files: `app/sales/SalesPageClient.tsx`, `app/sales/sellers-guide/page.tsx`,
`app/lettings/LettingsPageClient.tsx`, `app/faq/page.tsx`. Uncommitted.

## 2. Verified clean

- All 64 routes answer 200. `/favorites`, `/account`, `/alerts`, `/portal/*`
  bounce to `/login` by design (middleware). `/resources` is a 404 but nothing
  on the site links to it (the plan's "Resources" for the Land Registry
  checker is `/tools`).
- Every in-page anchor has a target: `/#alerts`, `#enquire` on listings,
  `#appointment` on both offices, `#team-roster`, `#opportunity`, the FAQ and
  tenants' guide sections.
- Every phone and email link carries the right number: 01707 877781 Cuffley,
  0203 368 8972 Mayfair, the three area lines, the four named mailboxes on the
  team page.
- Header, drawer, bottom nav and footer: every destination resolves.

## 3. Decide before launch (copy and routing, not code risk)

**3a. One name per destination.** The same page is reached under many labels:

| Destination | Labels found | Proposed canon |
|---|---|---|
| `/valuation` | Request an instant valuation · Request a valuation · Request valuation · Book a valuation · Book your valuation · Book valuation · Get free valuation · Book free rental valuation | **Request a valuation** in body CTAs; header keeps **Request an instant valuation** (the estimate is instant for sales) |
| `/sales/properties` | Properties for sale · Property search · Search · For sale · Browse properties · Browse our current listings · Current properties · View properties · Buy a home | **Properties for sale** (matches the page) |
| `/lettings/properties` | Properties to rent · To let · Browse properties · View properties · Rent a home | **Properties to rent** |
| `/contact` | Contact · Contact us · Get in touch · Contact form · Ask the team · Contacting our team | **Contact us** |
| `/why-us` | About (header) · Why Us (footer) · Learn more about us | pick **About** or **Why us**, use it in both |
| `/area-guides` vs `/blog/category/area-guides` | both labelled "Area guides" | rename the blog category link **Area insights**, or point it at `/area-guides` |
| "Learn more" | goes to `/premier-homes`, `/become-partner#opportunity`, `/cookies` | name the destination: **About Premier Homes**, **See the opportunity** |

**3b. "Subscribe to alerts" (header + drawer) → `/#alerts`.** From any deep
page it jumps to the homepage and scrolls mid-page. Meanwhile `/alerts` is a
real page but login-gated, and `/newsletter/signup` is public. One concept,
three surfaces. Recommend: header link → `/newsletter/signup` (public page,
already titled "Stay informed"), or make `/alerts` public.

**3c. Favourites from primary nav → login wall.** Header heart and the
bottom-nav "Saved" both go to `/favorites`, which the middleware sends to
`/login` ("Welcome Back") — for almost every visitor a dead end from the main
nav. Recommend: hide Saved/heart until signed in, or store saved homes locally
without an account. At minimum the login h1 should not say "Welcome Back" to
someone who has never been.

**3d. Three ways to enquire, two modalities.** Homepage featured cards have
"Enquire" → listing page `#enquire` (scroll to a form). On the listing page
the CTAs are "Request a viewing" → `/book-viewing/ID` (a page) and "Make an
offer" → `/make-offer/ID` (a page). Recommend: card "Enquire" → the same
`/book-viewing/ID` page, or drop it (VIEW HOME is enough); keep one enquiry
mechanism per listing.

## 4. After launch (agreed rule: changes wait until live)

- **`<Link>` wrapping `<Button>` — 59 places in 26 files.** Renders
  `<a><button>`: invalid nesting, two tab stops per CTA, and the crawl saw
  every one as a duplicated pair. Fix is mechanical (`<Button asChild>` around
  the `Link`); do it as one pass with a screenshot diff, not on go-live eve.
- **Nav label ≠ page title.** Sales → "Selling Your Property" (a buyer
  tapping Sales expects listings); Contact → "Cuffley Estate Agents"; About →
  "Why Choose Banc Property Group"; Property Management → "Landlords Guide".
  Retitle the h1s (keep SEO titles in `<title>`), or restructure the top nav
  as Buy · Sell · Rent · Let to match the hero's own words.
- **Back to properties drops the search.** Filters and page are lost. Preserve
  the query or use history back.
- **`/offices` has four links to two office pages** plus a contact button.
  One CTA per office.
- **Search-result card names read the address twice** ("View Tolmers Road,
  Cuffley, Tolmers Road, Cuffley, Hertfordshire") — aria-label composed from
  title + address. Compose once.
- **Homepage service card "Property Management" → `/lettings/landlords-guide`.**
  Either a property-management page or retitle the guide.

## 5. Method, for the record

Playwright (Chrome) against the protected deployment via a share cookie;
mobile 390×844 iPhone UA and desktop 1440×900; every `a[href]`, `button`,
`[role=button|link]` with text, region (header / drawer / bottom nav / footer /
main), href, target and visibility; the drawer opened on the homepage; then
`curl` of each unique destination and each anchor id. Script and inventory in
the session scratchpad; the rules worth keeping as a future check are "same
label, different destination" and "same destination, many labels".

*Last updated: 2026-09-07*
