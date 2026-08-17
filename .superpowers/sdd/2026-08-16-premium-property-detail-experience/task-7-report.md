# Task 7 — Production and Responsive Verification Report

Date: 2026-08-16
Worktree: `/private/tmp/banc-property-card-premium`
Branch: `codex/property-card-premium`
Verification correction commits: `e229731 fix: polish responsive property detail interactions`; `bf7b61a fix: activate iOS safe-area insets`

## Outcome

The property-detail release slice passes the automated feature gates, production compilation and the requested responsive browser matrix after two verified presentation defects were corrected:

1. The generic push-notification prompt could cover the property summary at 320px. It is now mounted inside the route-aware `SiteOverlays`, so it remains available on results pages but is absent from property details.
2. The desktop supporting-image grid occupied only the top half of the editorial gallery. Adding the missing `row-span-2` removed a measured 255.25px blank area; the supporting grid now fills the gallery height.

No landing media, dependencies, CRM/API/provider code or listing-card behavior changed.

## Automated verification

### Node tests

Command:

```bash
node --test lib/__tests__/*.test.ts
```

Final result: exit 0; 48 tests, 48 passed, 0 failed, 0 skipped.

The only output outside test results was the existing Node `MODULE_TYPELESS_PACKAGE_JSON` warning for TypeScript test files.

### Project lint

Command:

```bash
npm run lint
```

Result: exit 1 with the existing repository baseline of 376 findings: 133 errors and 243 warnings. These are spread across unrelated authentication, API, content, search and legacy component files. None was introduced by this property-detail slice.

Focused command:

```bash
npx eslint lib/property-detail-view.ts lib/__tests__/property-detail-view.test.ts components/property-detail components/FloorplanViewer.tsx components/mobile/SiteOverlays.tsx app/layout.tsx app/sales/properties/'[id]'/page.tsx app/lettings/properties/'[id]'/page.tsx
```

Final result: exit 0 with no errors or warnings.

### Production build

Command, with the main checkout's `.env.local` sourced into the process without printing or copying its values:

```bash
npm run build
```

Final result: exit 0. Next.js compiled, ran TypeScript and generated all 88 static pages. The route table contains both:

- `ƒ /sales/properties/[id]`
- `ƒ /lettings/properties/[id]`

The first sandboxed attempt could not reach Google Fonts. The permitted network rerun succeeded. Existing build warnings remain for the deprecated `middleware` convention and missing `metadataBase`.

### Local server

`npm run dev -- -p 3027` reached Ready, but the development-only error overlay reported an Auth.js `MissingSecret` because the shared environment lacks a local auth secret. UI verification therefore used the successful production build through `npm run start -- -p 3027`, with an ephemeral process-only `AUTH_SECRET` and `AUTH_TRUST_HOST=true`. No environment file was edited or committed.

## Routes under test

Results-to-detail navigation was exercised at every requested viewport for:

- Sales results: `/sales/properties`
- First sales result: `/sales/properties/BPGC869` — Georges Wood Road, Brookmans Park
- Lettings results: `/lettings/properties`
- First lettings result: `/lettings/properties/BPGC1607` — Nursery Gardens, Goffs Oak

At each width the first card resolved to the expected department-correct route before detail assertions ran.

## Responsive matrix

| Viewport | Sales and lettings result | Evidence |
|---|---|---|
| 320×700 | Pass | Single-column hero and summary; previous/next wrap; fixed viewing/call bar at y=627–700; all three media tabs 88×44; no page overflow; generic overlays absent; department-correct similar cards. |
| 375×812 | Pass | Fixed action bar at y=739–812; tabs approximately 106×44; no page overflow; features precede prose; both result cards open correct details. |
| 390×844 | Pass | Fixed action bar at y=771–844; tabs approximately 111×44; no page overflow; sales/lettings actions carry `BPGC869`/`BPGC1607`. |
| 768×1024 | Pass | Comfortable single column: computed content grid `712px`; one visible mobile/tablet gallery image; desktop contact card hidden; fixed action bar present; tabs 232×44; no overflow. |
| 1024×768 | Pass | Five-image editorial mosaic; computed content/contact grid `556px 340px`; desktop contact card visible and sticky with `top: 96px`; mobile action bar hidden; three-column similar cards; no overflow. |
| 1440×900 | Pass | Five-image mosaic at 1368×598.5; grid `820px 340px`; sticky desktop enquiry card; three-column similar cards; no overflow. |

For every entry, `document.documentElement.scrollWidth === document.documentElement.clientWidth` returned `true` for both departments.

## Interaction and accessibility checks

### Gallery

- Sales gallery wrapped `1 / 21 → 21 / 21 → 1 / 21` using visible arrow controls.
- Lettings gallery wrapped `1 / 26 → 26 / 26 → 1 / 26`.
- The fullscreen dialog opened, closed with Escape and returned focus to `View all photos`.
- A swipe-like Chrome drag was exercised at 320px. The connected Chrome backend does not inject touch events, so it did not trigger the component's touch-only handler. Source inspection confirms the mobile and fullscreen surfaces use `onTouchStart`/`onTouchEnd`, a 50px threshold and `touch-pan-y`; physical touch remains the only browser item not directly injectable in this environment.

### Save and share

- Saving each first property changed its accessible label to `Remove … from saved properties` for the correct title.
- Both share controls were present with the correct property title and invoked without a page error. The native share sheet is not observable through the connected browser backend. The passing Node suite separately verifies canonical department-aware share data, native sharing, fallback copying and non-cancellation fallback behavior.

### Cookies and route-specific actions

- The cookie panel was visible before choice and `Reject All` dismissed it.
- The property viewing/call bar rendered afterward with the exact property references in the mail links and the correct `Call the sales team`/`Call the lettings team` labels.
- On detail pages, mobile navigation, WhatsApp, chatbot and the push prompt were all not visible.
- On `/sales/properties`, mobile navigation, WhatsApp and chatbot remained visible, confirming suppression is detail-route-specific.

### Media tabs

- Floorplan, EPC and Map use 44px-minimum controls at every viewport.
- `ArrowRight` from Floorplan selected EPC and moved focus; pointer activation selected Map.
- Visible tab panels matched `aria-selected` and `aria-labelledby` state.
- Map text reads: `Map shows the postcode area, not the property's precise position.`
- The OpenStreetMap iframe used the approved postcode-area coordinates for `BPGC869` and had an accessible postcode-area title.

### Floorplan

- Zoom in changed the live label from 100% to 150%; reset/zoom controls had accessible names.
- The viewer uses a contained `overflow-auto` surface with `touch-pan-x touch-pan-y`; direct touch-pan injection was unavailable in this Chrome connection.
- Fullscreen opened, Escape closed it and focus returned to `View floorplan fullscreen`.
- Download link target was the local validated proxy. A real request returned `HTTP/1.1 200 OK`, `content-type: image/jpeg` and `content-disposition: attachment; filename="Floorplan-Floorplan1.jpg"`.

### Sticky desktop panel

- At 1440px and scrollY 1200, the contact card sat at top 96px while the header ended at 73px.
- At the page end, the sticky card remained inside its grid container and cleared the footer.

### Reduced motion

The Chrome backend exposes viewport emulation but not media-feature emulation, so a forced `prefers-reduced-motion` browser run was not available. Static verification confirms:

- `PropertyHeroGallery` uses Framer Motion's `useReducedMotion` to remove its image transitions.
- `app/globals.css` globally reduces animation/transition duration to `0.01ms`, limits iteration count to one and disables smooth scrolling under `prefers-reduced-motion: reduce`.
- The detail loading spinner uses `motion-reduce:animate-none`.

## Missing-data verification

A read-only local API audit inspected all 159 current live properties.

| Data gap | Live route | Result |
|---|---|---|
| Meaningless tenure | `/sales/properties/BPGC869` (`Unknown`) | No Tenure term rendered. |
| Missing EPC | `/sales/properties/BPGC911` | Tabs were Floorplan and Map only; Floorplan was active. |
| Missing floorplan and EPC | `/sales/properties/BPGC100` | Map was the only tab and was active; no blank panel rendered. |
| Missing coordinates | No live example among 159 | Pure helper tests cover incomplete coordinates and exclude Map. |
| Entirely empty media group | No live example among 159 | Pure helper tests return no tabs; component returns `null` when no active media exists. |

All three live missing-data pages were overflow-free at 390px. No placeholder tenure appeared.

## Defects fixed during Task 7

### Generic push prompt covering mobile details

Failure evidence: a 320×700 screenshot showed `Stay Updated on New Properties` covering the sales title and address. `PushNotificationPrompt` was mounted separately in `app/layout.tsx`, outside `SiteOverlays`' detail-route guard.

Correction: moved `PushNotificationPrompt` into `SiteOverlays`. Post-fix detail count for that heading was zero at 320px for both departments, while normal results-page overlays remained present.

### Blank lower half in desktop mosaic

Failure evidence at 1440px: the gallery height was 598.5px but the four supporting images ended 255.25px before the gallery bottom.

Correction: added `row-span-2` to the secondary gallery grid. Post-fix measurement was `blankBelowSecondary: 0`; the supporting images ended exactly at the gallery bottom at both desktop breakpoints.

## Screenshot notes

- 320×700 sales before correction: push prompt obscured the property summary.
- 320×700 sales after correction: hero, image actions, title and fixed viewing/call bar were unobstructed.
- 390×844 lettings: edge-to-edge hero, readable monthly rent, facts and department-correct sticky actions.
- 1440×900 before gallery correction: obvious white void beneath the four secondary images.
- 1440×900 after correction: balanced five-image editorial mosaic with no blank region.

## Remaining non-blocking concerns

- Repository-wide lint is not clean, but the verified feature scope is clean.
- The live feed contains no coordinate-less or entirely media-less property, so those two UI states are covered by pure tests and source-path verification rather than a current live record.
- The connected Chrome backend cannot emulate touch events or reduced-motion media features. Arrow, keyboard, pointer, focus, DOM overflow and source contracts were verified; a final physical iOS/Android smoke test remains advisable before launch.

## Review fix round 1 — acceptance, safe areas and sparse galleries

### Fresh `Accept All` path

The original cookie verification exercised `Reject All`. This review used the separate `127.0.0.1` origin so consent was genuinely fresh without reading or changing browser storage:

1. Opened `http://127.0.0.1:3028/sales/properties` at 320×700.
2. Confirmed the consent surface offered Manage, Reject and Accept.
3. Activated `Accept All`; the consent heading became invisible.
4. Opened the first result, `http://127.0.0.1:3028/sales/properties/BPGC869`.

The detail action bar occupied y=627–700 (73px) and its two actions occupied y=640–688 (48px each). Both `Request a viewing` and `Call the sales team` were fully visible, the consent UI remained absent, and the root scroll width (312px) did not exceed the 320px viewport. The screenshot showed the hero/title and both actions unobstructed. Together with the prior `Reject All` run, both consent branches are now covered.

### Safe-area activation defect: RED → GREEN

Before correction, the production DOM generated:

```text
width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes
```

The app already used `env(safe-area-inset-*)`, but without `viewport-fit=cover` iOS cannot extend the layout into display-cutout areas, so those protections were not fully activated. The minimal correction added `viewportFit: "cover"` to the existing typed Next.js viewport export in `app/layout.tsx`.

After rebuilding and reloading the same 320×700 detail, the production DOM generated:

```text
width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover, user-scalable=yes
```

The action-bar dimensions remained 73px overall with 48px actions and no horizontal overflow after the change.

The connected Chrome backend exposes viewport sizing but no display-cutout or safe-area feature override, so it cannot make desktop Chrome return non-zero values for the CSS environment variables. The strongest supported evidence combines the activated production viewport metadata, measured zero-inset geometry and the exact shipped CSS calculations:

- Mobile property bar: `safe-area-pb` adds `env(safe-area-inset-bottom)` below the existing 1px border + 12px top padding + 48px actions + 12px bottom padding. The page-end spacer is `calc(8rem + env(safe-area-inset-bottom))`.
- Gallery fullscreen: close uses top/right inset + 16px; arrows use left/right inset + 12px on mobile; the counter uses bottom inset + 16px. Browser measurements confirmed all three buttons remain 48×48px.
- Floorplan fullscreen: dialog padding is each corresponding inset + 12px on mobile. Browser measurements confirmed zoom out, zoom in and close remain 44×44px.

For a non-zero portrait scenario `{top:47,right:0,bottom:34,left:0}`, the shipped formulas produce a 107px action bar, preserve 48px actions, leave 46px below the actions, and produce a 162px page-end spacer (55px more than the bar). Gallery close starts 63px from the top and the counter clears the bottom by 50px; floorplan padding becomes 59px top and 46px bottom while its controls stay 44px. For a landscape scenario `{top:0,right:44,bottom:21,left:44}`, gallery arrows clear each side by 56px and floorplan side padding becomes 56px. A final physical notched-device smoke test remains the only unavailable evidence.

### Live 2/3/4-image gallery inventory

A fresh read-only request to both public property APIs returned 353 live listings. Image-count distribution included one 3-image record and two 4-image records, but no 2-image record.

- 3 images: `/sales/properties/BPGC100` at 1440×900 rendered all three images: a 794.66×598.5 primary and two 565.33×295.25 supporting images stacked to the same 598.5px bottom edge. No horizontal overflow was present. Screenshot showed a balanced primary + two-row mosaic with no blank lower region.
- 4 images: `/sales/properties/BPGC1237` at 1440×900 rendered all four images: a 794.66×598.5 primary, two 278.66×295.25 images above one 565.33×295.25 full-width supporting image. Every image ended inside the 598.5px gallery and no horizontal overflow was present. Screenshot showed the intended 1+2+1 mosaic with no blank lower region.
- 2 images: current inventory count was zero, so this state was not manufactured for visual testing. Source geometry remains a full-height 8/4-column split (`grid-cols-1 grid-rows-1`) and is recorded as the remaining minor evidence limit.

### Review-round commands and results

```text
npx eslint app/layout.tsx components/property-detail/PropertyContactActions.tsx components/property-detail/PropertyHeroGallery.tsx components/FloorplanViewer.tsx
  exit 0, no findings

node --test lib/__tests__/*.test.ts
  48 passed, 0 failed (existing package-module warnings only)

git diff --check
  exit 0

npm run build
  first sandboxed attempt: failed only because Google Fonts network access was blocked
  approved network rerun: exit 0; compiled, TypeScript checked, 88/88 static pages generated
```

No dependencies, environment files, listing data or unrelated source were changed.
