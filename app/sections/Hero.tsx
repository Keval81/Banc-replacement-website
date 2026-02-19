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
      className="relative min-h-[70vh] lg:min-h-[90vh] w-full overflow-hidden bg-[#2C2F33] text-white flex items-center"
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
          className="absolute bottom-28 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#1DBFDD] px-6 py-3 text-sm font-semibold text-[#0A6B82] shadow-lg hover:bg-[#4DD4F0]"
          onClick={startPlayback}
        >
          Click to play video
        </motion.button>
      )}

      {/* Video indicator dots */}
      <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 gap-2">
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
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 lg:px-10 lg:py-24">
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
      </div>
    </section>
  );
}
