"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react";
import type { PropertyPeek } from "@/lib/property-chat-peek";

interface ChatPropertyViewProps {
  title: string;
  /** Null while the details are on their way. */
  property: PropertyPeek | null;
  failed: boolean;
  fullListingHref: string;
  viewingHref: string;
  onBack: () => void;
  onAsk: () => void;
  onLeaveChat: () => void;
}

const PARAGRAPHS_BEFORE_MORE = 2;

/** A home, inside the chat panel: photos to swipe through, the key details, and the way back to the conversation. */
export function ChatPropertyView({
  title,
  property,
  failed,
  fullListingHref,
  viewingHref,
  onBack,
  onAsk,
  onLeaveChat,
}: ChatPropertyViewProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [photo, setPhoto] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const images = property?.images ?? [];

  const step = (direction: 1 | -1) => {
    const gallery = galleryRef.current;
    if (gallery === null) return;
    gallery.scrollBy({ left: direction * gallery.clientWidth, behavior: "smooth" });
  };

  const paragraphs = property?.description ?? [];
  const shown = showAll ? paragraphs : paragraphs.slice(0, PARAGRAPHS_BEFORE_MORE);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex shrink-0 items-center border-b border-banc-grey/10 px-2 py-1.5">
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-medium text-banc-focus transition-colors duration-200 hover:bg-banc-grey-pale hover:text-banc-focus-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to chat
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {/* Photos */}
        <div className="relative bg-banc-grey/15">
          <div
            ref={galleryRef}
            onScroll={(event) => {
              const gallery = event.currentTarget;
              if (gallery.clientWidth > 0) {
                setPhoto(Math.round(gallery.scrollLeft / gallery.clientWidth));
              }
            }}
            className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
            aria-label={`Photos of ${title}`}
          >
            {images.length === 0 ? (
              <div className="aspect-[4/3] w-full flex-shrink-0 animate-pulse bg-banc-grey/20 motion-reduce:animate-none" />
            ) : (
              images.map((url, index) => (
                <div key={`${url}-${index}`} className="aspect-[4/3] w-full flex-shrink-0 snap-center">
                  <Image
                    src={url}
                    alt={`${title}, photo ${index + 1} of ${images.length}`}
                    width={840}
                    height={630}
                    unoptimized
                    loading={index < 2 ? "eager" : "lazy"}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))
            )}
          </div>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={photo === 0}
                className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-banc-dark shadow-md transition-opacity duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus disabled:opacity-0 sm:flex"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                disabled={photo >= images.length - 1}
                className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-banc-dark shadow-md transition-opacity duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus disabled:opacity-0 sm:flex"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <span className="absolute bottom-3 right-3 rounded-full bg-banc-dark-deep/80 px-2.5 py-1 text-xs font-medium text-white">
                {Math.min(photo + 1, images.length)} / {images.length}
              </span>
            </>
          )}
        </div>

        <div className="space-y-5 px-4 py-4">
          {property === null ? (
            failed ? (
              <p className="text-[15px] leading-relaxed text-banc-dark">
                I couldn&apos;t load {title} here. The full listing has everything.
              </p>
            ) : (
              <div className="space-y-3" aria-label={`Loading ${title}`}>
                <div className="h-7 w-32 animate-pulse rounded bg-banc-grey/20 motion-reduce:animate-none" />
                <div className="h-5 w-56 animate-pulse rounded bg-banc-grey/20 motion-reduce:animate-none" />
                <div className="h-20 w-full animate-pulse rounded bg-banc-grey/15 motion-reduce:animate-none" />
              </div>
            )
          ) : (
            <>
              <div>
                {property.tag && (
                  <span className="mb-2 inline-block rounded-full bg-banc-dark-deep px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-white">
                    {property.tag}
                  </span>
                )}
                <p className="text-2xl font-semibold leading-tight text-banc-dark">{property.price}</p>
                <p className="mt-1 text-base font-medium leading-snug text-banc-dark">{property.title}</p>
                {property.address && property.address !== property.title && (
                  <p className="mt-0.5 text-sm text-banc-muted-readable">{property.address}</p>
                )}
              </div>

              {property.facts.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {property.facts.map((fact) => (
                    <li
                      key={fact}
                      className="rounded-full border border-banc-grey/20 bg-banc-grey-pale px-3 py-1.5 text-[13px] font-medium text-banc-dark"
                    >
                      {fact}
                    </li>
                  ))}
                </ul>
              )}

              {property.features.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-banc-muted-readable">
                    Key features
                  </p>
                  <ul className="mt-1.5 divide-y divide-banc-grey/10">
                    {property.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 py-2 text-sm font-medium text-banc-dark">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-banc-focus" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {shown.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-banc-muted-readable">
                    About this home
                  </p>
                  <div className="mt-1.5 space-y-3 text-[15px] leading-[1.55] text-banc-dark">
                    {shown.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                  {paragraphs.length > PARAGRAPHS_BEFORE_MORE && (
                    <button
                      type="button"
                      onClick={() => setShowAll((current) => !current)}
                      className="mt-1 flex min-h-11 cursor-pointer items-center text-sm font-medium text-banc-focus underline-offset-2 hover:text-banc-focus-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus"
                    >
                      {showAll ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              )}

              {property.floorplan && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-banc-muted-readable">
                    Floorplan
                  </p>
                  <Image
                    src={property.floorplan}
                    alt={`Floorplan of ${title}`}
                    width={840}
                    height={630}
                    unoptimized
                    loading="lazy"
                    className="mt-2 h-auto w-full rounded-xl border border-banc-grey/15 bg-white"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* What next */}
      <div className="shrink-0 space-y-2 border-t border-banc-grey/10 bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:pb-4">
        <button
          type="button"
          onClick={onAsk}
          className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-banc-focus px-4 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-banc-focus-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2"
        >
          Ask Banc Bot about this home
        </button>
        <div className="flex gap-2">
          {property?.available && (
            <Link
              href={viewingHref}
              onClick={onLeaveChat}
              className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-banc-focus/30 px-3 text-sm font-medium text-banc-focus transition-colors duration-200 hover:bg-banc-grey-pale hover:text-banc-focus-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2"
            >
              Book a viewing
            </Link>
          )}
          <Link
            href={fullListingHref}
            onClick={onLeaveChat}
            className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-banc-focus/30 px-3 text-sm font-medium text-banc-focus transition-colors duration-200 hover:bg-banc-grey-pale hover:text-banc-focus-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2"
          >
            Full listing
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
