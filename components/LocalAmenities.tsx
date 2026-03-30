"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  School, 
  ShoppingCart, 
  UtensilsCrossed, 
  Coffee,
  Trees,
  Dumbbell,
  Hospital,
  Pill,
  Store,
  Star,
  Clock,
  ChevronDown,
  Navigation,
  ExternalLink
} from "lucide-react";
import type { LocalAmenity } from "@/lib/types/property";

interface LocalAmenitiesProps {
  amenities: LocalAmenity[];
  propertyAddress: string;
  className?: string;
}

const AMENITY_CONFIG: Record<string, { 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  bgColor: string;
}> = {
  school: { 
    icon: School, 
    label: "Schools", 
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  shop: { 
    icon: Store, 
    label: "Shops", 
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  restaurant: { 
    icon: UtensilsCrossed, 
    label: "Restaurants", 
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  },
  pub: { 
    icon: Coffee, 
    label: "Pubs & Bars", 
    color: "text-amber-600",
    bgColor: "bg-amber-50"
  },
  park: { 
    icon: Trees, 
    label: "Parks", 
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  gym: { 
    icon: Dumbbell, 
    label: "Gyms", 
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  hospital: { 
    icon: Hospital, 
    label: "Hospitals", 
    color: "text-rose-600",
    bgColor: "bg-rose-50"
  },
  pharmacy: { 
    icon: Pill, 
    label: "Pharmacies", 
    color: "text-teal-600",
    bgColor: "bg-teal-50"
  },
  supermarket: { 
    icon: ShoppingCart, 
    label: "Supermarkets", 
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  },
  other: { 
    icon: MapPin, 
    label: "Other", 
    color: "text-banc-grey",
    bgColor: "bg-banc-grey-pale"
  },
};

export function LocalAmenities({ 
  amenities, 
  propertyAddress,
  className = "" 
}: LocalAmenitiesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedAmenity, setExpandedAmenity] = useState<string | null>(null);

  // Group amenities by type
  const groupedAmenities = amenities.reduce((acc, amenity) => {
    if (!acc[amenity.type]) {
      acc[amenity.type] = [];
    }
    acc[amenity.type].push(amenity);
    return acc;
  }, {} as Record<string, LocalAmenity[]>);

  const categories = Object.keys(groupedAmenities).sort();

  const handleGetDirections = (amenity: LocalAmenity) => {
    const destination = encodeURIComponent(`${amenity.name}, ${amenity.address || ''}`);
    const origin = encodeURIComponent(propertyAddress);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
    window.open(url, '_blank');
  };

  const displayedAmenities = selectedCategory 
    ? groupedAmenities[selectedCategory] 
    : amenities.slice(0, 6);

  if (amenities.length === 0) {
    return (
      <div className={`bg-banc-grey-pale rounded-lg p-6 text-center ${className}`}>
        <p className="text-banc-grey">No local amenity information available</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-banc-grey/20 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-green-50 to-teal-50 border-b border-banc-grey/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-banc-dark">Local Amenities</h3>
            <p className="text-sm text-banc-grey">{amenities.length} places nearby</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="px-5 py-3 border-b border-banc-grey/20">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? "bg-[#4AC8E8] text-white"
                  : "bg-banc-grey-pale text-banc-grey hover:bg-banc-grey/20"
              }`}
            >
              All
            </button>
            {categories.map((category) => {
              const config = AMENITY_CONFIG[category];
              const Icon = config.icon;
              const isSelected = selectedCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? `${config.bgColor} ${config.color}`
                      : "bg-banc-grey-pale text-banc-grey hover:bg-banc-grey/20"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                  <span className="ml-0.5 text-xs opacity-70">
                    ({groupedAmenities[category].length})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Amenities Grid */}
      <div className="p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {displayedAmenities.map((amenity) => {
            const config = AMENITY_CONFIG[amenity.type];
            const Icon = config.icon;
            const isExpanded = expandedAmenity === amenity.id;

            return (
              <motion.div
                key={amenity.id}
                layout
                className="bg-banc-grey-pale rounded-lg p-3 cursor-pointer hover:bg-banc-grey-pale transition-colors"
                onClick={() => setExpandedAmenity(isExpanded ? null : amenity.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-banc-dark truncate">
                      {amenity.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-banc-grey">{amenity.distance}</span>
                      <span className="text-xs text-banc-grey">•</span>
                      <span className="text-xs text-banc-grey flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {amenity.walkingTime} min
                      </span>
                    </div>
                    {amenity.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium">{amenity.rating}</span>
                      </div>
                    )}
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 text-banc-grey transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                <AnimatePresence>
                  {isExpanded && amenity.address && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-3 border-t border-banc-grey/20">
                        <p className="text-sm text-banc-grey mb-2">{amenity.address}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGetDirections(amenity);
                          }}
                          className="flex items-center gap-1.5 text-sm text-[#4AC8E8] hover:underline"
                        >
                          <Navigation className="h-3.5 w-3.5" />
                          Get directions
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Show More Button */}
        {!selectedCategory && amenities.length > 6 && (
          <button className="w-full mt-4 py-2 text-sm text-[#4AC8E8] font-medium hover:underline">
            Show all {amenities.length} amenities
          </button>
        )}
      </div>
    </div>
  );
}
