"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Bed, Bath, Square, Sparkles, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertyCardProps {
  title: string;
  address: string;
  price: string;
  tags: string[];
  stats: { beds: number; baths: number; sqft: number; epc: string };
  images: string[];
  summary: string;
}

export default function PropertyCard({
  title,
  address,
  price,
  tags,
  stats,
  images,
  summary,
}: PropertyCardProps) {
  const [index, setIndex] = React.useState(0);
  const touchStart = React.useRef<number | null>(null);

  const next = () => setIndex((prev) => (prev + 1) % images.length);
  const prev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStart.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - event.changedTouches[0].clientX;
    if (diff > 40) next();
    if (diff < -40) prev();
    touchStart.current = null;
  };

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="group overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-sm transition-shadow hover:shadow-xl"
    >
      <div
        className="relative aspect-[4/3] w-full overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          src={images[index]}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#111827]"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={prev}
              className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold"
              aria-label="Previous image"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={next}
              className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold"
              aria-label="Next image"
            >
              Next
            </button>
          </div>
          <span className="rounded-full bg-black/60 px-3 py-1 text-xs text-white">
            {index + 1} / {images.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6">
        <div>
          <p className="text-sm text-[#6B7280]">{address}</p>
          <h3 className="text-lg font-semibold text-[#111827]">{title}</h3>
          <p className="mt-3 text-2xl font-semibold text-[#0D9488]">{price}</p>
        </div>

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
          <Button size="sm" className="flex-1">
            Arrange Viewing
          </Button>
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
  );
}
