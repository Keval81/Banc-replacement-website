import { SoldPriceRecord, SoldPriceStats, AreaStatistics } from '@/lib/types/data';

const LAND_REGISTRY_API_URL = 'https://landregistry.data.gov.uk/data/ppi';

// Cache for 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;
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

// Format price as GBP
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(price);
}

// Parse Land Registry property type
function parsePropertyType(type: string): SoldPriceRecord['propertyType'] {
  const typeMap: Record<string, SoldPriceRecord['propertyType']> = {
    'D': 'detached',
    'S': 'semi-detached',
    'T': 'terraced',
    'F': 'flat',
    'O': 'other',
  };
  return typeMap[type] || 'other';
}

// Parse tenure
function parseTenure(tenure: string): 'freehold' | 'leasehold' | 'unknown' {
  if (tenure.toLowerCase().includes('freehold')) return 'freehold';
  if (tenure.toLowerCase().includes('leasehold')) return 'leasehold';
  return 'unknown';
}

// Fetch sold prices for a postcode
export async function fetchSoldPrices(postcode: string): Promise<SoldPriceRecord[]> {
  const cacheKey = getCacheKey('sold-prices', postcode);
  const cached = getCachedData<SoldPriceRecord[]>(cacheKey);
  if (cached) return cached;

  try {
    // HM Land Registry SPARQL endpoint
    const sparqlQuery = `
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
      PREFIX lrcommon: <http://landregistry.data.gov.uk/data/common/>
      
      SELECT ?item ?price ?date ?address ?propertyType ?tenure ?newBuild
      WHERE {
        ?item lrppi:pricePaid ?price ;
              lrppi:transactionDate ?date ;
              lrppi:propertyAddress ?address .
        ?address lrcommon:postcode "${postcode.toUpperCase()}" .
        OPTIONAL { ?item lrppi:propertyType/skos:prefLabel ?propertyType }
        OPTIONAL { ?item lrppi:tenure/skos:prefLabel ?tenure }
        OPTIONAL { ?item lrppi:newBuild ?newBuild }
      }
      ORDER BY DESC(?date)
      LIMIT 100
    `;

    const response = await fetch(`${LAND_REGISTRY_API_URL}/sparql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: `query=${encodeURIComponent(sparqlQuery)}`,
    });

    if (!response.ok) {
      throw new Error(`Land Registry API error: ${response.status}`);
    }

    const data = await response.json();
    
    const records: SoldPriceRecord[] = data.results?.bindings?.map((binding: any, index: number) => ({
      id: binding.item?.value || `sale-${index}`,
      address: binding.address?.value || '',
      postcode: postcode.toUpperCase(),
      price: parseInt(binding.price?.value || '0'),
      priceFormatted: formatPrice(parseInt(binding.price?.value || '0')),
      date: binding.date?.value || '',
      propertyType: parsePropertyType(binding.propertyType?.value || 'O'),
      tenure: parseTenure(binding.tenure?.value || ''),
      newBuild: binding.newBuild?.value === 'true',
    })) || [];

    setCachedData(cacheKey, records);
    return records;
  } catch (error) {
    console.error('Error fetching sold prices:', error);
    // Return mock data as fallback
    return getMockSoldPrices(postcode);
  }
}

// Fetch statistics for a postcode
export async function fetchSoldPriceStats(postcode: string): Promise<SoldPriceStats> {
  const cacheKey = getCacheKey('sold-price-stats', postcode);
  const cached = getCachedData<SoldPriceStats>(cacheKey);
  if (cached) return cached;

  try {
    const records = await fetchSoldPrices(postcode);
    
    const prices = records.map(r => r.price);
    const total = prices.reduce((a, b) => a + b, 0);
    const averagePrice = prices.length > 0 ? total / prices.length : 0;
    
    // Calculate median
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const medianPrice = sortedPrices.length > 0
      ? sortedPrices[Math.floor(sortedPrices.length / 2)]
      : 0;

    // Count sales in last 12 and 6 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const sales12Months = records.filter(r => new Date(r.date) >= twelveMonthsAgo).length;
    const sales6Months = records.filter(r => new Date(r.date) >= sixMonthsAgo).length;

    // Calculate price change (compare last 6 months to previous 6 months)
    const previousSixMonths = records.filter(r => {
      const date = new Date(r.date);
      return date >= sixMonthsAgo && date < twelveMonthsAgo;
    });
    const previousAvg = previousSixMonths.length > 0
      ? previousSixMonths.reduce((a, r) => a + r.price, 0) / previousSixMonths.length
      : 0;
    
    const recentSixMonths = records.filter(r => new Date(r.date) >= sixMonthsAgo);
    const recentAvg = recentSixMonths.length > 0
      ? recentSixMonths.reduce((a, r) => a + r.price, 0) / recentSixMonths.length
      : 0;

    const priceChangePercent = previousAvg > 0
      ? ((recentAvg - previousAvg) / previousAvg) * 100
      : 0;

    // Estimate price per sqft (simplified)
    const pricePerSqft = averagePrice > 0 ? Math.round(averagePrice / 1000) : 0;

    const stats: SoldPriceStats = {
      averagePrice,
      medianPrice,
      priceChangePercent: Math.round(priceChangePercent * 10) / 10,
      salesCount12Months: sales12Months,
      salesCount6Months: sales6Months,
      pricePerSqft,
    };

    setCachedData(cacheKey, stats);
    return stats;
  } catch (error) {
    console.error('Error calculating price stats:', error);
    return getMockPriceStats();
  }
}

// Get area statistics
export async function fetchAreaStatistics(postcode: string): Promise<AreaStatistics> {
  const cacheKey = getCacheKey('area-stats', postcode);
  const cached = getCachedData<AreaStatistics>(cacheKey);
  if (cached) return cached;

  try {
    const records = await fetchSoldPrices(postcode);
    const stats = await fetchSoldPriceStats(postcode);

    // Property type breakdown
    const breakdown: Record<string, number> = {};
    records.forEach(r => {
      breakdown[r.propertyType] = (breakdown[r.propertyType] || 0) + 1;
    });

    const areaStats: AreaStatistics = {
      postcode,
      averagePrice: stats.averagePrice,
      medianPrice: stats.medianPrice,
      pricePerSqft: stats.pricePerSqft,
      salesCount12Months: stats.salesCount12Months,
      avgTimeOnMarket: 45, // Estimated average
      priceChange1Year: stats.priceChangePercent,
      priceChange3Years: stats.priceChangePercent * 2.5, // Estimate
      priceChange5Years: stats.priceChangePercent * 4, // Estimate
      propertyTypeBreakdown: breakdown,
    };

    setCachedData(cacheKey, areaStats);
    return areaStats;
  } catch (error) {
    console.error('Error fetching area statistics:', error);
    return getMockAreaStatistics(postcode);
  }
}

// Mock data for development/fallback
function getMockSoldPrices(postcode: string): SoldPriceRecord[] {
  const basePrice = 450000 + Math.random() * 200000;
  const now = new Date();
  
  return [
    {
      id: '1',
      address: '12 High Street',
      postcode,
      price: Math.round(basePrice),
      priceFormatted: formatPrice(Math.round(basePrice)),
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      propertyType: 'terraced',
      tenure: 'freehold',
      newBuild: false,
    },
    {
      id: '2',
      address: '45 Main Road',
      postcode,
      price: Math.round(basePrice * 1.1),
      priceFormatted: formatPrice(Math.round(basePrice * 1.1)),
      date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      propertyType: 'semi-detached',
      tenure: 'freehold',
      newBuild: false,
    },
    {
      id: '3',
      address: '8 Park Avenue',
      postcode,
      price: Math.round(basePrice * 0.95),
      priceFormatted: formatPrice(Math.round(basePrice * 0.95)),
      date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      propertyType: 'flat',
      tenure: 'leasehold',
      newBuild: false,
    },
    {
      id: '4',
      address: '23 Elm Close',
      postcode,
      price: Math.round(basePrice * 1.25),
      priceFormatted: formatPrice(Math.round(basePrice * 1.25)),
      date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      propertyType: 'detached',
      tenure: 'freehold',
      newBuild: true,
    },
    {
      id: '5',
      address: '7 Church Lane',
      postcode,
      price: Math.round(basePrice * 0.85),
      priceFormatted: formatPrice(Math.round(basePrice * 0.85)),
      date: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      propertyType: 'terraced',
      tenure: 'freehold',
      newBuild: false,
    },
  ];
}

function getMockPriceStats(): SoldPriceStats {
  return {
    averagePrice: 525000,
    medianPrice: 510000,
    priceChangePercent: 3.5,
    salesCount12Months: 47,
    salesCount6Months: 23,
    pricePerSqft: 525,
  };
}

function getMockAreaStatistics(postcode: string): AreaStatistics {
  return {
    postcode,
    averagePrice: 525000,
    medianPrice: 510000,
    pricePerSqft: 525,
    salesCount12Months: 47,
    avgTimeOnMarket: 42,
    priceChange1Year: 3.5,
    priceChange3Years: 12.8,
    priceChange5Years: 24.2,
    propertyTypeBreakdown: {
      'terraced': 15,
      'semi-detached': 12,
      'detached': 8,
      'flat': 12,
    },
  };
}

// Search by street name
export async function searchSoldPricesByStreet(street: string, postcode?: string): Promise<SoldPriceRecord[]> {
  const cacheKey = getCacheKey('sold-prices-street', `${street}:${postcode || ''}`);
  const cached = getCachedData<SoldPriceRecord[]>(cacheKey);
  if (cached) return cached;

  try {
    // Filter mock data by street name
    const mockData = getMockSoldPrices(postcode || 'SW1A 1AA');
    const filtered = mockData.filter(r => 
      r.address.toLowerCase().includes(street.toLowerCase())
    );
    
    setCachedData(cacheKey, filtered);
    return filtered;
  } catch (error) {
    console.error('Error searching sold prices:', error);
    return [];
  }
}
