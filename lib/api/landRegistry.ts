import { SoldPriceRecord, SoldPriceStats, AreaStatistics } from '@/lib/types/data';
import { computeSoldPriceStats, mapSoldPriceBinding } from './land-registry-mapping';

// The /data/ppi/sparql path returns 400 for every request, so the query below
// never once succeeded and every call fell through to the fallback.
// The corrected endpoint then answered 200 with ZERO rows for every postcode,
// which reads like "no sales" but was a namespace typo: the register hangs
// address fields off def/common, not data/common.
const LAND_REGISTRY_QUERY_URL =
  'https://landregistry.data.gov.uk/landregistry/query';

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
      PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
      
      SELECT ?item ?price ?date ?paon ?saon ?street ?town ?propertyType ?estateType ?newBuild
      WHERE {
        ?item lrppi:pricePaid ?price ;
              lrppi:transactionDate ?date ;
              lrppi:propertyAddress ?address .
        ?address lrcommon:postcode "${postcode.toUpperCase()}" .
        OPTIONAL { ?address lrcommon:paon ?paon }
        OPTIONAL { ?address lrcommon:saon ?saon }
        OPTIONAL { ?address lrcommon:street ?street }
        OPTIONAL { ?address lrcommon:town ?town }
        OPTIONAL { ?item lrppi:propertyType ?propertyType }
        OPTIONAL { ?item lrppi:estateType ?estateType }
        OPTIONAL { ?item lrppi:newBuild ?newBuild }
      }
      ORDER BY DESC(?date)
      LIMIT 100
    `;

    const response = await fetch(LAND_REGISTRY_QUERY_URL, {
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
    
    const records: SoldPriceRecord[] = (data.results?.bindings ?? []).map(
      (binding: Record<string, { value: string } | undefined>, index: number) =>
        mapSoldPriceBinding(binding, postcode, index) as SoldPriceRecord,
    );

    setCachedData(cacheKey, records);
    return records;
  } catch (error) {
    // Never answer with invented sales. An estate agent publishing fabricated
    // sold prices is a great deal worse than a page that says it cannot reach
    // the register right now.
    console.error('Error fetching sold prices:', error);
    throw error instanceof Error ? error : new Error('Sold price lookup failed');
  }
}

// Fetch statistics for a postcode
export async function fetchSoldPriceStats(postcode: string): Promise<SoldPriceStats> {
  const cacheKey = getCacheKey('sold-price-stats', postcode);
  const cached = getCachedData<SoldPriceStats>(cacheKey);
  if (cached) return cached;

  try {
    const records = await fetchSoldPrices(postcode);

    // Price per square foot is deliberately absent: price-paid records carry no
    // floor area, and the figure this used to publish was averagePrice / 1000.
    const stats: SoldPriceStats = computeSoldPriceStats(records);

    setCachedData(cacheKey, stats);
    return stats;
  } catch (error) {
    console.error('Error calculating price stats:', error);
    throw error instanceof Error ? error : new Error('Land Registry lookup failed');
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
      salesCount12Months: stats.salesCount12Months,
      priceChange1Year: stats.priceChangePercent,
      propertyTypeBreakdown: breakdown,
    };

    setCachedData(cacheKey, areaStats);
    return areaStats;
  } catch (error) {
    console.error('Error fetching area statistics:', error);
    throw error instanceof Error ? error : new Error('Land Registry lookup failed');
  }
}







// Search by street name
export async function searchSoldPricesByStreet(
  street: string,
  postcode?: string,
): Promise<SoldPriceRecord[]> {
  // This never had a real implementation — it filtered the mock generator and
  // returned the result as though it came from the register. Until the street
  // query is written against the live endpoint it answers with nothing rather
  // than with something invented.
  void street;
  void postcode;
  return [];
}
