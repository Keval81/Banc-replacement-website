"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Review {
  authorName: string;
  profilePhotoUrl?: string;
  rating: number;
  text: string;
  relativeTime: string;
  time: number;
}

interface PlaceData {
  name?: string;
  rating?: number;
  totalRatings?: number;
}

const fallbackReviews: Review[] = [
  {
    authorName: "Dawn P.",
    rating: 5,
    text: "We have just sold our house through Banc Property Group and it was such a positive experience. I cannot speak highly enough of Andrew who couldn't have been more helpful.",
    relativeTime: "2 months ago",
    time: Date.now() - 5184000000,
  },
  {
    authorName: "Iwona K.",
    rating: 5,
    text: "Andrew, Nitesh and Vicky sold my house quickly and efficiently. Very professional friendly team supported me through the process.",
    relativeTime: "3 months ago",
    time: Date.now() - 7776000000,
  },
  {
    authorName: "James M.",
    rating: 5,
    text: "The entire team were extremely helpful finding a rental property. The process was made extremely smooth and I would definitely recommend them.",
    relativeTime: "1 month ago",
    time: Date.now() - 2592000000,
  },
];

export default function GoogleReviews() {
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews);
  const [place, setPlace] = useState<PlaceData>({ 
    name: "Banc Property Group", 
    rating: 5.0, 
    totalRatings: 51 
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch reviews from API
  useEffect(() => {
    fetch("/api/google-reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
          setPlace(data.place || {});
        }
      })
      .catch(() => {
        // Keep fallback reviews on error
      });
  }, []);

  // Auto-play carousel
  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 4000); // Change every 4 seconds
  }, [reviews.length]);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isPaused && reviews.length > 1) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    
    return () => stopAutoPlay();
  }, [isPaused, reviews.length, startAutoPlay, stopAutoPlay]);

  const goToReview = useCallback((index: number) => {
    setActiveIndex(index);
    // Reset timer when manually navigating
    if (!isPaused) {
      startAutoPlay();
    }
  }, [isPaused, startAutoPlay]);

  const nextReview = useCallback(() => {
    goToReview((activeIndex + 1) % reviews.length);
  }, [activeIndex, reviews.length, goToReview]);

  const prevReview = useCallback(() => {
    goToReview((activeIndex - 1 + reviews.length) % reviews.length);
  }, [activeIndex, reviews.length, goToReview]);

  const activeReview = reviews[activeIndex];

  return (
    <section 
      className="bg-banc-grey-pale py-12 lg:py-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-10">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 lg:mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-banc-grey lg:text-sm lg:tracking-[0.3em]">
              Google Reviews
            </p>
            <h2 className="mt-2 text-xl font-semibold text-banc-dark lg:text-4xl">
              What clients say
            </h2>
            {place?.rating && (
              <p className="mt-1 text-sm text-banc-grey lg:mt-2">
                {place.name} • {place.rating.toFixed(1)} stars ({place.totalRatings || 51} reviews)
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm lg:gap-3 lg:px-4">
            <svg className="h-4 w-auto lg:h-5" viewBox="0 0 272 92" fill="none">
              <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335"/>
              <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05"/>
              <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4"/>
              <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853"/>
              <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335"/>
              <path d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z" fill="#4285F4"/>
            </svg>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-banc-grey lg:tracking-[0.2em]">
              Verified
            </span>
          </div>
        </div>

        {/* Review Card */}
        <div className="relative rounded-2xl bg-white p-5 shadow-sm lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex flex-col gap-3 lg:gap-4"
            >
              {/* Reviewer Info */}
              <div className="flex items-center gap-3 lg:gap-4">
                {activeReview.profilePhotoUrl ? (
                  <Image
                    src={activeReview.profilePhotoUrl}
                    alt={activeReview.authorName}
                    width={48}
                    height={48}
                    className="h-11 w-11 rounded-full object-cover lg:h-12 lg:w-12"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-banc-sky-light text-base font-semibold text-banc-sky-dark lg:h-12 lg:w-12 lg:text-lg">
                    {activeReview.authorName?.[0] ?? "B"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-banc-dark lg:text-base">
                    {activeReview.authorName}
                  </p>
                  <p className="text-xs text-banc-grey lg:text-sm">{activeReview.relativeTime}</p>
                </div>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-2">
                <div className="flex text-banc-sky">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 lg:h-5 lg:w-5 ${
                        i < activeReview.rating ? "fill-banc-sky" : "fill-banc-grey/20"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-banc-sky-dark">
                  {activeReview.rating}.0
                </span>
              </div>

              {/* Review Text */}
              <p className="text-sm leading-relaxed text-banc-dark-mid lg:text-base">
                &ldquo;{activeReview.text}&rdquo;
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-5 flex items-center justify-between lg:mt-6">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {reviews.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToReview(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeIndex
                      ? "w-6 bg-banc-sky"
                      : "w-2.5 bg-[#E0DFDC] hover:bg-[#CBD5E1]"
                  }`}
                  aria-label={`Show review ${index + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevReview}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-banc-grey/20 bg-white text-banc-grey shadow-sm transition-colors hover:border-banc-sky hover:text-banc-sky"
                aria-label="Previous review"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextReview}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-banc-grey/20 bg-white text-banc-grey shadow-sm transition-colors hover:border-banc-sky hover:text-banc-sky"
                aria-label="Next review"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Auto-play indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-banc-grey-pale rounded-b-2xl overflow-hidden">
            <motion.div
              className="h-full bg-banc-sky"
              initial={{ width: "0%" }}
              animate={{ width: isPaused ? "0%" : "100%" }}
              transition={{ duration: 4, ease: "linear", repeat: isPaused ? 0 : Infinity }}
              key={activeIndex} // Reset animation when review changes
            />
          </div>
        </div>
      </div>
    </section>
  );
}
