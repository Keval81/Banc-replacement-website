// API Route for Property Recommendations
import { NextRequest, NextResponse } from 'next/server';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  features: string[];
  images: string[];
  status: string;
  address: string;
  postcode: string;
}

interface UserRequirements {
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  bedrooms?: number;
  propertyType?: string;
  features?: string[];
}

// Mock properties for demo - in production, this would come from database
const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Stunning 4-Bedroom Family Home',
    description: 'A beautiful detached family home with spacious gardens',
    price: 750000,
    location: 'Cuffley, Hertfordshire',
    bedrooms: 4,
    bathrooms: 2,
    propertyType: 'Detached House',
    features: ['Garden', 'Garage', 'Parking', 'Conservatory'],
    images: ['/images/properties/property1.jpg'],
    status: 'for-sale',
    address: '123 High Street, Cuffley',
    postcode: 'EN6 4BB',
  },
  {
    id: '2',
    title: 'Modern 2-Bedroom Apartment',
    description: 'Contemporary apartment in prime location',
    price: 425000,
    location: 'Brookmans Park, Hertfordshire',
    bedrooms: 2,
    bathrooms: 1,
    propertyType: 'Apartment',
    features: ['Balcony', 'Parking', 'Lift Access'],
    images: ['/images/properties/property2.jpg'],
    status: 'for-sale',
    address: '45 Station Road, Brookmans Park',
    postcode: 'AL9 7TQ',
  },
  {
    id: '3',
    title: 'Charming 3-Bedroom Cottage',
    description: 'Character property with original features',
    price: 625000,
    location: 'Welham Green, Hertfordshire',
    bedrooms: 3,
    bathrooms: 1,
    propertyType: 'Cottage',
    features: ['Garden', 'Period Features', 'Fireplace'],
    images: ['/images/properties/property3.jpg'],
    status: 'for-sale',
    address: '2 Church Lane, Welham Green',
    postcode: 'AL9 7NY',
  },
  {
    id: '4',
    title: 'Luxury 5-Bedroom Villa',
    description: 'Exceptional family home with swimming pool',
    price: 1250000,
    location: 'Potters Bar, Hertfordshire',
    bedrooms: 5,
    bathrooms: 3,
    propertyType: 'Detached House',
    features: ['Swimming Pool', 'Gym', 'Cinema Room', 'Triple Garage'],
    images: ['/images/properties/property4.jpg'],
    status: 'for-sale',
    address: '88 The Walk, Potters Bar',
    postcode: 'EN6 1QH',
  },
  {
    id: '5',
    title: 'Spacious 3-Bedroom Semi-Detached',
    description: 'Well-presented family home in sought-after location',
    price: 550000,
    location: 'Northaw, Hertfordshire',
    bedrooms: 3,
    bathrooms: 1,
    propertyType: 'Semi-Detached House',
    features: ['Garden', 'Driveway', 'Conservatory'],
    images: ['/images/properties/property5.jpg'],
    status: 'for-sale',
    address: '12 Church Road, Northaw',
    postcode: 'EN6 4NJ',
  },
  {
    id: '6',
    title: 'Contemporary 2-Bedroom Flat',
    description: 'Stylish apartment with open-plan living',
    price: 375000,
    location: 'Cuffley, Hertfordshire',
    bedrooms: 2,
    bathrooms: 1,
    propertyType: 'Apartment',
    features: ['Open Plan', 'Parking', 'Communal Garden'],
    images: ['/images/properties/property6.jpg'],
    status: 'for-sale',
    address: '8 The Ridgeway, Cuffley',
    postcode: 'EN6 4AR',
  },
];

function calculateMatchScore(property: Property, requirements: UserRequirements): number {
  let score = 0;
  let factors = 0;

  // Price score (within range = full points)
  if (requirements.minPrice !== undefined || requirements.maxPrice !== undefined) {
    const minPrice = requirements.minPrice || 0;
    const maxPrice = requirements.maxPrice || Infinity;
    if (property.price >= minPrice && property.price <= maxPrice) {
      score += 1;
    } else {
      const distance = Math.min(
        Math.abs(property.price - minPrice),
        Math.abs(property.price - maxPrice)
      );
      score += Math.max(0, 1 - distance / property.price);
    }
    factors++;
  }

  // Location score
  if (requirements.location) {
    if (property.location.toLowerCase().includes(requirements.location.toLowerCase())) {
      score += 1;
    } else {
      score += 0.3;
    }
    factors++;
  }

  // Bedrooms score
  if (requirements.bedrooms !== undefined) {
    const bedDiff = Math.abs(property.bedrooms - requirements.bedrooms);
    score += Math.max(0, 1 - bedDiff * 0.3);
    factors++;
  }

  // Property type score
  if (requirements.propertyType) {
    if (property.propertyType.toLowerCase().includes(requirements.propertyType.toLowerCase())) {
      score += 1;
    }
    factors++;
  }

  // Features score
  if (requirements.features && requirements.features.length > 0) {
    const matchingFeatures = requirements.features.filter(f => 
      property.features.some(pf => pf.toLowerCase().includes(f.toLowerCase()))
    );
    score += matchingFeatures.length / requirements.features.length;
    factors++;
  }

  return factors > 0 ? score / factors : 0.5;
}

function getRecommendations(
  properties: Property[],
  requirements: UserRequirements,
  limit: number
): Array<{ property: Property; score: number; reasons: string[] }> {
  const scored = properties.map(property => {
    const score = calculateMatchScore(property, requirements);
    const reasons: string[] = [];

    if (requirements.bedrooms && property.bedrooms >= requirements.bedrooms) {
      reasons.push(`${property.bedrooms} bedrooms`);
    }
    if (requirements.location && property.location.toLowerCase().includes(requirements.location.toLowerCase())) {
      reasons.push(`In ${requirements.location}`);
    }
    if (requirements.propertyType && property.propertyType.toLowerCase().includes(requirements.propertyType.toLowerCase())) {
      reasons.push(property.propertyType);
    }

    return { property, score, reasons };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get user preferences from query params or cookies/session
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const location = searchParams.get('location');
    const bedrooms = searchParams.get('bedrooms');
    const propertyType = searchParams.get('propertyType');
    const limit = parseInt(searchParams.get('limit') || '6', 10);

    // Build requirements from search params
    const requirements: UserRequirements = {};
    if (minPrice) requirements.minPrice = parseInt(minPrice, 10);
    if (maxPrice) requirements.maxPrice = parseInt(maxPrice, 10);
    if (location) requirements.location = location;
    if (bedrooms) requirements.bedrooms = parseInt(bedrooms, 10);
    if (propertyType) requirements.propertyType = propertyType;

    // Get recommendations
    const recommendations = getRecommendations(mockProperties, requirements, limit);

    return NextResponse.json({
      success: true,
      recommendations: recommendations.map(match => ({
        property: match.property,
        score: Math.round(match.score * 100),
        reasons: match.reasons,
      })),
      total: recommendations.length,
      requirements,
    });
  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { properties, requirements, limit = 6 } = body;

    // Use provided properties or fall back to mock
    const propertiesToSearch = properties || mockProperties;
    
    const recommendations = getRecommendations(propertiesToSearch, requirements, limit);

    return NextResponse.json({
      success: true,
      recommendations: recommendations.map(match => ({
        property: match.property,
        score: Math.round(match.score * 100),
        reasons: match.reasons,
      })),
      total: recommendations.length,
    });
  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate recommendations' },
      { status: 500 }
    );
  }
}
