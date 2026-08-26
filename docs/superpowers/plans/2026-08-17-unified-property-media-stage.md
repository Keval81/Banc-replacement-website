# Unified Property Media Stage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the split property gallery and lower supporting-media section with one premium, availability-aware media stage containing Photos, Floorplan, EPC and a lazy Google satellite map.

**Architecture:** Extend the existing pure property-detail view model with media-mode and navigation rules, then compose the current gallery and floorplan viewer with extracted EPC and new Google map viewers inside `PropertyMediaStage`. The shared sales page continues to own fetching, canonical department routing and identity resets; the lettings route continues to reuse it. Google Maps loads only when Map is selected and falls back to the existing OpenStreetMap embed without adding a dependency.

**Tech Stack:** Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, Node test runner, Radix Dialog, `@react-google-maps/api` 2.20.8, Lucide React.

**Spec:** `docs/superpowers/specs/2026-08-17-unified-property-media-stage.md`

## Global Constraints

- Do not add a dependency, database migration or CRM/API change.
- Photos remain the default when real images exist; otherwise select the first real medium.
- Render no media tab without live backing data and never invent a property image.
- Satellite is the Google map default; use Google's native map type, Street View, rotate and tilt controls.
- Do not use photorealistic `Map3DElement`, Immersive Maps or Aerial View.
- Treat coordinates as an approximate postcode area; do not geocode the full address or render an exact-house marker.
- Load Google Maps only after Map is selected; retain OpenStreetMap as the no-key/load-error fallback.
- All custom touch targets remain at least 44px, tabs retain full keyboard behavior, and fullscreen focus behavior remains intact.
- Sales and lettings continue to share one detail implementation with department-correct navigation and actions.
- Verify from exactly 320px upward with no page-level horizontal overflow.
- Do not merge or deploy to production.

---

## File Structure

| Path | Responsibility |
|---|---|
| `lib/property-detail-view.ts` | Pure media-mode availability, tab navigation and department back-link rules. |
| `lib/__tests__/property-detail-view.test.ts` | TDD coverage for media ordering, empty states, navigation and sales/lettings back links. |
| `lib/property-map-view.ts` | Provider choice, Google control contract, map-ID cleanup and OpenStreetMap fallback URL construction. |
| `lib/__tests__/property-map-view.test.ts` | TDD coverage for Google configuration and fallback behavior. |
| `components/property-detail/GooglePropertyMap.tsx` | Lazy Google satellite map, standard Google controls, disclosure and OpenStreetMap fallback. |
| `components/property-detail/PropertyEpcViewer.tsx` | Existing EPC rating, contained certificate and fullscreen dialog extracted as a reusable viewer. |
| `components/property-detail/PropertyMediaStage.tsx` | Availability-aware media rail, active-mode state and composition of Photos/Floorplan/EPC/Map. |
| `components/property-detail/PropertyHeroGallery.tsx` | Existing photo state and fullscreen gallery; remains the Photos panel. |
| `components/property-detail/PropertyMediaTabs.tsx` | Removed after the unified stage is composed and all imports are gone. |
| `app/sales/properties/[id]/page.tsx` | Mounts the unified stage and renders responsive mobile/desktop navigation. |
| `app/lettings/properties/[id]/page.tsx` | Continues to re-export the shared sales implementation. |
| `app/cookies/page.tsx` | Broadens the existing Google Maps disclosure to include property pages. |
| `.env.example` | Documents the existing Google Maps API key and optional production map ID names without values. |

---

### Task 1: Define Unified Media Presentation Rules

**Files:**
- Modify: `lib/property-detail-view.ts:1-102`
- Modify: `lib/__tests__/property-detail-view.test.ts:1-130`

**Interfaces:**
- Consumes: Existing `PropertyMediaAvailability`, `getAvailablePropertyMedia()` and department values `"sales" | "lettings"`.
- Produces: `PropertyMediaMode`, `PropertyMediaStageAvailability`, `getAvailablePropertyMediaModes(input): PropertyMediaMode[]`, and `getPropertyResultsBackLink(department): PropertyResultsBackLink`.

- [ ] **Step 1: Write failing media-order and navigation-copy tests**

Extend the existing import list from `../property-detail-view.ts` with
`getAvailablePropertyMediaModes` and `getPropertyResultsBackLink`, then add these
tests before production code:

```ts
test("orders only live property media with photos first", () => {
  assert.deepEqual(
    getAvailablePropertyMediaModes({
      images: [{ id: "photo-1" }],
      floorplans: [{ id: "floorplan-1" }],
      epcImageUrl: "https://example.com/epc.jpg",
      latitude: 51.7252,
      longitude: -0.2049,
    }),
    ["photos", "floorplan", "epc", "map"]
  );
});

test("selects the first real non-photo medium when photos are unavailable", () => {
  assert.deepEqual(
    getAvailablePropertyMediaModes({
      images: [],
      floorplans: [{ id: "floorplan-1" }],
      epcImageUrl: "",
      latitude: 51.7252,
      longitude: -0.2049,
    }),
    ["floorplan", "map"]
  );
});

test("returns no media modes when the property has no media", () => {
  assert.deepEqual(
    getAvailablePropertyMediaModes({
      images: [],
      floorplans: [],
      epcImageUrl: "",
    }),
    []
  );
});

test("builds department-correct property results back links", () => {
  assert.deepEqual(getPropertyResultsBackLink("sales"), {
    href: "/sales/properties",
    label: "Back to properties",
  });
  assert.deepEqual(getPropertyResultsBackLink("lettings"), {
    href: "/lettings/properties",
    label: "Back to properties",
  });
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/property-detail-view.test.ts
```

Expected: FAIL because `getAvailablePropertyMediaModes` and `getPropertyResultsBackLink` are not exported.

- [ ] **Step 3: Implement the minimal presentation rules**

Add these interfaces and functions to `lib/property-detail-view.ts` while leaving existing helpers unchanged:

```ts
export type PropertyMediaMode = "photos" | PropertyMediaTabId;

export interface PropertyMediaStageAvailability extends PropertyMediaAvailability {
  images: ReadonlyArray<unknown>;
}

export interface PropertyResultsBackLink {
  href: "/sales/properties" | "/lettings/properties";
  label: "Back to properties";
}

export function getAvailablePropertyMediaModes({
  images,
  ...supportingMedia
}: PropertyMediaStageAvailability): PropertyMediaMode[] {
  const modes: PropertyMediaMode[] = [];
  if (images.length > 0) modes.push("photos");
  modes.push(...getAvailablePropertyMedia(supportingMedia));
  return modes;
}

export function getPropertyResultsBackLink(
  department: "sales" | "lettings"
): PropertyResultsBackLink {
  return {
    href: `/${department}/properties`,
    label: "Back to properties",
  };
}
```

- [ ] **Step 4: Run focused and existing property view-model tests**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/property-detail-view.test.ts lib/__tests__/property-view.test.ts
```

Expected: PASS with zero failures. Existing typeless-package warnings, if emitted, are non-failing baseline output.

- [ ] **Step 5: Check the focused diff**

Run:

```bash
git diff --check
```

Expected: exit 0 with no whitespace findings.

- [ ] **Step 6: Commit the view-model boundary**

```bash
git add lib/property-detail-view.ts lib/__tests__/property-detail-view.test.ts
git commit -m "test: define unified property media rules"
```

---

### Task 2: Add the Lazy Google Satellite Map and Fallback

**Files:**
- Create: `lib/property-map-view.ts`
- Create: `lib/__tests__/property-map-view.test.ts`
- Create: `components/property-detail/GooglePropertyMap.tsx`
- Modify: `.env.example`
- Modify: `app/cookies/page.tsx:160-175`

**Interfaces:**
- Consumes: Existing `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, optional `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`, `@react-google-maps/api`, and finite postcode-area latitude/longitude.
- Produces: `PropertyMapPresentation`, `getPropertyMapPresentation(apiKey, mapId)`, `getOpenStreetMapEmbedUrl(latitude, longitude)`, and `GooglePropertyMap({ latitude, longitude, postcode })`.

- [ ] **Step 1: Write failing map-presentation tests**

Create `lib/__tests__/property-map-view.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getOpenStreetMapEmbedUrl,
  getPropertyMapPresentation,
} from "../property-map-view.ts";

test("uses Google satellite with standard controls when an API key exists", () => {
  assert.deepEqual(getPropertyMapPresentation(" maps-key ", " map-id "), {
    provider: "google",
    mapId: "map-id",
    controls: {
      defaultMapType: "satellite",
      mapTypeControl: true,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true,
      zoomControl: true,
      keyboardShortcuts: true,
      gestureHandling: "cooperative",
      heading: 0,
      tilt: 45,
    },
  });
});

test("keeps Google satellite usable without a production map ID", () => {
  const presentation = getPropertyMapPresentation("maps-key", "   ");
  assert.equal(presentation.provider, "google");
  if (presentation.provider === "google") {
    assert.equal(presentation.mapId, undefined);
    assert.equal(presentation.controls.defaultMapType, "satellite");
  }
});

test("selects OpenStreetMap when the Google key is absent", () => {
  assert.deepEqual(getPropertyMapPresentation("", "map-id"), {
    provider: "openstreetmap",
  });
});

test("builds an OpenStreetMap postcode-area embed around live coordinates", () => {
  const url = new URL(getOpenStreetMapEmbedUrl(51.7252, -0.2049));
  assert.equal(url.origin, "https://www.openstreetmap.org");
  assert.equal(url.pathname, "/export/embed.html");
  assert.equal(url.searchParams.get("layer"), "mapnik");
  assert.equal(url.searchParams.get("marker"), "51.7252,-0.2049");
  assert.equal(url.searchParams.get("bbox"), "-0.2169,51.7192,-0.1929,51.7312");
});
```

- [ ] **Step 2: Run the map tests and confirm RED**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/property-map-view.test.ts
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `lib/property-map-view.ts`.

- [ ] **Step 3: Implement the pure provider and control contract**

Create `lib/property-map-view.ts`:

```ts
export interface PropertyMapControls {
  defaultMapType: "satellite";
  mapTypeControl: true;
  streetViewControl: true;
  rotateControl: true;
  fullscreenControl: true;
  zoomControl: true;
  keyboardShortcuts: true;
  gestureHandling: "cooperative";
  heading: 0;
  tilt: 45;
}

export type PropertyMapPresentation =
  | { provider: "openstreetmap" }
  | {
      provider: "google";
      mapId?: string;
      controls: PropertyMapControls;
    };

const GOOGLE_CONTROLS: PropertyMapControls = {
  defaultMapType: "satellite",
  mapTypeControl: true,
  streetViewControl: true,
  rotateControl: true,
  fullscreenControl: true,
  zoomControl: true,
  keyboardShortcuts: true,
  gestureHandling: "cooperative",
  heading: 0,
  tilt: 45,
};

export function getPropertyMapPresentation(
  apiKey: string | undefined,
  mapId: string | undefined
): PropertyMapPresentation {
  if (!apiKey?.trim()) return { provider: "openstreetmap" };
  const cleanedMapId = mapId?.trim() || undefined;
  return {
    provider: "google",
    ...(cleanedMapId ? { mapId: cleanedMapId } : {}),
    controls: GOOGLE_CONTROLS,
  };
}

export function getOpenStreetMapEmbedUrl(
  latitude: number,
  longitude: number
): string {
  const params = new URLSearchParams({
    bbox: `${longitude - 0.012},${latitude - 0.006},${longitude + 0.012},${latitude + 0.006}`,
    layer: "mapnik",
    marker: `${latitude},${longitude}`,
  });
  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}
```

- [ ] **Step 4: Run the map tests and confirm GREEN**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/property-map-view.test.ts
```

Expected: all four tests PASS.

- [ ] **Step 5: Create the Google and OpenStreetMap viewer**

Create `components/property-detail/GooglePropertyMap.tsx` with these exact boundaries:

```tsx
"use client";

import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import * as React from "react";

import {
  getOpenStreetMapEmbedUrl,
  getPropertyMapPresentation,
  type PropertyMapPresentation,
} from "@/lib/property-map-view";

interface GooglePropertyMapProps {
  latitude: number;
  longitude: number;
  postcode: string;
}

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

export function GooglePropertyMap({
  latitude,
  longitude,
  postcode,
}: GooglePropertyMapProps): React.ReactElement {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const presentation = getPropertyMapPresentation(
    apiKey,
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID
  );

  if (presentation.provider === "openstreetmap") {
    return (
      <OpenStreetMapPropertyMap
        latitude={latitude}
        longitude={longitude}
        postcode={postcode}
        notice="Satellite map unavailable. Showing a standard postcode-area map."
      />
    );
  }

  return (
    <GooglePropertyMapLoader
      apiKey={apiKey?.trim() ?? ""}
      latitude={latitude}
      longitude={longitude}
      postcode={postcode}
      presentation={presentation}
    />
  );
}

function GooglePropertyMapLoader({
  apiKey,
  latitude,
  longitude,
  postcode,
  presentation,
}: GooglePropertyMapProps & {
  apiKey: string;
  presentation: Extract<PropertyMapPresentation, { provider: "google" }>;
}): React.ReactElement {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "banc-google-maps",
    googleMapsApiKey: apiKey,
  });

  if (loadError) {
    return (
      <OpenStreetMapPropertyMap
        latitude={latitude}
        longitude={longitude}
        postcode={postcode}
        notice="Google Maps could not load. Showing a standard postcode-area map."
      />
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-banc-grey-pale sm:aspect-[16/9]" role="status">
        <p className="text-sm text-banc-muted-readable">Loading satellite map…</p>
      </div>
    );
  }

  const { controls } = presentation;
  const options: google.maps.MapOptions = {
    mapId: presentation.mapId,
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    mapTypeControl: controls.mapTypeControl,
    streetViewControl: controls.streetViewControl,
    rotateControl: controls.rotateControl,
    fullscreenControl: controls.fullscreenControl,
    zoomControl: controls.zoomControl,
    keyboardShortcuts: controls.keyboardShortcuts,
    gestureHandling: controls.gestureHandling,
    heading: controls.heading,
    tilt: controls.tilt,
  };

  return (
    <MapFrame postcode={postcode}>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={{ lat: latitude, lng: longitude }}
        zoom={18}
        options={options}
        onLoad={(map) => {
          map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
          map.setHeading(controls.heading);
          map.setTilt(controls.tilt);
        }}
      />
    </MapFrame>
  );
}

function OpenStreetMapPropertyMap({
  latitude,
  longitude,
  postcode,
  notice,
}: GooglePropertyMapProps & { notice: string }): React.ReactElement {
  return (
    <div>
      <p className="mb-3 text-sm text-banc-muted-readable" role="status">{notice}</p>
      <MapFrame postcode={postcode}>
        <iframe
          title={`Map of the ${postcode} postcode area`}
          src={getOpenStreetMapEmbedUrl(latitude, longitude)}
          className="h-full w-full border-0"
          loading="lazy"
        />
      </MapFrame>
    </div>
  );
}

function MapFrame({
  postcode,
  children,
}: {
  postcode: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div>
      <div className="aspect-[4/3] overflow-hidden rounded-lg border border-banc-grey/20 bg-banc-grey-pale sm:aspect-[16/9]">
        {children}
      </div>
      <div className="mt-3 rounded-lg bg-banc-grey-pale px-4 py-3">
        <p className="text-sm font-semibold text-banc-dark">Approximate postcode area</p>
        <p className="mt-1 text-sm text-banc-muted-readable">
          Map shows the {postcode} postcode area, not the property&apos;s exact position.
        </p>
      </div>
    </div>
  );
}
```

Do not add a marker. Google must use its native map type, Street View Pegman, rotate, zoom and fullscreen controls.

- [ ] **Step 6: Document map configuration without adding secrets**

Add these empty keys to `.env.example`:

```dotenv
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=
```

Change the existing Google Maps sentence in `app/cookies/page.tsx` from contact-only wording to:

```tsx
<li>
  <strong className="text-[#1A1917]">Google Maps:</strong> Used for interactive maps on our contact and property pages
</li>
```

- [ ] **Step 7: Run focused tests and lint**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/property-map-view.test.ts
npx eslint lib/property-map-view.ts lib/__tests__/property-map-view.test.ts components/property-detail/GooglePropertyMap.tsx app/cookies/page.tsx
git diff --check
```

Expected: tests PASS, ESLint exits 0, and whitespace check exits 0.

- [ ] **Step 8: Commit the map boundary**

```bash
git add .env.example app/cookies/page.tsx lib/property-map-view.ts lib/__tests__/property-map-view.test.ts components/property-detail/GooglePropertyMap.tsx
git commit -m "feat: add lazy Google property map"
```

---

### Task 3: Build the Unified Media Stage

**Files:**
- Modify: `lib/property-detail-view.ts`
- Modify: `lib/__tests__/property-detail-view.test.ts`
- Create: `components/property-detail/PropertyEpcViewer.tsx`
- Create: `components/property-detail/PropertyMediaStage.tsx`
- Modify: `components/property-detail/PropertyMediaTabs.tsx`

**Interfaces:**
- Consumes: `getAvailablePropertyMediaModes()`, `PropertyMediaMode`, `PropertyHeroGallery`, `FloorplanViewer`, `GooglePropertyMap`, and live `LivePropertyDetail` media fields.
- Produces: `PropertyMediaNavigationKey`, `getNextPropertyMediaMode(modes, current, key)`, `PropertyEpcViewer({ epcImageUrl, epcRating })`, and `PropertyMediaStage({ property })`.

- [ ] **Step 1: Write failing keyboard-navigation tests**

Extend the existing import list from `../property-detail-view.ts` with
`getNextPropertyMediaMode`, then add this test:

```ts
test("moves, wraps and jumps through available property media modes", () => {
  const modes = ["photos", "floorplan", "epc", "map"] as const;
  assert.equal(getNextPropertyMediaMode(modes, "photos", "ArrowLeft"), "map");
  assert.equal(getNextPropertyMediaMode(modes, "map", "ArrowRight"), "photos");
  assert.equal(getNextPropertyMediaMode(modes, "epc", "Home"), "photos");
  assert.equal(getNextPropertyMediaMode(modes, "floorplan", "End"), "map");
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/property-detail-view.test.ts
```

Expected: FAIL because `getNextPropertyMediaMode` is not exported.

- [ ] **Step 3: Implement the keyboard rule**

Add to `lib/property-detail-view.ts`:

```ts
export type PropertyMediaNavigationKey = "ArrowLeft" | "ArrowRight" | "Home" | "End";

export function getNextPropertyMediaMode(
  modes: ReadonlyArray<PropertyMediaMode>,
  current: PropertyMediaMode,
  key: PropertyMediaNavigationKey
): PropertyMediaMode {
  if (modes.length === 0) return current;
  if (key === "Home") return modes[0];
  if (key === "End") return modes[modes.length - 1];
  const currentIndex = Math.max(0, modes.indexOf(current));
  const delta = key === "ArrowRight" ? 1 : -1;
  return modes[(currentIndex + delta + modes.length) % modes.length];
}
```

- [ ] **Step 4: Run the focused test and confirm GREEN**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/property-detail-view.test.ts
```

Expected: all property-detail view tests PASS.

- [ ] **Step 5: Extract the EPC viewer without changing behavior**

Create `components/property-detail/PropertyEpcViewer.tsx`. Move the current
`EpcPanel` behavior out of `PropertyMediaTabs.tsx` and use this complete module
boundary:

```tsx
"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Maximize2, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const EPC_RATING_COLOURS: Record<string, string> = {
  A: "bg-emerald-100",
  B: "bg-emerald-100",
  C: "bg-lime-100",
  D: "bg-yellow-100",
  E: "bg-orange-100",
  F: "bg-orange-200",
  G: "bg-red-100",
};

interface PropertyEpcViewerProps {
  epcImageUrl: string;
  epcRating?: string;
}

export function PropertyEpcViewer({
  epcImageUrl,
  epcRating,
}: PropertyEpcViewerProps): React.ReactElement {
  const rating = epcRating?.trim().toUpperCase();
  const certificateAlt = `Energy performance certificate graph${
    rating ? `, current rating ${rating}` : ""
  }`;

  return (
    <Dialog.Root>
      <div className="rounded-lg border border-banc-grey/20 bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          {rating && (
            <span
              className={cn(
                "inline-flex h-12 min-w-12 items-center justify-center rounded-md px-3 text-lg font-bold text-banc-dark",
                EPC_RATING_COLOURS[rating] ?? "bg-banc-grey-pale"
              )}
              aria-label={`Energy performance rating ${rating}`}
            >
              {rating}
            </span>
          )}
          <p className="max-w-xl text-sm text-banc-dark">
            Energy efficiency runs from A (most efficient) to G (least efficient).
          </p>
        </div>
        <Dialog.Trigger asChild>
          <button
            type="button"
            aria-label="Expand EPC certificate"
            className="group relative mt-5 flex min-h-11 w-full cursor-zoom-in justify-center overflow-hidden rounded-md bg-banc-grey-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-banc-focus"
          >
            {/* The EPC URL is supplied by the property API, so Next/Image cannot know its dimensions. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={epcImageUrl}
              alt={certificateAlt}
              loading="lazy"
              className="max-h-[620px] w-full object-contain"
            />
            <span className="absolute bottom-3 right-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-banc-dark px-4 text-sm font-medium text-white shadow-lg">
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
              Expand certificate
            </span>
          </button>
        </Dialog.Trigger>
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/95" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[101] flex items-center justify-center overflow-auto bg-black p-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pl-[calc(env(safe-area-inset-left)+0.75rem)] pr-[calc(env(safe-area-inset-right)+0.75rem)]"
        >
          <Dialog.Title className="sr-only">Energy performance certificate</Dialog.Title>
          {/* The EPC URL is supplied by the property API, so Next/Image cannot know its dimensions. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={epcImageUrl} alt={certificateAlt} className="max-h-full max-w-full object-contain" />
          <Dialog.Close
            type="button"
            aria-label="Close EPC certificate"
            className="absolute right-[calc(env(safe-area-inset-right)+1rem)] top-[calc(env(safe-area-inset-top)+1rem)] flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-black/85 text-white shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

Retain the focused `@next/next/no-img-element` suppressions on the two remote EPC `<img>` elements because those URLs are lazy, active-only CRM media and are not supported by the configured Next image pipeline.

- [ ] **Step 6: Create the identity-resetting media stage**

Create `components/property-detail/PropertyMediaStage.tsx` with this state and rendering contract:

```tsx
"use client";

import * as React from "react";

import { FloorplanViewer } from "@/components/FloorplanViewer";
import { GooglePropertyMap } from "@/components/property-detail/GooglePropertyMap";
import { PropertyEpcViewer } from "@/components/property-detail/PropertyEpcViewer";
import { PropertyHeroGallery } from "@/components/property-detail/PropertyHeroGallery";
import {
  getAvailablePropertyMediaModes,
  getNextPropertyMediaMode,
  type PropertyMediaMode,
  type PropertyMediaNavigationKey,
} from "@/lib/property-detail-view";
import type { LivePropertyDetail } from "@/lib/property-view";
import { cn } from "@/lib/utils";

type PropertyMediaStageData = Pick<
  LivePropertyDetail,
  | "id"
  | "department"
  | "gallery"
  | "floorplans"
  | "epcImageUrl"
  | "epcRating"
  | "latitude"
  | "longitude"
  | "postcode"
>;

const MODE_LABELS: Record<Exclude<PropertyMediaMode, "photos">, string> = {
  floorplan: "Floorplan",
  epc: "EPC",
  map: "Map",
};

export function PropertyMediaStage({
  property,
}: {
  property: PropertyMediaStageData;
}): React.ReactElement {
  return (
    <PropertyMediaStageContent
      key={`${property.department}:${property.id}`}
      property={property}
    />
  );
}

function PropertyMediaStageContent({
  property,
}: {
  property: PropertyMediaStageData;
}): React.ReactElement {
  const modes = getAvailablePropertyMediaModes({
    images: property.gallery,
    floorplans: property.floorplans,
    epcImageUrl: property.epcImageUrl,
    latitude: property.latitude,
    longitude: property.longitude,
  });
  const [activeMode, setActiveMode] = React.useState<PropertyMediaMode | null>(
    modes[0] ?? null
  );

  if (!activeMode) return <PropertyHeroGallery images={[]} />;

  const selectAndFocus = (mode: PropertyMediaMode): void => {
    setActiveMode(mode);
    requestAnimationFrame(() => {
      document.getElementById(`property-media-stage-tab-${mode}`)?.focus();
    });
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    mode: PropertyMediaMode
  ): void => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    selectAndFocus(
      getNextPropertyMediaMode(
        modes,
        mode,
        event.key as PropertyMediaNavigationKey
      )
    );
  };

  return (
    <section aria-label="Property media">
      <div
        role="tablist"
        aria-label="Property media"
        className={cn(
          "grid gap-2 bg-white px-4 py-3 lg:px-0",
          modes.length === 4
            ? "grid-cols-4"
            : modes.length === 3
              ? "grid-cols-3"
              : modes.length === 2
                ? "grid-cols-2"
                : "grid-cols-1"
        )}
      >
        {modes.map((mode) => {
          const selected = mode === activeMode;
          const visibleLabel =
            mode === "photos" ? `Photos ${property.gallery.length}` : MODE_LABELS[mode];
          const accessibleLabel =
            mode === "photos" ? `Photos, ${property.gallery.length} images` : MODE_LABELS[mode];

          return (
            <button
              key={mode}
              id={`property-media-stage-tab-${mode}`}
              type="button"
              role="tab"
              aria-label={accessibleLabel}
              aria-selected={selected}
              aria-controls={`property-media-stage-panel-${mode}`}
              tabIndex={selected ? 0 : -1}
              className={cn(
                "min-h-11 rounded-full border px-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-banc-focus",
                selected
                  ? "border-banc-dark bg-banc-dark text-white"
                  : "border-banc-grey/30 bg-white text-banc-dark hover:border-banc-dark"
              )}
              onClick={() => setActiveMode(mode)}
              onKeyDown={(event) => handleKeyDown(event, mode)}
            >
              {mode === "floorplan" ? (
                <><span className="sm:hidden">Plan</span><span className="hidden sm:inline">Floorplan</span></>
              ) : (
                visibleLabel
              )}
            </button>
          );
        })}
      </div>

      {modes.map((mode) => (
        <div
          key={mode}
          id={`property-media-stage-panel-${mode}`}
          role="tabpanel"
          aria-labelledby={`property-media-stage-tab-${mode}`}
          hidden={mode !== activeMode}
        >
          {mode === "photos" && <PropertyHeroGallery images={property.gallery} />}
          {mode === activeMode && mode === "floorplan" && (
            <div className="px-4 pb-4 lg:px-0"><FloorplanViewer floorplans={property.floorplans} /></div>
          )}
          {mode === activeMode && mode === "epc" && (
            <div className="px-4 pb-4 lg:px-0">
              <PropertyEpcViewer epcImageUrl={property.epcImageUrl} epcRating={property.epcRating} />
            </div>
          )}
          {mode === activeMode && mode === "map" &&
            typeof property.latitude === "number" &&
            typeof property.longitude === "number" && (
              <div className="px-4 pb-4 lg:px-0">
                <GooglePropertyMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  postcode={property.postcode}
                />
              </div>
            )}
        </div>
      ))}
    </section>
  );
}
```

Keep the Photos panel mounted while hidden so its current image index survives switching to Floorplan/EPC/Map. Mount Floorplan, EPC and Map only while active.

- [ ] **Step 7: Keep the existing lower media component compiling temporarily**

In `PropertyMediaTabs.tsx`, remove its private EPC implementation and imports, import `PropertyEpcViewer`, and replace:

```tsx
{tab === activeTab && tab === "epc" && <EpcPanel property={property} />}
```

with:

```tsx
{tab === activeTab && tab === "epc" && (
  <PropertyEpcViewer
    epcImageUrl={property.epcImageUrl}
    epcRating={property.epcRating}
  />
)}
```

Do not delete `PropertyMediaTabs.tsx` until Task 4 removes its page import.

- [ ] **Step 8: Run focused tests and lint**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/property-detail-view.test.ts lib/__tests__/property-map-view.test.ts
npx eslint lib/property-detail-view.ts lib/__tests__/property-detail-view.test.ts components/property-detail/PropertyEpcViewer.tsx components/property-detail/PropertyMediaStage.tsx components/property-detail/PropertyMediaTabs.tsx
git diff --check
```

Expected: tests PASS, ESLint exits 0 apart from only the explicitly suppressed remote EPC image rule, and whitespace check exits 0.

- [ ] **Step 9: Commit the unified stage**

```bash
git add lib/property-detail-view.ts lib/__tests__/property-detail-view.test.ts components/property-detail/PropertyEpcViewer.tsx components/property-detail/PropertyMediaStage.tsx components/property-detail/PropertyMediaTabs.tsx
git commit -m "feat: add unified property media stage"
```

---

### Task 4: Compose the Stage and Simplify Property Navigation

**Files:**
- Modify: `app/sales/properties/[id]/page.tsx:1-235`
- Verify unchanged reuse: `app/lettings/properties/[id]/page.tsx`
- Delete: `components/property-detail/PropertyMediaTabs.tsx`

**Interfaces:**
- Consumes: `PropertyMediaStage`, `getPropertyResultsBackLink()`, current `LivePropertyDetail`, and existing identity-keyed ready subtree.
- Produces: One top-of-page media experience and responsive department-correct navigation for both sales and lettings.

- [ ] **Step 1: Run the complete pre-composition Node suite**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/*.test.ts
```

Expected: PASS with zero failures before page composition changes.

- [ ] **Step 2: Replace split media imports and composition**

In `app/sales/properties/[id]/page.tsx`:

- replace `PropertyHeroGallery` and `PropertyMediaTabs` imports with `PropertyMediaStage`;
- import `ArrowLeft` from Lucide;
- import `getPropertyResultsBackLink` from `lib/property-detail-view`;
- keep the ready subtree key and canonical route behavior unchanged.

Replace the separate hero and lower media structure with:

```tsx
<div className="pb-32 lg:pb-16">
  <div className="mx-auto max-w-[1440px] lg:px-6 xl:px-8">
    <PropertyMediaStage property={property} />
  </div>

  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <PropertySummary property={property} />
    <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
      <div className="min-w-0">
        <PropertyOverview property={property} />
      </div>
      <PropertyContactPanel property={property} />
    </div>

    {similar.length > 0 && (
      <section
        className="mt-16 border-t border-banc-grey/15 pt-12"
        aria-labelledby="similar-properties-heading"
      >
        <h2 id="similar-properties-heading" className="font-serif text-3xl text-banc-dark">
          Similar homes
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {similar.slice(0, 3).map((item) => (
            <PropertyCard key={item.id} {...item} />
          ))}
        </div>
      </section>
    )}
  </div>
</div>
```

- [ ] **Step 3: Replace the mobile breadcrumb with a back link**

Update `PropertyBreadcrumb` to render separate mobile and desktop treatments:

```tsx
function PropertyBreadcrumb({
  property,
}: {
  property: LivePropertyDetail;
}): React.ReactElement {
  const backLink = getPropertyResultsBackLink(property.department);
  const resultsLabel = property.department === "lettings" ? "To Let" : "For Sale";

  return (
    <div className="border-b border-banc-grey/20 bg-banc-grey-pale">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href={backLink.href}
          className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium text-banc-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-banc-focus lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLink.label}
        </Link>

        <nav
          aria-label="Breadcrumb"
          className="hidden min-w-0 items-center gap-2 py-0.5 text-sm text-banc-muted-readable lg:flex"
        >
          <Link href="/" className="shrink-0 rounded-sm hover:text-banc-focus focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-banc-focus">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          <Link href={backLink.href} className="shrink-0 rounded-sm hover:text-banc-focus focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-banc-focus">
            {resultsLabel}
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span aria-current="page" className="min-w-0 flex-1 truncate text-banc-dark">
            {property.title}
          </span>
        </nav>
      </div>
    </div>
  );
}
```

The mobile link must remain department-correct and at least 44px high. Desktop uses the short title, never the full address.

- [ ] **Step 4: Remove the obsolete lower media component**

Run:

```bash
rg -n "PropertyMediaTabs" app components
```

Expected before deletion: only the component's own declaration remains. Delete `components/property-detail/PropertyMediaTabs.tsx`, then rerun the command.

Expected after deletion: no matches.

- [ ] **Step 5: Verify the lettings route still shares the implementation**

Run:

```bash
sed -n '1,20p' app/lettings/properties/'[id]'/page.tsx
```

Expected:

```ts
export { default } from "@/app/sales/properties/[id]/page";
```

- [ ] **Step 6: Run the full Node suite and focused lint**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/*.test.ts
npx eslint app/sales/properties/'[id]'/page.tsx app/lettings/properties/'[id]'/page.tsx components/property-detail components/FloorplanViewer.tsx lib/property-detail-view.ts lib/property-map-view.ts
git diff --check
```

Expected: Node tests PASS with zero failures, focused ESLint exits 0 except already documented `<img>` warnings with local suppressions, and whitespace check exits 0.

- [ ] **Step 7: Run the strict production build before committing composition**

Use the linked repository's environment without printing or copying values:

```bash
node --input-type=module -e 'import { spawn } from "node:child_process"; process.loadEnvFile("/Users/sandboxsansan/Documents/Banc-replacement-website/.env.local"); const child = spawn("npm", ["run", "build"], { stdio: "inherit", env: process.env }); child.on("exit", code => process.exit(code ?? 1)); child.on("error", error => { console.error(error.message); process.exit(1); });'
```

Expected: exit 0, strict TypeScript succeeds, static generation completes, and both property-detail routes remain in the route table. Record existing unrelated warnings without changing unrelated files.

- [ ] **Step 8: Commit the composed experience**

```bash
git add app/sales/properties/'[id]'/page.tsx app/lettings/properties/'[id]'/page.tsx components/property-detail/PropertyMediaTabs.tsx
git commit -m "feat: unify property detail media experience"
```

---

### Task 5: Responsive and Provider Verification

**Files:**
- Modify only files implicated by a verified failure in this task.

**Interfaces:**
- Consumes: The complete unified property media experience from Tasks 1-4.
- Produces: Fresh automated, build and responsive evidence for sales, lettings, Google satellite, standard controls and OpenStreetMap fallback.

- [ ] **Step 1: Run every automated gate from a clean starting point**

Run:

```bash
node --experimental-strip-types --test lib/__tests__/*.test.ts
npx eslint app/sales/properties/'[id]'/page.tsx app/lettings/properties/'[id]'/page.tsx app/cookies/page.tsx components/property-detail components/FloorplanViewer.tsx lib/property-detail-view.ts lib/property-map-view.ts lib/__tests__/property-detail-view.test.ts lib/__tests__/property-map-view.test.ts
git diff --check
```

Expected: all Node tests PASS; focused lint contains no new errors; whitespace check exits 0.

- [ ] **Step 2: Check Google configuration presence without revealing values**

Run:

```bash
node --input-type=module -e 'process.loadEnvFile("/Users/sandboxsansan/Documents/Banc-replacement-website/.env.local"); console.log(JSON.stringify({ mapsApiKeyConfigured: Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim()), mapIdConfigured: Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim()) }));'
```

Expected: boolean-only output. Never print either environment value. A missing map ID permits flat satellite but means rotate/tilt cannot be claimed as verified.

- [ ] **Step 3: Build production output again after all corrections**

Run:

```bash
node --input-type=module -e 'import { spawn } from "node:child_process"; process.loadEnvFile("/Users/sandboxsansan/Documents/Banc-replacement-website/.env.local"); const child = spawn("npm", ["run", "build"], { stdio: "inherit", env: process.env }); child.on("exit", code => process.exit(code ?? 1)); child.on("error", error => { console.error(error.message); process.exit(1); });'
```

Expected: exit 0 with both shared dynamic property routes.

- [ ] **Step 4: Start the verified production build locally**

Run on port 3036 with process-local environment and an ephemeral auth secret if required:

```bash
node --input-type=module -e 'import { spawn } from "node:child_process"; import { randomBytes } from "node:crypto"; process.loadEnvFile("/Users/sandboxsansan/Documents/Banc-replacement-website/.env.local"); const env = { ...process.env, AUTH_SECRET: process.env.AUTH_SECRET || randomBytes(32).toString("hex"), AUTH_TRUST_HOST: "true" }; const child = spawn("npm", ["run", "start", "--", "-p", "3036"], { stdio: "inherit", env }); child.on("exit", code => process.exit(code ?? 1)); child.on("error", error => { console.error(error.message); process.exit(1); });'
```

Expected: Next.js reports Ready. Keep the session available for browser checks.

- [ ] **Step 5: Verify mobile sales and lettings routes**

Use `/sales/properties/BPGC869` and `/lettings/properties/BPGC1607` at 320x700, 375x812 and 390x844. For each route and viewport confirm:

1. The mobile row reads `Back to properties`; its destination matches the department.
2. The full postal address does not appear in the mobile navigation row.
3. Available modes fit the viewport with controls at least 44px high.
4. Photos starts active when images exist and the photo index survives switching away and back.
5. Floorplan, EPC and Map replace the same stage without moving the viewport.
6. Floorplan zoom/download/fullscreen and EPC fullscreen remain keyboard and touch accessible.
7. Selecting Map triggers the first Google Maps request; loading the detail page without selecting Map does not.
8. Satellite is selected, Google map type and Street View Pegman controls are visible, and rotate/tilt controls appear only where Google supports them.
9. `Approximate postcode area` and the non-exact-position copy remain visible.
10. The fixed viewing/call bar does not cover tabs, map controls or disclosure.
11. `document.documentElement.scrollWidth === document.documentElement.clientWidth` returns `true`.

- [ ] **Step 6: Verify tablet and desktop hierarchy**

At 768x1024, 1024x768 and 1440x900 confirm:

- tablet keeps the single-image photo presentation;
- desktop keeps the five-image editorial mosaic;
- the media rail aligns with the media frame;
- desktop breadcrumb uses the short title rather than full address;
- property summary follows immediately after the media stage;
- no lower duplicate Floorplan/EPC/Map section exists;
- sticky contact panel remains visible and clears header/footer;
- similar properties remain department-correct;
- no horizontal overflow exists.

- [ ] **Step 7: Verify empty and partial media states**

Use live properties previously identified by the original verification:

- `/sales/properties/BPGC911`: missing EPC; EPC tab absent.
- `/sales/properties/BPGC100`: no floorplan or EPC; Photos and Map only when photos are present.

For an entirely empty media state, intercept the local browser request for
`/api/properties/BPGC869`, call the original local endpoint once, and return the
same JSON after replacing only `property.gallery`, `property.images`,
`property.floorplans` and `property.epcImageUrl` with empty arrays/strings and
removing `property.latitude` and `property.longitude`. Keep the interception in
the browser test process; do not write the response to the repository or mutate
live CRM data. Confirm `No photos available` renders without an empty tab rail.

- [ ] **Step 8: Verify OpenStreetMap fallback deterministically**

Stop the production server after its configured-Google checks. Start a development
server on port 3037 after loading the canonical environment for the existing data
and authentication dependencies, then explicitly delete only
`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` from the
child environment. Supply an ephemeral `AUTH_SECRET` only when the canonical
environment does not already contain one, and set `AUTH_TRUST_HOST=true`. This
forces a fresh development compilation of the public environment path without
editing an environment file:

```bash
node --input-type=module -e 'import { spawn } from "node:child_process"; import { randomBytes } from "node:crypto"; process.loadEnvFile("/Users/sandboxsansan/Documents/Banc-replacement-website/.env.local"); const env = { ...process.env, AUTH_SECRET: process.env.AUTH_SECRET || randomBytes(32).toString("hex"), AUTH_TRUST_HOST: "true" }; delete env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; delete env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID; const child = spawn("npm", ["run", "dev", "--", "-p", "3037"], { stdio: "inherit", env }); child.on("exit", code => process.exit(code ?? 1)); child.on("error", error => { console.error(error.message); process.exit(1); });'
```

Open `/sales/properties/BPGC869`, select Map and confirm:

- the fallback notice is announced;
- the OpenStreetMap iframe has the correct postcode-area title;
- the approximate-location disclosure remains visible;
- the rest of the media stage remains interactive;
- no page-level overflow occurs.

- [ ] **Step 9: Record 3D evidence honestly**

If `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` is configured and Google supplies tilt imagery for the chosen live area, exercise the native rotate/tilt controls and record the observed camera behavior. If either condition is absent, record flat satellite as the verified fallback and list production map-ID/coverage verification as a deployment prerequisite; do not claim 3D was observed.

- [ ] **Step 10: Commit only evidence-driven corrections**

If browser verification required source changes, add a failing pure regression test first whenever the behavior is isolatable, confirm RED, implement the smallest correction, confirm GREEN, rerun the focused lint and production build, then commit only implicated files:

```bash
git add lib/property-detail-view.ts lib/property-map-view.ts lib/__tests__/property-detail-view.test.ts lib/__tests__/property-map-view.test.ts components/property-detail app/sales/properties/'[id]'/page.tsx app/cookies/page.tsx .env.example
git commit -m "fix: polish unified property media experience"
```

If no correction is required, do not create an empty commit.

---

## Self-Review Checklist

- **Spec coverage:** Tasks cover unified media discovery, photo preservation, active-only Floorplan/EPC/Map loading, Google satellite, native Street View and supported tilt/rotation, map fallback, mobile navigation, desktop breadcrumb, privacy wording, accessibility and every required breakpoint.
- **Scope control:** No task introduces Immersive Maps, Aerial View, custom Street View, exact geocoding, search-map work, schema changes, listing-card redesign, merge or deployment.
- **TDD:** Pure media availability, keyboard navigation, provider selection, control configuration, fallback URL and department back-link behavior all begin with explicit failing tests.
- **Type consistency:** `PropertyMediaMode`, `PropertyMediaStageAvailability`, `PropertyMediaNavigationKey`, `PropertyMapPresentation`, `PropertyEpcViewerProps` and `PropertyMediaStageData` are defined before their consumers and keep identical names across tasks.
- **Graceful degradation:** No photos selects the first real medium; no media shows the neutral placeholder; no Google key/load uses OpenStreetMap; no map ID/3D coverage retains flat satellite.
- **Privacy:** Google receives existing postcode-area coordinates only after Map selection; the cookie page discloses property-page usage; no exact-house marker or device location is introduced.
