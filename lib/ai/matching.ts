// AI Matching Algorithm for Property Recommendations
import { Property, PropertyPrice } from '@/types/property';

// Helper to extract numeric price
function getPriceAmount(price: PropertyPrice | number): number {
  if (typeof price === 'number') return price;
  return price?.amount || 0;
}

export interface UserRequirements {
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  locations?: string[];
  bedrooms?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  propertyType?: string;
  propertyTypes?: string[];
  features?: string[];
  mustHaves?: string[];
}

export interface MatchResult {
  property: Property;
  score: number;
  breakdown: {
    price: number;
    location: number;
    bedrooms: number;
    propertyType: number;
    features: number;
  };
  reasons: string[];
}

const WEIGHTS = {
  price: 0.25,
  location: 0.25,
  bedrooms: 0.20,
  propertyType: 0.15,
  features: 0.15,
};

export function calculateMatchScore(
  property: Property,
  requirements: UserRequirements
): MatchResult {
  const breakdown = {
    price: calculatePriceScore(property, requirements),
    location: calculateLocationScore(property, requirements),
    bedrooms: calculateBedroomsScore(property, requirements),
    propertyType: calculatePropertyTypeScore(property, requirements),
    features: calculateFeaturesScore(property, requirements),
  };

  const score = Math.round(
    breakdown.price * WEIGHTS.price +
    breakdown.location * WEIGHTS.location +
    breakdown.bedrooms * WEIGHTS.bedrooms +
    breakdown.propertyType * WEIGHTS.propertyType +
    breakdown.features * WEIGHTS.features
  );

  const reasons = generateMatchReasons(property, requirements, breakdown);

  return {
    property,
    score,
    breakdown,
    reasons,
  };
}

function calculatePriceScore(property: Property, req: UserRequirements): number {
  const price = getPriceAmount(property.price);
  const minPrice = req.minPrice || 0;
  const maxPrice = req.maxPrice || Infinity;

  // If property is within budget
  if (price >= minPrice && price <= maxPrice) {
    // Perfect match if in the middle 50% of range
    const range = maxPrice - minPrice;
    const midPoint = (minPrice + maxPrice) / 2;
    const deviation = Math.abs(price - midPoint) / (range / 2);
    return Math.max(60, 100 - deviation * 40);
  }

  // Property above budget - penalize heavily
  if (price > maxPrice) {
    const overBudget = (price - maxPrice) / maxPrice;
    return Math.max(0, 100 - overBudget * 200);
  }

  // Property below minimum - slight penalty
  if (price < minPrice) {
    const underBudget = (minPrice - price) / minPrice;
    return Math.max(40, 90 - underBudget * 100);
  }

  return 50;
}

function calculateLocationScore(property: Property, req: UserRequirements): number {
  if (!req.location && (!req.locations || req.locations.length === 0)) {
    return 75; // Neutral if no location specified
  }

  const propertyLocation = `${property.address?.town || ''} ${property.address?.county || ''}`.toLowerCase().trim();
  const searchLocations = req.locations || [req.location || ''];

  for (const loc of searchLocations) {
    if (!loc) continue;
    const normalizedLoc = loc.toLowerCase();
    
    // Exact match
    if (propertyLocation.includes(normalizedLoc) || normalizedLoc.includes(propertyLocation)) {
      return 100;
    }
    
    // Partial match (e.g., "Cuffley" matches "Cuffley, Hertfordshire")
    const locWords = normalizedLoc.split(/[\s,]+/);
    for (const word of locWords) {
      if (word.length > 3 && propertyLocation.includes(word)) {
        return 85;
      }
    }
  }

  return 30;
}

function calculateBedroomsScore(property: Property, req: UserRequirements): number {
  const propertyBeds = property.details?.bedrooms || 0;
  const targetBeds = req.bedrooms || req.minBedrooms;

  if (!targetBeds) {
    return 75; // Neutral if no bedroom requirement
  }

  const difference = Math.abs(propertyBeds - targetBeds);

  if (difference === 0) return 100;
  if (difference === 1) return 80;
  if (difference === 2) return 50;
  return Math.max(0, 100 - difference * 30);
}

function calculatePropertyTypeScore(property: Property, req: UserRequirements): number {
  if (!req.propertyType && (!req.propertyTypes || req.propertyTypes.length === 0)) {
    return 75; // Neutral if no type specified
  }

  const propertyType = property.details?.propertyType?.toLowerCase() || '';
  const searchTypes = req.propertyTypes || [req.propertyType || ''];

  for (const type of searchTypes) {
    if (!type) continue;
    const normalizedType = type.toLowerCase();
    
    if (propertyType === normalizedType) return 100;
    if (propertyType.includes(normalizedType) || normalizedType.includes(propertyType)) {
      return 80;
    }
  }

  return 40;
}

function calculateFeaturesScore(property: Property, req: UserRequirements): number {
  if (!req.features || req.features.length === 0) {
    return 75; // Neutral if no features specified
  }

  const propertyFeatures = (property.features || []).map((f: string) => f.toLowerCase());
  const requiredFeatures = req.features.map(f => f.toLowerCase());
  const mustHaves = (req.mustHaves || []).map(f => f.toLowerCase());

  let matchedCount = 0;
  let mustHaveMatched = 0;

  for (const feature of requiredFeatures) {
    const hasFeature = propertyFeatures.some((pf: string) => 
      pf.includes(feature) || feature.includes(pf)
    );
    if (hasFeature) matchedCount++;
  }

  // Check must-haves (critical)
  for (const mustHave of mustHaves) {
    const hasMustHave = propertyFeatures.some((pf: string) => 
      pf.includes(mustHave) || mustHave.includes(pf)
    );
    if (hasMustHave) mustHaveMatched++;
  }

  // If any must-have is missing, severely penalize
  if (mustHaves.length > 0 && mustHaveMatched < mustHaves.length) {
    return Math.max(0, (mustHaveMatched / mustHaves.length) * 50);
  }

  return Math.round((matchedCount / requiredFeatures.length) * 100);
}

function generateMatchReasons(
  property: Property,
  req: UserRequirements,
  breakdown: MatchResult['breakdown']
): string[] {
  const reasons: string[] = [];

  if (breakdown.price >= 90) {
    reasons.push('Excellent price match for your budget');
  } else if (breakdown.price >= 70) {
    reasons.push('Within your price range');
  }

  if (breakdown.location >= 90) {
    reasons.push(`Located in your preferred area: ${property.address?.town || 'this area'}`);
  } else if (breakdown.location >= 70) {
    reasons.push('Near your search location');
  }

  if (breakdown.bedrooms >= 90) {
    reasons.push(`${property.details?.bedrooms} bedrooms as requested`);
  } else if (breakdown.bedrooms >= 70) {
    reasons.push(`${property.details?.bedrooms} bedrooms (close to your needs)`);
  }

  if (breakdown.propertyType >= 80) {
    reasons.push(`Perfect ${property.details?.propertyType} for your needs`);
  }

  if (breakdown.features >= 80 && property.features) {
    const topFeatures = property.features.slice(0, 2);
    reasons.push(`Has ${topFeatures.join(', ')}`);
  }

  if (reasons.length === 0) {
    reasons.push('Similar to properties you\'ve viewed');
  }

  return reasons;
}

// Get recommendations based on user behavior
export function getRecommendations(
  properties: Property[],
  requirements: UserRequirements,
  limit: number = 6
): MatchResult[] {
  const matches = properties.map(property => 
    calculateMatchScore(property, requirements)
  );

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  // Return top matches above threshold
  return matches
    .filter(m => m.score > 40)
    .slice(0, limit);
}

// Infer user preferences from search history
export function inferRequirementsFromHistory(
  searchHistory: UserRequirements[],
  viewedProperties: Property[]
): UserRequirements {
  if (searchHistory.length === 0 && viewedProperties.length === 0) {
    return {};
  }

  const prices = viewedProperties.map(p => getPriceAmount(p.price)).filter(Boolean);
  const bedrooms = viewedProperties.map(p => p.details?.bedrooms).filter((b): b is number => typeof b === 'number');
  const locations = viewedProperties.map(p => p.address?.town).filter((l): l is string => typeof l === 'string');
  const types = viewedProperties.map(p => p.details?.propertyType).filter((t): t is string => typeof t === 'string');

  return {
    minPrice: prices.length > 0 ? Math.min(...prices) * 0.8 : undefined,
    maxPrice: prices.length > 0 ? Math.max(...prices) * 1.2 : undefined,
    bedrooms: bedrooms.length > 0 ? 
      Math.round(bedrooms.reduce((a, b) => a + b, 0) / bedrooms.length) : undefined,
    locations: [...new Set(locations)].slice(0, 3),
    propertyTypes: [...new Set(types)].slice(0, 2),
  };
}