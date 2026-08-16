"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { PropertyPhotoPlaceholder } from "@/components/property/PropertyPhotoPlaceholder";
import {
  getPropertyPhotoPresentation,
  getWrappedGalleryIndex,
} from "@/lib/property-detail-view";
import type { PropertyImage } from "@/lib/types/property";
import { cn } from "@/lib/utils";

interface PropertyHeroGalleryProps {
  images: PropertyImage[];
  className?: string;
}

export function PropertyHeroGallery({
  images,
  className,
}: PropertyHeroGalleryProps): React.ReactElement {
  const photoPresentation = getPropertyPhotoPresentation(images);
  const gallery = photoPresentation.items;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const touchStart = React.useRef<number | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const reduceMotion = useReducedMotion();

  const move = React.useCallback(
    (delta: -1 | 1) => {
      setActiveIndex((current) =>
        getWrappedGalleryIndex(current, delta, gallery.length)
      );
    },
    [gallery.length]
  );

  const openAt = (index: number, trigger: HTMLButtonElement): void => {
    triggerRef.current = trigger;
    setActiveIndex(index);
    setOpen(true);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>): void => {
    if (event.target instanceof Element && event.target.closest("button")) {
      return;
    }

    touchStart.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>): void => {
    if (touchStart.current === null) return;

    const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
    touchStart.current = null;
    if (Math.abs(distance) < 50) return;
    move(distance < 0 ? 1 : -1);
  };

  const primaryColumnClass =
    gallery.length === 1 ? "col-span-12" : gallery.length === 2 ? "col-span-8" : "col-span-7";
  const secondaryGridClass =
    gallery.length === 2
      ? "col-span-4 grid-cols-1 grid-rows-1"
      : gallery.length === 3
        ? "col-span-5 grid-cols-1 grid-rows-2"
        : "col-span-5 grid-cols-2 grid-rows-2";

  if (photoPresentation.emptyMessage) {
    return (
      <section className={cn("relative", className)} aria-label="Property photos">
        <div className="aspect-[4/3] overflow-hidden bg-banc-grey-pale lg:aspect-[16/7] lg:rounded-3xl">
          <PropertyPhotoPlaceholder message={photoPresentation.emptyMessage} />
        </div>
      </section>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <section className={cn("relative", className)} aria-label="Property photos">
        <div
          className="relative aspect-[4/3] touch-pan-y overflow-hidden bg-banc-dark lg:hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={gallery[activeIndex].url}
            alt={gallery[activeIndex].alt}
            fill
            priority
            className={cn("object-cover", !reduceMotion && "transition-opacity duration-300")}
            sizes="100vw"
          />
          <button
            type="button"
            className="absolute bottom-3 left-3 z-20 flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-banc-dark shadow-lg"
            onClick={(event) => openAt(activeIndex, event.currentTarget)}
          >
            <Images className="h-4 w-4" /> View all photos
          </button>
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 z-20 h-11 w-11 -translate-y-1/2 rounded-full bg-white/90"
                onClick={() => move(-1)}
              >
                <ChevronLeft className="mx-auto h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                className="absolute right-3 top-1/2 z-20 h-11 w-11 -translate-y-1/2 rounded-full bg-white/90"
                onClick={() => move(1)}
              >
                <ChevronRight className="mx-auto h-5 w-5" />
              </button>
            </>
          )}
          <span className="absolute bottom-3 right-3 z-20 rounded-full bg-banc-dark/80 px-3 py-1.5 text-xs font-medium text-white">
            {activeIndex + 1} / {gallery.length}
          </span>
        </div>

        <div className="relative hidden aspect-[16/7] grid-cols-12 gap-2 overflow-hidden rounded-3xl lg:grid">
          <button
            type="button"
            className={cn("relative row-span-2 overflow-hidden", primaryColumnClass)}
            onClick={(event) => openAt(0, event.currentTarget)}
          >
            <Image
              src={gallery[0].url}
              alt={gallery[0].alt}
              fill
              priority
              className={cn(
                "object-cover",
                !reduceMotion && "transition-transform duration-500 hover:scale-[1.02]"
              )}
              sizes="58vw"
            />
          </button>
          {gallery.length > 1 && (
            <div className={cn("row-span-2 grid gap-2", secondaryGridClass)}>
              {gallery.slice(1, 5).map((image, offset) => (
                <button
                  key={image.id}
                  type="button"
                  className={cn(
                    "relative overflow-hidden",
                    gallery.length === 4 && offset === 2 && "col-span-2"
                  )}
                  onClick={(event) => openAt(offset + 1, event.currentTarget)}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className={cn(
                      "object-cover",
                      !reduceMotion && "transition-transform duration-500 hover:scale-[1.03]"
                    )}
                    sizes="21vw"
                  />
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            className="absolute bottom-5 right-5 z-20 flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-banc-dark shadow-lg"
            onClick={(event) => openAt(activeIndex, event.currentTarget)}
          >
            <Images className="h-4 w-4" /> View all {gallery.length} photos
          </button>
        </div>
      </section>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/95" />
        <Dialog.Content
          className="fixed inset-0 z-[101] flex items-center justify-center p-3 sm:p-8"
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
        >
          <Dialog.Title className="sr-only">Property photo gallery</Dialog.Title>
          <Dialog.Close
            type="button"
            className="absolute right-[calc(env(safe-area-inset-right)+1rem)] top-[calc(env(safe-area-inset-top)+1rem)] z-20 h-12 w-12 rounded-full border border-white/70 bg-black/85 text-white shadow-lg"
            aria-label="Close photo gallery"
          >
            <X className="mx-auto h-6 w-6" />
          </Dialog.Close>
          <div
            className="relative h-full w-full touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={gallery[activeIndex].url}
              alt={gallery[activeIndex].alt}
              fill
              priority
              className="object-contain"
              sizes="100vw"
            />
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  className="absolute left-[calc(env(safe-area-inset-left)+0.75rem)] top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border border-white/70 bg-black/85 text-white shadow-lg sm:left-[calc(env(safe-area-inset-left)+1rem)]"
                  onClick={() => move(-1)}
                >
                  <ChevronLeft className="mx-auto h-7 w-7" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  className="absolute right-[calc(env(safe-area-inset-right)+0.75rem)] top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border border-white/70 bg-black/85 text-white shadow-lg sm:right-[calc(env(safe-area-inset-right)+1rem)]"
                  onClick={() => move(1)}
                >
                  <ChevronRight className="mx-auto h-7 w-7" />
                </button>
              </>
            )}
            <p className="absolute bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 -translate-x-1/2 rounded-full border border-white/70 bg-black/85 px-4 py-2 text-sm text-white shadow-lg">
              {activeIndex + 1} / {gallery.length}
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
