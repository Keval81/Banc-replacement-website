import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const GOOGLE_PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const FETCH_TIMEOUT_MS = 8000;

const AMENITY_TYPES = ['all', 'restaurant', 'supermarket', 'cafe', 'park', 'gym', 'hospital', 'pharmacy', 'shop'] as const;

const querySchema = z
  .object({
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    postcode: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9 ]{5,8}$/, 'Invalid postcode')
      .optional(),
    type: z.enum(AMENITY_TYPES).default('all'),
    radius: z.coerce.number().int().min(100).max(5000).default(1000),
  })
  .refine(
    (q) => (q.lat !== undefined && q.lng !== undefined) || q.postcode !== undefined,
    { message: 'Either lat/lng or postcode is required' }
  );

interface PlaceResult {
  place_id?: string;
  name?: string;
  types?: string[];
  vicinity?: string;
  geometry?: { location?: { lat?: number; lng?: number } };
  rating?: number;
  opening_hours?: { open_now?: boolean };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      lat: searchParams.get('lat') ?? undefined,
      lng: searchParams.get('lng') ?? undefined,
      postcode: searchParams.get('postcode') ?? undefined,
      type: searchParams.get('type') ?? undefined,
      radius: searchParams.get('radius') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid query', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { postcode, type, radius } = parsed.data;
    let latitude = parsed.data.lat;
    let longitude = parsed.data.lng;

    // Get coordinates from postcode if needed
    if (postcode && (latitude === undefined || longitude === undefined)) {
      const geoResponse = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`,
        { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
      );
      if (!geoResponse.ok) {
        return NextResponse.json(
          { error: 'Could not geocode postcode' },
          { status: 400 }
        );
      }
      const geoData: { result?: { latitude?: number; longitude?: number } | null } =
        await geoResponse.json();
      const result = geoData.result;
      if (
        !result ||
        typeof result.latitude !== 'number' ||
        typeof result.longitude !== 'number' ||
        !Number.isFinite(result.latitude) ||
        !Number.isFinite(result.longitude)
      ) {
        return NextResponse.json(
          { error: 'Could not geocode postcode' },
          { status: 400 }
        );
      }
      latitude = result.latitude;
      longitude = result.longitude;
    }

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Either lat/lng or postcode is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      // Return mock data if no API key
      return NextResponse.json({
        amenities: getMockAmenities(),
        source: 'mock'
      });
    }

    // Map our types to Google Places types
    const typeMapping: Record<string, string> = {
      'restaurant': 'restaurant',
      'supermarket': 'supermarket',
      'cafe': 'cafe',
      'park': 'park',
      'gym': 'gym',
      'hospital': 'hospital',
      'pharmacy': 'pharmacy',
      'shop': 'store',
    };

    // Build Google Places API URL
    const placesUrl = new URL(GOOGLE_PLACES_API_URL);
    placesUrl.searchParams.append('location', `${latitude},${longitude}`);
    placesUrl.searchParams.append('radius', String(radius));
    placesUrl.searchParams.append('key', apiKey);
    
    if (type !== 'all' && typeMapping[type]) {
      placesUrl.searchParams.append('type', typeMapping[type]);
    }

    const response = await fetch(placesUrl.toString(), {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data: { results?: PlaceResult[] } = await response.json();
    const originLat = latitude;
    const originLng = longitude;

    const amenities = (data.results ?? []).map((place) => ({
      id: place.place_id,
      name: place.name,
      type: mapPlaceType(place.types?.[0] || 'other'),
      address: place.vicinity,
      distance: calculateDistance(originLat, originLng, place.geometry?.location?.lat ?? NaN, place.geometry?.location?.lng ?? NaN),
      walkingTime: estimateWalkingTime(
        calculateDistance(originLat, originLng, place.geometry?.location?.lat ?? NaN, place.geometry?.location?.lng ?? NaN)
      ),
      coordinates: {
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng,
      },
      rating: place.rating,
      openingHours: place.opening_hours?.open_now ? 'Open now' : 'Closed',
    }));

    return NextResponse.json({
      amenities,
      source: 'google'
    });
  } catch (error) {
    console.error('Error in amenities API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch amenities', amenities: getMockAmenities() },
      { status: 500 }
    );
  }
}

function mapPlaceType(googleType: string): string {
  const mapping: Record<string, string> = {
    'restaurant': 'restaurant',
    'food': 'restaurant',
    'supermarket': 'supermarket',
    'grocery_or_supermarket': 'supermarket',
    'cafe': 'cafe',
    'park': 'park',
    'gym': 'gym',
    'health': 'gym',
    'hospital': 'hospital',
    'doctor': 'hospital',
    'pharmacy': 'pharmacy',
    'store': 'shop',
    'shopping_mall': 'shop',
  };
  return mapping[googleType] || 'other';
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function estimateWalkingTime(distanceKm: number): number {
  return Math.round((distanceKm / 5) * 60);
}

function getMockAmenities() {
  return [
    {
      id: '1',
      name: 'Tesco Express',
      type: 'supermarket',
      address: '123 High Street, London',
      distance: 0.2,
      walkingTime: 3,
      coordinates: { lat: 51.5, lng: -0.1 },
      rating: 4.2,
    },
    {
      id: '2',
      name: 'The Crown & Anchor',
      type: 'restaurant',
      address: '45 Main Road, London',
      distance: 0.3,
      walkingTime: 4,
      coordinates: { lat: 51.51, lng: -0.11 },
      rating: 4.5,
    },
  ];
}
