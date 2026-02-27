export interface PropertyImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  alt: string;
  isPrimary: boolean;
  caption?: string;
}

export interface VirtualTour {
  provider: 'matterport' | 'custom';
  url: string;
  thumbnail?: string;
}

export interface Floorplan {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title: string;
  dimensions?: {
    width: number;
    height: number;
    unit: 'ft' | 'm';
  };
  rooms?: Array<{
    name: string;
    dimensions: string;
    area?: number;
  }>;
}

export interface EPCData {
  currentRating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  potentialRating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  currentScore: number;
  potentialScore: number;
  validUntil: string;
  certificateUrl?: string;
  estimatedCosts?: {
    heating: string;
    lighting: string;
    hotWater: string;
    total: string;
  };
  potentialCosts?: {
    heating: string;
    lighting: string;
    hotWater: string;
    total: string;
  };
  improvements?: Array<{
    description: string;
    cost: string;
    annualSavings: string;
    ratingImprovement: string;
  }>;
}

export interface TransportLink {
  id: string;
  name: string;
  type: 'tube' | 'rail' | 'overground' | 'dlr' | 'bus' | 'tram';
  distance: string;
  walkingTime: number; // minutes
  drivingTime?: number;
  lines: string[];
  zone?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface LocalAmenity {
  id: string;
  name: string;
  type: 'school' | 'shop' | 'restaurant' | 'pub' | 'park' | 'gym' | 'hospital' | 'pharmacy' | 'supermarket' | 'other';
  distance: string;
  walkingTime: number;
  rating?: number;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface WalkScore {
  score: number;
  description: 'Walker\'s Paradise' | 'Very Walkable' | 'Somewhat Walkable' | 'Car Dependent';
  transitScore?: number;
  bikeScore?: number;
}

export interface Agent {
  id: string;
  name: string;
  title: string;
  phone: string;
  mobile?: string;
  email: string;
  image: string;
  branch?: {
    name: string;
    address: string;
    phone: string;
    openingHours: string;
  };
}

export interface PropertyHistory {
  date: string;
  event: 'sold' | 'listed' | 'reduced' | 'withdrawn';
  price: string;
  priceChange?: string;
  agent?: string;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  postcode: string;
  price: string;
  priceValue: number;
  priceQualifier?: string;
  status: 'for_sale' | 'under_offer' | 'sold' | 'withdrawn';
  type: string;
  featured: boolean;
  newListing: boolean;
  addedDate: string;
  beds: number;
  baths: number;
  receptions: number;
  sqft: number;
  sqm?: number;
  description: string;
  features: string[];
  images: PropertyImage[];
  virtualTour?: VirtualTour;
  floorplans: Floorplan[];
  epc: EPCData;
  mapCoordinates: {
    lat: number;
    lng: number;
  };
  streetView?: {
    panoId?: string;
    heading?: number;
    pitch?: number;
    zoom?: number;
  };
  transport: TransportLink[];
  amenities: LocalAmenity[];
  walkScore: WalkScore;
  tenure: {
    type: string;
    leaseExpires?: string;
    groundRent?: string;
    serviceCharge?: string;
    councilTax?: string;
    localAuthority?: string;
  };
  agent: Agent;
  history?: PropertyHistory[];
  reference: string;
}

export interface SimilarProperty {
  id: string;
  title: string;
  address: string;
  price: string;
  beds: number;
  baths: number;
  sqft: number;
  image: string;
}
