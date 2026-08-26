"use client";

import { useEffect, useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/SectionHeader";

import familyMoving from "@/public/images/lifestyle/family-moving.jpg";
import familyReveal from "@/public/images/lifestyle/family-reveal.jpg";
import familyKeys from "@/public/images/lifestyle/family-keys.jpg";
import familyPoolFirst from "@/public/images/lifestyle/family-pool-first.jpg";
import listingHall from "@/public/images/lifestyle/listing-hall-ridgeway.jpg";
import listingKitchen from "@/public/images/lifestyle/listing-kitchen-ridgeway.jpg";
import listingLawn from "@/public/images/lifestyle/listing-lawn-hanyards.jpg";
import listingPool from "@/public/images/lifestyle/listing-pool-robinway.jpg";

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

function Frame({
  src,
  alt,
  caption,
  sizes,
  className = "",
  rounded = true,
  video,
}: {
  src: StaticImageData;
  alt: string;
  caption: string;
  sizes: string;
  className?: string;
  rounded?: boolean;
  video?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <motion.figure {...reveal} className={className}>
      <div className={`relative overflow-hidden ${rounded ? "rounded-[10px]" : ""}`}>
        {video ? (
          <video
            ref={videoRef}
            src={video}
            poster={src.src}
            muted
            loop
            playsInline
            preload="none"
            aria-label={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            sizes={sizes}
            placeholder="blur"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <figcaption className="mt-3 text-[11px] uppercase tracking-[0.18em] text-banc-grey">
        {caption}
      </figcaption>
    </motion.figure>
  );
}

export default function Lifestyle() {
  return (
    <section id="life-here" className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 pt-20 lg:pt-28">
        <SectionHeader number="01" label="Life here" title="The first day" />
        <p className="mt-6 max-w-[62ch] text-[17px] leading-relaxed text-banc-dark/70">
          The keys handed over, the door opened for the first time. The
          hallways, kitchens, gardens and pools alongside are from homes we
          are selling right now in Cuffley, Northaw and Goffs Oak.
        </p>
      </div>

      {/* Arrive — full-bleed */}
      <motion.figure {...reveal} className="mt-12 lg:mt-16">
        <div className="relative w-full overflow-hidden">
          <Image
            src={familyMoving}
            alt="A family carrying boxes up the path to their new red-brick Hertfordshire home on moving day"
            sizes="100vw"
            placeholder="blur"
            className="h-[52vh] min-h-[380px] w-full object-cover lg:h-[68vh]"
            priority={false}
          />
        </div>
        <figcaption className="mx-auto mt-3 w-full max-w-7xl px-4 sm:px-6 lg:px-10 text-[11px] uppercase tracking-[0.18em] text-banc-grey">
          Moving day
        </figcaption>
      </motion.figure>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 pb-20 lg:pb-28">
        {/* Inside — mornings */}
        <div id="life-inside" className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
          <Frame
            src={listingHall}
            alt="Checkerboard-tiled entrance hall with panelled walls and a runner staircase"
            caption="The hallway — The Ridgeway, Northaw"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          <Frame
            src={familyReveal}
            video="/videos/loop-first-look.mp4"
            alt="A couple stepping into the hallway of their new home for the first time, she gasps mid-stride"
            caption="First look"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          <Frame
            src={listingKitchen}
            alt="Bespoke kitchen with a slate-blue island and leaded windows"
            caption="The kitchen — The Ridgeway, Northaw"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="sm:col-span-2 lg:col-span-1"
          />
        </div>

        {/* Outside — afternoons */}
        <div id="life-outside" className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
          <Frame
            src={familyKeys}
            video="/videos/loop-keys.mp4"
            alt="House keys dropped mid-air into an open palm outside a red-brick home at golden hour"
            caption="The keys"
            sizes="(min-width: 640px) 50vw, 100vw"
          />
          <Frame
            src={listingLawn}
            alt="A wide striped lawn behind a detached Hertfordshire home"
            caption="The garden — Hanyards Lane, Cuffley"
            sizes="(min-width: 640px) 50vw, 100vw"
          />
        </div>

        {/* Dusk — the pool */}
        <div id="life-dusk" className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
          <Frame
            src={familyPoolFirst}
            video="/videos/loop-pool.mp4"
            alt="Two children sprinting across the lawn toward the garden pool, parents laughing behind"
            caption="The pool, for the first time"
            sizes="(min-width: 640px) 50vw, 100vw"
          />
          <Frame
            src={listingPool}
            alt="Heated outdoor pool glowing at dusk beside an architect-designed home"
            caption="The pool — Robin Way, Cuffley"
            sizes="(min-width: 640px) 50vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
