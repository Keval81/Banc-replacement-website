export interface SoldPriceRecord {
  id: string;
  address: string;
  postcode: string;
  price: number;
  priceFormatted: string;
  date: string;
  propertyType: 'detached' | 'semi-detached' | 'terraced' | 'flat' | 'other';
  tenure: 'freehold' | 'leasehold' | 'unknown';
  newBuild: boolean;
}

export interface SoldPriceStats {
  averagePrice: number;
  medianPrice: number;
  priceChangePercent: number;
  salesCount12Months: number;
  salesCount6Months: number;
}

export interface School {
  id: string;
  name: string;
  address: string;
  postcode: string;
  type: 'primary' | 'secondary' | 'independent' | 'academy' | 'grammar';
  phase: 'primary' | 'secondary' | 'all-through' | 'sixth-form';
  ofstedRating: 'Outstanding' | 'Good' | 'Requires Improvement' | 'Inadequate' | 'Not Inspected';
  ofstedDate?: string;
  ofstedReportUrl?: string;
  distance: number;
  walkingTime: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  gender: 'mixed' | 'boys' | 'girls';
  ageRange: {
    min: number;
    max: number;
  };
  totalPupils?: number;
  religion?: string;
  hasSixthForm?: boolean;
  catchmentRadius?: number;
}

export interface TransportStation {
  id: string;
  name: string;
  type: 'tube' | 'rail' | 'overground' | 'dlr' | 'tram' | 'bus' | 'river';
  distance: number;
  walkingTime: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  lines: string[];
  zone?: number;
  operator?: string;
}

export interface JourneyResult {
  origin: {
    name: string;
    coordinates: { lat: number; lng: number };
  };
  destination: {
    name: string;
    coordinates: { lat: number; lng: number };
  };
  duration: number; // minutes
  distance: number; // meters
  modes: ('walking' | 'bus' | 'tube' | 'rail' | 'overground' | 'dlr' | 'tram' | 'driving' | 'cycling')[];
  steps: Array<{
    mode: string;
    duration: number;
    distance: number;
    instruction: string;
    from?: string;
    to?: string;
    line?: string;
  }>;
  fare?: {
    total: string;
    zones?: string;
  };
}

export interface EPCCertificate {
  lmkKey: string;
  address: string;
  postcode: string;
  currentRating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  potentialRating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  currentScore: number;
  potentialScore: number;
  propertyType: string;
  builtForm: string;
  inspectionDate: string;
  lodgementDate: string;
  transactionType: string;
  totalFloorArea: number;
  energyConsumption: number;
  co2Emissions: number;
  co2EmissionsPotential: number;
  heatingCostCurrent: number;
  heatingCostPotential: number;
  hotWaterCostCurrent: number;
  hotWaterCostPotential: number;
  lightingCostCurrent: number;
  lightingCostPotential: number;
  improvements: Array<{
    sequence: number;
    improvementCategory: string;
    improvementCode: string;
    improvementDescription: string;
    typicalSaving: number;
    indicativeCost: string;
    improvementId: string;
  }>;
}

export interface AreaStatistics {
  postcode: string;
  averagePrice: number;
  medianPrice: number;
  salesCount12Months: number;
  priceChange1Year: number; // percentage
  propertyTypeBreakdown: Record<string, number>;
}

export interface CatchmentCheckResult {
  school: School;
  distance: number;
  walkingTime: number;
  inCatchment: boolean;
  lastYearAdmissionDistance?: number;
  likelihood: 'high' | 'medium' | 'low' | 'unknown';
}

export interface LocalAmenity {
  id: string;
  name: string;
  type: 'supermarket' | 'restaurant' | 'pub' | 'cafe' | 'park' | 'gym' | 'hospital' | 'pharmacy' | 'school' | 'shop' | 'other';
  address: string;
  distance: number;
  walkingTime: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating?: number;
  openingHours?: string;
  phone?: string;
}
