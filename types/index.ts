export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  propertyTitle?: string;
  propertyPrice?: string;
  propertyImage?: string;
  propertyAddress?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: "applicant" | "vendor" | "landlord" | "admin";
  image?: string;
}

export interface PropertyRequirements {
  id: string;
  userId: string;
  transactionType: "buy" | "rent";
  propertyTypes: string[];
  minBeds?: number;
  maxBeds?: number;
  minPrice?: number;
  maxPrice?: number;
  preferredLocations: string[];
  maxRadius?: number;
  mustHaveFeatures: string[];
  niceToHaveFeatures: string[];
  timeline?: string;
  notes?: string;
}