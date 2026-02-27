// Custom hook for fetching property recommendations
import { useEffect, useState, useCallback } from 'react';

interface MatchResult {
  property: any;
  score: number;
  reasons: string[];
  breakdown: {
    price: number;
    location: number;
    bedrooms: number;
    propertyType: number;
    features: number;
  };
}

interface UseRecommendationsOptions {
  userId?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: string;
  limit?: number;
  autoFetch?: boolean;
}

export function useRecommendations(options: UseRecommendationsOptions = {}) {
  const {
    userId,
    location,
    minPrice,
    maxPrice,
    bedrooms,
    propertyType,
    limit = 6,
    autoFetch = true,
  } = options;

  const [recommendations, setRecommendations] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (location) params.append('location', location);
      if (minPrice) params.append('minPrice', minPrice.toString());
      if (maxPrice) params.append('maxPrice', maxPrice.toString());
      if (bedrooms) params.append('bedrooms', bedrooms.toString());
      if (propertyType) params.append('propertyType', propertyType);
      params.append('limit', limit.toString());

      const response = await fetch(`/api/matches/recommended?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setRecommendations(data.recommendations);
        setHasFetched(true);
      } else {
        setError(data.error || 'Failed to load recommendations');
      }
    } catch (err) {
      setError('Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [userId, location, minPrice, maxPrice, bedrooms, propertyType, limit]);

  const refetch = useCallback(() => {
    setHasFetched(false);
    return fetchRecommendations();
  }, [fetchRecommendations]);

  useEffect(() => {
    if (autoFetch && !hasFetched) {
      fetchRecommendations();
    }
  }, [autoFetch, hasFetched, fetchRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    refetch,
    hasRecommendations: recommendations.length > 0,
  };
}