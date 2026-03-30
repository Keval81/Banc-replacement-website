"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Navigation,
  Maximize2,
  X,
  Layers,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StreetViewProps {
  lat: number;
  lng: number;
  address: string;
  apiKey?: string;
  className?: string;
}

export function StreetViewComponent({ 
  lat, 
  lng, 
  address,
  apiKey,
  className = "" 
}: StreetViewProps) {
  const [viewMode, setViewMode] = useState<"street" | "map">("map");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Google Maps URLs
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2500!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ4JzM2LjEiTiAxMjLCsDQwJzQ1LjMiVw!5e0!3m2!1sen!2suk!4v1609459200000!5m2!1sen!2suk`;
  
  const streetViewUrl = `https://www.google.com/maps/embed?pb=!4v1609459200000!6m8!1m7!1sCAoSLEFGMVFpcE5Jb1dDZklZd3F5dmlqY3ZQaV9ZRFNSN1lqQXJLRG9ZVWJ4U1Rm!2m2!1d${lat}!2d${lng}!3f0!4f0!5f0.7820865974627469`;

  const handleGetDirections = () => {
    const destination = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
  };

  const mapContent = (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* View Toggle */}
      <div className="absolute top-3 left-3 z-10">
        <div className="flex rounded-lg bg-white shadow-lg p-1">
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === "map" 
                ? "bg-[#4AC8E8] text-white" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <MapPin className="h-4 w-4" />
            Map
          </button>
          <button
            onClick={() => setViewMode("street")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === "street" 
                ? "bg-[#4AC8E8] text-white" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Video className="h-4 w-4" />
            Street View
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleGetDirections}
          className="bg-white shadow-lg hover:bg-gray-50"
        >
          <Navigation className="h-4 w-4 mr-1.5" />
          Directions
        </Button>
        <button
          onClick={() => setIsFullscreen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white shadow-lg hover:bg-gray-50 text-gray-700"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Map/Street View Iframe */}
      <div className="relative" style={{ height: isFullscreen ? '100%' : '400px' }}>
        <iframe
          src={viewMode === "map" ? mapUrl : streetViewUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0"
          title={viewMode === "map" ? "Property Location Map" : "Street View"}
        />
      </div>

      {/* Location Info */}
      <div className="absolute bottom-3 left-3 right-3 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2 text-gray-900">
            <MapPin className="h-4 w-4 text-[#4AC8E8]" />
            <span className="font-medium text-sm truncate">{address}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-black">
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-[#4AC8E8]" />
            <span className="font-medium">{viewMode === "map" ? "Map View" : "Street View"}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-400">{address}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-white/10 p-1">
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === "map" 
                    ? "bg-[#4AC8E8] text-white" 
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Layers className="h-4 w-4" />
                Map
              </button>
              <button
                onClick={() => setViewMode("street")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === "street" 
                    ? "bg-[#4AC8E8] text-white" 
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Video className="h-4 w-4" />
                Street
              </button>
            </div>
            <button 
              onClick={() => setIsFullscreen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1" style={{ height: 'calc(100% - 72px)' }}>
          {mapContent}
        </div>
      </div>
    );
  }

  return mapContent;
}
