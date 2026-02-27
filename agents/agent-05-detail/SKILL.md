# Agent 5: Property Detail Enhancement

## Your Mission
Create world-class property detail pages with virtual tours, maps, and energy visualizations.

## Context
- Next.js 14+ with App Router
- Project: ~/Projects/banc-website
- Current: `/sales/properties/[id]/page.tsx` is static mock
- Need dynamic, feature-rich property pages

## Deliverables

### 1. Enhanced Property Detail Page
Transform `/sales/properties/[id]/page.tsx`:

**Hero Section:**
- Full-width image gallery with thumbnails
- Lightbox/modal for full-screen viewing
- Image counter (1 of 12)
- Swipe support on mobile
- Keyboard navigation (arrow keys)

**Key Details Bar:**
- Price (prominent)
- Beds, baths, receptions, sqft
- Share button (copy link, email, WhatsApp)
- Save to favorites (heart)
- Print/PDF button

**Layout:**
- Left column (2/3): Description, features, floorplan, map
- Right column (1/3): Agent card, contact form, similar properties

### 2. Image Gallery Enhancement
Create `components/PropertyGallery.tsx`:
- Main image with thumbnail strip
- Lazy loading for images
- Touch/swipe support
- Zoom on hover (desktop)
- Full-screen lightbox
- Video support (if available)

### 3. Virtual Tour Integration
Add virtual tour support:
- Matterport embedding
- 360° tour viewer
- "Virtual Tour" tab in gallery
- Full-screen tour mode

### 4. Floorplan Viewer
Create `components/FloorplanViewer.tsx`:
- Zoom and pan
- Measure tool
- Room labels on hover
- Download PDF button
- High-resolution display

### 5. Transport & Location
Add location section:
- Google Map with property marker
- Nearest stations with walking times
- "Get directions" button
- Local amenities list (schools, shops, pubs)

**Components:**
- `components/TransportLinks.tsx`
- `components/LocalAmenities.tsx`
- `components/WalkScore.tsx`

### 6. Energy Efficiency Visualizer
Create interactive EPC display:
- Current rating visual (A-G scale)
- Potential rating (if improvements made)
- Estimated costs breakdown
- Improvement recommendations
- EPC certificate PDF link

Component: `components/EPCVisualizer.tsx`

### 7. Street View Integration
- Embedded Google Street View
- Toggle between map and street view
- Full-screen option

### 8. Property History (Future-Ready)
Prepare for Land Registry integration:
- "Sold history" section (placeholder)
- Price trend chart (ready for data)
- Market comparison section

### 9. Contact Agent Section
Sticky sidebar with:
- Agent photo and details
- Call button (click-to-call)
- Email button
- "Arrange viewing" form
- Office address and hours

### 10. Similar Properties
Bottom section showing:
- 3 similar properties
- "You may also like" heading
- Horizontal scroll on mobile

## Responsive Behavior
- Desktop: 2-column layout
- Tablet: Stacked, sidebar below
- Mobile: Single column, sticky CTA at bottom

## Files
```
app/
  sales/
    properties/
      [id]/
        page.tsx (rewrite)
        layout.tsx
components/
  PropertyGallery.tsx
  PropertyHero.tsx
  PropertyDetails.tsx
  PropertyFeatures.tsx
  FloorplanViewer.tsx
  EPCVisualizer.tsx
  TransportLinks.tsx
  LocalAmenities.tsx
  StreetView.tsx
  AgentContactCard.tsx
  SimilarProperties.tsx
  ShareButtons.tsx
```

## Success Criteria
- [ ] Gallery supports 10+ images with lightbox
- [ ] Virtual tours embed correctly
- [ ] Floorplan is zoomable
- [ ] Map shows property location
- [ ] EPC is visual and informative
- [ ] Street View displays
- [ ] Page is fully responsive
- [ ] Performance: < 2s LCP
