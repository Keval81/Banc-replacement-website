"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Property {
  id: string;
  title: string;
  address: string;
  price: string;
  priceValue: number;
  tags: string[];
  stats: {
    beds: number;
    baths: number;
    sqft: number;
    epc: string;
  };
  images: string[];
  summary: string;
  type: string;
  tenure: string;
  dateAdded: string;
  coordinates?: { lat: number; lng: number };
}

interface ComparisonContextType {
  comparedProperties: Property[];
  addToComparison: (property: Property) => void;
  removeFromComparison: (propertyId: string) => void;
  isInComparison: (propertyId: string) => boolean;
  clearComparison: () => void;
  canAddMore: boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const MAX_COMPARE = 3;

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [comparedProperties, setComparedProperties] = useState<Property[]>([]);

  const addToComparison = useCallback((property: Property) => {
    setComparedProperties((prev) => {
      if (prev.find((p) => p.id === property.id)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, property];
    });
  }, []);

  const removeFromComparison = useCallback((propertyId: string) => {
    setComparedProperties((prev) => prev.filter((p) => p.id !== propertyId));
  }, []);

  const isInComparison = useCallback(
    (propertyId: string) => comparedProperties.some((p) => p.id === propertyId),
    [comparedProperties]
  );

  const clearComparison = useCallback(() => {
    setComparedProperties([]);
  }, []);

  const canAddMore = comparedProperties.length < MAX_COMPARE;

  return (
    <ComparisonContext.Provider
      value={{
        comparedProperties,
        addToComparison,
        removeFromComparison,
        isInComparison,
        clearComparison,
        canAddMore,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
}
