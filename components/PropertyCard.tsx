"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Bath,
  Bed,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Scale,
  Share2,
  Sparkles,
  Square,
} from "lucide-react";
import { useFavorites } from "@/app/hooks/useFavorites";
import { PropertyPhotoPlaceholder } from "@/components/property/PropertyPhotoPlaceholder";
import { getPropertyPhotoPresentation } from "@/lib/property-detail-view";
import {
  buildPropertyHref,
  buildPropertyShareData,
  isSameAddressText,
  shareProperty,
  titleCaseAddress,
  type PropertyShareResult,
} from "@/lib/property-view";
import { cn } from "@/lib/utils";

interface PropertyStats {
  beds: number;
  baths: number;
  sqft?: number;
  epc?: string;
}

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
  department?: "sales" | "lettings";
  type?: string;
  tenure?: string;
  dateAdded?: string;
  variant?: "grid" | "list";
  imagePriority?: boolean;
  showCompare?: boolean;
  isCompared?: boolean;
  canCompare?: boolean;
  onCompareToggle?: () => void;
}

function PropertyCardBase({
  id,
  title: rawTitle,
  address: rawAddress,
  price,
  tags,
  stats,
  images,
  summary,
  department = "sales",
  variant = "grid",
  imagePriority = false,
  showCompare = false,
  isCompared = false,
  canCompare = true,
  onCompareToggle,
}: PropertyCardProps): React.ReactElement {
  // CRM titles are often the raw uppercase address line; fold them into
  // readable prose and don't print the address twice when it says the same.
  const title = titleCaseAddress(rawTitle);
  const address = titleCaseAddress(rawAddress);
  const showAddressLine = !isSameAddressText(title, address);
  const photoPresentation = getPropertyPhotoPresentation(images);
  const safeImages = photoPresentation.items;
  const [imageIndex, setImageIndex] = React.useState(0);
  const [isToggling, setIsToggling] = React.useState(false);
  const [shareStatus, setShareStatus] = React.useState<PropertyShareResult | null>(null);
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const reduceMotion = useReducedMotion();
  const propertyHref = buildPropertyHref(department, id);
  const currentImageUrl = safeImages[imageIndex];
  const hasMultipleImages = safeImages.length > 1;
  const favorited = isFavorite(id);

  const changeImage = (event: React.MouseEvent, direction: -1 | 1): void => {
    event.preventDefault();
    event.stopPropagation();
    setImageIndex((current) => (current + direction + safeImages.length) % safeImages.length);
  };

  const handleFavoriteClick = async (event: React.MouseEvent): Promise<void> => {
    event.preventDefault();
    event.stopPropagation();

    if (isLoading || isToggling) return;

    setIsToggling(true);
    try {
      await toggleFavorite({
        id,
        title,
        price,
        image: safeImages[0],
        address,
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleCompareClick = (event: React.MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    onCompareToggle?.();
  };

  const handleShareClick = async (event: React.MouseEvent): Promise<void> => {
    event.preventDefault();
    event.stopPropagation();

    const data = buildPropertyShareData({
      department,
      id,
      title,
      address,
      price,
      origin: window.location.origin,
    });

    try {
      const result = await shareProperty(data, {
        nativeShare:
          typeof navigator.share === "function"
            ? (shareData) => navigator.share(shareData)
            : undefined,
        copyText: navigator.clipboard?.writeText
          ? (value) => navigator.clipboard.writeText(value)
          : undefined,
      });
      setShareStatus(result);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus("unavailable");
    }
  };

  const shareLabel =
    shareStatus === "copied"
      ? "Property link copied"
      : shareStatus === "unavailable"
        ? "Sharing unavailable"
        : "Share property";
  const shareAnnouncement =
    shareStatus === "copied"
      ? `${title} link copied to clipboard`
      : shareStatus === "unavailable"
        ? `${title} could not be shared on this device`
        : "";

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "group relative isolate overflow-hidden rounded-[14px] border bg-white transition-[border-color,box-shadow] duration-300 focus-within:border-banc-dark/40 hover:border-banc-dark/30 hover:shadow-[0_18px_50px_rgba(26,25,23,0.09)]",
        isCompared ? "border-banc-sky ring-1 ring-banc-sky" : "border-banc-grey/25",
        variant === "list" && "md:grid md:grid-cols-[minmax(280px,42%)_1fr]"
      )}
    >
      <Link
        href={propertyHref}
        aria-label={`View ${title}, ${address}`}
        className="absolute inset-0 z-[1] rounded-[14px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-banc-focus"
      />

      <div
        className={cn(
          "relative aspect-[4/3] overflow-hidden bg-banc-grey-pale",
          variant === "list" && "md:aspect-auto md:min-h-[300px]"
        )}
      >
        {currentImageUrl ? (
          <>
            <Image
              src={currentImageUrl}
              alt={`${title}, ${address}`}
              fill
              sizes={
                variant === "list"
                  ? "(max-width: 768px) 100vw, 42vw"
                  : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              }
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              priority={imagePriority}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
          </>
        ) : (
          <PropertyPhotoPlaceholder message={photoPresentation.emptyMessage ?? undefined} />
        )}

        {tags.length > 0 && (
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex max-w-[calc(100%-5rem)] flex-wrap gap-1.5 sm:left-4 sm:top-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/30 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {showCompare && (
          <button
            type="button"
            onClick={handleCompareClick}
            disabled={!canCompare && !isCompared}
            aria-label={
              isCompared ? "Remove property from comparison" : "Add property to comparison"
            }
            aria-pressed={isCompared}
            className={cn(
              "absolute right-3 top-3 z-20 flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-xs font-medium shadow-sm backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 sm:right-4 sm:top-4",
              isCompared
                ? "border-banc-sky bg-banc-sky text-banc-dark"
                : canCompare
                  ? "border-white/30 bg-black/55 text-white hover:bg-black/75"
                  : "cursor-not-allowed border-white/20 bg-black/35 text-white/55"
            )}
          >
            {isCompared ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Scale className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{isCompared ? "Comparing" : "Compare"}</span>
          </button>
        )}

        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={(event) => changeImage(event, -1)}
              className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white opacity-100 backdrop-blur-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
              aria-label={`Previous image of ${title}`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(event) => changeImage(event, 1)}
              className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white opacity-100 backdrop-blur-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
              aria-label={`Next image of ${title}`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span
              role="status"
              aria-live="polite"
              aria-label={`Image ${imageIndex + 1} of ${safeImages.length}`}
              className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm sm:bottom-4 sm:right-4"
            >
              <span aria-hidden="true">{imageIndex + 1} / {safeImages.length}</span>
            </span>
          </>
        )}
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-col p-4 sm:p-5",
          variant === "list" && "md:p-7"
        )}
      >
        <div className="min-w-0">
          {showAddressLine && (
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-banc-muted-readable">
              {address}
            </p>
          )}
          <h3 className="mt-2 line-clamp-2 font-heading text-xl font-medium leading-tight text-banc-dark sm:text-[1.35rem]">
            {title}
          </h3>
          <p className="mt-3 text-xl font-semibold tracking-[-0.02em] text-banc-dark sm:text-2xl">
            {price}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-banc-grey/20 py-3 text-xs text-banc-dark-mid sm:text-sm">
          <span className="flex items-center gap-1.5">
            <Bed className="h-4 w-4 text-banc-muted-readable" aria-hidden="true" />
            <span className="font-semibold text-banc-dark">{stats.beds}</span> beds
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-banc-muted-readable" aria-hidden="true" />
            <span className="font-semibold text-banc-dark">{stats.baths}</span> baths
          </span>
          {stats.sqft !== undefined && (
            <span className="flex items-center gap-1.5">
              <Square className="h-4 w-4 text-banc-muted-readable" aria-hidden="true" />
              <span className="font-semibold text-banc-dark">
                {stats.sqft.toLocaleString("en-GB")}
              </span>{" "}
              sq ft
            </span>
          )}
          {stats.epc !== undefined && (
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-banc-muted-readable" aria-hidden="true" />
              EPC <span className="font-semibold text-banc-dark">{stats.epc}</span>
            </span>
          )}
        </div>

        <p
          className={cn(
            "mt-4 hidden text-sm leading-relaxed text-banc-muted-readable sm:line-clamp-2",
            variant === "list" && "md:line-clamp-3"
          )}
        >
          {summary}
        </p>

        <div className="mt-4 flex items-center gap-2 border-t border-banc-grey/20 pt-4 sm:mt-5">
          <span className="mr-auto inline-flex items-center gap-1.5 text-sm font-semibold text-banc-dark transition-colors group-hover:text-banc-focus">
            View property
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
          <button
            type="button"
            onClick={handleFavoriteClick}
            disabled={isLoading || isToggling}
            aria-label={
              favorited ? `Remove ${title} from saved properties` : `Save ${title}`
            }
            aria-pressed={favorited}
            className={cn(
              "relative z-20 flex h-11 w-11 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2",
              favorited
                ? "border-banc-dark bg-banc-dark text-white"
                : "border-banc-grey/30 text-banc-dark hover:border-banc-dark hover:bg-banc-grey-pale"
            )}
          >
            <Heart
              className={cn("h-[18px] w-[18px]", favorited && "fill-current")}
            />
          </button>
          <button
            type="button"
            onClick={handleShareClick}
            aria-label={`${shareLabel}: ${title}`}
            className={cn(
              "relative z-20 flex h-11 w-11 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2",
              shareStatus === "copied"
                ? "border-banc-sky bg-banc-sky/15 text-banc-dark"
                : "border-banc-grey/30 text-banc-dark hover:border-banc-dark hover:bg-banc-grey-pale"
            )}
          >
            {shareStatus === "copied" ? (
              <Check className="h-[18px] w-[18px]" />
            ) : (
              <Share2 className="h-[18px] w-[18px]" />
            )}
          </button>
          <span className="sr-only" aria-live="polite">
            {shareAnnouncement}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

// Pure presentation over props (favourites come from context), so memoising
// keeps result grids from re-rendering every card on unrelated state changes.
export const PropertyCard = React.memo(PropertyCardBase);
PropertyCard.displayName = "PropertyCard";

export default PropertyCard;
