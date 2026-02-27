import { School, CatchmentCheckResult } from '@/lib/types/data';

const EDUBASE_API_URL = 'https://api.get-information-schools.service.gov.uk';
const OFSTED_API_URL = 'https://api.ofsted.gov.uk';

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

// Geocode postcode using postcodes.io
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

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Estimate walking time in minutes
function estimateWalkingTime(distanceKm: number): number {
  const walkingSpeedKmh = 5; // Average walking speed
  return Math.round((distanceKm / walkingSpeedKmh) * 60);
}

// Fetch schools near a postcode
export async function fetchSchoolsNearby(
  postcode: string,
  options?: {
    phase?: 'primary' | 'secondary' | 'all-through' | 'sixth-form';
    maxDistance?: number; // km
    limit?: number;
  }
): Promise<School[]> {
  const cacheKey = getCacheKey('schools-nearby', `${postcode}:${JSON.stringify(options)}`);
  const cached = getCachedData<School[]>(cacheKey);
  if (cached) return cached;

  try {
    const coords = await geocodePostcode(postcode);
    if (!coords) {
      throw new Error('Could not geocode postcode');
    }

    // Search radius in meters (default 3km)
    const radius = (options?.maxDistance || 3) * 1000;

    // Edubase API endpoint for school search
    const searchUrl = new URL(`${EDUBASE_API_URL}/schools`);
    searchUrl.searchParams.append('lat', coords.lat.toString());
    searchUrl.searchParams.append('lng', coords.lng.toString());
    searchUrl.searchParams.append('dist', radius.toString());
    searchUrl.searchParams.append('limit', (options?.limit || 20).toString());
    
    if (options?.phase) {
      searchUrl.searchParams.append('phase', options.phase);
    }

    const response = await fetch(searchUrl.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Edubase API error: ${response.status}`);
    }

    const data = await response.json();
    
    const schools: School[] = await Promise.all(
      (data.schools || []).map(async (school: any) => {
        const schoolLat = school.location?.lat;
        const schoolLng = school.location?.lng;
        
        let distance = 0;
        if (schoolLat && schoolLng) {
          distance = calculateDistance(coords.lat, coords.lng, schoolLat, schoolLng);
        }

        // Fetch Ofsted data
        const ofstedData = await fetchOfstedData(school.urn);

        return {
          id: school.urn?.toString() || '',
          name: school.name || 'Unknown School',
          address: [
            school.address?.street,
            school.address?.locality,
            school.address?.town,
            school.address?.postcode,
          ].filter(Boolean).join(', '),
          postcode: school.address?.postcode || '',
          type: parseSchoolType(school.type),
          phase: parsePhase(school.phase),
          ofstedRating: ofstedData?.rating || 'Not Inspected',
          ofstedDate: ofstedData?.date,
          ofstedReportUrl: ofstedData?.reportUrl,
          distance: Math.round(distance * 100) / 100,
          walkingTime: estimateWalkingTime(distance),
          coordinates: {
            lat: schoolLat || 0,
            lng: schoolLng || 0,
          },
          gender: parseGender(school.gender),
          ageRange: {
            min: school.statutoryLowAge || 0,
            max: school.statutoryHighAge || 0,
          },
          totalPupils: school.numberOfPupils,
          religion: school.religiousCharacter,
          hasSixthForm: school.hasSixthForm || false,
        };
      })
    );

    // Sort by distance
    schools.sort((a, b) => a.distance - b.distance);

    setCachedData(cacheKey, schools);
    return schools;
  } catch (error) {
    console.error('Error fetching schools:', error);
    // Return mock data as fallback
    return getMockSchools(postcode);
  }
}

// Fetch Ofsted rating for a school
async function fetchOfstedData(urn: string): Promise<{ rating: School['ofstedRating']; date?: string; reportUrl?: string } | null> {
  try {
    const response = await fetch(`${OFSTED_API_URL}/schools/${urn}/inspections/latest`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const validRatings: School['ofstedRating'][] = ['Outstanding', 'Good', 'Requires Improvement', 'Inadequate', 'Not Inspected'];
    const rating = validRatings.includes(data.overallEffectiveness) ? data.overallEffectiveness : 'Not Inspected';
    return {
      rating,
      date: data.inspectionDate,
      reportUrl: data.reportUrl,
    };
  } catch (error) {
    console.error('Error fetching Ofsted data:', error);
    return null;
  }
}

// Parse school type
function parseSchoolType(type: string): School['type'] {
  const typeLower = type?.toLowerCase() || '';
  if (typeLower.includes('independent')) return 'independent';
  if (typeLower.includes('academy')) return 'academy';
  if (typeLower.includes('grammar')) return 'grammar';
  return 'primary'; // default
}

// Parse phase
function parsePhase(phase: string): School['phase'] {
  const phaseLower = phase?.toLowerCase() || '';
  if (phaseLower.includes('secondary')) return 'secondary';
  if (phaseLower.includes('all-through')) return 'all-through';
  if (phaseLower.includes('sixth') || phaseLower.includes('16+')) return 'sixth-form';
  return 'primary';
}

// Parse gender
function parseGender(gender: string): School['gender'] {
  const genderLower = gender?.toLowerCase() || '';
  if (genderLower.includes('boys')) return 'boys';
  if (genderLower.includes('girls')) return 'girls';
  return 'mixed';
}

// Check if address is in catchment area
export async function checkCatchment(
  postcode: string,
  schoolId: string
): Promise<CatchmentCheckResult> {
  const cacheKey = getCacheKey('catchment-check', `${postcode}:${schoolId}`);
  const cached = getCachedData<CatchmentCheckResult>(cacheKey);
  if (cached) return cached;

  try {
    const coords = await geocodePostcode(postcode);
    if (!coords) {
      throw new Error('Could not geocode postcode');
    }

    // Fetch school details
    const schoolResponse = await fetch(`${EDUBASE_API_URL}/schools/${schoolId}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!schoolResponse.ok) {
      throw new Error('School not found');
    }

    const schoolData = await schoolResponse.json();
    const schoolLat = schoolData.location?.lat;
    const schoolLng = schoolData.location?.lng;

    if (!schoolLat || !schoolLng) {
      throw new Error('School location not available');
    }

    const distance = calculateDistance(coords.lat, coords.lng, schoolLat, schoolLng);
    const walkingTime = estimateWalkingTime(distance);

    // Get schools data for Ofsted rating
    const ofstedData = await fetchOfstedData(schoolId);

    const school: School = {
      id: schoolData.urn?.toString() || '',
      name: schoolData.name || 'Unknown School',
      address: [
        schoolData.address?.street,
        schoolData.address?.locality,
        schoolData.address?.town,
        schoolData.address?.postcode,
      ].filter(Boolean).join(', '),
      postcode: schoolData.address?.postcode || '',
      type: parseSchoolType(schoolData.type),
      phase: parsePhase(schoolData.phase),
      ofstedRating: ofstedData?.rating || 'Not Inspected',
      ofstedDate: ofstedData?.date,
      distance: Math.round(distance * 100) / 100,
      walkingTime,
      coordinates: { lat: schoolLat, lng: schoolLng },
      gender: parseGender(schoolData.gender),
      ageRange: {
        min: schoolData.statutoryLowAge || 0,
        max: schoolData.statutoryHighAge || 0,
      },
    };

    // Determine catchment likelihood based on distance
    let likelihood: 'high' | 'medium' | 'low' | 'unknown' = 'unknown';
    const typicalCatchmentRadius = school.phase === 'primary' ? 1.5 : 3; // km

    if (distance <= typicalCatchmentRadius * 0.5) {
      likelihood = 'high';
    } else if (distance <= typicalCatchmentRadius) {
      likelihood = 'medium';
    } else {
      likelihood = 'low';
    }

    const result: CatchmentCheckResult = {
      school,
      distance: Math.round(distance * 100) / 100,
      walkingTime,
      inCatchment: likelihood !== 'low',
      lastYearAdmissionDistance: typicalCatchmentRadius,
      likelihood,
    };

    setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error checking catchment:', error);
    // Return mock data as fallback
    return getMockCatchmentResult(postcode, schoolId);
  }
}

// Fetch all schools for catchment checker
export async function fetchAllSchools(postcode: string, maxDistance: number = 5): Promise<School[]> {
  return fetchSchoolsNearby(postcode, { maxDistance, limit: 50 });
}

// Mock data for development/fallback
function getMockSchools(postcode: string): School[] {
  return [
    {
      id: '101',
      name: 'St. Mary\'s Primary School',
      address: '123 Church Road, London',
      postcode,
      type: 'primary',
      phase: 'primary',
      ofstedRating: 'Outstanding',
      ofstedDate: '2024-03-15',
      distance: 0.3,
      walkingTime: 4,
      coordinates: { lat: 51.5, lng: -0.1 },
      gender: 'mixed',
      ageRange: { min: 4, max: 11 },
      totalPupils: 420,
    },
    {
      id: '102',
      name: 'Oak Tree Academy',
      address: '45 Oak Street, London',
      postcode,
      type: 'academy',
      phase: 'secondary',
      ofstedRating: 'Good',
      ofstedDate: '2023-11-20',
      distance: 0.8,
      walkingTime: 10,
      coordinates: { lat: 51.51, lng: -0.11 },
      gender: 'mixed',
      ageRange: { min: 11, max: 18 },
      totalPupils: 850,
      hasSixthForm: true,
    },
    {
      id: '103',
      name: 'St. John\'s CofE School',
      address: '78 High Street, London',
      postcode,
      type: 'primary',
      phase: 'primary',
      ofstedRating: 'Good',
      ofstedDate: '2024-01-10',
      distance: 0.5,
      walkingTime: 6,
      coordinates: { lat: 51.49, lng: -0.09 },
      gender: 'mixed',
      ageRange: { min: 4, max: 11 },
      totalPupils: 380,
      religion: 'Church of England',
    },
    {
      id: '104',
      name: 'Parkside Grammar School',
      address: '22 Park Lane, London',
      postcode,
      type: 'grammar',
      phase: 'secondary',
      ofstedRating: 'Outstanding',
      ofstedDate: '2023-06-30',
      distance: 1.2,
      walkingTime: 15,
      coordinates: { lat: 51.52, lng: -0.08 },
      gender: 'mixed',
      ageRange: { min: 11, max: 18 },
      totalPupils: 1200,
      hasSixthForm: true,
    },
    {
      id: '105',
      name: 'Riverside Independent School',
      address: '56 Riverside Drive, London',
      postcode,
      type: 'independent',
      phase: 'all-through',
      ofstedRating: 'Good',
      ofstedDate: '2023-09-05',
      distance: 1.5,
      walkingTime: 18,
      coordinates: { lat: 51.48, lng: -0.12 },
      gender: 'mixed',
      ageRange: { min: 3, max: 18 },
      totalPupils: 650,
    },
  ];
}

function getMockCatchmentResult(postcode: string, schoolId: string): CatchmentCheckResult {
  const school = getMockSchools(postcode).find(s => s.id === schoolId) || getMockSchools(postcode)[0];
  const distance = 0.5;
  
  return {
    school,
    distance,
    walkingTime: 6,
    inCatchment: true,
    lastYearAdmissionDistance: 1.2,
    likelihood: 'high',
  };
}
