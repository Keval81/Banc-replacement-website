// API Route for Automated Valuation Model (AVM)
import { NextRequest, NextResponse } from 'next/server';

interface ValuationRequest {
  address: string;
  postcode: string;
  propertyType: string;
  bedrooms: number;
  bathrooms?: number;
  receptionRooms?: number;
  squareFootage?: number;
  condition?: 'poor' | 'average' | 'good' | 'excellent';
  yearBuilt?: number;
}

interface ComparableSale {
  address: string;
  price: number;
  date: string;
  bedrooms: number;
  propertyType: string;
  distance: number; // miles
}

interface ValuationResult {
  estimate: number;
  lowEstimate: number;
  highEstimate: number;
  confidence: number; // 0-100
  confidenceLevel: 'high' | 'medium' | 'low';
  comparables: ComparableSale[];
  marketTrend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: string;
  };
  factors: {
    positive: string[];
    negative: string[];
  };
  lastUpdated: string;
}

// Mock comparable sales database
const mockComparables: Record<string, ComparableSale[]> = {
  'EN6': [
    { address: '15 Station Road, Cuffley', price: 725000, date: '2024-12-15', bedrooms: 4, propertyType: 'Detached', distance: 0.3 },
    { address: '42 The Walk, Cuffley', price: 680000, date: '2024-11-20', bedrooms: 4, propertyType: 'Detached', distance: 0.5 },
    { address: '8 Church Lane, Cuffley', price: 695000, date: '2024-10-05', bedrooms: 3, propertyType: 'Semi-Detached', distance: 0.4 },
    { address: '123 High Street, Cuffley', price: 750000, date: '2025-01-10', bedrooms: 4, propertyType: 'Detached', distance: 0.2 },
  ],
  'AL9': [
    { address: '22 Brookmans Avenue, Brookmans Park', price: 950000, date: '2024-12-20', bedrooms: 5, propertyType: 'Detached', distance: 0.6 },
    { address: '5 Bradmore Green, Brookmans Park', price: 625000, date: '2024-11-15', bedrooms: 3, propertyType: 'Semi-Detached', distance: 0.4 },
    { address: '88 Station Road, Brookmans Park', price: 875000, date: '2025-01-05', bedrooms: 4, propertyType: 'Detached', distance: 0.5 },
  ],
  'EN8': [
    { address: '45 High Street, Cheshunt', price: 425000, date: '2024-12-10', bedrooms: 3, propertyType: 'Terraced', distance: 0.3 },
    { address: '12 Windmill Lane, Cheshunt', price: 550000, date: '2024-11-25', bedrooms: 3, propertyType: 'Semi-Detached', distance: 0.5 },
  ],
};

// Base prices per area (price per square foot)
const basePrices: Record<string, number> = {
  'EN6': 425, // Cuffley, Potters Bar
  'AL9': 480, // Brookmans Park
  'EN8': 350, // Cheshunt
  'default': 400,
};

function getPostcodeArea(postcode: string): string {
  const match = postcode.match(/^([A-Z]{1,2}\d)/i);
  return match ? match[1].toUpperCase() : 'default';
}

function findComparables(
  postcodeArea: string,
  propertyType: string,
  bedrooms: number
): ComparableSale[] {
  const allComparables = mockComparables[postcodeArea] || mockComparables['EN6'];
  
  // Score comparables by similarity
  const scored = allComparables.map(comp => {
    let score = 0;
    if (comp.bedrooms === bedrooms) score += 50;
    if (Math.abs(comp.bedrooms - bedrooms) === 1) score += 30;
    if (comp.propertyType.toLowerCase() === propertyType.toLowerCase()) score += 30;
    score += (1 - Math.min(comp.distance, 1)) * 20; // Closer is better
    return { ...comp, similarity: score };
  });

  // Sort by similarity and return top 4
  return scored
    .sort((a, b) => (b as any).similarity - (a as any).similarity)
    .slice(0, 4)
    .map(({ similarity, ...comp }) => comp as ComparableSale);
}

function calculateValuation(
  request: ValuationRequest,
  comparables: ComparableSale[]
): ValuationResult {
  const postcodeArea = getPostcodeArea(request.postcode);
  
  // Calculate average from comparables
  const avgComparablePrice = comparables.reduce((sum, c) => sum + c.price, 0) / comparables.length;
  
  // Base calculation on property characteristics
  const basePrice = basePrices[postcodeArea] || basePrices.default;
  const defaultSqFt = request.bedrooms * 350; // Estimate if not provided
  const sqFootage = request.squareFootage || defaultSqFt;
  
  let estimatedValue = basePrice * sqFootage;
  
  // Adjust for bedrooms
  const bedroomDiff = request.bedrooms - 3; // 3 bed is baseline
  estimatedValue *= (1 + bedroomDiff * 0.15);
  
  // Adjust for bathrooms
  if (request.bathrooms) {
    const bathDiff = request.bathrooms - 1;
    estimatedValue *= (1 + bathDiff * 0.05);
  }
  
  // Adjust for condition
  const conditionMultipliers: Record<string, number> = {
    poor: 0.85,
    average: 0.95,
    good: 1.0,
    excellent: 1.08,
  };
  estimatedValue *= conditionMultipliers[request.condition || 'good'];
  
  // Adjust for age
  if (request.yearBuilt) {
    const age = new Date().getFullYear() - request.yearBuilt;
    if (age < 5) estimatedValue *= 1.05; // New build premium
    else if (age > 50) estimatedValue *= 0.95; // Older property
  }
  
  // Blend with comparable sales
  estimatedValue = (estimatedValue * 0.6) + (avgComparablePrice * 0.4);
  
  // Calculate confidence based on data quality
  let confidence = 70;
  if (comparables.length >= 4) confidence += 10;
  if (request.squareFootage) confidence += 10;
  if (request.condition) confidence += 5;
  if (comparables.every(c => Math.abs(c.bedrooms - request.bedrooms) <= 1)) confidence += 5;
  confidence = Math.min(95, confidence);
  
  const confidenceLevel = confidence >= 80 ? 'high' : confidence >= 60 ? 'medium' : 'low';
  
  // Calculate range based on confidence
  const rangeMultiplier = (100 - confidence) / 100;
  const lowEstimate = Math.round(estimatedValue * (1 - rangeMultiplier * 0.8));
  const highEstimate = Math.round(estimatedValue * (1 + rangeMultiplier * 0.8));
  
  // Generate factors
  const positiveFactors: string[] = [];
  const negativeFactors: string[] = [];
  
  if (request.bedrooms >= 4) positiveFactors.push('Good-sized family home');
  if (request.condition === 'excellent') positiveFactors.push('Excellent condition');
  if (comparables.some(c => c.date > '2025-01-01')) positiveFactors.push('Recent strong sales in area');
  
  if (request.condition === 'poor') negativeFactors.push('Requires refurbishment');
  if (comparables.length < 3) negativeFactors.push('Limited comparable sales data');
  
  // Market trend (mock)
  const marketTrend = {
    direction: 'up' as const,
    percentage: 2.3,
    period: 'Last 12 months',
  };
  
  return {
    estimate: Math.round(estimatedValue),
    lowEstimate,
    highEstimate,
    confidence,
    confidenceLevel,
    comparables,
    marketTrend,
    factors: {
      positive: positiveFactors,
      negative: negativeFactors,
    },
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const address = searchParams.get('address');
    const postcode = searchParams.get('postcode');
    const propertyType = searchParams.get('propertyType');
    const bedrooms = searchParams.get('bedrooms');
    
    if (!address || !postcode || !propertyType || !bedrooms) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    const valuationRequest: ValuationRequest = {
      address,
      postcode,
      propertyType,
      bedrooms: parseInt(bedrooms, 10),
      bathrooms: searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!, 10) : undefined,
      receptionRooms: searchParams.get('receptionRooms') ? parseInt(searchParams.get('receptionRooms')!, 10) : undefined,
      squareFootage: searchParams.get('squareFootage') ? parseInt(searchParams.get('squareFootage')!, 10) : undefined,
      condition: (searchParams.get('condition') as any) || 'good',
      yearBuilt: searchParams.get('yearBuilt') ? parseInt(searchParams.get('yearBuilt')!, 10) : undefined,
    };
    
    const postcodeArea = getPostcodeArea(postcode);
    const comparables = findComparables(postcodeArea, propertyType, valuationRequest.bedrooms);
    const valuation = calculateValuation(valuationRequest, comparables);
    
    return NextResponse.json({
      success: true,
      valuation,
    });
  } catch (error) {
    console.error('AVM API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate valuation' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ValuationRequest = await request.json();
    
    if (!body.address || !body.postcode || !body.propertyType || !body.bedrooms) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    const postcodeArea = getPostcodeArea(body.postcode);
    const comparables = findComparables(postcodeArea, body.propertyType, body.bedrooms);
    const valuation = calculateValuation(body, comparables);
    
    return NextResponse.json({
      success: true,
      valuation,
    });
  } catch (error) {
    console.error('AVM API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate valuation' },
      { status: 500 }
    );
  }
}