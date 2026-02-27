"use client";

import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useState, useRef, ReactNode } from "react";
import { Heart, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  className?: string;
  swipeThreshold?: number;
  showIndicators?: boolean;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  className,
  swipeThreshold = 100,
  showIndicators = true,
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 0) {
      setDirection("right");
    } else if (info.offset.x < 0) {
      setDirection("left");
    } else {
      setDirection(null);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (offset > swipeThreshold || velocity > 500) {
      // Swiped right
      onSwipeRight?.();
    } else if (offset < -swipeThreshold || velocity < -500) {
      // Swiped left
      onSwipeLeft?.();
    }
    
    setDirection(null);
  };

  const handleTap = () => {
    onTap?.();
  };

  return (
    <div className="relative">
      {/* Background indicators */}
      {showIndicators && (
        <>
          {/* Like indicator */}
          <motion.div
            className="absolute inset-0 flex items-center justify-start pl-8 pointer-events-none z-0"
            style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
          >
            <div className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-white font-bold">
              <Heart className="h-6 w-6 fill-current" />
              <span>LIKE</span>
            </div>
          </motion.div>

          {/* Skip indicator */}
          <motion.div
            className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none z-0"
            style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
          >
            <div className="flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-white font-bold">
              <X className="h-6 w-6" />
              <span>SKIP</span>
            </div>
          </motion.div>
        </>
      )}

      {/* Card */}
      <motion.div
        ref={cardRef}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        style={{ x, rotate, opacity }}
        whileTap={{ cursor: "grabbing" }}
        className={cn(
          "relative z-10 cursor-grab active:cursor-grabbing",
          "touch-pan-y", // Allow vertical scroll, capture horizontal
          className
        )}
      >
        {children}
        
        {/* Swipe hint */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8 pointer-events-none">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <X className="h-4 w-4" />
            <span>Skip</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Heart className="h-4 w-4" />
            <span>Save</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Property card specifically for swipeable interface
interface SwipeablePropertyCardProps {
  image: string;
  title: string;
  price: string;
  location: string;
  beds?: number;
  baths?: number;
  sqft?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  isActive?: boolean;
}

export function SwipeablePropertyCard({
  image,
  title,
  price,
  location,
  beds,
  baths,
  sqft,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  isActive = true,
}: SwipeablePropertyCardProps) {
  if (!isActive) {
    return (
      <div className="absolute inset-0 scale-95 opacity-50">
        <div className="h-full w-full rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <SwipeableCard
      onSwipeLeft={onSwipeLeft}
      onSwipeRight={onSwipeRight}
      onTap={onTap}
      className="h-[70vh] w-full"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-card shadow-xl">
        {/* Image */}
        <div className="relative h-3/5">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Price badge */}
          <div className="absolute bottom-4 left-4">
            <span className="rounded-full bg-primary px-4 py-1.5 text-lg font-bold text-primary-foreground">
              {price}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-xl font-semibold line-clamp-2">{title}</h3>
          <p className="mt-1 text-muted-foreground">{location}</p>

          {/* Features */}
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            {beds && (
              <div className="flex items-center gap-1">
                <span>{beds} bed</span>
              </div>
            )}
            {baths && (
              <div className="flex items-center gap-1">
                <span>{baths} bath</span>
              </div>
            )}
            {sqft && (
              <div className="flex items-center gap-1">
                <span>{sqft}</span>
              </div>
            )}
          </div>

          {/* View details hint */}
          <div className="mt-4 flex items-center justify-center gap-1 text-sm text-primary">
            <span>Tap for details</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </SwipeableCard>
  );
}
