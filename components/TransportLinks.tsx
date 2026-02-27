"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Train, 
  Bus, 
  Clock, 
  MapPin, 
  Navigation,
  ExternalLink,
  Footprints,
  Car
} from "lucide-react";
import type { TransportLink } from "@/lib/types/property";

interface TransportLinksProps {
  stations: TransportLink[];
  propertyAddress: string;
  className?: string;
}

const LINE_COLORS: Record<string, string> = {
  "Bakerloo": "bg-[#B36305]",
  "Central": "bg-[#E32017]",
  "Circle": "bg-[#FFD300]",
  "District": "bg-[#00782A]",
  "Hammersmith": "bg-[#F3A9BB]",
  "Jubilee": "bg-[#A0A5A9]",
  "Metropolitan": "bg-[#9B0056]",
  "Northern": "bg-[#000000]",
  "Piccadilly": "bg-[#003688]",
  "Victoria": "bg-[#0098D4]",
  "Waterloo": "bg-[#95CDBA]",
  "Overground": "bg-[#EE7C0E]",
  "Elizabeth": "bg-[#6950A1]",
  "DLR": "bg-[#00A4A7]",
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  tube: Train,
  rail: Train,
  overground: Train,
  dlr: Train,
  bus: Bus,
  tram: Train,
};

export function TransportLinks({ 
  stations, 
  propertyAddress,
  className = "" 
}: TransportLinksProps) {
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);

  const handleGetDirections = (station: TransportLink) => {
    const destination = encodeURIComponent(station.name);
    const origin = encodeURIComponent(propertyAddress);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
    window.open(url, '_blank');
  };

  if (stations.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
        <p className="text-gray-500">No nearby transport information available</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1DBFDD]/10 flex items-center justify-center">
            <Navigation className="h-5 w-5 text-[#1DBFDD]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Transport Links</h3>
            <p className="text-sm text-gray-600">{stations.length} stations nearby</p>
          </div>
        </div>
      </div>

      {/* Stations List */}
      <div className="divide-y divide-gray-100">
        {stations.map((station) => {
          const Icon = TYPE_ICONS[station.type] || Train;
          const isHovered = hoveredStation === station.id;

          return (
            <motion.div
              key={station.id}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onMouseEnter={() => setHoveredStation(station.id)}
              onMouseLeave={() => setHoveredStation(null)}
              onClick={() => handleGetDirections(station)}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-gray-600" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {station.name}
                    </h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {station.distance}
                    </span>
                  </div>

                  {/* Walking Time */}
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                    <Footprints className="h-3.5 w-3.5" />
                    <span>{station.walkingTime} min walk</span>
                    {station.drivingTime && (
                      <>
                        <span className="mx-1">•</span>
                        <Car className="h-3.5 w-3.5" />
                        <span>{station.drivingTime} min drive</span>
                      </>
                    )}
                  </div>

                  {/* Lines */}
                  <div className="flex flex-wrap gap-1.5">
                    {station.lines.map((line) => (
                      <span
                        key={line}
                        className={`text-xs px-2 py-0.5 rounded text-white font-medium ${
                          LINE_COLORS[line] || "bg-gray-500"
                        }`}
                        title={line}
                      >
                        {line.substring(0, 3)}
                      </span>
                    ))}
                    {station.zone && (
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                        Zone {station.zone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Direction Button */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
                  className="flex-shrink-0"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1DBFDD]/10 flex items-center justify-center text-[#1DBFDD]">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Walking times are estimates and may vary depending on route
        </p>
      </div>
    </div>
  );
}
