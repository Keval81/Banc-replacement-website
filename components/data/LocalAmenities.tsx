"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MapPin,
  Utensils,
  ShoppingCart,
  Coffee,
  Trees,
  Dumbbell,
  Heart,
  Pill,
  Store,
  Star,
  Footprints,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LocalAmenity } from "@/lib/types/data";

interface LocalAmenitiesProps {
  postcode?: string;
  lat?: number;
  lng?: number;
  className?: string;
}

const AMENITY_TYPES = [
  { value: 'all', label: 'All', icon: MapPin },
  { value: 'restaurant', label: 'Restaurants', icon: Utensils },
  { value: 'supermarket', label: 'Supermarkets', icon: ShoppingCart },
  { value: 'cafe', label: 'Cafes', icon: Coffee },
  { value: 'park', label: 'Parks', icon: Trees },
  { value: 'gym', label: 'Gyms', icon: Dumbbell },
  { value: 'hospital', label: 'Hospitals', icon: Heart },
  { value: 'pharmacy', label: 'Pharmacies', icon: Pill },
  { value: 'shop', label: 'Shops', icon: Store },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  'restaurant': <Utensils className="h-4 w-4" />,
  'supermarket': <ShoppingCart className="h-4 w-4" />,
  'cafe': <Coffee className="h-4 w-4" />,
  'park': <Trees className="h-4 w-4" />,
  'gym': <Dumbbell className="h-4 w-4" />,
  'hospital': <Heart className="h-4 w-4" />,
  'pharmacy': <Pill className="h-4 w-4" />,
  'shop': <Store className="h-4 w-4" />,
  'other': <MapPin className="h-4 w-4" />,
};

// Mock amenities data
function getMockAmenities(postcode: string): LocalAmenity[] {
  return [
    {
      id: '1',
      name: 'Tesco Express',
      type: 'supermarket',
      address: '123 High Street, London',
      distance: 0.2,
      walkingTime: 3,
      coordinates: { lat: 51.5, lng: -0.1 },
      rating: 4.2,
    },
    {
      id: '2',
      name: 'The Crown & Anchor',
      type: 'restaurant',
      address: '45 Main Road, London',
      distance: 0.3,
      walkingTime: 4,
      coordinates: { lat: 51.51, lng: -0.11 },
      rating: 4.5,
    },
    {
      id: '3',
      name: 'Costa Coffee',
      type: 'cafe',
      address: '78 Park Lane, London',
      distance: 0.1,
      walkingTime: 1,
      coordinates: { lat: 51.49, lng: -0.09 },
      rating: 4.0,
    },
    {
      id: '4',
      name: 'Green Park',
      type: 'park',
      address: 'Park Avenue, London',
      distance: 0.5,
      walkingTime: 7,
      coordinates: { lat: 51.52, lng: -0.08 },
      rating: 4.8,
    },
    {
      id: '5',
      name: 'PureGym',
      type: 'gym',
      address: '22 Fitness Street, London',
      distance: 0.4,
      walkingTime: 5,
      coordinates: { lat: 51.48, lng: -0.12 },
      rating: 4.3,
    },
    {
      id: '6',
      name: 'Boots Pharmacy',
      type: 'pharmacy',
      address: '56 High Street, London',
      distance: 0.15,
      walkingTime: 2,
      coordinates: { lat: 51.505, lng: -0.095 },
      rating: 4.1,
    },
  ];
}

export function LocalAmenities({ postcode: initialPostcode, lat, lng, className = "" }: LocalAmenitiesProps) {
  const [postcode, setPostcode] = useState(initialPostcode || "");
  const [amenities, setAmenities] = useState<LocalAmenity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const fetchAmenities = async () => {
    const searchPostcode = initialPostcode || postcode;
    if (!searchPostcode) return;
    
    setLoading(true);
    setError(null);

    try {
      // In production, this would call a Google Places API
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      setAmenities(getMockAmenities(searchPostcode));
    } catch (err) {
      setError('Unable to load amenities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPostcode || lat && lng) {
      fetchAmenities();
    }
  }, [initialPostcode, lat, lng]);

  const filteredAmenities = filter === 'all' 
    ? amenities 
    : amenities.filter(a => a.type === filter);

  // Group by type
  const grouped = filteredAmenities.reduce((acc, amenity) => {
    acc[amenity.type] = acc[amenity.type] || [];
    acc[amenity.type].push(amenity);
    return acc;
  }, {} as Record<string, LocalAmenity[]>);

  return (
    <div className={`bg-white rounded-lg border border-banc-grey/20 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-rose-50 to-orange-50 border-b border-banc-grey/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500 flex items-center justify-center text-white">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-banc-dark">Local Amenities</h3>
            <p className="text-sm text-banc-grey">Shops, restaurants, and services nearby</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-banc-grey/20">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {AMENITY_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setFilter(type.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  filter === type.value 
                    ? 'bg-rose-100 text-rose-700' 
                    : 'bg-banc-grey-pale text-banc-grey hover:bg-banc-grey/20'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amenities List */}
      <div className="max-h-96 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-banc-grey" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-red-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        ) : filteredAmenities.length === 0 ? (
          <div className="text-center py-12 text-banc-grey">
            <MapPin className="h-12 w-12 mx-auto mb-3 text-banc-grey" />
            <p>No amenities found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <h4 className="text-sm font-medium text-banc-dark capitalize mb-3 flex items-center gap-2">
                  {TYPE_ICONS[type] || <MapPin className="h-4 w-4" />}
                  {type}s
                </h4>
                <div className="space-y-2">
                  {items.map((amenity, index) => (
                    <motion.div
                      key={amenity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-3 bg-banc-grey-pale rounded-lg"
                    >
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                        {TYPE_ICONS[amenity.type] || <MapPin className="h-4 w-4 text-banc-grey" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-banc-dark truncate">{amenity.name}</h5>
                          {amenity.rating && (
                            <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                              <Star className="h-3 w-3 fill-current" />
                              {amenity.rating}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-banc-grey truncate">{amenity.address}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-banc-grey">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {amenity.distance} miles
                          </span>
                          <span className="flex items-center gap-1">
                            <Footprints className="h-3 w-3" />
                            {amenity.walkingTime} min walk
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {amenities.length > 0 && (
        <div className="px-5 py-3 bg-banc-grey-pale border-t border-banc-grey/20 text-xs text-banc-grey text-center">
          Data from Google Places • Walking times are estimates
        </div>
      )}
    </div>
  );
}
