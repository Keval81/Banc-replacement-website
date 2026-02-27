"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  X, 
  Navigation,
  Layers,
  Search,
  Maximize2,
  Minimize2
} from "lucide-react";
import Link from "next/link";

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
  coordinates: { lat: number; lng: number };
}

interface PropertyMapProps {
  properties: Property[];
  selectedPropertyId?: string;
  onPropertySelect?: (id: string) => void;
  onAreaSearch?: () => void;
  className?: string;
}

// Simulated map markers since we don't have Google Maps API key
// In production, replace with actual Google Maps or Mapbox implementation
export default function PropertyMap({
  properties,
  selectedPropertyId,
  onPropertySelect,
  onAreaSearch,
  className,
}: PropertyMapProps) {
  const [showAreaSearch, setShowAreaSearch] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [selectedPin, setSelectedPin] = React.useState<string | null>(null);
  const [mapView, setMapView] = React.useState<"satellite" | "roadmap">("roadmap");

  // Simulated map center (London area)
  const mapCenter = { lat: 51.5074, lng: -0.1278 };

  // Calculate marker positions (simulated)
  const getMarkerPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 15; // percentage from center
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return { x, y };
  };

  const handlePinClick = (propertyId: string) => {
    setSelectedPin(propertyId);
    onPropertySelect?.(propertyId);
  };

  const selectedProperty = properties.find((p) => p.id === selectedPin);

  return (
    <div
      className={cn(
        "relative bg-gray-100 overflow-hidden",
        isFullscreen ? "fixed inset-0 z-50" : "rounded-xl h-full min-h-[500px]",
        className
      )}
    >
      {/* Map Background - Simulated */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        
        {/* Simulated roads */}
        <svg className="absolute inset-0 w-full h-full">
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#cbd5e1" strokeWidth="8" />
          <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#cbd5e1" strokeWidth="6" />
          <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#cbd5e1" strokeWidth="6" />
          <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#cbd5e1" strokeWidth="8" />
          <line x1="0" y1="45%" x2="100%" y2="45%" stroke="#e2e8f0" strokeWidth="4" />
        </svg>

        {/* Green areas (parks) */}
        <div className="absolute top-[20%] left-[15%] w-[20%] h-[15%] bg-green-200/50 rounded-full" />
        <div className="absolute top-[65%] right-[20%] w-[15%] h-[12%] bg-green-200/50 rounded-full" />
        <div className="absolute bottom-[25%] left-[40%] w-[10%] h-[8%] bg-green-200/50 rounded-full" />

        {/* Water features */}
        <div className="absolute top-[10%] right-[10%] w-[25%] h-[8%] bg-blue-200/40 rounded-full" />
      </div>

      {/* Property Markers */}
      {properties.map((property, index) => {
        const pos = getMarkerPosition(index, properties.length);
        const isSelected = selectedPin === property.id;
        const priceShort = property.price.replace(/[^\d]/g, "").slice(0, 2) + "m";

        return (
          <button
            key={property.id}
            onClick={() => handlePinClick(property.id)}
            className={cn(
              "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-10",
              isSelected ? "z-20 scale-110" : "hover:scale-105"
            )}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full shadow-lg transition-colors",
                isSelected
                  ? "bg-[#0D9488] text-white"
                  : "bg-white text-gray-800 hover:bg-gray-50"
              )}
            >
              <MapPin className="w-3 h-3" />
              <span className="text-xs font-semibold whitespace-nowrap">
                {priceShort}
              </span>
            </div>
          </button>
        );
      })}

      {/* Area Search Button */}
      {showAreaSearch && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
          <Button
            onClick={onAreaSearch}
            className="bg-[#1DBFDD] hover:bg-[#0E8CAB] shadow-lg"
          >
            <Search className="w-4 h-4 mr-2" />
            Search this area
          </Button>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        <button
          onClick={() => setMapView(mapView === "satellite" ? "roadmap" : "satellite")}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
          title="Toggle view"
        >
          <Layers className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={() => setShowAreaSearch(!showAreaSearch)}
          className={cn(
            "p-2 rounded-lg shadow-md transition-colors",
            showAreaSearch ? "bg-[#1DBFDD] text-white" : "bg-white hover:bg-gray-50"
          )}
          title="Draw search area"
        >
          <Navigation className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-gray-700" />
          ) : (
            <Maximize2 className="w-5 h-5 text-gray-700" />
          )}
        </button>
      </div>

      {/* Property Popup */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-30">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <button
              onClick={() => setSelectedPin(null)}
              className="absolute top-2 right-2 p-1 bg-white/90 rounded-full hover:bg-white z-10"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="relative aspect-[4/3]">
              <img
                src={selectedProperty.images[0]}
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />
              {selectedProperty.tags.length > 0 && (
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 text-xs font-semibold bg-white/95 rounded-full">
                    {selectedProperty.tags[0]}
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <p className="text-xs text-gray-500">{selectedProperty.address}</p>
              <h3 className="font-semibold text-gray-900 line-clamp-1">
                {selectedProperty.title}
              </h3>
              <p className="text-lg font-bold text-[#0D9488] mt-1">
                {selectedProperty.price}
              </p>
              <div className="flex gap-3 mt-2 text-xs text-gray-600">
                <span>{selectedProperty.stats.beds} beds</span>
                <span>{selectedProperty.stats.baths} baths</span>
                <span>{selectedProperty.stats.sqft} sqft</span>
              </div>
              <Link href={`/sales/properties/${selectedProperty.id}`}>
                <Button className="w-full mt-3 bg-[#1DBFDD] hover:bg-[#0E8CAB] text-sm">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 hidden md:block">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#0D9488]" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-3 h-3 rounded-full bg-white border border-gray-300" />
          <span>Available</span>
        </div>
      </div>
    </div>
  );
}
