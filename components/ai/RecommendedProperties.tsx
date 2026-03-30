'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
// PropertyCard component may have different props - using a generic card for now
const SimplePropertyCard = ({ property }: { property: any }) => (
  <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
    <div className="aspect-[4/3] bg-banc-grey/20 relative">
      {property.media?.images?.[0]?.url ? (
        <img 
          src={property.media.images[0].url} 
          alt={property.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-banc-grey">
          No Image
        </div>
      )}
    </div>
    <div className="p-4">
      <p className="text-lg font-bold text-banc-dark">
        £{(property.price?.amount || 0).toLocaleString()}
      </p>
      <h3 className="font-semibold text-banc-dark mt-1">{property.title}</h3>
      <p className="text-sm text-banc-grey">{property.address?.town}, {property.address?.postcode}</p>
      <div className="flex gap-4 mt-3 text-sm text-banc-grey">
        <span>{property.details?.bedrooms} beds</span>
        <span>{property.details?.bathrooms} baths</span>
      </div>
    </div>
  </div>
);
import MatchScore from './MatchScore';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecommendedProperty {
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

interface RecommendedPropertiesProps {
  userId?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: string;
  limit?: number;
  title?: string;
}

export default function RecommendedProperties({
  userId,
  location,
  minPrice,
  maxPrice,
  bedrooms,
  propertyType,
  limit = 6,
  title = "Recommended for You",
}: RecommendedPropertiesProps) {
  const [recommendations, setRecommendations] = useState<RecommendedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
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
      } else {
        setError(data.error || 'Failed to load recommendations');
      }
    } catch (err) {
      setError('Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [userId, location, minPrice, maxPrice, bedrooms, propertyType, limit]);

  if (isLoading) {
    return (
      <section className="py-12 bg-banc-grey-pale">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a4d5c]" />
          </div>
        </div>
      </section>
    );
  }

  if (error || recommendations.length === 0) {
    return null; // Don't show section if no recommendations
  }

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1a4d5c]/10 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#1a4d5c]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-banc-dark">{title}</h2>
              <p className="text-banc-grey text-sm">
                Properties matched to your preferences using AI
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRecommendations}
            className="hidden sm:flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Properties Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Match Score Badge */}
              <div className="absolute top-3 left-3 z-10">
                <MatchScore
                  score={rec.score}
                  size="sm"
                  showLabel={false}
                  reasons={rec.reasons}
                />
              </div>

              {/* Property Card */}
              <SimplePropertyCard property={rec.property} />

              {/* Match Reasons */}
              <div className="mt-2 px-1">
                <div className="flex flex-wrap gap-1">
                  {rec.reasons.slice(0, 2).map((reason, i) => (
                    <span
                      key={i}
                      className="text-xs bg-[#1a4d5c]/10 text-[#1a4d5c] px-2 py-0.5 rounded-full"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <a
            href="/search"
            className="inline-flex items-center gap-2 text-[#1a4d5c] hover:underline font-medium"
          >
            View all properties
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}