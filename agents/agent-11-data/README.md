# Data Integrations - Agent 11

This document summarizes the data integration components implemented for the Banc Property website.

## Overview

Agent 11 implemented comprehensive third-party data API integrations to enhance property information with:
- HM Land Registry sold prices
- Schools data with Ofsted ratings
- Transport links (TfL/National Rail)
- EPC (Energy Performance Certificate) data
- Street View
- Local amenities

## Files Created

### API Routes

| Route | Description |
|-------|-------------|
| `/api/land-registry/[postcode]` | Fetch sold price history and statistics for a postcode |
| `/api/schools/nearby` | Search schools near a postcode with filtering |
| `/api/transport/stations` | Get nearby transport stations |
| `/api/transport/journey` | Plan journeys between locations |
| `/api/epc/[address]` | Fetch EPC certificate data |
| `/api/amenities` | Get local amenities from Google Places |

### Library Files

| File | Description |
|------|-------------|
| `lib/api/landRegistry.ts` | Land Registry API integration with caching |
| `lib/api/schools.ts` | Schools API with Ofsted ratings integration |
| `lib/api/transport.ts` | TfL and National Rail API integration |
| `lib/api/epc.ts` | EPC Open Data API integration |
| `lib/types/data.ts` | TypeScript types for all data integrations |

### UI Components

| Component | Description |
|-----------|-------------|
| `SoldPriceHistory` | Display sold prices with filtering and statistics |
| `SchoolsNearby` | List nearby schools with Ofsted ratings |
| `SchoolCatchmentMap` | Show school catchment information |
| `NearestStations` | Display transport links and walking times |
| `JourneyPlanner` | Plan journeys between locations |
| `CommuteTimeCalculator` | Calculate commute times to destinations |
| `EPCVisualizer` | Display EPC ratings and energy costs |
| `AreaStats` | Show area market statistics |
| `StreetView` | Google Street View integration |
| `LocalAmenities` | Display nearby shops, restaurants, etc. |

### Pages

| Page | Description |
|------|-------------|
| `/sold-prices` | Full-page sold prices search with filters |
| `/tools/catchment-checker` | Interactive school catchment checker |

## API Key Requirements

Add these to your `.env.local`:

```
# Google Places (for Street View and Amenities)
GOOGLE_PLACES_API_KEY=
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=

# EPC API (Landmark EPBD)
EPC_API_KEY=

# TfL API
TFL_APP_ID=
TFL_APP_KEY=

# National Rail Enquiries
NATIONAL_RAIL_API_KEY=

# Upstash Redis (optional, for caching)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Note: Some APIs don't require keys for basic access:
- HM Land Registry (SPARQL endpoint)
- Edubase/Ofsted
- Postcodes.io (geocoding)

## Caching Strategy

Data is cached in-memory with the following durations:
- Land Registry: 24 hours
- Schools: 7 days
- EPC: 30 days
- Transport: 7 days

## Usage Examples

### Sold Price History
```tsx
import { SoldPriceHistory } from '@/components/data';

<SoldPriceHistory postcode="SW1A 1AA" />
```

### Schools Nearby
```tsx
import { SchoolsNearby } from '@/components/data';

<SchoolsNearby postcode="SW1A 1AA" phase="primary" />
```

### Transport Stations
```tsx
import { NearestStations } from '@/components/data';

<NearestStations postcode="SW1A 1AA" />
```

### EPC Visualizer
```tsx
import { EPCVisualizer } from '@/components/data';

<EPCVisualizer epc={epcData} />
```

### Street View
```tsx
import { StreetView } from '@/components/data';

<StreetView lat={51.5} lng={-0.1} address="10 Downing Street" />
```

## Mock Data

All integrations include fallback mock data that displays when:
- API keys are not configured
- APIs are unavailable
- Rate limits are exceeded

This ensures the UI always works for development and demo purposes.

## Error Handling

All components include:
- Loading states
- Error fallbacks
- Graceful degradation
- Retry logic

## Success Criteria Checklist

- [x] Sold prices display for any postcode
- [x] Schools show with Ofsted ratings
- [x] Nearest stations with walking times
- [x] EPC data displays accurately
- [x] Catchment checker works
- [x] All APIs have error fallbacks
- [x] Data is cached appropriately
