# Premium Property Detail Experience

## Objective

Redesign Banc's sales and lettings property-detail pages so the experience matches the premium listing cards and supports mobile-first browsing and enquiries.

This is a focused release slice. It does not change the landing page, CRM integration, search results, or introduce a new dependency.

## Experience principles

- Design for mobile browsing first; desktop expands the same hierarchy rather than defining it.
- Let photography lead, while keeping price, location, key facts and enquiry actions immediately accessible.
- Present floorplans, EPC and location as one coherent property-information experience.
- Show only useful CRM data. Never render placeholders such as `Unknown` or duplicate copy.
- Keep the main enquiry action reachable without covering important content.
- Use Banc's existing navy, sky-blue, Source Serif 4 and DM Sans visual language.

## Recommended layout

### 1. Hero gallery

Desktop uses an editorial image mosaic: one dominant image and supporting images, with a single `View all photos` action and image count.

Mobile uses a full-width, swipeable hero with:

- a visible image counter;
- large previous/next controls where appropriate;
- native-feeling horizontal swipes;
- save/share controls outside the primary image interaction;
- a fullscreen lightbox with keyboard, swipe and close support;
- no long thumbnail rail on the page.

### 2. Property summary

The summary follows the gallery and contains:

- availability or property tag;
- title and complete address;
- price and qualifier;
- bedrooms, bathrooms and receptions;
- tenure only when meaningful;
- brochure and virtual-tour links only when valid.

On mobile, facts use a compact grid that remains readable at 320px without horizontal scrolling.

### 3. Enquiry actions

Desktop uses a restrained sticky contact panel aligned with the property overview.

Mobile uses a sticky bottom action bar with one primary `Request a viewing` action and one secondary call action. It must:

- remain within thumb reach;
- respect safe-area insets;
- not overlap tabs, gallery controls, cookie controls or page content;
- disappear or adapt when the fullscreen gallery is open;
- carry the live property reference and correct sales or lettings context.

### 4. Overview and features

The property description is cleaned before rendering:

- remove repeated paragraphs while preserving order;
- normalise whitespace;
- omit empty content;
- constrain prose to a readable line length.

Key features appear before the long description on mobile so buyers can scan the home quickly. Room dimensions render only when the feed contains real values.

### 5. Property information media

Floorplan, EPC and Map sit inside one premium media panel.

- Tabs are shown only for available media.
- The first available tab is active.
- Tabs support keyboard navigation and have clear selected states.
- On mobile, the tab list is compact and does not cause page-level horizontal scrolling.
- Changing a tab does not unexpectedly move the viewport.

#### Floorplan

Use a contained viewer with explicit Zoom in, Zoom out, Fullscreen and Download actions. Remove the current `Measure` mode because it lists data rather than measuring the drawing. Controls use accessible names and minimum 44px touch targets.

#### EPC

Show the current rating prominently alongside the official graph. Provide a concise explanation of what the rating represents. The certificate image can be expanded without forcing an oversized section into the main page.

#### Map

Use a contained map at a useful aspect ratio. State clearly when the marker represents a postcode area rather than an exact address. The map must be lazy-loaded and have a meaningful accessible title.

### 6. Similar properties

Finish with up to three department-correct premium property cards. On mobile these stack vertically and retain their existing full-card navigation and lead actions.

## Responsive behaviour

### Mobile: 320px–767px

- Single-column flow.
- Edge-to-edge gallery; padded text content.
- Swipe-first image interaction.
- Features precede long-form description.
- Compact media tabs and contained media viewport.
- Sticky bottom enquiry bar with safe-area spacing.
- No hover-dependent controls.
- No content hidden solely to shorten the page.

### Tablet: 768px–1023px

- Wider single-column content with an expanded gallery.
- Enquiry actions remain close to the summary rather than creating a narrow sidebar.
- Media panel uses the full readable content width.

### Desktop: 1024px+

- Editorial gallery mosaic.
- Main content and sticky enquiry panel use a balanced grid.
- Description maintains a readable measure instead of stretching across the viewport.
- Supporting media remains contained rather than becoming a sequence of oversized blocks.

## Component structure

Refactor the current large detail-page component into focused components:

- `PropertyHeroGallery`
- `PropertySummary`
- `PropertyOverview`
- `PropertyMediaTabs`
- `PropertyContactPanel`
- `PropertyMobileActions`

Reuse and simplify the existing gallery and floorplan behavior where practical. Sales and lettings continue to share one detail implementation and derive department context from the route and live property data.

## Data rules

- Deduplicate description paragraphs with a pure helper.
- Filter blank, `Unknown`, `N/A` and equivalent display facts.
- Do not invent unavailable EPC, location, room or tenure data.
- Validate brochure and virtual-tour URLs before displaying actions.
- Every enquiry must include the live property ID and department.

## Accessibility and interaction

- All interactive controls have visible focus styles and accessible names.
- Touch targets are at least 44px.
- Tabs follow ARIA tab semantics and keyboard behavior.
- Fullscreen dialogs trap focus, close with Escape and restore focus.
- Motion respects `prefers-reduced-motion`.
- Text and controls meet WCAG AA contrast.
- Images retain useful property-specific alternative text.

## Testing and verification

Follow TDD for the new behavior:

1. Add failing tests for description deduplication, fact filtering, media availability and department-aware actions.
2. Implement the pure data helpers.
3. Refactor the interface into the new component hierarchy.
4. Run unit tests, lint and production build.
5. Browser-test at 320px, 375px, 390px, 768px, 1024px and desktop widths.
6. Verify swipe, keyboard navigation, fullscreen focus, sticky actions and sales/lettings routes with live property data.

## Out of scope

- Landing-page imagery or video.
- Replacing the CRM or property API.
- New amenity, commute-time or school datasets.
- A new map provider or paid map integration.
- 3D tours where the CRM does not supply one.
- Redesigning the listing cards approved in the preceding slice.

## Acceptance criteria

- A buyer can understand the property's price, location and key facts without scrolling past the hero.
- Mobile users can browse every image and reach viewing/call actions comfortably with one hand.
- Floorplan, EPC and map feel like one designed system rather than separate embedded blocks.
- No duplicate description paragraphs or meaningless placeholder facts are visible.
- No page-level horizontal overflow exists from 320px upward.
- Sales and lettings details, actions and similar properties remain department-correct.
- Automated checks and the production build pass, followed by responsive browser verification.
