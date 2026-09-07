"use client";

import { useEffect, useRef } from "react";
import { playWhenAllowed } from "@/lib/media-autoplay";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  TEAM_HERO_FILM_MEDIA_QUERY,
  TEAM_HERO_MEDIA,
  shouldRenderTeamHeroVideo,
} from "@/lib/team-media";
import styles from "./TeamHeroMedia.module.css";

export function TeamHeroMedia() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const showVideo = shouldRenderTeamHeroVideo(prefersReducedMotion);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!showVideo || !video) return;
    return playWhenAllowed({ video, gestureTarget: document });
  }, [showVideo]);

  return (
    <div className="absolute inset-0">
      <div
        role="img"
        aria-label="The Banc Property Group team outside the Cuffley office, recreated in clay"
        className={`${styles.frame} ${styles.fallback} absolute inset-0 bg-cover bg-center`}
      />
      {showVideo && (
        <video
          ref={videoRef}
          className={`${styles.frame} ${styles.film} absolute inset-0 h-full w-full object-cover`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source
            src={TEAM_HERO_MEDIA.landscapeVideo}
            type="video/mp4"
            media={TEAM_HERO_FILM_MEDIA_QUERY}
          />
        </video>
      )}
    </div>
  );
}
