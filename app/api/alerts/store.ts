// Shared in-memory store for alerts
// In production, replace with a database

export interface Alert {
  id: string;
  userId: string;
  name: string;
  criteria: {
    minPrice?: number;
    maxPrice?: number;
    beds?: number;
    propertyType?: string[];
    tenure?: string;
    keywords?: string;
    location?: string;
  };
  frequency: "instant" | "daily" | "weekly";
  isActive: boolean;
  createdAt: string;
  lastSent?: string;
  matchCount?: number;
}

export const alertsStore: Alert[] = [
  {
    id: "alert_1",
    userId: "user_123",
    name: "4+ Bed Houses in Hertfordshire",
    criteria: {
      minPrice: 800000,
      maxPrice: 2000000,
      beds: 4,
      propertyType: ["house", "mansion"],
      location: "Hertfordshire",
      keywords: "garden garage",
    },
    frequency: "daily",
    isActive: true,
    createdAt: "2026-02-20T10:00:00Z",
    lastSent: "2026-02-26T09:00:00Z",
    matchCount: 12,
  },
  {
    id: "alert_2",
    userId: "user_123",
    name: "Mayfair Penthouses",
    criteria: {
      minPrice: 2000000,
      propertyType: ["penthouse", "apartment"],
      location: "Mayfair, London",
      tenure: "leasehold",
    },
    frequency: "instant",
    isActive: true,
    createdAt: "2026-02-15T14:30:00Z",
    lastSent: "2026-02-26T15:45:00Z",
    matchCount: 3,
  },
  {
    id: "alert_3",
    userId: "user_123",
    name: "Cottages in Buckinghamshire",
    criteria: {
      maxPrice: 1500000,
      propertyType: ["cottage"],
      location: "Buckinghamshire",
      tenure: "freehold",
    },
    frequency: "weekly",
    isActive: false,
    createdAt: "2026-02-10T11:00:00Z",
    lastSent: "2026-02-24T09:00:00Z",
    matchCount: 8,
  },
];
