"use client";

import { useEffect, useRef, useState } from "react";
import { playWhenAllowed } from "@/lib/media-autoplay";
import { useIsPhoneViewport } from "@/hooks/useIsPhoneViewport";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  getTeamHeroVideoSource,
  isTeamHeroVideoUsable,
  shouldRenderTeamHeroVideo,
} from "@/lib/team-media";
import styles from "./TeamHeroMedia.module.css";

export function TeamHeroMedia() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const videoSrc = getTeamHeroVideoSource(useIsPhoneViewport());
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showVideo =
    shouldRenderTeamHeroVideo(prefersReducedMotion) && isTeamHeroVideoUsable(videoSrc, failedSrc);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!showVideo || !video) return;
    return playWhenAllowed({ video, gestureTarget: document });
  }, [showVideo, videoSrc]);

  return (
    <div className="absolute inset-0">
      <div
        role="img"
        aria-label="The Banc Property Group team outside the Cuffley office, recreated in clay"
        className={`${styles.fallback} absolute inset-0 bg-cover bg-center`}
      />
      {showVideo && (
        <video
          key={videoSrc}
          ref={videoRef}
          src={videoSrc}
          onError={() => setFailedSrc(videoSrc)}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
