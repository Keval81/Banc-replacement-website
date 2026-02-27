# Agent 11: Data Integrations

## Your Mission
Integrate third-party data APIs to enhance property information.

## Context
- Next.js 14+ with App Router
- Project: ~/Projects/banc-website
- APIs: Land Registry, Schools, Transport, EPC

## Deliverables

### 1. Land Registry Integration
Create API integration for sold prices:

**API Route:** `/api/land-registry/[postcode]`
- Fetch sold price history
- Parse HM Land Registry data
- Cache results (24hr)

**UI Component:** `components/SoldPriceHistory.tsx`
- List of recent sales on street
- Price trend graph
- "Sold in last 12 months" count
- Average price for area

**Property Page Integration:**
- "Price history" tab
- Comparable sales

### 2. Schools API Integration
Integrate DfE/Edubase data:

**API Route:** `/api/schools/nearby`
- Search by postcode/latlng
- Filter by phase (primary/secondary)
- Get Ofsted ratings

**UI Components:**
- `components/SchoolsNearby.tsx` - List schools
- `components/SchoolCatchmentMap.tsx` - Catchment areas
- `components/OfstedRating.tsx` - Rating display

**Property Page:**
- "Schools" section
- Nearest primary/secondary
- Ofsted ratings
- Distance from property

### 3. Transport API Integration
Integrate transport data:

**API Routes:**
- `/api/transport/stations` - Nearby stations
- `/api/transport/journey` - Journey planner

**Data Sources:**
- TFL API (London)
- National Rail Enquiries
- Postcodes.io for geocoding

**UI Components:**
- `components/NearestStations.tsx`
- `components/JourneyPlanner.tsx`
- `components/CommuteTimeCalculator.tsx`

**Features:**
- Walking time to station
- Train lines served
- Journey time to key destinations
- "Plan my commute" tool

### 4. EPC API Integration
Integrate Landmark EPBD API:

**API Route:** `/api/epc/[address]`
- Fetch EPC certificate data
- Current and potential ratings
- Estimated energy costs
- Improvement measures

**Enhanced EPC Visualizer:**
- Current rating (A-G)
- Potential rating
- Energy costs (current/potential)
- CO2 emissions
- Recommended improvements
- PDF certificate link

### 5. School Catchment Checker Tool
Create `/tools/catchment-checker/page.tsx`:

**Features:**
- Enter postcode
- Select school
- See if in catchment
- Distance calculation
- Last year's admission distance

### 6. Sold Prices Search
Create `/sold-prices/page.tsx`:

**Features:**
- Search by postcode/street
- Filter by date range
- Filter by property type
- Price trend graph
- Heat map view

### 7. Area Stats Component
Create reusable area statistics:
- Average price
- Price per sqft
- Time on market
- Number of sales
- Price change %

## API Key Management
Store in environment variables:
```
LAND_REGISTRY_API_KEY=
EPC_API_KEY=
TFL_APP_ID=
TFL_APP_KEY=
NATIONAL_RAIL_API_KEY=
```

## Caching Strategy
- Redis or Upstash for caching
- Cache durations:
  - Land Registry: 24 hours
  - Schools: 7 days
  - EPC: 30 days
  - Transport: 7 days

## Error Handling
- Graceful fallbacks if APIs fail
- "Data temporarily unavailable" messages
- Retry logic with exponential backoff

## Files
```
app/
  api/
    land-registry/
      [postcode]/route.ts
    schools/
      nearby/route.ts
    transport/
      stations/route.ts
      journey/route.ts
    epc/
      [address]/route.ts
  tools/
    catchment-checker/
      page.tsx
  sold-prices/
    page.tsx
components/
  data/
    SoldPriceHistory.tsx
    SchoolsNearby.tsx
    NearestStations.tsx
    EPCVisualizer.tsx
    AreaStats.tsx
lib/
  api/
    landRegistry.ts
    schools.ts
    transport.ts
    epc.ts
```

## Success Criteria
- [ ] Sold prices display for any postcode
- [ ] Schools show with Ofsted ratings
- [ ] Nearest stations with walking times
- [ ] EPC data displays accurately
- [ ] Catchment checker works
- [ ] All APIs have error fallbacks
- [ ] Data is cached appropriately
