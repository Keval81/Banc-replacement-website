"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Bed, 
  Bath, 
  Square,
  ChevronRight,
  Heart
} from "lucide-react";
import type { SimilarProperty } from "@/lib/types/property";

interface SimilarPropertiesProps {
  properties: SimilarProperty[];
  className?: string;
}

export function SimilarProperties({ 
  properties, 
  className = "" 
}: SimilarPropertiesProps) {
  if (properties.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Similar Properties</h2>
        <a 
          href="/sales/properties" 
          className="text-sm text-[#4AC8E8] hover:underline flex items-center gap-1"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((property, index) => (
          <motion.a
            key={property.id}
            href={`/sales/properties/${property.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={property.image}
                alt={property.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <button 
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                onClick={(e) => {
                  e.preventDefault();
                  // Toggle favorite logic here
                }}
              >
                <Heart className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#4AC8E8] transition-colors">
                {property.title}
              </h3>
              <p className="text-sm text-gray-500 truncate mb-2">{property.address}</p>
              
              <p className="text-lg font-bold text-[#4AC8E8] mb-3">{property.price}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4 text-[#4AC8E8]" />
                  <span>{property.beds}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4 text-[#4AC8E8]" />
                  <span>{property.baths}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="h-4 w-4 text-[#4AC8E8]" />
                  <span>{property.sqft.toLocaleString()} sq ft</span>
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
