"use client";

import { useEffect, useRef, useState } from "react";
import { 
  MapPin, 
  Navigation,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StreetViewProps {
  lat: number;
  lng: number;
  address?: string;
  className?: string;
  height?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export function StreetView({ 
  lat, 
  lng, 
  address,
  className = "",
  height = "400px"
}: StreetViewProps) {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panorama, setPanorama] = useState<any>(null);
  const [heading, setHeading] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const loadStreetView = () => {
      if (!streetViewRef.current || !window.google) return;

      try {
        const streetViewService = new window.google.maps.StreetViewService();
        
        streetViewService.getPanorama(
          { location: { lat, lng }, radius: 50 },
          (data: any, status: string) => {
            if (status === 'OK' && data) {
              const panorama = new window.google.maps.StreetViewPanorama(
                streetViewRef.current,
                {
                  position: { lat, lng },
                  pov: { heading, pitch, zoom },
                  addressControl: false,
                  showRoadLabels: true,
                  zoomControl: false,
                  panControl: false,
                  fullscreenControl: false,
                  motionTracking: false,
                  motionTrackingControl: false,
                }
              );

              setPanorama(panorama);
              setLoading(false);
            } else {
              setError('Street View not available for this location');
              setLoading(false);
            }
          }
        );
      } catch (err) {
        setError('Failed to load Street View');
        setLoading(false);
      }
    };

    // Load Google Maps API if not already loaded
    if (!window.google) {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = loadStreetView;
      document.head.appendChild(script);
    } else {
      loadStreetView();
    }
  }, [lat, lng]);

  const rotateLeft = () => {
    if (panorama) {
      const newHeading = heading - 45;
      panorama.setPov({ heading: newHeading, pitch, zoom });
      setHeading(newHeading);
    }
  };

  const rotateRight = () => {
    if (panorama) {
      const newHeading = heading + 45;
      panorama.setPov({ heading: newHeading, pitch, zoom });
      setHeading(newHeading);
    }
  };

  const zoomIn = () => {
    if (panorama && zoom < 4) {
      const newZoom = zoom + 0.5;
      panorama.setPov({ heading, pitch, zoom: newZoom });
      setZoom(newZoom);
    }
  };

  const zoomOut = () => {
    if (panorama && zoom > 0) {
      const newZoom = zoom - 0.5;
      panorama.setPov({ heading, pitch, zoom: newZoom });
      setZoom(newZoom);
    }
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {address || 'Street View'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={rotateLeft}
            className="h-8 w-8 p-0"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={rotateRight}
            className="h-8 w-8 p-0"
          >
            <RotateCw className="h-4 w-4" style={{ transform: 'scaleX(-1)' }} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={openInGoogleMaps}
            className="h-8 w-8 p-0"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Street View Container */}
      <div 
        ref={streetViewRef} 
        style={{ height }}
        className="relative"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-[#1DBFDD] rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading Street View...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center p-4">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
        <span>Drag to look around</span>
        <span>Google Street View</span>
      </div>
    </div>
  );
}
