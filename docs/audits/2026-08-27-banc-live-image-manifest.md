# Banc Property — Live-Site Image Manifest

**Date:** 2026-08-27 · Companion to `2026-08-27-banc-live-content-parity-audit.md`

## Access conditions (why little was copied)

- `www.bancproperty.com` blocks curl and headless Chrome (Cloudflare managed challenge). Page HTML was
  readable via Claude WebFetch, which lists `<img src>` URLs but cannot save binaries.
- Content images are served from `cdn.webdadi.net`. Direct downloads worked for the first few requests,
  then Cloudflare bot protection locked this IP out (every subsequent request returns a challenge page).
- Wayback Machine has almost none of these CDN URLs archived (1 of 6 tried).
- Office/contact/area pages lazy-load their images: the served HTML contains only base64 placeholder GIFs,
  so those real URLs could not even be enumerated.

## Decisive finding: the live site's content images are stock, not client assets

The two images that could be retrieved and inspected are both generic agency stock:

| Image | Inspected via | Content |
|---|---|---|
| Community page background (`DD489E0C-…jpg`) | direct download (pre-lockout) | North-American street scene — Howe St sign, Vancouver; left-hand-drive traffic. Not Cuffley, not Banc |
| The Team page background (`FD0E1D51-…jpg`) | Wayback Machine | Generic "hands in a circle" teamwork stock photo |

Both live pages label these `Background Image`. The pattern (Webdadi template + stock backgrounds) plus the
absence of any people/office/street photography anywhere in the fetched pages means **no image on the live
site (outside the property feed and the landing hero, both out of scope) is clearly a Banc-owned/client-provided
asset**. Under the project constraint — *do not copy stock photography unless clearly authorised* — the correct
action is to copy **none of them**. Nothing was added to `public/images/` from the live site.

## Full inventory (recorded for the client conversation)

Intended destinations are hypothetical — **none copied**, reasons per row.

| Live page | Source URL (cdn.webdadi.net/Media/image/l/…) | What it shows | Intended destination | Why not copied | Recommended manual action |
|---|---|---|---|---|---|
| / (hero) | B99E6A52-925C-4EBD-B619-7EAAD86287ED.jpg | Homepage hero | — | Out of scope (landing imagery unchanged by constraint) | None |
| / (post-hero) | c02a944e-d0b3-425a-856b-939740cd6566.png | Unlabelled marketing visual | pending classification | CDN locked; not archived | Client to identify; supply original if first-party |
| / (valuation band) | 998DE542-9477-461A-9B2A-9E56CAF757CA.jpg | Valuation section background | — | CDN locked; stock pattern | Replace with client photography |
| / (testimonials band) | 40426348-DDC3-4B92-A917-80173B370E57.jpg | Testimonials background | — | CDN locked; stock pattern | Same |
| /sales | CB4BC74B…, AC25F955… (png), 964403E9… | 3 section backgrounds | — | CDN locked; stock pattern | Same |
| /sales/buyers-guide | 6624C4BE-0AF6-45D3-AF2D-7CAC9775CBA5.jpg | Hero background | — | CDN locked; stock pattern | Same |
| /sales/sellers-guide | 753F0304-E3C0-4713-B916-58D65CB13B52.jpg | Hero background | — | CDN locked; stock pattern | Same |
| /sales/stamp-duty | F50779A3-099A-4982-BCC1-97690739B63A.jpg | Hero background | — | CDN locked; stock pattern | Same |
| /lettings | A085F9C7…, 007C9BA1…, D5B8E313… | 3 section backgrounds | — | CDN locked; stock pattern | Same |
| /lettings/landlords-guide | 9CF12DA3-392B-4C81-BB75-28359D6C6D65.jpg | Hero background | — | CDN locked; stock pattern | Same |
| /lettings/tenants-guide | 07D64103-44AA-42E9-BA3B-02F2FEAA5389.jpg | Hero background | — | CDN locked; stock pattern | Same |
| /lettings/yield-calculator | 815679CF-E71C-4A01-9C71-BAFF825BB358.jpg | Hero background | — | CDN locked; stock pattern | Same |
| /property-valuation | 0393E2DF…, 4A95B025… | 2 backgrounds | — | CDN locked; stock pattern | Same |
| /the-team | FD0E1D51-FC4F-4A4B-9975-99B230BCDADF.jpg | Hands-in-circle stock | — | **Confirmed stock** (inspected) | Do not use; client headshots needed instead |
| /why-us | 334B3524-002D-440C-B1E2-338FF0875201.jpg | Hero background | — | CDN locked; stock pattern | Replace with client photography |
| /the-guild | 2A4C677C-32BE-4690-889C-36F95E6F84A9.jpg | Hero background | — | CDN locked; stock pattern | Same |
| /reviews | 43D2AD17-533E-4D16-B52C-001C6259B0B0.jpg | Hero background | — | CDN locked; stock pattern | Same |
| /community | DD489E0C-44D1-4B78-89C4-7E1F9441406A.jpg | Vancouver street scene | — | **Confirmed stock** (inspected) | Do not use; ask client for real community/tennis-club photos |
| /land-and-new-homes | 6809B3F0-AA1C-44E4-969F-BFB30FC84279.jpg | Hero background | — | CDN locked; stock pattern | Replace with client photography |
| /become-a-partner | CF0BA98B-AA93-4D2E-AAA5-A35897E27825.jpg | Hero background | — | CDN locked; stock pattern | Same |
| /contact, /offices/*, /area-guide* | (unenumerable — lazy-loaded) | Office/area card images | public/images/offices/, public/images/areas/ | Real URLs never present in served HTML | Client to supply storefront/office/area originals — highest-value photo ask |
| all pages | …image/s/899a74b4-0340-4f70-b9aa-866713a93e0b.png | Banc secondary logo | — | Brand assets already local (`public/banc-logo*.png`) | None |

## Documents (not images) retrieved from the same CDN

| Document | Source URL | Status |
|---|---|---|
| CMP Certificate (Client Money Protect, CMP005507, **expired 21/07/2026**) | cdn.webdadi.net/media/d118481a-95f9-44db-adb8-12fb6143b2ff.pdf | Downloaded pre-lockout; **not** published in our build pending the renewal cert from the client |
| Complaints Procedure (TPO template, company name placeholder unfilled) | cdn.webdadi.net/media/6b4bcaea-a34f-4f37-9af1-ee5c3d7b0715.pdf | Downloaded pre-lockout; used to verify /complaints wording; not published (template is unbranded) |
| Landlord fee schedule PDF | cdn.webdadi.net/media/image/l/3b163948-9cb4-4a80-9a8e-c14e09d29ad1.pdf | Read in full via WebFetch (figures in parity audit); binary download blocked — obtain original from client |
| Tenant fee schedule PDF | cdn.webdadi.net/media/image/l/fa1f1a87-7a9c-4de6-9327-39e87ce659be.pdf | Same |

## Consequence for our build

Our replacement currently uses Unsplash stock in many places (team headshots removed this session; heroes on
area guides, offices, guides pages remain). Since the live site offers nothing better, the path to launch-quality
imagery is a **client photography ask**: storefront + office interiors, team headshots, and a handful of local
area shots. Until then the existing Unsplash placeholders remain (flagged in the parity audit).

*Last updated: 2026-08-27*
