"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Bed, 
  Bath, 
  Square, 
  Sparkles, 
  Share2, 
  Heart,
  ChevronLeft,
  ChevronRight,
  Scale,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useFavorites } from "@/app/hooks/useFavorites";
import { cn } from "@/lib/utils";

/** Property statistics shape */
interface PropertyStats {
  beds: number;
  baths: number;
  sqft?: number;
  epc?: string;
}

/** Extended PropertyCard with compare and favorite functionality */
interface PropertyCardProps {
  id: string;
  title: string;
  address: string;
  price: string;
  priceValue?: number;
  tags: string[];
  stats: PropertyStats;
  images: string[];
  summary: string;
  type?: string;
  tenure?: string;
  dateAdded?: string;
  showCompare?: boolean;
  isCompared?: boolean;
  canCompare?: boolean;
  onCompareToggle?: () => void;
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
  showCompare = false,
  isCompared = false,
  canCompare = true,
  onCompareToggle,
}: PropertyCardProps): React.ReactElement {
  const safeImages = images.length > 0 ? images : ["/hertfordshire-home-1.png"];
  const [imageIndex, setImageIndex] = React.useState(0);
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const [isToggling, setIsToggling] = React.useState(false);

  const nextImage = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setImageIndex((prev) => (prev + 1) % safeImages.length);
  };

  const prevImage = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setImageIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  const currentImageUrl = safeImages[imageIndex];
  const hasMultipleImages = safeImages.length > 1;
  const favorited = isFavorite(id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading || isToggling) return;
    
    setIsToggling(true);
    try {
      await toggleFavorite({
        id,
        title,
        price,
        image: images[0],
        address,
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCompareToggle?.();
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group overflow-hidden rounded-[10px] border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md cursor-pointer",
        isCompared ? "border-banc-sky ring-1 ring-banc-sky" : "border-banc-grey/20"
      )}
    >
      {/* Simple Image Carousel - Click goes to property page */}
      <Link href={`/sales/properties/${id}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-banc-grey-pale">
          <Image
            src={currentImageUrl}
            alt={`${title} - Property Image`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />

          {/* Tags Overlay */}
          {tags.length > 0 && (
            <div className="absolute left-2 sm:left-3 top-2 sm:top-3 flex flex-wrap gap-1 sm:gap-1.5 max-w-[calc(100%-4rem)]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/95 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-banc-dark shadow-sm whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Compare Checkbox Overlay */}
          {showCompare && (
            <div className="absolute right-2 sm:right-3 top-2 sm:top-3 z-10">
              <button
                onClick={handleCompareClick}
                disabled={!canCompare && !isCompared}
                className={cn(
                  "flex items-center gap-1 px-2 sm:gap-1.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all shadow-md",
                  isCompared
                    ? "bg-banc-sky text-white"
                    : canCompare
                    ? "bg-white/95 text-banc-dark-mid hover:bg-white"
                    : "bg-banc-grey/20/80 text-banc-grey cursor-not-allowed"
                )}
              >
                {isCompared ? (
                  <>
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">Comparing</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">Compare</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Navigation Arrows - only show if multiple images */}
          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/90 text-banc-dark opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-white shadow-md touch-manipulation"
                aria-label="Previous image"
                style={{ touchAction: 'manipulation' }}
              >
                <ChevronLeft className="h-5 w-5 sm:h-4 sm:w-4" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/90 text-banc-dark opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-white shadow-md touch-manipulation"
                aria-label="Next image"
                style={{ touchAction: 'manipulation' }}
              >
                <ChevronRight className="h-5 w-5 sm:h-4 sm:w-4" />
              </button>
              <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white font-medium">
                {imageIndex + 1} / {safeImages.length}
              </span>
            </>
          )}
        </div>
      </Link>

      {/* Property Details */}
      <div className="flex flex-col gap-3 p-4">
        <Link href={`/sales/properties/${id}`} className="block group/link">
          <div>
            <p className="text-xs text-banc-grey line-clamp-1 mb-0.5">{address}</p>
            <h3 className="text-base font-semibold text-banc-dark group-hover/link:text-banc-sky transition-colors line-clamp-1">
              {title}
            </h3>
            <p className="mt-2 text-xl font-bold text-banc-sky">{price}</p>
          </div>
        </Link>

        {/* Stats Row */}
        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-banc-grey">
          <span className="flex items-center gap-1 min-w-[4.5rem] sm:min-w-0">
            <Bed className="h-3.5 w-3.5 text-banc-sky flex-shrink-0" />
            <span className="font-medium">{stats.beds}</span>
            <span className="hidden sm:inline"> Beds</span>
          </span>
          <span className="flex items-center gap-1 min-w-[4.5rem] sm:min-w-0">
            <Bath className="h-3.5 w-3.5 text-banc-sky flex-shrink-0" />
            <span className="font-medium">{stats.baths}</span>
            <span className="hidden sm:inline"> Baths</span>
          </span>
          {stats.sqft !== undefined && (
            <span className="flex items-center gap-1 min-w-[4.5rem] sm:min-w-0">
              <Square className="h-3.5 w-3.5 text-banc-sky flex-shrink-0" />
              <span className="font-medium">{stats.sqft.toLocaleString()}</span>
              <span className="hidden sm:inline"> Sq Ft</span>
            </span>
          )}
          {stats.epc !== undefined && (
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-banc-sky flex-shrink-0" />
              <span className="font-medium">EPC {stats.epc}</span>
            </span>
          )}
        </div>

        {/* Summary */}
        <p className="text-xs text-banc-grey line-clamp-2">
          {summary}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Link href={`/sales/properties/${id}`} className="flex-1">
            <Button size="sm" className="w-full bg-banc-sky hover:bg-banc-sky-dark transition-colors text-xs min-h-[44px] sm:min-h-0">
              View Details
            </Button>
          </Link>
          <button
            type="button"
            onClick={handleFavoriteClick}
            disabled={isLoading || isToggling}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200 cursor-pointer touch-manipulation",
              favorited
                ? "border-red-500 bg-red-500 text-white hover:bg-red-600"
                : "border-banc-grey/20 text-banc-grey hover:border-red-400 hover:text-red-500"
            )}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            style={{ touchAction: 'manipulation' }}
          >
            <Heart className={cn("h-5 w-5 sm:h-3.5 sm:w-3.5", favorited && "fill-current")} />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-banc-grey/20 text-banc-grey transition-colors duration-200 hover:border-banc-sky hover:text-banc-sky cursor-pointer touch-manipulation"
            aria-label="Share property"
            style={{ touchAction: 'manipulation' }}
          >
            <Share2 className="h-5 w-5 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
