# Agent 4: Property Search Enhancement

## Your Mission
Build advanced property search with map integration, alerts, and comparison tools.

## Context
- Next.js 14+ with App Router
- Project: ~/Projects/banc-website
- Current search is basic form-based
- Need to exceed live site functionality

## Deliverables

### 1. Advanced Property Search Page
Create `/search/page.tsx` with:

**Layout:**
- Left sidebar: Filters
- Main area: Results grid/list toggle
- Top bar: Sort options + result count + view toggle

**Filters:**
- Price range (min/max with slider)
- Bedrooms (studio-10+)
- Property type (multi-select)
- Tenure (freehold/leasehold)
- Keywords
- Added in last: 24hrs, 3 days, week, month
- Include sold/let (archive toggle)

**Sort Options:**
- Price (low-high, high-low)
- Date added (newest)
- Bedrooms

### 2. Map-Based Search
Create map view using Google Maps or Mapbox:
- `/search/map` - Full-screen map view
- Property pins with price bubbles
- Clustering for dense areas
- Click pin → property card popup
- Draw search area polygon tool
- "Search this area" button on map move

Components:
- `components/PropertyMap.tsx`
- `components/MapSearchDrawer.tsx`

### 3. Property Alerts System
Create complete alerts functionality:

**Pages:**
- `/alerts` - Manage alerts list
- `/alerts/create` - Create new alert (modal or page)

**Features:**
- Save search criteria as alert
- Email frequency: Instant, Daily, Weekly
- Alert name customization
- Pause/resume alerts
- Delete alerts
- "Create alert" button on search page

**API:**
- `POST /api/alerts` - Create alert
- `GET /api/alerts` - List alerts
- `PATCH /api/alerts/[id]` - Update alert
- `DELETE /api/alerts/[id]` - Delete alert

### 4. Property Comparison Tool
Create comparison feature:

**Page:** `/compare` or modal
- Compare up to 3 properties side-by-side
- Table comparing: price, beds, baths, sqft, features
- Image comparison
- "Remove" button for each property
- "Contact about these" CTA

**Components:**
- `components/CompareBar.tsx` - Sticky bar showing selected
- `components/CompareTable.tsx` - Side-by-side comparison
- Add "Compare" checkbox to PropertyCard

### 5. Search State Management
Use URL query params for search state:
- `?minPrice=500000&maxPrice=1000000&beds=3`
- Shareable search URLs
- Browser back button works

### 6. Mobile Search Experience
- Bottom sheet for filters on mobile
- Swipeable property cards
- "Map/List" toggle button
- Full-screen map view

## Files to Create
```
app/
  search/
    page.tsx
    layout.tsx
  alerts/
    page.tsx
  compare/
    page.tsx
  api/
    alerts/
      route.ts
      [id]/route.ts
components/
  PropertyMap.tsx
  SearchFilters.tsx
  CompareBar.tsx
  CompareTable.tsx
  MobileSearchDrawer.tsx
hooks/
  useSearchParams.ts
  usePropertyComparison.ts
```

## Success Criteria
- [ ] Advanced filters work and update results
- [ ] Map view shows property pins
- [ ] Can draw search areas on map
- [ ] Alerts can be created and saved
- [ ] Comparison tool shows side-by-side
- [ ] Search URLs are shareable
- [ ] Mobile experience is optimized
