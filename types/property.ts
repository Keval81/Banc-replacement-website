/**
 * Property Type Definitions
 * Centralized types for all property-related data
 */

// Address structure
export interface PropertyAddress {
  line1: string;
  line2?: string;
  town: string;
  county?: string;
  postcode: string;
  latitude?: number;
  longitude?: number;
}

// Price structure with qualifier
export interface PropertyPrice {
  amount: number;
  qualifier?: 'guide_price' | 'oiro' | 'offers_over' | 'fixed_price' | 'pcm' | 'pw';
  currency?: 'GBP' | 'USD' | 'EUR';
}

// Property statistics
export interface PropertyDetails {
  bedrooms: number;
  bathrooms: number;
  receptions: number;
  sqft?: number;
  sqm?: number;
  propertyType: 'detached' | 'semi_detached' | 'terraced' | 'flat' | 'bungalow' | 'cottage' | 'mansion' | 'penthouse' | 'maisonette' | 'land' | string;
  tenure?: 'freehold' | 'leasehold' | 'share_of_freehold' | string;
  epcRating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | string;
  councilTaxBand?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | string;
}

// Media assets
export interface PropertyMedia {
  images: PropertyImage[];
  floorplan?: string;
  video?: string;
  virtualTour?: string;
  brochure?: string;
}

// Individual image with metadata
export interface PropertyImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
  blurDataUrl?: string;
  width?: number;
  height?: number;
}

// Transport links
export interface TransportLink {
  name: string;
  distance: string;
  zone?: number;
  lines?: string[];
  type: 'tube' | 'train' | 'bus' | 'overground' | 'dlr' | 'tram';
}

// Listing agent
export interface ListingAgent {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  image?: string;
  department: 'sales' | 'lettings' | 'new_homes' | 'premier';
}

// Property status
export type PropertyStatus = 'for_sale' | 'under_offer' | 'sold' | 'withdrawn' | 'sold_stc' | 'reserved';

// Main Property interface
export interface Property {
  id: string;
  title: string;
  slug: string;
  address: PropertyAddress;
  price: PropertyPrice;
  status: PropertyStatus;
  details: PropertyDetails;
  media: PropertyMedia;
  description: string;
  features: string[];
  tags: string[];
  summary: string;
  
  // Tenure details
  tenureDetails?: {
    type: string;
    leaseExpires?: string;
    groundRent?: string;
    serviceCharge?: string;
  };
  
  // Location
  transportLinks?: TransportLink[];
  nearbySchools?: string[];
  
  // Agent info
  agent: ListingAgent;
  
  // Metadata
  featured: boolean;
  newListing: boolean;
  premierListing: boolean;
  addedDate: string;
  updatedDate: string;
  
  // Reference
  reference: string;
}

// Simplified property for listings
export interface PropertySummary {
  id: string;
  title: string;
  address: string;
  price: string;
  tags: string[];
  stats: {
    beds: number;
    baths: number;
    sqft: number;
    epc: string;
  };
  images: string[];
  summary: string;
}

// Filter options for API
export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  propertyType?: string[];
  location?: string[];
  status?: PropertyStatus[];
  featured?: boolean;
  premier?: boolean;
}

// API response types
export interface PropertiesApiResponse {
  properties: PropertySummary[];
  total: number;
  page: number;
  perPage: number;
  filters: PropertyFilters;
}

export interface PropertyApiResponse {
  property: Property;
  relatedProperties?: PropertySummary[];
}

// Schema.org structured data types
export interface SchemaRealEstateListing {
  '@context': 'https://schema.org';
  '@type': 'RealEstateListing';
  name: string;
  description: string;
  url: string;
  datePosted: string;
  price: string;
  priceCurrency: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressCountry: string;
  };
  numberOfRooms: number;
  floorSize?: {
    '@type': 'QuantitativeValue';
    value: number;
    unitCode: string;
  };
}

export interface SchemaOrganization {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint: {
    '@type': 'ContactPoint';
    telephone: string;
    contactType: string;
  };
}

export interface SchemaLocalBusiness {
  '@context': 'https://schema.org';
  '@type': 'RealEstateAgent';
  name: string;
  image: string;
  '@id': string;
  url: string;
  telephone: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification';
    dayOfWeek: string[];
    opens: string;
    closes: string;
  };
  priceRange: string;
}

export interface SchemaPlace {
  '@context': 'https://schema.org';
  '@type': 'Place';
  name: string;
  description: string;
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  address?: {
    '@type': 'PostalAddress';
    addressLocality: string;
    addressCountry: string;
  };
}

export interface SchemaPerson {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  jobTitle: string;
  description: string;
  image?: string;
  telephone?: string;
  email?: string;
  worksFor?: {
    '@type': 'Organization';
    name: string;
  };
}

// Utility type for converting price to display string
export function formatPrice(price: PropertyPrice): string {
  const symbol = price.currency === 'USD' ? '$' : price.currency === 'EUR' ? '€' : '£';
  const formatted = price.amount.toLocaleString('en-GB');
  
  const qualifiers: Record<string, string> = {
    guide_price: 'Guide Price ',
    oiro: 'OIRO ',
    offers_over: 'Offers Over ',
    fixed_price: '',
    pcm: ' pcm',
    pw: ' pw',
  };
  
  const prefix = price.qualifier ? qualifiers[price.qualifier] || '' : '';
  const suffix = price.qualifier === 'pcm' || price.qualifier === 'pw' ? qualifiers[price.qualifier] : '';
  
  return `${prefix}${symbol}${formatted}${suffix}`;
}

// Utility to get EPC color
export function getEpcColor(rating: string): string {
  const colors: Record<string, string> = {
    A: '#00c853',
    B: '#64dd17',
    C: '#aeea00',
    D: '#ffd600',
    E: '#ffab00',
    F: '#ff6d00',
    G: '#dd2c00',
  };
  return colors[rating?.toUpperCase()] || '#9e9e9e';
}
