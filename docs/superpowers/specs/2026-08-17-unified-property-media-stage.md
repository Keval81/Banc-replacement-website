# Unified Property Media Stage

**Status:** Approved design, amended for EPC placement and labelled satellite
**Date:** 2026-08-17
**Branch:** `codex/property-card-premium`
**Foundation:** `docs/superpowers/specs/2026-08-16-premium-property-detail-experience.md`

## Objective

Refine Banc's shared sales and lettings property-detail page so its photography,
floorplan and location media feel like one premium, coherent experience, while
the EPC remains easy to read as supporting property information.

The existing detail implementation is functional and remains the foundation. This
slice improves visual hierarchy and media discovery without changing the CRM,
property routes, enquiry flow, listing-card design or production deployment.

## Problems to solve

1. Photography currently occupies the hero while Floorplan, EPC and Map appear as
   a separate tab system much farther down the page. The two systems feel
   disconnected even though they describe the same property.
2. The mobile breadcrumb gives a long address equal visual weight to primary page
   content, producing a cramped and unpolished first screen.
3. The current OpenStreetMap panel is functional but lacks the familiar satellite,
   tilt and Street View tools buyers expect from Google Maps.
4. Adding richer location media must not imply that postcode-area coordinates are
   the property's exact position.

## Approved experience

### One media stage

The top of the page becomes a single `PropertyMediaStage` with an availability-
aware media rail:

- `Photos {count}`
- `Floorplan`
- `Map`

Photos are the default selection when the property has real images. Selecting a
tab replaces the content inside the same media frame; it does not scroll the page
or open a second media section. Only tabs backed by real property data are shown.
When Photos is unavailable, the first available mode is selected. When no property
media exists at all, the stage renders the neutral `No photos available` state
without an empty media rail.

The existing lower `PropertyMediaTabs` section is removed after its floorplan and
map responsibilities have moved into the unified stage. Property features, EPC
and description then follow the summary without a duplicate media destination.

### Photos

- Mobile retains a full-width swipeable gallery, counter, previous/next controls
  and fullscreen lightbox.
- Desktop retains the editorial image mosaic and fullscreen lightbox.
- Empty galleries never invent a property image. The neutral `No photos available`
  state is used when the property has no other media to show.
- Returning from another media mode preserves the current photo index during the
  same property view.
- Navigating to a different property resets the selected mode using the availability
  rule above and resets the photo index to the first image.

### Floorplan

- Reuse the existing `FloorplanViewer` inside the shared media frame.
- Retain zoom, reset, download, multiple-plan navigation and fullscreen behavior.
- The inline viewer remains contained and touch-friendly; fullscreen remains the
  path for detailed inspection on small screens.

### EPC

- Reuse the current rating treatment, certificate image and fullscreen dialog.
- Present EPC as a dedicated `Energy performance` section after `At a glance` and
  before `About this property`, rather than as a media-stage tab.
- Render the section only when the property supplies a valid certificate URL.
- Keep the certificate contained, lazy-loaded and expandable for detailed review.

### Google location view

The Map mode uses the existing `@react-google-maps/api` dependency and the existing
`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. No package is added.

Approved map behavior:

- Labelled satellite (`hybrid`) is the default map type so roads and place names
  remain visible over the imagery.
- Google's standard map-type control remains available for switching to Road.
- Google's standard Street View Pegman remains enabled; no custom Street View CTA
  or separate branded Street View experience is added.
- Google's standard rotate/tilt controls and gesture interactions are enabled when
  supported by the selected imagery, zoom level, device and browser.
- This is the lightweight Maps JavaScript 3D treatment, not the separately billed
  photorealistic `Map3DElement`/Immersive Maps product.
- If Google cannot supply tilted imagery, the map falls back naturally to a flat
  satellite view.
- The map is mounted only after the user selects Map, avoiding an API load for
  visitors who only browse photos or property copy.

For vector tilt/rotation in production, Banc should provide a Google Cloud map ID
through `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`. When a production map ID is absent, the
map remains a standard satellite map without promising 3D controls.

The visible disclosure must read `Approximate postcode area` with supporting copy
that the exact property position is not shown. Do not use an exact-house marker,
pin label or copy that contradicts this disclosure.

### Map failure behavior

The location mode must never become a blank frame:

1. If the Google API key is missing, Google fails to load, or the browser cannot
   initialize the map, render the existing OpenStreetMap postcode-area embed.
2. Preserve the same approximate-location disclosure in the fallback.
3. If coordinates are incomplete or invalid, omit the Map tab entirely.

### Navigation refinement

Mobile replaces the full breadcrumb trail with a single department-correct back
link:

- `Back to properties`
- destination: `/sales/properties` or `/lettings/properties`

Desktop retains a restrained breadcrumb with Home, department results and the
short property title. It must not repeat the full postal address or compete with
the property heading.

Canonical sales/lettings route handling remains unchanged.

## Responsive presentation

### Mobile: 320px–767px

- Back link sits between the fixed header and media rail.
- Media rail fits within the viewport with three equal controls when all modes are
  present; labels may use `Plan` visually while retaining the accessible name
  `Floorplan`.
- Selected mode is visually unmistakable and keyboard state remains available to
  assistive technology.
- Media frame remains edge-to-edge; property summary remains padded.
- All controls are at least 44px and do not depend on hover.
- Google controls must remain usable without colliding with the fixed enquiry bar.

### Tablet: 768px–1023px

- Use the same single-stage interaction at a wider contained width.
- Keep the mobile/tablet single-image photo presentation rather than forcing a
  narrow editorial mosaic.

### Desktop: 1024px+

- Media rail aligns with the hero width.
- Photos use the existing editorial mosaic.
- Floorplan and Map use the same premium outer frame and corner treatment.
- EPC remains a dedicated content section within the main property column.
- Property summary and sticky contact panel retain their current balanced layout.

## Component architecture

### `PropertyMediaStage`

New client component responsible for:

- deriving available media modes;
- owning the active media mode;
- resetting mode state when property identity changes;
- rendering the shared media rail and stable media frame;
- composing the existing gallery, floorplan and location viewers.

It receives the live property media fields and does not fetch property data.

### `PropertyHeroGallery`

Retains photo navigation and fullscreen responsibilities. It becomes the Photos
panel inside `PropertyMediaStage`; its photo state does not own cross-media state.

### `PropertyEpcViewer`

Extract the current EPC presentation from `PropertyMediaTabs` into a focused viewer
that can be composed by the property overview after `At a glance`.

### `GooglePropertyMap`

New focused client component responsible for:

- on-demand Maps JavaScript initialization;
- labelled-satellite (`hybrid`) default configuration;
- native map-type, Street View and supported rotate/tilt controls;
- postcode-area centering and disclosure;
- invoking the OpenStreetMap fallback when Google fails.

### Shared detail page

`app/sales/properties/[id]/page.tsx` continues to own loading, canonical department
routing and page composition. It replaces the separate gallery and lower media tabs
with `PropertyMediaStage`, and renders the responsive breadcrumb refinement.

The lettings route continues to reuse the shared sales implementation.

## Data and privacy rules

- Use only the existing live `latitude` and `longitude` values already approved for
  postcode-area mapping.
- Loading Google Maps sends those approximate coordinates to Google only after Map
  is selected.
- Retain the visible postcode-area disclosure.
- Do not geocode the full address, request device location or introduce a precise
  property coordinate.
- Update cookie/privacy copy only if the existing Google Maps disclosure does not
  accurately describe this on-demand property-map usage.

## Accessibility and interaction

- The media rail uses ARIA tab semantics with correct selected state, roving
  keyboard focus and matching tabpanel relationships.
- Left and Right Arrow move between available modes; Home and End select the first
  and last available modes.
- Mode changes do not unexpectedly move the viewport.
- Inactive Floorplan and Map content is unmounted to avoid hidden interactions
  and unnecessary network loads; stable empty tabpanel shells may remain for ARIA
  relationships.
- Focus rings retain the branch's verified contrast treatments.
- Gallery, floorplan and EPC fullscreen dialogs continue to trap focus, close with
  Escape and restore focus to their triggers.
- Motion continues to respect the global reduced-motion configuration.

## Loading and error states

- Media rail space is stable while an active viewer initializes.
- Google loading uses a quiet contained status rather than a page-blocking spinner.
- Google errors are not silently swallowed: the fallback is shown with accessible
  copy indicating that a fallback map is being used.
- No error state blocks Photos, Floorplan, EPC, property copy or enquiry actions.

## Testing and verification

Follow TDD before implementation changes.

### Pure behavior tests

- Photos appear first when available.
- Floorplan and Map appear only with valid live backing data; EPC never becomes a
  media-stage mode.
- The first available mode is selected when Photos are unavailable.
- Property identity changes reset mode selection.
- Map configuration selects labelled satellite and enables native map type, Street View and
  supported rotate/tilt controls.
- Missing Google configuration selects the OpenStreetMap fallback path.
- Department-correct back-link data is generated for sales and lettings.

### Focused automated checks

- Run the complete Node test suite.
- Run ESLint on every changed source and test file.
- Run the strict production build.
- Add no new dependency or schema migration.

### Browser verification

Verify sales and lettings details at 320x700, 375x812, 390x844, 768x1024,
1024x768 and 1440x900:

- no horizontal overflow;
- Photos/Floorplan/Map switch within one stable stage;
- EPC data and certificate appear after `At a glance` and before `About this property`;
- unavailable modes are absent;
- photo swipe/arrows and all fullscreen dialogs still work;
- Google starts in labelled-satellite mode only after Map is selected;
- native Road, Street View and available tilt/rotate behavior works;
- flat satellite fallback remains usable where 3D imagery is unavailable;
- OpenStreetMap fallback works when Google is unavailable;
- the approximate-location disclosure remains visible;
- mobile back link and desktop breadcrumb are department-correct;
- fixed enquiry actions do not cover media controls or map controls.

## Out of scope

- Photorealistic `Map3DElement` or Immersive Maps billing.
- Aerial View video.
- Custom Street View UI or a standalone panorama viewer.
- Exact-address geocoding or precise-property markers.
- Search-results map redesign.
- CRM, schema or property-route changes.
- Listing-card redesign.
- Production deployment or merging this branch.

## Acceptance criteria

- Buyers can discover every available visual property medium from the top of the page.
- Photography remains the default and strongest visual element.
- Floorplan and Map feel like modes of one premium viewer, while EPC reads as
  supporting property information in the main content flow.
- Mobile navigation no longer displays a cramped full-address breadcrumb.
- Map opens in labelled satellite view, exposes Google's standard Road and Street View
  controls, and enables lightweight 3D tilt/rotation where available.
- Location copy never implies an exact property position.
- Missing media, Google configuration or 3D imagery degrades gracefully.
- Sales and lettings routing, enquiry actions, accessibility and responsive
  behavior remain correct.
- Automated checks and the production build pass before responsive browser review.
- No merge or production deployment occurs without separate approval.
