"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// The Cut — fast 11s golden-hour hero film loop for the Aker direction.
const videos = ["/videos/hero-cut.mp4"];

interface Review {
  authorName: string;
  profilePhotoUrl?: string;
  rating: number;
  text: string;
  relativeTime: string;
  time: number;
}

// Fallback reviews if API fails
const fallbackReviews: Review[] = [
  {
    authorName: "Dawn P.",
    rating: 5,
    text: "We have just sold our house through Banc Property Group and it was such a positive experience. I cannot speak highly enough of Andrew.",
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

export default function Hero() {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [canAutoplay, setCanAutoplay] = useState(true);
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews);
  const [currentReview, setCurrentReview] = useState(0);
  const [totalReviews, setTotalReviews] = useState(51);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch real reviews from API
  useEffect(() => {
    fetch("/api/google-reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
        if (data.place?.totalRatings) {
          setTotalReviews(data.place.totalRatings);
        }
      })
      .catch(() => {
        // Keep fallback reviews on error
      });
  }, []);

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

  // Auto-rotate reviews
  useEffect(() => {
    if (reviews.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 6000); // Change review every 6 seconds
    
    return () => clearInterval(interval);
  }, [reviews.length]);

  const handleInteraction = () => {
    if (!canAutoplay) {
      startPlayback();
    }
  };

  const activeReview = reviews[currentReview];

  return (
    <section
      className="relative min-h-screen h-screen w-full overflow-hidden bg-banc-dark-deep text-white"
      onClick={handleInteraction}
    >
      {/* Video background (mechanism unchanged) */}
      <div className="absolute inset-0 h-screen w-full overflow-hidden">
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
            style={{ minHeight: "100vh", minWidth: "100vw", objectPosition: "center center" }}
            src={videos[currentVideo]}
            muted
            loop
            playsInline
            preload="auto"
            poster="/videos/hero-cut-poster.jpg"
            aria-hidden="true"
          />
        </motion.div>
        {!isLoaded && <div className="absolute inset-0 h-screen w-full bg-banc-dark-deep" />}
      </div>

      {/* Legibility scrim */}
      <div className="absolute inset-0 z-[3] bg-banc-dark-deep/45" />

      {!canAutoplay && (
        <button
          className="absolute bottom-36 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/40 px-6 py-3 text-sm text-white"
          onClick={startPlayback}
        >
          Play film
        </button>
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen h-screen w-full max-w-[1400px] flex-col justify-between px-5 pb-10 pt-24 lg:px-10 lg:pt-28">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-sm font-serif text-lg leading-relaxed text-white/90"
          >
            Banc sells and lets homes across Cuffley and Hertfordshire — accurate
            valuations, premium marketing, one team from instruction to completion.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="flex w-full max-w-sm flex-col gap-3 lg:items-end"
          >
            <div className="w-full rounded-[10px] bg-banc-dark/90 p-5">
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                Thinking of selling?
              </p>
              <p className="mt-2 font-serif text-xl font-light text-white">
                Know what your home is worth.
              </p>
              <Link
                href="/valuation"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-banc-sky px-6 py-3 text-sm font-medium text-banc-dark-deep transition-colors hover:bg-banc-sky-mid"
              >
                Request a valuation
                <span aria-hidden>&rarr;</span>
              </Link>
            </div>

            <div className="flex w-full gap-3">
              <Link
                href="/sales/properties"
                className="flex-1 rounded-full border border-white/25 px-5 py-2.5 text-center text-sm text-white transition-colors hover:border-white/60"
              >
                Sales
              </Link>
              <Link
                href="/lettings/properties"
                className="flex-1 rounded-full border border-white/25 px-5 py-2.5 text-center text-sm text-white transition-colors hover:border-white/60"
              >
                Lettings
              </Link>
            </div>

            <div className="hidden w-full rounded-[10px] bg-banc-dark/90 p-5 sm:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentReview}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="line-clamp-3 text-sm leading-relaxed text-white/85">
                    &ldquo;{activeReview.text}&rdquo;
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                      {activeReview.authorName} &middot; Google
                    </p>
                    <p className="text-[11px] tracking-[0.08em] text-white/80">
                      5.0 &#9733; ({totalReviews})
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.9, ease: "easeOut" }}
        >
          <h1 className="m-0">
            <span className="sr-only">
              Banc Property Group — estate agents in Cuffley and Hertfordshire
            </span>
            {/* Logo replaces the wordmark at the same scale (the old text was
                clamp(96px,15vw,210px) tall; the lockup is wider, so height
                maps to a slightly smaller clamp to hold the same presence). */}
            <img
              src="/banc-logo-white-clear.png"
              alt=""
              className="block w-auto"
              style={{ height: "clamp(80px, 12vw, 180px)" }}
            />
          </h1>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-white/20 pt-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">
              Cuffley &middot; Hertfordshire
            </p>
            <p className="ml-auto hidden text-[11px] uppercase tracking-[0.18em] text-white/70 sm:block">
              Valuations &middot; Sales &middot; Lettings
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
