"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize2, 
  Play, 
  ZoomIn,
  ZoomOut,
  ImageIcon,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PropertyImage } from "@/lib/types/property";

interface PropertyGalleryProps {
  images: PropertyImage[];
  showThumbnails?: boolean;
  className?: string;
}

export function PropertyGallery({ 
  images, 
  showThumbnails = true,
  className = ""
}: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showZoom, setShowZoom] = useState(false);

  const currentImage = images[currentIndex];

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsLoading(true);
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsLoading(true);
  }, [images.length]);

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
    setIsLoading(true);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "Escape") {
        setIsFullscreen(false);
        setZoomLevel(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, goToNext, goToPrev]);

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) goToNext();
    if (isRightSwipe) goToPrev();
  };

  const handleZoom = () => {
    if (zoomLevel === 1) {
      setZoomLevel(2);
    } else if (zoomLevel === 2) {
      setZoomLevel(3);
    } else {
      setZoomLevel(1);
    }
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  if (images.length === 0) {
    return (
      <div className={`relative bg-banc-grey-pale rounded-lg flex items-center justify-center ${className}`}>
        <ImageIcon className="h-16 w-16 text-banc-grey" />
        <span className="ml-2 text-banc-grey">No images available</span>
      </div>
    );
  }

  return (
    <>
      {/* Main Gallery */}
      <div className={`relative ${className}`}>
        {/* Main Image */}
        <div 
          className="relative bg-black rounded-lg overflow-hidden cursor-zoom-in group"
          onClick={() => setIsFullscreen(true)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="aspect-[4/3] relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-banc-dark-deep">
                <Loader2 className="h-8 w-8 text-[#4AC8E8] animate-spin" />
              </div>
            )}
            <Image
              src={currentImage.url}
              alt={currentImage.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority={currentIndex === 0}
              onLoad={() => setIsLoading(false)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 800px"
            />
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 text-[#2C2A27] hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 text-[#2C2A27] hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-white font-medium">
            {currentIndex + 1} / {images.length}
            {currentImage.caption && (
              <span className="ml-2 text-banc-grey">{currentImage.caption}</span>
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
            className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 backdrop-blur-sm text-white hover:bg-black/90 transition-all"
            aria-label="View fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* Primary Image Badge */}
          {currentImage.isPrimary && (
            <div className="absolute top-3 left-3 bg-[#4AC8E8] text-white px-2.5 py-1 text-xs font-semibold rounded">
              Featured
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {showThumbnails && images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToIndex(index)}
                className={`relative flex-shrink-0 w-20 h-14 overflow-hidden rounded-lg border-2 transition-all ${
                  index === currentIndex
                    ? "border-[#4AC8E8] ring-2 ring-[#4AC8E8]/20"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
                aria-label={`Go to image ${index + 1}`}
              >
                <Image
                  src={image.thumbnailUrl || image.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black"
          >
            {/* Close Button */}
            <button
              onClick={() => { setIsFullscreen(false); resetZoom(); }}
              className="absolute right-4 top-4 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close fullscreen"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Zoom Controls */}
            <div className="absolute right-4 top-20 z-20 flex flex-col gap-2">
              <button
                onClick={handleZoom}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Zoom"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                onClick={resetZoom}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Reset zoom"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
            </div>

            {/* Main Image Area */}
            <div 
              className="relative h-full flex items-center justify-center overflow-hidden"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <motion.div
                animate={{ scale: zoomLevel }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full"
                style={{ cursor: zoomLevel > 1 ? 'grab' : 'default' }}
              >
                <Image
                  src={currentImage.url}
                  alt={currentImage.alt}
                  fill
                  className="object-contain"
                  priority
                  sizes="100vw"
                />
              </motion.div>

              {/* Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-7 w-7" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-20 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-7 w-7" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pb-6 pt-12">
              <div className="max-w-4xl mx-auto px-4">
                {/* Counter */}
                <div className="text-center mb-4">
                  <span className="text-white text-lg font-medium">
                    {currentIndex + 1} / {images.length}
                  </span>
                  {currentImage.caption && (
                    <p className="text-banc-grey mt-1">{currentImage.caption}</p>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => goToIndex(index)}
                        className={`relative flex-shrink-0 w-16 h-12 overflow-hidden rounded border-2 transition-all ${
                          index === currentIndex
                            ? "border-[#4AC8E8]"
                            : "border-transparent opacity-50 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={image.thumbnailUrl || image.url}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
