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
  sqft: number;
  epc: string;
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
  const safeImages = images.length > 0 ? images : ["/placeholder-property.jpg"];
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
        "group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-lg",
        isCompared ? "border-[#1DBFDD] ring-1 ring-[#1DBFDD]" : "border-[#E5E7EB]"
      )}
    >
      {/* Simple Image Carousel - Click goes to property page */}
      <Link href={`/sales/properties/${id}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F3F4F6]">
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
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#111827] shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Compare Checkbox Overlay */}
          {showCompare && (
            <div className="absolute right-3 top-3 z-10">
              <button
                onClick={handleCompareClick}
                disabled={!canCompare && !isCompared}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-md",
                  isCompared
                    ? "bg-[#1DBFDD] text-white"
                    : canCompare
                    ? "bg-white/95 text-gray-700 hover:bg-white"
                    : "bg-gray-200/80 text-gray-400 cursor-not-allowed"
                )}
              >
                {isCompared ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Comparing</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-3.5 h-3.5" />
                    <span>Compare</span>
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
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-[#111827] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white shadow-md"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-[#111827] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white shadow-md"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
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
            <p className="text-xs text-[#6B7280] line-clamp-1 mb-0.5">{address}</p>
            <h3 className="text-base font-semibold text-[#111827] group-hover/link:text-[#1DBFDD] transition-colors line-clamp-1">
              {title}
            </h3>
            <p className="mt-2 text-xl font-bold text-[#0D9488]">{price}</p>
          </div>
        </Link>

        {/* Stats Row */}
        <div className="flex flex-wrap gap-3 text-xs text-[#6B7280]">
          <span className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5 text-[#0D9488]" />
            <span className="font-medium">{stats.beds}</span> Beds
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5 text-[#0D9488]" />
            <span className="font-medium">{stats.baths}</span> Baths
          </span>
          <span className="flex items-center gap-1">
            <Square className="h-3.5 w-3.5 text-[#0D9488]" />
            <span className="font-medium">{stats.sqft}</span> Sq Ft
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-[#0D9488]" />
            <span className="font-medium">EPC {stats.epc}</span>
          </span>
        </div>

        {/* Summary */}
        <p className="text-xs text-[#6B7280] line-clamp-2">
          {summary}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Link href={`/sales/properties/${id}`} className="flex-1">
            <Button size="sm" className="w-full bg-[#1DBFDD] hover:bg-[#0E8CAB] transition-colors text-xs">
              View Details
            </Button>
          </Link>
          <button
            type="button"
            onClick={handleFavoriteClick}
            disabled={isLoading || isToggling}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border transition-all",
              favorited
                ? "border-red-500 bg-red-500 text-white hover:bg-red-600"
                : "border-[#E5E7EB] text-[#6B7280] hover:border-red-400 hover:text-red-500"
            )}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("h-3.5 w-3.5", favorited && "fill-current")} />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] transition-all hover:border-[#0D9488] hover:text-[#0D9488]"
            aria-label="Share property"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
