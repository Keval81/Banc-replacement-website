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

// Google Review data for hero tile
const heroReview = {
  authorName: "Dawn P.",
  text: "We have just sold our house through Banc Property Group and it was such a positive experience...",
  rating: 5,
  totalReviews: 51,
};

export default function Hero() {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [canAutoplay, setCanAutoplay] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

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
    video.load();
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
      className="relative min-h-[85vh] lg:min-h-[90vh] w-full overflow-hidden bg-[#2C2F33] text-white"
      onClick={handleInteraction}
    >
      {/* Video Background */}
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
            className="absolute inset-0 h-full w-full object-cover"
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
          className="absolute bottom-32 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#1DBFDD] px-6 py-3 text-sm font-semibold text-[#0A6B82] shadow-lg hover:bg-[#4DD4F0]"
          onClick={startPlayback}
        >
          Click to play video
        </motion.button>
      )}

      {/* Video indicator dots */}
      <div className="absolute bottom-28 left-1/2 z-20 flex -translate-x-1/2 gap-2 lg:bottom-24">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              handleDotClick(index);
            }}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              index === currentVideo
                ? "w-8 bg-[#1DBFDD]"
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Play video ${index + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[85vh] w-full max-w-7xl flex-col justify-between px-4 py-20 lg:min-h-[90vh] lg:px-10 lg:py-24">
        {/* Top Content */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl xl:text-6xl">
            Exceptional Properties.<br />
            <span className="text-[#4DD4F0]">Exceptional Service.</span>
          </h1>
          <p className="mt-4 text-base text-white/90 sm:text-lg lg:text-xl drop-shadow-md">
            Your local Cuffley &amp; Mayfair estate agent
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button 
              size="lg"
              className="bg-[#1DBFDD] text-white hover:bg-[#0E8CAB] text-base lg:text-lg px-6 lg:px-8"
            >
              Request a Valuation
            </Button>
            <Link
              href="#featured"
              className="text-sm font-semibold uppercase tracking-[0.15em] text-white/90 transition-colors hover:text-[#4DD4F0] font-heading drop-shadow-md"
            >
              View Properties
            </Link>
          </div>
        </motion.div>

        {/* Google Reviews Tile - Bottom Left */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-8 w-full max-w-sm self-start rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm lg:p-5"
        >
          {/* Reviewer info */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1DBFDD] lg:h-11 lg:w-11">
              <span className="text-sm font-semibold text-white">
                {heroReview.authorName[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{heroReview.authorName}</p>
              <p className="text-xs text-white/70">Google Review</p>
            </div>
            {/* Stars */}
            <div className="flex items-center gap-1">
              <div className="flex text-[#1DBFDD]">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-3 w-3 fill-current lg:h-4 lg:w-4" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                ))}
              </div>
            </div>
          </div>
          
          {/* Review text */}
          <p className="mt-3 text-sm text-white/90 line-clamp-2 leading-relaxed lg:line-clamp-3">
            &ldquo;{heroReview.text}&rdquo;
          </p>
          
          {/* Footer with Google logo + rating */}
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            {/* Google Logo */}
            <svg className="h-4 w-auto lg:h-5" viewBox="0 0 272 92" fill="none">
              <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335"/>
              <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05"/>
              <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4"/>
              <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853"/>
              <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335"/>
              <path d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z" fill="#4285F4"/>
            </svg>
            <p className="text-xs text-white/80">
              5.0 ★ ({heroReview.totalReviews} reviews)
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
