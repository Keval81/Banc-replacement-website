"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Videos in reverse order: 3, 2, 1
const videos = [
  "/videos/hero3.m4v",
  "/videos/hero2.m4v",
  "/videos/hero1.m4v",
];

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
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[#6EE0E0] font-[family-name:var(--font-montserrat)]">
            Banc Property Group
          </p>
          <h1 className="font-[family-name:var(--font-montserrat)] text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
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
              className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80 transition-colors hover:text-[#6EE0E0] font-[family-name:var(--font-montserrat)]"
            >
              View Properties
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-8 flex flex-wrap items-center gap-6 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 backdrop-blur"
        >
          {/* Guild Property Network Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
              <svg viewBox="0 0 40 40" className="h-8 w-8">
                <circle cx="20" cy="20" r="18" fill="#4BC5C5"/>
                <text x="20" y="26" textAnchor="middle" fill="#2C2F33" fontFamily="serif" fontWeight="700" fontSize="16">G</text>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold font-[family-name:var(--font-montserrat)]">Guild Property Network</p>
              <p className="text-xs text-white/70">Trusted Partner</p>
            </div>
          </div>
          <div className="h-8 w-px bg-white/30" />
          <div className="flex items-center gap-2">
            <div className="flex text-[#4BC5C5]">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold font-[family-name:var(--font-montserrat)]">4.9 / 5.0</p>
              <p className="text-xs text-white/70">Based on 312 reviews</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
