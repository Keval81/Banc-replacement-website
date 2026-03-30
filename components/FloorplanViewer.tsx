"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Download, 
  Move,
  Ruler,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Floorplan } from "@/lib/types/property";

interface FloorplanViewerProps {
  floorplans: Floorplan[];
  className?: string;
}

export function FloorplanViewer({ floorplans, className = "" }: FloorplanViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showMeasureMode, setShowMeasureMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentFloorplan = floorplans[currentIndex];

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ 
        x: e.clientX - position.x, 
        y: e.clientY - position.y 
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Limit pan boundaries
      const maxOffset = (zoom - 1) * 200;
      setPosition({
        x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
        y: Math.max(-maxOffset, Math.min(maxOffset, newY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    // In production, this would download the actual PDF
    const link = document.createElement('a');
    link.href = currentFloorplan.url;
    link.download = `${currentFloorplan.title.replace(/\s+/g, '_')}.pdf`;
    link.click();
  };

  if (floorplans.length === 0) {
    return (
      <div className={`bg-banc-grey-pale rounded-lg p-8 text-center ${className}`}>
        <p className="text-banc-grey">No floorplans available</p>
      </div>
    );
  }

  const viewerContent = (
    <div className={`bg-white rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-banc-grey-pale border-b border-banc-grey/20">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-banc-dark">
            {currentFloorplan.title}
          </h3>
          {floorplans.length > 1 && (
            <span className="text-sm text-banc-grey">
              ({currentIndex + 1} of {floorplans.length})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="h-9 w-9 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-banc-grey w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 4}
            className="h-9 w-9 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-banc-grey/30 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMeasureMode(!showMeasureMode)}
            className={`h-9 px-3 ${showMeasureMode ? 'bg-[#4AC8E8]/10 text-[#4AC8E8]' : ''}`}
          >
            <Ruler className="h-4 w-4 mr-1.5" />
            Measure
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-9 px-3"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-9 w-9 p-0"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image Container */}
      <div 
        ref={containerRef}
        className="relative bg-banc-grey-pale overflow-hidden"
        style={{ height: isFullscreen ? 'calc(100vh - 200px)' : '500px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: zoom,
            x: position.x,
            y: position.y
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
        >
          <Image
            src={currentFloorplan.url}
            alt={currentFloorplan.title}
            fill
            className="object-contain p-4"
            priority
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </motion.div>

        {/* Zoom Indicator */}
        {zoom > 1 && (
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
            <Move className="h-4 w-4" />
            <span>Drag to pan</span>
          </div>
        )}

        {/* Measure Mode Overlay */}
        {showMeasureMode && (
          <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Room Measurements</h4>
              <button 
                onClick={() => setShowMeasureMode(false)}
                className="text-banc-grey hover:text-banc-grey"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {currentFloorplan.rooms?.map((room, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center py-1.5 border-b border-banc-grey/10 last:border-0"
                >
                  <span className="text-sm text-banc-dark-mid">{room.name}</span>
                  <span className="text-sm font-medium">{room.dimensions}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Arrows */}
        {floorplans.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex(prev => (prev - 1 + floorplans.length) % floorplans.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentIndex(prev => (prev + 1) % floorplans.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {floorplans.length > 1 && (
        <div className="flex gap-2 p-4 border-t border-banc-grey/20 overflow-x-auto">
          {floorplans.map((fp, index) => (
            <button
              key={fp.id}
              onClick={() => {
                setCurrentIndex(index);
                handleReset();
              }}
              className={`relative flex-shrink-0 w-24 h-16 overflow-hidden rounded border-2 transition-all ${
                index === currentIndex
                  ? "border-[#4AC8E8]"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={fp.thumbnailUrl || fp.url}
                alt={fp.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Floorplan Info */}
      {currentFloorplan.dimensions && (
        <div className="px-4 py-3 bg-banc-grey-pale border-t border-banc-grey/20 text-sm text-banc-grey">
          Dimensions: {currentFloorplan.dimensions.width} × {currentFloorplan.dimensions.height} {currentFloorplan.dimensions.unit}
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-banc-dark-deep text-white">
          <h2 className="text-lg font-semibold">Floorplan Viewer</h2>
          <button 
            onClick={() => setIsFullscreen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 p-4">
          {viewerContent}
        </div>
      </div>
    );
  }

  return viewerContent;
}
