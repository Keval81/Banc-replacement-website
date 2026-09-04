# Pre-launch QA — state at compaction, 4 September 2026

Cut-over **Wednesday 10 September**. Old site retires Sat 13.

## Where the work is

**14 commits on `main`, local only — nothing pushed.** Nitesh has seen none
of: the contrast pass, the three carousels, the legacy redirect map, the
working lead capture, or the hero film with the people removed. This is the
single biggest risk to the date: if he reviews late and wants changes there
is no room left.

## QA sweep — started, NOT finished

### A false alarm worth recording

The first sweep reported catastrophic mobile overflow (up to 1538px on a
390px viewport) across most of the site, plus stylesheets refused for MIME
type and layout utilities not applying. **All of it was a stale server.**
Two `next start` processes were alive — one from an earlier session — and
the one on :3100 was serving HTML from a build that no longer existed on
disk, so it referenced a CSS chunk (`f36de1d5cd749f88.css`) that was never
written. Without that stylesheet Tailwind's `absolute`/`relative` never
applied, hero images fell back to their intrinsic 1920px, and the page
blew out sideways.

Against a clean `rm -rf .next && npm run build`, 9 of 10 routes measure
**0px overflow**.

**Lesson, and it is in memory already: kill every `next` process by name,
not just the port, before measuring anything.** `pgrep -f "next start"`.
An hour of "findings" here were the measurement, not the site.

### Confirmed real, still to fix

- **`/the-guild` overflows 8px on mobile.** The only genuine one.
- **`/forgot-password` returns 404** and is linked (prefetched from `/alerts`
  and `/blog`, so it is in a shared auth component). Needs the page or the
  link removed.

### Not yet re-run against the clean build

Console errors and failed requests. The earlier run's
`https://localhost:3100/login?reason=unavailable` SSL errors are almost
certainly the CSP's `upgrade-insecure-requests` upgrading a localhost
navigation — inert over HTTPS in production, the same artifact that once
cost a session chasing a "blank hero in Safari". Re-check on the clean
build before treating any of it as real. The journeys still to drive are
search → property → book viewing, valuation, alerts, and contact, at 1440
and 390.

## Decisions waiting on SanSan / Nitesh

1. **`/sold-prices` must come down or be rewritten before launch.** It is
   honest now but cannot answer, and it is in the sitemap, so Google will
   index a page promising "sold price data for any UK postcode" that always
   returns nothing. Recommendation: redirect it and drop it from
   `lib/site-routes.ts`, restore post-launch. ~10 minutes.
2. **The 6 GitHub secrets** — sync has failed 14/14, so listings only move
   when run by hand.
3. **Nitesh sends the Cove email** so James has notice for Wednesday.
4. **`/make-offer/[propertyId]` is built and orphaned.** Whether the site
   invites offers online is Nitesh's call.
5. **51MB of unreferenced video in `public/videos`**, including 27MB of
   `hero1/2/3.m4v` from March, shipped on every deploy.

## ⚠ Another agent is working in this repo

SanSan has GPT adding a claymation treatment to the team page, to be
deployed soon. Two consequences:

- **Push the 14 local commits before that lands**, or the merge gets
  unpleasant — `main` is the production branch and auto-deploys.
- **Re-run the contrast audit and the mobile check on `/the-team`
  afterwards.** Every new surface this session has produced failed AA on
  first pass, and the two lead-capture pages failed because they were
  written with hardcoded hex that the token codemod cannot see.

## Still outstanding on the build

| Item | State |
|---|---|
| 16 estimate range | Blocked — comparables were the honest source, and they are broken |
| 20 maintenance page | Needs N6 |
| 21 CMP badge | Needs N4 |
| 22 team page | GPT is doing the claymation treatment; bios/photos still N5 |
| 26 drone movement | Needs footage Banc do not have (N9) |
| 27 spring animation | Low priority, unblocked |
| 29 QA | In progress, see above |

*Last updated: 2026-09-04*
