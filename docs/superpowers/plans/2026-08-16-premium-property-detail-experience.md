# Premium Property Detail Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium, mobile-first sales and lettings property-detail experience with an editorial gallery, scannable facts, accessible supporting-media tabs and conversion-focused enquiry actions.

**Architecture:** Keep the existing live `/api/properties/[id]` data path and shared sales/lettings route implementation. Move presentation-only decisions into tested pure helpers, split the large detail page into focused client components, and replace competing global mobile overlays with the property-specific action bar on detail routes. Reuse the existing Banc design tokens, `next/image`, Framer Motion, Lucide and the installed Radix Dialog package; add no dependency.

**Tech Stack:** Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, Node test runner, Radix Dialog, Framer Motion, Lucide React.

**Spec:** `docs/superpowers/specs/2026-08-16-premium-property-detail-experience.md`

## Global Constraints

- Mobile browsing is the primary target; verify layouts from exactly 320px upward.
- All touch targets are at least 44px and no interaction depends on hover.
- Sales and lettings must share one detail implementation while retaining department-correct links, labels and similar properties.
- Show only real CRM data; omit blank, `Unknown`, `N/A` and equivalent values.
- Do not change landing-page imagery/video or files being edited by the parallel Claude Code work.
- Do not add a dependency.
- Do not replace the CRM, property API, map provider or approved listing cards.
- Respect `prefers-reduced-motion`, WCAG AA contrast, keyboard navigation and safe-area insets.

---

## File Structure

| Path | Responsibility |
|---|---|
| `lib/property-detail-view.ts` | Pure detail-page cleanup, media availability, route detection and gallery-index helpers. |
| `lib/__tests__/property-detail-view.test.ts` | Node tests for every presentation decision that can be isolated from React. |
| `components/property-detail/PropertyHeroGallery.tsx` | Mobile swipe carousel, desktop editorial mosaic and accessible fullscreen lightbox. |
| `components/property-detail/PropertySummary.tsx` | Price, address, facts, save and share controls. |
| `components/property-detail/PropertyOverview.tsx` | Features-first overview, deduplicated prose and optional room dimensions. |
| `components/property-detail/PropertyContactActions.tsx` | Sticky desktop contact card and safe-area-aware mobile viewing/call bar. |
| `components/property-detail/PropertyMediaTabs.tsx` | Accessible Floorplan/EPC/Map tab system and media panels. |
| `components/FloorplanViewer.tsx` | Simplified responsive floorplan zoom, fullscreen and download experience. |
| `components/mobile/SiteOverlays.tsx` | Hides generic nav/chat/WhatsApp overlays on property-detail routes. |
| `app/layout.tsx` | Mounts the route-aware overlay group. |
| `app/sales/properties/[id]/page.tsx` | Fetch state and composition of the new detail experience. |
| `app/lettings/properties/[id]/page.tsx` | Continues to reuse the shared detail implementation. |
| `components/PropertyGallery.tsx` | Removed after its accessible replacement is wired and verified. |

---

### Task 1: Tested Property Detail View Helpers

**Files:**
- Create: `lib/property-detail-view.ts`
- Create: `lib/__tests__/property-detail-view.test.ts`

**Interfaces:**
- Consumes: Primitive CRM display values and `LivePropertyDetail`-compatible media fields.
- Produces: `cleanDescriptionParagraphs(value: string): string[]`, `getDisplayFact(value: string | null | undefined): string | null`, `getSafeExternalUrl(value: string): string | null`, `getAvailablePropertyMedia(input: PropertyMediaAvailability): PropertyMediaTabId[]`, `isPropertyDetailPath(pathname: string): boolean`, and `getWrappedGalleryIndex(current: number, delta: -1 | 1, count: number): number`.

- [ ] **Step 1: Write the failing helper tests**

Create `lib/__tests__/property-detail-view.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cleanDescriptionParagraphs,
  getAvailablePropertyMedia,
  getDisplayFact,
  getSafeExternalUrl,
  getWrappedGalleryIndex,
  isPropertyDetailPath,
} from "../property-detail-view.ts";

test("deduplicates description paragraphs while preserving their first occurrence", () => {
  assert.deepEqual(
    cleanDescriptionParagraphs("First paragraph.\n\nSecond paragraph.\n\n First   paragraph. "),
    ["First paragraph.", "Second paragraph."]
  );
});

test("normalises whitespace and omits empty description paragraphs", () => {
  assert.deepEqual(cleanDescriptionParagraphs("  A   bright home. \n\n \n\n Near the station. "), [
    "A bright home.",
    "Near the station.",
  ]);
});

test("omits meaningless property facts", () => {
  for (const value of [undefined, null, "", "  ", "Unknown", "N/A", "Not known", "-"]) {
    assert.equal(getDisplayFact(value), null);
  }
  assert.equal(getDisplayFact(" Freehold "), "Freehold");
});

test("accepts only absolute http and https media URLs", () => {
  assert.equal(getSafeExternalUrl(" https://example.com/brochure.pdf "), "https://example.com/brochure.pdf");
  assert.equal(getSafeExternalUrl("http://example.com/tour"), "http://example.com/tour");
  assert.equal(getSafeExternalUrl("javascript:alert(1)"), null);
  assert.equal(getSafeExternalUrl("/relative.pdf"), null);
  assert.equal(getSafeExternalUrl("not a url"), null);
});

test("returns only media tabs backed by live data in the intended order", () => {
  assert.deepEqual(
    getAvailablePropertyMedia({
      floorplans: [{ id: "fp-1" }],
      epcImageUrl: "https://example.com/epc.png",
      latitude: 51.71,
      longitude: -0.11,
    }),
    ["floorplan", "epc", "map"]
  );
  assert.deepEqual(
    getAvailablePropertyMedia({ floorplans: [], epcImageUrl: "", latitude: 51.71 }),
    []
  );
});

test("recognises sales and lettings detail routes but not results routes", () => {
  assert.equal(isPropertyDetailPath("/sales/properties/BPGC869"), true);
  assert.equal(isPropertyDetailPath("/lettings/properties/BPGC%201607/"), true);
  assert.equal(isPropertyDetailPath("/sales/properties"), false);
  assert.equal(isPropertyDetailPath("/contact"), false);
});

test("wraps gallery navigation in both directions", () => {
  assert.equal(getWrappedGalleryIndex(0, -1, 5), 4);
  assert.equal(getWrappedGalleryIndex(4, 1, 5), 0);
  assert.equal(getWrappedGalleryIndex(2, 1, 5), 3);
  assert.equal(getWrappedGalleryIndex(0, 1, 0), 0);
});
```

- [ ] **Step 2: Run the helper tests and confirm the red state**

Run: `node --test lib/__tests__/property-detail-view.test.ts`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `lib/property-detail-view.ts`.

- [ ] **Step 3: Implement the minimal pure helpers**

Create `lib/property-detail-view.ts`:

```ts
export type PropertyMediaTabId = "floorplan" | "epc" | "map";

export interface PropertyMediaAvailability {
  floorplans: ReadonlyArray<unknown>;
  epcImageUrl: string;
  latitude?: number;
  longitude?: number;
}

const EMPTY_FACTS = new Set(["", "unknown", "n/a", "not known", "-"]);

function normaliseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function cleanDescriptionParagraphs(value: string): string[] {
  const seen = new Set<string>();

  return value
    .split(/\n\s*\n/)
    .map(normaliseWhitespace)
    .filter((paragraph) => {
      const key = paragraph.toLocaleLowerCase("en-GB");
      if (EMPTY_FACTS.has(key) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function getDisplayFact(value: string | null | undefined): string | null {
  const normalised = normaliseWhitespace(value ?? "");
  return EMPTY_FACTS.has(normalised.toLocaleLowerCase("en-GB")) ? null : normalised;
}

export function getSafeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function getAvailablePropertyMedia({
  floorplans,
  epcImageUrl,
  latitude,
  longitude,
}: PropertyMediaAvailability): PropertyMediaTabId[] {
  const tabs: PropertyMediaTabId[] = [];
  if (floorplans.length > 0) tabs.push("floorplan");
  if (getSafeExternalUrl(epcImageUrl)) tabs.push("epc");
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) tabs.push("map");
  return tabs;
}

export function isPropertyDetailPath(pathname: string): boolean {
  return /^\/(sales|lettings)\/properties\/[^/]+\/?$/.test(pathname);
}

export function getWrappedGalleryIndex(
  current: number,
  delta: -1 | 1,
  count: number
): number {
  if (count <= 0) return 0;
  return (current + delta + count) % count;
}
```

- [ ] **Step 4: Run the focused and existing view-model tests**

Run: `node --test lib/__tests__/property-detail-view.test.ts lib/__tests__/property-view.test.ts`

Expected: all tests PASS.

- [ ] **Step 5: Commit the helper boundary**

```bash
git add lib/property-detail-view.ts lib/__tests__/property-detail-view.test.ts
git commit -m "test: define property detail presentation rules"
```

---

### Task 2: Mobile-First Editorial Gallery

**Files:**
- Create: `components/property-detail/PropertyHeroGallery.tsx`
- Test: `lib/__tests__/property-detail-view.test.ts`

**Interfaces:**
- Consumes: `images: PropertyImage[]`, where `PropertyImage` comes from `lib/types/property.ts`; `getWrappedGalleryIndex()` from Task 1.
- Produces: `PropertyHeroGallery({ images, className? }): React.ReactElement`, including mobile swipe, desktop mosaic and Radix fullscreen dialog.

- [ ] **Step 1: Extend the gallery-index test for middle and single-image states**

Add to `lib/__tests__/property-detail-view.test.ts`:

```ts
test("keeps a single-image gallery on its only image", () => {
  assert.equal(getWrappedGalleryIndex(0, -1, 1), 0);
  assert.equal(getWrappedGalleryIndex(0, 1, 1), 0);
});
```

- [ ] **Step 2: Run the focused test before changing the gallery**

Run: `node --test lib/__tests__/property-detail-view.test.ts`

Expected: PASS, establishing the navigation contract used by the component.

- [ ] **Step 3: Create the editorial gallery component**

Implement `components/property-detail/PropertyHeroGallery.tsx` with these concrete rules:

```tsx
"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import * as React from "react";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { getWrappedGalleryIndex } from "@/lib/property-detail-view";
import type { PropertyImage } from "@/lib/types/property";
import { cn } from "@/lib/utils";

interface PropertyHeroGalleryProps {
  images: PropertyImage[];
  className?: string;
}

const FALLBACK_IMAGE: PropertyImage = {
  id: "property-fallback",
  url: "/hertfordshire-home-1.png",
  alt: "Property image unavailable",
  isPrimary: true,
};

export function PropertyHeroGallery({
  images,
  className,
}: PropertyHeroGalleryProps): React.ReactElement {
  const gallery = images.length > 0 ? images : [FALLBACK_IMAGE];
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const touchStart = React.useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  const move = React.useCallback(
    (delta: -1 | 1) => {
      setActiveIndex((current) => getWrappedGalleryIndex(current, delta, gallery.length));
    },
    [gallery.length]
  );

  const openAt = (index: number): void => {
    setActiveIndex(index);
    setOpen(true);
  };

  const handleTouchEnd = (event: React.TouchEvent): void => {
    if (touchStart.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (Math.abs(distance) < 50) return;
    move(distance < 0 ? 1 : -1);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <section className={cn("relative", className)} aria-label="Property photos">
        <div
          className="relative aspect-[4/3] overflow-hidden bg-banc-dark lg:hidden"
          onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
          onTouchEnd={handleTouchEnd}
        >
          <button className="absolute inset-0 z-10" onClick={() => openAt(activeIndex)}>
            <span className="sr-only">View all {gallery.length} property photos</span>
          </button>
          <Image
            src={gallery[activeIndex].url}
            alt={gallery[activeIndex].alt}
            fill
            priority
            className={cn("object-cover", !reduceMotion && "transition-opacity duration-300")}
            sizes="100vw"
          />
          {gallery.length > 1 && (
            <>
              <button aria-label="Previous photo" className="absolute left-3 top-1/2 z-20 h-11 w-11 -translate-y-1/2 rounded-full bg-white/90" onClick={() => move(-1)}><ChevronLeft className="mx-auto h-5 w-5" /></button>
              <button aria-label="Next photo" className="absolute right-3 top-1/2 z-20 h-11 w-11 -translate-y-1/2 rounded-full bg-white/90" onClick={() => move(1)}><ChevronRight className="mx-auto h-5 w-5" /></button>
            </>
          )}
          <span className="absolute bottom-3 right-3 z-20 rounded-full bg-banc-dark/80 px-3 py-1.5 text-xs font-medium text-white">
            {activeIndex + 1} / {gallery.length}
          </span>
        </div>

        <div className="hidden aspect-[16/7] grid-cols-12 gap-2 overflow-hidden rounded-3xl lg:grid">
          <button className={cn("relative row-span-2 overflow-hidden", gallery.length > 1 ? "col-span-7" : "col-span-12")} onClick={() => openAt(0)}>
            <Image src={gallery[0].url} alt={gallery[0].alt} fill priority className="object-cover transition-transform duration-500 hover:scale-[1.02]" sizes="58vw" />
          </button>
          {gallery.length > 1 && (
            <div className="col-span-5 grid grid-cols-2 grid-rows-2 gap-2">
              {gallery.slice(1, 5).map((image, offset) => (
                <button key={image.id} className="relative overflow-hidden" onClick={() => openAt(offset + 1)}>
                  <Image src={image.url} alt={image.alt} fill className="object-cover transition-transform duration-500 hover:scale-[1.03]" sizes="21vw" />
                </button>
              ))}
            </div>
          )}
          <button className="absolute bottom-5 right-5 z-20 flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-banc-dark shadow-lg" onClick={() => openAt(0)}>
            <Images className="h-4 w-4" /> View all {gallery.length} photos
          </button>
        </div>
      </section>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/95" />
        <Dialog.Content className="fixed inset-0 z-[101] flex items-center justify-center p-3 sm:p-8" aria-describedby={undefined}>
          <Dialog.Title className="sr-only">Property photo gallery</Dialog.Title>
          <Dialog.Close className="absolute right-4 top-4 z-20 h-12 w-12 rounded-full bg-white/10 text-white" aria-label="Close photo gallery"><X className="mx-auto h-6 w-6" /></Dialog.Close>
          <div className="relative h-full w-full" onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={handleTouchEnd}>
            <Image src={gallery[activeIndex].url} alt={gallery[activeIndex].alt} fill priority className="object-contain" sizes="100vw" />
            {gallery.length > 1 && (
              <>
                <button aria-label="Previous photo" className="absolute left-0 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-white sm:left-4" onClick={() => move(-1)}><ChevronLeft className="mx-auto h-7 w-7" /></button>
                <button aria-label="Next photo" className="absolute right-0 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-white sm:right-4" onClick={() => move(1)}><ChevronRight className="mx-auto h-7 w-7" /></button>
              </>
            )}
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm text-white">{activeIndex + 1} / {gallery.length}</p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

Ensure the desktop gallery container is `relative` so its `View all` button anchors correctly. If the feed has fewer than five images, the right grid uses the available images without duplicating photography.

- [ ] **Step 4: Run TypeScript-aware lint on the new component**

Run: `npx eslint components/property-detail/PropertyHeroGallery.tsx`

Expected: exit code 0 with no errors.

- [ ] **Step 5: Commit the gallery**

```bash
git add components/property-detail/PropertyHeroGallery.tsx lib/__tests__/property-detail-view.test.ts
git commit -m "feat: add editorial property gallery"
```

---

### Task 3: Property Summary, Overview and Contact Actions

**Files:**
- Create: `components/property-detail/PropertySummary.tsx`
- Create: `components/property-detail/PropertyOverview.tsx`
- Create: `components/property-detail/PropertyContactActions.tsx`

**Interfaces:**
- Consumes: `LivePropertyDetail`, `cleanDescriptionParagraphs()`, `getDisplayFact()`, `getSafeExternalUrl()`, existing `buildPropertyLeadActions()`, `buildPropertyShareData()`, `shareProperty()` and `useFavorites()`.
- Produces: `PropertySummary({ property })`, `PropertyOverview({ property })`, `PropertyContactPanel({ property })`, and `PropertyMobileActions({ property })`.

- [ ] **Step 1: Add a failing regression test for case-insensitive duplicate descriptions**

Add to `lib/__tests__/property-detail-view.test.ts`:

```ts
test("treats description duplicates as case insensitive", () => {
  assert.deepEqual(cleanDescriptionParagraphs("A premium home.\n\na PREMIUM home."), [
    "A premium home.",
  ]);
});
```

- [ ] **Step 2: Run the regression test and confirm the existing helper satisfies it**

Run: `node --test lib/__tests__/property-detail-view.test.ts`

Expected: PASS. If it fails, fix only the normalised comparison key in `cleanDescriptionParagraphs()` and rerun before creating UI.

- [ ] **Step 3: Build `PropertySummary`**

Implement `components/property-detail/PropertySummary.tsx` as a client component. It must:

- render tag, title, address/postcode, qualifier-or-price and bedroom/bathroom/reception facts;
- call `getDisplayFact(property.tenure)` and omit tenure when it returns `null`;
- use `useFavorites()` with `{ id, title, price, image: gallery[0]?.url, address }`;
- use the native-share/clipboard flow already used by `PropertyCard`;
- give save/share buttons `aria-pressed` or a human-readable status;
- use `grid-cols-2 sm:grid-cols-4` for facts so 320px never scrolls horizontally.

The central action shape is:

```tsx
const favorited = isFavorite(property.id);
const price = property.priceQualifier ?? property.price;

await toggleFavorite({
  id: property.id,
  title: property.title,
  price,
  image: property.gallery[0]?.url,
  address: property.address,
});

const shareData = buildPropertyShareData({
  department: property.department,
  id: property.id,
  title: property.title,
  address: property.address,
  price,
  origin: window.location.origin,
});
await shareProperty(shareData, {
  nativeShare: navigator.share?.bind(navigator),
  copyText: navigator.clipboard?.writeText.bind(navigator.clipboard),
});
```

- [ ] **Step 4: Build `PropertyOverview`**

Implement `components/property-detail/PropertyOverview.tsx` as a server-safe presentational component. Render sections in this order:

1. `At a glance` feature list in one column at 320px and two columns from `sm`.
2. `About this property` with `cleanDescriptionParagraphs(property.description)` and `max-w-[72ch]`.
3. `Room dimensions` only when `property.rooms.length > 0`.

Use stable keys derived from feature text plus index only when the CRM supplies duplicates. Do not render an empty heading.

- [ ] **Step 5: Build desktop and mobile contact actions**

Implement `components/property-detail/PropertyContactActions.tsx`. Both exports derive actions from `buildPropertyLeadActions(property.department, property.id)`.

```tsx
export function PropertyContactPanel({ property }: { property: LivePropertyDetail }) {
  const actions = buildPropertyLeadActions(property.department, property.id);
  const brochureUrl = getSafeExternalUrl(property.brochureUrl);
  const tourUrl = getSafeExternalUrl(property.virtualTourUrl);

  return (
    <aside className="hidden lg:block" aria-label="Property enquiry">
      <div className="sticky top-24 rounded-3xl border border-banc-grey/20 bg-banc-grey-pale p-6 shadow-[0_24px_60px_-36px_rgba(16,34,56,0.35)]">
        <p className="font-serif text-2xl text-banc-dark">Arrange your viewing</p>
        <p className="mt-2 text-sm leading-6 text-banc-grey">Speak with Banc's local team about this home.</p>
        <a href={actions.primaryHref} className="mt-6 flex h-12 items-center justify-center rounded-full bg-banc-sky px-5 font-medium text-white">{actions.primaryLabel}</a>
        <a href={actions.secondaryHref} className="mt-3 flex h-12 items-center justify-center rounded-full border border-banc-dark/20 px-5 font-medium text-banc-dark">{actions.secondaryLabel}</a>
        {(brochureUrl || tourUrl) && (
          <div className="mt-6 space-y-3 border-t border-banc-grey/20 pt-5">
            {brochureUrl && <a href={brochureUrl} target="_blank" rel="noopener noreferrer" className="block text-sm font-medium text-banc-dark hover:text-banc-sky">Full brochure</a>}
            {tourUrl && <a href={tourUrl} target="_blank" rel="noopener noreferrer" className="block text-sm font-medium text-banc-dark hover:text-banc-sky">Virtual tour</a>}
          </div>
        )}
      </div>
    </aside>
  );
}
```

`PropertyMobileActions` must:

- use `useCookies()` and return `null` while `hasConsented` is false, allowing the cookie panel exclusive use of the bottom edge;
- use `lg:hidden`, `fixed inset-x-0 bottom-0 z-40`, `safe-area-pb`, a solid white background and top border;
- render a 48px primary viewing button and 48px secondary call button;
- add no gesture or animation that delays navigation.

- [ ] **Step 6: Lint the three components**

Run: `npx eslint components/property-detail/PropertySummary.tsx components/property-detail/PropertyOverview.tsx components/property-detail/PropertyContactActions.tsx`

Expected: exit code 0 with no errors.

- [ ] **Step 7: Commit the property information and actions**

```bash
git add components/property-detail/PropertySummary.tsx components/property-detail/PropertyOverview.tsx components/property-detail/PropertyContactActions.tsx lib/__tests__/property-detail-view.test.ts
git commit -m "feat: add premium property summary and enquiry actions"
```

---

### Task 4: Accessible Floorplan, EPC and Map Tabs

**Files:**
- Create: `components/property-detail/PropertyMediaTabs.tsx`
- Modify: `components/FloorplanViewer.tsx`

**Interfaces:**
- Consumes: `getAvailablePropertyMedia()`, `PropertyMediaTabId`, live floorplans, EPC image/rating and postcode coordinates.
- Produces: `PropertyMediaTabs({ property }): React.ReactElement | null`; a simplified `FloorplanViewer` retaining its current public prop interface.

- [ ] **Step 1: Add a media-availability regression test for zero coordinates**

Add to `lib/__tests__/property-detail-view.test.ts`:

```ts
test("treats zero as a valid coordinate when both coordinates exist", () => {
  assert.deepEqual(
    getAvailablePropertyMedia({ floorplans: [], epcImageUrl: "", latitude: 0, longitude: 0 }),
    ["map"]
  );
});
```

- [ ] **Step 2: Run the focused test**

Run: `node --test lib/__tests__/property-detail-view.test.ts`

Expected: PASS because `Number.isFinite(0)` is true.

- [ ] **Step 3: Simplify `FloorplanViewer`**

Refactor `components/FloorplanViewer.tsx` while retaining:

```ts
interface FloorplanViewerProps {
  floorplans: Floorplan[];
  className?: string;
}
```

Remove `showMeasureMode`, the `Measure` button and the measurement overlay. Keep these controls with exact accessible labels:

- `Previous floorplan` and `Next floorplan` when more than one plan exists;
- `Zoom out floorplan` and `Zoom in floorplan`;
- `Reset floorplan zoom` when zoom is above 1;
- `Download floorplan`;
- `View floorplan fullscreen`;
- `Close floorplan fullscreen`.

Use Radix Dialog for fullscreen focus management, cap the inline viewer at `h-[360px] sm:h-[500px]`, make the toolbar wrap on narrow screens, and keep every icon-only control at least `h-11 w-11`.

- [ ] **Step 4: Build the media tab system**

Implement `components/property-detail/PropertyMediaTabs.tsx` with manual ARIA tab behavior:

```tsx
const TAB_LABELS: Record<PropertyMediaTabId, string> = {
  floorplan: "Floorplan",
  epc: "EPC",
  map: "Map",
};

const tabs = getAvailablePropertyMedia(property);
const [activeTab, setActiveTab] = React.useState<PropertyMediaTabId | null>(tabs[0] ?? null);

if (!activeTab) return null;

function moveFocus(event: React.KeyboardEvent<HTMLButtonElement>, index: number): void {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  const delta = event.key === "ArrowRight" ? 1 : -1;
  const next = (index + delta + tabs.length) % tabs.length;
  setActiveTab(tabs[next]);
  document.getElementById(`property-media-tab-${tabs[next]}`)?.focus();
}
```

Render the tab list as a three-column grid when all tabs exist, rather than a horizontally scrolling strip. Each tab uses `role="tab"`, `aria-selected`, `aria-controls`, and matching `id`; each panel uses `role="tabpanel"`, `aria-labelledby`, and a stable ID.

Panel rules:

- Floorplan: render `<FloorplanViewer floorplans={property.floorplans} />`.
- EPC: show a prominent coloured rating badge when `property.epcRating` exists, the copy `Energy efficiency runs from A (most efficient) to G (least efficient).`, and the official EPC image inside a constrained `max-h-[620px] object-contain` container.
- Map: use the existing OpenStreetMap embed formula, `aspect-[4/3] sm:aspect-[16/9]`, `loading="lazy"`, title `Map of the ${property.postcode} postcode area`, and the visible disclosure `Map shows the postcode area, not the property's precise position.`.

- [ ] **Step 5: Lint the media components**

Run: `npx eslint components/property-detail/PropertyMediaTabs.tsx components/FloorplanViewer.tsx`

Expected: exit code 0 with no errors.

- [ ] **Step 6: Commit the supporting media experience**

```bash
git add components/property-detail/PropertyMediaTabs.tsx components/FloorplanViewer.tsx lib/__tests__/property-detail-view.test.ts
git commit -m "feat: unify property floorplan epc and map"
```

---

### Task 5: Route-Aware Mobile Overlays

**Files:**
- Create: `components/mobile/SiteOverlays.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `isPropertyDetailPath(pathname)` from Task 1 and the existing `MobileBottomNav`, `FloatingWhatsApp`, and `PropertyChatbot` components.
- Produces: `SiteOverlays(): React.ReactElement`, preventing generic floating tools from competing with detail-page actions.

- [ ] **Step 1: Add route edge-case tests**

Add to `lib/__tests__/property-detail-view.test.ts`:

```ts
test("does not classify nested or malformed routes as property details", () => {
  assert.equal(isPropertyDetailPath("/sales/properties/BPGC869/gallery"), false);
  assert.equal(isPropertyDetailPath("/sales/properties/"), false);
  assert.equal(isPropertyDetailPath("/rentals/properties/BPGC869"), false);
});
```

- [ ] **Step 2: Run the route tests**

Run: `node --test lib/__tests__/property-detail-view.test.ts`

Expected: all tests PASS.

- [ ] **Step 3: Create the route-aware overlay group**

Create `components/mobile/SiteOverlays.tsx`:

```tsx
"use client";

import { usePathname } from "next/navigation";
import PropertyChatbot from "@/components/ai/PropertyChatbot";
import { FloatingWhatsApp } from "@/components/mobile/FloatingWhatsApp";
import { MobileBottomNav } from "@/components/mobile/MobileNav";
import { isPropertyDetailPath } from "@/lib/property-detail-view";

export function SiteOverlays(): React.ReactElement | null {
  const pathname = usePathname();
  if (isPropertyDetailPath(pathname)) return null;

  return (
    <>
      <MobileBottomNav />
      <FloatingWhatsApp position="bottom-left" />
      <PropertyChatbot />
    </>
  );
}
```

- [ ] **Step 4: Replace the three independent layout mounts**

In `app/layout.tsx`:

- remove imports for `MobileBottomNav`, `FloatingWhatsApp`, and `PropertyChatbot`;
- import `{ SiteOverlays }` from `@/components/mobile/SiteOverlays`;
- replace their three JSX nodes with `<SiteOverlays />`;
- leave cookie consent, push notifications and social proof untouched.

- [ ] **Step 5: Run focused lint and build type analysis**

Run: `npx eslint components/mobile/SiteOverlays.tsx app/layout.tsx`

Expected: exit code 0 with no errors.

- [ ] **Step 6: Commit the collision fix**

```bash
git add components/mobile/SiteOverlays.tsx app/layout.tsx lib/__tests__/property-detail-view.test.ts
git commit -m "fix: reserve mobile detail pages for property actions"
```

---

### Task 6: Compose the Shared Sales and Lettings Detail Page

**Files:**
- Modify: `app/sales/properties/[id]/page.tsx`
- Verify unchanged reuse: `app/lettings/properties/[id]/page.tsx`
- Remove: `components/PropertyGallery.tsx`

**Interfaces:**
- Consumes: `LivePropertyDetail` from `lib/property-view.ts` and every component created in Tasks 2–4.
- Produces: One shared detail-page composition used by both `/sales/properties/[id]` and `/lettings/properties/[id]`.

- [ ] **Step 1: Run the complete pre-refactor unit suite**

Run: `node --test lib/__tests__/*.test.ts`

Expected: all tests PASS before page composition changes.

- [ ] **Step 2: Replace duplicate local detail types with the shared type**

In `app/sales/properties/[id]/page.tsx`, import:

```ts
import type { LivePropertyDetail, PropertyCardData } from "@/lib/property-view";
```

Remove the local `Gallery`, `LiveDetail`, and `SimilarCard` interfaces. Define:

```ts
type LoadState =
  | { phase: "loading" }
  | { phase: "notfound" }
  | { phase: "ready"; property: LivePropertyDetail; similar: PropertyCardData[] };
```

Keep the existing fetch, cancellation guard, not-found copy and department detection.

- [ ] **Step 3: Compose the new hierarchy**

Replace the existing `DetailBody` markup with this structure:

```tsx
function DetailBody({
  property,
  similar,
}: {
  property: LivePropertyDetail;
  similar: PropertyCardData[];
}): React.ReactElement {
  return (
    <>
      <PropertyBreadcrumb property={property} />
      <main className="pb-32 lg:pb-16">
        <div className="mx-auto max-w-[1440px] lg:px-6 xl:px-8">
          <PropertyHeroGallery images={property.gallery} />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PropertySummary property={property} />
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
            <div className="min-w-0 space-y-12">
              <PropertyOverview property={property} />
              <PropertyMediaTabs property={property} />
            </div>
            <PropertyContactPanel property={property} />
          </div>

          {similar.length > 0 && (
            <section className="mt-16 border-t border-banc-grey/15 pt-12" aria-labelledby="similar-properties-heading">
              <h2 id="similar-properties-heading" className="font-serif text-3xl text-banc-dark">Similar homes</h2>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similar.slice(0, 3).map((item) => <PropertyCard key={item.id} {...item} />)}
              </div>
            </section>
          )}
        </div>
      </main>
      <PropertyMobileActions property={property} />
    </>
  );
}
```

Keep the breadcrumb concise and horizontally safe: icon separators use `aria-hidden="true"`, the current property uses `truncate`, and the nav has an accessible label.

- [ ] **Step 4: Remove obsolete imports and the replaced gallery**

Remove unused motion, gallery, floorplan, map, EPC and lead-action imports from the page. Delete `components/PropertyGallery.tsx` only after `rg -n "PropertyGallery" app components` confirms no remaining import. The new component fully replaces its mobile, desktop and fullscreen behavior.

- [ ] **Step 5: Verify the lettings route still reuses the shared page**

Run: `cat app/lettings/properties/'[id]'/page.tsx`

Expected exact content:

```ts
export { default } from "@/app/sales/properties/[id]/page";
```

- [ ] **Step 6: Run unit tests and focused lint**

Run: `node --test lib/__tests__/*.test.ts`

Expected: all tests PASS.

Run: `npx eslint app/sales/properties/'[id]'/page.tsx app/lettings/properties/'[id]'/page.tsx components/property-detail components/FloorplanViewer.tsx components/mobile/SiteOverlays.tsx`

Expected: exit code 0 with no errors.

- [ ] **Step 7: Commit the composed experience**

```bash
git add app/sales/properties/'[id]'/page.tsx app/lettings/properties/'[id]'/page.tsx components/property-detail components/PropertyGallery.tsx
git commit -m "feat: redesign shared property detail pages"
```

---

### Task 7: Production and Responsive Verification

**Files:**
- Modify only files implicated by a verified failure in this task.

**Interfaces:**
- Consumes: The complete property-detail experience from Tasks 1–6.
- Produces: Evidence that automated checks, production compilation and mobile/desktop browsing meet the specification.

- [ ] **Step 1: Run all Node tests**

Run: `node --test lib/__tests__/*.test.ts`

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Run project lint**

Run: `npm run lint`

Expected: no new errors. Record existing unrelated warnings separately rather than modifying unrelated landing work.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: Next.js production build exits 0 and lists both sales and lettings dynamic detail routes.

- [ ] **Step 4: Start the production-equivalent local server**

Run: `npm run dev`

Expected: server starts successfully. Keep the returned session available for browser checks.

- [ ] **Step 5: Verify the first live sales and lettings property at mobile widths**

For each of 320×700, 375×812 and 390×844:

1. Open `/sales/properties`, activate the first property card, and repeat from `/lettings/properties`.
2. Confirm gallery swipes and arrows wrap without moving the page horizontally.
3. Confirm price, address and key facts remain readable before the overview.
4. Confirm save and share work and retain the correct property reference.
5. Accept/reject cookies and confirm the mobile viewing/call bar appears afterward without overlapping content.
6. Confirm generic mobile nav, WhatsApp and chatbot overlays are absent only on detail routes.
7. Confirm Floorplan/EPC/Map tabs are thumb-sized, keyboard operable and backed by real data.
8. In the browser console evaluate `document.documentElement.scrollWidth === document.documentElement.clientWidth`; expected result is `true`.

- [ ] **Step 6: Verify tablet and desktop hierarchy**

At 768×1024, 1024×768 and 1440×900 confirm:

- tablet remains a comfortable single-column experience;
- desktop uses the image mosaic and balanced content/contact grid;
- the enquiry panel sticks without colliding with header or footer;
- fullscreen gallery and floorplan close with Escape and return focus to their triggers;
- reduced-motion emulation removes non-essential transitions;
- similar cards use the correct department routes.

- [ ] **Step 7: Check missing-data properties**

Open live properties that lack each of tenure, EPC, floorplan and coordinates. Confirm meaningless tenure is omitted, unavailable tabs do not render, the first available media tab becomes active, and an entirely empty media group renders no heading or blank panel.

- [ ] **Step 8: Commit only verified corrections**

If verification required changes, stage only the implicated detail files and commit:

```bash
git add lib/property-detail-view.ts lib/__tests__/property-detail-view.test.ts components/property-detail components/FloorplanViewer.tsx components/mobile/SiteOverlays.tsx app/layout.tsx app/sales/properties/'[id]'/page.tsx
git commit -m "fix: polish responsive property detail interactions"
```

If no correction was needed, do not create an empty commit.

---

## Self-Review

- **Spec coverage:** The gallery, summary, actions, overview, floorplan, EPC, map, similar properties, route-specific overlays, data cleanup, accessibility and all requested breakpoints each map to an explicit task.
- **Scope control:** Landing media, CRM changes, paid maps, amenities, schools, commute data and listing-card redesign remain excluded.
- **Testing:** Pure decisions are covered by Node tests; browser-only gestures, focus management and responsive layout have exact verification steps without adding a component-test dependency.
- **Type consistency:** `PropertyMediaTabId`, `PropertyMediaAvailability`, `LivePropertyDetail`, `PropertyCardData` and all component prop names are consistent across producers and consumers.
- **Mobile priority:** 320px is a hard acceptance width, the detail CTA replaces competing global overlays, cookie consent owns the bottom edge until resolved, and no hover-only control is required.
