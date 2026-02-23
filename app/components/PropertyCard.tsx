"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bed, 
  Bath, 
  Square, 
  Sparkles, 
  Share2, 
  Heart, 
  X, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  Home,
  ImageIcon,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";

// View types for the tabbed interface
type ViewType = "images" | "map" | "floorplan";

interface PropertyCardProps {
  id: string;
  title: string;
  address: string;
  price: string;
  tags: string[];
  stats: { beds: number; baths: number; sqft: number; epc: string };
  images: string[];
  summary: string;
  // Optional map and floorplan images
  mapImage?: string;
  floorplanImage?: string;
}

export default function PropertyCard({
  id,
  title,
  address,
  price,
  tags,
  stats,
  images,
  summary,
  mapImage,
  floorplanImage,
}: PropertyCardProps) {
  const [imageIndex, setImageIndex] = React.useState(0);
  const [activeView, setActiveView] = React.useState<ViewType>("images");
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);
  const touchStart = React.useRef<number | null>(null);

  // Check if we have alternative views available
  const hasMap = !!mapImage;
  const hasFloorplan = !!floorplanImage;
  const hasAlternativeViews = hasMap || hasFloorplan;

  // Get current view's image source
  const getCurrentImage = () => {
    switch (activeView) {
      case "map":
        return mapImage || images[imageIndex];
      case "floorplan":
        return floorplanImage || images[imageIndex];
      default:
        return images[imageIndex];
    }
  };

  // Get all images for lightbox (based on active view)
  const getLightboxImages = () => {
    switch (activeView) {
      case "map":
        return mapImage ? [mapImage] : images;
      case "floorplan":
        return floorplanImage ? [floorplanImage] : images;
      default:
        return images;
    }
  };

  const nextImage = () => {
    if (activeView !== "images") return;
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (activeView !== "images") return;
    setImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const onTouchStart = (event: React.TouchEvent) => {
    if (activeView !== "images") return;
    touchStart.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (activeView !== "images" || touchStart.current === null) return;
    const diff = touchStart.current - event.changedTouches[0].clientX;
    if (diff > 40) nextImage();
    if (diff < -40) prevImage();
    touchStart.current = null;
  };

  // Lightbox controls
  const openLightbox = (index?: number) => {
    setLightboxIndex(index ?? (activeView === "images" ? imageIndex : 0));
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  };

  const nextLightboxImage = () => {
    const lightboxImages = getLightboxImages();
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const prevLightboxImage = () => {
    const lightboxImages = getLightboxImages();
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };

  // Handle keyboard navigation for lightbox
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevLightboxImage();
      if (e.key === "ArrowRight") nextLightboxImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen]);

  return (
    <>
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ duration: 0.2 }}
        className="group overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-sm transition-shadow hover:shadow-xl"
      >
        {/* Image / Map / Floorplan Container */}
        <div
          className="relative aspect-[4/3] w-full overflow-hidden bg-[#F3F4F6]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Main Image with transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeView}-${activeView === "images" ? imageIndex : 0}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Image
                src={getCurrentImage()}
                alt={activeView === "images" ? title : `${title} - ${activeView}`}
                fill
                className="object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
                onClick={() => openLightbox()}
              />
            </motion.div>
          </AnimatePresence>

          {/* Tags Overlay */}
          <div className="absolute left-4 top-4 flex flex-wrap gap-2 z-10">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#111827]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Expand/Lightbox Button */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); openLightbox(); }}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#111827] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
            aria-label="View larger image"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* View Switcher Tabs (like Foxtons) */}
          {hasAlternativeViews && (
            <div className="absolute left-4 right-4 top-16 flex justify-center z-10">
              <div className="flex rounded-full bg-black/50 backdrop-blur-sm p-1">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setActiveView("images"); }}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    activeView === "images"
                      ? "bg-white text-[#111827]"
                      : "text-white hover:text-white/80"
                  }`}
                >
                  <ImageIcon className="h-3 w-3" />
                  Photos
                </button>
                {hasMap && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setActiveView("map"); }}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      activeView === "map"
                        ? "bg-white text-[#111827]"
                        : "text-white hover:text-white/80"
                    }`}
                  >
                    <MapPin className="h-3 w-3" />
                    Map
                  </button>
                )}
                {hasFloorplan && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setActiveView("floorplan"); }}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      activeView === "floorplan"
                        ? "bg-white text-[#111827]"
                        : "text-white hover:text-white/80"
                    }`}
                  >
                    <Home className="h-3 w-3" />
                    Floorplan
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation Controls (only for images view) */}
          {activeView === "images" && images.length > 1 && (
            <>
              <div className="absolute inset-x-4 bottom-16 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); prevImage(); }}
                    className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold hover:bg-white transition-colors"
                    aria-label="Previous image"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); nextImage(); }}
                    className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold hover:bg-white transition-colors"
                    aria-label="Next image"
                  >
                    Next
                  </button>
                </div>
                <span className="rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                  {imageIndex + 1} / {images.length}
                </span>
              </div>
            </>
          )}

          {/* View Indicator Label */}
          {activeView !== "images" && (
            <div className="absolute left-4 bottom-16 z-10">
              <span className="rounded-full bg-black/60 px-3 py-1 text-xs text-white capitalize">
                {activeView === "floorplan" ? "Floor Plan" : "Map"}
              </span>
            </div>
          )}

          {/* Click to expand hint */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
            <span className="rounded-full bg-black/40 backdrop-blur-sm px-4 py-2 text-sm text-white">
              Click to expand
            </span>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex flex-col gap-4 p-6">
          <Link href={`/sales/properties/${id}`} className="block">
            <div>
              <p className="text-sm text-[#6B7280]">{address}</p>
              <h3 className="text-lg font-semibold text-[#111827] group-hover:text-[#1DBFDD] transition-colors">{title}</h3>
              <p className="mt-3 text-2xl font-semibold text-[#0D9488]">{price}</p>
            </div>
          </Link>

          <div className="flex flex-wrap gap-4 text-xs text-[#6B7280]">
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4 text-[#0D9488]" /> {stats.beds} Beds
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4 text-[#0D9488]" /> {stats.baths} Baths
            </span>
            <span className="flex items-center gap-1">
              <Square className="h-4 w-4 text-[#0D9488]" /> {stats.sqft} Sq Ft
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-[#0D9488]" /> EPC {stats.epc}
            </span>
          </div>

          <p
            className="text-sm text-[#6B7280]"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {summary}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/sales/properties/${id}`} className="flex-1">
              <Button size="sm" className="w-full bg-[#1DBFDD] hover:bg-[#0E8CAB]">
                View Details
              </Button>
            </Link>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#111827] transition-colors hover:border-[#0D9488] hover:text-[#0D9488]"
              aria-label="Save property"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#111827] transition-colors hover:border-[#0D9488] hover:text-[#0D9488]"
              aria-label="Share property"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.article>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Image Counter */}
            <div className="absolute left-4 top-4 z-50">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                {lightboxIndex + 1} / {getLightboxImages().length}
                {activeView !== "images" && ` • ${activeView === "floorplan" ? "Floor Plan" : "Map"}`}
              </span>
            </div>

            {/* Main Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative h-full w-full max-w-6xl max-h-[90vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={getLightboxImages()[lightboxIndex]}
                alt={`${title} - Image ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                priority
              />
            </motion.div>

            {/* Navigation Arrows (only if multiple images) */}
            {getLightboxImages().length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); prevLightboxImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); nextLightboxImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Thumbnail Strip (for property images only) */}
            {activeView === "images" && images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                    className={`relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                      idx === lightboxIndex ? "ring-2 ring-white" : "opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Keyboard hint */}
            <div className="absolute bottom-4 right-4 z-50 hidden md:block">
              <span className="text-xs text-white/50">
                Press ESC to close • ← → to navigate
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
