import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const postcode = searchParams.get('postcode');
    const type = searchParams.get('type') || 'all';
    const radius = searchParams.get('radius') || '1000';

    if ((!lat || !lng) && !postcode) {
      return NextResponse.json(
        { error: 'Either lat/lng or postcode is required' },
        { status: 400 }
      );
    }

    // Get coordinates from postcode if needed
    let latitude = lat ? parseFloat(lat) : 0;
    let longitude = lng ? parseFloat(lng) : 0;

    if (postcode && (!lat || !lng)) {
      const geoResponse = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
      if (!geoResponse.ok) {
        return NextResponse.json(
          { error: 'Could not geocode postcode' },
          { status: 400 }
        );
      }
      const geoData = await geoResponse.json();
      latitude = geoData.result.latitude;
      longitude = geoData.result.longitude;
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
    placesUrl.searchParams.append('radius', radius);
    placesUrl.searchParams.append('key', apiKey);
    
    if (type !== 'all' && typeMapping[type]) {
      placesUrl.searchParams.append('type', typeMapping[type]);
    }

    const response = await fetch(placesUrl.toString());
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    const amenities = data.results?.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      type: mapPlaceType(place.types?.[0] || 'other'),
      address: place.vicinity,
      distance: calculateDistance(latitude, longitude, place.geometry?.location?.lat, place.geometry?.location?.lng),
      walkingTime: estimateWalkingTime(
        calculateDistance(latitude, longitude, place.geometry?.location?.lat, place.geometry?.location?.lng)
      ),
      coordinates: {
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng,
      },
      rating: place.rating,
      openingHours: place.opening_hours?.open_now ? 'Open now' : 'Closed',
    })) || [];

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
