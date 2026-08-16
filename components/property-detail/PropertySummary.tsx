"use client";

import * as React from "react";
import { Bath, Bed, Check, Heart, Share2, Sofa } from "lucide-react";

import { useFavorites } from "@/app/hooks/useFavorites";
import { getDisplayCount, getDisplayFact } from "@/lib/property-detail-view";
import {
  buildPropertyShareData,
  shareProperty,
  type LivePropertyDetail,
  type PropertyShareResult,
} from "@/lib/property-view";
import { cn } from "@/lib/utils";

interface PropertySummaryProps {
  property: LivePropertyDetail;
}

export function PropertySummary({ property }: PropertySummaryProps): React.ReactElement {
  const [isToggling, setIsToggling] = React.useState(false);
  const [shareStatus, setShareStatus] = React.useState<PropertyShareResult | null>(null);
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const favorited = isFavorite(property.id);
  const price = property.priceQualifier ?? property.price;
  const tenure = getDisplayFact(property.tenure);
  const tag = property.tags
    .map(getDisplayFact)
    .find((value): value is string => value !== null);
  const location = [getDisplayFact(property.address), getDisplayFact(property.postcode)]
    .filter((part): part is string => part !== null)
    .join(", ");
  const numericFacts = [
    { icon: Bed, label: "Bedrooms", value: getDisplayCount(property.stats.beds) },
    { icon: Bath, label: "Bathrooms", value: getDisplayCount(property.stats.baths) },
    { icon: Sofa, label: "Receptions", value: getDisplayCount(property.receptions) },
  ].filter(
    (fact): fact is { icon: typeof Bed; label: string; value: number } => fact.value !== null
  );
  const facts: Array<{ icon?: typeof Bed; label: string; value: number | string }> = tenure
    ? [...numericFacts, { label: "Tenure", value: tenure }]
    : numericFacts;

  const handleFavorite = async (): Promise<void> => {
    if (isLoading || isToggling) return;

    setIsToggling(true);
    try {
      await toggleFavorite({
        id: property.id,
        title: property.title,
        price,
        image: property.gallery[0]?.url,
        address: property.address,
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleShare = async (): Promise<void> => {
    const shareData = buildPropertyShareData({
      department: property.department,
      id: property.id,
      title: property.title,
      address: property.address,
      price,
      origin: window.location.origin,
    });

    try {
      const result = await shareProperty(shareData, {
        nativeShare: navigator.share?.bind(navigator),
        copyText: navigator.clipboard?.writeText.bind(navigator.clipboard),
      });
      setShareStatus(result);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setShareStatus("unavailable");
    }
  };

  const shareLabel =
    shareStatus === "copied"
      ? "Property link copied"
      : shareStatus === "shared"
        ? "Property shared"
      : shareStatus === "unavailable"
        ? "Sharing unavailable"
        : "Share property";
  const shareAnnouncement =
    shareStatus === "copied"
      ? `${property.title} link copied to clipboard`
      : shareStatus === "shared"
        ? `${property.title} shared`
      : shareStatus === "unavailable"
        ? `${property.title} could not be shared on this device`
        : "";

  return (
    <section aria-labelledby="property-title">
      {tag && (
        <span className="inline-flex rounded-full bg-banc-dark px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-white">
          {tag}
        </span>
      )}
      <div className="mt-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 id="property-title" className="font-serif text-3xl leading-tight text-banc-dark sm:text-4xl">
            {property.title}
          </h1>
          {location && <p className="mt-2 text-sm text-banc-grey sm:text-base">{location}</p>}
          <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-banc-dark sm:text-4xl">
            {price}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleFavorite}
            disabled={isLoading || isToggling}
            aria-label={favorited ? `Remove ${property.title} from saved properties` : `Save ${property.title}`}
            aria-pressed={favorited}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
              favorited
                ? "border-banc-dark bg-banc-dark text-white"
                : "border-banc-grey/30 text-banc-dark hover:border-banc-dark hover:bg-banc-grey-pale"
            )}
          >
            <Heart className={cn("h-5 w-5", favorited && "fill-current")} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label={`${shareLabel}: ${property.title}`}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
              shareStatus === "copied"
                ? "border-banc-sky bg-banc-sky/15 text-banc-dark"
                : "border-banc-grey/30 text-banc-dark hover:border-banc-dark hover:bg-banc-grey-pale"
            )}
          >
            {shareStatus === "copied" ? (
              <Check className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Share2 className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {facts.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 border-y border-banc-grey/20 sm:grid-cols-4">
          {facts.map((fact) => (
            <PropertyFact key={fact.label} {...fact} />
          ))}
        </dl>
      )}

      <span className="sr-only" aria-live="polite">
        {shareAnnouncement}
      </span>
    </section>
  );
}

function PropertyFact({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Bed;
  label: string;
  value: number | string;
}): React.ReactElement {
  return (
    <div className="min-w-0 px-3 py-4 first:pl-0 sm:border-r sm:border-banc-grey/20 sm:px-4 sm:first:pl-0 sm:last:border-r-0">
      <dt className="flex items-center gap-1.5 text-xs text-banc-grey">
        {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold text-banc-dark">{value}</dd>
    </div>
  );
}
