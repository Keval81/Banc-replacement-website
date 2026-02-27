import { EPCCertificate } from '@/lib/types/data';

const EPC_API_URL = 'https://epc.opendatacommunities.org/api/v1/domestic';

// Cache for 30 days
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;
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

// Fetch EPC data by address
export async function fetchEPCByAddress(
  address: string,
  postcode: string
): Promise<EPCCertificate | null> {
  const cacheKey = getCacheKey('epc-address', `${address}:${postcode}`);
  const cached = getCachedData<EPCCertificate>(cacheKey);
  if (cached) return cached;

  try {
    // Open Data Communities EPC API
    const apiKey = process.env.EPC_API_KEY;
    
    const searchUrl = new URL(`${EPC_API_URL}/search`);
    searchUrl.searchParams.append('postcode', postcode);
    searchUrl.searchParams.append('address', address);
    searchUrl.searchParams.append('size', '1');

    const response = await fetch(searchUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        ...(apiKey ? { 'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}` } : {}),
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`EPC API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.rows || data.rows.length === 0) {
      return null;
    }

    const row = data.rows[0];
    const certificate = parseEPCData(row);

    setCachedData(cacheKey, certificate);
    return certificate;
  } catch (error) {
    console.error('Error fetching EPC:', error);
    // Return mock data as fallback
    return getMockEPC(address, postcode);
  }
}

// Fetch EPC data by UPRN (Unique Property Reference Number)
export async function fetchEPCByUPRN(uprn: string): Promise<EPCCertificate | null> {
  const cacheKey = getCacheKey('epc-uprn', uprn);
  const cached = getCachedData<EPCCertificate>(cacheKey);
  if (cached) return cached;

  try {
    const apiKey = process.env.EPC_API_KEY;
    
    const searchUrl = new URL(`${EPC_API_URL}/search`);
    searchUrl.searchParams.append('uprn', uprn);
    searchUrl.searchParams.append('size', '1');

    const response = await fetch(searchUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        ...(apiKey ? { 'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}` } : {}),
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`EPC API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.rows || data.rows.length === 0) {
      return null;
    }

    const certificate = parseEPCData(data.rows[0]);

    setCachedData(cacheKey, certificate);
    return certificate;
  } catch (error) {
    console.error('Error fetching EPC by UPRN:', error);
    return null;
  }
}

// Parse EPC API response
function parseEPCData(row: any): EPCCertificate {
  return {
    lmkKey: row.lmk_key || '',
    address: row.address || '',
    postcode: row.postcode || '',
    currentRating: (row.current_energy_rating || 'G').toUpperCase() as EPCCertificate['currentRating'],
    potentialRating: (row.potential_energy_rating || 'G').toUpperCase() as EPCCertificate['potentialRating'],
    currentScore: parseInt(row.current_energy_efficiency) || 0,
    potentialScore: parseInt(row.potential_energy_efficiency) || 0,
    propertyType: row.property_type || 'Unknown',
    builtForm: row.built_form || 'Unknown',
    inspectionDate: row.inspection_date || '',
    lodgementDate: row.lodgement_date || '',
    transactionType: row.transaction_type || '',
    totalFloorArea: parseFloat(row.total_floor_area) || 0,
    energyConsumption: parseFloat(row.energy_consumption_current) || 0,
    co2Emissions: parseFloat(row.co2_emissions_current) || 0,
    co2EmissionsPotential: parseFloat(row.co2_emissions_potential) || 0,
    heatingCostCurrent: parseInt(row.heating_cost_current) || 0,
    heatingCostPotential: parseInt(row.heating_cost_potential) || 0,
    hotWaterCostCurrent: parseInt(row.hot_water_cost_current) || 0,
    hotWaterCostPotential: parseInt(row.hot_water_cost_potential) || 0,
    lightingCostCurrent: parseInt(row.lighting_cost_current) || 0,
    lightingCostPotential: parseInt(row.lighting_cost_potential) || 0,
    improvements: parseImprovements(row),
  };
}

// Parse improvements from EPC data
function parseImprovements(row: any): EPCCertificate['improvements'] {
  const improvements: EPCCertificate['improvements'] = [];
  
  // EPC data has up to 3 improvements
  for (let i = 1; i <= 3; i++) {
    const category = row[`improvement_${i}_category`];
    const description = row[`improvement_${i}_description`];
    const cost = row[`improvement_${i}_typical_saving`];
    
    if (description) {
      improvements.push({
        sequence: i,
        improvementCategory: category || 'General',
        improvementCode: row[`improvement_${i}_code`] || '',
        improvementDescription: description,
        typicalSaving: parseInt(cost) || 0,
        indicativeCost: row[`improvement_${i}_indicative_cost`] || '',
        improvementId: `${row.lmk_key}_${i}`,
      });
    }
  }
  
  return improvements;
}

// Get EPC recommendations for improvement
export async function getEPCRecommendations(lmkKey: string): Promise<string[]> {
  try {
    const certificate = await fetchEPCByLMKKey(lmkKey);
    if (!certificate) return [];

    return certificate.improvements.map(imp => imp.improvementDescription);
  } catch (error) {
    console.error('Error getting EPC recommendations:', error);
    return [];
  }
}

// Fetch EPC by LMK key
async function fetchEPCByLMKKey(lmkKey: string): Promise<EPCCertificate | null> {
  const cacheKey = getCacheKey('epc-lmk', lmkKey);
  const cached = getCachedData<EPCCertificate>(cacheKey);
  if (cached) return cached;

  try {
    const apiKey = process.env.EPC_API_KEY;
    
    const response = await fetch(`${EPC_API_URL}/certificate/${lmkKey}`, {
      headers: {
        'Accept': 'application/json',
        ...(apiKey ? { 'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}` } : {}),
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const certificate = parseEPCData(data);

    setCachedData(cacheKey, certificate);
    return certificate;
  } catch (error) {
    console.error('Error fetching EPC by LMK:', error);
    return null;
  }
}

// Get average EPC rating for postcode
export async function getAverageEPCForPostcode(postcode: string): Promise<{ 
  averageRating: string; 
  averageScore: number;
  totalProperties: number;
}> {
  try {
    const apiKey = process.env.EPC_API_KEY;
    
    const searchUrl = new URL(`${EPC_API_URL}/search`);
    searchUrl.searchParams.append('postcode', postcode);
    searchUrl.searchParams.append('size', '100');

    const response = await fetch(searchUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        ...(apiKey ? { 'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`EPC API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.rows || data.rows.length === 0) {
      return { averageRating: 'D', averageScore: 60, totalProperties: 0 };
    }

    const scores = data.rows.map((row: any) => parseInt(row.current_energy_efficiency) || 0);
    const averageScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
    
    // Convert score to rating
    const averageRating = scoreToRating(averageScore);

    return {
      averageRating,
      averageScore,
      totalProperties: data.rows.length,
    };
  } catch (error) {
    console.error('Error fetching average EPC:', error);
    return { averageRating: 'D', averageScore: 60, totalProperties: 0 };
  }
}

// Convert score to rating
function scoreToRating(score: number): string {
  if (score >= 92) return 'A';
  if (score >= 81) return 'B';
  if (score >= 69) return 'C';
  if (score >= 55) return 'D';
  if (score >= 39) return 'E';
  if (score >= 21) return 'F';
  return 'G';
}

// Get estimated energy costs
export function calculateEstimatedCosts(certificate: EPCCertificate): {
  current: {
    heating: string;
    hotWater: string;
    lighting: string;
    total: string;
  };
  potential: {
    heating: string;
    hotWater: string;
    lighting: string;
    total: string;
  };
  savings: string;
} {
  return {
    current: {
      heating: `£${certificate.heatingCostCurrent}`,
      hotWater: `£${certificate.hotWaterCostCurrent}`,
      lighting: `£${certificate.lightingCostCurrent}`,
      total: `£${certificate.heatingCostCurrent + certificate.hotWaterCostCurrent + certificate.lightingCostCurrent}`,
    },
    potential: {
      heating: `£${certificate.heatingCostPotential}`,
      hotWater: `£${certificate.hotWaterCostPotential}`,
      lighting: `£${certificate.lightingCostPotential}`,
      total: `£${certificate.heatingCostPotential + certificate.hotWaterCostPotential + certificate.lightingCostPotential}`,
    },
    savings: `£${(certificate.heatingCostCurrent + certificate.hotWaterCostCurrent + certificate.lightingCostCurrent) -
      (certificate.heatingCostPotential + certificate.hotWaterCostPotential + certificate.lightingCostPotential)}`,
  };
}

// Mock data for development/fallback
function getMockEPC(address: string, postcode: string): EPCCertificate {
  return {
    lmkKey: 'mock-lmk-key',
    address,
    postcode,
    currentRating: 'D',
    potentialRating: 'B',
    currentScore: 68,
    potentialScore: 85,
    propertyType: 'House',
    builtForm: 'Semi-Detached',
    inspectionDate: '2024-01-15',
    lodgementDate: '2024-01-20',
    transactionType: 'marketed sale',
    totalFloorArea: 95.5,
    energyConsumption: 210,
    co2Emissions: 3.2,
    co2EmissionsPotential: 1.8,
    heatingCostCurrent: 720,
    heatingCostPotential: 450,
    hotWaterCostCurrent: 180,
    hotWaterCostPotential: 120,
    lightingCostCurrent: 95,
    lightingCostPotential: 65,
    improvements: [
      {
        sequence: 1,
        improvementCategory: 'Heating',
        improvementCode: 'I1',
        improvementDescription: 'Increase loft insulation to 270 mm',
        typicalSaving: 180,
        indicativeCost: '£100 - £350',
        improvementId: 'mock-1',
      },
      {
        sequence: 2,
        improvementCategory: 'Heating',
        improvementCode: 'I2',
        improvementDescription: 'Floor insulation (solid floor)',
        typicalSaving: 85,
        indicativeCost: '£4,000 - £6,000',
        improvementId: 'mock-2',
      },
      {
        sequence: 3,
        improvementCategory: 'Windows',
        improvementCode: 'I3',
        improvementDescription: 'Low energy lighting for all fixed outlets',
        typicalSaving: 30,
        indicativeCost: '£30',
        improvementId: 'mock-3',
      },
    ],
  };
}
