"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { PropertyJourneySelector } from "@/components/PropertyJourneySelector";
import { getLandingUi } from "@/lib/landing-ui";
import { startHeroVideoLifecycle } from "@/lib/hero-video-lifecycle";

const landingUi = getLandingUi("aker");

// The Cut — fast 11s golden-hour hero film loop for the Aker direction.
const videos = [landingUi.heroVideo.desktop.src];

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
    } catch {
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

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleVideoEnd);
    };
  }, [currentVideo, handleCanPlay, handleVideoEnd]);

  useEffect(() => {
    return startHeroVideoLifecycle({
      documentTarget: document,
      windowTarget: window,
      getVisibilityState: () => document.visibilityState,
      pause: () => videoRef.current?.pause(),
      resume: () => {
        void startPlayback();
      },
    });
  }, [startPlayback]);

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
            muted
            loop
            playsInline
            preload="auto"
            poster="/videos/hero-cut-poster.jpg"
            aria-hidden="true"
          >
            <source media="(max-width: 640px)" src={landingUi.heroVideo.mobile.src} />
            <source src={videos[currentVideo]} />
          </video>
        </motion.div>
        {!isLoaded && <div className="absolute inset-0 h-screen w-full bg-banc-dark-deep" />}
      </div>

      {/* Legibility scrim */}
      <div className="absolute inset-0 z-[3] bg-banc-dark-deep/45" />

      {!canAutoplay && (
        <button
          className="absolute bottom-36 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/40 px-6 py-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 focus-visible:ring-offset-banc-dark-deep"
          onClick={startPlayback}
        >
          Play film
        </button>
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen h-screen w-full max-w-[1400px] flex-col justify-between px-5 pb-12 pt-20 lg:px-10 lg:pb-12 lg:pt-28">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="hidden w-full max-w-sm flex-col gap-3 sm:flex lg:items-end"
          >
            <PropertyJourneySelector className="hidden w-full sm:grid" />

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
                      {activeReview.authorName} &middot; 5.0 &#9733; ({totalReviews})
                    </p>
                    <span
                      className="flex items-center"
                      style={{ background: landingUi.reviewLogoSurface }}
                    >
                      <svg className="h-4 w-auto" viewBox="0 0 272 92" fill="none" aria-label="Google">
                        <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335"/>
                        <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05"/>
                        <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4"/>
                        <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853"/>
                        <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335"/>
                        <path d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z" fill="#4285F4"/>
                      </svg>
                    </span>
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
          className="space-y-5 pb-40 sm:space-y-0 sm:pb-0"
        >
          <h1 className="m-0">
            <span className="sr-only">
              Banc Property Group — estate agents in Cuffley and Hertfordshire
            </span>
            {/* Logo replaces the wordmark at the same scale (the old text was
                clamp(96px,15vw,210px) tall; the lockup is wider, so height
                maps to a slightly smaller clamp to hold the same presence).
                In brand blue over the film, with a drop shadow so it holds
                against the brightest frames. */}
            <Image
              src="/banc-logo-blue.png"
              alt=""
              width={800}
              height={190}
              priority
              className="block h-auto drop-shadow-[0_2px_14px_rgba(0,0,0,0.65)]"
              style={{ width: "min(72vw, 560px)" }}
            />
          </h1>
          {/* Tagline in the site's label voice — hairline + tracked uppercase,
              the same pairing SectionHeader uses to open every section. It
              settles into its final tracking once the lockup has landed;
              MotionConfig honours prefers-reduced-motion. */}
          <div className="mt-4 flex items-center gap-3 sm:mt-5 sm:gap-4">
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="hidden h-px w-14 flex-none origin-left bg-white/45 sm:block"
            />
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.04em" }}
              animate={{ opacity: 1, letterSpacing: "0.18em" }}
              transition={{ delay: 0.9, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-[9px] font-medium uppercase text-white/80 [text-shadow:0_1px_6px_rgba(0,0,0,0.85)] sm:text-[11px]"
            >
              Local independent property specialists
            </motion.p>
          </div>

          <PropertyJourneySelector
            data-placement={landingUi.mobileHeroActionPlacement}
            className="mx-auto w-full max-w-md sm:hidden"
          />
        </motion.div>
      </div>
    </section>
  );
}
