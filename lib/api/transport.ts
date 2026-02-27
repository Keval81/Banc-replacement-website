import { TransportStation, JourneyResult } from '@/lib/types/data';

const TFL_API_URL = 'https://api.tfl.gov.uk';
const NATIONAL_RAIL_API_URL = 'https://api.nationalrail.co.uk';

// Cache for 7 days
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
const cache = new Map<string, { data: any; timestamp: number }>();

function getCacheKey(endpoint: string, params: string): string {
  return `${endpoint}:${params}`;
}

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Geocode postcode
async function geocodePostcode(postcode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.result) {
      return { lat: data.result.latitude, lng: data.result.longitude };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  return null;
}

// Calculate distance
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Estimate walking time
function estimateWalkingTime(distanceKm: number): number {
  const walkingSpeedKmh = 5;
  return Math.round((distanceKm / walkingSpeedKmh) * 60);
}

// Fetch nearby stations
export async function fetchNearbyStations(
  postcode: string,
  options?: {
    maxDistance?: number; // km
    types?: TransportStation['type'][];
    limit?: number;
  }
): Promise<TransportStation[]> {
  const cacheKey = getCacheKey('stations-nearby', `${postcode}:${JSON.stringify(options)}`);
  const cached = getCachedData<TransportStation[]>(cacheKey);
  if (cached) return cached;

  try {
    const coords = await geocodePostcode(postcode);
    if (!coords) {
      throw new Error('Could not geocode postcode');
    }

    // Search radius in meters (default 2km)
    const radius = (options?.maxDistance || 2) * 1000;

    // TFL API for stations
    const tflUrl = `${TFL_API_URL}/StopPoint?lat=${coords.lat}&lon=${coords.lng}&stopTypes=NaptanMetroStation,NaptanRailStation,NaptanBusCoachStation,NaptanFerryPort,NaptanPublicBusCoachTram&radius=${radius}&returnLines=true`;

    const response = await fetch(tflUrl);
    if (!response.ok) {
      throw new Error(`TFL API error: ${response.status}`);
    }

    const data = await response.json();

    const stations: TransportStation[] = (data.stopPoints || [])
      .filter((stop: any) => {
        // Filter by requested types if specified
        if (options?.types && options.types.length > 0) {
          const stationType = mapTFLStopType(stop.stopType);
          return options.types.includes(stationType);
        }
        return true;
      })
      .map((stop: any) => {
        const distance = calculateDistance(
          coords.lat, coords.lng,
          stop.lat, stop.lon
        );

        return {
          id: stop.id,
          name: stop.commonName,
          type: mapTFLStopType(stop.stopType),
          distance: Math.round(distance * 100) / 100,
          walkingTime: estimateWalkingTime(distance),
          coordinates: {
            lat: stop.lat,
            lng: stop.lon,
          },
          lines: stop.lines?.map((l: any) => l.name) || [],
          zone: extractZone(stop.additionalProperties),
        };
      })
      .sort((a: TransportStation, b: TransportStation) => a.distance - b.distance);

    // Limit results
    const limited = stations.slice(0, options?.limit || 10);

    setCachedData(cacheKey, limited);
    return limited;
  } catch (error) {
    console.error('Error fetching nearby stations:', error);
    return getMockStations(postcode);
  }
}

// Map TFL stop types to our types
function mapTFLStopType(stopType: string): TransportStation['type'] {
  switch (stopType) {
    case 'NaptanMetroStation':
      return 'tube';
    case 'NaptanRailStation':
      return 'rail';
    case 'NaptanBusCoachStation':
    case 'NaptanPublicBusCoachTram':
      return 'bus';
    case 'NaptanFerryPort':
      return 'river';
    default:
      return 'tube';
  }
}

// Extract zone from additional properties
function extractZone(properties: any[]): number | undefined {
    const zoneProp = properties?.find((p: any) => 
      p.key === 'Zone' || p.key === 'TFLZone'
    );
    if (zoneProp) {
      const zone = parseInt(zoneProp.value);
      return isNaN(zone) ? undefined : zone;
    }
    return undefined;
  }
  
  // Plan a journey
  export async function planJourney(
    from: string,
    to: string,
    options?: {
      date?: string;
      time?: string;
      mode?: ('tube' | 'bus' | 'rail' | 'overground' | 'dlr' | 'tram' | 'walking' | 'cycling')[];
    }
  ): Promise<JourneyResult> {
    const cacheKey = getCacheKey('journey', `${from}:${to}:${JSON.stringify(options)}`);
    const cached = getCachedData<JourneyResult>(cacheKey);
    if (cached) return cached;
  
    try {
      // Get coordinates for both locations
      const fromCoords = await geocodePostcode(from);
      const toCoords = await geocodePostcode(to);
  
      if (!fromCoords || !toCoords) {
        throw new Error('Could not geocode one or both postcodes');
      }
  
      // Build journey planner URL
      let url = `${TFL_API_URL}/Journey/JourneyResults/${fromCoords.lat},${fromCoords.lng}/to/${toCoords.lat},${toCoords.lng}`;
      
      const params = new URLSearchParams();
      if (options?.mode) {
        params.append('mode', options.mode.join(','));
      }
      if (options?.date) {
        params.append('date', options.date);
      }
      if (options?.time) {
        params.append('time', options.time);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
  
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Journey planner error: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (!data.journeys || data.journeys.length === 0) {
        throw new Error('No journey found');
      }
  
      // Use first (best) journey
      const journey = data.journeys[0];
      
      const result: JourneyResult = {
        origin: {
          name: from,
          coordinates: fromCoords,
        },
        destination: {
          name: to,
          coordinates: toCoords,
        },
        duration: Math.round(journey.duration / 60),
        distance: journey.legs.reduce((acc: number, leg: any) => acc + (leg.distance || 0), 0),
        modes: journey.legs.map((leg: any) => leg.mode?.id || 'walking'),
        steps: journey.legs.map((leg: any) => ({
          mode: leg.mode?.id || 'walking',
          duration: Math.round(leg.duration / 60),
          distance: leg.distance || 0,
          instruction: leg.instruction?.summary || '',
          from: leg.departurePoint?.commonName,
          to: leg.arrivalPoint?.commonName,
          line: leg.routeOptions?.[0]?.name,
        })),
        fare: journey.fare?.totalCost ? {
          total: `£${(journey.fare.totalCost / 100).toFixed(2)}`,
          zones: journey.fare.fareZones?.join(', '),
        } : undefined,
      };
  
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error planning journey:', error);
      return getMockJourney(from, to);
    }
  }
  
  // Get journey times to common destinations
  export async function getCommuteTimes(
    postcode: string,
    destinations: string[]
  ): Promise<Array<{ destination: string; duration: number; modes: string[] }>> {
    const results = await Promise.all(
      destinations.map(async (dest) => {
        try {
          const journey = await planJourney(postcode, dest);
          return {
            destination: dest,
            duration: journey.duration,
            modes: journey.modes,
          };
        } catch (error) {
          return {
            destination: dest,
            duration: 0,
            modes: [],
          };
        }
      })
    );
    return results;
  }
  
  // Get station details
  export async function getStationDetails(stationId: string): Promise<Partial<TransportStation> | null> {
    const cacheKey = getCacheKey('station-details', stationId);
    const cached = getCachedData<Partial<TransportStation>>(cacheKey);
    if (cached) return cached;
  
    try {
      const response = await fetch(`${TFL_API_URL}/StopPoint/${stationId}`);
      if (!response.ok) return null;
  
      const data = await response.json();
      
      const details: Partial<TransportStation> = {
        id: data.id,
        name: data.commonName,
        type: mapTFLStopType(data.stopType),
        lines: data.lines?.map((l: any) => l.name) || [],
        zone: extractZone(data.additionalProperties),
      };
  
      setCachedData(cacheKey, details);
      return details;
    } catch (error) {
      console.error('Error fetching station details:', error);
      return null;
    }
  }
  
  // Get live arrivals for a station
  export async function getLiveArrivals(stationId: string): Promise<any[]> {
    try {
      const response = await fetch(`${TFL_API_URL}/StopPoint/${stationId}/Arrivals`);
      if (!response.ok) return [];
  
      const data = await response.json();
      return data
        .sort((a: any, b: any) => a.timeToStation - b.timeToStation)
        .slice(0, 5)
        .map((arrival: any) => ({
          line: arrival.lineName,
          destination: arrival.destinationName,
          platform: arrival.platformName,
          timeToStation: Math.round(arrival.timeToStation / 60),
        }));
    } catch (error) {
      console.error('Error fetching live arrivals:', error);
      return [];
    }
  }
  
  // Mock data
  function getMockStations(postcode: string): TransportStation[] {
    return [
      {
        id: 'tube-1',
        name: 'Oxford Circus',
        type: 'tube',
        distance: 0.5,
        walkingTime: 6,
        coordinates: { lat: 51.515, lng: -0.1415 },
        lines: ['Bakerloo', 'Central', 'Victoria'],
        zone: 1,
      },
      {
        id: 'rail-1',
        name: 'London Victoria',
        type: 'rail',
        distance: 0.8,
        walkingTime: 10,
        coordinates: { lat: 51.495, lng: -0.1447 },
        lines: ['Gatwick Express', 'Southern', 'Southeastern'],
        zone: 1,
      },
      {
        id: 'tube-2',
        name: 'Bond Street',
        type: 'tube',
        distance: 0.3,
        walkingTime: 4,
        coordinates: { lat: 51.5143, lng: -0.149 },
        lines: ['Central', 'Jubilee'],
        zone: 1,
      },
      {
        id: 'overground-1',
        name: 'Kensington (Olympia)',
        type: 'overground',
        distance: 1.2,
        walkingTime: 15,
        coordinates: { lat: 51.4983, lng: -0.2106 },
        lines: ['Overground', 'Southern'],
        zone: 2,
      },
      {
        id: 'bus-1',
        name: 'Marble Arch',
        type: 'bus',
        distance: 0.2,
        walkingTime: 2,
        coordinates: { lat: 51.513, lng: -0.1589 },
        lines: ['2', '6', '13', '16', '30', '74', '137', '148', '159', '414'],
      },
    ];
  }
  
  function getMockJourney(from: string, to: string): JourneyResult {
    return {
      origin: { name: from, coordinates: { lat: 51.5, lng: -0.1 } },
      destination: { name: to, coordinates: { lat: 51.51, lng: -0.1 } },
      duration: 25,
      distance: 3200,
      modes: ['walking', 'tube', 'walking'],
      steps: [
        { mode: 'walking', duration: 4, distance: 320, instruction: 'Walk to Oxford Circus station' },
        { mode: 'tube', duration: 15, distance: 2500, instruction: 'Take Central Line to Bank', from: 'Oxford Circus', to: 'Bank', line: 'Central' },
        { mode: 'walking', duration: 6, distance: 380, instruction: 'Walk to destination' },
      ],
      fare: { total: '£2.80', zones: 'Zone 1' },
    };
  }
