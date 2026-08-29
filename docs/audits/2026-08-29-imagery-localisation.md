# Banc — Imagery Localisation Pass

**Date:** 2026-08-29 · Follows `2026-08-27-banc-live-image-manifest.md`

All 53 unique Unsplash photos referenced in `app/`, `components/`, `lib/` were downloaded and
visually inspected. 21 were replaced (49+2 code sites): anything with non-UK geographic tells is
gone, plus two URLs that returned 404. Every replacement was itself downloaded, viewed, and
confirmed UK-appropriate before use; all 84 image URLs now in the codebase return HTTP 200.

## What was removed

| Offender | Where it was |
|---|---|
| NYC street with yellow taxis | /area-guides hero |
| Toronto skyline (CN Tower) | Mayfair office hero + card |
| Toronto TD-bank towers | Cuffley office hero, /contact hero |
| US IRS tax forms ("Tax Withholding", US flag) | /tools hero, /lettings/fees hero, sellers-guide step 7 |
| Spanish villas with pools + palms (×3) | "Enfield" guide, "Goffs Oak" guide, why-us/track-record/sales/land-new-homes heroes, SoldBanner "Cuffley", Woodland Manor listing, sample-property "Swimming pool" |
| Queensland house with palms | "Potters Bar" guide |
| American clapboard / picket-fence houses (×2) | "Cheshunt" guide, "Newgate Street" guide |
| Canadian subdivision house | "Brookmans Park" guide |
| US shingle wraparound-porch house | "Essendon" guide |
| Icelandic red hut on moor | "Northaw" guide, "Riverside Barn" listing |
| Australian architect houses (×4, eucalyptus etc.) | "Cuffley" guide, buyers-guide hero + grid, reviews hero, SoldBanner "Potters Bar", Old Rectory listing |
| Dead 404 URLs (×2) | "Rose Cottage" listing, sample-property "Garage" |
| Marbella villa photo standing in as "floorplan" ×4 | sample property floorplans → now an architectural floor-plan drawing |

Replacements: English village lanes and high streets (Bibury, Gold Hill, Ely), red-brick
Georgian/1930s detached houses, thatched cottages, a Georgian manor, London white-stucco
terraces and mews for Mayfair, UK new-build development for land-new-homes, neutral
calculator/paperwork for fee pages, indoor pool + underground car park for the sample
property gallery. All heroes sit under the existing dark gradient overlays — checked at
render on `next start` (area-guides, offices, cuffley guide, tools).

## Deliberately NOT changed

- **Interiors, people/office shots** — no geographic tells; left as-is.
- **Homepage hero video + `public/images/lifestyle/`** — part of the approved designed
  hero experience; the pool listing image is UK-plausible (brick walls, TV aerial).
- **Team member photos** — Nitesh Bheda, Andrew Crump, Vicki Glashier, Kay Stanley on
  /offices/cuffley (+ Mayfair) still carry **stock faces against real names**. Not fixable
  with stock — needs real headshots from the client (already on the photography ask list).
  Worst remaining trust issue.
- **SoldBanner data** — addresses/prices/days-on-market look invented (see parity audit's
  fabrication list); imagery swapped here, but the numbers still need client-real data or
  removal.

All of this remains placeholder stock. The launch-quality path is unchanged: client
photography (storefronts, team, local area shots) replaces these wholesale.

*Last updated: 2026-08-29*
