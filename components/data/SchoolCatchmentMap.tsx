"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  GraduationCap,
  Star,
  Info,
  ArrowRight
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { School } from "@/lib/types/data";

interface SchoolCatchmentMapProps {
  school: School;
  propertyCoordinates?: { lat: number; lng: number };
  className?: string;
}

export function SchoolCatchmentMap({ 
  school, 
  propertyCoordinates,
  className = "" 
}: SchoolCatchmentMapProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <GraduationCap className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900">{school.name}</h4>
          <p className="text-sm text-gray-500">{school.distance} miles away</p>
          
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline" className={
              school.ofstedRating === 'Outstanding' ? 'bg-green-100 text-green-700' :
              school.ofstedRating === 'Good' ? 'bg-blue-100 text-blue-700' :
              school.ofstedRating === 'Requires Improvement' ? 'bg-yellow-100 text-yellow-700' :
              school.ofstedRating === 'Inadequate' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }>
              {school.ofstedRating}
            </Badge>
            <Badge variant="secondary">
              {school.phase === 'primary' ? 'Primary' : 
               school.phase === 'secondary' ? 'Secondary' : 
               school.phase === 'all-through' ? 'All-Through' : 'Sixth Form'}
            </Badge>
          </div>
        </div>
      </div>

      {propertyCoordinates && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Walking distance</span>
            <span className="font-medium">{school.walkingTime} minutes</span>
          </div>
        </div>
      )}
    </div>
  );
}
