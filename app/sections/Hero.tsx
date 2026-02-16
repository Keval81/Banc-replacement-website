"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

// Videos in reverse order: 3, 2, 1
const videos = [
  "/videos/hero3.m4v",
  "/videos/hero2.m4v",
  "/videos/hero1.m4v",
];

interface Review {
  authorName: string;
  profilePhotoUrl?: string;
  rating: number;
  text: string;
  relativeTime: string;
}

interface PlaceData {
  name?: string;
  rating?: number;
  totalRatings?: number;
}

export default function Hero() {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [canAutoplay, setCanAutoplay] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Google Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [place, setPlace] = useState<PlaceData>({});
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Fetch Google Reviews
  useEffect(() => {
    fetch("/api/google-reviews")
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setPlace(data.place || {});
      })
      .catch(() => {
        // Silent fail - keep static fallback
      });
  }, []);

  // Rotate through reviews
  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const currentReview = reviews[currentReviewIndex];

  // Start video playback
  const startPlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.muted = true;
      video.playbackRate = 0.60;
      await video.play();
      setCanAutoplay(true);
    } catch (err) {
      setCanAutoplay(false);
    }
  }, []);

  // Handle video end - advance to next
  const handleVideoEnd = useCallback(() => {
    setIsLoaded(false);
    setCurrentVideo((prev) => (prev + 1) % videos.length);
  }, []);

  // Handle video ready
  const handleCanPlay = useCallback(() => {
    setIsLoaded(true);
    startPlayback();
  }, [startPlayback]);

  // Setup video listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleVideoEnd);
    
    // Important: load the video
    video.load();
    
    // Start playback attempt
    startPlayback();

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleVideoEnd);
    };
  }, [currentVideo, handleCanPlay, handleVideoEnd, startPlayback]);

  const handleDotClick = (index: number) => {
    if (index !== currentVideo) {
      setIsLoaded(false);
      setCurrentVideo(index);
    }
  };

  const handleInteraction = () => {
    if (!canAutoplay) {
      startPlayback();
    }
  };

  return (
    <section 
      className="relative min-h-[90vh] w-full overflow-hidden bg-[#2C2F33] text-white"
      onClick={handleInteraction}
    >
      {/* Video Background - Single video element, no complex transitions */}
      <div className="absolute inset-0 h-full w-full">
        <motion.div
          key={currentVideo}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full"
        >
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full"
            style={{ 
              objectFit: "cover",
              objectPosition: "center center",
            }}
            src={videos[currentVideo]}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
        </motion.div>

        {/* Fallback while loading */}
        {!isLoaded && (
          <div className="absolute inset-0 h-full w-full bg-[#2C2F33]">
            <div 
              className="absolute inset-0 h-full w-full opacity-50"
              style={{
                backgroundImage: "url('/map-area.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(20px) brightness(0.4)",
              }}
            />
          </div>
        )}
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-[3] bg-gradient-to-b from-[#2C2F33]/70 via-[#2C2F33]/40 to-[#2C2F33]/80" />

      {/* Autoplay blocked notice */}
      {!canAutoplay && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-40 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#4BC5C5] px-6 py-3 text-sm font-semibold text-[#2C2F33] shadow-lg hover:bg-[#6EE0E0]"
          onClick={startPlayback}
        >
          Click to play video
        </motion.button>
      )}

      {/* Video indicator dots */}
      <div className="absolute bottom-32 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              handleDotClick(index);
            }}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              index === currentVideo
                ? "w-8 bg-[#4BC5C5]"
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Play video ${index + 1}`}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-24 pt-36 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[#6EE0E0] font-heading">
            Banc Property Group
          </p>
          <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Exceptional Properties.<br />
            <span className="text-[#6EE0E0]">Exceptional Service.</span>
          </h1>
          <p className="mt-5 text-lg text-white/80 sm:text-xl">
            Your local Cuffley &amp; Mayfair estate agent
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Button size="lg">Request a Valuation</Button>
            <Link
              href="#featured"
              className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80 transition-colors hover:text-[#6EE0E0] font-heading"
            >
              View Properties
            </Link>
          </div>
        </motion.div>

        {/* Spacer to push tile to bottom */}
        <div className="flex-1 min-h-[20vh]" />

        {/* Google Reviews Tile - Now with REAL data - Bottom position, compact */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full max-w-5xl mx-auto flex flex-col gap-1 rounded-xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur mb-4"
        >
          {currentReview ? (
            <>
              {/* Reviewer info + stars in one row */}
              <div className="flex items-center gap-2">
                {currentReview.profilePhotoUrl ? (
                  <Image
                    src={currentReview.profilePhotoUrl}
                    alt={currentReview.authorName}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4BC5C5] shrink-0">
                    <span className="text-xs font-semibold text-[#2C2F33]">
                      {currentReview.authorName?.[0] || "G"}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-xs font-semibold font-heading truncate">{currentReview.authorName}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="flex text-[#4BC5C5]">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Review text - single line */}
              <p className="text-xs text-white/90 line-clamp-1">
                "{currentReview.text}"
              </p>
              
              {/* Footer with Google logo + rating */}
              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  {/* Google Logo - Colored */}
                  <svg className="h-3 w-auto" viewBox="0 0 272 92" fill="none">
                    <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335"/>
                    <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05"/>
                    <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4"/>
                    <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853"/>
                    <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335"/>
                    <path d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z" fill="#4285F4"/>
                  </svg>
                  <span className="text-[10px] text-white/70">Review</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Review dots indicator - inline */}
                  {reviews.length > 1 && (
                    <div className="flex items-center gap-0.5">
                      {reviews.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentReviewIndex(index);
                          }}
                          className={`h-0.5 rounded-full transition-all ${
                            index === currentReviewIndex 
                              ? "w-2 bg-[#4BC5C5]" 
                              : "w-0.5 bg-white/40 hover:bg-white/60"
                          }`}
                          aria-label={`Show review ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-white/70">
                    {place.rating?.toFixed(1) || "5.0"} ★
                  </p>
                </div>
              </div>
            </>
          ) : (
            // Fallback static content while loading
            <>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90">
                  <svg viewBox="0 0 40 40" className="h-4 w-4">
                    <circle cx="20" cy="20" r="18" fill="#4BC5C5"/>
                    <text x="20" y="26" textAnchor="middle" fill="#2C2F33" fontFamily="serif" fontWeight="700" fontSize="14">G</text>
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold font-heading">Google Reviews</p>
                </div>
                <div className="flex text-[#4BC5C5] ml-auto">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-xs text-white/70">5.0 ★ (51 reviews)</p>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
